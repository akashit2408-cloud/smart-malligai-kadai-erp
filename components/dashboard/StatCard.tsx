import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-8 w-24" />
            ) : (
              <h3 className="mt-1 text-2xl font-bold tracking-tight">{value}</h3>
            )}
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
            {trend && trendValue && (
              <p
                className={cn(
                  'mt-2 text-xs font-medium',
                  trend === 'up' && 'text-emerald-600',
                  trend === 'down' && 'text-rose-600',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-900/20">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
