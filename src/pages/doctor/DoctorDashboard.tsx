import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientCard from '@/components/dashboard/PatientCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, AlertTriangle, MessageSquare, Loader2, Zap, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PatientWithVitals {
  id: string;
  name: string;
  age: number;
  room: string;
  condition: 'critical' | 'monitoring' | 'stable';
  vitals: {
    heartRate: number;
    bloodPressure: string;
    oxygenSaturation: number;
    temperature: number;
  };
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientWithVitals[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    critical: 0,
    pendingAlerts: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();

      // Real-time subscriptions
      const vitalsChannel = supabase
        .channel('doctor-vitals')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vitals' }, () => {
          fetchDashboardData();
        })
        .subscribe();

      const alertsChannel = supabase
        .channel('doctor-alerts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
          fetchDashboardData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(vitalsChannel);
        supabase.removeChannel(alertsChannel);
      };
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      // Get doctor profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch assigned patients with their latest vitals
      const { data: patientsData } = await supabase
        .from('patients')
        .select(`
          id,
          room_number,
          date_of_birth,
          profiles!patients_profile_id_fkey (full_name)
        `)
        .eq('assigned_doctor_id', profile.id);

      // Fetch unacknowledged alerts count
      const { count: alertsCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_acknowledged', false);

      // Fetch unread messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile.id)
        .eq('is_read', false);

      // Process patients with their vitals
      const processedPatients: PatientWithVitals[] = [];
      let criticalCount = 0;

      if (patientsData) {
        for (const patient of patientsData) {
          // Get latest vitals for this patient
          const { data: vitalsData } = await supabase
            .from('vitals')
            .select('*')
            .eq('patient_id', patient.id)
            .order('recorded_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Calculate age
          const birthDate = patient.date_of_birth ? new Date(patient.date_of_birth) : null;
          const age = birthDate ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

          // Determine condition based on vitals
          let condition: 'critical' | 'monitoring' | 'stable' = 'stable';
          if (vitalsData) {
            if (vitalsData.is_alert) {
              condition = 'critical';
              criticalCount++;
            } else if (
              (vitalsData.heart_rate && (vitalsData.heart_rate < 60 || vitalsData.heart_rate > 100)) ||
              (vitalsData.oxygen_saturation && vitalsData.oxygen_saturation < 95)
            ) {
              condition = 'monitoring';
            }
          }

          processedPatients.push({
            id: patient.id,
            name: patient.profiles?.full_name || 'Unknown',
            age,
            room: patient.room_number || 'N/A',
            condition,
            vitals: {
              heartRate: vitalsData?.heart_rate || 0,
              bloodPressure: vitalsData ? `${vitalsData.blood_pressure_systolic || 0}/${vitalsData.blood_pressure_diastolic || 0}` : '0/0',
              oxygenSaturation: vitalsData?.oxygen_saturation || 0,
              temperature: vitalsData?.temperature || 0,
            },
          });
        }
      }

      setPatients(processedPatients);
      setStats({
        totalPatients: processedPatients.length,
        critical: criticalCount,
        pendingAlerts: alertsCount || 0,
        unreadMessages: messagesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl opacity-50" />
          <div className="relative">
            <h1 className="text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              Command Center
            </h1>
            <p className="text-muted-foreground mt-1">Real-time patient monitoring and alerts</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30 animate-ping" />
            </div>
            <p className="text-muted-foreground font-mono text-sm">Initializing monitoring systems...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard 
                icon={<Users className="h-6 w-6" />} 
                label="My Patients" 
                value={stats.totalPatients} 
                subtext="Assigned to you" 
              />
              <StatsCard 
                icon={<Heart className="h-6 w-6" />} 
                label="Critical" 
                value={stats.critical} 
                subtext="Needs attention" 
                variant={stats.critical > 0 ? 'danger' : 'default'}
              />
              <StatsCard 
                icon={<AlertTriangle className="h-6 w-6" />} 
                label="Pending Alerts" 
                value={stats.pendingAlerts}
                variant={stats.pendingAlerts > 0 ? 'warning' : 'default'}
              />
              <StatsCard 
                icon={<MessageSquare className="h-6 w-6" />} 
                label="Unread Messages" 
                value={stats.unreadMessages} 
              />
            </div>

            {/* Patients Grid */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Your Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {patients.map(patient => (
                      <PatientCard key={patient.id} {...patient} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                      <Users className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-display font-semibold">No Patients Assigned</h3>
                      <p className="text-muted-foreground text-sm">Patients will appear here once assigned to you</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
