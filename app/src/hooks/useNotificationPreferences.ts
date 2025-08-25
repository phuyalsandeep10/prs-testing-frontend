import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { NotificationPreferences } from '@/types';
import { useAuth } from '@/stores';
import { toast } from 'sonner';

// Query Keys
const NOTIFICATION_PREFERENCES_QUERY_KEY = ['notification-preferences'];

// Notification Preferences Query Hook
export const useNotificationPreferences = () => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await apiClient.getNotificationPreferences();
        console.log('Notification preferences - Raw response:', response); // Debug log
        console.log('Response type:', typeof response, 'Has data:', !!response?.data, 'Has id:', !!response?.id); // Debug log
        
        // Handle different response structures
        let preferencesData = null;
        
        if (response?.data) {
          // Standard wrapped response
          preferencesData = response.data;
          console.log('Using response.data:', preferencesData); // Debug log
        } else if (response && typeof response === 'object' && (response.id || response.user || response.user_id)) {
          // Direct response object
          preferencesData = response;
          console.log('Using direct response:', preferencesData); // Debug log
        }
        
        if (!preferencesData) {
          console.warn('Notification preferences API returned empty response, using defaults');
          console.log('Response was:', response); // Debug log
          return {
            desktopNotification: true,
            unreadNotificationBadge: false,
            pushNotificationTimeout: "select",
            communicationEmails: true,
            announcementsUpdates: false,
            allNotificationSounds: true,
          };
        }
        
        console.log('Preferences data to map:', preferencesData); // Debug log
        console.log('Available fields:', Object.keys(preferencesData)); // Debug log
        console.log('Full response object:', JSON.stringify(preferencesData, null, 2)); // Debug log
        
        // Log specific field values for debugging
        console.log('Backend field values:', {
          enable_client_notifications: preferencesData.enable_client_notifications,
          enable_deal_notifications: preferencesData.enable_deal_notifications,
          notification_timeout: preferencesData.notification_timeout,
          enable_email_notifications: preferencesData.enable_email_notifications,
          enable_marketing_emails: preferencesData.enable_marketing_emails,
          enable_sound_notifications: preferencesData.enable_sound_notifications
        }); // Debug log
        
        // Check if response already contains frontend fields (hybrid response)
        const hasFrontendFields = 'desktopNotification' in preferencesData;
        console.log('Response has frontend fields:', hasFrontendFields); // Debug log
        
        let mappedPreferences;
        if (hasFrontendFields) {
          // Use frontend fields directly if they exist
          mappedPreferences = {
            desktopNotification: preferencesData.desktopNotification ?? preferencesData.enable_client_notifications ?? true,
            unreadNotificationBadge: preferencesData.unreadNotificationBadge ?? preferencesData.enable_deal_notifications ?? false,
            pushNotificationTimeout: preferencesData.pushNotificationTimeout || preferencesData.notification_timeout || "select",
            communicationEmails: preferencesData.communicationEmails ?? preferencesData.enable_email_notifications ?? true,
            announcementsUpdates: preferencesData.announcementsUpdates ?? preferencesData.enable_marketing_emails ?? false,
            allNotificationSounds: preferencesData.allNotificationSounds ?? preferencesData.enable_sound_notifications ?? true,
          };
          console.log('Using hybrid mapping (frontend + backend fallback)'); // Debug log
        } else {
          // Map backend fields to frontend fields (original mapping)
          mappedPreferences = {
            desktopNotification: preferencesData.enable_client_notifications ?? true,
            unreadNotificationBadge: preferencesData.enable_deal_notifications ?? false,
            pushNotificationTimeout: preferencesData.notification_timeout || "select",
            communicationEmails: preferencesData.enable_email_notifications ?? true,
            announcementsUpdates: preferencesData.enable_marketing_emails ?? false,
            allNotificationSounds: preferencesData.enable_sound_notifications ?? true,
          };
          console.log('Using backend-only mapping'); // Debug log
        }
        
        console.log('Mapped notification preferences:', mappedPreferences); // Debug log
        return mappedPreferences;
      } catch (error) {
        console.warn('Failed to fetch notification preferences, using defaults:', error);
        // Return default preferences instead of undefined
        return {
          desktopNotification: true,
          unreadNotificationBadge: false,
          pushNotificationTimeout: "select",
          communicationEmails: true,
          announcementsUpdates: false,
          allNotificationSounds: true,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Wait for both auth initialization AND user presence
    enabled: isAuthInitialized && !!authUser,
  });
};

// Notification Preferences Update Mutation Hook
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<NotificationPreferences>) => {
      // Map frontend fields to backend fields
      const backendData = {
        enable_client_notifications: data.desktopNotification,
        enable_deal_notifications: data.unreadNotificationBadge,
        notification_timeout: data.pushNotificationTimeout,
        enable_email_notifications: data.communicationEmails,
        enable_marketing_emails: data.announcementsUpdates,
        enable_sound_notifications: data.allNotificationSounds,
      };
      
      console.log('Sending mapped notification preferences:', backendData); // Debug log
      const response = await apiClient.updateNotificationPreferences(backendData);
      return response.data || response;
    },
    onSuccess: (updatedPreferences) => {
      console.log('Notification preferences update successful:', updatedPreferences); // Debug log
      console.log('Update response type:', typeof updatedPreferences, 'Keys:', updatedPreferences ? Object.keys(updatedPreferences) : 'null'); // Debug log
      
      // Map the updated preferences back to frontend format if needed
      let mappedPreferences = updatedPreferences;
      if (updatedPreferences && typeof updatedPreferences === 'object') {
        // Check if we got backend format back and need to map it
        if ('enable_client_notifications' in updatedPreferences) {
          mappedPreferences = {
            desktopNotification: updatedPreferences.enable_client_notifications ?? true,
            unreadNotificationBadge: updatedPreferences.enable_deal_notifications ?? false,
            pushNotificationTimeout: updatedPreferences.notification_timeout || "select",
            communicationEmails: updatedPreferences.enable_email_notifications ?? true,
            announcementsUpdates: updatedPreferences.enable_marketing_emails ?? false,
            allNotificationSounds: updatedPreferences.enable_sound_notifications ?? true,
          };
          console.log('Mapped updated preferences for cache:', mappedPreferences); // Debug log
        } else {
          console.log('Update response already in frontend format'); // Debug log
        }
      }
      
      console.log('Setting query cache with:', mappedPreferences); // Debug log
      
      // Update the preferences cache immediately for a responsive UI
      queryClient.setQueryData(NOTIFICATION_PREFERENCES_QUERY_KEY, mappedPreferences);
      
      // Also invalidate to ensure fresh data on next fetch
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY });
      
      // Show success toast
      toast.success('Notification preferences updated successfully!');
      
      // Force a refetch after invalidation
      setTimeout(() => {
        console.log('Force refetching notification preferences after save...'); // Debug log
        queryClient.refetchQueries({ queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY });
      }, 500);
    },
    onError: (error) => {
      console.error('Notification preferences update failed:', error);
      
      // Show error toast
      toast.error('Failed to update preferences. Please try again.');
    },
  });
};

// Combined hook for easier usage
export const useNotificationPreferencesManagement = () => {
  const preferencesQuery = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  return {
    // Data
    preferences: preferencesQuery.data,
    isLoading: preferencesQuery.isLoading,
    fetchError: preferencesQuery.error,
    isFetchError: preferencesQuery.isError,
    
    // Actions
    updatePreferences: updatePreferencesMutation.mutate,
    updatePreferencesAsync: updatePreferencesMutation.mutateAsync,
    isUpdating: updatePreferencesMutation.isPending,
    updateError: updatePreferencesMutation.error,
    isUpdateError: updatePreferencesMutation.isError,
    
    // Utils
    refetch: preferencesQuery.refetch,
    reset: updatePreferencesMutation.reset,
  };
}; 