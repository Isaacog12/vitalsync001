import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Thermometer, Droplets, MessageSquare, Video, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientVitals {
  heartRate: number;
  bloodPressure: string;
  oxygenSaturation: number;
  temperature: number;
}

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  room: string;
  condition: 'stable' | 'monitoring' | 'critical';
  vitals: PatientVitals;
  avatarUrl?: string;
  onMessage?: () => void;
  onVideoCall?: () => void;
  onClick?: () => void;
}

export default function PatientCard({
  id,
  name,
  age,
  room,
  condition,
  vitals,
  avatarUrl,
  onMessage,
  onVideoCall,
  onClick,
}: PatientCardProps) {
  const conditionStyles = {
    stable: 'bg-success/10 text-success border-success/30',
    monitoring: 'bg-warning/10 text-warning border-warning/30',
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card 
      className={cn(
        "transition-all duration-300 hover:shadow-lg cursor-pointer group",
        condition === 'critical' && 'ring-2 ring-destructive/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-border">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              {condition === 'critical' && (
                <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {age} years • Room {room}
            </p>
          </div>
          <Badge className={cn("font-medium", conditionStyles[condition])}>
            {condition.charAt(0).toUpperCase() + condition.slice(1)}
          </Badge>
        </div>

        {/* Vitals grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <VitalMini
            icon={<Heart className="h-3.5 w-3.5" />}
            value={vitals.heartRate}
            unit="bpm"
            color="text-red-500"
          />
          <VitalMini
            icon={<Activity className="h-3.5 w-3.5" />}
            value={vitals.bloodPressure}
            color="text-violet-500"
          />
          <VitalMini
            icon={<Droplets className="h-3.5 w-3.5" />}
            value={`${vitals.oxygenSaturation}%`}
            color="text-blue-500"
          />
          <VitalMini
            icon={<Thermometer className="h-3.5 w-3.5" />}
            value={`${vitals.temperature}°`}
            color="text-amber-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onMessage?.(); }}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={(e) => { e.stopPropagation(); onVideoCall?.(); }}
          >
            <Video className="h-4 w-4 mr-1" />
            Video Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VitalMini({ icon, value, unit, color }: { icon: React.ReactNode; value: string | number; unit?: string; color: string }) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/50">
      <div className={cn("flex justify-center mb-1", color)}>{icon}</div>
      <p className="text-sm font-semibold text-foreground">
        {value}
        {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}
