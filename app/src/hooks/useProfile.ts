import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User } from '@/lib/types/roles';
import { useAuth, useAuthStore } from '@/stores';

// Query Keys
const PROFILE_QUERY_KEY = ['profile'];

// Profile Query Hook
export const useProfile = () => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const response = await apiClient.getProfile();
      const userData = response.data;
      
      // Ensure avatar field is properly mapped from nested profile structure
      if (!userData.avatar && (userData as any)?.profile?.profile_picture) {
        userData.avatar = (userData as any).profile.profile_picture;
      }
      
      return userData;
    },
    initialData: authUser || undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Wait for both auth initialization AND user presence
    enabled: isAuthInitialized && !!authUser,
  });
};

// Profile Update Mutation Hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      console.log('Updating profile with data:', data); // Debug log
      const response = await apiClient.updateProfile(data);
      console.log('Profile update response:', response.data); // Debug log
      return response.data;
    },
    onSuccess: (updatedUser) => {
      console.log('Profile update successful:', updatedUser); // Debug log
      
      // Ensure avatar field is properly mapped from nested profile structure
      if (!updatedUser.avatar && (updatedUser as any)?.profile?.profile_picture) {
        updatedUser.avatar = (updatedUser as any).profile.profile_picture;
      }
      
      // Update the profile cache immediately
      queryClient.setQueryData(PROFILE_QUERY_KEY, updatedUser);
      
      // Sync the auth store so the latest user data persists across refreshes
      const { updateUser } = useAuthStore.getState();
      updateUser(updatedUser as User);
      
      // Invalidate and refetch profile to ensure fresh data
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      
      // Also refetch to ensure we have the latest server data
      queryClient.refetchQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
};

// Combined hook for easier usage
export const useProfileManagement = () => {
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();

  return {
    // Data
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    fetchError: profileQuery.error,
    isFetchError: profileQuery.isError,
    
    // Actions
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,
    isUpdateError: updateProfileMutation.isError,
    isUpdateSuccess: updateProfileMutation.isSuccess,
    
    // Utils
    refetch: profileQuery.refetch,
    resetUpdate: updateProfileMutation.reset,
  };
}; 