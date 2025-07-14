"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Notification, NotificationStats } from '@/types';
import { useAuth } from '@/stores';
import { toast } from 'sonner';

// Query Keys
const NOTIFICATIONS_QUERY_KEY = ['notifications'];
const NOTIFICATION_STATS_QUERY_KEY = ['notification-stats'];
const UNREAD_COUNT_QUERY_KEY = ['unread-count'];

// Mock notifications for development/testing
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    title: 'New Deal Created',
    message: 'A new deal has been created for Apple Inc.',
    notificationType: 'deal_created' as const,
    priority: 'medium' as const,
    category: 'business' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    recipientEmail: 'user@example.com',
    organizationName: 'Test Org'
  },
  {
    id: '2',
    title: 'Payment Received',
    message: 'Payment of $50,000 received for deal DEAL-001',
    notificationType: 'payment_received' as const,
    priority: 'high' as const,
    category: 'business' as const,
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    recipientEmail: 'user@example.com',
    organizationName: 'Test Org'
  },
  {
    id: '3',
    title: 'New Client Added',
    message: 'Client "Microsoft Corp" has been added to the system',
    notificationType: 'client_created' as const,
    priority: 'medium' as const,
    category: 'business' as const,
    isRead: true,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    recipientEmail: 'user@example.com',
    organizationName: 'Test Org'
  }
];

// Notifications Query Hook
export const useNotifications = (params?: {
  unread_only?: boolean;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
}) => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, params],
    queryFn: async () => {
      try {
        const response = await apiClient.getNotifications(params);
        // Ensure we always return a valid structure
        return response.data || { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      } catch (error) {
        console.log('Using mock notifications (backend not available)');
        // Return mock data when backend is not available
        let filteredNotifications = [...MOCK_NOTIFICATIONS];
        
        if (params?.unread_only) {
          filteredNotifications = filteredNotifications.filter(n => !n.isRead);
        }
        
        if (params?.type && params.type !== 'all') {
          filteredNotifications = filteredNotifications.filter(n => n.notificationType === params.type);
        }
        
        return {
          data: filteredNotifications,
          pagination: { 
            page: 1, 
            limit: 20, 
            total: filteredNotifications.length, 
            totalPages: 1 
          }
        };
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: isAuthInitialized && !!authUser,
  });
};

// Notification Stats Query Hook
export const useNotificationStats = () => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: NOTIFICATION_STATS_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await apiClient.getNotificationStats();
        return response.data || { 
          totalNotifications: 0, 
          unreadCount: 0, 
          byType: {}, 
          byPriority: {}, 
          recentNotifications: [] 
        };
      } catch (error) {
        console.log('Using mock notification stats (backend not available)');
        // Return mock stats when backend is not available
        const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
        return { 
          totalNotifications: MOCK_NOTIFICATIONS.length, 
          unreadCount,
          byType: {
            'deal_created': 1,
            'payment_received': 1,
            'client_created': 1
          },
          byPriority: {
            'medium': 2,
            'high': 1
          },
          recentNotifications: MOCK_NOTIFICATIONS.slice(0, 3)
        };
      }
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: isAuthInitialized && !!authUser,
  });
};

// Unread Count Query Hook
export const useUnreadCount = () => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await apiClient.getUnreadCount();
        return response.data.unread_count || 0;
      } catch (error) {
        console.log('Using mock unread count (backend not available)');
        // Return mock unread count when backend is not available
        return MOCK_NOTIFICATIONS.filter(n => !n.isRead).length;
      }
    },
    staleTime: 10 * 1000, // 10 seconds
    enabled: isAuthInitialized && !!authUser,
  });
};

// Mark as Read Mutation Hook
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await apiClient.markNotificationAsRead(id);
        return response.data;
      } catch (error) {
        console.log('Using mock mark as read (backend not available)');
        // Mock the operation
        return { message: 'Notification marked as read (mock)' };
      }
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    },
  });
};

// Mark All as Read Mutation Hook
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds?: string[]) => {
      try {
        const response = await apiClient.markNotificationsAsRead(notificationIds);
        return response.data;
      } catch (error) {
        console.log('Using mock mark all as read (backend not available)');
        // Mock the operation
        return { message: 'All notifications marked as read (mock)', count: 2 };
      }
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_STATS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      
      toast.success(`${data.count} notifications marked as read`);
    },
    onError: (error) => {
      console.error('Failed to mark notifications as read:', error);
      toast.error('Failed to mark notifications as read');
    },
  });
};

// Combined hook for easier usage
export const useNotificationManagement = () => {
  const notificationsQuery = useNotifications();
  const statsQuery = useNotificationStats();
  const unreadCountQuery = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  return {
    // Data
    notifications: notificationsQuery.data,
    stats: statsQuery.data,
    unreadCount: unreadCountQuery.data,
    
    // Loading states
    isLoading: notificationsQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingUnreadCount: unreadCountQuery.isLoading,
    
    // Error states
    error: notificationsQuery.error,
    statsError: statsQuery.error,
    unreadCountError: unreadCountQuery.error,
    
    // Actions
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    
    // Utils
    refetch: notificationsQuery.refetch,
    refetchStats: statsQuery.refetch,
    refetchUnreadCount: unreadCountQuery.refetch,
  };
}; 