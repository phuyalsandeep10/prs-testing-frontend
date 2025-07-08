import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealApi, apiClient } from '@/lib/api';
import { useAuth, useUI, useApp } from '@/stores';
import type { Deal } from '@/types/deals';
import type { PaginatedResponse, CreateInput, UpdateInput } from '@/types';

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
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery<PaginatedResponse<Deal>, Error>({
    queryKey: dealQueryKeys.list(filters),
    queryFn: async () => {
      // Use apiClient directly to get deals data
      const response = await apiClient.get<Deal[]>('/deals/', { params: filters });
      // Transform flat array to paginated structure
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
    enabled: isAuthInitialized, // Remove permission check for salesperson role
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Unified error toast
  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Failed to load deals',
      message: query.error.message ?? 'Unknown error',
    });
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
      addNotification({
        type: 'success',
        title: 'Deal created',
        message: `Deal "${data.deal_name ?? data.id}" has been created`,
      });
      addRecentItem({
        id: data.id,
        type: 'deal',
        name: data.deal_name ?? data.id,
        url: `/deals/${data.id}`,
      });
    },
    onError: (err) => {
      addNotification({
        type: 'error',
        title: 'Create deal failed',
        message: err.message ?? 'Unknown error',
      });
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
      addNotification({
        type: 'success',
        title: 'Deal updated',
        message: `Deal "${data.deal_name ?? data.id}" has been updated`,
      });
    },
    onError: (err) => {
      addNotification({
        type: 'error',
        title: 'Update deal failed',
        message: err.message ?? 'Unknown error',
      });
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
      addNotification({
        type: 'success',
        title: 'Deal deleted',
        message: `Deal ${id} has been removed`,
      });
    },
    onError: (err) => {
      addNotification({
        type: 'error',
        title: 'Delete deal failed',
        message: err.message ?? 'Unknown error',
      });
    },
  });
}; 