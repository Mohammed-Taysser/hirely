import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Coins,
  Clock,
  Mail,
} from "lucide-react";
import { mockUserProfile } from "@/data/mockData";
import { PushNotificationSettings } from "@/components/notifications/PushNotificationSettings";
import { NotificationInbox } from "@/components/notifications/NotificationInbox";
import { useDemoNotifications } from "@/components/notifications/InAppNotifications";

export default function Settings() {
  const { triggerReferralConverted, triggerPointsExpiring, triggerMilestoneReached } = useDemoNotifications();
  
  const [formData, setFormData] = useState({
    name: mockUserProfile.name,
    email: mockUserProfile.email,
    phone: "",
    company: "",
    jobTitle: "",
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    resumeReminders: true,
    marketingEmails: false,
  });

  const [pointsNotifications, setPointsNotifications] = useState({
    expirationReminders: true,
    reminderDays: "7",
    weeklyDigest: true,
    redemptionConfirmation: true,
    milestoneAlerts: true,
    referralUpdates: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    autoSave: true,
    showTutorials: true,
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and application settings.
          </p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="Your current job title"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Updates</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your resume activity
                </p>
              </div>
              <Switch
                checked={notifications.emailUpdates}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, emailUpdates: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resume Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Get reminded to update your resume periodically
                </p>
              </div>
              <Switch
                checked={notifications.resumeReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, resumeReminders: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-muted-foreground">
                  Receive tips, updates, and promotional content
                </p>
              </div>
              <Switch
                checked={notifications.marketingEmails}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, marketingEmails: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Inbox */}
        <NotificationInbox />

        {/* In-App Popup Test */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>In-App Notification Popups</CardTitle>
                <CardDescription>Test the slide-in notification popups</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={triggerReferralConverted}>
                Test Referral Converted
              </Button>
              <Button variant="outline" size="sm" onClick={triggerPointsExpiring}>
                Test Points Expiring
              </Button>
              <Button variant="outline" size="sm" onClick={triggerMilestoneReached}>
                Test Milestone Reached
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <PushNotificationSettings />

        {/* Points & Loyalty Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle>Points & Loyalty Notifications</CardTitle>
                <CardDescription>Manage notifications for your loyalty points</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">Expiration Reminders</p>
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when your points are about to expire
                </p>
              </div>
              <Switch
                checked={pointsNotifications.expirationReminders}
                onCheckedChange={(checked) =>
                  setPointsNotifications({ ...pointsNotifications, expirationReminders: checked })
                }
              />
            </div>

            {pointsNotifications.expirationReminders && (
              <div className="ml-6 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm">Remind me</Label>
                  <Select
                    value={pointsNotifications.reminderDays}
                    onValueChange={(value) =>
                      setPointsNotifications({ ...pointsNotifications, reminderDays: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground">before expiration</span>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">Weekly Points Digest</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your points activity
                </p>
              </div>
              <Switch
                checked={pointsNotifications.weeklyDigest}
                onCheckedChange={(checked) =>
                  setPointsNotifications({ ...pointsNotifications, weeklyDigest: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Redemption Confirmations</p>
                <p className="text-sm text-muted-foreground">
                  Email confirmation when you redeem points for rewards
                </p>
              </div>
              <Switch
                checked={pointsNotifications.redemptionConfirmation}
                onCheckedChange={(checked) =>
                  setPointsNotifications({ ...pointsNotifications, redemptionConfirmation: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Milestone Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when you reach points milestones
                </p>
              </div>
              <Switch
                checked={pointsNotifications.milestoneAlerts}
                onCheckedChange={(checked) =>
                  setPointsNotifications({ ...pointsNotifications, milestoneAlerts: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Referral Updates</p>
                <p className="text-sm text-muted-foreground">
                  Notifications when your referrals sign up or subscribe
                </p>
              </div>
              <Switch
                checked={pointsNotifications.referralUpdates}
                onCheckedChange={(checked) =>
                  setPointsNotifications({ ...pointsNotifications, referralUpdates: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your application experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the application
                </p>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, darkMode: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Auto-Save</p>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes while editing
                </p>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, autoSave: checked })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Show Tutorials</p>
                <p className="text-sm text-muted-foreground">
                  Display helpful tips and tutorials
                </p>
              </div>
              <Switch
                checked={preferences.showTutorials}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, showTutorials: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline">Enable 2FA</Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} variant="hero" size="lg">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
