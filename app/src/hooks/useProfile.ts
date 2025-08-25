import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { User } from '@/types';
import { useAuth, useAuthStore } from '@/stores';

// Query Keys
const PROFILE_QUERY_KEY = ['profile'];

// Profile Query Hook
export const useProfile = () => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      console.log('Fetching profile from API...'); // Debug log
      const response = await apiClient.getProfile();
      console.log('Profile hook - Raw API response:', response); // Debug log
      
      let userData = response?.data;
      console.log('Profile hook - Extracted userData:', userData); // Debug log
      
      // If userData is undefined/null but response has direct user data
      if (!userData && response && (response.id || response.email)) {
        console.log('Profile hook - Using response as userData directly'); // Debug log
        userData = response;
      }
      
      // If still no userData, throw error to trigger retry or fallback
      if (!userData) {
        console.error('Profile hook - No valid user data found in response'); // Debug log
        throw new Error('No profile data returned from server');
      }
      
      // Ensure avatar field is properly mapped from nested profile structure
      if (userData && typeof userData === 'object') {
        // Map profile picture to avatar field for frontend consistency
        const profilePicture = (userData as any)?.profile?.profile_picture;
        if (profilePicture) {
          userData.avatar = profilePicture;
          console.log('Profile hook - Mapped profile picture to avatar:', profilePicture); // Debug log
        } else {
          userData.avatar = null; // Ensure avatar field exists even if null
          console.log('Profile hook - No profile picture found, set avatar to null'); // Debug log
        }
      }
      
      console.log('Profile hook - Final userData with avatar:', userData.avatar); // Debug log
      return userData;
    },
    // Aggressive caching strategy to ensure fresh data on refresh
    staleTime: 0, // Always consider data stale to force fresh fetches
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    retry: 1,
    // Wait for both auth initialization AND user presence
    enabled: isAuthInitialized && !!authUser,
  });
};

// Profile Update Mutation Hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, Partial<User>>({
    mutationFn: async (data: Partial<User>): Promise<User> => {
      console.log('Updating profile with data:', data); // Debug log
      const response = await apiClient.updateProfile(data);
      console.log('Profile update response:', response); // Debug log
      
      // Handle different response structures from API client
      if (response && typeof response === 'object') {
        // If response has .data property, use it; otherwise use response directly
        const userData = response.data || response;
        console.log('Profile update userData:', userData); // Debug log
        return userData as User;
      }
      
      console.warn('Unexpected profile update response structure:', response);
      throw new Error('Invalid response format');
    },
    onSuccess: (updatedUser) => {
      console.log('Profile update successful:', updatedUser); // Debug log
      
      // Safely handle avatar field mapping
      if (updatedUser && typeof updatedUser === 'object') {
        // Map profile picture to avatar field for frontend consistency
        const profilePicture = (updatedUser as any)?.profile?.profile_picture;
        if (profilePicture) {
          updatedUser.avatar = profilePicture;
          console.log('Profile update success - Mapped profile picture to avatar:', profilePicture); // Debug log
        } else if (!updatedUser.avatar) {
          updatedUser.avatar = undefined; // Ensure avatar field exists even if undefined
          console.log('Profile update success - No profile picture found, set avatar to null'); // Debug log
        }
        
        // CRITICAL: Ensure updated user maintains correct role before cache update
        const authStore = useAuthStore.getState();
        const currentUser = authStore.user;
        
        if (currentUser && updatedUser.role !== currentUser.role) {
          console.warn('Profile update attempted to change user role from', currentUser.role, 'to', updatedUser.role);
          console.warn('Preserving original role to prevent sidebar corruption');
          updatedUser.role = currentUser.role;
        }
        
        // Force immediate cache invalidation and refetch FIRST
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        

                  // Wait for fresh data, then update auth store
          setTimeout(async () => {
            try {
              await queryClient.refetchQueries({ queryKey: PROFILE_QUERY_KEY });
              
              // Get fresh data from cache
              const freshProfileData = queryClient.getQueryData(PROFILE_QUERY_KEY);
              console.log('Fresh profile data after update:', freshProfileData);
              
              // Update auth store with fresh data that includes avatar
              // CRITICAL: Only update non-role fields to prevent role corruption
              if (freshProfileData) {
                const authStore = useAuthStore.getState();
                const currentUser = authStore.user;
                
                if (currentUser) {
                  const safeProfileData = { ...(freshProfileData as User) };
                  // Keep the original role to prevent corruption
                  safeProfileData.role = currentUser.role;
                  
                  console.log('Auth store updating with safe profile data (role preserved):', safeProfileData);
                  authStore.updateUser(safeProfileData);
                  console.log('Auth store updated with fresh profile data');
                }
              }
            } catch (error) {
              console.warn('Failed to refetch profile data:', error);
            }
          }, 200);
        
      } else {
        console.warn('Profile update response is not a valid object:', updatedUser);
        // Still invalidate cache even if response format is unexpected
        queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      }
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