import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Stethoscope, Clock, Calendar as CalendarIcon, CreditCard, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  hospital_affiliation: string | null;
  consultation_price: number | null;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'online' | 'in_person'>('online');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots();
    }
  }, [selectedDate]);

  const fetchDoctor = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
          consultation_price,
          hospital_affiliation,
          profiles!doctor_profiles_profile_id_fkey (
            id,
            full_name,
            specialization
          )
        `)
        .eq('profile_id', doctorId)
        .single();

      if (error) throw error;

      setDoctor({
        id: data.profiles.id,
        full_name: data.profiles.full_name,
        specialization: data.profiles.specialization || 'General Medicine',
        hospital_affiliation: data.hospital_affiliation,
        consultation_price: data.consultation_price
      });
    } catch (error: any) {
      console.error('Error fetching doctor:', error);
      toast({ title: 'Error', description: 'Failed to load doctor information', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    // Mock available time slots - in real app, this would come from doctor's availability
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        // Mock some slots as unavailable
        const available = Math.random() > 0.3; // 70% available
        slots.push({ time: timeString, available });
      }
    }

    setAvailableSlots(slots);
  };

  const handleBookAppointment = async () => {
    if (!user || !doctor || !selectedDate || !selectedTime) return;

    setBooking(true);
    try {
      // Get patient record
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        toast({ title: 'Error', description: 'Patient profile not found', variant: 'destructive' });
        return;
      }

      // Create appointment
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          doctor_id: doctor.id,
          appointment_type: appointmentType,
          scheduled_at: appointmentDateTime.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // If online appointment, create consultation
      if (appointmentType === 'online') {
        const { error: consultationError } = await supabase
          .from('consultations')
          .insert({
            appointment_id: appointment.id,
            patient_id: patient.id,
            doctor_id: doctor.id,
            status: 'scheduled'
          });

        if (consultationError) throw consultationError;
      }

      toast({ title: 'Success', description: 'Appointment booked successfully!' });
      navigate('/patient/appointments');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setBooking(false);
    }
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

  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Doctor not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/browse-doctors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Book Appointment</h1>
            <p className="text-muted-foreground mt-1">Schedule your consultation</p>
          </div>
        </div>

        {/* Doctor Info */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {doctor.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{doctor.full_name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Stethoscope className="h-4 w-4" />
                  {doctor.specialization}
                </div>
                {doctor.hospital_affiliation && (
                  <p className="text-sm text-muted-foreground">{doctor.hospital_affiliation}</p>
                )}
              </div>
              {doctor.consultation_price && (
                <div className="ml-auto">
                  <Badge variant="secondary" className="text-sm">
                    ${doctor.consultation_price}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className="text-xs"
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Type */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Appointment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={appointmentType} onValueChange={(value: 'online' | 'in_person') => setAppointmentType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Online Consultation (Video Call)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in_person" id="in_person" />
                <Label htmlFor="in_person" className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  In-Person Visit
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Booking Summary & Payment */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && selectedTime && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{selectedDate.toLocaleDateString()} at {selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span>{appointmentType === 'online' ? 'Online Consultation' : 'In-Person Visit'}</span>
                </div>
                {doctor.consultation_price && (
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${doctor.consultation_price}</span>
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!selectedDate || !selectedTime || booking}
              onClick={handleBookAppointment}
            >
              {booking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {booking ? 'Booking...' : 'Confirm & Pay'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}