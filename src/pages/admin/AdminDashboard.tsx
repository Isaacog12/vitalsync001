import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import AlertItem from '@/components/dashboard/AlertItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Heart, UserPlus, AlertTriangle, Stethoscope, Activity, Loader2 } from 'lucide-react';
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
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    activeAlerts: 0,
    criticalPatients: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newDoctor, setNewDoctor] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    specialization: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [patientsRes, doctorsRes, nursesRes, alertsRes] = await Promise.all([
        supabase.from('patients').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }).in('role', ['doctor', 'hospital_doctor', 'online_doctor']),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'nurse'),
        supabase.from('alerts').select(`
          id, alert_type, severity, message, created_at, is_acknowledged,
          patients!alerts_patient_id_fkey(room_number, profiles!profile_id(full_name))
        `).eq('is_acknowledged', false).order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        totalPatients: patientsRes.count || 0,
        totalDoctors: doctorsRes.count || 0,
        totalNurses: nursesRes.count || 0,
        activeAlerts: alertsRes.data?.length || 0,
        criticalPatients: alertsRes.data?.filter(a => a.severity === 'critical').length || 0,
      });

      if (alertsRes.data) {
        setAlerts(alertsRes.data as Alert[]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: newDoctor.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: newDoctor.fullName,
            role: 'doctor',
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Doctor account created',
        description: `Account for ${newDoctor.fullName} has been created successfully.`,
      });

      setDialogOpen(false);
      setNewDoctor({ fullName: '', email: '', password: '', department: '', specialization: '' });
      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Failed to create account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await supabase
        .from('alerts')
        .update({ is_acknowledged: true })
        .eq('id', alertId);
      
      fetchDashboardData();
      toast({ title: 'Alert acknowledged' });
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and staff management</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Doctor Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDoctor} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. Jane Smith"
                    value={newDoctor.fullName}
                    onChange={e => setNewDoctor(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@vitalsync.com"
                    value={newDoctor.email}
                    onChange={e => setNewDoctor(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={newDoctor.password}
                    onChange={e => setNewDoctor(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newDoctor.department}
                    onValueChange={value => setNewDoctor(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="general">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Recent Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading...
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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