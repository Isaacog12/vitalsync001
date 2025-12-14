import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientCard from '@/components/dashboard/PatientCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  room_number: string | null;
  profiles: {
    full_name: string;
  } | null;
}

export default function DoctorPatients() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, room_number, profiles:patients_profile_id_fkey (full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Mock vitals for demo
  const mockVitals = {
    heartRate: Math.floor(Math.random() * 40) + 60,
    bloodPressure: `${Math.floor(Math.random() * 40) + 100}/${Math.floor(Math.random() * 20) + 70}`,
    oxygenSaturation: Math.floor(Math.random() * 6) + 94,
    temperature: parseFloat((Math.random() * 2 + 36).toFixed(1)),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Patients</h1>
            <p className="text-muted-foreground">Monitor and manage your assigned patients</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            {patients.length} Patients
          </Badge>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No patients found</p>
              {patients.length === 0 && (
                <p className="text-sm">Patients will appear here when they register</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map((patient, i) => (
              <PatientCard
                key={patient.id}
                id={patient.id}
                name={patient.profiles?.full_name || 'Unknown'}
                age={Math.floor(Math.random() * 50) + 20}
                room={patient.room_number || 'N/A'}
                condition={i === 0 ? 'critical' : i === 1 ? 'monitoring' : 'stable'}
                vitals={mockVitals}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
