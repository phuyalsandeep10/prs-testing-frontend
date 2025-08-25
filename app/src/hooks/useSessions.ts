import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { UserSession } from '@/types';
import { useAuth } from '@/stores';

// Query Keys
const SESSIONS_QUERY_KEY = ['sessions'];

// Sessions Query Hook
export const useSessions = () => {
  const { user: authUser, isAuthInitialized } = useAuth();

  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: async (): Promise<UserSession[]> => {
      console.log('Sessions hook - Fetching sessions...'); // Debug log
      const response = await apiClient.getSessions();
      console.log('Sessions hook - Raw API response:', response); // Debug log

      // The backend returns a paginated response, so we need to extract the 'results' array.
      // If the response is already an array, use it directly for backward compatibility.
      let sessionsData = [];
      
      if (Array.isArray(response?.data)) {
        sessionsData = response.data;
      } else if (Array.isArray(response?.data?.results)) {
        sessionsData = response.data.results;
      } else if (Array.isArray(response)) {
        sessionsData = response;
      } else {
        console.warn('Sessions - Unexpected response structure:', response);
        sessionsData = [];
      }
      
      console.log('Sessions hook - Final sessions data:', sessionsData); // Debug log
      return sessionsData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Wait for both auth initialization AND user presence
    enabled: isAuthInitialized && !!authUser,
  });
};

// Revoke Session Mutation Hook
export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiClient.revokeSession(sessionId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch sessions
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
    onError: (error) => {
      console.error('Session revoke failed:', error);
    },
  });
};

// Combined hook for easier usage
export const useSessionManagement = () => {
  const sessionsQuery = useSessions();
  const revokeSessionMutation = useRevokeSession();

  return {
    // Data
    sessions: sessionsQuery.data || [],
    isLoading: sessionsQuery.isLoading,
    isError: sessionsQuery.isError,
    error: sessionsQuery.error,
    
    // Actions
    revokeSession: revokeSessionMutation.mutate,
    revokeSessionAsync: revokeSessionMutation.mutateAsync,
    isRevoking: revokeSessionMutation.isPending,
    revokeError: revokeSessionMutation.error,
    
    // Utils
    refetch: sessionsQuery.refetch,
    reset: revokeSessionMutation.reset,
  };
}; 