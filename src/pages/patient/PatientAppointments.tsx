import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Video, MapPin, Loader2, Stethoscope, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Appointment {
  id: string;
  scheduled_at: string;
  appointment_type: 'online' | 'in_person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultation_id?: string;
  doctor: {
    full_name: string;
    specialization: string | null;
  } | null;
}

export default function PatientAppointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const fetchAppointments = async () => {
    setErrorMsg(null);
    try {
      // 1. Get patient ID first
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!patient) {
        console.warn("Patient profile not found for user:", user?.id);
        setLoading(false);
        return;
      }

      // 2. Fetch Appointments with simplified Joins
      // We use the alias 'doctor:' to make the data cleaner
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          appointment_type,
          status,
          consultations (
            id
          ),
          doctor:profiles!doctor_id (
            full_name,
            specialization
          )
        `)
        .eq('patient_id', patient.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      // 3. Transform Data
      const transformedAppointments: Appointment[] = (data || []).map((item: any) => {
        // Handle consultation array or object (Supabase returns array for 1:Many by default)
        const consultation = Array.isArray(item.consultations) 
          ? item.consultations[0] 
          : item.consultations;

        return {
          id: item.id,
          scheduled_at: item.scheduled_at,
          appointment_type: item.appointment_type,
          status: item.status,
          consultation_id: consultation?.id,
          doctor: item.doctor ? {
            full_name: item.doctor.full_name,
            specialization: item.doctor.specialization
          } : null
        };
      });

      setAppointments(transformedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'confirmed': return 'bg-green-500 hover:bg-green-600';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              My Appointments
            </h1>
            <p className="text-muted-foreground mt-1">View and manage your scheduled consultations</p>
          </div>
          <Button onClick={() => navigate('/patient/browse-doctors')} className="shadow-lg hover:shadow-xl transition-all">
            <Stethoscope className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load appointments: {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        {/* Appointments List */}
        {appointments.length === 0 && !loading && !errorMsg ? (
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-4">Schedule your first consultation to get started.</p>
              <Button onClick={() => navigate('/patient/browse-doctors')} variant="outline">
                Browse Doctors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <Card key={appointment.id} className="border-primary/20 bg-card/60 backdrop-blur-xl hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* Doctor Info Section */}
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold">
                          {appointment.doctor?.full_name ? appointment.doctor.full_name.split(' ').map(n => n[0]).join('') : 'DR'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-lg">
                          {appointment.doctor?.full_name || 'Doctor Not Assigned'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor?.specialization || 'General Medicine'}
                        </p>
                        
                        {/* Time & Type Details */}
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(appointment.scheduled_at)}
                          </div>
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(appointment.scheduled_at)}
                          </div>
                          <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md capitalize">
                            {appointment.appointment_type === 'online' ? (
                              <Video className="h-3.5 w-3.5" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5" />
                            )}
                            {appointment.appointment_type.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Action Section */}
                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <Badge className={`${getStatusColor(appointment.status)} text-white border-0 px-3 py-1`}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      
                      {isUpcoming(appointment.scheduled_at) && 
                       appointment.status === 'confirmed' && 
                       appointment.appointment_type === 'online' && (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => navigate(`/patient/teleconsultation/${appointment.consultation_id || appointment.id}`)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Call
                        </Button>
                      )}

                      {appointment.status === 'pending' && (
                        <span className="text-xs text-muted-foreground">Awaiting approval</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}