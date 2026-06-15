import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  unit_id: z.string().optional(),
  description: z.string().optional(),
  cost_price: z.coerce.number().min(0, 'Cost price must be positive'),
  selling_price: z.coerce.number().min(0, 'Selling price must be positive'),
  mrp: z.coerce.number().min(0).optional(),
  gst_rate: z.coerce.number().min(0).max(100),
  min_stock_level: z.coerce.number().min(0).default(0),
  initial_stock: z.coerce.number().min(0).default(0),
  expiry_date: z.string().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
