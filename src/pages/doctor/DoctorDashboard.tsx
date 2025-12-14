import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientCard from '@/components/dashboard/PatientCard';
import StatsCard from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, AlertTriangle, MessageSquare } from 'lucide-react';

export default function DoctorDashboard() {
  const mockPatients = [
    { id: '1', name: 'John Smith', age: 65, room: '101', condition: 'critical' as const, vitals: { heartRate: 142, bloodPressure: '180/110', oxygenSaturation: 91, temperature: 38.5 } },
    { id: '2', name: 'Mary Johnson', age: 45, room: '205', condition: 'monitoring' as const, vitals: { heartRate: 88, bloodPressure: '130/85', oxygenSaturation: 96, temperature: 37.2 } },
    { id: '3', name: 'Robert Davis', age: 72, room: '112', condition: 'stable' as const, vitals: { heartRate: 72, bloodPressure: '120/80', oxygenSaturation: 98, temperature: 36.8 } },
    { id: '4', name: 'Sarah Wilson', age: 38, room: '308', condition: 'stable' as const, vitals: { heartRate: 78, bloodPressure: '118/76', oxygenSaturation: 99, temperature: 36.6 } },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctor Dashboard</h1>
          <p className="text-muted-foreground">Monitor your patients and respond to alerts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard icon={<Users className="h-6 w-6" />} label="My Patients" value={12} subtext="Assigned to you" />
          <StatsCard icon={<Heart className="h-6 w-6" />} label="Critical" value={2} subtext="Needs attention" />
          <StatsCard icon={<AlertTriangle className="h-6 w-6" />} label="Pending Alerts" value={4} />
          <StatsCard icon={<MessageSquare className="h-6 w-6" />} label="Unread Messages" value={8} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {mockPatients.map(patient => (
                <PatientCard key={patient.id} {...patient} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
