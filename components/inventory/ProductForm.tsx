'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { productSchema, ProductInput } from '@/lib/validations/product';

type ProductFormPayload = ProductInput & { store_id: string };

interface ProductFormProps {
  storeId: string;
  onSubmit: (data: ProductFormPayload) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ProductForm({ storeId, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      barcode: '',
      description: '',
      cost_price: 0,
      selling_price: 0,
      mrp: 0,
      gst_rate: 0,
      min_stock_level: 0,
      initial_stock: 0,
    },
  });

  const handleFormSubmit = (data: ProductInput) => {
    onSubmit({
      ...data,
      store_id: storeId,
    });
  };

  const handleFormError = () => {
    toast.error('Please check the form for validation errors');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input id="barcode" {...register('barcode')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost_price">Cost Price (₹)</Label>
            <Input id="cost_price" type="number" step="0.01" {...register('cost_price')} />
            {errors.cost_price && <p className="text-xs text-destructive">{errors.cost_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="selling_price">Selling Price (₹)</Label>
            <Input id="selling_price" type="number" step="0.01" {...register('selling_price')} />
            {errors.selling_price && <p className="text-xs text-destructive">{errors.selling_price.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mrp">MRP (₹)</Label>
            <Input id="mrp" type="number" step="0.01" {...register('mrp')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst_rate">GST Rate (%)</Label>
            <Input id="gst_rate" type="number" step="0.01" {...register('gst_rate')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_stock_level">Min Stock Level</Label>
            <Input id="min_stock_level" type="number" step="0.01" {...register('min_stock_level')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_stock">Initial Stock</Label>
            <Input id="initial_stock" type="number" step="0.01" {...register('initial_stock')} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} />
          </div>

          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
