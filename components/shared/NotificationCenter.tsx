'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRealtime } from '@/lib/hooks/useRealtime';
import { formatDateTime } from '@/lib/utils';

interface NotificationCenterProps {
  onClose: () => void;
}

export function NotificationCenter({ onClose }: NotificationCenterProps) {
  const supabase = createClient();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  useRealtime(`notifications:${user?.id}`, ['notifications'], () => {
    queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user!.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-center')) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="notification-center absolute right-0 top-full mt-2 w-80 rounded-xl border bg-card p-4 shadow-card md:w-96">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => markAllRead.mutate()}
            disabled={!unreadCount}
          >
            <CheckCheck className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : notifications?.length ? (
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border p-3 text-sm ${
                n.is_read ? 'bg-muted/50' : 'bg-primary-50 dark:bg-primary-900/10'
              }`}
            >
              <p className="font-medium">{n.title}</p>
              <p className="text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">No notifications yet</p>
      )}
    </div>
  );
}
