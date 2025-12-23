import { z } from 'zod';

// Schemas to enforce minimal input and reject unknown fields.
export const createCartSchema = z.object({}).strict();
export const emptyQuerySchema = z.object({}).strict();

export const addItemSchema = z
  .object({
    sku: z.string(),
    quantity: z.number()
  })
  .strict();

export const updateItemSchema = z
  .object({
    quantity: z.number()
  })
  .strict();
