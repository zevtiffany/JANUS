import { eventBus } from '../eventBus';
import { prisma } from '../../../config/database';
import { ruleEngine } from '../../rules/ruleEngine';
import { logger } from '../../utils/logger';

export function registerEventHandlers(): void {
  // ── Finance Events ──
  eventBus.on('finance:journal.posted', async (data) => {
    logger.info('Updating account balances for posted journal entry');
    const entry = await prisma.journalEntry.findUnique({
      where: { id: data.journalEntryId },
      include: { lines: { include: { account: true } } },
    });
    if (!entry) return;

    for (const line of entry.lines) {
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      let balanceChange = 0;

      if (['ASSET', 'EXPENSE'].includes(line.account.type)) {
        balanceChange = debit - credit;
      } else {
        balanceChange = credit - debit;
      }

      await prisma.account.update({
        where: { id: line.accountId },
        data: { balance: { increment: balanceChange } },
      });
    }
  });

  eventBus.on('finance:invoice.paid', async (data) => {
    logger.info(`Invoice ${data.invoiceId} marked as paid`);
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: 'INVOICE_PAID',
        title: 'Invoice Paid',
        message: `Invoice ${data.invoiceNumber} has been fully paid`,
        module: 'finance',
        entityId: data.invoiceId,
      },
    });
  });

  // ── Inventory Events ──
  eventBus.on('inventory:stock.changed', async (data) => {
    logger.info(`Stock changed for product ${data.productId}`);
    await ruleEngine.evaluate('inventory', data);
  });

  eventBus.on('inventory:order.confirmed', async (data) => {
    logger.info(`Order ${data.orderId} confirmed`);
  });

  // ── Project Events ──
  eventBus.on('projects:task.statusChanged', async (data) => {
    logger.info(`Task ${data.taskId} status changed to ${data.newStatus}`);
    if (data.newStatus === 'COMPLETED') {
      const task = await prisma.task.findUnique({
        where: { id: data.taskId },
        include: { project: true },
      });
      if (task) {
        await prisma.project.update({
          where: { id: task.projectId },
          data: { spent: { increment: Number(task.actualHours) * 50 } },
        });
      }
    }
  });

  logger.info('All event handlers registered');
}
