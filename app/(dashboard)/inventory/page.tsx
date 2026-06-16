'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ProductForm } from '@/components/inventory/ProductForm';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { ProductInput } from '@/lib/validations/product';
import { toast } from 'react-hot-toast';

type NewProductPayload = ProductInput & { store_id: string };

export default function InventoryPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', storeId, search],
    queryFn: async () => {
      if (!storeId) return [];
      let query = supabase.from('products').select('*').eq('store_id', storeId).eq('is_active', true);
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });

  const addProduct = useMutation({
    mutationFn: async (product: NewProductPayload) => {
      const { initial_stock, ...productData } = product;
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      if (error) throw error;

      if (initial_stock > 0) {
        await supabase.from('inventory').insert({
          product_id: newProduct.id,
          store_id: productData.store_id,
          quantity: initial_stock,
        });
        await supabase.from('inventory_movements').insert({
          product_id: newProduct.id,
          store_id: productData.store_id,
          type: 'stock_in',
          quantity: initial_stock,
          created_by: profile?.id,
          notes: 'Initial stock',
        });
      }
      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowForm(false);
      toast.success('Product added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add product');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">Manage your products and stock</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showForm && (
        <ProductForm
          storeId={storeId!}
          onSubmit={(data) => addProduct.mutate(data)}
          onCancel={() => setShowForm(false)}
          isSubmitting={addProduct.isPending}
        />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Products</CardTitle>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
          ) : products?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No products found</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                Add your first product
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {products?.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sku || 'No SKU'} • GST {product.gst_rate}%
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.selling_price)}</p>
                      <p className="text-xs text-muted-foreground">MRP</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(product.cost_price)}</p>
                      <p className="text-xs text-muted-foreground">Cost</p>
                    </div>
                    <Badge variant={product.min_stock_level > 0 ? 'outline' : 'default'}>
                      Stock: {product.min_stock_level}
                    </Badge>
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
