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
    heart: 'vital-heart border-destructive/20',
    bp: 'vital-bp border-accent/20',
    oxygen: 'vital-oxygen border-info/20',
    temp: 'vital-temp border-warning/20',
    default: 'border-border/30 bg-card/60',
  };

  const iconColors = {
    heart: 'text-destructive',
    bp: 'text-accent-foreground',
    oxygen: 'text-info',
    temp: 'text-warning',
    default: 'text-primary',
  };

  const glowColors = {
    heart: 'shadow-[0_0_30px_hsl(350_100%_60%/0.2)]',
    bp: 'shadow-[0_0_30px_hsl(280_100%_60%/0.2)]',
    oxygen: 'shadow-[0_0_30px_hsl(200_100%_55%/0.2)]',
    temp: 'shadow-[0_0_30px_hsl(45_100%_55%/0.2)]',
    default: 'shadow-glow',
  };

  const statusClasses = {
    normal: '',
    warning: 'ring-2 ring-warning/40 animate-pulse-ring',
    critical: 'ring-2 ring-destructive/50 animate-glow-pulse',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = status === 'critical' ? 'text-destructive' : status === 'warning' ? 'text-warning' : 'text-muted-foreground';

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-xl",
      variantClasses[variant],
      statusClasses[status],
      glowColors[variant],
      "border",
      className
    )}>
      {/* Cyber grid background */}
      <div className="absolute inset-0 bg-cyber-grid bg-[size:20px_20px] opacity-30 pointer-events-none" />
      
      {/* Scan line effect */}
      <div className="absolute inset-0 scan-lines pointer-events-none" />
      
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-2.5 rounded-xl bg-background/60 backdrop-blur-sm border border-border/30",
            iconColors[variant],
            status === 'critical' && "animate-heartbeat"
          )}>
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 text-sm px-2 py-1 rounded-md bg-background/40",
            trendColor
          )}>
            <TrendIcon className="h-3.5 w-3.5" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={cn(
              "text-3xl font-display font-bold tracking-tight",
              status === 'critical' ? 'text-destructive animate-cyber-flicker' : 
              status === 'warning' ? 'text-warning' : 
              'text-foreground'
            )}>
              {value}
            </span>
            <span className="text-sm text-muted-foreground font-mono">{unit}</span>
          </div>
        </div>

        {/* Status indicator dot */}
        <div className="absolute bottom-3 right-3">
          <div className={cn(
            "h-2 w-2 rounded-full",
            status === 'critical' ? 'bg-destructive animate-ping' :
            status === 'warning' ? 'bg-warning animate-pulse' :
            'bg-success'
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
