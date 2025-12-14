import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_acknowledged: boolean;
  created_at: string;
  patients: {
    room_number: string | null;
    profiles: {
      full_name: string;
    } | null;
  } | null;
}

export default function DoctorAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('doctor-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          patients!inner (
            room_number,
            profiles!patients_profile_id_fkey (full_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const severityStyles: Record<string, string> = {
    low: 'bg-info/10 text-info',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-destructive/10 text-destructive',
    critical: 'bg-destructive text-destructive-foreground',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Alerts</h1>
          <p className="text-muted-foreground">Monitor critical patient alerts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${alert.is_acknowledged ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {alert.patients?.profiles?.full_name || 'Unknown'}
                          </span>
                          {alert.patients?.room_number && (
                            <span className="text-sm text-muted-foreground">
                              Room {alert.patients.room_number}
                            </span>
                          )}
                          <Badge className={severityStyles[alert.severity]}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!alert.is_acknowledged && (
                        <Button size="sm" variant="secondary" onClick={() => acknowledgeAlert(alert.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
