import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  credit_limit: z.coerce.number().min(0).default(0),
});

export type CustomerInput = z.infer<typeof customerSchema>;
