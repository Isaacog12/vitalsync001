import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Users, AlertTriangle, Search, Filter, Eye, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Patient {
  id: string;
  user_id: string;
  room_number: string | null;
  blood_type: string | null;
  admission_date: string | null;
  condition: 'stable' | 'critical' | 'recovering' | null; // Added hypothetical field
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

export default function AdminPatients() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPatients();

    // Real-time subscription for new patients
    const channel = supabase
      .channel('public:patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*, profiles!patients_profile_id_fkey (full_name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
    } catch (error: any) {
      toast({ title: 'Error fetching patients', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const name = patient.profiles?.full_name?.toLowerCase() || '';
      const email = patient.profiles?.email?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = name.includes(query) || email.includes(query);
      const matchesFilter = filterStatus === 'all' 
        ? true 
        : filterStatus === 'admitted' 
          ? !!patient.room_number 
          : true;

      return matchesSearch && matchesFilter;
    });
  }, [patients, searchQuery, filterStatus]);

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P';

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Management</h1>
            <p className="text-muted-foreground mt-1">Directory of all registered patients and admission details.</p>
          </div>
          {/* Action Buttons could go here */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patients.length}</p>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Total Patients</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{patients.filter(p => p.room_number).length}</p>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Currently Admitted</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground uppercase font-medium tracking-wider">Critical Condition</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Patient Records</CardTitle>
              
              {/* Search and Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="admitted">Admitted Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[300px]">Patient</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Blood Type</TableHead>
                    <TableHead>Admitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton Loading State
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="space-y-1"><Skeleton className="h-4 w-[150px]" /><Skeleton className="h-3 w-[100px]" /></div></div></TableCell>
                        <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8 rounded-md ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredPatients.length === 0 ? (
                    // Empty State
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          {searchQuery ? (
                            <>
                              <Search className="h-8 w-8 mb-2 opacity-50" />
                              <p>No patients found matching "{searchQuery}"</p>
                            </>
                          ) : (
                            <>
                              <Users className="h-8 w-8 mb-2 opacity-50" />
                              <p>No patients registered yet.</p>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Patient Data
                    filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {getInitials(patient.profiles?.full_name || '')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm leading-none">{patient.profiles?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground mt-1">{patient.profiles?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.room_number ? (
                            <Badge variant="outline" className="font-mono">
                              {patient.room_number}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.blood_type ? (
                            <div className="flex items-center gap-1.5">
                              <Heart className="h-3 w-3 text-rose-500" />
                              <span className="font-medium text-sm">{patient.blood_type}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {patient.admission_date 
                            ? new Date(patient.admission_date).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric'
                              }) 
                            : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={
                              patient.condition === 'critical' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                              patient.room_number ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                              'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }
                          >
                            {patient.room_number ? 'Admitted' : 'Outpatient'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}