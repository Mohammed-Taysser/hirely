import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Calendar,
  Trophy,
  TrendingUp,
  Lightbulb,
  Clock,
  CheckCircle,
  Send,
} from "lucide-react";
import { toast } from "sonner";

interface DigestSettings {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: string;
  includeRank: boolean;
  includeActivity: boolean;
  includeTips: boolean;
  includeLeaderboard: boolean;
}

export function EmailDigestSettings() {
  const [settings, setSettings] = useState<DigestSettings>({
    enabled: true,
    frequency: 'weekly',
    dayOfWeek: 'monday',
    includeRank: true,
    includeActivity: true,
    includeTips: true,
    includeLeaderboard: true,
  });

  const [lastSent, setLastSent] = useState<Date | null>(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));

  const handleSave = () => {
    toast.success("Email digest settings saved!");
  };

  const handleSendTestEmail = () => {
    toast.success("Test email sent! Check your inbox.");
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Every week';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Every month';
      default: return freq;
    }
  };

  const getDayLabel = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Leaderboard Email Digest</CardTitle>
              <CardDescription>
                Receive regular updates about your referral performance
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) =>
              setSettings({ ...settings, enabled: checked })
            }
          />
        </div>
      </CardHeader>
      <CardContent className={settings.enabled ? "space-y-6" : "opacity-50 pointer-events-none"}>
        {/* Email Preview */}
        <div className="p-4 rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Weekly Leaderboard Digest</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your referral rank, recent activity, and tips to climb the leaderboard
              </p>
              {lastSent && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last sent: {lastSent.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Delivery Schedule
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Frequency</label>
              <Select
                value={settings.frequency}
                onValueChange={(value: DigestSettings['frequency']) =>
                  setSettings({ ...settings, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Day of Week</label>
              <Select
                value={settings.dayOfWeek}
                onValueChange={(value) =>
                  setSettings({ ...settings, dayOfWeek: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {getFrequencyLabel(settings.frequency)} on {getDayLabel(settings.dayOfWeek)}s
            </span>
          </div>
        </div>

        <Separator />

        {/* Content Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Email Content
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-sm">Current Rank</p>
                  <p className="text-xs text-muted-foreground">
                    Your position on the leaderboard
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.includeRank}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeRank: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-sm">Recent Activity</p>
                  <p className="text-xs text-muted-foreground">
                    New signups and conversions this period
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.includeActivity}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeActivity: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium text-sm">Tips & Strategies</p>
                  <p className="text-xs text-muted-foreground">
                    Personalized tips to improve your ranking
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.includeTips}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeTips: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Top 10 Leaderboard</p>
                  <p className="text-xs text-muted-foreground">
                    See who's leading this period
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.includeLeaderboard}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, includeLeaderboard: checked })
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={handleSave} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleSendTestEmail}>
            <Send className="h-4 w-4 mr-2" />
            Send Test Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
