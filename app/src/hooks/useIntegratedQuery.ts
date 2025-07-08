import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUI, useApp, usePermissions } from '@/stores';
import { PaginatedResponse, CreateInput, UpdateInput } from '@/types';
import { User } from '@/lib/types/roles';
import { apiClient } from '@/lib/api';
import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasPermission as hasRolePermission } from '@/lib/auth/permissions';

// Types
interface Deal {
  id: string;
  client_id: string;
  title: string;
  amount: number;
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  client_name: string;
  email: string;
  phone_number: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface Team {
  id: string;
  name: string;
  team_lead: User;
  members: User[];
  organization: string;
  created_at: string;
  updated_at: string;
}

interface Commission {
  id: number;
  fullName: string;
  totalSales: number;
  currency: 'NEP' | 'AUD' | 'USD';
  rate: number;
  percentage: number;
  bonus: number;
  penalty: number;
  convertedAmt: number;
  total: number;
  totalReceivable: number;
  createdAt: string;
  updatedAt: string;
}

// Query Keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  deals: ['deals'] as const,
  deal: (id: string) => ['deals', id] as const,
  clients: ['clients'] as const,
  client: (id: string) => ['clients', id] as const,
  teams: ['teams'] as const,
  team: (id: string) => ['teams', id] as const,
  userTeams: (userId: string) => ['users', userId, 'teams'] as const,
  dealPayments: (dealId: string) => ['deals', dealId, 'payments'] as const,
  commission: ['commission'] as const,
  userCommission: (userId: string) => ['users', userId, 'commission'] as const,
} as const;

// Users Management
export const useUsersQuery = (filters?: Record<string, any>) => {
  const { user, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const canManageUsers = user ? hasRolePermission(user.role, 'manage:users') : false;
  console.log(`[useUsersQuery] Auth check: User role is "${user?.role}". Has "manage:users" permission: ${canManageUsers}`);

  const query = useQuery({
    queryKey: [...queryKeys.users, filters],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      console.log('[useUsersQuery] Fetching users from API...');
      const response = await apiClient.get<PaginatedResponse<User>>('/auth/users/', filters);
      console.log('[useUsersQuery] Raw API response:', response);
      return response.data!;
    },
    enabled: isAuthInitialized && canManageUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors using React Query v5 pattern
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading users',
      message: query.error.message || 'Failed to load users',
    });
  }

  return query;
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (userData: CreateInput<User>): Promise<User> => {
      const response = await apiClient.post<User>('/auth/users/', userData);
      return response.data!;
    },
    onMutate: async (newUser) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users });
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(queryKeys.users);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.users, (old: PaginatedResponse<User> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          data: [
            {
              id: `temp-${Date.now()}`,
              ...newUser,
              status: 'pending' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            } as User,
            ...old.data,
          ],
        };
      });
      
      return { previousUsers };
    },
    onError: (err: any, newUser, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(queryKeys.users, context.previousUsers);
      }
      
      addNotification({
        type: 'error',
        title: 'Error creating user',
        message: err.message || 'Failed to create user',
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      addNotification({
        type: 'success',
        title: 'User created successfully',
        message: `${data.first_name} ${data.last_name} has been added to the system.`,
      });
      
      // Add to recent items
      addRecentItem({
        id: data.id,
        type: 'user',
        name: `${data.first_name} ${data.last_name}`,
        url: `/org-admin/manage-users/${data.id}`,
      });
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInput<User> }): Promise<User> => {
      const response = await apiClient.patch<User>(`/auth/users/${id}/`, data);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.invalidateQueries({ queryKey: queryKeys.user(data.id) });
      
      addNotification({
        type: 'success',
        title: 'User updated successfully',
        message: `${data.first_name} ${data.last_name} has been updated.`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error updating user',
        message: err.message || 'Failed to update user',
      });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete<void>(`/auth/users/${id}/`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      
      addNotification({
        type: 'success',
        title: 'User deleted successfully',
        message: 'The user has been removed from the system.',
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error deleting user',
        message: err.message || 'Failed to delete user',
      });
    },
  });
};

// Deals Management
export const useDealsQuery = (filters?: Record<string, any>) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: [...queryKeys.deals, filters],
    queryFn: async (): Promise<PaginatedResponse<Deal>> => {
      const response = await apiClient.get<Deal[]>('/deals/', {
        params: filters,
      });
      // Transform flat array response to paginated structure
      return {
        data: response.data || [],
        pagination: {
          page: 1,
          limit: response.data?.length || 0,
          total: response.data?.length || 0,
          totalPages: 1,
        },
      };
    },
    enabled: isAuthInitialized, // Remove permission check since salesperson role should see their deals
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle errors using React Query v5 pattern
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading deals',
      message: query.error.message || 'Failed to load deals',
    });
  }

  return query;
};

export const useCreateDealMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (dealData: Partial<Deal>): Promise<Deal> => {
      const response = await apiClient.post<Deal>('/deals/', dealData);
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deals });
      
      addNotification({
        type: 'success',
        title: 'Deal created successfully',
        message: `Deal "${data.title}" has been created.`,
      });
      
      addRecentItem({
        id: data.id,
        type: 'deal',
        name: data.title,
        url: `/deals/${data.id}`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error creating deal',
        message: err.message || 'Failed to create deal',
      });
    },
  });
};

// Clients Management
export const useClientsQuery = (filters?: Record<string, any>) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: [...queryKeys.clients, filters],
    queryFn: async (): Promise<Client[]> => {
      const response = await apiClient.get<Client[]>('/clients/', filters);
      return response.data!;
    },
    enabled: isAuthInitialized && hasPermission('manage:clients'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors using React Query v5 pattern
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading clients',
      message: query.error.message || 'Failed to load clients',
    });
  }

  return query;
};

export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (clientData: CreateInput<Client>): Promise<Client> => {
      const response = await apiClient.post<Client>('/clients/', clientData);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      
      addNotification({
        type: 'success',
        title: 'Client created successfully',
        message: `${data.client_name} has been added to the system.`,
      });
      
      // Add to recent items
      addRecentItem({
        id: data.id,
        type: 'client',
        name: data.client_name,
        url: `/org-admin/manage-clients/${data.id}`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error creating client',
        message: err.message || 'Failed to create client',
      });
    },
  });
};

export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInput<Client> }): Promise<Client> => {
      const response = await apiClient.patch<Client>(`/clients/${id}/`, data);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      queryClient.invalidateQueries({ queryKey: queryKeys.client(data.id) });
      
      addNotification({
        type: 'success',
        title: 'Client updated successfully',
        message: `${data.client_name} has been updated.`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error updating client',
        message: err.message || 'Failed to update client',
      });
    },
  });
};

export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete<void>(`/clients/${id}/`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
      
      addNotification({
        type: 'success',
        title: 'Client deleted successfully',
        message: 'The client has been removed from the system.',
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error deleting client',
        message: err.message || 'Failed to delete client',
      });
    },
  });
};

// Teams Management
export const useTeamsQuery = (filters?: Record<string, any>) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: [...queryKeys.teams, filters],
    queryFn: async (): Promise<PaginatedResponse<Team>> => {
      const response = await apiClient.get<PaginatedResponse<Team>>('/teams/', {
        params: filters,
      });
      return response.data!;
    },
    enabled: isAuthInitialized && hasPermission('manage:users'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors using React Query v5 pattern
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading teams',
      message: query.error.message || 'Failed to load teams',
    });
  }

  return query;
};

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (teamData: CreateInput<Team>): Promise<Team> => {
      const response = await apiClient.post<Team>('/teams/', teamData);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      
      addNotification({
        type: 'success',
        title: 'Team created successfully',
        message: `${data.name} has been added to the system.`,
      });
      
      // Add to recent items
      addRecentItem({
        id: data.id,
        type: 'team',
        name: data.name,
        url: `/org-admin/manage-teams/${data.id}`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error creating team',
        message: err.message || 'Failed to create team',
      });
    },
  });
};

export const useUpdateTeamMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInput<Team> }): Promise<Team> => {
      const response = await apiClient.patch<Team>(`/teams/${id}/`, data);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      queryClient.invalidateQueries({ queryKey: queryKeys.team(data.id) });
      
      addNotification({
        type: 'success',
        title: 'Team updated successfully',
        message: `${data.name} has been updated.`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error updating team',
        message: err.message || 'Failed to update team',
      });
    },
  });
};

export const useDeleteTeamMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete<void>(`/teams/${id}/`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams });
      
      addNotification({
        type: 'success',
        title: 'Team deleted successfully',
        message: 'The team has been removed from the system.',
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error deleting team',
        message: err.message || 'Failed to delete team',
      });
    },
  });
};

// Authentication
export const useLoginMutation = () => {
  const { login } = useAuth();
  const { addNotification } = useUI();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await apiClient.post('/auth/login/', credentials);
      return response.data!;
    },
    onSuccess: (rawData) => {
      const data: any = rawData;
      login(data.token, data.user);
      
      addNotification({
        type: 'success',
        title: 'Login successful',
        message: `Welcome back, ${data.user.first_name}!`,
      });
      
      // Redirect based on role
      const role = data.user.role;
      router.push(`/${role}`);
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Login failed',
        message: err.message || 'Invalid credentials',
      });
    },
  });
};

// Table State Management with URL Synchronization
export const useTableStateSync = (tableId: string) => {
  const { getTableState, updateTableState: setTableState } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tableState = getTableState(tableId);
  
  const updateURL = useCallback((newState: any) => {
    const params = new URLSearchParams(searchParams);
    
    // Update URL params
    if (newState.search) {
      params.set('search', newState.search);
    } else {
      params.delete('search');
    }
    
    if (newState.page > 1) {
      params.set('page', newState.page.toString());
    } else {
      params.delete('page');
    }
    
    if (newState.pageSize !== 10) {
      params.set('pageSize', newState.pageSize.toString());
    } else {
      params.delete('pageSize');
    }
    
    // Update filters
    Object.entries(newState.filters || {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, value as string);
      } else {
        params.delete(key);
      }
    });
    
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);
  
  const setSearch = useCallback((search: string) => {
    const newState = { ...tableState, search, page: 1 };
    setTableState(tableId, newState);
    updateURL(newState);
  }, [tableId, tableState, setTableState, updateURL]);
  
  const setPage = useCallback((page: number) => {
    const newState = { ...tableState, page };
    setTableState(tableId, newState);
    updateURL(newState);
  }, [tableId, tableState, setTableState, updateURL]);
  
  const setPageSize = useCallback((pageSize: number) => {
    const newState = { ...tableState, pageSize, page: 1 };
    setTableState(tableId, newState);
    updateURL(newState);
  }, [tableId, tableState, setTableState, updateURL]);
  
  const setFilters = useCallback((filters: Record<string, any>) => {
    const newState = { ...tableState, filters, page: 1 };
    setTableState(tableId, newState);
    updateURL(newState);
  }, [tableId, tableState, setTableState, updateURL]);
  
  const resetFilters = useCallback(() => {
    const newState = {
      search: '',
      page: 1,
      pageSize: 10,
      filters: {},
      sortBy: null,
      sortOrder: 'asc' as const,
    };
    setTableState(tableId, newState);
    updateURL(newState);
  }, [tableId, setTableState, updateURL]);
  
  return {
    tableState,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  };
};

// Commission Management
export const useCommissionQuery = (filters?: Record<string, any>) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: [...queryKeys.commission, filters],
    queryFn: async (): Promise<PaginatedResponse<Commission>> => {
      const response = await apiClient.get<PaginatedResponse<Commission>>('/commission/', {
        params: filters,
      });
      return response.data!;
    },
    enabled: isAuthInitialized && hasPermission('manage:deals'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors using React Query v5 pattern
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading commission',
      message: query.error.message || 'Failed to load commission',
    });
  }

  return query;
};

export const useCreateCommissionMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (commissionData: CreateInput<Commission>): Promise<Commission> => {
      const response = await apiClient.post<Commission>('/commission/', commissionData);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      
      addNotification({
        type: 'success',
        title: 'Commission created successfully',
        message: `Commission for ${data.fullName} has been added to the system.`,
      });
      
      // Add to recent items
      addRecentItem({
        id: data.id.toString(),
        type: 'deal',
        name: `${data.fullName} Commission`,
        url: `/org-admin/commission/${data.id}`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error creating commission',
        message: err.message || 'Failed to create commission',
      });
    },
  });
};

export const useUpdateCommissionMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateInput<Commission> }): Promise<Commission> => {
      const response = await apiClient.put<Commission>(`/commission/${id}/`, data);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      
      addNotification({
        type: 'success',
        title: 'Commission updated successfully',
        message: `Commission for ${data.fullName} has been updated.`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error updating commission',
        message: err.message || 'Failed to update commission',
      });
    },
  });
};

export const useBulkUpdateCommissionMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (commissionData: UpdateInput<Commission>[]): Promise<Commission[]> => {
      const response = await apiClient.put<Commission[]>('/commission/bulk/', commissionData);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      
      addNotification({
        type: 'success',
        title: 'Bulk commission update successful',
        message: `${data.length} commission records have been updated.`,
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error updating commissions',
        message: err.message || 'Failed to update commissions',
      });
    },
  });
};

export const useDeleteCommissionMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiClient.delete(`/commission/${id}/`);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      
      addNotification({
        type: 'success',
        title: 'Commission deleted successfully',
        message: 'The commission record has been removed from the system.',
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Error deleting commission',
        message: err.message || 'Failed to delete commission',
      });
    },
  });
};

export const useUserCommissionQuery = (userId: string) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: queryKeys.userCommission(userId),
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}/commission/`);
      return response.data!;
    },
    enabled: isAuthInitialized && hasPermission('view:analytics') && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle errors using React Query v5 pattern
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading user commission',
      message: query.error.message || 'Failed to load user commission data',
    });
  }

  return query;
};

// ==================== PAYMENTS ====================
export const useVerifyPaymentMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: 'verified' | 'rejected' }) => {
      // Adjust endpoint/method to your backend spec
      const response = await apiClient.post(`/payments/${paymentId}/verify/`, {
        status,
      });
      return response.data!;
    },
    onSuccess: () => {
      // Refresh deals & payments lists
      queryClient.invalidateQueries({ queryKey: queryKeys.deals });
      addNotification({
        type: 'success',
        title: 'Payment status updated',
        message: 'Payment verification status has been updated.',
      });
    },
    onError: (err: any) => {
      addNotification({
        type: 'error',
        title: 'Verification failed',
        message: err.message || 'Could not update payment status',
      });
    },
  });
}; 