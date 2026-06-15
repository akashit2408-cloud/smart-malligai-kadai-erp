'use client';


import { useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Truck,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { LowStockAlerts } from '@/components/dashboard/LowStockAlerts';
import { ChartSection } from '@/components/dashboard/ChartSection';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useDashboardRealtime } from '@/lib/hooks/useRealtime';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const {
    metrics,
    inventoryValue,
    todayProfit,
    recentSales,
    topProducts,
    lowStock,
    expiringSoon,
  } = useDashboard();

  useDashboardRealtime(metrics.data?.store_id || '', () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['recent-sales'] });
    queryClient.invalidateQueries({ queryKey: ['top-products'] });
    queryClient.invalidateQueries({ queryKey: ['low-stock'] });
  });

  const stats = [
    {
      title: "Today's Sales",
      value: formatCurrency(metrics.data?.today_sales || 0),
      icon: DollarSign,
      subtitle: 'Total sales today',
      trend: 'up' as const,
      trendValue: 'vs yesterday',
      isLoading: metrics.isLoading,
    },
    {
      title: "Today's Profit",
      value: formatCurrency(todayProfit.data || 0),
      icon: TrendingUp,
      subtitle: 'Estimated profit today',
      isLoading: todayProfit.isLoading,
    },
    {
      title: 'Monthly Sales',
      value: formatCurrency(metrics.data?.monthly_sales || 0),
      icon: Receipt,
      subtitle: 'This month so far',
      isLoading: metrics.isLoading,
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(inventoryValue.data || 0),
      icon: Package,
      subtitle: 'Current stock value',
      isLoading: inventoryValue.isLoading,
    },
    {
      title: 'Pending Credit',
      value: formatCurrency(metrics.data?.total_credit_outstanding || 0),
      icon: Users,
      subtitle: 'Customer outstanding',
      isLoading: metrics.isLoading,
    },
    {
      title: 'Supplier Due',
      value: formatCurrency(metrics.data?.total_supplier_due || 0),
      icon: Truck,
      subtitle: 'Amount to pay suppliers',
      isLoading: metrics.isLoading,
    },
  ];

  const chartData = recentSales.data?.slice(0, 7).map((sale) => ({
    name: new Date(sale.created_at).toLocaleDateString('en-IN', { weekday: 'short' }),
    sales: sale.total_amount,
    profit: sale.total_amount * 0.2, // simplified; replace with real profit per sale
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview of your store</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          Live updates
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartSection data={chartData} isLoading={recentSales.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <RecentTransactions sales={recentSales.data || []} isLoading={recentSales.isLoading} />
        <TopProducts products={topProducts.data || []} isLoading={topProducts.isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <LowStockAlerts items={lowStock.data || []} isLoading={lowStock.isLoading} />

        <div className="rounded-xl border bg-card p-5">
          <h3 className="mb-4 font-semibold">Quick Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-sm">Expiring Soon</span>
              </div>
              <span className="font-semibold">{expiringSoon.data?.length || 0} items</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                <span className="text-sm">Low Stock</span>
              </div>
              <span className="font-semibold">{lowStock.data?.length || 0} products</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Credit Pending</span>
              </div>
              <span className="font-semibold">
                {formatCurrency(metrics.data?.total_credit_outstanding || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
