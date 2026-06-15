'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Store } from '@/types';

export function useStore(storeId?: string) {
  const supabase = createClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) return null;
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();
      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId,
  });

  return { store: data, isLoading, error };
}

export function useStores() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as Store[];
    },
  });
}
