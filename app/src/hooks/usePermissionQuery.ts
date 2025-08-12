import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// Types
interface Permission {
  id: number;
  name: string;
  codename: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  organization: number | null;
  organization_name: string | null;
  permissions: number[];
}

interface GroupedPermissions {
  [category: string]: Permission[];
}

interface RolePermissions {
  [roleId: number]: {
    [permissionId: number]: boolean;
  };
}

// Hook for fetching permissions
export const usePermissionsQuery = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async (): Promise<GroupedPermissions> => {
      console.log('🚀 Making permissions API call to /permissions/all/');
      try {
        const response = await apiClient.get<GroupedPermissions>('/permissions/all/');
        
        console.log('🔍 Permissions API response:', response);
        console.log('🔍 Permissions response.data:', response.data);
        console.log('🔍 Permissions response type:', typeof response);
        console.log('🔍 Permissions response.data type:', typeof response.data);
        
        // The response itself might be the data (not wrapped in .data)
        const actualData = response.data || response;
        
        // Handle undefined/null response
        if (!actualData || typeof actualData !== 'object') {
          console.log('⚠️ Permissions response is undefined/null, returning empty object');
          return {};
        }
        
        console.log('✅ Permissions data loaded:', actualData);
        return actualData as GroupedPermissions;
      } catch (error) {
        console.error('❌ Permissions API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: 'Failed to fetch permissions',
    },
  });
};

// Hook for fetching roles
export const useRolesQuery = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      console.log('🚀 Making roles API call to /permissions/roles/');
      try {
        const response = await apiClient.get<Role[]>('/permissions/roles/');
        
        console.log('🔍 Roles API response:', response);
        console.log('🔍 Roles response.data:', response.data);
        console.log('🔍 Roles response type:', typeof response);
        console.log('🔍 Roles response.data type:', typeof response.data);
        
        // The response itself might be the data (not wrapped in .data)
        const actualData = response.data || response;
        
        // Handle undefined/null response
        if (!actualData) {
          console.log('⚠️ Roles response is undefined/null, returning empty array');
          return [];
        }
        
        const roles = Array.isArray(actualData) ? actualData : [];
        console.log('✅ Roles data loaded:', roles);
        return roles;
      } catch (error) {
        console.error('❌ Roles API error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: 'Failed to fetch roles',
    },
  });
};

// Hook for creating a new role
export const useCreateRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; permissions?: number[] }) => {
      const response = await apiClient.post('/permissions/roles/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create role';
      toast.error(errorMessage);
    },
  });
};

// Hook for updating a role
export const useUpdateRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { id: number; name?: string; permissions?: number[] }) => {
      const { id, ...updateData } = data;
      const response = await apiClient.patch(`/permissions/roles/${id}/`, updateData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all queries that might contain role information
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      // Also invalidate any paginated queries that might contain role data
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key.includes('users') ||
            key.includes('teams') ||
            key.includes('roles') ||
            key.includes('projects') ||
            key.includes('clients')
          );
        }
      });
      
      toast.success('Role updated successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update role';
      toast.error(errorMessage);
    },
  });
};

// Hook for deleting a role
export const useDeleteRoleMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roleId: number) => {
      await apiClient.delete(`/permissions/roles/${roleId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete role';
      toast.error(errorMessage);
    },
  });
};

// Export types for use in components
export type { Permission, Role, GroupedPermissions, RolePermissions }; 