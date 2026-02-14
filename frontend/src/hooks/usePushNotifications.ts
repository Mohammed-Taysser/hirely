import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface PushNotificationState {
  isSupported: boolean;
  isEnabled: boolean;
  permission: NotificationPermission | 'unsupported';
  isLoading: boolean;
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isEnabled: false,
    permission: 'unsupported',
    isLoading: true,
  });

  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
      
      if (!isSupported) {
        setState({
          isSupported: false,
          isEnabled: false,
          permission: 'unsupported',
          isLoading: false,
        });
        return;
      }

      const permission = Notification.permission;
      const isEnabled = permission === 'granted';

      setState({
        isSupported: true,
        isEnabled,
        permission,
        isLoading: false,
      });

      // Register service worker if supported
      if (isSupported) {
        try {
          await registerServiceWorker();
        } catch (error) {
          console.log('Service worker registration skipped:', error);
        }
      }
    };

    checkSupport();
  }, []);

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
    if (!('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('Service Worker registered:', registration.scope);
      return registration;
    } catch (error) {
      console.log('Service Worker registration failed (expected in development):', error);
      return null;
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error("Push notifications are not supported in this browser");
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isEnabled: permission === 'granted',
        isLoading: false,
      }));

      if (permission === 'granted') {
        toast.success("Push notifications enabled!");
        // Store preference
        localStorage.setItem('pushNotificationsEnabled', 'true');
        return true;
      } else if (permission === 'denied') {
        toast.error("Notification permission was denied. Please enable it in your browser settings.");
        return false;
      } else {
        toast.info("Notification permission was dismissed");
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error("Failed to request notification permission");
      return false;
    }
  }, [state.isSupported]);

  const sendNotification = useCallback(async (payload: NotificationPayload): Promise<boolean> => {
    if (!state.isEnabled) {
      console.log('Notifications not enabled');
      return false;
    }

    try {
      // Try using service worker if available
      const registration = await navigator.serviceWorker?.ready;
      
      if (registration) {
        await registration.showNotification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag,
          data: payload.data,
          requireInteraction: false,
        });
      } else {
        // Fallback to direct Notification API
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }, [state.isEnabled]);

  const disableNotifications = useCallback(() => {
    localStorage.setItem('pushNotificationsEnabled', 'false');
    setState(prev => ({ ...prev, isEnabled: false }));
    toast.success("Push notifications disabled");
  }, []);

  // Simulate point expiration notification
  const notifyPointsExpiring = useCallback((points: number, daysUntilExpiry: number) => {
    sendNotification({
      title: '⚠️ Points Expiring Soon!',
      body: `${points.toLocaleString()} points will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}. Redeem them now!`,
      tag: 'points-expiry',
      data: { type: 'points-expiry', points, daysUntilExpiry },
    });
  }, [sendNotification]);

  // Simulate referral conversion notification
  const notifyReferralConverted = useCallback((referralName: string, pointsEarned: number, isSubscription: boolean) => {
    sendNotification({
      title: isSubscription ? '🎉 Referral Subscribed!' : '✨ New Referral Signup!',
      body: `${referralName} ${isSubscription ? 'subscribed' : 'signed up'}! You earned ${pointsEarned.toLocaleString()} points.`,
      tag: 'referral-conversion',
      data: { type: 'referral-conversion', referralName, pointsEarned, isSubscription },
    });
  }, [sendNotification]);

  // Simulate milestone notification
  const notifyMilestoneReached = useCallback((milestone: string, bonusPoints: number) => {
    sendNotification({
      title: '🏆 Milestone Reached!',
      body: `Congratulations! You've reached ${milestone} and earned ${bonusPoints.toLocaleString()} bonus points!`,
      tag: 'milestone',
      data: { type: 'milestone', milestone, bonusPoints },
    });
  }, [sendNotification]);

  return {
    ...state,
    requestPermission,
    sendNotification,
    disableNotifications,
    notifyPointsExpiring,
    notifyReferralConverted,
    notifyMilestoneReached,
  };
}
