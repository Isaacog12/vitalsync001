import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Shield, Database, Save, RotateCcw, Loader2, CheckCircle2, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Default values constant
const DEFAULT_THRESHOLDS = {
  highHeartRate: 120,
  lowHeartRate: 50,
  highSystolicBP: 140,
  lowOxygenSat: 92,
  highTemp: 38.5,
  lowTemp: 35.5,
};

export default function AdminSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // State for Thresholds
  const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);

  // State for Security Settings
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: true,
    auditLog: true,
  });

  // Handle Input Changes
  const handleThresholdChange = (key: keyof typeof DEFAULT_THRESHOLDS, value: string) => {
    setThresholds(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  // Handle Save Logic with Validation
  const handleSaveThresholds = async () => {
    setSaving(true);

    // 1. Validation Logic
    if (thresholds.lowHeartRate >= thresholds.highHeartRate) {
      toast({ title: "Invalid Heart Rate", description: "Low limit must be lower than high limit.", variant: "destructive" });
      setSaving(false);
      return;
    }
    if (thresholds.lowTemp >= thresholds.highTemp) {
      toast({ title: "Invalid Temperature", description: "Low limit must be lower than high limit.", variant: "destructive" });
      setSaving(false);
      return;
    }

    // 2. Simulate API Call (Replace with supabase.from('settings').upsert(...) later)
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Configuration Saved",
      description: "Alert thresholds have been updated successfully.",
    });
    setSaving(false);
  };

  // Handle Reset
  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
    toast({ title: "Reset", description: "Values restored to system defaults." });
  };

  // Handle Security Toggles
  const toggleSecurity = (key: keyof typeof security) => {
    setSecurity(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      // Simulate auto-save for toggles
      toast({ 
        title: "Setting Updated", 
        description: `${key.replace(/([A-Z])/g, ' $1').trim()} is now ${newState[key] ? 'Enabled' : 'Disabled'}.` 
      });
      return newState;
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage system configuration and safety protocols</p>
          </div>
        </div>

        <div className="grid gap-6">
          
          {/* 1. Alert Thresholds Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Alert Thresholds
                  </CardTitle>
                  <CardDescription>
                    Define the vital sign limits that trigger automatic alerts.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Heart Rate (BPM)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="highHR">High Limit</Label>
                      <Input 
                        id="highHR" 
                        type="number" 
                        value={thresholds.highHeartRate} 
                        onChange={(e) => handleThresholdChange('highHeartRate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowHR">Low Limit</Label>
                      <Input 
                        id="lowHR" 
                        type="number" 
                        value={thresholds.lowHeartRate}
                        onChange={(e) => handleThresholdChange('lowHeartRate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Temperature (°C)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="highTemp">High Limit</Label>
                      <Input 
                        id="highTemp" 
                        type="number" 
                        step="0.1"
                        value={thresholds.highTemp}
                        onChange={(e) => handleThresholdChange('highTemp', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowTemp">Low Limit</Label>
                      <Input 
                        id="lowTemp" 
                        type="number" 
                        step="0.1"
                        value={thresholds.lowTemp}
                        onChange={(e) => handleThresholdChange('lowTemp', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Other Vitals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bp">Systolic BP Max</Label>
                      <Input 
                        id="bp" 
                        type="number" 
                        value={thresholds.highSystolicBP}
                        onChange={(e) => handleThresholdChange('highSystolicBP', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxy">Min SpO2 (%)</Label>
                      <Input 
                        id="oxy" 
                        type="number" 
                        value={thresholds.lowOxygenSat}
                        onChange={(e) => handleThresholdChange('lowOxygenSat', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 px-6 py-4">
              <Button onClick={handleSaveThresholds} disabled={saving} className="ml-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Thresholds
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* 2. Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage access controls and session security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Require 2FA for all staff accounts during login</p>
                </div>
                <Switch 
                  checked={security.twoFactor} 
                  onCheckedChange={() => toggleSecurity('twoFactor')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out inactive users after 15 minutes</p>
                </div>
                <Switch 
                  checked={security.sessionTimeout} 
                  onCheckedChange={() => toggleSecurity('sessionTimeout')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">Record all administrative actions for compliance</p>
                </div>
                <Switch 
                  checked={security.auditLog} 
                  onCheckedChange={() => toggleSecurity('auditLog')}
                />
              </div>
            </CardContent>
          </Card>

          {/* 3. System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex flex-col space-y-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Software Version</span>
                  <span className="font-semibold text-lg flex items-center gap-2">
                    v1.0.2
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Latest</span>
                  </span>
                </div>
                
                <div className="flex flex-col space-y-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Database Status</span>
                  <span className="font-semibold text-lg flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </span>
                </div>

                <div className="flex flex-col space-y-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">IoT Gateway</span>
                  <span className="font-semibold text-lg flex items-center gap-2 text-emerald-600">
                    <Server className="h-4 w-4" />
                    Online
                  </span>
                </div>

                <div className="flex flex-col space-y-2 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                  <span className="font-semibold text-lg">
                    Today, 03:00 AM
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}