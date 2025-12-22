import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Video, MapPin, Loader2, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user?.id]);

  const fetchAppointments = async () => {
    try {
      // Get patient record first
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!patient) return;

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          scheduled_at,
          appointment_type,
          status,
          consultations!appointments_id_fkey (
            id
          ),
          profiles!appointments_doctor_id_fkey (
            full_name,
            specialization
          )
        `)
        .eq('patient_id', patient.id)
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      const transformedAppointments: Appointment[] = (data || []).map(item => ({
        id: item.id,
        scheduled_at: item.scheduled_at,
        appointment_type: item.appointment_type,
        status: item.status,
        consultation_id: item.consultations?.id,
        doctor: item.profiles ? {
          full_name: item.profiles.full_name,
          specialization: item.profiles.specialization
        } : null
      }));

      setAppointments(transformedAppointments);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
          <Button onClick={() => navigate('/patient/browse-doctors')}>
            <Stethoscope className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
              <p className="text-muted-foreground mb-4">Schedule your first consultation with a doctor</p>
              <Button onClick={() => navigate('/patient/browse-doctors')}>
                Browse Doctors
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <Card key={appointment.id} className="border-primary/20 bg-card/60 backdrop-blur-xl">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {appointment.doctor && (
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {appointment.doctor.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">
                          {appointment.doctor?.full_name || 'Doctor Not Assigned'}
                        </h3>
                        <p className="text-muted-foreground">
                          {appointment.doctor?.specialization || 'Specialization not specified'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(appointment.scheduled_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.scheduled_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            {appointment.appointment_type === 'online' ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <MapPin className="h-4 w-4" />
                            )}
                            {appointment.appointment_type === 'online' ? 'Online' : 'In-Person'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={`${getStatusColor(appointment.status)} text-white`}
                      >
                        {getStatusText(appointment.status)}
                      </Badge>
                      {isUpcoming(appointment.scheduled_at) && appointment.status === 'confirmed' && appointment.appointment_type === 'online' && appointment.consultation_id && (
                        <Button
                          size="sm"
                          onClick={() => navigate(`/patient/teleconsultation/${appointment.consultation_id}`)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Join Call
                        </Button>
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