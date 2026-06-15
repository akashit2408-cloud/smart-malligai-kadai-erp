'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { Supplier } from '@/types';
import { SupplierForm } from '@/components/suppliers/SupplierForm';
import { SupplierInput } from '@/lib/validations/supplier';

type NewSupplierPayload = SupplierInput & { store_id: string };

export default function SuppliersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers', storeId, search],
    queryFn: async () => {
      if (!storeId) return [];
      let query = supabase.from('suppliers').select('*').eq('store_id', storeId);
      if (search) query = query.ilike('name', `%${search}%`);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!storeId,
  });

  const addSupplier = useMutation({
    mutationFn: async (supplier: NewSupplierPayload) => {
      const { data, error } = await supabase.from('suppliers').insert(supplier).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage suppliers and purchase dues</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {showForm && (
        <SupplierForm
          storeId={storeId!}
          onSubmit={(data) => addSupplier.mutate(data)}
          onCancel={() => setShowForm(false)}
          isSubmitting={addSupplier.isPending}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Suppliers</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search suppliers..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : suppliers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No suppliers yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {suppliers?.map((s) => (
                <div key={s.id} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.phone} {s.gstin ? `• GST ${s.gstin}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(s.due_amount)}</p>
                    <p className="text-xs text-muted-foreground">Due</p>
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
