import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import VitalCard from '@/components/dashboard/VitalCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, Droplets, Thermometer, Wind, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Vital {
  id: string;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  oxygen_saturation: number | null;
  temperature: number | null;
  respiratory_rate: number | null;
  recorded_at: string;
}

export default function PatientVitals() {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestVital, setLatestVital] = useState<Vital | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchVitals();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('vitals-updates')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'vitals' }, (payload) => {
          const newVital = payload.new as Vital;
          setVitals(prev => [...prev, newVital]);
          setLatestVital(newVital);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const fetchVitals = async () => {
    try {
      // First get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (patient) {
        const { data, error } = await supabase
          .from('vitals')
          .select('*')
          .eq('patient_id', patient.id)
          .order('recorded_at', { ascending: false })
          .limit(24);

        if (error) throw error;
        setVitals(data || []);
        if (data && data.length > 0) {
          setLatestVital(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching vitals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo if no real vitals
  const displayVital = latestVital || {
    heart_rate: 78,
    blood_pressure_systolic: 120,
    blood_pressure_diastolic: 80,
    oxygen_saturation: 98,
    temperature: 36.8,
    respiratory_rate: 16,
  };

  // Chart data
  const chartData = vitals.length > 0
    ? vitals.slice().reverse().map((v, i) => ({
        time: i + 1,
        heartRate: v.heart_rate,
        oxygen: v.oxygen_saturation,
      }))
    : Array.from({ length: 12 }, (_, i) => ({
        time: i + 1,
        heartRate: 75 + Math.floor(Math.random() * 10),
        oxygen: 96 + Math.floor(Math.random() * 3),
      }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Vitals</h1>
          <p className="text-muted-foreground">Real-time health data from your connected devices</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <VitalCard
                icon={<Heart className="h-5 w-5" />}
                label="Heart Rate"
                value={displayVital.heart_rate || 0}
                unit="bpm"
                variant="heart"
                status="normal"
                trend="stable"
              />
              <VitalCard
                icon={<Activity className="h-5 w-5" />}
                label="Blood Pressure"
                value={`${displayVital.blood_pressure_systolic || 0}/${displayVital.blood_pressure_diastolic || 0}`}
                unit="mmHg"
                variant="bp"
                status="normal"
                trend="stable"
              />
              <VitalCard
                icon={<Droplets className="h-5 w-5" />}
                label="Oxygen Saturation"
                value={displayVital.oxygen_saturation || 0}
                unit="%"
                variant="oxygen"
                status="normal"
                trend="up"
              />
              <VitalCard
                icon={<Thermometer className="h-5 w-5" />}
                label="Temperature"
                value={displayVital.temperature || 0}
                unit="°C"
                variant="temp"
                status="normal"
                trend="stable"
              />
              <VitalCard
                icon={<Wind className="h-5 w-5" />}
                label="Respiratory Rate"
                value={displayVital.respiratory_rate || 16}
                unit="breaths/min"
                status="normal"
                trend="stable"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Heart Rate & Oxygen Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        stroke="hsl(0, 84%, 60%)"
                        strokeWidth={2}
                        dot={false}
                        name="Heart Rate"
                      />
                      <Line
                        type="monotone"
                        dataKey="oxygen"
                        stroke="hsl(199, 89%, 48%)"
                        strokeWidth={2}
                        dot={false}
                        name="Oxygen %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
