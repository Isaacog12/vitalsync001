import DashboardLayout from '@/components/layout/DashboardLayout';
import VitalCard from '@/components/dashboard/VitalCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Activity, Droplets, Thermometer, Phone, MessageSquare, User } from 'lucide-react';

export default function PatientDashboard() {
  const vitals = {
    heartRate: 78,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    oxygenSaturation: 98,
    temperature: 36.8,
    respiratoryRate: 16,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Health Dashboard</h1>
          <p className="text-muted-foreground">Your real-time health vitals from connected devices</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <VitalCard icon={<Heart className="h-5 w-5" />} label="Heart Rate" value={vitals.heartRate} unit="bpm" variant="heart" status="normal" trend="stable" />
          <VitalCard icon={<Activity className="h-5 w-5" />} label="Blood Pressure" value={`${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`} unit="mmHg" variant="bp" status="normal" trend="stable" />
          <VitalCard icon={<Droplets className="h-5 w-5" />} label="Oxygen Saturation" value={vitals.oxygenSaturation} unit="%" variant="oxygen" status="normal" trend="up" />
          <VitalCard icon={<Thermometer className="h-5 w-5" />} label="Temperature" value={vitals.temperature} unit="°C" variant="temp" status="normal" trend="stable" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Care Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">DS</div>
                  <div>
                    <p className="font-semibold">Dr. Sarah Mitchell</p>
                    <p className="text-sm text-muted-foreground">Cardiologist</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="secondary"><Phone className="h-4 w-4" /></Button>
                  <Button size="icon" variant="secondary"><MessageSquare className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">All vitals are within normal range. Keep up the good work!</p>
              <div className="flex items-center gap-2 text-success">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
                <span className="font-medium">All systems normal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
