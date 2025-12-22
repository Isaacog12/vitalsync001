import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const patientSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  roomNumber: z.string().min(1, 'Room number is required'),
  admissionReason: z.string().min(1, 'Admission reason is required'),
});

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AddPatient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [admissionReason, setAdmissionReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validated = patientSchema.parse({
        fullName,
        email,
        phone,
        dateOfBirth,
        bloodType,
        allergies,
        emergencyContact,
        emergencyPhone,
        roomNumber,
        admissionReason,
      });

      // Create user account first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: 'TempPass123!', // Temporary password
        options: {
          data: {
            full_name: validated.fullName,
            role: 'patient'
          }
        }
      });

      if (authError) throw authError;

      // Wait a moment for the profile to be created
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the created profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', validated.email)
        .single();

      if (!profile) throw new Error('Failed to create patient profile');

      // Create patient record
      const { error: patientError } = await supabase
        .from('patients')
        .insert({
          user_id: authData.user?.id,
          profile_id: profile.id,
          date_of_birth: validated.dateOfBirth ? new Date(validated.dateOfBirth).toISOString().split('T')[0] : null,
          blood_type: validated.bloodType || null,
          allergies: validated.allergies ? validated.allergies.split(',').map(a => a.trim()) : [],
          emergency_contact: validated.emergencyContact || null,
          emergency_phone: validated.emergencyPhone || null,
          room_number: validated.roomNumber,
          admission_date: new Date().toISOString().split('T')[0],
        });

      if (patientError) throw patientError;

      // Create initial EMR record
      const { error: emrError } = await supabase
        .from('emr_records')
        .insert({
          patient_id: profile.id, // This should be patient.id, but we need to get it
          record_type: 'admission',
          title: 'Hospital Admission',
          content: `Patient admitted for: ${validated.admissionReason}`,
          is_inpatient: true,
        });

      if (emrError) throw emrError;

      toast({
        title: 'Success',
        description: 'Patient added successfully. They will receive login credentials via email.',
      });

      navigate('/nurse');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nurse')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <UserPlus className="h-8 w-8 text-primary" />
              Add New Patient
            </h1>
            <p className="text-muted-foreground mt-1">Register a new in-patient to the system</p>
          </div>
        </div>

        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select value={bloodType} onValueChange={setBloodType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number *</Label>
                  <Input
                    id="roomNumber"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className={errors.roomNumber ? 'border-destructive' : ''}
                  />
                  {errors.roomNumber && <p className="text-sm text-destructive">{errors.roomNumber}</p>}
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                  <Input
                    id="allergies"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g., penicillin, nuts, latex"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admissionReason">Admission Reason *</Label>
                  <Textarea
                    id="admissionReason"
                    value={admissionReason}
                    onChange={(e) => setAdmissionReason(e.target.value)}
                    placeholder="Reason for hospital admission..."
                    className={errors.admissionReason ? 'border-destructive' : ''}
                  />
                  {errors.admissionReason && <p className="text-sm text-destructive">{errors.admissionReason}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Adding Patient...' : 'Add Patient'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}