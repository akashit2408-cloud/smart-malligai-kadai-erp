import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

interface TopProduct {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

interface TopProductsProps {
  products: TopProduct[];
  isLoading: boolean;
}

export function TopProducts({ products, isLoading }: TopProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => (
              <div key={product.product_id} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/20">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{product.product_name}</p>
                  <p className="text-xs text-muted-foreground">{product.total_qty} sold</p>
                </div>
                <p className="font-semibold">{formatCurrency(product.total_revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
