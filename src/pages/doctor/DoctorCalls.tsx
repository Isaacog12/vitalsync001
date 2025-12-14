import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Video, Phone, PhoneOff, Mic, MicOff, Camera, CameraOff } from 'lucide-react';
import { useState } from 'react';

export default function DoctorCalls() {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Consultations</h1>
          <p className="text-muted-foreground">Connect with patients via video call</p>
        </div>

        {!inCall ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['John Smith', 'Mary Johnson', 'Robert Davis'].map((name, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-sm text-muted-foreground">Room {101 + i}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => setInCall(true)}>
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                    <Button variant="secondary">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 relative">
              {/* Main video area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Video call in progress</p>
                  <p className="text-sm">Connected to John Smith</p>
                </div>
              </div>

              {/* Self view */}
              <div className="absolute bottom-4 right-4 w-48 aspect-video bg-card rounded-lg border border-border flex items-center justify-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    DR
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <Button
                  variant={micOn ? 'secondary' : 'destructive'}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setMicOn(!micOn)}
                >
                  {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant={cameraOn ? 'secondary' : 'destructive'}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setCameraOn(!cameraOn)}
                >
                  {cameraOn ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-14 w-14 rounded-full"
                  onClick={() => setInCall(false)}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
