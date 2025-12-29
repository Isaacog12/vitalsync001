import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import AlertItem from '@/components/dashboard/AlertItem';
// IMPORT THE NEW COMPONENT
import { CreateDoctorDialog } from '@/components/dashboard/CreateDoctorDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, AlertTriangle, Activity, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalNurses: number;
  activeAlerts: number;
  criticalPatients: number;
}

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  is_acknowledged: boolean;
  patients: {
    room_number: string | null;
    profiles: {
      full_name: string;
    } | null;
  } | null;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    activeAlerts: 0,
    criticalPatients: 0,
  });
  
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchDashboardData = useCallback(async (showToast = false) => {
    if (showToast) setRefreshing(true);
    
    try {
      const [patientsRes, doctorsRes, nursesRes, alertsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['doctor', 'hospital_doctor', 'online_doctor']),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'nurse'),
        supabase.from('alerts')
          .select(`
            id, alert_type, severity, message, created_at, is_acknowledged,
            patients!alerts_patient_id_fkey(room_number, profiles!profile_id(full_name))
          `)
          .eq('is_acknowledged', false)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const alertsData = (alertsRes.data as unknown as Alert[]) || [];

      setStats({
        totalPatients: patientsRes.count || 0,
        totalDoctors: doctorsRes.count || 0,
        totalNurses: nursesRes.count || 0,
        activeAlerts: alertsData.length,
        criticalPatients: alertsData.filter(a => a.severity === 'critical').length,
      });

      setAlerts(alertsData);

      if (showToast) {
        toast({ title: "Dashboard updated" });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  // Initial fetch and Realtime Subscription
  useEffect(() => {
    fetchDashboardData();

    // Listen for new alerts in real-time
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          toast({
            title: "New Alert Received",
            description: "Dashboard has been updated.",
            variant: "destructive",
          });
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData, toast]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    // Optimistic update
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setStats(prev => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));

    try {
      await supabase
        .from('alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId);
      
      toast({ title: 'Alert acknowledged' });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      fetchDashboardData(); // Revert on error
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and staff management</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            {/* The new component is used here */}
            <CreateDoctorDialog onSuccess={() => fetchDashboardData(true)} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            icon={<Users className="h-6 w-6" />} 
            label="Total Staff" 
            value={stats.totalDoctors + stats.totalNurses} 
            subtext={`${stats.totalDoctors} doctors, ${stats.totalNurses} nurses`}
          />
          <StatsCard 
            icon={<Heart className="h-6 w-6" />} 
            label="Total Patients" 
            value={stats.totalPatients} 
            subtext={stats.criticalPatients > 0 ? `${stats.criticalPatients} critical` : 'All stable'}
            variant={stats.criticalPatients > 0 ? 'danger' : 'success'}
          />
          <StatsCard 
            icon={<AlertTriangle className="h-6 w-6" />} 
            label="Active Alerts" 
            value={stats.activeAlerts}
            variant={stats.activeAlerts > 0 ? 'warning' : 'success'}
          />
          <StatsCard 
            icon={<Activity className="h-6 w-6" />} 
            label="System Status" 
            value="Online"
            subtext="All systems operational"
            variant="success"
          />
        </div>

        {/* Recent Alerts */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Recent Critical Alerts
              </CardTitle>
              {stats.activeAlerts > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
              )}
            </div>
            <CardDescription>Alerts requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No active alerts
              </div>
            ) : (
              alerts.map(alert => (
                <AlertItem
                  key={alert.id}
                  id={alert.id}
                  patientName={alert.patients?.profiles?.full_name || 'Unknown Patient'}
                  room={alert.patients?.room_number || 'N/A'}
                  alertType={alert.alert_type as any}
                  severity={alert.severity as any}
                  message={alert.message}
                  timestamp={new Date(alert.created_at)}
                  isAcknowledged={alert.is_acknowledged}
                  onAcknowledge={() => handleAcknowledgeAlert(alert.id)}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}