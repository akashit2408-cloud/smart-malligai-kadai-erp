import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().optional(),
  expense_date: z.string().min(1, 'Date is required'),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
