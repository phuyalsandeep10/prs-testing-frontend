"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  type Notification as AppNotification, 
  NotificationType, 
  WebSocketMessage,
  UserRole 
} from '@/lib/types/roles';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
}

interface NotificationHookReturn extends NotificationState {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  sendNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL;
const NOTIFICATIONS_ENDPOINT = '/api/notifications';

/**
 * Enterprise-grade real-time notification system
 */
export function useNotifications(userId: string, userRole: UserRole, organizationId?: string): NotificationHookReturn {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isConnected: false,
    isLoading: true,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const queryClient = useQueryClient();

  // Fetch initial notifications
  const { data: initialNotifications, isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      return data as AppNotification[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      return response.json();
    },
    onSuccess: (_, notificationId) => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, status: 'read' as const, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      return response.json();
    },
    onSuccess: () => {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ 
          ...n, 
          status: 'read' as const, 
          readAt: new Date().toISOString() 
        })),
        unreadCount: 0,
      }));
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`${NOTIFICATIONS_ENDPOINT}/${notificationId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete notification');
    },
    onSuccess: (_, notificationId) => {
      setState(prev => {
        const deletedNotification = prev.notifications.find(n => n.id === notificationId);
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== notificationId),
          unreadCount: deletedNotification?.status === 'unread' 
            ? Math.max(0, prev.unreadCount - 1) 
            : prev.unreadCount,
        };
      });
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<AppNotification, 'id' | 'createdAt' | 'status'>) => {
      const response = await fetch(NOTIFICATIONS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notification,
          status: 'unread',
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error('Failed to send notification');
      return response.json();
    },
  });

  // WebSocket connection management
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Check if WebSocket URL is configured
    if (!WEBSOCKET_URL) {
      console.log('🔌 WebSocket URL not configured. Real-time notifications disabled.');
      setState(prev => ({ ...prev, isConnected: false }));
      return;
    }

    try {
      const wsUrl = `${WEBSOCKET_URL}?userId=${userId}&role=${userRole}${organizationId ? `&orgId=${organizationId}` : ''}`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('🔌 WebSocket connected to:', wsUrl);
        setState(prev => ({ ...prev, isConnected: true }));
        reconnectAttempts.current = 0;
        
        // Send heartbeat
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({ type: 'heartbeat', userId }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Only reconnect if WebSocket URL is configured and not a clean close
        if (WEBSOCKET_URL && !event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('🔌 WebSocket connection error:', {
          url: wsUrl,
          error: error,
          readyState: wsRef.current?.readyState,
          timestamp: new Date().toISOString()
        });
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', {
        url: WEBSOCKET_URL,
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }, [userId, userRole, organizationId]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'notification':
        const newNotification = message.payload as AppNotification;
        
        setState(prev => ({
          ...prev,
          notifications: [newNotification, ...prev.notifications],
          unreadCount: prev.unreadCount + 1,
        }));

        // Show toast notification
        showToastNotification(newNotification);
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
        break;

      case 'deal_update':
        // Handle deal status updates
        const dealUpdate = message.payload;
        queryClient.invalidateQueries({ queryKey: ['deals'] });
        
        // Show toast for important deal updates
        if (dealUpdate.status === 'verified' || dealUpdate.status === 'rejected') {
          toast.success(
            dealUpdate.status === 'verified' 
              ? `Deal ${dealUpdate.dealId} has been verified!`
              : `Deal ${dealUpdate.dealId} was rejected`
          );
        }
        break;

      case 'user_status':
        // Handle user status changes
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        break;

      case 'team_update':
        // Handle team updates
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, [userId, queryClient]);

  // Show toast notification based on type and priority
  const showToastNotification = (notification: AppNotification) => {
    const toastConfig = getToastConfig(notification);
    
    switch (notification.priority) {
      case 'urgent':
        toast.error(notification.title, {
          description: notification.message,
          action: notification.actionUrl ? {
            label: notification.actionLabel || 'View',
            onClick: () => window.location.href = notification.actionUrl!,
          } : undefined,
          duration: 10000, // 10 seconds
        });
        break;
        
      case 'high':
        toast.warning(notification.title, {
          description: notification.message,
          action: notification.actionUrl ? {
            label: notification.actionLabel || 'View',
            onClick: () => window.location.href = notification.actionUrl!,
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
  };

  // Get toast configuration based on notification type
  const getToastConfig = (notification: AppNotification) => {
    const configs: Record<NotificationType, { icon: string; color: string }> = {
      'deal:created': { icon: '📋', color: 'blue' },
      'deal:submitted': { icon: '📤', color: 'blue' },
      'deal:verified': { icon: '✅', color: 'green' },
      'deal:approved': { icon: '🎉', color: 'green' },
      'deal:rejected': { icon: '❌', color: 'red' },
      'deal:requires-clarification': { icon: '❓', color: 'orange' },
      'user:created': { icon: '👤', color: 'blue' },
      'team:assigned': { icon: '👥', color: 'blue' },
      'target:achieved': { icon: '🎯', color: 'green' },
      'target:missed': { icon: '⚠️', color: 'orange' },
      'system:maintenance': { icon: '🔧', color: 'gray' },
      'organization:updated': { icon: '🏢', color: 'blue' },
    };
    
    return configs[notification.type] || { icon: '📢', color: 'blue' };
  };

  // Initialize notifications on mount
  useEffect(() => {
    if (initialNotifications) {
      const unreadCount = initialNotifications.filter(n => n.status === 'unread').length;
      setState(prev => ({
        ...prev,
        notifications: initialNotifications,
        unreadCount,
        isLoading: false,
      }));
    }
  }, [initialNotifications]);

  // Connect WebSocket on mount
  useEffect(() => {
    if (WEBSOCKET_URL) {
      connect();
    } else {
      console.log('🔌 WebSocket URL not configured. Real-time notifications disabled.');
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    clearAll: async () => {
      await Promise.all(
        state.notifications.map(n => deleteNotificationMutation.mutateAsync(n.id))
      );
    },
    sendNotification: sendNotificationMutation.mutateAsync,
    connect,
    disconnect,
  };
}

/**
 * Notification permission hook for browser notifications
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  return { permission, requestPermission };
}

/**
 * Hook for sending browser notifications
 */
export function useBrowserNotification() {
  const { permission } = useNotificationPermission();

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      return new Notification(title, {
        icon: '/PRSlogo.png',
        badge: '/PRSlogo.png',
        ...options,
      });
    }
    return null;
  }, [permission]);

  return { showNotification, canShow: permission === 'granted' };
} 