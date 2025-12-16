import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Pill,
  Package,
  CheckCircle,
  Clock,
  FileText,
  AlertTriangle,
  Search,
  Truck,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Prescription {
  id: string;
  diagnosis: string | null;
  instructions: string | null;
  status: string;
  medications: any;
  created_at: string;
}

export default function PharmacistDashboard() {
  const { profile } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) setPrescriptions(data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = prescriptions.filter(p => p.status === 'active').length;
  const dispensedCount = prescriptions.filter(p => p.status === 'dispensed').length;

  const handleDispense = async (id: string) => {
    try {
      await supabase
        .from('prescriptions')
        .update({ status: 'dispensed' })
        .eq('id', id);
      
      fetchPrescriptions();
    } catch (error) {
      console.error('Error dispensing prescription:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome, {profile?.full_name || 'Pharmacist'}
            </h1>
            <p className="text-muted-foreground">Pharmacy Management Dashboard</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-primary/50">
              <Package className="mr-2 h-4 w-4" />
              Inventory
            </Button>
            <Button className="gradient-primary text-primary-foreground">
              <Pill className="mr-2 h-4 w-4" />
              Process Order
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Pending Prescriptions"
            value={pendingCount}
            icon={<Clock className="h-5 w-5" />}
            variant={pendingCount > 0 ? 'warning' : 'success'}
          />
          <StatsCard
            label="Dispensed Today"
            value={dispensedCount}
            icon={<CheckCircle className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            label="Low Stock Items"
            value={3}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
          <StatsCard
            label="Orders Ready"
            value={5}
            icon={<Truck className="h-5 w-5" />}
            variant="warning"
          />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background/50"
          />
        </div>

        {/* Prescriptions List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Prescriptions Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No prescriptions found</div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          prescription.status === 'active'
                            ? 'bg-amber-500/20'
                            : 'bg-emerald-500/20'
                        }`}
                      >
                        <Pill
                          className={`h-5 w-5 ${
                            prescription.status === 'active'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {prescription.diagnosis || 'Prescription'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {prescription.instructions || 'No instructions'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={
                          prescription.status === 'active'
                            ? 'border-amber-500/50 text-amber-400'
                            : prescription.status === 'dispensed'
                            ? 'border-emerald-500/50 text-emerald-400'
                            : 'border-muted'
                        }
                      >
                        {prescription.status}
                      </Badge>
                      {prescription.status === 'active' && (
                        <Button
                          size="sm"
                          className="gradient-primary text-primary-foreground"
                          onClick={() => handleDispense(prescription.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Dispense
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Pill className="h-6 w-6 text-cyan-400" />
                <span>Verify Prescription</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Package className="h-6 w-6 text-violet-400" />
                <span>Check Stock</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Truck className="h-6 w-6 text-emerald-400" />
                <span>Mark Ready</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
                <span>Report Issue</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
