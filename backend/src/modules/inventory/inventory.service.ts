import { prisma } from '../../config/database';
import { eventBus } from '../../core/events/eventBus';
import { AppError } from '../../core/middleware/errorHandler';

export class InventoryService {
  // ── Products ──
  async getProducts(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = { isActive: true };
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) where.name = { contains: filters.search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: limit, orderBy: { name: 'asc' }, include: { category: { select: { name: true } }, inventoryItems: { include: { warehouse: { select: { name: true } } } } } }),
      prisma.product.count({ where }),
    ]);
    return { data, total };
  }

  async createProduct(data: any) {
    return prisma.product.create({ data, include: { category: true } });
  }

  async updateProduct(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  // ── Categories ──
  async getCategories() {
    return prisma.category.findMany({ include: { children: true, _count: { select: { products: true } } }, where: { parentId: null }, orderBy: { name: 'asc' } });
  }

  // ── Warehouses ──
  async getWarehouses() {
    return prisma.warehouse.findMany({ where: { isActive: true }, include: { _count: { select: { inventoryItems: true } } }, orderBy: { name: 'asc' } });
  }

  async createWarehouse(data: any) {
    return prisma.warehouse.create({ data });
  }

  // ── Inventory ──
  async getInventoryItems(filters: Record<string, string>) {
    const where: any = {};
    if (filters.warehouseId) where.warehouseId = filters.warehouseId;
    if (filters.productId) where.productId = filters.productId;

    return prisma.inventoryItem.findMany({ where, include: { product: { select: { sku: true, name: true, uom: true } }, warehouse: { select: { name: true } } }, orderBy: { product: { name: 'asc' } } });
  }

  async createStockMovement(data: any) {
    const movement = await prisma.stockMovement.create({ data, include: { product: true } });

    // Update inventory quantities
    if (data.type === 'IN' && data.toWarehouseId) {
      await this.upsertInventory(data.productId, data.toWarehouseId, Number(data.quantity));
    } else if (data.type === 'OUT' && data.fromWarehouseId) {
      await this.upsertInventory(data.productId, data.fromWarehouseId, -Number(data.quantity));
    } else if (data.type === 'TRANSFER' && data.fromWarehouseId && data.toWarehouseId) {
      await this.upsertInventory(data.productId, data.fromWarehouseId, -Number(data.quantity));
      await this.upsertInventory(data.productId, data.toWarehouseId, Number(data.quantity));
    }

    // Emit event for rule engine evaluation
    const item = await prisma.inventoryItem.findFirst({
      where: { productId: data.productId },
      include: { product: true, warehouse: true },
    });

    if (item) {
      await eventBus.emit('inventory:stock.changed', {
        productId: data.productId,
        productName: item.product.name,
        warehouseName: item.warehouse.name,
        quantity: Number(item.quantity),
        reorderLevel: Number(item.reorderLevel),
      });
    }

    return movement;
  }

  private async upsertInventory(productId: string, warehouseId: string, quantityChange: number) {
    const existing = await prisma.inventoryItem.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });

    if (existing) {
      const newQty = Number(existing.quantity) + quantityChange;
      if (newQty < 0) throw new AppError('Insufficient stock', 400);
      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      if (quantityChange < 0) throw new AppError('Insufficient stock', 400);
      await prisma.inventoryItem.create({
        data: { productId, warehouseId, quantity: quantityChange },
      });
    }
  }

  async getStockMovements(skip: number, limit: number) {
    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, include: { product: { select: { sku: true, name: true } }, fromWarehouse: { select: { name: true } }, toWarehouse: { select: { name: true } } } }),
      prisma.stockMovement.count(),
    ]);
    return { data, total };
  }

  // ── Purchase Orders ──
  async getPurchaseOrders(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.purchaseOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { vendor: { select: { name: true } }, lines: { include: { product: { select: { name: true, sku: true } } } } } }),
      prisma.purchaseOrder.count({ where }),
    ]);
    return { data, total };
  }

  async createPurchaseOrder(data: any) {
    const count = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${String(count + 1).padStart(6, '0')}`;

    const lines = data.lines.map((l: any) => ({ ...l, total: l.quantity * l.unitPrice }));
    const total = lines.reduce((sum: number, l: any) => sum + l.total, 0);

    return prisma.purchaseOrder.create({
      data: { orderNumber, vendorId: data.vendorId, expectedDate: data.expectedDate, total, notes: data.notes, lines: { create: lines } },
      include: { vendor: true, lines: { include: { product: true } } },
    });
  }

  async confirmPurchaseOrder(id: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id }, include: { lines: true } });
    if (!po) throw new AppError('Purchase order not found', 404);
    if (po.status !== 'DRAFT') throw new AppError('Only draft orders can be confirmed', 400);

    const updated = await prisma.purchaseOrder.update({ where: { id }, data: { status: 'CONFIRMED' } });
    await eventBus.emit('inventory:order.confirmed', { orderId: id, type: 'purchase' });
    return updated;
  }

  // ── Sales Orders ──
  async getSalesOrders(skip: number, limit: number, filters: Record<string, string>) {
    const where: any = {};
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.salesOrder.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { customer: { select: { name: true } }, lines: { include: { product: { select: { name: true, sku: true } } } } } }),
      prisma.salesOrder.count({ where }),
    ]);
    return { data, total };
  }

  async createSalesOrder(data: any) {
    const count = await prisma.salesOrder.count();
    const orderNumber = `SO-${String(count + 1).padStart(6, '0')}`;

    const lines = data.lines.map((l: any) => ({ ...l, total: l.quantity * l.unitPrice }));
    const total = lines.reduce((sum: number, l: any) => sum + l.total, 0);

    return prisma.salesOrder.create({
      data: { orderNumber, customerId: data.customerId, total, notes: data.notes, lines: { create: lines } },
      include: { customer: true, lines: { include: { product: true } } },
    });
  }

  // ── Vendors & Customers ──
  async getVendors() { return prisma.vendor.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); }
  async getCustomers() { return prisma.customer.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); }

  // ── Summary ──
  async getInventorySummary() {
    const [totalProducts, totalWarehouses, lowStockItems, recentMovements] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.inventoryItem.findMany({ where: { quantity: { lte: prisma.inventoryItem.fields.reorderLevel as any } }, include: { product: { select: { name: true, sku: true } }, warehouse: { select: { name: true } } }, take: 10 }).catch(() => []),
      prisma.stockMovement.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { product: { select: { name: true } } } }),
    ]);

    // Get low stock via raw query workaround
    const lowStock = await prisma.$queryRaw`SELECT i.id, i.quantity, i."reorderLevel", p.name as "productName", w.name as "warehouseName" FROM "InventoryItem" i JOIN "Product" p ON i."productId" = p.id JOIN "Warehouse" w ON i."warehouseId" = w.id WHERE i.quantity <= i."reorderLevel" AND i."reorderLevel" > 0 LIMIT 10`;

    return { totalProducts, totalWarehouses, lowStockItems: lowStock, recentMovements, pendingPurchaseOrders: await prisma.purchaseOrder.count({ where: { status: 'DRAFT' } }), pendingSalesOrders: await prisma.salesOrder.count({ where: { status: 'DRAFT' } }) };
  }
}
