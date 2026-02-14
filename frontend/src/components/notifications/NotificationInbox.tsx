import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Coins,
  Users,
  Trophy,
  AlertTriangle,
  Check,
  CheckCheck,
  MoreHorizontal,
  Trash2,
  Archive,
  ExternalLink,
  Clock,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: 'points-expiry' | 'referral-signup' | 'referral-subscription' | 'milestone' | 'bonus' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  actionLabel?: string;
  data?: Record<string, unknown>;
}

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'points-expiry',
    title: 'Points Expiring Soon',
    message: '2,500 points will expire in 3 days. Redeem them before they\'re gone!',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
    archived: false,
    actionUrl: '/my-points',
    actionLabel: 'View Points',
  },
  {
    id: '2',
    type: 'referral-subscription',
    title: 'Referral Subscribed!',
    message: 'Sarah Johnson upgraded to Pro! You earned 500 bonus points.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    archived: false,
    actionUrl: '/referrals',
    actionLabel: 'View Referrals',
  },
  {
    id: '3',
    type: 'milestone',
    title: 'Milestone Reached!',
    message: 'Congratulations! You\'ve reached 5 referrals and earned 1,000 bonus points.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    archived: false,
    actionUrl: '/referrals',
    actionLabel: 'View Progress',
  },
  {
    id: '4',
    type: 'referral-signup',
    title: 'New Referral Signup',
    message: 'Mike Wilson signed up using your link! You earned 250 points.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    archived: false,
    actionUrl: '/referrals',
    actionLabel: 'View Referrals',
  },
  {
    id: '5',
    type: 'bonus',
    title: 'Bonus Points Awarded',
    message: 'You received 500 bonus points for completing your profile!',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    archived: false,
    actionUrl: '/my-points',
    actionLabel: 'View Points',
  },
  {
    id: '6',
    type: 'points-expiry',
    title: 'Points Expired',
    message: '1,000 points expired on January 15, 2026.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    archived: false,
  },
  {
    id: '7',
    type: 'system',
    title: 'Weekly Digest Enabled',
    message: 'You\'ll now receive weekly leaderboard updates every Monday.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    archived: false,
  },
];

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'points-expiry':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'referral-signup':
      return <Users className="h-5 w-5 text-blue-500" />;
    case 'referral-subscription':
      return <Users className="h-5 w-5 text-green-500" />;
    case 'milestone':
      return <Trophy className="h-5 w-5 text-amber-500" />;
    case 'bonus':
      return <Gift className="h-5 w-5 text-purple-500" />;
    case 'system':
      return <Bell className="h-5 w-5 text-muted-foreground" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export function NotificationInbox() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all');

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read && !n.archived;
    if (filter === 'archived') return n.archived;
    return !n.archived;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success("All notifications marked as read");
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
    toast.success("Notification archived");
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  };

  const clearAllArchived = () => {
    setNotifications(prev => prev.filter(n => !n.archived));
    toast.success("Archived notifications cleared");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="flex items-center gap-2">
                Notification Inbox
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                View and manage all your notifications
              </CardDescription>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" className="flex items-center gap-1">
                All
                <Badge variant="secondary" className="text-xs ml-1">
                  {notifications.filter(n => !n.archived).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-1">
                Unread
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            {filter === 'archived' && notifications.some(n => n.archived) && (
              <Button variant="ghost" size="sm" onClick={clearAllArchived}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>

          <TabsContent value={filter}>
            <ScrollArea className="h-[400px] pr-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No {filter === 'unread' ? 'unread ' : filter === 'archived' ? 'archived ' : ''}notifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                        !notification.read && "bg-primary/5 border-primary/20",
                        notification.read && "bg-card hover:bg-muted/50"
                      )}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              "font-medium",
                              !notification.read && "text-foreground",
                              notification.read && "text-muted-foreground"
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Check className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteNotification(notification.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {notification.actionUrl && notification.actionLabel && (
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                              {notification.actionLabel}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
