import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Activity,
  Heart,
  Bell,
  FileText,
  Users,
  Thermometer,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';

interface Patient {
  id: string;
  room_number: string | null;
  profiles: {
    full_name: string;
  } | null;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  is_acknowledged: boolean;
}

export default function NurseDashboard() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Set up realtime subscription for alerts
    const channel = supabase
      .channel('nurse-alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        supabase
          .from('patients')
          .select('id, room_number, profiles!profile_id(full_name)')
          .not('room_number', 'is', null)
          .limit(10),
        supabase
          .from('alerts')
          .select('*')
          .eq('is_acknowledged', false)
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

      if (patientsRes.data) setPatients(patientsRes.data as Patient[]);
      if (alertsRes.data) setAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome, {profile?.full_name || 'Nurse'}
            </h1>
            <p className="text-muted-foreground">Nurse Care Coordinator Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-primary/50">
              <ClipboardList className="mr-2 h-4 w-4" />
              Nursing Notes
            </Button>
            <Button className="gradient-primary text-primary-foreground">
              <Activity className="mr-2 h-4 w-4" />
              Record Vitals
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Assigned Patients"
            value={patients.length}
            icon={<Users className="h-5 w-5" />}
            variant="default"
          />
          <StatsCard
            label="Vital Checks Today"
            value={24}
            icon={<Heart className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            label="Active Alerts"
            value={alerts.length}
            icon={<Bell className="h-5 w-5" />}
            variant={alerts.length > 0 ? 'danger' : 'success'}
          />
          <StatsCard
            label="Critical Alerts"
            value={criticalAlerts}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={criticalAlerts > 0 ? 'danger' : 'success'}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Patients Requiring Attention */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                In-Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No patients assigned</div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {patient.profiles?.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Room {patient.room_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Vitals
                        </Button>
                        <Button size="sm" variant="ghost">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-400" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active alerts</div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.severity === 'critical'
                          ? 'bg-destructive/10 border-destructive/50'
                          : alert.severity === 'high'
                          ? 'bg-amber-500/10 border-amber-500/50'
                          : 'bg-background/50 border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={`h-5 w-5 mt-0.5 ${
                              alert.severity === 'critical'
                                ? 'text-destructive'
                                : alert.severity === 'high'
                                ? 'text-amber-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                          <div>
                            <p className="font-medium text-foreground">{alert.alert_type}</p>
                            <p className="text-sm text-muted-foreground">{alert.message}</p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            alert.severity === 'critical'
                              ? 'border-destructive text-destructive'
                              : alert.severity === 'high'
                              ? 'border-amber-500 text-amber-400'
                              : ''
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Thermometer className="h-6 w-6 text-rose-400" />
                <span>Record Temperature</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Heart className="h-6 w-6 text-cyan-400" />
                <span>Record BP</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <ClipboardList className="h-6 w-6 text-violet-400" />
                <span>Add Note</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Bell className="h-6 w-6 text-amber-400" />
                <span>Acknowledge Alert</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
