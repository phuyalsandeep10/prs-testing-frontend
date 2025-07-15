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
      // Map backend fields to frontend fields
      const mappedNotification = {
        ...notification,
        notificationType: (notification as any).notification_type || notification.notificationType,
        isRead: (notification as any).is_read ?? notification.isRead,
        createdAt: (notification as any).created_at || notification.createdAt,
      };
      // Push into every notifications query cache (regardless of filters)
      queryClient.setQueriesData({ queryKey: ['notifications'] }, (old: any) => {
        const base = old ?? { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
        // Respect possible structures (array, {data:[]}, paginated)
        let dataArr: any[] = [];
        if (Array.isArray(base)) {
          dataArr = base;
        } else if (base?.data) {
          dataArr = base.data;
        } else if (base?.results) {
          dataArr = base.results;
        }
        // Remove any existing notification with same id before prepending
        const newArr = [mappedNotification, ...dataArr.filter((n: any) => n.id !== mappedNotification.id)];
        if (Array.isArray(base)) {
          return newArr;
        }
        if (base?.data) {
          return { ...base, data: newArr };
        }
        if (base?.results) {
          return { ...base, results: newArr };
        }
        return newArr;
      });

      // Update unread count
      queryClient.setQueryData(['unread-count'], (old: number) => {
        return (old || 0) + 1;
      });

      // Show toast notification based on priority
      const toastConfig = getToastConfig(mappedNotification);
      
      switch (mappedNotification.priority) {
        case 'urgent':
          toast.error(mappedNotification.title, {
            description: mappedNotification.message,
            action: mappedNotification.actionUrl ? {
              label: 'View',
              onClick: () => {
                if (mappedNotification.actionUrl) {
                  window.location.href = mappedNotification.actionUrl;
                }
              }
            } : undefined,
            duration: 10000, // 10 seconds
          });
          break;
          
        case 'high':
          toast.warning(mappedNotification.title, {
            description: mappedNotification.message,
            action: mappedNotification.actionUrl ? {
              label: 'View',
              onClick: () => {
                if (mappedNotification.actionUrl) {
                  window.location.href = mappedNotification.actionUrl;
                }
              }
            } : undefined,
            duration: 7000,
          });
          break;
          
        case 'medium':
          toast.info(mappedNotification.title, {
            description: mappedNotification.message,
            duration: 5000,
          });
          break;
          
        default:
          toast(mappedNotification.title, {
            description: mappedNotification.message,
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