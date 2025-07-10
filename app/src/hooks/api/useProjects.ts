/**
 * Standardized React Query Hooks for Project Operations
 * Replaces manual project API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ==================== QUERY KEYS ====================
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// ==================== TYPES ====================
export interface Project {
  id: number;
  name: string;
  description?: string;
  organization?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProjectsResponse {
  results?: Project[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface CreateProjectData {
  name: string;
  description?: string;
  organization?: number;
  is_active?: boolean;
}

interface UpdateProjectData extends Partial<CreateProjectData> {
  id: number;
}

// ==================== QUERY HOOKS ====================

/**
 * Fetch all projects
 */
export const useProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: async (): Promise<Project[]> => {
      const response = await apiClient.get<ProjectsResponse | Project[]>('/projects/');
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        return response;
      }
      
      return (response as ProjectsResponse).results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch a single project by ID
 */
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => apiClient.get<Project>(`/projects/${projectId}/`),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch projects for a specific organization
 */
export const useOrganizationProjects = (organizationId: string) => {
  return useQuery({
    queryKey: projectKeys.list(JSON.stringify({ organization: organizationId })),
    queryFn: async (): Promise<Project[]> => {
      const response = await apiClient.get<ProjectsResponse>(`/projects/?organization=${organizationId}`);
      return Array.isArray(response) ? response : response.results || [];
    },
    enabled: !!organizationId,
    staleTime: 3 * 60 * 1000,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => 
      apiClient.post<Project>('/projects/', data),
    
    onSuccess: (newProject) => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      
      // Set the new project data
      queryClient.setQueryData(
        projectKeys.detail(newProject.id.toString()), 
        newProject
      );
      
      // Invalidate organization-specific projects if applicable
      if (newProject.organization) {
        queryClient.invalidateQueries({ 
          queryKey: projectKeys.list(JSON.stringify({ organization: newProject.organization }))
        });
      }
    },
    
    onError: (error) => {
      console.error('Failed to create project:', error);
    },
  });
};

/**
 * Update an existing project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateProjectData) =>
      apiClient.put<Project>(`/projects/${id}/`, data),
    
    onSuccess: (updatedProject, variables) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        projectKeys.detail(variables.id.toString()),
        updatedProject
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to update project:', error);
    },
  });
};

/**
 * Delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: number) =>
      apiClient.delete(`/projects/${projectId}/`),
    
    onSuccess: (_, projectId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: projectKeys.detail(projectId.toString()) 
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to delete project:', error);
    },
  });
};

/**
 * Prefetch project data
 */
export const usePrefetchProject = () => {
  const queryClient = useQueryClient();
  
  return (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: projectKeys.detail(projectId),
      queryFn: () => apiClient.get<Project>(`/projects/${projectId}/`),
      staleTime: 5 * 60 * 1000,
    });
  };
};
