import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Stethoscope, 
  Clock, 
  Calendar as CalendarIcon, 
  CreditCard, 
  Loader2, 
  ArrowLeft, 
  Video, 
  MapPin, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  hospital_affiliation: string | null;
  consultation_price: number | null;
  image_url?: string; // Added hypothetical image field
}

interface TimeSlot {
  time: string;
  available: boolean;
  period: 'morning' | 'afternoon';
}

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  
  // Form State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'online' | 'in_person'>('online');
  const [reason, setReason] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (doctorId) fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) generateTimeSlots();
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
            specialization,
            avatar_url
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
        consultation_price: data.consultation_price,
        image_url: data.profiles.avatar_url
      });
    } catch (error: any) {
      console.error('Error fetching doctor:', error);
      toast({ title: 'Error', description: 'Failed to load doctor information', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    // In a real app, fetch this from DB based on selectedDate
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      // Skip lunch hour mock
      if (hour === 13) continue;

      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const available = Math.random() > 0.3;
        
        slots.push({ 
          time: timeString, 
          available,
          period: hour < 12 ? 'morning' : 'afternoon'
        });
      }
    }
    setAvailableSlots(slots);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleBookAppointment = async () => {
    if (!user || !doctor || !selectedDate || !selectedTime) {
      toast({ title: "Missing Information", description: "Please select a date and time.", variant: "destructive" });
      return;
    }

    setBooking(true);
    try {
      // 1. Get Patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) throw new Error("Patient profile not found");

      // 2. Format DateTime
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      // 3. Create Appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patient.id,
          doctor_id: doctor.id,
          appointment_type: appointmentType,
          scheduled_at: appointmentDateTime.toISOString(),
          status: 'pending',
          notes: reason // Assuming you added a 'notes' column to appointments table
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // 4. Create Consultation record if online
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

      toast({ 
        title: 'Booking Confirmed!', 
        description: `Your appointment with ${doctor.full_name} is set.` 
      });
      
      navigate('/patient/appointments');
    } catch (error: any) {
      toast({ title: 'Booking Failed', description: error.message, variant: 'destructive' });
    } finally {
      setBooking(false);
    }
  };

  // Memoize grouped slots for display
  const groupedSlots = useMemo(() => ({
    morning: availableSlots.filter(s => s.period === 'morning'),
    afternoon: availableSlots.filter(s => s.period === 'afternoon')
  }), [availableSlots]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading doctor's availability...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!doctor) return null;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Doctors
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Date & Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-8">
                <div className="flex justify-center md:justify-start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0,0,0,0);
                      return date < today || date.getDay() === 0 || date.getDay() === 6; // Disable weekends mock
                    }}
                    className="rounded-md border shadow-sm p-3"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Morning
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {groupedSlots.morning.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={cn(
                            "text-xs transition-all",
                            selectedTime === slot.time && "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Afternoon
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {groupedSlots.afternoon.map((slot) => (
                        <Button
                          key={slot.time}
                          variant={selectedTime === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={cn(
                            "text-xs transition-all",
                            selectedTime === slot.time && "ring-2 ring-primary ring-offset-2"
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. Appointment Type */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Consultation Type
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 hover:border-primary/50 transition-all flex items-start gap-4",
                    appointmentType === 'online' ? "border-primary bg-primary/5" : "border-border"
                  )}
                  onClick={() => setAppointmentType('online')}
                >
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Online Video Call</h3>
                    <p className="text-sm text-muted-foreground mt-1">Consult with the doctor remotely via secure video.</p>
                  </div>
                  {appointmentType === 'online' && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                </div>

                <div 
                  className={cn(
                    "cursor-pointer rounded-xl border-2 p-4 hover:border-primary/50 transition-all flex items-start gap-4",
                    appointmentType === 'in_person' ? "border-primary bg-primary/5" : "border-border"
                  )}
                  onClick={() => setAppointmentType('in_person')}
                >
                  <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">In-Person Visit</h3>
                    <p className="text-sm text-muted-foreground mt-1">Visit the doctor at the affiliated hospital.</p>
                  </div>
                  {appointmentType === 'in_person' && <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />}
                </div>
              </CardContent>
            </Card>

            {/* 3. Reason for Visit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Reason for Visit
                </CardTitle>
                <CardDescription>Please describe your symptoms or reason for consultation (Optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="E.g., I've been having severe headaches for 3 days..." 
                  className="min-h-[100px]"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Summary & Confirmation */}
          <div className="space-y-6">
            <Card className="sticky top-6 border-l-4 border-l-primary shadow-lg">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Doctor Details */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src={doctor.image_url} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {doctor.full_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{doctor.full_name}</p>
                    <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                    {doctor.hospital_affiliation && (
                      <p className="text-xs text-muted-foreground mt-0.5">{doctor.hospital_affiliation}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Selected Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" /> Date
                    </span>
                    <span className="font-medium">
                      {selectedDate?.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Time
                    </span>
                    <span className={cn("font-medium", !selectedTime && "text-muted-foreground italic")}>
                      {selectedTime || "Select a time"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Fee
                    </span>
                    <span className="font-medium text-lg">
                      ${doctor.consultation_price}
                    </span>
                  </div>
                </div>

                {/* Action */}
                <Button 
                  className="w-full h-11 text-base shadow-lg hover:shadow-xl transition-all" 
                  onClick={handleBookAppointment}
                  disabled={!selectedDate || !selectedTime || booking}
                >
                  {booking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  By booking, you agree to our terms of service and cancellation policy.
                </p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}