'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Plus, Minus, CreditCard, Banknote, Wallet, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency, generateInvoiceNumber, calculateGST, getErrorMessage } from '@/lib/utils';
import { Product, Customer } from '@/types';
import toast from 'react-hot-toast';

interface CartItem extends Product {
  cartQty: number;
  discount: number;
}

export default function BillingPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const storeId = profile?.store_id;
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: products } = useQuery({
    queryKey: ['products-billing', storeId, search],
    queryFn: async () => {
      if (!storeId) return [];
      let query = supabase.from('products').select('*').eq('store_id', storeId).eq('is_active', true);
      if (search) query = query.ilike('name', `%${search}%`);
      const { data, error } = await query.limit(20);
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-billing', storeId, customerSearch],
    queryFn: async () => {
      if (!storeId || !customerSearch) return [];
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .ilike('phone', `%${customerSearch}%`)
        .limit(5);
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!storeId && customerSearch.length > 2,
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, cartQty: p.cartQty + 1 } : p));
      }
      return [...prev, { ...product, cartQty: 1, discount: 0 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, cartQty: Math.max(0, p.cartQty + delta) } : p))
        .filter((p) => p.cartQty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.selling_price * item.cartQty, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount * item.cartQty, 0);
  const taxable = subtotal - totalDiscount;
  const taxAmount = cart.reduce(
    (sum, item) => sum + calculateGST(item.selling_price * item.cartQty, item.gst_rate).gstAmount,
    0
  );
  const total = taxable + taxAmount;

  const createSale = useMutation({
    mutationFn: async () => {
      if (!storeId || !user) throw new Error('Missing store or user');
      if (cart.length === 0) throw new Error('Cart is empty');

      const invoiceNumber = generateInvoiceNumber();
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          store_id: storeId,
          invoice_number: invoiceNumber,
          customer_id: selectedCustomer?.id || null,
          user_id: user.id,
          subtotal,
          discount_amount: totalDiscount,
          tax_amount: taxAmount,
          total_amount: total,
          payment_mode: paymentMode,
          payment_status: paymentMode === 'credit' ? 'pending' : 'paid',
        })
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = cart.map((item) => {
        const itemSubtotal = item.selling_price * item.cartQty;
        const itemGst = calculateGST(itemSubtotal, item.gst_rate).gstAmount;
        return {
          sale_id: sale.id,
          product_id: item.id,
          quantity: item.cartQty,
          unit_price: item.selling_price,
          discount_amount: item.discount * item.cartQty,
          tax_amount: itemGst,
          total_amount: itemSubtotal + itemGst - item.discount * item.cartQty,
        };
      });

      const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
      if (itemsError) throw itemsError;

      // Decrease inventory
      for (const item of cart) {
        await supabase.rpc('decrease_inventory', {
          p_product_id: item.id,
          p_store_id: storeId,
          p_quantity: item.cartQty,
        });
        await supabase.from('inventory_movements').insert({
          product_id: item.id,
          store_id: storeId,
          type: 'stock_out',
          quantity: item.cartQty,
          reference_id: sale.id,
          created_by: user.id,
          notes: `Sale ${invoiceNumber}`,
        });
      }

      if (paymentMode === 'credit' && selectedCustomer) {
        await supabase.from('customer_ledger').insert({
          customer_id: selectedCustomer.id,
          store_id: storeId,
          sale_id: sale.id,
          amount: total,
          type: 'credit',
          description: `Credit sale ${invoiceNumber}`,
        });
      }

      return sale;
    },
    onSuccess: () => {
      toast.success('Sale completed successfully');
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-bold">Billing / POS</h1>
          <p className="text-muted-foreground">Create invoices quickly</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name or barcode..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
          {products?.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="flex items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/10"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">MRP {formatCurrency(product.selling_price)}</p>
              </div>
              <Plus className="h-5 w-5 text-primary" />
            </button>
          ))}
        </div>
      </div>

      <Card className="flex flex-col lg:col-span-1">
        <CardHeader>
          <CardTitle>Current Cart</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col">
          <div className="relative mb-4">
            <Input
              placeholder="Customer phone (for credit)"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            {customers && customers.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-lg">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerSearch(c.name);
                    }}
                  >
                    {c.name} ({c.phone})
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Cart is empty</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.selling_price)} × {item.cartQty}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="rounded p-1 hover:bg-accent">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center">{item.cartQty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="rounded p-1 hover:bg-accent">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeFromCart(item.id)} className="ml-2 rounded p-1 text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount</span>
              <span>{formatCurrency(totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { id: 'cash', icon: Banknote, label: 'Cash' },
              { id: 'upi', icon: Wallet, label: 'UPI' },
              { id: 'card', icon: CreditCard, label: 'Card' },
              { id: 'credit', icon: Receipt, label: 'Credit' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPaymentMode(mode.id)}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2 text-sm ${
                  paymentMode === mode.id
                    ? 'border-primary bg-primary-50 text-primary dark:bg-primary-900/10'
                    : 'bg-card hover:bg-accent'
                }`}
              >
                <mode.icon className="h-4 w-4" />
                {mode.label}
              </button>
            ))}
          </div>

          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={cart.length === 0 || createSale.isPending}
            onClick={() => createSale.mutate()}
          >
            {createSale.isPending ? 'Processing...' : `Charge ${formatCurrency(total)}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
