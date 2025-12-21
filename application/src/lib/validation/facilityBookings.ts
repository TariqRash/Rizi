import { z } from 'zod';

export const bookingStatusSchema = z.enum(['REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED']);

export const createFacilityBookingSchema = z.object({
  facilityName: z.string().min(1, 'Facility name is required').max(200),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
  status: bookingStatusSchema.optional(),
  unitId: z.string().min(1).optional().nullable(),
  residentId: z.string().min(1).optional().nullable(),
});

export const updateFacilityBookingSchema = createFacilityBookingSchema.partial().refine((d) => Object.keys(d).length > 0, { message: 'At least one field must be provided' });

export type CreateFacilityBookingInput = z.infer<typeof createFacilityBookingSchema>;
export type UpdateFacilityBookingInput = z.infer<typeof updateFacilityBookingSchema>;
