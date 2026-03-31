import { ruleEngine } from '../ruleEngine';
import { prisma } from '../../../config/database';
import { logger } from '../../utils/logger';

export function registerRules(): void {
  // ── Finance Rules ──
  ruleEngine.register({
    id: 'invoice-overdue',
    name: 'Overdue Invoice Alert',
    module: 'finance',
    description: 'Flag invoices past due date that are not paid',
    priority: 10,
    condition: (ctx) => {
      return ctx.dueDate && new Date(ctx.dueDate) < new Date() && ctx.status !== 'PAID' && ctx.status !== 'CANCELLED';
    },
    action: async (ctx) => {
      logger.warn(`Invoice ${ctx.invoiceNumber} is overdue!`);
      await prisma.notification.create({
        data: {
          userId: ctx.userId || ctx.createdById,
          type: 'OVERDUE_INVOICE',
          title: 'Overdue Invoice',
          message: `Invoice ${ctx.invoiceNumber} is past due date`,
          module: 'finance',
          entityId: ctx.id,
        },
      });
    },
  });

  // ── Inventory Rules ──
  ruleEngine.register({
    id: 'low-stock',
    name: 'Low Stock Alert',
    module: 'inventory',
    description: 'Notify when inventory falls below reorder level',
    priority: 10,
    condition: (ctx) => {
      return ctx.quantity !== undefined && ctx.reorderLevel !== undefined
        && Number(ctx.quantity) <= Number(ctx.reorderLevel) && Number(ctx.reorderLevel) > 0;
    },
    action: async (ctx) => {
      logger.warn(`Low stock alert: Product ${ctx.productName} at ${ctx.warehouseName}`);
    },
  });

  // ── Project Rules ──
  ruleEngine.register({
    id: 'task-overdue',
    name: 'Overdue Task Flag',
    module: 'projects',
    description: 'Flag tasks past their due date',
    priority: 8,
    condition: (ctx) => {
      return ctx.dueDate && new Date(ctx.dueDate) < new Date()
        && ctx.status !== 'COMPLETED' && ctx.status !== 'CANCELLED';
    },
    action: async (ctx) => {
      logger.warn(`Task "${ctx.title}" is overdue!`);
    },
  });

  ruleEngine.register({
    id: 'project-over-budget',
    name: 'Project Over Budget',
    module: 'projects',
    description: 'Alert when project spending exceeds budget',
    priority: 9,
    condition: (ctx) => {
      return ctx.budget && ctx.spent && Number(ctx.spent) > Number(ctx.budget);
    },
    action: async (ctx) => {
      logger.warn(`Project "${ctx.name}" is over budget! Spent: ${ctx.spent}, Budget: ${ctx.budget}`);
    },
  });

  logger.info('All business rules registered');
}
