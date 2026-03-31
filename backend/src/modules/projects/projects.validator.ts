import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)).optional(),
  endDate: z.string().transform((s) => new Date(s)).optional(),
  budget: z.number().min(0).optional(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().transform((s) => new Date(s)).optional(),
  estimatedHours: z.number().min(0).optional(),
});

export const createTimesheetSchema = z.object({
  taskId: z.string().uuid(),
  date: z.string().transform((s) => new Date(s)),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
});
