/**
 * Standardized React Query Hooks for Team Operations
 * Replaces teamApi pattern throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ==================== QUERY KEYS ====================
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: string) => [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// ==================== TYPES ====================
export interface Team {
  id: number;
  name: string;
  members?: TeamMember[];
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TeamsResponse {
  results: Team[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface CreateTeamData {
  name: string;
  members?: number[];
}

interface UpdateTeamData extends Partial<CreateTeamData> {
  id: string;
}

interface TeamFilters {
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== QUERY HOOKS ====================

/**
 * Fetch all teams with optional filtering
 */
export const useTeams = (filters: TeamFilters = {}) => {
  return useQuery({
    queryKey: teamKeys.list(JSON.stringify(filters)),
    queryFn: async (): Promise<Team[]> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<TeamsResponse>('/team/teams/', Object.fromEntries(params));
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      return Array.isArray(responseData) ? responseData : responseData.results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch a single team by ID
 */
export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: async () => {
      const response = await apiClient.get<Team>(`/team/teams/${teamId}/`);
      return response.data;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new team
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      const response = await apiClient.post<Team>('/team/teams/', data);
      return response.data;
    },
    
    onSuccess: (newTeam) => {
      // Invalidate teams list
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      
      // Set the new team data
      queryClient.setQueryData(teamKeys.detail(newTeam.id.toString()), newTeam);
      
      toast.success('Team created successfully');
    },
    
    onError: (error) => {
      console.error('Failed to create team:', error);
      toast.error('Failed to create team');
    },
  });
};

/**
 * Update an existing team
 */
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateTeamData) => {
      const response = await apiClient.put<Team>(`/team/teams/${id}/`, data);
      return response.data;
    },
    
    onSuccess: (updatedTeam, variables) => {
      // Update the specific team in cache
      queryClient.setQueryData(
        teamKeys.detail(variables.id),
        updatedTeam
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      
      toast.success('Team updated successfully');
    },
    
    onError: (error) => {
      console.error('Failed to update team:', error);
      toast.error('Failed to update team');
    },
  });
};

/**
 * Delete a team
 */
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      await apiClient.delete(`/team/teams/${teamId}/`);
    },
    
    onSuccess: (_, teamId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: teamKeys.detail(teamId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      
      toast.success('Team deleted successfully');
    },
    
    onError: (error) => {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team');
    },
  });
};

/**
 * Add members to a team
 */
export const useAddTeamMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userIds }: { teamId: string; userIds: number[] }) => {
      const response = await apiClient.post(`/team/teams/${teamId}/members/`, { user_ids: userIds });
      return response.data;
    },
    
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch members
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      
      toast.success('Team members added successfully');
    },
    
    onError: (error) => {
      console.error('Failed to add team members:', error);
      toast.error('Failed to add team members');
    },
  });
};

/**
 * Remove member from a team
 */
export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await apiClient.delete(`/team/teams/${teamId}/members/${userId}/`);
    },
    
    onSuccess: (_, { teamId }) => {
      // Invalidate team details to refetch members
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      
      toast.success('Team member removed successfully');
    },
    
    onError: (error) => {
      console.error('Failed to remove team member:', error);
      toast.error('Failed to remove team member');
    },
  });
};