import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  User,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Consultation {
  id: string;
  status: string;
  started_at: string | null;
  doctor: {
    full_name: string;
    specialization: string | null;
  } | null;
}

export default function Teleconsultation() {
  const { consultationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [notes, setNotes] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (consultationId) {
      fetchConsultation();
    }
  }, [consultationId]);

  const fetchConsultation = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          status,
          started_at,
          profiles!consultations_doctor_id_fkey (
            full_name,
            specialization
          )
        `)
        .eq('id', consultationId)
        .single();

      if (error) throw error;

      setConsultation({
        id: data.id,
        status: data.status,
        started_at: data.started_at,
        doctor: data.profiles ? {
          full_name: data.profiles.full_name,
          specialization: data.profiles.specialization
        } : null
      });
    } catch (error: any) {
      console.error('Error fetching consultation:', error);
      toast({ title: 'Error', description: 'Failed to load consultation', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartCall = async () => {
    if (!consultation) return;

    try {
      // Update consultation status to in_progress
      const { error } = await supabase
        .from('consultations')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', consultation.id);

      if (error) throw error;

      setIsConnected(true);
      setConsultation(prev => prev ? { ...prev, status: 'in_progress', started_at: new Date().toISOString() } : null);

      toast({ title: 'Call Started', description: 'You are now connected to your doctor' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEndCall = async () => {
    if (!consultation) return;

    try {
      // Update consultation status to completed
      const { error } = await supabase
        .from('consultations')
        .update({
          status: 'completed'
        })
        .eq('id', consultation.id);

      if (error) throw error;

      setIsConnected(false);
      setConsultation(prev => prev ? { ...prev, status: 'completed' } : null);

      toast({ title: 'Call Ended', description: 'Consultation completed successfully' });
      navigate('/patient/appointments');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSaveNotes = async () => {
    if (!consultation || !notes.trim()) return;

    try {
      // Update consultation with notes
      const { error } = await supabase
        .from('consultations')
        .update({
          consultation_notes: notes
        })
        .eq('id', consultation.id);

      if (error) throw error;

      toast({ title: 'Notes Saved', description: 'Your consultation notes have been saved' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!consultation) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Consultation not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/appointments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Video className="h-8 w-8 text-primary" />
              Teleconsultation
            </h1>
            <p className="text-muted-foreground mt-1">
              Video call with {consultation.doctor?.full_name || 'your doctor'}
            </p>
          </div>
          <Badge
            className={`ml-auto ${
              consultation.status === 'in_progress'
                ? 'bg-green-500'
                : consultation.status === 'completed'
                ? 'bg-blue-500'
                : 'bg-yellow-500'
            } text-white`}
          >
            {consultation.status === 'in_progress' ? 'In Progress' :
             consultation.status === 'completed' ? 'Completed' : 'Scheduled'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Call Area */}
          <div className="lg:col-span-2">
            <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Consultation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                  {isConnected ? (
                    <>
                      {/* Mock video interface */}
                      <div className="text-center text-white">
                        <div className="mb-4">
                          <Avatar className="h-24 w-24 mx-auto">
                            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                              {consultation.doctor?.full_name.split(' ').map(n => n[0]).join('') || 'D'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {consultation.doctor?.full_name || 'Doctor'}
                        </h3>
                        <p className="text-gray-300">
                          {consultation.doctor?.specialization || 'Physician'}
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">Connected</span>
                        </div>
                      </div>

                      {/* Patient's self view (small) */}
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Video className="h-16 w-16 mx-auto mb-4" />
                      <p>Click "Start Call" to begin your consultation</p>
                    </div>
                  )}
                </div>

                {/* Call Controls */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant={videoEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    disabled={!isConnected}
                  >
                    {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant={audioEnabled ? "default" : "destructive"}
                    size="icon"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    disabled={!isConnected}
                  >
                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>

                  {!isConnected && consultation.status !== 'completed' ? (
                    <Button onClick={handleStartCall} className="px-6">
                      <Video className="h-4 w-4 mr-2" />
                      Start Call
                    </Button>
                  ) : (
                    <Button variant="destructive" onClick={handleEndCall} className="px-6">
                      <Phone className="h-4 w-4 mr-2" />
                      End Call
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowChat(!showChat)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Consultation Info */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Session Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-medium">{consultation.doctor?.full_name || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{consultation.doctor?.specialization || 'Not specified'}</p>
                </div>
                {consultation.started_at && (
                  <div>
                    <p className="text-sm text-muted-foreground">Started</p>
                    <p className="font-medium">
                      {new Date(consultation.started_at).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-primary/20 bg-card/60 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Consultation Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes about this consultation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-32"
                />
                <Button
                  onClick={handleSaveNotes}
                  className="w-full mt-4"
                  disabled={!notes.trim()}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}