import { z } from 'zod';

export const createAccountSchema = z.object({
  code: z.string().min(1, 'Account code is required'),
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  parentId: z.string().uuid().optional().nullable(),
  description: z.string().optional(),
});

export const createJournalEntrySchema = z.object({
  date: z.string().transform((s) => new Date(s)),
  reference: z.string().optional(),
  description: z.string().optional(),
  lines: z.array(z.object({
    accountId: z.string().uuid(),
    debit: z.number().min(0).default(0),
    credit: z.number().min(0).default(0),
    description: z.string().optional(),
  })).min(2, 'At least 2 journal lines required'),
});

export const createInvoiceSchema = z.object({
  type: z.enum(['SALES', 'PURCHASE']),
  customerId: z.string().uuid().optional().nullable(),
  vendorId: z.string().uuid().optional().nullable(),
  dueDate: z.string().transform((s) => new Date(s)),
  notes: z.string().optional(),
  lines: z.array(z.object({
    productId: z.string().uuid().optional().nullable(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
  })).min(1, 'At least 1 invoice line required'),
  tax: z.number().min(0).default(0),
});

export const createExpenseSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string().transform((s) => new Date(s)).optional(),
  employeeId: z.string().uuid().optional().nullable(),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']).default('BANK_TRANSFER'),
  reference: z.string().optional(),
  date: z.string().transform((s) => new Date(s)).optional(),
});
