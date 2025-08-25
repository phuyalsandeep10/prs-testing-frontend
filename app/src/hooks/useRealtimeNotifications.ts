import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/stores';
import { notificationWebSocket } from '@/lib/realtime/notifications';
import { useQueryClient } from '@tanstack/react-query';
import type { Notification } from '@/types';
import { toast } from 'sonner';

export const useRealtimeNotifications = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const listenerId = useRef<string | null>(null);
  const invalidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Throttled query invalidation to prevent rate limiting
  const throttledInvalidateNotifications = useCallback(() => {
    // Clear any existing timeout
    if (invalidationTimeoutRef.current) {
      clearTimeout(invalidationTimeoutRef.current);
    }

    // Set a new timeout to batch invalidations
    invalidationTimeoutRef.current = setTimeout(() => {
      try {
        console.log('🔄 Throttled invalidation: refreshing notification queries...');
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        queryClient.invalidateQueries({ queryKey: ['unread-count'] });
      } catch (error) {
        console.error('Error during throttled invalidation:', error);
      }
    }, 2000); // Wait 2 seconds before invalidating to batch multiple rapid notifications
  }, [queryClient]);

  useEffect(() => {
    if (!user || !token) return;

    const setupWebSocket = async () => {
      try {
        // Connect to WebSocket (now async)
        await notificationWebSocket.connect(token);

        // Subscribe to notifications
        listenerId.current = notificationWebSocket.subscribe((notification: Notification) => {
        try {
          // Normalize backend fields to frontend fields consistently
          const mappedNotification = {
            ...notification,
            notificationType: (notification as any).notification_type || notification.notificationType || 'system_alert',
            isRead: (notification as any).is_read ?? notification.isRead ?? false,
            createdAt: (notification as any).created_at || notification.createdAt || new Date().toISOString(),
            readAt: (notification as any).read_at || notification.readAt,
            relatedObjectType: (notification as any).related_object_type || notification.relatedObjectType,
            relatedObjectId: (notification as any).related_object_id || notification.relatedObjectId,
            actionUrl: (notification as any).action_url || notification.actionUrl,
            recipientEmail: (notification as any).recipient_email || notification.recipientEmail,
            organizationName: (notification as any).organization_name || notification.organizationName,
          };

          // Use throttled invalidation to prevent rate limiting
          throttledInvalidateNotifications();
          
          // Show toast notification with error handling
          const priority = mappedNotification.priority || 'medium';
          
          try {
            switch (priority) {
              case 'urgent':
                toast.error(mappedNotification.title || 'Urgent Notification', {
                  description: mappedNotification.message || 'No message provided',
                  duration: 10000,
                });
                break;
                
              case 'high':
                toast.warning(mappedNotification.title || 'High Priority Notification', {
                  description: mappedNotification.message || 'No message provided',
                  duration: 7000,
                });
                break;
                
              case 'medium':
                toast.info(mappedNotification.title || 'Notification', {
                  description: mappedNotification.message || 'No message provided',
                  duration: 5000,
                });
                break;
                
              default:
                toast(mappedNotification.title || 'Notification', {
                  description: mappedNotification.message || 'No message provided',
                  duration: 3000,
                });
            }
          } catch (toastError) {
            console.error('Error showing toast notification:', toastError);
          }
        } catch (processingError) {
          console.error('Error processing notification:', processingError, notification);
        }
      });
      } catch (connectionError) {
        console.error('Error setting up real-time notifications:', connectionError);
      }
    };

    setupWebSocket();

    return () => {
      try {
        // Clear any pending invalidation timeout
        if (invalidationTimeoutRef.current) {
          clearTimeout(invalidationTimeoutRef.current);
          invalidationTimeoutRef.current = null;
        }
        
        if (listenerId.current) {
          notificationWebSocket.unsubscribe(listenerId.current);
        }
        notificationWebSocket.disconnect();
      } catch (cleanupError) {
        console.error('Error cleaning up notifications:', cleanupError);
      }
    };
  }, [user, token, queryClient, throttledInvalidateNotifications]);

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
