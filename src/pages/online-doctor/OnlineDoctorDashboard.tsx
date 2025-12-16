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
  Video,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Clock,
  Users,
  Smartphone,
} from 'lucide-react';

interface Consultation {
  id: string;
  status: string;
  scheduled_at?: string;
  patient_id: string;
}

export default function OnlineDoctorDashboard() {
  const { profile } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduledCount = consultations.filter(c => c.status === 'scheduled').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome, Dr. {profile?.full_name?.split(' ')[1] || 'Doctor'}
            </h1>
            <p className="text-muted-foreground">Online Doctor Dashboard - Teleconsultation Portal</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-primary/50">
              <Calendar className="mr-2 h-4 w-4" />
              My Schedule
            </Button>
            <Button className="gradient-primary text-primary-foreground">
              <Video className="mr-2 h-4 w-4" />
              Start Video Call
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Scheduled Consultations"
            value={scheduledCount}
            icon={<Calendar className="h-5 w-5" />}
            variant="warning"
          />
          <StatsCard
            label="Completed Today"
            value={completedCount}
            icon={<Video className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            label="Earnings Today"
            value="$450"
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: 12, label: 'from yesterday' }}
            variant="success"
          />
          <StatsCard
            label="Patient Messages"
            value={8}
            icon={<MessageSquare className="h-5 w-5" />}
            variant="default"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Consultations */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Upcoming Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : consultations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No upcoming consultations</div>
              ) : (
                <div className="space-y-3">
                  {consultations.slice(0, 5).map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Patient Consultation
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {consultation.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            consultation.status === 'scheduled'
                              ? 'border-amber-500/50 text-amber-400'
                              : consultation.status === 'completed'
                              ? 'border-emerald-500/50 text-emerald-400'
                              : 'border-muted'
                          }
                        >
                          {consultation.status}
                        </Badge>
                        <Button size="sm" className="gradient-primary text-primary-foreground">
                          <Video className="h-4 w-4 mr-1" />
                          Join
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

        {/* Consultation Price Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Video className="h-6 w-6 text-cyan-400" />
                <span>Video Consult</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6 text-violet-400" />
                <span>Prescribe</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <DollarSign className="h-6 w-6 text-emerald-400" />
                <span>Set Pricing</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Users className="h-6 w-6 text-amber-400" />
                <span>Patient EMR</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
