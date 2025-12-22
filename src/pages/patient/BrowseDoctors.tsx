import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, Search, Star, Clock, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  hospital_affiliation: string | null;
  consultation_price: number | null;
  rating: number;
  experience_years: number;
  availability: any[];
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
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      let query = supabase
        .from('doctor_profiles')
        .select(`
          id,
          consultation_price,
          specializations,
          hospital_affiliation,
          profiles!doctor_profiles_profile_id_fkey (
            id,
            full_name,
            specialization
          )
        `)
        .eq('is_verified', true);

      if (selectedSpecialty) {
        query = query.contains('specializations', [selectedSpecialty]);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match interface
      const transformedDoctors: Doctor[] = (data || []).map(item => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name,
        specialization: item.profiles.specialization || 'General Medicine',
        hospital_affiliation: item.hospital_affiliation,
        consultation_price: item.consultation_price,
        rating: 4.5, // Mock rating
        experience_years: 5, // Mock experience
        availability: item.availability || []
      }));

      setDoctors(transformedDoctors);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            Find a Doctor
          </h1>
          <p className="text-muted-foreground mt-1">Browse available doctors and book your consultation</p>
        </div>

        {/* Filters */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search doctors by name or specialty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Doctors List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <Card key={doctor.id} className="border-primary/20 bg-card/60 backdrop-blur-xl hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {doctor.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{doctor.full_name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Stethoscope className="h-4 w-4" />
                    {doctor.specialization}
                  </div>
                  {doctor.hospital_affiliation && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {doctor.hospital_affiliation}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {doctor.experience_years} years exp.
                    </div>
                  </div>

                  {doctor.consultation_price && (
                    <div className="text-center">
                      <Badge variant="secondary" className="text-sm">
                        ${doctor.consultation_price} / consultation
                      </Badge>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredDoctors.length === 0 && !loading && (
          <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
            <CardContent className="text-center py-12">
              <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}