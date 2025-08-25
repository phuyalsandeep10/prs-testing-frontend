/**
 * Standardized React Query Hooks for Role & Permission Operations
 * Replaces manual role API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ==================== QUERY KEYS ====================
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: string) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  organizationRoles: (orgId: string) => [...roleKeys.all, 'organization', orgId] as const,
};

// ==================== TYPES ====================
export interface Role {
  id: number;
  name: string;
  organization: number | null;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type?: number;
}

interface RolesResponse {
  results?: Role[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface CreateRoleData {
  name: string;
  organization?: number;
  permissions?: number[];
}

interface UpdateRoleData extends Partial<CreateRoleData> {
  id: number;
}

interface CreateAdminData {
  first_name: string;
  last_name: string;
  email: string;
  organization: string | number;
  is_active: boolean;
}

// ==================== QUERY HOOKS ====================

/**
 * Fetch all roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async (): Promise<Role[]> => {
      const response = await apiClient.get<RolesResponse | Role[]>('/permissions/roles/');
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      
      // Handle undefined/null response
      if (!responseData || responseData === undefined || responseData === null) {
        return [];
      }
      
      // Handle both paginated and direct array responses
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      return (responseData as RolesResponse).results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch roles for a specific organization
 */
export const useOrganizationRoles = (organizationId: string) => {
  return useQuery({
    queryKey: roleKeys.organizationRoles(organizationId),
    queryFn: async (): Promise<Role[]> => {
      const response = await apiClient.get<RolesResponse | Role[]>(
        '/permissions/roles/', { organization: organizationId }
      );
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      
      // Handle undefined/null response
      if (!responseData || responseData === undefined || responseData === null) {
        return [];
      }
      
      // Handle both paginated and direct array responses
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      return (responseData as RolesResponse).results || [];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a single role by ID
 */
export const useRole = (roleId: string) => {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: async () => {
      const response = await apiClient.get<Role>(`/permissions/roles/${roleId}/`);
      return response.data;
    },
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch all permissions
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async (): Promise<Permission[]> => {
      const response = await apiClient.get<Permission[]>('/permissions/all/');
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      
      // Handle undefined/null response
      if (!responseData || responseData === undefined || responseData === null) {
        return [];
      }
      
      return Array.isArray(responseData) ? responseData : [];
    },
    staleTime: 10 * 60 * 1000, // Permissions rarely change
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleData) => {
      const response = await apiClient.post<Role>('/permissions/roles/', data);
      return response.data;
    },
    
    onSuccess: (newRole) => {
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      // Set the new role data
      queryClient.setQueryData(
        roleKeys.detail(newRole.id.toString()), 
        newRole
      );
      
      // Invalidate organization-specific roles if applicable
      if (newRole.organization) {
        queryClient.invalidateQueries({ 
          queryKey: roleKeys.organizationRoles(newRole.organization.toString())
        });
      }
    },
    
    onError: (error) => {
      console.error('Failed to create role:', error);
    },
  });
};

/**
 * Update an existing role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateRoleData) => {
      const response = await apiClient.put<Role>(`/permissions/roles/${id}/`, data);
      return response.data;
    },
    
    onSuccess: (updatedRole, variables) => {
      // Update the specific role in cache
      queryClient.setQueryData(
        roleKeys.detail(variables.id.toString()),
        updatedRole
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      // Invalidate organization-specific roles if applicable
      if (updatedRole.organization) {
        queryClient.invalidateQueries({ 
          queryKey: roleKeys.organizationRoles(updatedRole.organization.toString())
        });
      }
    },
    
    onError: (error) => {
      console.error('Failed to update role:', error);
    },
  });
};

/**
 * Delete a role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: number) => {
      await apiClient.delete(`/permissions/roles/${roleId}/`);
    },
    
    onSuccess: (_, roleId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: roleKeys.detail(roleId.toString()) 
      });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to delete role:', error);
    },
  });
};

/**
 * Create a new admin user
 */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAdminData) => {
      const response = await apiClient.post<any>('/auth/users/', data);
      return response.data;
    },
    
    onSuccess: (newAdmin) => {
      console.log('Admin created successfully, invalidating queries and dispatching event...');
      
      // Invalidate users queries if they exist
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Dispatch custom event for compatibility with existing code
      if (typeof window !== 'undefined') {
        console.log('Dispatching adminCreated event with detail:', newAdmin);
        
        // Add a small delay to ensure dashboard is ready to receive events
        setTimeout(() => {
          console.log('Dispatching adminCreated event after delay...');
          window.dispatchEvent(new CustomEvent('adminCreated', { 
            detail: newAdmin 
          }));
        }, 100);
      }
    },
    
    onError: (error) => {
      console.error('Failed to create admin:', error);
    },
  });
};

/**
 * Prefetch role data
 */
export const usePrefetchRole = () => {
  const queryClient = useQueryClient();
  
  return (roleId: string) => {
    queryClient.prefetchQuery({
      queryKey: roleKeys.detail(roleId),
      queryFn: async () => {
        const response = await apiClient.get<Role>(`/permissions/roles/${roleId}/`);
        return response.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };
};
