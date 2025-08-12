import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUI, useApp, usePermissions } from '@/stores';
import { PaginatedResponse, CreateInput, UpdateInput } from '@/types';
import { User } from '@/lib/types/roles';
import { apiClient } from '@/lib/api-client';
import { useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasPermission as hasRolePermission } from '@/lib/auth/permissions';
import { redirectUserByRole } from '@/lib/utils/routing';
import { toast } from 'sonner';
// (no external ApiResponse type)

// Types
interface PaginatedApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface Deal {
  id: string;
  deal_id: string;
  organization: string;
  client: {
    id: string;
    client_name: string;
  };
  client_id?: string;
  created_by: {
    id: string;
    full_name: string;
    email: string;
  };
  updated_by?: {
    id: string;
    full_name: string;
    email: string;
  };
  payment_status: 'initial payment' | 'partial_payment' | 'full_payment';
  verification_status: 'verified' | 'pending' | 'rejected';
  client_status: 'pending' | 'loyal' | 'bad_debt';
  source_type: 'linkedin' | 'instagram' | 'google' | 'referral' | 'others';
  deal_name: string;
  deal_value: string;
  currency: string;
  deal_date: string;
  due_date?: string;
  payment_method: 'wallet' | 'bank' | 'cheque' | 'cash';
  deal_remarks?: string | null;
  version: 'original' | 'edited';
  created_at: string;
  updated_at: string;
  payments?: any[];
  activity_logs?: any[];
  
  // Aliases provided by backend serializer
  client_name: string;
  pay_status: 'initial payment' | 'partial_payment' | 'full_payment';
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
  id: string;
  fullName: string;
  totalSales: number;
  currency: string; // Updated to support all ISO currencies
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
export const useUsersQuery = (orgId: string, filters?: Record<string, any>) => {
  const { user, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const canManageUsers = user ? hasRolePermission(user.role, 'manage:users') : false;

  const query = useQuery({
    queryKey: [...queryKeys.users, orgId, filters],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      // console.log('🔍 [USER_TABLE_DEBUG] Fetching users from API for orgId:', orgId);
      
      try {
        const response = await apiClient.get<any>('/auth/users/', { ...filters, organization: orgId });
        
        // Handle DRF pagination format
        if (response.data && typeof response.data === 'object' && 'results' in response.data) {
          // DRF paginated response
          const result = {
            data: response.data.results || [],
            pagination: {
              page: 1,
              limit: response.data.results?.length || 0,
              total: response.data.count || 0,
              totalPages: Math.ceil((response.data.count || 0) / (response.data.results?.length || 1)),
            },
          };
          // console.log('✅ [USER_TABLE_DEBUG] API returned', result.data.length, 'users');
          // console.log('👥 [USER_TABLE_DEBUG] Fetched user IDs:', result.data.map(u => u.id));
          return result;
        } else if (Array.isArray(response.data)) {
          // Direct array response
          const result = {
            data: response.data,
            pagination: {
              page: 1,
              limit: response.data.length,
              total: response.data.length,
              totalPages: 1,
            },
          };
          // console.log('✅ [USER_TABLE_DEBUG] API returned', result.data.length, 'users (direct array)');
          // console.log('👥 [USER_TABLE_DEBUG] Fetched user IDs:', result.data.map(u => u.id));
          return result;
        } else {
          // Fallback for unexpected format
          // console.warn('⚠️ [USER_TABLE_DEBUG] Unexpected response format:', response.data);
          return {
            data: [],
            pagination: {
              page: 1,
              limit: 0,
              total: 0,
              totalPages: 0,
            },
          };
        }
      } catch (error) {
        // console.error('❌ [USER_TABLE_DEBUG] API call failed:', error);
        throw error;
      }
    },
    enabled: isAuthInitialized && hasRolePermission(user?.role, 'view_user'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: (failureCount, error) => {
      return failureCount < 3; // Retry up to 3 times
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      // console.log('🚀 [USER_TABLE_DEBUG] Creating user with data:', userData);
      const response = await apiClient.post<User>('/auth/users/', userData);
      // Support both direct payloads and axios-like { data }
      const payload = (response as any)?.data ?? response;
      if (!payload) {
        throw new Error('Invalid response data from server');
      }
      return payload as User;
    },
    onMutate: async (newUser) => {
      const rawOrg = (newUser as any).organization;
      if (!rawOrg && rawOrg !== 0) return;
      const orgId = String(rawOrg);

      // console.log('🔄 [USER_TABLE_DEBUG] Optimistic update for orgId:', orgId);
      
      // Match the exact query key used by useUsersQuery (includes filters parameter)
      const queryKey = [...queryKeys.users, orgId, undefined];

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousUsers = queryClient.getQueryData(queryKey);
      // console.log('📸 [USER_TABLE_DEBUG] Previous cache data:', previousUsers);
      
      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: PaginatedResponse<User> | undefined) => {
        if (!old) return old;
        
        const newUserWithDefaults = {
          id: `temp-${Date.now()}`,
          username: (newUser as any).username || (newUser as any).email?.split('@')[0] || 'temp',
          first_name: (newUser as any).first_name || '',
          last_name: (newUser as any).last_name || '',
          email: (newUser as any).email || '',
          contact_number: (newUser as any).contact_number || '',
          phoneNumber: (newUser as any).contact_number || '',
          organization: (newUser as any).organization,
          role: (newUser as any).role ? { id: (newUser as any).role, name: 'Loading...' } : null,
          is_active: true,
          teams: [],
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as unknown as User;
        
        const updatedData = {
          ...old,
          data: [newUserWithDefaults, ...old.data],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
        
        // console.log('🔄 [USER_TABLE_DEBUG] Optimistic update applied. New count:', updatedData.data.length);
        return updatedData;
      });
      
      return { previousUsers };
    },
    onError: (err: any, newUser, context) => {
      // console.log('❌ [USER_TABLE_DEBUG] User creation failed, rolling back optimistic update');
      
      // Rollback on error
      const orgId = String((newUser as any).organization ?? '');
      if (context?.previousUsers && orgId) {
        queryClient.setQueryData([...queryKeys.users, orgId, undefined], context.previousUsers);
      }
      
      addNotification({
        type: 'error',
        title: 'Error creating user',
        message: err.message || 'Failed to create user',
      });
    },
    onSuccess: (data, variables) => {
      // console.log('👤 [USER_TABLE_DEBUG] Created user details:', data);
      // console.log('🎉 [USER_TABLE_DEBUG] User creation succeeded! Starting cache invalidation...');
      // console.log('🔑 [USER_TABLE_DEBUG] Query key to invalidate:', [...queryKeys.users, String((data as any).organization ?? ''), undefined]);
      
      // Check current cache state before invalidation
      const currentCache = queryClient.getQueryData([...queryKeys.users, String((data as any).organization ?? ''), undefined]);
      // console.log('💾 [USER_TABLE_DEBUG] Current cache before invalidation:', currentCache);
      
      if(String((data as any).organization ?? '')) {
        // Invalidate and refetch the exact query
        queryClient.invalidateQueries({ 
          queryKey: [...queryKeys.users, String((data as any).organization ?? ''), undefined],
          exact: true 
        });
        
        queryClient.refetchQueries({ 
          queryKey: [...queryKeys.users, String((data as any).organization ?? ''), undefined],
          exact: true 
        });
        
        // console.log('🔄 [USER_TABLE_DEBUG] Cache invalidation and refetch triggered');
        
        // React Query will handle the cache updates automatically
      }
      
      toast.success('User created successfully', { description: `${data.first_name} ${data.last_name} has been added to the system.` });
      
      // Add to recent items
      addRecentItem({
        id: data.id,
        type: 'user',
        name: `${data.first_name} ${data.last_name}`,
        url: `/org-admin/manage-users/${data.id}`,
      });
    },
    // Ensure no automatic retries of POST (prevents accidental duplicates)
    retry: 0,
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (userData: UpdateInput<User>): Promise<User> => {
      const { id, ...data } = userData;
      const response = await apiClient.patch<User>(`/auth/users/${id}/`, data);
      return ((response as any)?.data ?? response) as User;
    },
    onSuccess: (data, variables) => {
      addNotification({
        type: 'success',
        title: 'User updated',
        message: `User ${data.name} has been successfully updated.`,
      });
      // Invalidate the specific user and the user list
      queryClient.invalidateQueries({ queryKey: queryKeys.user(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (err: any, variables) => {
      addNotification({
        type: 'error',
        title: 'Error updating user',
        message: err.message || `Failed to update user ${variables.id}`,
      });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await apiClient.delete(`/auth/users/${userId}/`);
    },
    onSuccess: (data, userId) => {
      toast.success('User Deleted', { description: `User (ID: ${userId}) has been successfully deleted.` });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
    onError: (err: any, userId) => {
      toast.error('Error Deleting User', { description: err.message || `Failed to delete user (ID: ${userId}).` });
    },
  });
};

// Deals Management
export const useDealsQuery = (filters?: Record<string, any>) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  // Create a stable query key by extracting only the necessary parameters
  const stableFilters = filters ? {
    search: filters.search,
    page: filters.page,
    pageSize: filters.pageSize,
    ...filters.filters // Spread any additional filters
  } : {};

  console.log('🔍 [USE_DEALS_QUERY_DEBUG] ===== USE DEALS QUERY DEBUG =====');
  console.log('🔍 [USE_DEALS_QUERY_DEBUG] filters:', filters);
  console.log('🔍 [USE_DEALS_QUERY_DEBUG] stableFilters:', stableFilters);
  console.log('🔍 [USE_DEALS_QUERY_DEBUG] queryKey:', [...queryKeys.deals, stableFilters]);
  console.log('🔍 [USE_DEALS_QUERY_DEBUG] isAuthInitialized:', isAuthInitialized);
  console.log('🔍 [USE_DEALS_QUERY_DEBUG] =====================================');

  // Test with a simple query key for debugging
  const simpleQueryKey = [...queryKeys.deals, 'simple'];
  console.log('🔍 [USE_DEALS_QUERY_DEBUG] Simple query key:', simpleQueryKey);

  const query = useQuery({
    queryKey: [...queryKeys.deals, stableFilters],
    queryFn: async (): Promise<PaginatedResponse<Deal>> => {
      console.log('🔍 [USE_DEALS_QUERY_DEBUG] Making API call with params:', stableFilters);
      const response = await apiClient.get<Deal[]>('/deals/deals/', {
        params: stableFilters,
      });
      console.log('🔍 [USE_DEALS_QUERY_DEBUG] API response:', response.data);
      console.log('🔍 [USE_DEALS_QUERY_DEBUG] API response length:', response.data?.length);
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

  console.log('🔍 [USE_DEALS_QUERY_DEBUG] Query result:', {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError
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
      const response = await apiClient.post<Deal>('/deals/deals/', dealData);
      return response.data!;
    },
    onSuccess: (data) => {
      // Invalidate all deal-related queries to ensure all tables update
      queryClient.invalidateQueries({ queryKey: queryKeys.deals });
      queryClient.invalidateQueries({ queryKey: ['deals', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['deals', 'list', {}] });
      
      // Invalidate cache-based queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 (queryKey.includes('deals') || 
                  queryKey.includes('DEALS') ||
                  (queryKey[0] === 'deals'));
        }
      });
      
      // Force refetch all deals queries
      queryClient.refetchQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 (queryKey.includes('deals') || 
                  queryKey.includes('DEALS') ||
                  (queryKey[0] === 'deals'));
        }
      });
      
      // Specifically invalidate the salesperson deals table pattern
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 queryKey.length >= 2 && 
                 queryKey[0] === 'deals' && 
                 typeof queryKey[1] === 'object';
        }
      });
      
      // Force refetch the specific tableState pattern
      queryClient.refetchQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 queryKey.length >= 2 && 
                 queryKey[0] === 'deals' && 
                 typeof queryKey[1] === 'object';
        }
      });
      
      toast.success('Deal created successfully', { description: `Deal "${data.deal_name}" has been created.` });
      
      addRecentItem({
        id: data.id,
        type: 'deal',
        name: data.deal_name,
        url: `/deals/${data.id}`,
      });
    },
    onError: (err: any) => {
      toast.error('Error creating deal', { description: err.message || 'Failed to create deal' });
    },
  });
};

// Clients Management
export const useClientsQuery = (orgId: string, filters?: Record<string, any>) => {
  const { user, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const hasPermission = user ? hasRolePermission(user.role, 'manage:clients') : false;

  const query = useQuery({
    queryKey: [...queryKeys.clients, orgId, filters],
    queryFn: async (): Promise<PaginatedResponse<Client>> => {
      // The API can return either a paginated response or a direct array
      const response = await apiClient.get<PaginatedApiResponse<Client> | Client[]>('/clients/', { ...filters, organization: orgId });
      const payload = response.data; // Use the .data property
      
      if (Array.isArray(payload)) {
        // Handle direct array response
        return {
          data: payload,
          pagination: { page: 1, limit: payload.length, total: payload.length, totalPages: 1 },
        };
      }
      
      if (payload && 'results' in payload) {
        // Handle DRF paginated response
        return {
          data: payload.results,
          pagination: { 
            page: filters?.page || 1, 
            limit: filters?.limit || 10, 
            total: payload.count, 
            totalPages: Math.ceil(payload.count / (filters?.limit || 10))
          },
        };
      }
      
      // Fallback for empty or unexpected responses
      return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    },
    enabled: isAuthInitialized && hasPermission,
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
      
      toast.success('Client created successfully', { description: `${data.client_name} has been added to the system.` });
      
      // Add to recent items
      addRecentItem({
        id: data.id,
        type: 'client',
        name: data.client_name,
        url: `/org-admin/manage-clients/${data.id}`,
      });
    },
    onError: (err: any) => {
      toast.error('Error creating client', { description: err.message || 'Failed to create client' });
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
      
      toast.success('Client updated successfully', { description: `${data.client_name} has been updated.` });
    },
    onError: (err: any) => {
      toast.error('Error updating client', { description: err.message || 'Failed to update client' });
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
      
      toast.success('Client deleted successfully', { description: 'The client has been removed from the system.' });
    },
    onError: (err: any) => {
      toast.error('Error deleting client', { description: err.message || 'Failed to delete client' });
    },
  });
};

// Teams Management
export const useTeamsQuery = (filters?: Record<string, any>) => {
  const { isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: [...queryKeys.teams, filters],
    // Always return a PaginatedResponse so consumers can rely on .data & .pagination
    queryFn: async (): Promise<PaginatedResponse<Team>> => {
      const response = await apiClient.get<any>('/team/teams/', filters);

      // Axios stores payload under .data – fall back to raw for fetch-polyfills/mocks
      const payload = response?.data ?? response;

      // DRF style paginated { results, count, ... }
      if (payload && typeof payload === 'object' && 'results' in payload) {
        const results = payload.results || [];
        return {
          data: results,
          pagination: {
            page: payload.page ?? 1,
            limit: results.length,
            total: payload.count ?? results.length,
            totalPages: Math.ceil((payload.count || results.length) / (results.length || 1)),
          },
        };
      }

      // Plain array response
      if (Array.isArray(payload)) {
        return {
          data: payload,
          pagination: {
            page: 1,
            limit: payload.length,
            total: payload.length,
            totalPages: 1,
          },
        };
      }

      // Fallback
      return {
        data: [],
        pagination: { page: 1, limit: 0, total: 0, totalPages: 0 },
      };
    },
    enabled: isAuthInitialized,
    staleTime: 5 * 60 * 1000, // 5 mins
  });

  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Error loading teams',
      message: query.error?.message || 'Failed to load teams',
    });
  }

  return query;
};

export const useCreateTeamMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (teamData: any) => {
      const resp = await apiClient.post<any>('/team/teams/', teamData);
      return resp.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams, type: 'all' });
      
      toast.success('Team created successfully', { description: `${data.name} has been added to the system.` });
      
      // Add to recent items
      addRecentItem({
        id: data.id,
        type: 'team',
        name: data.name,
        url: `/org-admin/manage-teams/${data.id}`,
      });
    },
    onError: (err: any) => {
      toast.error('Error creating team', { description: err.message || 'Failed to create team' });
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
    mutationFn: async (teamId: string): Promise<void> => {
      await apiClient.delete(`/team/teams/${teamId}/`);
    },
    onSuccess: (data, teamId) => {
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
      
      toast.success('Login successful', { description: `Welcome back, ${data.user.first_name}!` });
      
      // Use the centralized redirection logic
      redirectUserByRole(data.user, router, addNotification);
    },
    onError: (err: any) => {
      toast.error('Login failed', { description: err.message || 'Invalid credentials' });
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
  const { hasPermission, isAuthInitialized, user } = useAuth();
  const { addNotification } = useUI();
  const organizationId = (user as any)?.organization;

  const query = useQuery({
    queryKey: [...queryKeys.commission, filters],
    queryFn: async (): Promise<PaginatedResponse<Commission>> => {
      const allFilters = { ...filters };
      if (organizationId) {
        allFilters.organization = organizationId;
      }
      const response = await apiClient.get<PaginatedResponse<Commission>>('/commission/commissions/', {
        params: allFilters,
      });
      // Handle undefined or null response data
      if (!response || response.data === undefined || response.data === null) {
        return {
          data: [],
          pagination: { page: 1, limit: 0, total: 0, totalPages: 0 }
        };
      }
      return response.data;
    },
    enabled: isAuthInitialized && !!organizationId && hasPermission('manage:deals'),
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

export const useOrgAdminCommissionQuery = () => {
  const { hasPermission, isAuthInitialized, user } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery({
    queryKey: [...queryKeys.commission, 'org-admin'],
    queryFn: async (): Promise<Commission[]> => {
      const response = await apiClient.get<Commission[]>('commission/commissions/org-admin/');
      // Handle undefined response data
      if (!response || response.data === undefined || response.data === null) {
        return [];
      }
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: isAuthInitialized && hasPermission('manage:deals') && user?.role === 'org-admin',
    staleTime: 0, // No stale time - always refetch
  });

  // Handle errors using useEffect to avoid setState during render
  useEffect(() => {
    if (query.error) {
      addNotification({
        type: 'error',
        title: 'Error loading commission data',
        message: query.error.message || 'Failed to load commission data',
      });
    }
  }, [query.error, addNotification]);

  return query;
};

export const useCreateCommissionMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();
  
  return useMutation({
    mutationFn: async (commissionData: CreateInput<Commission>): Promise<Commission> => {
      const response = await apiClient.post<Commission>('/commission/commissions/', commissionData);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      
      toast.success('Commission created successfully', { description: `Commission for ${data.fullName} has been added to the system.` });
      
      // Add to recent items
      addRecentItem({
        id: data.id.toString(),
        type: 'deal',
        name: `${data.fullName} Commission`,
        url: `/org-admin/commission/${data.id}`,
      });
    },
    onError: (err: any) => {
      toast.error('Error creating commission', { description: err.message || 'Failed to create commission' });
    },
  });
};

export const useUpdateCommissionMutation = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateInput<Commission> }): Promise<Commission> => {
      const response = await apiClient.put<Commission>(`/commission/commissions/${id}/`, data);
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
    mutationFn: async (commissionData: UpdateInput<Commission>[]): Promise<{ message: string; updated_commissions: Commission[] }> => {
      const response = await apiClient.put<{ message: string; updated_commissions: Commission[] }>('/commission/commissions/bulk/', commissionData);
      return response.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commission });
      
      addNotification({
        type: 'success',
        title: 'Bulk commission update successful',
        message: data.message || `${data.updated_commissions.length} commission records have been updated.`,
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
      await apiClient.delete(`/commission/commissions/${id}/`);
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
      toast.success('Payment status updated', { description: 'Payment verification status has been updated.' });
    },
    onError: (err: any) => {
      toast.error('Verification failed', { description: err.message || 'Could not update payment status' });
    },
  });
}; 