import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealApi, apiClient } from '@/lib/api-client';
import { useAuth, useUI, useApp } from '@/stores';
import type { Deal } from '@/types/deals';
import type { PaginatedResponse, CreateInput, UpdateInput } from '@/types';
import { toast } from 'sonner';

// -----------------------
// Query Key Factory
// -----------------------
export const dealQueryKeys = {
  all: ['deals'] as const,
  list: (filters?: Record<string, any>) => ['deals', filters] as const,
  detail: (id: string) => ['deals', id] as const,
};

// -----------------------
// Queries
// -----------------------
export const useDealsQuery = (filters?: Record<string, any>) => {
  const { hasPermission, isAuthInitialized, user } = useAuth();
  const { addNotification } = useUI();
  const organizationId = (user as any)?.organization;

  const query = useQuery<PaginatedResponse<Deal>, Error>({
    queryKey: dealQueryKeys.list(filters),
    queryFn: async () => {
      const allFilters = { ...filters };
      // Don't add organization filter - backend handles this based on user authentication
      // Use apiClient directly to get deals data
      const response = await apiClient.get<any>('/deals/deals/', { params: allFilters });
      
      // Handle Django REST Framework pagination format
      if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        // Paginated response from Django REST Framework
        return {
          data: response.data.results || [],
          pagination: {
            page: response.data.page || 1,
            limit: response.data.page_size || 25,
            total: response.data.count || 0,
            totalPages: Math.ceil((response.data.count || 0) / (response.data.page_size || 25)),
          },
        };
      } else if (Array.isArray(response.data)) {
        // Flat array response (fallback)
        return {
          data: response.data || [],
          pagination: {
            page: 1,
            limit: response.data?.length || 0,
            total: response.data?.length || 0,
            totalPages: 1,
          },
        };
      } else {
        // Unknown format, return empty
        return {
          data: [],
          pagination: {
            page: 1,
            limit: 0,
            total: 0,
            totalPages: 1,
          },
        };
      }
    },
    enabled: isAuthInitialized, // Remove organization check since backend handles it
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Unified error toast
  if (query.error) {
    toast.error('Failed to load deals', { description: query.error.message ?? 'Unknown error' });
  }

  return query;
};

export const useDealQuery = (id: string, enabled = true) => {
  const { addNotification } = useUI();

  const query = useQuery<Deal, Error>({
    queryKey: dealQueryKeys.detail(id),
    queryFn: async () => {
      const response = await dealApi.getById(id);
      return response.data as Deal;
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Failed to load deal',
      message: query.error.message ?? 'Unknown error',
    });
  }

  return query;
};

// -----------------------
// Mutations
// -----------------------
const mutationCommonOptions = {
  retry: 1,
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();
  const { addRecentItem } = useApp();

  return useMutation<Deal, Error, CreateInput<Deal>>({
    mutationFn: (data) => dealApi.create(data).then((res) => res.data as Deal),
    ...mutationCommonOptions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.all });
      toast.success('Deal created', { description: `Deal "${data.deal_name ?? data.id}" has been created` });
      addRecentItem({
        id: data.id,
        type: 'deal',
        name: data.deal_name ?? data.id,
        url: `/deals/${data.id}`,
      });
    },
    onError: (err) => {
      toast.error('Create deal failed', { description: err.message ?? 'Unknown error' });
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<Deal, Error, UpdateInput<Deal>>({
    mutationFn: (data) => dealApi.update(data).then((res) => res.data as Deal),
    ...mutationCommonOptions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.detail(data.id) });
      toast.success('Deal updated', { description: `Deal "${data.deal_name ?? data.id}" has been updated` });
    },
    onError: (err) => {
      toast.error('Update deal failed', { description: err.message ?? 'Unknown error' });
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<void, Error, string>({
    mutationFn: (id) => dealApi.delete(id).then(() => undefined),
    ...mutationCommonOptions,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: dealQueryKeys.all });
      toast.success('Deal deleted', { description: `Deal ${id} has been removed` });
    },
    onError: (err) => {
      toast.error('Delete deal failed', { description: err.message ?? 'Unknown error' });
    },
  });
}; 