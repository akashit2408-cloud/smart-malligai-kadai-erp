'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { Customer } from '@/types';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { CustomerInput } from '@/lib/validations/customer';

type NewCustomerPayload = CustomerInput & { store_id: string };

export default function CustomersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers', storeId, search],
    queryFn: async () => {
      if (!storeId) return [];
      let query = supabase.from('customers').select('*').eq('store_id', storeId);
      if (search) query = query.ilike('name', `%${search}%`);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!storeId,
  });

  const addCustomer = useMutation({
    mutationFn: async (customer: NewCustomerPayload) => {
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setShowForm(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Khata</h1>
          <p className="text-muted-foreground">Manage customer credit and ledger</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {showForm && (
        <CustomerForm
          storeId={storeId!}
          onSubmit={(data) => addCustomer.mutate(data)}
          onCancel={() => setShowForm(false)}
          isSubmitting={addCustomer.isPending}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Customers</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : customers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserPlus className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No customers yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                Add customer
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {customers?.map((customer) => (
                <div
                  key={customer.id}
                  className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone} • {customer.email || 'No email'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(customer.outstanding_amount)}</p>
                    <p className="text-xs text-muted-foreground">Outstanding</p>
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
