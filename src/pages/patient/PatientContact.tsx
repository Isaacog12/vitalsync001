import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Video, MessageSquare, AlertTriangle, Stethoscope, Mail, Building, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string | null;
  email: string;
  phone: string | null;
  department: string | null;
}

export default function PatientContact() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAssignedDoctor();
    }
  }, [user?.id]);

  const fetchAssignedDoctor = async () => {
    try {
      // Get patient's assigned doctor
      const { data: patientData } = await supabase
        .from('patients')
        .select('assigned_doctor_id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (patientData?.assigned_doctor_id) {
        const { data: doctorData } = await supabase
          .from('profiles')
          .select('id, full_name, specialization, email, phone, department')
          .eq('id', patientData.assigned_doctor_id)
          .maybeSingle();

        if (doctorData) setDoctor(doctorData);
      }
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const handleMessage = () => {
    navigate('/patient/messages');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Your Doctor</h1>
          <p className="text-muted-foreground">Get in touch with your care team</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Your Assigned Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {doctor ? (
                  <>
                    <div className="flex items-start gap-4 mb-6">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {getInitials(doctor.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-xl font-semibold">{doctor.full_name}</p>
                        <p className="text-muted-foreground">{doctor.specialization || 'General Physician'}</p>
                        
                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{doctor.email}</span>
                          </div>
                          {doctor.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{doctor.phone}</span>
                            </div>
                          )}
                          {doctor.department && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-3.5 w-3.5" />
                              <span>{doctor.department}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <Button className="flex-col h-auto py-4" onClick={handleMessage}>
                        <MessageSquare className="h-6 w-6 mb-2" />
                        <span>Message</span>
                      </Button>
                      {doctor.phone && (
                        <Button variant="secondary" className="flex-col h-auto py-4" asChild>
                          <a href={`tel:${doctor.phone}`}>
                            <Phone className="h-6 w-6 mb-2" />
                            <span>Call</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="secondary" className="flex-col h-auto py-4" onClick={() => navigate('/patient/browse-doctors')}>
                        <Video className="h-6 w-6 mb-2" />
                        <span>Video</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground mb-4">No doctor assigned yet</p>
                    <Button onClick={() => navigate('/patient/browse-doctors')}>
                      Browse Doctors
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you're experiencing a medical emergency, please contact emergency services immediately.
                </p>
                <div className="space-y-3">
                  <Button variant="destructive" className="w-full" size="lg" asChild>
                    <a href="tel:911">
                      <Phone className="h-5 w-5 mr-2" />
                      Call Emergency (911)
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="secondary" className="flex-col h-auto py-6" onClick={() => navigate('/patient/appointments')}>
                    <span className="text-2xl mb-2">📅</span>
                    <span>Appointments</span>
                  </Button>
                  <Button variant="secondary" className="flex-col h-auto py-6" onClick={() => navigate('/patient/vitals')}>
                    <span className="text-2xl mb-2">❤️</span>
                    <span>View Vitals</span>
                  </Button>
                  <Button variant="secondary" className="flex-col h-auto py-6" onClick={handleMessage}>
                    <span className="text-2xl mb-2">💬</span>
                    <span>Messages</span>
                  </Button>
                  <Button variant="secondary" className="flex-col h-auto py-6" onClick={() => navigate('/patient/browse-doctors')}>
                    <span className="text-2xl mb-2">🔍</span>
                    <span>Find Doctor</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
