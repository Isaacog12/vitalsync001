import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import AIInsightsPanel from '@/components/ai/AIInsightsPanel';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  Activity,
  Bell,
  FileText,
  Stethoscope,
  BedDouble,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface Patient {
  id: string;
  room_number: string | null;
  profiles: {
    full_name: string;
  } | null;
}

export default function HospitalDoctorDashboard() {
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alertCount, setAlertCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientsRes, alertsRes] = await Promise.all([
        supabase
          .from('patients')
          .select('id, room_number, profiles(full_name)')
          .limit(10),
        supabase
          .from('alerts')
          .select('id')
          .eq('is_acknowledged', false),
      ]);

      if (patientsRes.data) setPatients(patientsRes.data as Patient[]);
      if (alertsRes.data) setAlertCount(alertsRes.data.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const inPatients = patients.filter(p => p.room_number);
  const outPatients = patients.filter(p => !p.room_number);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome, Dr. {profile?.full_name?.split(' ')[1] || 'Doctor'}
            </h1>
            <p className="text-muted-foreground">Hospital Doctor Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-primary/50">
              <FileText className="mr-2 h-4 w-4" />
              View EMR
            </Button>
            <Button className="gradient-primary text-primary-foreground">
              <Stethoscope className="mr-2 h-4 w-4" />
              Start Consultation
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="In-Patients"
            value={inPatients.length.toString()}
            icon={<BedDouble className="h-5 w-5" />}
            trend={{ value: 5, isPositive: true }}
            variant="primary"
          />
          <StatsCard
            title="Out-Patients"
            value={outPatients.length.toString()}
            icon={<UserCheck className="h-5 w-5" />}
            variant="secondary"
          />
          <StatsCard
            title="Active Alerts"
            value={alertCount.toString()}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant={alertCount > 0 ? 'danger' : 'success'}
          />
          <StatsCard
            title="Prescriptions Today"
            value="12"
            icon={<FileText className="h-5 w-5" />}
            variant="info"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* In-Patients List */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-primary" />
                In-Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : inPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No in-patients assigned</div>
              ) : (
                <div className="space-y-3">
                  {inPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary-foreground" />
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
                        <Badge variant="outline" className="border-primary/50">
                          In-Patient
                        </Badge>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <AIInsightsPanel />
        </div>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Activity className="h-6 w-6 text-cyan-400" />
                <span>Monitor Vitals</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6 text-violet-400" />
                <span>Prescribe</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <BedDouble className="h-6 w-6 text-emerald-400" />
                <span>Admit Patient</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Bell className="h-6 w-6 text-amber-400" />
                <span>View Alerts</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
