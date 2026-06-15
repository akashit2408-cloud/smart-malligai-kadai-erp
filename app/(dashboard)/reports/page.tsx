'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'daily_sales', name: 'Daily Sales Report' },
  { id: 'weekly_sales', name: 'Weekly Sales Report' },
  { id: 'monthly_sales', name: 'Monthly Sales Report' },
  { id: 'profit', name: 'Profit Report' },
  { id: 'inventory', name: 'Inventory Report' },
  { id: 'credit', name: 'Credit Customer Report' },
  { id: 'supplier', name: 'Supplier Report' },
  { id: 'employee', name: 'Employee Report' },
  { id: 'expense', name: 'Expense Report' },
];

export default function ReportsPage() {
  const supabase = createClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;
  const [selectedReport, setSelectedReport] = useState('daily_sales');

  const { data: reportRows, isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ['report', selectedReport, storeId],
    queryFn: async () => {
      if (!storeId) return [];
      let result;
      switch (selectedReport) {
        case 'daily_sales':
          result = await supabase
            .from('sales')
            .select('invoice_number, total_amount, payment_mode, created_at')
            .eq('store_id', storeId)
            .gte('created_at', new Date().toISOString().split('T')[0])
            .order('created_at', { ascending: false });
          break;
        case 'monthly_sales':
          result = await supabase
            .from('sales')
            .select('invoice_number, total_amount, payment_mode, created_at')
            .eq('store_id', storeId)
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
            .order('created_at', { ascending: false });
          break;
        case 'credit':
          result = await supabase.from('customers').select('name, phone, outstanding_amount').eq('store_id', storeId).gt('outstanding_amount', 0);
          break;
        case 'expense':
          result = await supabase.from('expenses').select('*').eq('store_id', storeId).order('expense_date', { ascending: false });
          break;
        default:
          return [];
      }
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!storeId,
  });

  const exportCSV = () => {
    const data = reportRows || [];
    if (!data.length) {
      toast.error('No data to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((row) => Object.values(row).map(String).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}.csv`;
    a.click();
    toast.success('Report downloaded');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export business reports</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
              selectedReport === report.id
                ? 'border-primary bg-primary-50 dark:bg-primary-900/10'
                : 'bg-card hover:bg-accent'
            }`}
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="font-medium">{report.name}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>{REPORT_TYPES.find((r) => r.id === selectedReport)?.name}</CardTitle>
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    {reportRows?.[0] &&
                      Object.keys(reportRows[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left font-medium capitalize">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {(reportRows || []).map((row, idx: number) => (
                    <tr key={idx} className="border-b">
                      {Object.values(row).map((value: unknown, vidx: number) => (
                        <td key={vidx} className="px-4 py-2">
                          {typeof value === 'number' ? formatCurrency(value) : String(value || '-')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
