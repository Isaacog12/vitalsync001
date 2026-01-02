import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCw, Check, X, Loader2, UserCog, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ChangeRequest {
  id: string;
  patient_id: string;
  current_doctor_id: string | null;
  requested_doctor_id: string | null;
  reason: string | null;
  status: string;
  created_at: string;
  patient: {
    id: string;
    profile: {
      full_name: string;
      email: string;
    } | null;
  } | null;
  current_doctor: {
    full_name: string;
  } | null;
  requested_doctor: {
    full_name: string;
  } | null;
}

interface Doctor {
  id: string;
  full_name: string;
  specialization: string | null;
}

export default function DoctorChangeRequests() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch pending change requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('doctor_change_requests')
        .select(`
          id,
          patient_id,
          current_doctor_id,
          requested_doctor_id,
          reason,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch related data for each request
      const enrichedRequests = await Promise.all(
        (requestsData || []).map(async (request) => {
          // Get patient info
          const { data: patientData } = await supabase
            .from('patients')
            .select('id, profile_id')
            .eq('id', request.patient_id)
            .maybeSingle();

          let patientProfile = null;
          if (patientData?.profile_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', patientData.profile_id)
              .maybeSingle();
            patientProfile = profileData;
          }

          // Get current doctor
          let currentDoctor = null;
          if (request.current_doctor_id) {
            const { data: doctorData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', request.current_doctor_id)
              .maybeSingle();
            currentDoctor = doctorData;
          }

          // Get requested doctor
          let requestedDoctor = null;
          if (request.requested_doctor_id) {
            const { data: doctorData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', request.requested_doctor_id)
              .maybeSingle();
            requestedDoctor = doctorData;
          }

          return {
            ...request,
            patient: patientData ? { id: patientData.id, profile: patientProfile } : null,
            current_doctor: currentDoctor,
            requested_doctor: requestedDoctor,
          };
        })
      );

      setRequests(enrichedRequests);

      // Fetch available doctors
      const { data: doctorsData } = await supabase
        .from('profiles')
        .select('id, full_name, specialization')
        .in('role', ['hospital_doctor', 'online_doctor']);

      setDoctors(doctorsData || []);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load change requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const openActionDialog = (request: ChangeRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setSelectedDoctor(request.requested_doctor_id || '');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setActionType(null);
    setSelectedDoctor('');
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType || !profile) return;

    setProcessing(true);
    try {
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      
      // Update the change request
      const { error: updateError } = await supabase
        .from('doctor_change_requests')
        .update({
          status: newStatus,
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          requested_doctor_id: actionType === 'approve' ? selectedDoctor : selectedRequest.requested_doctor_id,
        })
        .eq('id', selectedRequest.id);

      if (updateError) throw updateError;

      // If approved, update the patient's assigned doctor
      if (actionType === 'approve' && selectedDoctor) {
        const { error: patientError } = await supabase
          .from('patients')
          .update({ assigned_doctor_id: selectedDoctor })
          .eq('id', selectedRequest.patient_id);

        if (patientError) throw patientError;
      }

      toast({
        title: actionType === 'approve' ? 'Request Approved' : 'Request Rejected',
        description: actionType === 'approve' 
          ? 'The patient has been assigned to the new doctor.' 
          : 'The doctor change request has been rejected.',
      });

      closeDialog();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process request',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/30">Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-500/10 text-red-600 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-8 w-8 text-primary" />
              Doctor Change Requests
            </h1>
            <p className="text-muted-foreground">Review and manage patient requests to change their assigned doctor</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {pendingCount > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-600">
                  {pendingCount} pending request{pendingCount > 1 ? 's' : ''} awaiting review
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No doctor change requests found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Current Doctor</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.patient?.profile?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{request.patient?.profile?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.current_doctor?.full_name || 'None assigned'}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm text-muted-foreground">
                          {request.reason || 'No reason provided'}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:bg-green-500/10"
                              onClick={() => openActionDialog(request, 'approve')}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-500/10"
                              onClick={() => openActionDialog(request, 'reject')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Select a new doctor to assign to this patient.'
                : 'Are you sure you want to reject this doctor change request?'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Patient:</span>{' '}
                {selectedRequest?.patient?.profile?.full_name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Current Doctor:</span>{' '}
                {selectedRequest?.current_doctor?.full_name || 'None'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Reason:</span>{' '}
                {selectedRequest?.reason || 'Not provided'}
              </p>
            </div>

            {actionType === 'approve' && (
              <div className="space-y-2">
                <Label>Assign New Doctor</Label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors
                      .filter(d => d.id !== selectedRequest?.current_doctor_id)
                      .map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.full_name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={processing || (actionType === 'approve' && !selectedDoctor)}
            >
              {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {actionType === 'approve' ? 'Approve & Assign' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
