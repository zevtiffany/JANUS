import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0),
  uom: z.string().default('unit'),
});

export const createWarehouseSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
});

export const stockMovementSchema = z.object({
  productId: z.string().uuid(),
  fromWarehouseId: z.string().uuid().optional().nullable(),
  toWarehouseId: z.string().uuid().optional().nullable(),
  quantity: z.number().positive(),
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  expectedDate: z.string().transform((s) => new Date(s)).optional(),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
  })).min(1),
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().uuid(),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
  })).min(1),
});
