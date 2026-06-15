'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Expense } from '@/types';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { ExpenseInput } from '@/lib/validations/expense';

type NewExpensePayload = ExpenseInput & { store_id: string; created_by: string };

const EXPENSE_CATEGORIES = ['Rent', 'Electricity', 'Staff Salary', 'Maintenance', 'Transportation', 'Miscellaneous'];

export default function ExpensesPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;
  const [showForm, setShowForm] = useState(false);

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('store_id', storeId)
        .order('expense_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!storeId,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: NewExpensePayload) => {
      const { data, error } = await supabase.from('expenses').insert(expense).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setShowForm(false);
    },
  });

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Track all business expenses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-900/20">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        {EXPENSE_CATEGORIES.map((cat) => {
          const catTotal = expenses?.filter((e) => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0) || 0;
          return (
            <Card key={cat}>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{cat}</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(catTotal)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showForm && profile && storeId && (
        <ExpenseForm
          storeId={storeId}
          userId={profile.id}
          onSubmit={(data) => addExpense.mutate(data)}
          onCancel={() => setShowForm(false)}
          isSubmitting={addExpense.isPending}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : expenses?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No expenses recorded</p>
            </div>
          ) : (
            <div className="divide-y">
              {expenses?.map((e) => (
                <div key={e.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{e.description || e.category}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(e.expense_date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{e.category}</Badge>
                    <p className="font-semibold">{formatCurrency(e.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
