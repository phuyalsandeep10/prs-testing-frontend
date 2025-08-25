/**
 * Standardized React Query Hooks for Organization Operations
 * Replaces manual organization API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiResponse } from '@/lib/api-client';

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
  description?: string;
  admin_email?: string;
  is_active: boolean;
  created_at?: string;
  created_by?: number;
  created_by_username?: string;
  user_count?: number;
  role_count?: number;
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
      
      console.log('🔍 useOrganizations - Raw API response:', response);
      
      // Handle ApiResponse wrapper structure (response has data property)
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        const data = response.data;
        console.log('🔍 useOrganizations - Extracted data:', data);
        
        // If data is an array, return it directly
        if (Array.isArray(data)) {
          console.log('✅ useOrganizations - Returning array of organizations:', data.length);
          return data;
        }
        
        // If data is a paginated response, extract results
        if (data && typeof data === 'object' && 'results' in data) {
          console.log('✅ useOrganizations - Returning paginated results:', data.results?.length || 0);
          return (data as OrganizationsResponse).results || [];
        }
        
        // If data is a single organization object, wrap in array
        if (data && typeof data === 'object' && 'id' in data) {
          console.log('✅ useOrganizations - Returning single organization as array');
          return [data as Organization];
        }
      }
      
      // Fallback: Handle direct array responses (legacy)
      if (Array.isArray(response)) {
        console.log('✅ useOrganizations - Returning direct array response');
        return response;
      }
      
      // Fallback: Handle direct paginated responses (legacy)
      if (response && typeof response === 'object' && 'results' in response) {
        console.log('✅ useOrganizations - Returning direct paginated response');
        return (response as OrganizationsResponse).results || [];
      }
      
      console.error('❌ useOrganizations - Unexpected response structure:', response);
      return [];
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
    queryFn: async (): Promise<Organization> => {
      const response = await apiClient.get<Organization>(`/organizations/${organizationId}/`);
      console.log('🔍 useOrganization - API response:', response);
      
      // Handle ApiResponse wrapper structure
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        console.log('✅ useOrganization - Extracted data:', response.data);
        return response.data;
      }
      
      // Fallback for direct response
      console.log('✅ useOrganization - Using direct response');
      return response.data || response;
    },
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
    mutationFn: async (data: CreateOrganizationData) => {
      const response = await apiClient.post<Organization>('/organizations/', data);
      console.log('🔍 useCreateOrganization - API response:', response);
      
      // Handle ApiResponse wrapper structure
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        console.log('✅ useCreateOrganization - Extracted data:', response.data);
        return response.data;
      }
      
      // Fallback for direct response
      console.log('✅ useCreateOrganization - Using direct response');
      return response.data || response;
    },
    
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
    mutationFn: async ({ id, ...data }: UpdateOrganizationData) => {
      const response = await apiClient.put<Organization>(`/organizations/${id}/`, data);
      console.log('🔍 useUpdateOrganization - API response:', response);
      
      // Handle ApiResponse wrapper structure
      if (response && typeof response === 'object' && 'data' in response && response.data) {
        console.log('✅ useUpdateOrganization - Extracted data:', response.data);
        return response.data;
      }
      
      // Fallback for direct response
      console.log('✅ useUpdateOrganization - Using direct response');
      return response.data || response;
    },
    
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
      queryFn: async () => {
        const response = await apiClient.get<Organization>(`/organizations/${organizationId}/`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
