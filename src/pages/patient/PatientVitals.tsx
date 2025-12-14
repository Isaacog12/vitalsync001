import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import VitalCard from '@/components/dashboard/VitalCard';
import AIInsightsPanel from '@/components/ai/AIInsightsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, Droplets, Thermometer, Wind, Loader2, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

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
          setVitals(prev => [newVital, ...prev].slice(0, 24));
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
      case 'temperature':
        if (value < 35 || value > 39) return 'critical';
        if (value < 36 || value > 37.5) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  // Chart data from real vitals
  const chartData = vitals.slice().reverse().map((v, i) => ({
    time: new Date(v.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    heartRate: v.heart_rate,
    oxygen: v.oxygen_saturation,
  }));

  const hasData = vitals.length > 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with cyber styling */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur-xl opacity-50" />
          <div className="relative">
            <h1 className="text-4xl font-display font-bold text-foreground flex items-center gap-3">
              <Zap className="h-8 w-8 text-primary animate-pulse" />
              Vital Signs Monitor
            </h1>
            <p className="text-muted-foreground mt-1">Real-time biometric data from connected devices</p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/30 animate-ping" />
            </div>
            <p className="text-muted-foreground font-mono text-sm">Initializing biometric sensors...</p>
          </div>
        ) : !hasData ? (
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Activity className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-display font-semibold">No Vital Data Available</h3>
                <p className="text-muted-foreground mt-1">Connect your health monitoring devices to start tracking</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Vital Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <VitalCard
                icon={<Heart className="h-5 w-5" />}
                label="Heart Rate"
                value={latestVital?.heart_rate || '--'}
                unit="bpm"
                variant="heart"
                status={getVitalStatus('heart_rate', latestVital?.heart_rate ?? null)}
                trend="stable"
              />
              <VitalCard
                icon={<Activity className="h-5 w-5" />}
                label="Blood Pressure"
                value={latestVital?.blood_pressure_systolic ? `${latestVital.blood_pressure_systolic}/${latestVital.blood_pressure_diastolic}` : '--/--'}
                unit="mmHg"
                variant="bp"
                status="normal"
                trend="stable"
              />
              <VitalCard
                icon={<Droplets className="h-5 w-5" />}
                label="Oxygen Saturation"
                value={latestVital?.oxygen_saturation || '--'}
                unit="%"
                variant="oxygen"
                status={getVitalStatus('oxygen', latestVital?.oxygen_saturation ?? null)}
                trend="up"
              />
              <VitalCard
                icon={<Thermometer className="h-5 w-5" />}
                label="Temperature"
                value={latestVital?.temperature?.toFixed(1) || '--'}
                unit="°C"
                variant="temp"
                status={getVitalStatus('temperature', latestVital?.temperature ?? null)}
                trend="stable"
              />
              <VitalCard
                icon={<Wind className="h-5 w-5" />}
                label="Respiratory Rate"
                value={latestVital?.respiratory_rate || '--'}
                unit="breaths/min"
                status="normal"
                trend="stable"
              />
            </div>

            {/* AI Insights Panel */}
            <AIInsightsPanel 
              vitals={latestVital ? {
                heart_rate: latestVital.heart_rate,
                blood_pressure_systolic: latestVital.blood_pressure_systolic,
                blood_pressure_diastolic: latestVital.blood_pressure_diastolic,
                oxygen_saturation: latestVital.oxygen_saturation,
                temperature: latestVital.temperature,
                respiratory_rate: latestVital.respiratory_rate,
              } : undefined}
            />

            {/* Trend Chart */}
            {chartData.length > 1 && (
              <Card className="border-primary/20 bg-card/60 backdrop-blur-xl overflow-hidden">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Vital Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(350, 100%, 60%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(350, 100%, 60%)" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="oxygenGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(200, 100%, 55%)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(200, 100%, 55%)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                        <XAxis 
                          dataKey="time" 
                          className="text-xs fill-muted-foreground" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <YAxis 
                          className="text-xs" 
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem'
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="heartRate"
                          stroke="hsl(350, 100%, 60%)"
                          strokeWidth={2}
                          fill="url(#heartGradient)"
                          name="Heart Rate"
                        />
                        <Area
                          type="monotone"
                          dataKey="oxygen"
                          stroke="hsl(200, 100%, 55%)"
                          strokeWidth={2}
                          fill="url(#oxygenGradient)"
                          name="Oxygen %"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
