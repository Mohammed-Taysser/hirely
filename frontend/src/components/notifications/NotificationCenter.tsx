import { useState, useEffect } from "react";
import { Bell, Check, Trash2, Mail, CreditCard, FileText, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Notification {
  id: string;
  type: "email" | "payment" | "resume" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const iconMap = {
  email: Mail,
  payment: CreditCard,
  resume: FileText,
  system: AlertCircle,
};

const colorMap = {
  email: "text-blue-500",
  payment: "text-green-500",
  resume: "text-purple-500",
  system: "text-orange-500",
};

// Mock initial notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "payment",
    title: "Payment Successful",
    message: "Your Pro subscription has been renewed for $12.00",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    type: "email",
    title: "Email Sent",
    message: "Your cover letter was sent to hiring@techcorp.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "3",
    type: "resume",
    title: "Resume Viewed",
    message: "Your resume was viewed by Google HR",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "Welcome to Pro!",
    message: "You now have access to all Pro features including AI suggestions.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNotifications = [
        {
          type: "resume" as const,
          title: "Resume Downloaded",
          message: "Someone downloaded your resume from your portfolio",
        },
        {
          type: "email" as const,
          title: "Email Opened",
          message: "Your email to Amazon was opened",
        },
        {
          type: "system" as const,
          title: "Tip of the Day",
          message: "Add keywords from job descriptions to improve ATS scores",
        },
      ];

      const shouldAdd = Math.random() > 0.7; // 30% chance every 30s
      if (shouldAdd) {
        const randomNotif = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotif,
          timestamp: new Date(),
          read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type];
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors group",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                        "bg-muted"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", colorMap[notification.type])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium truncate",
                            !notification.read && "font-semibold"
                          )}
                        >
                          {notification.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
