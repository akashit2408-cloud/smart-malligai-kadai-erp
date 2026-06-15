'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useRealtime(
  channelName: string,
  tables: string[],
  callback: (payload: { table: string; event: string; new: unknown; old: unknown }) => void
) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          callback({
            table,
            event: payload.eventType,
            new: payload.new,
            old: payload.old,
          });
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, tables, callback, supabase]);
}

export function useDashboardRealtime(storeId: string, onUpdate: () => void) {
  useRealtime(`dashboard:${storeId}`, ['sales', 'purchases', 'inventory', 'customer_ledger'], () => {
    onUpdate();
  });
}
