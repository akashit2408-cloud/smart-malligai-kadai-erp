'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { expenseSchema, ExpenseInput } from '@/lib/validations/expense';

const CATEGORIES = ['Rent', 'Electricity', 'Staff Salary', 'Maintenance', 'Transportation', 'Miscellaneous'];

type ExpenseFormPayload = ExpenseInput & { store_id: string; created_by: string };

interface ExpenseFormProps {
  storeId: string;
  userId: string;
  onSubmit: (data: ExpenseFormPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ExpenseForm({ storeId, userId, onSubmit, onCancel, isSubmitting }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { expense_date: new Date().toISOString().split('T')[0], amount: 0 },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((data) => onSubmit({ ...data, store_id: storeId, created_by: userId }))} className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" {...register('category')} className="h-10 w-full rounded-lg border border-input bg-background px-3">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount')} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_date">Date</Label>
            <Input id="expense_date" type="date" {...register('expense_date')} />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>
          <div className="flex gap-2 md:col-span-3">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
