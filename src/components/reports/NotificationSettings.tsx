import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Bell, Calendar, Save, Loader2, Smartphone, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NotificationSettingsProps {
  profile: {
    whatsapp_number?: string | null;
    whatsapp_enabled?: boolean | null;
    email_reports_enabled?: boolean | null;
    notification_frequency?: string | null;
    budget_alert_threshold?: number | null;
    goal_reminder_enabled?: boolean | null;
  } | null;
  onSave: (settings: Partial<{
    whatsapp_number: string;
    whatsapp_enabled: boolean;
    email_reports_enabled: boolean;
    notification_frequency: string;
    budget_alert_threshold: number;
    goal_reminder_enabled: boolean;
  }>) => void;
  isUpdating?: boolean;
}

const NotificationSettings = ({ profile, onSave, isUpdating }: NotificationSettingsProps) => {
  const [settings, setSettings] = useState({
    whatsapp_number: profile?.whatsapp_number || "",
    whatsapp_enabled: profile?.whatsapp_enabled || false,
    email_reports_enabled: profile?.email_reports_enabled ?? true,
    notification_frequency: profile?.notification_frequency || "weekly",
    budget_alert_threshold: profile?.budget_alert_threshold || 80,
    goal_reminder_enabled: profile?.goal_reminder_enabled ?? true,
  });

  const handleSave = () => {
    if (settings.whatsapp_enabled && !settings.whatsapp_number) {
      toast.error("Please enter your WhatsApp number");
      return;
    }
    onSave(settings);
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-lg">WhatsApp AI Coach</CardTitle>
              <CardDescription>Get financial insights via WhatsApp</CardDescription>
            </div>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-auto">PRO</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable WhatsApp Coach</Label>
              <p className="text-sm text-muted-foreground">
                Receive summaries, alerts, and chat with your AI coach
              </p>
            </div>
            <Switch
              checked={settings.whatsapp_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, whatsapp_enabled: checked })}
            />
          </div>

          {settings.whatsapp_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-secondary rounded-l-md border border-r-0 border-input">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="whatsapp"
                    placeholder="+91 98765 43210"
                    value={settings.whatsapp_number}
                    onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Include country code. We'll send a verification message.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-sm">What you'll receive:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Daily/weekly financial summaries
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Budget breach alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI for financial queries
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Email Reports */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Mail className="w-5 h-5 text-blue-500" />
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
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Bell className="w-5 h-5 text-orange-500" />
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
