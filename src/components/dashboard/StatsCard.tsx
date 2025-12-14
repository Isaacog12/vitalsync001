import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export default function StatsCard({
  icon,
  label,
  value,
  subtext,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {subtext && (
                <p className="text-sm text-muted-foreground">{subtext}</p>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-medium",
                  trend.value >= 0 ? 'text-success' : 'text-destructive'
                )}>
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-sm text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
