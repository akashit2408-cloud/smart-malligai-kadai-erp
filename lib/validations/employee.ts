import { z } from 'zod';

export const employeeSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  role: z.string().min(1, 'Role is required'),
  salary: z.coerce.number().min(0).default(0),
  join_date: z.string().optional(),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;
