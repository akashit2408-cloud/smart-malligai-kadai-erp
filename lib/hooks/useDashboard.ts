'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export function useDashboard() {
  const supabase = createClient();
  const { profile } = useAuth();
  const storeId = profile?.store_id;

  const metrics = useQuery({
    queryKey: ['dashboard-metrics', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .eq('store_id', storeId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
  });

  const inventoryValue = useQuery({
    queryKey: ['inventory-value', storeId],
    queryFn: async () => {
      if (!storeId) return 0;
      const { data, error } = await supabase.rpc('get_inventory_value', { p_store_id: storeId });
      if (error) throw error;
      return data || 0;
    },
    enabled: !!storeId,
  });

  const todayProfit = useQuery({
    queryKey: ['today-profit', storeId],
    queryFn: async () => {
      if (!storeId) return 0;
      const { data, error } = await supabase.rpc('get_today_profit', { p_store_id: storeId });
      if (error) throw error;
      return data || 0;
    },
    enabled: !!storeId,
  });

  const recentSales = useQuery({
    queryKey: ['recent-sales', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('sales')
        .select('*, customers(name)')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });

  const topProducts = useQuery({
    queryKey: ['top-products', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase.rpc('get_top_products', { p_store_id: storeId, p_limit: 5 });
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });

  const lowStock = useQuery({
    queryKey: ['low-stock', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase.rpc('get_low_stock', { p_store_id: storeId });
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });

  const expiringSoon = useQuery({
    queryKey: ['expiring-soon', storeId],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from('inventory')
        .select('*, products(name)')
        .eq('store_id', storeId)
        .lte('expiry_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .gte('expiry_date', new Date().toISOString())
        .gt('quantity', 0);
      if (error) throw error;
      return data || [];
    },
    enabled: !!storeId,
  });

  return {
    storeId,
    metrics,
    inventoryValue,
    todayProfit,
    recentSales,
    topProducts,
    lowStock,
    expiringSoon,
  };
}
