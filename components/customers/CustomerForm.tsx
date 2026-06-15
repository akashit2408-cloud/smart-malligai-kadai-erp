'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customerSchema, CustomerInput } from '@/lib/validations/customer';

type CustomerFormPayload = CustomerInput & { store_id: string };

interface CustomerFormProps {
  storeId: string;
  onSubmit: (data: CustomerFormPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function CustomerForm({ storeId, onSubmit, onCancel, isSubmitting }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: { credit_limit: 0 },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, store_id: storeId }))} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="credit_limit">Credit Limit (₹)</Label>
            <Input id="credit_limit" type="number" step="0.01" {...register('credit_limit')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
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
