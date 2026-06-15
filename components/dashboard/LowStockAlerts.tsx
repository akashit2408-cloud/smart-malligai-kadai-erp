import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface LowStockItem {
  product_id: string;
  product_name: string;
  quantity: number;
  min_stock_level: number;
}

interface LowStockAlertsProps {
  items: LowStockItem[];
  isLoading: boolean;
}

export function LowStockAlerts({ items, isLoading }: LowStockAlertsProps) {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Low Stock Alerts
        </CardTitle>
        <Badge variant="warning">{items.length}</Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : items.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">All stock levels healthy</p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.product_id}
                className="flex items-center justify-between rounded-lg border bg-card p-3"
              >
                <div>
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} / Min: {item.min_stock_level}
                  </p>
                </div>
                <Link href="/inventory" className="text-sm text-primary hover:underline">
                  Restock
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
