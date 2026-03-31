import { Router } from 'express';
import { FinanceService } from './finance.service';
import { authenticate, AuthRequest } from '../../core/middleware/auth';
import { validate } from '../../core/middleware/validate';
import { createAccountSchema, createJournalEntrySchema, createInvoiceSchema, createExpenseSchema, recordPaymentSchema } from './finance.validator';
import { sendSuccess, sendPaginated, sendError } from '../../core/utils/response';
import { parsePagination, parseSort } from '../../core/utils/pagination';

const router = Router();
const financeService = new FinanceService();

router.use(authenticate);

// ── Chart of Accounts ──
router.get('/accounts', async (req: AuthRequest, res, next) => {
  try {
    const accounts = await financeService.getAccounts(req.query as Record<string, string>);
    sendSuccess(res, accounts);
  } catch (error) { next(error); }
});

router.post('/accounts', validate(createAccountSchema), async (req: AuthRequest, res, next) => {
  try {
    const account = await financeService.createAccount(req.body);
    sendSuccess(res, account, 'Account created', 201);
  } catch (error) { next(error); }
});

router.put('/accounts/:id', async (req: AuthRequest, res, next) => {
  try {
    const account = await financeService.updateAccount(req.params.id, req.body);
    sendSuccess(res, account, 'Account updated');
  } catch (error) { next(error); }
});

// ── Journal Entries ──
router.get('/journal-entries', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const orderBy = parseSort(req.query as Record<string, string>, ['date', 'entryNumber', 'createdAt']);
    const { data, total } = await financeService.getJournalEntries(skip, limit, orderBy, req.query as Record<string, string>);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.post('/journal-entries', validate(createJournalEntrySchema), async (req: AuthRequest, res, next) => {
  try {
    const entry = await financeService.createJournalEntry(req.body, req.userId!);
    sendSuccess(res, entry, 'Journal entry created', 201);
  } catch (error) { next(error); }
});

router.post('/journal-entries/:id/post', async (req: AuthRequest, res, next) => {
  try {
    const entry = await financeService.postJournalEntry(req.params.id);
    sendSuccess(res, entry, 'Journal entry posted');
  } catch (error) { next(error); }
});

// ── Invoices ──
router.get('/invoices', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { data, total } = await financeService.getInvoices(skip, limit, req.query as Record<string, string>);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.get('/invoices/:id', async (req: AuthRequest, res, next) => {
  try {
    const invoice = await financeService.getInvoiceById(req.params.id);
    if (!invoice) { sendError(res, 'Invoice not found', 404); return; }
    sendSuccess(res, invoice);
  } catch (error) { next(error); }
});

router.post('/invoices', validate(createInvoiceSchema), async (req: AuthRequest, res, next) => {
  try {
    const invoice = await financeService.createInvoice(req.body);
    sendSuccess(res, invoice, 'Invoice created', 201);
  } catch (error) { next(error); }
});

router.post('/invoices/:id/pay', validate(recordPaymentSchema), async (req: AuthRequest, res, next) => {
  try {
    const result = await financeService.recordPayment(req.params.id, req.body, req.userId!);
    sendSuccess(res, result, 'Payment recorded');
  } catch (error) { next(error); }
});

// ── Expenses ──
router.get('/expenses', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, string>);
    const { data, total } = await financeService.getExpenses(skip, limit, req.query as Record<string, string>);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.post('/expenses', validate(createExpenseSchema), async (req: AuthRequest, res, next) => {
  try {
    const expense = await financeService.createExpense(req.body, req.userId!);
    sendSuccess(res, expense, 'Expense created', 201);
  } catch (error) { next(error); }
});

// ── Reports ──
router.get('/reports/profit-loss', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const report = await financeService.getProfitAndLoss(startDate, endDate);
    sendSuccess(res, report);
  } catch (error) { next(error); }
});

router.get('/reports/balance-sheet', async (req: AuthRequest, res, next) => {
  try {
    const report = await financeService.getBalanceSheet();
    sendSuccess(res, report);
  } catch (error) { next(error); }
});

router.get('/reports/cash-flow', async (req: AuthRequest, res, next) => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    const report = await financeService.getCashFlow(startDate, endDate);
    sendSuccess(res, report);
  } catch (error) { next(error); }
});

// ── Dashboard Summary ──
router.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const summary = await financeService.getFinanceSummary();
    sendSuccess(res, summary);
  } catch (error) { next(error); }
});

export { router as financeRoutes };
