import { Router } from 'express';
import { InventoryService } from './inventory.service';
import { authenticate, AuthRequest } from '../../core/middleware/auth';
import { validate } from '../../core/middleware/validate';
import { createProductSchema, createWarehouseSchema, stockMovementSchema, createPurchaseOrderSchema, createSalesOrderSchema } from './inventory.validator';
import { sendSuccess, sendPaginated, sendError } from '../../core/utils/response';
import { parsePagination } from '../../core/utils/pagination';

const router = Router();
const inventoryService = new InventoryService();

router.use(authenticate);

// ── Products ──
router.get('/products', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { data, total } = await inventoryService.getProducts(skip, limit, req.query as any);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.post('/products', validate(createProductSchema), async (req: AuthRequest, res, next) => {
  try {
    const product = await inventoryService.createProduct(req.body);
    sendSuccess(res, product, 'Product created', 201);
  } catch (error) { next(error); }
});

router.put('/products/:id', async (req: AuthRequest, res, next) => {
  try {
    const product = await inventoryService.updateProduct(req.params.id, req.body);
    sendSuccess(res, product, 'Product updated');
  } catch (error) { next(error); }
});

// ── Categories ──
router.get('/categories', async (req: AuthRequest, res, next) => {
  try {
    const categories = await inventoryService.getCategories();
    sendSuccess(res, categories);
  } catch (error) { next(error); }
});

// ── Warehouses ──
router.get('/warehouses', async (req: AuthRequest, res, next) => {
  try {
    const warehouses = await inventoryService.getWarehouses();
    sendSuccess(res, warehouses);
  } catch (error) { next(error); }
});

router.post('/warehouses', validate(createWarehouseSchema), async (req: AuthRequest, res, next) => {
  try {
    const warehouse = await inventoryService.createWarehouse(req.body);
    sendSuccess(res, warehouse, 'Warehouse created', 201);
  } catch (error) { next(error); }
});

// ── Inventory / Stock ──
router.get('/stock', async (req: AuthRequest, res, next) => {
  try {
    const stock = await inventoryService.getInventoryItems(req.query as any);
    sendSuccess(res, stock);
  } catch (error) { next(error); }
});

router.post('/stock/move', validate(stockMovementSchema), async (req: AuthRequest, res, next) => {
  try {
    const movement = await inventoryService.createStockMovement(req.body);
    sendSuccess(res, movement, 'Stock movement recorded', 201);
  } catch (error) { next(error); }
});

router.get('/stock/movements', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { data, total } = await inventoryService.getStockMovements(skip, limit);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

// ── Purchase Orders ──
router.get('/purchase-orders', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { data, total } = await inventoryService.getPurchaseOrders(skip, limit, req.query as any);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.post('/purchase-orders', validate(createPurchaseOrderSchema), async (req: AuthRequest, res, next) => {
  try {
    const po = await inventoryService.createPurchaseOrder(req.body);
    sendSuccess(res, po, 'Purchase order created', 201);
  } catch (error) { next(error); }
});

router.post('/purchase-orders/:id/confirm', async (req: AuthRequest, res, next) => {
  try {
    const po = await inventoryService.confirmPurchaseOrder(req.params.id);
    sendSuccess(res, po, 'Purchase order confirmed');
  } catch (error) { next(error); }
});

// ── Sales Orders ──
router.get('/sales-orders', async (req: AuthRequest, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query as any);
    const { data, total } = await inventoryService.getSalesOrders(skip, limit, req.query as any);
    sendPaginated(res, data, total, page, limit);
  } catch (error) { next(error); }
});

router.post('/sales-orders', validate(createSalesOrderSchema), async (req: AuthRequest, res, next) => {
  try {
    const so = await inventoryService.createSalesOrder(req.body);
    sendSuccess(res, so, 'Sales order created', 201);
  } catch (error) { next(error); }
});

// ── Vendors & Customers ──
router.get('/vendors', async (req: AuthRequest, res, next) => {
  try { sendSuccess(res, await inventoryService.getVendors()); } catch (error) { next(error); }
});

router.get('/customers', async (req: AuthRequest, res, next) => {
  try { sendSuccess(res, await inventoryService.getCustomers()); } catch (error) { next(error); }
});

// ── Summary ──
router.get('/summary', async (req: AuthRequest, res, next) => {
  try {
    const summary = await inventoryService.getInventorySummary();
    sendSuccess(res, summary);
  } catch (error) { next(error); }
});

export { router as inventoryRoutes };
