import { useEffect, useRef } from 'react';
import { useAuth } from '@/stores';
import { notificationWebSocket } from '@/lib/realtime/notifications';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types';
import { toast } from 'sonner';

export const useRealtimeNotifications = () => {
  const { user, isAuthInitialized } = useAuth();
  const queryClient = useQueryClient();
  const listenerId = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthInitialized || !user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Connect to WebSocket
    notificationWebSocket.connect(token);

    // Subscribe to notifications
    listenerId.current = notificationWebSocket.subscribe((notification: Notification) => {
      // Update cache
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [notification, ...old.data]
        };
      });

      // Update unread count
      queryClient.setQueryData(['unread-count'], (old: number) => {
        return (old || 0) + 1;
      });

      // Show toast notification based on priority
      const toastConfig = getToastConfig(notification);
      
      switch (notification.priority) {
        case 'urgent':
          toast.error(notification.title, {
            description: notification.message,
            action: notification.actionUrl ? {
              label: 'View',
              onClick: () => {
                if (notification.actionUrl) {
                  window.location.href = notification.actionUrl;
                }
              }
            } : undefined,
            duration: 10000, // 10 seconds
          });
          break;
          
        case 'high':
          toast.warning(notification.title, {
            description: notification.message,
            action: notification.actionUrl ? {
              label: 'View',
              onClick: () => {
                if (notification.actionUrl) {
                  window.location.href = notification.actionUrl;
                }
              }
            } : undefined,
            duration: 7000,
          });
          break;
          
        case 'medium':
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
          });
          break;
          
        default:
          toast(notification.title, {
            description: notification.message,
            duration: 3000,
          });
      }
    });

    return () => {
      if (listenerId.current) {
        notificationWebSocket.unsubscribe(listenerId.current);
      }
    };
  }, [isAuthInitialized, user, queryClient]);

  useEffect(() => {
    return () => {
      notificationWebSocket.disconnect();
    };
  }, []);

  return {
    isConnected: notificationWebSocket.isConnected(),
  };
};

// Get toast configuration based on notification type
const getToastConfig = (notification: Notification) => {
  const configs: Record<string, { icon: string; color: string }> = {
    'deal_created': { icon: '📋', color: 'blue' },
    'deal_updated': { icon: '📤', color: 'blue' },
    'deal_status_changed': { icon: '✅', color: 'green' },
    'client_created': { icon: '👤', color: 'blue' },
    'user_created': { icon: '👤', color: 'blue' },
    'team_created': { icon: '👥', color: 'blue' },
    'payment_received': { icon: '💰', color: 'green' },
    'commission_created': { icon: '💸', color: 'green' },
    'system_alert': { icon: '🔧', color: 'gray' },
    'new_organization': { icon: '🏢', color: 'blue' },
  };
  
  return configs[notification.notificationType] || { icon: '📢', color: 'blue' };
}; 