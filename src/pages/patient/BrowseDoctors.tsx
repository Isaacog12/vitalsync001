import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Search, Star, Clock, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  hospital_affiliation: string | null;
  consultation_price: number | null;
  rating: number;
  experience_years: number;
}

const specialties = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
  'Urology'
];

export default function BrowseDoctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log("Fetching doctors...");
      
      let query = supabase
        .from('doctor_profiles')
        .select(`
          id,
          consultation_price,
          specializations,
          hospital_affiliation,
          is_verified,
          profiles!doctor_profiles_profile_id_fkey (
            id,
            full_name,
            specialization
          )
        `);
        // REMOVED .eq('is_verified', true) FOR TESTING

      if (selectedSpecialty && selectedSpecialty !== 'all') {
        query = query.contains('specializations', [selectedSpecialty]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      console.log("Raw Data:", data); // Check console to see if data is coming back

      if (!data || data.length === 0) {
        console.warn("No doctors found in database.");
      }

      const transformedDoctors: Doctor[] = (data || []).map(item => ({
        id: item.profiles?.id, // Ensure we access the joined profile correctly
        full_name: item.profiles?.full_name || 'Unknown Doctor',
        specialization: item.profiles?.specialization || 'General Medicine',
        hospital_affiliation: item.hospital_affiliation,
        consultation_price: item.consultation_price,
        rating: 4.5,
        experience_years: 5,
      }));

      // Filter out any entries where profile join might have failed (null id)
      setDoctors(transformedDoctors.filter(d => d.id));
      
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      setErrorMsg(error.message || 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.full_name.toLowerCase().includes(search.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/patient/book-appointment/${doctorId}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            Find a Doctor
          </h1>
          <p className="text-muted-foreground mt-1">Browse available doctors and book your consultation</p>
        </div>

        {/* Search & Filter Bar */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search doctors by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
              </div>
              
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading doctors: {errorMsg}. Check console for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="border-primary/20 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-primary/10">
                    <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
                      {doctor.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{doctor.full_name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="h-3 w-3" />
                    {doctor.specialization}
                  </div>
                  {doctor.hospital_affiliation && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {doctor.hospital_affiliation}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium text-yellow-600">{doctor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {doctor.experience_years}y exp.
                    </div>
                  </div>

                  {doctor.consultation_price && (
                    <div className="text-center py-2">
                      <Badge variant="secondary" className="text-sm font-normal bg-primary/5 hover:bg-primary/10">
                        ${doctor.consultation_price} / visit
                      </Badge>
                    </div>
                  )}

                  <Button
                    className="w-full shadow-md hover:shadow-lg transition-all"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredDoctors.length === 0 && !loading && !errorMsg && (
          <Card className="border-dashed border-2 bg-transparent shadow-none">
            <CardContent className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search filters." : "No doctors have been added to the system yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}