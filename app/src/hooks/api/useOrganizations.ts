/**
 * Standardized React Query Hooks for Organization Operations
 * Replaces manual organization API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ==================== QUERY KEYS ====================
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: string) => [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

// ==================== TYPES ====================
export interface Organization {
  id: number;
  name: string;
  admin_email?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface OrganizationsResponse {
  results?: Organization[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface CreateOrganizationData {
  name: string;
  is_active: boolean;
}

interface UpdateOrganizationData extends Partial<CreateOrganizationData> {
  id: number;
}

// ==================== QUERY HOOKS ====================

/**
 * Fetch all organizations
 */
export const useOrganizations = () => {
  return useQuery({
    queryKey: organizationKeys.lists(),
    queryFn: async (): Promise<Organization[]> => {
      const response = await apiClient.get<OrganizationsResponse | Organization[]>('/organizations/');
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        return response;
      }
      
      return (response as OrganizationsResponse).results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch a single organization by ID
 */
export const useOrganization = (organizationId: string) => {
  return useQuery({
    queryKey: organizationKeys.detail(organizationId),
    queryFn: () => apiClient.get<Organization>(`/organizations/${organizationId}/`),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new organization
 */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationData) => 
      apiClient.post<Organization>('/organizations/', data),
    
    onSuccess: (newOrganization) => {
      // Invalidate organizations list
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
      
      // Set the new organization data
      queryClient.setQueryData(
        organizationKeys.detail(newOrganization.id.toString()), 
        newOrganization
      );
      
      // Dispatch custom event for compatibility with existing code
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('organizationCreated', { 
          detail: newOrganization 
        }));
      }
    },
    
    onError: (error) => {
      console.error('Failed to create organization:', error);
    },
  });
};

/**
 * Update an existing organization
 */
export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateOrganizationData) =>
      apiClient.put<Organization>(`/organizations/${id}/`, data),
    
    onSuccess: (updatedOrganization, variables) => {
      // Update the specific organization in cache
      queryClient.setQueryData(
        organizationKeys.detail(variables.id.toString()),
        updatedOrganization
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to update organization:', error);
    },
  });
};

/**
 * Delete an organization
 */
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organizationId: number) =>
      apiClient.delete(`/organizations/${organizationId}/`),
    
    onSuccess: (_, organizationId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: organizationKeys.detail(organizationId.toString()) 
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: organizationKeys.lists() });

      // Dispatch event so dashboards can refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('organizationDeleted', { detail: organizationId }));
      }
    },
    
    onError: (error) => {
      console.error('Failed to delete organization:', error);
    },
  });
};

/**
 * Prefetch organization data
 */
export const usePrefetchOrganization = () => {
  const queryClient = useQueryClient();
  
  return (organizationId: string) => {
    queryClient.prefetchQuery({
      queryKey: organizationKeys.detail(organizationId),
      queryFn: () => apiClient.get<Organization>(`/organizations/${organizationId}/`),
      staleTime: 5 * 60 * 1000,
    });
  };
};
