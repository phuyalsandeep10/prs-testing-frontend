import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
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
      const response = await apiClient.getNotificationPreferences();
      return response.data;
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
      const response = await apiClient.updateNotificationPreferences(data);
      return response.data;
    },
    onSuccess: (updatedPreferences) => {
      // Update the preferences cache immediately for a responsive UI
      queryClient.setQueryData(NOTIFICATION_PREFERENCES_QUERY_KEY, updatedPreferences);
      
      // Show success toast
      toast.success('Notification preferences updated successfully!');
      
      // Optionally, you can still invalidate to ensure data is fresh,
      // but setQueryData often makes this unnecessary for the immediate user experience.
      // queryClient.invalidateQueries({ queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY });
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