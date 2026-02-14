import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from "react";
import { X, Bell, Gift, Coins, TrendingUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InAppNotification {
  id: string;
  type: "referral_converted" | "points_expiring" | "milestone_reached" | "general";
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  createdAt: Date;
}

interface InAppNotificationContextType {
  notifications: InAppNotification[];
  addNotification: (notification: Omit<InAppNotification, "id" | "createdAt">) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const InAppNotificationContext = createContext<InAppNotificationContextType | undefined>(undefined);

export function useInAppNotifications() {
  const context = useContext(InAppNotificationContext);
  if (!context) {
    throw new Error("useInAppNotifications must be used within a InAppNotificationProvider");
  }
  return context;
}

export function InAppNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  const addNotification = useCallback((notification: Omit<InAppNotification, "id" | "createdAt">) => {
    const newNotification: InAppNotification = {
      ...notification,
      id: `popup-${Date.now()}`,
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 5)); // Keep max 5
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <InAppNotificationContext.Provider value={{ notifications, addNotification, dismissNotification, clearAll }}>
      {children}
      <NotificationPopups notifications={notifications} onDismiss={dismissNotification} />
    </InAppNotificationContext.Provider>
  );
}

interface NotificationPopupsProps {
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
}

function NotificationPopups({ notifications, onDismiss }: NotificationPopupsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Show new notifications with animation
    notifications.forEach((notif) => {
      if (!visibleNotifications.includes(notif.id)) {
        setTimeout(() => {
          setVisibleNotifications((prev) => [...prev, notif.id]);
        }, 100);
      }
    });

    // Auto-dismiss after 8 seconds
    const timers = notifications.map((notif) => {
      return setTimeout(() => {
        onDismiss(notif.id);
      }, 8000);
    });

    return () => timers.forEach(clearTimeout);
  }, [notifications, visibleNotifications, onDismiss]);

  const getIcon = (type: InAppNotification["type"]) => {
    switch (type) {
      case "referral_converted":
        return <Gift className="h-5 w-5 text-green-500" />;
      case "points_expiring":
        return <Coins className="h-5 w-5 text-amber-500" />;
      case "milestone_reached":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getGradient = (type: InAppNotification["type"]) => {
    switch (type) {
      case "referral_converted":
        return "from-green-500/10 to-green-500/5 border-green-500/20";
      case "points_expiring":
        return "from-amber-500/10 to-amber-500/5 border-amber-500/20";
      case "milestone_reached":
        return "from-primary/10 to-primary/5 border-primary/20";
      default:
        return "from-muted to-muted/50 border-border";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className={cn(
            "pointer-events-auto bg-gradient-to-r border rounded-xl p-4 shadow-lg transition-all duration-300 ease-out",
            getGradient(notification.type),
            visibleNotifications.includes(notification.id)
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          )}
          style={{ 
            animationDelay: `${index * 100}ms`,
            backgroundColor: "hsl(var(--card))"
          }}
        >
          <div className="flex gap-3">
            <div className="shrink-0 mt-0.5">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm text-foreground">
                  {notification.title}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 -mt-1 -mr-1"
                  onClick={() => onDismiss(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
              {notification.actionLabel && notification.actionUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2 text-primary"
                  asChild
                >
                  <a href={notification.actionUrl}>
                    {notification.actionLabel}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Demo trigger functions for testing
export function useDemoNotifications() {
  const { addNotification } = useInAppNotifications();

  const triggerReferralConverted = () => {
    addNotification({
      type: "referral_converted",
      title: "Referral Converted! 🎉",
      message: "John Smith just subscribed! You earned 500 bonus points.",
      actionLabel: "View Referrals",
      actionUrl: "/referrals",
    });
  };

  const triggerPointsExpiring = () => {
    addNotification({
      type: "points_expiring",
      title: "Points Expiring Soon",
      message: "250 points will expire in 3 days. Use them before they're gone!",
      actionLabel: "Redeem Points",
      actionUrl: "/my-points",
    });
  };

  const triggerMilestoneReached = () => {
    addNotification({
      type: "milestone_reached",
      title: "Milestone Unlocked! 🏆",
      message: "You've reached 10 referrals and earned 2,500 bonus points!",
      actionLabel: "View Rewards",
      actionUrl: "/referrals",
    });
  };

  return {
    triggerReferralConverted,
    triggerPointsExpiring,
    triggerMilestoneReached,
  };
}
