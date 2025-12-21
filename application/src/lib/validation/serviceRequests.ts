import { z } from 'zod';

export const serviceRequestStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']);
export const serviceRequestPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const createServiceRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(1, 'Description is required').max(5000, 'Description is too long'),
  priority: serviceRequestPrioritySchema.optional(),
  status: serviceRequestStatusSchema.optional(),
  unitId: z.string().min(1).optional().nullable(),
  residentId: z.string().min(1).optional().nullable(),
  providerId: z.string().min(1).optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
});

export const updateServiceRequestSchema = createServiceRequestSchema
  .partial()
  .extend({
    resolvedAt: z.string().datetime().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export type CreateServiceRequestInput = z.infer<typeof createServiceRequestSchema>;
export type UpdateServiceRequestInput = z.infer<typeof updateServiceRequestSchema>;
