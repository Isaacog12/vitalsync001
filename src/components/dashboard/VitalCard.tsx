import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'warning' | 'critical';
  variant?: 'heart' | 'bp' | 'oxygen' | 'temp' | 'default';
  className?: string;
}

export default function VitalCard({
  icon,
  label,
  value,
  unit,
  trend = 'stable',
  status = 'normal',
  variant = 'default',
  className,
}: VitalCardProps) {
  const variantClasses = {
    heart: 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50',
    bp: 'border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50',
    oxygen: 'border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50',
    temp: 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50',
    default: 'border-border bg-card',
  };

  const iconColors = {
    heart: 'text-red-500',
    bp: 'text-violet-500',
    oxygen: 'text-blue-500',
    temp: 'text-amber-500',
    default: 'text-primary',
  };

  const statusClasses = {
    normal: '',
    warning: 'ring-2 ring-warning/50',
    critical: 'ring-2 ring-destructive/50 animate-pulse-ring',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = status === 'critical' ? 'text-destructive' : status === 'warning' ? 'text-warning' : 'text-muted-foreground';

  return (
    <Card className={cn(
      "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      variantClasses[variant],
      statusClasses[status],
      className
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("p-2.5 rounded-xl bg-white/80 shadow-sm", iconColors[variant])}>
            {icon}
          </div>
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "text-3xl font-bold",
              status === 'critical' ? 'text-destructive' : status === 'warning' ? 'text-warning' : 'text-foreground'
            )}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
