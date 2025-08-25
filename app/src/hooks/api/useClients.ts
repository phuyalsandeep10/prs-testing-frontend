/**
 * Standardized React Query Hooks for Client Operations
 * Replaces inconsistent client API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { cacheKeys, CacheInvalidator } from '@/lib/cache';
import type { Client } from '@/types';
import { useAuth } from '@/stores';
import { toast } from 'sonner';

// ==================== QUERY KEYS ====================
// Use unified cache keys from the cache system
export const clientKeys = cacheKeys.clients;

// ==================== TYPES ====================
interface ClientsResponse {
  results: Client[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface CreateClientData {
  client_name: string;
  email: string;
  phone_number: string;
  nationality?: string;
  remarks?: string;
}

interface UpdateClientData extends Partial<CreateClientData> {
  id: string;
}

interface ClientFilters {
  search?: string;
  status?: 'clear' | 'pending' | 'bad_debt';
  page?: number;
  limit?: number;
}

// ==================== QUERY HOOKS ====================

/**
 * Fetch all clients with optional filtering
 */
export const useClients = (filters: ClientFilters = {}) => {
  const { user, isAuthenticated, isAuthInitialized } = useAuth();
  const organizationId = (user as any)?.organization;

  return useQuery({
    queryKey: clientKeys.list(filters),
    queryFn: async (): Promise<Client[]> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (organizationId && organizationId !== '') {
        params.append('organization', organizationId.toString());
      }

      const response = await apiClient.get<ClientsResponse>('/clients/', Object.fromEntries(params));
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      return Array.isArray(responseData) ? responseData : responseData.results || [];
    },
    staleTime: 1 * 60 * 1000, // Reduced to 1 minute for more frequent updates
    gcTime: 8 * 60 * 1000, // Reduced from 10 to 8 minutes for better memory management
    enabled: isAuthInitialized && isAuthenticated,
    // Add memory leak prevention
    structuralSharing: true, // Prevent unnecessary re-renders
    refetchOnWindowFocus: true, // Enable refetching for real-time updates
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time feel
  });
};

/**
 * Fetch a single client by ID
 */
export const useClient = (clientId: string) => {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: async () => {
      const response = await apiClient.get<Client>(`/clients/${clientId}/`);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch clients for dashboard/commission pages
 */
export const useDashboardClients = () => {
  const { user, isAuthenticated, isAuthInitialized } = useAuth();
  const organizationId = (user as any)?.organization;
  
  
  return useQuery({
    queryKey: [...clientKeys.all, 'dashboard'],
    queryFn: async (): Promise<Client[]> => {
      const params = new URLSearchParams();
      if (organizationId && organizationId !== '') {
        params.append('organization', organizationId.toString());
      }
      params.append('limit', '10');
      params.append('status_filter', 'all');
      
      const response = await apiClient.get<{
        clients?: Client[];
        results?: Client[];
      } | Client[]>('/dashboard/clients/', Object.fromEntries(params));
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      
      // Handle different response formats
      if (Array.isArray(responseData)) {
        return responseData;
      }
      
      const clients = (responseData as any).clients || (responseData as any).results || [];
      return clients;
    },
    staleTime: 1 * 60 * 1000, // 1 minute for dashboard data
    gcTime: 5 * 60 * 1000, // Add shorter garbage collection time
    enabled: isAuthInitialized && isAuthenticated,
    structuralSharing: true, // Prevent unnecessary re-renders
    refetchOnWindowFocus: true, // Enable refetching for real-time updates
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const invalidator = new CacheInvalidator(queryClient);

  return useMutation({
    mutationFn: async (data: CreateClientData) => {
      const response = await apiClient.post<Client>('/clients/', data);
      return response.data;
    },
    
    onSuccess: (newClient) => {
      // Use intelligent cache invalidation
      invalidator.invalidateRelated('client', newClient.id.toString());
      
      // Optimistically set the new client data
      queryClient.setQueryData(clientKeys.detail(newClient.id.toString()), newClient);
      
      // Update client lists cache - handle different filter combinations
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      
      // Invalidate dashboard clients cache to include new clients in commission page
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'dashboard'] });
      
      toast.success('Client created successfully');
    },
    
    onError: (error) => {
      console.error('Failed to create client:', error);
    },
  });
};

/**
 * Update an existing client
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateClientData) => {
      const response = await apiClient.put<Client>(`/clients/${id}/`, data);
      return response.data;
    },
    
    onSuccess: (updatedClient, variables) => {
      // Update the specific client in cache
      queryClient.setQueryData(
        clientKeys.detail(variables.id),
        updatedClient
      );
      
      // Invalidate all client-related caches
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'dashboard'] });
      
      // Also invalidate main dashboard cache (for commission data)
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      // Specifically invalidate commission data cache
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'commission'] });
      
      // Show success notification
      toast.success('Client updated successfully!');
    },
    
    onError: (error) => {
      console.error('Failed to update client:', error);
    },
  });
};

/**
 * Delete a client
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      await apiClient.delete(`/clients/${clientId}/`);
    },

    onSuccess: (_, clientId) => {
      toast.success(`Client has been deleted successfully.`);
      // Use the 'variables' (clientId) passed to the mutation
      // Remove from detailed cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(clientId) });

      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: [...clientKeys.all, "dashboard"],
      });
    },

    onError: (error) => {
      console.error("Failed to delete client:", error);
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Get cached client data without making a request
 */
export const useClientCache = (clientId: string) => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<Client>(clientKeys.detail(clientId));
};

/**
 * Enhanced prefetch client data with intelligent caching
 */
export const usePrefetchClient = () => {
  const queryClient = useQueryClient();
  
  return (clientId: string, options?: { priority?: 'high' | 'medium' | 'low' }) => {
    const staleTime = options?.priority === 'high' ? 2 * 60 * 1000 : 5 * 60 * 1000;
    
    queryClient.prefetchQuery({
      queryKey: clientKeys.detail(clientId),
      queryFn: () => apiClient.get<Client>(`/clients/${clientId}/`),
      staleTime,
    });
    
    // Also prefetch related data for high priority requests
    if (options?.priority === 'high') {
      queryClient.prefetchQuery({
        queryKey: cacheKeys.deals.byClient(clientId),
        queryFn: async () => {
          const response = await apiClient.get(`/deals/?client_id=${clientId}`);
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  };
}; 