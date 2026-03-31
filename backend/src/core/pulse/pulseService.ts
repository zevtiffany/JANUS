import { prisma } from '../../../config/database';

export interface PulseIndicator {
  module: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  score: number;
  metrics: Record<string, any>;
  alerts: string[];
}

export class PulseService {
  async getOperationalPulse(): Promise<{ overall: string; score: number; indicators: PulseIndicator[]; timestamp: string }> {
    const [finance, inventory, projects] = await Promise.all([
      this.getFinancePulse(),
      this.getInventoryPulse(),
      this.getProjectsPulse(),
    ]);

    const indicators = [finance, inventory, projects];
    const avgScore = indicators.reduce((sum, i) => sum + i.score, 0) / indicators.length;

    let overall: string;
    if (avgScore >= 80) overall = 'HEALTHY';
    else if (avgScore >= 50) overall = 'WARNING';
    else overall = 'CRITICAL';

    return { overall, score: Math.round(avgScore), indicators, timestamp: new Date().toISOString() };
  }

  private async getFinancePulse(): Promise<PulseIndicator> {
    const [overdueInvoices, totalInvoices, revenue, expenses] = await Promise.all([
      prisma.invoice.count({ where: { dueDate: { lt: new Date() }, status: { notIn: ['PAID', 'CANCELLED'] } } }),
      prisma.invoice.count({ where: { status: { not: 'CANCELLED' } } }),
      prisma.account.aggregate({ where: { type: 'REVENUE' }, _sum: { balance: true } }),
      prisma.account.aggregate({ where: { type: 'EXPENSE' }, _sum: { balance: true } }),
    ]);

    const alerts: string[] = [];
    let score = 100;

    if (overdueInvoices > 0) {
      score -= overdueInvoices * 10;
      alerts.push(`${overdueInvoices} overdue invoice(s)`);
    }

    const rev = Number(revenue._sum.balance || 0);
    const exp = Number(expenses._sum.balance || 0);
    if (rev > 0 && exp / rev > 0.9) {
      score -= 20;
      alerts.push('Expenses are over 90% of revenue');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      module: 'Finance',
      status: score >= 80 ? 'HEALTHY' : score >= 50 ? 'WARNING' : 'CRITICAL',
      score,
      metrics: { overdueInvoices, totalInvoices, revenue: rev, expenses: exp, profit: rev - exp },
      alerts,
    };
  }

  private async getInventoryPulse(): Promise<PulseIndicator> {
    const lowStockCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "InventoryItem" 
      WHERE quantity <= "reorderLevel" AND "reorderLevel" > 0
    `;

    const pendingPOs = await prisma.purchaseOrder.count({ where: { status: 'DRAFT' } });
    const totalProducts = await prisma.product.count({ where: { isActive: true } });

    const alerts: string[] = [];
    let score = 100;

    const lowStock = Number(lowStockCount[0]?.count || 0);
    if (lowStock > 0) {
      score -= lowStock * 8;
      alerts.push(`${lowStock} product(s) below reorder level`);
    }
    if (pendingPOs > 5) {
      score -= 10;
      alerts.push(`${pendingPOs} pending purchase orders`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      module: 'Inventory',
      status: score >= 80 ? 'HEALTHY' : score >= 50 ? 'WARNING' : 'CRITICAL',
      score,
      metrics: { totalProducts, lowStockItems: lowStock, pendingPurchaseOrders: pendingPOs },
      alerts,
    };
  }

  private async getProjectsPulse(): Promise<PulseIndicator> {
    const [overdueTasks, totalActiveTasks, activeProjects, overBudgetProjects] = await Promise.all([
      prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      prisma.task.count({ where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      prisma.project.count({ where: { status: 'ACTIVE' } }),
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM "Project" WHERE spent > budget AND budget > 0`,
    ]);

    const alerts: string[] = [];
    let score = 100;

    if (overdueTasks > 0) {
      const overdueRatio = totalActiveTasks > 0 ? overdueTasks / totalActiveTasks : 0;
      score -= Math.min(40, Math.round(overdueRatio * 100));
      alerts.push(`${overdueTasks} overdue task(s)`);
    }

    const overBudget = Number(overBudgetProjects[0]?.count || 0);
    if (overBudget > 0) {
      score -= overBudget * 15;
      alerts.push(`${overBudget} project(s) over budget`);
    }

    score = Math.max(0, Math.min(100, score));

    return {
      module: 'Projects',
      status: score >= 80 ? 'HEALTHY' : score >= 50 ? 'WARNING' : 'CRITICAL',
      score,
      metrics: { activeProjects, overdueTasks, totalActiveTasks, overBudgetProjects: overBudget },
      alerts,
    };
  }
}
