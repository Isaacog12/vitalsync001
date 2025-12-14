import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart, Activity, Thermometer, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AlertItemProps {
  id: string;
  patientName: string;
  room: string;
  alertType: 'heart_rate' | 'blood_pressure' | 'oxygen' | 'temperature' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  isAcknowledged: boolean;
  onAcknowledge?: () => void;
}

export default function AlertItem({
  id,
  patientName,
  room,
  alertType,
  severity,
  message,
  timestamp,
  isAcknowledged,
  onAcknowledge,
}: AlertItemProps) {
  const severityStyles = {
    low: 'bg-info/10 text-info border-info/30',
    medium: 'bg-warning/10 text-warning border-warning/30',
    high: 'bg-destructive/10 text-destructive border-destructive/30',
    critical: 'bg-destructive text-destructive-foreground border-destructive',
  };

  const alertIcons = {
    heart_rate: <Heart className="h-5 w-5" />,
    blood_pressure: <Activity className="h-5 w-5" />,
    oxygen: <Activity className="h-5 w-5" />,
    temperature: <Thermometer className="h-5 w-5" />,
    general: <AlertTriangle className="h-5 w-5" />,
  };

  const iconColors = {
    heart_rate: 'text-red-500 bg-red-50',
    blood_pressure: 'text-violet-500 bg-violet-50',
    oxygen: 'text-blue-500 bg-blue-50',
    temperature: 'text-amber-500 bg-amber-50',
    general: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className={cn(
      "transition-all duration-300",
      severity === 'critical' && !isAcknowledged && 'ring-2 ring-destructive animate-pulse-ring',
      isAcknowledged && 'opacity-60'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-2.5 rounded-xl", iconColors[alertType])}>
            {alertIcons[alertType]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{patientName}</h4>
              <span className="text-sm text-muted-foreground">Room {room}</span>
              <Badge className={cn("ml-auto", severityStyles[severity])}>
                {severity.toUpperCase()}
              </Badge>
            </div>
            
            <p className="text-sm text-foreground mb-2">{message}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(timestamp, { addSuffix: true })}
              </div>
              
              {!isAcknowledged && (
                <Button size="sm" variant="secondary" onClick={onAcknowledge}>
                  <Check className="h-4 w-4 mr-1" />
                  Acknowledge
                </Button>
              )}
              
              {isAcknowledged && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Acknowledged
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
