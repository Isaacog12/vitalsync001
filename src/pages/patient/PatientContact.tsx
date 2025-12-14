import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, Video, MessageSquare, AlertTriangle, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PatientContact() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Your Doctor</h1>
          <p className="text-muted-foreground">Get in touch with your care team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Your Assigned Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    SM
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">Dr. Sarah Mitchell</p>
                  <p className="text-muted-foreground">Cardiologist</p>
                  <p className="text-sm text-muted-foreground">Available Mon-Fri, 9AM-5PM</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button className="flex-col h-auto py-4" onClick={() => navigate('/patient/messages')}>
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span>Message</span>
                </Button>
                <Button variant="secondary" className="flex-col h-auto py-4">
                  <Phone className="h-6 w-6 mb-2" />
                  <span>Call</span>
                </Button>
                <Button variant="secondary" className="flex-col h-auto py-4">
                  <Video className="h-6 w-6 mb-2" />
                  <span>Video</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you're experiencing a medical emergency, please contact emergency services immediately.
              </p>
              <div className="space-y-3">
                <Button variant="destructive" className="w-full" size="lg">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Emergency (911)
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-5 w-5 mr-2" />
                  Nurse Station: (555) 123-4567
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="secondary" className="flex-col h-auto py-6">
                  <span className="text-2xl mb-2">💊</span>
                  <span>Request Medication</span>
                </Button>
                <Button variant="secondary" className="flex-col h-auto py-6">
                  <span className="text-2xl mb-2">🍽️</span>
                  <span>Order Meal</span>
                </Button>
                <Button variant="secondary" className="flex-col h-auto py-6">
                  <span className="text-2xl mb-2">🛎️</span>
                  <span>Call Nurse</span>
                </Button>
                <Button variant="secondary" className="flex-col h-auto py-6">
                  <span className="text-2xl mb-2">❓</span>
                  <span>Ask Question</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
