'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { employeeSchema, EmployeeInput } from '@/lib/validations/employee';

type EmployeeFormPayload = EmployeeInput & { store_id: string };

interface EmployeeFormProps {
  storeId: string;
  onSubmit: (data: EmployeeFormPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function EmployeeForm({ storeId, onSubmit, onCancel, isSubmitting }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { salary: 0, role: 'staff', join_date: new Date().toISOString().split('T')[0] },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Employee</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, store_id: storeId }))} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" {...register('role')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary (₹)</Label>
            <Input id="salary" type="number" step="0.01" {...register('salary')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="join_date">Join Date</Label>
            <Input id="join_date" type="date" {...register('join_date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
