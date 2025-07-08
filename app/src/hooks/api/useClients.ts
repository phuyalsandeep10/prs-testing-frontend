/**
 * Standardized React Query Hooks for Client Operations
 * Replaces inconsistent client API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Client } from '@/lib/types/roles';

// ==================== QUERY KEYS ====================
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

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
  return useQuery({
    queryKey: clientKeys.list(JSON.stringify(filters)),
    queryFn: async (): Promise<Client[]> => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<ClientsResponse>(`/clients/?${params.toString()}`);
      
      // Handle both paginated and direct array responses
      return Array.isArray(response) ? response : response.results || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

/**
 * Fetch a single client by ID
 */
export const useClient = (clientId: string) => {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: () => apiClient.get<Client>(`/clients/${clientId}/`),
    enabled: !!clientId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch clients for dashboard/commission pages
 */
export const useDashboardClients = () => {
  return useQuery({
    queryKey: [...clientKeys.all, 'dashboard'],
    queryFn: async (): Promise<Client[]> => {
      const response = await apiClient.get<{
        clients?: Client[];
        results?: Client[];
      } | Client[]>('/dashboard/clients/');
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      
      return (response as any).clients || (response as any).results || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new client
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientData) => 
      apiClient.post<Client>('/clients/', data),
    
    onSuccess: (newClient) => {
      // Invalidate and refetch client lists
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'dashboard'] });
      
      // Optionally set the new client data directly
      queryClient.setQueryData(clientKeys.detail(newClient.id.toString()), newClient);
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
    mutationFn: ({ id, ...data }: UpdateClientData) =>
      apiClient.put<Client>(`/clients/${id}/`, data),
    
    onSuccess: (updatedClient, variables) => {
      // Update the specific client in cache
      queryClient.setQueryData(
        clientKeys.detail(variables.id),
        updatedClient
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'dashboard'] });
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
    mutationFn: (clientId: string) =>
      apiClient.delete(`/clients/${clientId}/`),
    
    onSuccess: (_, clientId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(clientId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: [...clientKeys.all, 'dashboard'] });
    },
    
    onError: (error) => {
      console.error('Failed to delete client:', error);
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
 * Prefetch client data
 */
export const usePrefetchClient = () => {
  const queryClient = useQueryClient();
  
  return (clientId: string) => {
    queryClient.prefetchQuery({
      queryKey: clientKeys.detail(clientId),
      queryFn: () => apiClient.get<Client>(`/clients/${clientId}/`),
      staleTime: 5 * 60 * 1000,
    });
  };
}; 