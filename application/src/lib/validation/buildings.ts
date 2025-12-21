import { z } from 'zod';

/**
 * Shared validation for Buildings.
 *
 * Contract:
 * - `name` is required on create.
 * - `name` is optional on update but if present must be non-empty.
 * - We trim on the server after validation; client can also round-trip trimmed.
 */

export const buildingNameSchema = z
  .string({ required_error: 'Building name is required' })
  .trim()
  .min(1, 'Building name is required')
  .max(120, 'Building name is too long');

export const createBuildingSchema = z.object({
  name: buildingNameSchema,
});

export const updateBuildingSchema = z
  .object({
    name: buildingNameSchema.optional(),
  })
  .refine((v) => v.name !== undefined, {
    message: 'At least one field must be provided',
  });

export type CreateBuildingInput = z.infer<typeof createBuildingSchema>;
export type UpdateBuildingInput = z.infer<typeof updateBuildingSchema>;
