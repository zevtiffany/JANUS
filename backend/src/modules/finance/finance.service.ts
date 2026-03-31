import { prisma } from '../../config/database';
import { eventBus } from '../../core/events/eventBus';
import { AppError } from '../../core/middleware/errorHandler';
import { Prisma } from '@prisma/client';

export class FinanceService {
  // ── Chart of Accounts ──
  async getAccounts(filters: Record<string, string>) {
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.isActive) where.isActive = filters.isActive === 'true';

    return prisma.account.findMany({
      where,
      include: { children: true },
      orderBy: { code: 'asc' },
    });
  }

  async createAccount(data: any) {
    return prisma.account.create({ data });
  }

  async updateAccount(id: string, data: any) {
    return prisma.account.update({ where: { id }, data });
  }

  // ── Journal Entries ──
  async getJournalEntries(skip: number, limit: number, orderBy: any, filters: Record<string, string>) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          lines: { include: { account: { select: { code: true, name: true, type: true } } } },
          createdBy: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.journalEntry.count({ where }),
    ]);

    return { data, total };
  }

  async createJournalEntry(data: any, userId: string) {
    // Validate double-entry: total debits must equal total credits
    const totalDebit = data.lines.reduce((sum: number, l: any) => sum + (l.debit || 0), 0);
    const totalCredit = data.lines.reduce((sum: number, l: any) => sum + (l.credit || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new AppError('Total debits must equal total credits', 400);
    }

    const count = await prisma.journalEntry.count();
    const entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;

    return prisma.journalEntry.create({
      data: {
        entryNumber,
        date: data.date,
        reference: data.reference,
        description: data.description,
        createdById: userId,
        lines: {
          create: data.lines.map((line: any) => ({
            accountId: line.accountId,
            debit: line.debit || 0,
            credit: line.credit || 0,
            description: line.description,
          })),
        },
      },
      include: {
        lines: { include: { account: true } },
      },
    });
  }

  async postJournalEntry(id: string) {
    const entry = await prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) throw new AppError('Journal entry not found', 404);
    if (entry.status !== 'DRAFT') throw new AppError('Only draft entries can be posted', 400);

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: { status: 'POSTED' },
      include: { lines: { include: { account: true } } },
    });

    await eventBus.emit('finance:journal.posted', { journalEntryId: id });

    return updated;
  }

  // ── Invoices ──
  async getInvoices(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } },
          vendor: { select: { name: true } },
          lines: true,
          _count: { select: { payments: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return { data, total };
  }

  async getInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        vendor: true,
        lines: { include: { product: { select: { name: true, sku: true } } } },
        payments: true,
      },
    });
  }

  async createInvoice(data: any) {
    const count = await prisma.invoice.count();
    const prefix = data.type === 'SALES' ? 'INV' : 'BILL';
    const number = `${prefix}-${String(count + 1).padStart(6, '0')}`;

    const lines = data.lines.map((line: any) => ({
      ...line,
      total: line.quantity * line.unitPrice,
    }));

    const subtotal = lines.reduce((sum: number, l: any) => sum + l.total, 0);
    const total = subtotal + (data.tax || 0);

    return prisma.invoice.create({
      data: {
        number,
        type: data.type,
        customerId: data.customerId,
        vendorId: data.vendorId,
        dueDate: data.dueDate,
        subtotal,
        tax: data.tax || 0,
        total,
        notes: data.notes,
        lines: { create: lines },
      },
      include: { lines: true },
    });
  }

  async recordPayment(invoiceId: string, paymentData: any, userId: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new AppError('Invoice not found', 404);

    const remaining = Number(invoice.total) - Number(invoice.paidAmount);
    if (paymentData.amount > remaining) {
      throw new AppError(`Payment exceeds remaining balance of ${remaining}`, 400);
    }

    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        date: paymentData.date || new Date(),
      },
    });

    const newPaidAmount = Number(invoice.paidAmount) + paymentData.amount;
    const newStatus = newPaidAmount >= Number(invoice.total) ? 'PAID' : 'PARTIAL';

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaidAmount, status: newStatus },
    });

    if (newStatus === 'PAID') {
      await eventBus.emit('finance:invoice.paid', {
        invoiceId,
        invoiceNumber: invoice.number,
        userId,
      });
    }

    return payment;
  }

  // ── Expenses ──
  async getExpenses(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          createdBy: { select: { firstName: true, lastName: true } },
          employee: { select: { employeeCode: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return { data, total };
  }

  async createExpense(data: any, userId: string) {
    return prisma.expense.create({
      data: {
        ...data,
        date: data.date || new Date(),
        createdById: userId,
      },
    });
  }

  // ── Reports ──
  async getProfitAndLoss(startDate?: string, endDate?: string) {
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    const revenueAccounts = await prisma.account.findMany({
      where: { type: 'REVENUE', isActive: true },
      select: { id: true, code: true, name: true, balance: true },
    });

    const expenseAccounts = await prisma.account.findMany({
      where: { type: 'EXPENSE', isActive: true },
      select: { id: true, code: true, name: true, balance: true },
    });

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + Number(a.balance), 0);

    return {
      revenue: { accounts: revenueAccounts, total: totalRevenue },
      expenses: { accounts: expenseAccounts, total: totalExpenses },
      netIncome: totalRevenue - totalExpenses,
    };
  }

  async getBalanceSheet() {
    const assets = await prisma.account.findMany({
      where: { type: 'ASSET', isActive: true },
      select: { id: true, code: true, name: true, balance: true },
    });

    const liabilities = await prisma.account.findMany({
      where: { type: 'LIABILITY', isActive: true },
      select: { id: true, code: true, name: true, balance: true },
    });

    const equity = await prisma.account.findMany({
      where: { type: 'EQUITY', isActive: true },
      select: { id: true, code: true, name: true, balance: true },
    });

    const totalAssets = assets.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + Number(a.balance), 0);
    const totalEquity = equity.reduce((sum, a) => sum + Number(a.balance), 0);

    return {
      assets: { accounts: assets, total: totalAssets },
      liabilities: { accounts: liabilities, total: totalLiabilities },
      equity: { accounts: equity, total: totalEquity },
      balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
    };
  }

  async getCashFlow(startDate?: string, endDate?: string) {
    const payments = await prisma.payment.findMany({
      where: startDate && endDate ? {
        date: { gte: new Date(startDate), lte: new Date(endDate) },
      } : undefined,
      include: { invoice: { select: { type: true, number: true } } },
      orderBy: { date: 'desc' },
    });

    let inflow = 0;
    let outflow = 0;

    for (const payment of payments) {
      const amount = Number(payment.amount);
      if (payment.invoice.type === 'SALES') inflow += amount;
      else outflow += amount;
    }

    return { inflow, outflow, net: inflow - outflow, payments };
  }

  // ── Dashboard Summary ──
  async getFinanceSummary() {
    const [totalRevenue, totalExpenses, pendingInvoices, overdueInvoices, recentTransactions] = await Promise.all([
      prisma.account.aggregate({ where: { type: 'REVENUE' }, _sum: { balance: true } }),
      prisma.account.aggregate({ where: { type: 'EXPENSE' }, _sum: { balance: true } }),
      prisma.invoice.count({ where: { status: { in: ['SENT', 'PARTIAL'] } } }),
      prisma.invoice.count({ where: { status: { not: 'PAID' }, dueDate: { lt: new Date() } } }),
      prisma.journalEntry.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { createdBy: { select: { firstName: true, lastName: true } } } }),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.balance || 0),
      totalExpenses: Number(totalExpenses._sum.balance || 0),
      profit: Number(totalRevenue._sum.balance || 0) - Number(totalExpenses._sum.balance || 0),
      pendingInvoices,
      overdueInvoices,
      recentTransactions,
    };
  }
}
