import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
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
  variant = 'default',
  trend,
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: 'border-border/30 bg-card/60',
    danger: 'border-destructive/30 bg-destructive/5 shadow-[0_0_30px_hsl(350_100%_60%/0.15)]',
    warning: 'border-warning/30 bg-warning/5 shadow-[0_0_30px_hsl(45_100%_55%/0.15)]',
    success: 'border-success/30 bg-success/5 shadow-[0_0_30px_hsl(160_100%_45%/0.15)]',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    danger: 'bg-destructive/10 text-destructive',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  };

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-xl border",
      variantStyles[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            <div className="space-y-1">
              <p className="text-4xl font-display font-bold text-foreground">{value}</p>
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
          <div className={cn("p-3 rounded-xl", iconStyles[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
