import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import AlertItem from '@/components/dashboard/AlertItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Heart, UserPlus, AlertTriangle, Stethoscope, Activity, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    fullName: '',
    email: '',
    password: '',
    department: '',
    specialization: '',
  });

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: newDoctor.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: newDoctor.fullName,
            role: 'doctor',
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Doctor account created',
        description: `Account for ${newDoctor.fullName} has been created successfully.`,
      });

      setDialogOpen(false);
      setNewDoctor({ fullName: '', email: '', password: '', department: '', specialization: '' });
    } catch (error: any) {
      toast({
        title: 'Failed to create account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const mockAlerts = [
    { id: '1', patientName: 'John Smith', room: '101', alertType: 'heart_rate' as const, severity: 'critical' as const, message: 'Heart rate exceeded 140 BPM', timestamp: new Date(Date.now() - 300000), isAcknowledged: false },
    { id: '2', patientName: 'Mary Johnson', room: '205', alertType: 'oxygen' as const, severity: 'high' as const, message: 'Oxygen saturation dropped to 89%', timestamp: new Date(Date.now() - 900000), isAcknowledged: false },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and staff management</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Doctor Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDoctor} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Dr. Jane Smith"
                    value={newDoctor.fullName}
                    onChange={e => setNewDoctor(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@vitalsync.com"
                    value={newDoctor.email}
                    onChange={e => setNewDoctor(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={newDoctor.password}
                    onChange={e => setNewDoctor(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newDoctor.department}
                    onValueChange={value => setNewDoctor(prev => ({ ...prev, department: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="general">General Medicine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" variant="hero" disabled={isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={<Users className="h-6 w-6" />} label="Total Staff" value={12} subtext="8 doctors, 4 nurses" trend={{ value: 8, label: 'this month' }} />
          <StatsCard icon={<Heart className="h-6 w-6" />} label="Active Patients" value={48} subtext="5 critical" trend={{ value: -2, label: 'from yesterday' }} />
          <StatsCard icon={<AlertTriangle className="h-6 w-6" />} label="Active Alerts" value={7} subtext="2 critical" />
          <StatsCard icon={<Activity className="h-6 w-6" />} label="Devices Online" value={156} subtext="98% uptime" trend={{ value: 2, label: 'this week' }} />
        </div>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Recent Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockAlerts.map(alert => (
              <AlertItem key={alert.id} {...alert} onAcknowledge={() => {}} />
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
