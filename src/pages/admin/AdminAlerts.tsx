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

export default function AdminAlerts() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    
    // Subscribe to real-time alerts
    const channel = supabase
      .channel('alerts-changes')
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
        .order('created_at', { ascending: false });

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
      toast({ title: 'Alert acknowledged' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const severityStyles: Record<string, string> = {
    low: 'bg-info/10 text-info border-info/30',
    medium: 'bg-warning/10 text-warning border-warning/30',
    high: 'bg-destructive/10 text-destructive border-destructive/30',
    critical: 'bg-destructive text-destructive-foreground border-destructive',
  };

  const unacknowledgedCount = alerts.filter(a => !a.is_acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.is_acknowledged).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage patient alerts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Bell className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{alerts.length}</p>
                  <p className="text-sm text-muted-foreground">Total Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10 text-warning">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unacknowledgedCount}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{criticalCount}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              All Alerts
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
                <p>No alerts yet</p>
                <p className="text-sm">Alerts will appear when patient vitals trigger thresholds</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${alert.is_acknowledged ? 'opacity-60' : ''} ${
                      alert.severity === 'critical' && !alert.is_acknowledged ? 'animate-pulse' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">
                            {alert.patients?.profiles?.full_name || 'Unknown Patient'}
                          </span>
                          {alert.patients?.room_number && (
                            <span className="text-sm text-muted-foreground">
                              Room {alert.patients.room_number}
                            </span>
                          )}
                          <Badge className={severityStyles[alert.severity] || ''}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-2">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!alert.is_acknowledged && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => acknowledgeAlert(alert.id)}
                        >
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
