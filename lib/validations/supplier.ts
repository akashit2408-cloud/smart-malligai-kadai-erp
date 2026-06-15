import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().min(2, 'Supplier name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  gstin: z.string().optional(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
