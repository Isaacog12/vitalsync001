import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import VitalCard from '@/components/dashboard/VitalCard';
import AIInsightsPanel from '@/components/ai/AIInsightsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Droplets, Thermometer, Phone, MessageSquare, User, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Vital {
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  oxygen_saturation: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
}

interface Doctor {
  full_name: string;
  specialization: string | null;
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vitals, setVitals] = useState<Vital | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
      
      // Real-time vitals subscription
      const channel = supabase
        .channel('dashboard-vitals')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vitals' }, (payload) => {
          setVitals(payload.new as Vital);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      // Get patient and their assigned doctor
      const { data: patient } = await supabase
        .from('patients')
        .select('id, assigned_doctor_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (patient) {
        // Fetch latest vitals
        const { data: vitalData } = await supabase
          .from('vitals')
          .select('*')
          .eq('patient_id', patient.id)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (vitalData) setVitals(vitalData);

        // Fetch assigned doctor
        if (patient.assigned_doctor_id) {
          const { data: doctorData } = await supabase
            .from('profiles')
            .select('full_name, specialization')
            .eq('id', patient.assigned_doctor_id)
            .maybeSingle();

          if (doctorData) setDoctor(doctorData);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVitalStatus = (type: string, value: number | null): 'normal' | 'warning' | 'critical' => {
    if (!value) return 'normal';
    switch (type) {
      case 'heart_rate':
        if (value < 50 || value > 120) return 'critical';
        if (value < 60 || value > 100) return 'warning';
        return 'normal';
      case 'oxygen':
        if (value < 90) return 'critical';
        if (value < 95) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const hasVitals = vitals && (vitals.heart_rate || vitals.oxygen_saturation);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl opacity-50" />
          <div className="relative">
            <h1 className="text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              Health Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Real-time health monitoring from connected devices</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30 animate-ping" />
            </div>
            <p className="text-muted-foreground font-mono text-sm">Loading health data...</p>
          </div>
        ) : (
          <>
            {/* Vitals Grid */}
            {hasVitals ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <VitalCard 
                  icon={<Heart className="h-5 w-5" />} 
                  label="Heart Rate" 
                  value={vitals?.heart_rate || '--'} 
                  unit="bpm" 
                  variant="heart" 
                  status={getVitalStatus('heart_rate', vitals?.heart_rate ?? null)} 
                  trend="stable" 
                />
                <VitalCard 
                  icon={<Activity className="h-5 w-5" />} 
                  label="Blood Pressure" 
                  value={vitals?.blood_pressure_systolic ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}` : '--/--'} 
                  unit="mmHg" 
                  variant="bp" 
                  status="normal" 
                  trend="stable" 
                />
                <VitalCard 
                  icon={<Droplets className="h-5 w-5" />} 
                  label="Oxygen Saturation" 
                  value={vitals?.oxygen_saturation || '--'} 
                  unit="%" 
                  variant="oxygen" 
                  status={getVitalStatus('oxygen', vitals?.oxygen_saturation ?? null)} 
                  trend="up" 
                />
                <VitalCard 
                  icon={<Thermometer className="h-5 w-5" />} 
                  label="Temperature" 
                  value={vitals?.temperature?.toFixed(1) || '--'} 
                  unit="°C" 
                  variant="temp" 
                  status="normal" 
                  trend="stable" 
                />
              </div>
            ) : (
              <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="p-4 rounded-full bg-primary/10 text-primary">
                    <Activity className="h-10 w-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-display font-semibold">No Vital Data</h3>
                    <p className="text-muted-foreground text-sm">Connect your monitoring devices to see real-time vitals</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Insights */}
              {hasVitals && (
                <AIInsightsPanel vitals={vitals ? {
                  heart_rate: vitals.heart_rate,
                  blood_pressure_systolic: vitals.blood_pressure_systolic,
                  blood_pressure_diastolic: vitals.blood_pressure_diastolic,
                  oxygen_saturation: vitals.oxygen_saturation,
                  temperature: vitals.temperature,
                  respiratory_rate: vitals.respiratory_rate,
                } : undefined} />
              )}

              {/* Care Team */}
              <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display">
                    <User className="h-5 w-5 text-primary" />
                    Your Care Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor ? (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center font-display font-bold text-lg">
                          {doctor.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold">{doctor.full_name}</p>
                          <p className="text-sm text-muted-foreground">{doctor.specialization || 'Physician'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="hover:shadow-glow"
                          onClick={() => navigate('/patient/contact')}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="secondary"
                          className="hover:shadow-glow"
                          onClick={() => navigate('/patient/messages')}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-background/40 border border-border/30 text-center">
                      <p className="text-muted-foreground">No doctor assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Health Status */}
              {!hasVitals && (
                <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
                  <CardHeader>
                    <CardTitle className="font-display">Health Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">Connect your health monitoring devices to receive AI-powered insights and real-time tracking.</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
                      <span className="font-medium text-sm">Awaiting device connection</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
