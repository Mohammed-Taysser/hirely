import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  BellRing, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Coins,
  Users,
  Trophy,
  Send,
} from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PushNotificationSettings() {
  const {
    isSupported,
    isEnabled,
    permission,
    isLoading,
    requestPermission,
    disableNotifications,
    notifyPointsExpiring,
    notifyReferralConverted,
    notifyMilestoneReached,
  } = usePushNotifications();

  const [notificationTypes, setNotificationTypes] = useState({
    pointsExpiry: true,
    referralSignups: true,
    referralSubscriptions: true,
    milestones: true,
  });

  const handleToggle = (key: keyof typeof notificationTypes) => {
    setNotificationTypes(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleTestNotification = (type: string) => {
    switch (type) {
      case 'points':
        notifyPointsExpiring(2500, 3);
        break;
      case 'referral-signup':
        notifyReferralConverted('John Smith', 250, false);
        break;
      case 'referral-subscription':
        notifyReferralConverted('Sarah Johnson', 500, true);
        break;
      case 'milestone':
        notifyMilestoneReached('5 Referrals', 1000);
        break;
    }
  };

  const getPermissionStatus = () => {
    if (!isSupported) {
      return {
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        text: 'Not Supported',
        color: 'text-destructive',
      };
    }
    
    switch (permission) {
      case 'granted':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          text: 'Enabled',
          color: 'text-green-500',
        };
      case 'denied':
        return {
          icon: <XCircle className="h-5 w-5 text-destructive" />,
          text: 'Blocked',
          color: 'text-destructive',
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          text: 'Not Set',
          color: 'text-amber-500',
        };
    }
  };

  const status = getPermissionStatus();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>
                Receive real-time alerts on your device
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={permission === 'granted' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {status.icon}
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSupported && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported in this browser. 
              Please use a modern browser like Chrome, Firefox, or Edge.
            </AlertDescription>
          </Alert>
        )}

        {isSupported && permission === 'denied' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Notifications are blocked for this site. To enable them, 
              click the lock icon in your browser's address bar and allow notifications.
            </AlertDescription>
          </Alert>
        )}

        {isSupported && permission !== 'granted' && permission !== 'denied' && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Enable Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts when points expire or referrals convert
                </p>
              </div>
            </div>
            <Button 
              onClick={requestPermission} 
              disabled={isLoading}
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Enabling...' : 'Enable'}
            </Button>
          </div>
        )}

        {isEnabled && (
          <>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-green-500/10 border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Notifications Active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You'll receive real-time alerts on this device
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={disableNotifications}
              >
                Disable
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Notification Types
              </h4>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Points Expiration</p>
                      <p className="text-sm text-muted-foreground">
                        When your points are about to expire
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestNotification('points')}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={notificationTypes.pointsExpiry}
                      onCheckedChange={() => handleToggle('pointsExpiry')}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Referral Signups</p>
                      <p className="text-sm text-muted-foreground">
                        When someone signs up using your link
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestNotification('referral-signup')}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={notificationTypes.referralSignups}
                      onCheckedChange={() => handleToggle('referralSignups')}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Referral Subscriptions</p>
                      <p className="text-sm text-muted-foreground">
                        When your referral upgrades to a paid plan
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestNotification('referral-subscription')}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={notificationTypes.referralSubscriptions}
                      onCheckedChange={() => handleToggle('referralSubscriptions')}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Milestone Achievements</p>
                      <p className="text-sm text-muted-foreground">
                        When you reach referral milestones
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTestNotification('milestone')}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={notificationTypes.milestones}
                      onCheckedChange={() => handleToggle('milestones')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
