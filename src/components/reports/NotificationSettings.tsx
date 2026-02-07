import { useState } from "react";
import { Bell, Save, Loader2, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NotificationSettingsProps {
  profile: {
    email_reports_enabled?: boolean | null;
    notification_frequency?: string | null;
    budget_alert_threshold?: number | null;
    goal_reminder_enabled?: boolean | null;
  } | null;
  onSave: (settings: Partial<{
    email_reports_enabled: boolean;
    notification_frequency: string;
    budget_alert_threshold: number;
    goal_reminder_enabled: boolean;
  }>) => void;
  isUpdating?: boolean;
}

const NotificationSettings = ({ profile, onSave, isUpdating }: NotificationSettingsProps) => {
  const [settings, setSettings] = useState({
    email_reports_enabled: profile?.email_reports_enabled ?? true,
    notification_frequency: profile?.notification_frequency || "weekly",
    budget_alert_threshold: profile?.budget_alert_threshold || 80,
    goal_reminder_enabled: profile?.goal_reminder_enabled ?? true,
  });

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="space-y-6">
      {/* Email Reports */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Email Reports</CardTitle>
              <CardDescription>Receive financial reports via email</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Email Reports</Label>
              <p className="text-sm text-muted-foreground">
                Get monthly and quarterly reports delivered to your inbox
              </p>
            </div>
            <Switch
              checked={settings.email_reports_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, email_reports_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Alert Preferences</CardTitle>
              <CardDescription>Configure when to receive alerts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select
              value={settings.notification_frequency}
              onValueChange={(value) => setSettings({ ...settings, notification_frequency: value })}
            >
              <SelectTrigger>
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Summary</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="monthly">Monthly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Budget Alert Threshold</Label>
            <Select
              value={String(settings.budget_alert_threshold)}
              onValueChange={(value) => setSettings({ ...settings, budget_alert_threshold: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">At 60% of budget</SelectItem>
                <SelectItem value="70">At 70% of budget</SelectItem>
                <SelectItem value="80">At 80% of budget</SelectItem>
                <SelectItem value="90">At 90% of budget</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Receive alerts when spending reaches this percentage of your budget
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Goal Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about goal contributions
              </p>
            </div>
            <Switch
              checked={settings.goal_reminder_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, goal_reminder_enabled: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isUpdating} className="w-full">
        {isUpdating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save Notification Settings
      </Button>
    </div>
  );
};

export default NotificationSettings;
