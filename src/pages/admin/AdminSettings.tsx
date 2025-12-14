import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Shield, Database } from 'lucide-react';

export default function AdminSettings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Alert Thresholds
              </CardTitle>
              <CardDescription>
                Configure when alerts are triggered based on vital readings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>High Heart Rate (BPM)</Label>
                  <Input type="number" defaultValue={120} />
                </div>
                <div className="space-y-2">
                  <Label>Low Heart Rate (BPM)</Label>
                  <Input type="number" defaultValue={50} />
                </div>
                <div className="space-y-2">
                  <Label>High Systolic BP (mmHg)</Label>
                  <Input type="number" defaultValue={140} />
                </div>
                <div className="space-y-2">
                  <Label>Low Oxygen Saturation (%)</Label>
                  <Input type="number" defaultValue={92} />
                </div>
                <div className="space-y-2">
                  <Label>High Temperature (°C)</Label>
                  <Input type="number" step="0.1" defaultValue={38.5} />
                </div>
                <div className="space-y-2">
                  <Label>Low Temperature (°C)</Label>
                  <Input type="number" step="0.1" defaultValue={35.5} />
                </div>
              </div>
              <Button className="mt-4">Save Thresholds</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage security and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for all staff accounts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-muted-foreground">Log all user actions</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">VitalSync v1.0.0</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Database Status</p>
                  <p className="font-medium text-success">Connected</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IoT Gateway</p>
                  <p className="font-medium text-success">Online</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Backup</p>
                  <p className="font-medium">Today, 03:00 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
