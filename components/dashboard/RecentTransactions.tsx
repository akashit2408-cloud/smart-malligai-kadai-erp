import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface Sale {
  id: string;
  invoice_number: string;
  total_amount: number;
  payment_mode: string;
  created_at: string;
  customers?: { name: string } | null;
}

interface RecentTransactionsProps {
  sales: Sale[];
  isLoading: boolean;
}

export function RecentTransactions({ sales, isLoading }: RecentTransactionsProps) {
  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link href="/billing" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sales.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div>
                  <p className="font-medium">{sale.invoice_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.customers?.name || 'Walk-in'} • {formatDateTime(sale.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(sale.total_amount)}</p>
                  <p className="text-xs capitalize text-muted-foreground">{sale.payment_mode}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
