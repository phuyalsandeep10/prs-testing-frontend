import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@/lib/api-client';
import type { Payment } from '@/types/deals';
import type { PaginatedResponse, CreateInput, UpdateInput } from '@/types';
import { useAuth, useUI } from '@/stores';
import { toast } from 'sonner';

// -----------------------
// Query Key Factory
// -----------------------
export const paymentQueryKeys = {
  all: ['payments'] as const,
  list: (filters?: Record<string, any>) => ['payments', filters] as const,
  detail: (id: string) => ['payments', id] as const,
};

// -----------------------
// Queries
// -----------------------
export const usePaymentsQuery = (filters?: { dealId?: string; clientId?: string; page?: number; limit?: number }) => {
  const { hasPermission, isAuthInitialized } = useAuth();
  const { addNotification } = useUI();

  const query = useQuery<PaginatedResponse<Payment>, Error>({
    queryKey: paymentQueryKeys.list(filters),
    queryFn: async () => {
      const res = await paymentApi.getAll(filters);
      // Ensure we return the correct type
      if (res && typeof res === 'object' && 'data' in res && 'pagination' in res) {
        return res as PaginatedResponse<Payment>;
      }
      // Fallback to empty paginated response
      return {
        data: [],
        pagination: { page: 1, limit: 0, total: 0, totalPages: 0 }
      };
    },
    enabled: isAuthInitialized && hasPermission('manage:deals'), // same permission gate; adjust if needed
    staleTime: 2 * 60 * 1000,
  });

  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Failed to load payments',
      message: query.error.message ?? 'Unknown error',
    });
  }

  return query;
};

export const usePaymentQuery = (id: string) => {
  const { addNotification } = useUI();

  const query = useQuery<Payment, Error>({
    queryKey: paymentQueryKeys.detail(id),
    queryFn: () => paymentApi.getById(id).then((res) => res.data as Payment),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  if (query.error) {
    addNotification({
      type: 'error',
      title: 'Failed to load payment',
      message: query.error.message ?? 'Unknown error',
    });
  }

  return query;
};

// -----------------------
// Mutations
// -----------------------
const mutationCommon = { retry: 1 } as const;

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<Payment, Error, CreateInput<Payment>>({
    mutationFn: (data) => paymentApi.create(data).then((res) => res.data as Payment),
    ...mutationCommon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all });
      toast.success('Payment added', { description: `Payment ${data.id} created.` });
    },
    onError: (err) => {
      toast.error('Create payment failed', { description: err.message ?? 'Unknown error' });
    },
  });
};

export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<Payment, Error, UpdateInput<Payment>>({
    mutationFn: (data) => paymentApi.update(data).then((res) => res.data as Payment),
    ...mutationCommon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.detail(data.id) });
      addNotification({ type: 'success', title: 'Payment updated', message: `Payment ${data.id} saved.` });
    },
    onError: (err) => {
      addNotification({ type: 'error', title: 'Update payment failed', message: err.message ?? 'Unknown error' });
    },
  });
};

export const useDeletePayment = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<void, Error, string>({
    mutationFn: (id) => paymentApi.delete(id).then(() => undefined),
    ...mutationCommon,
    onSuccess: (_d, id) => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all });
      addNotification({ type: 'success', title: 'Payment deleted', message: `Payment ${id} removed.` });
    },
    onError: (err) => {
      addNotification({ type: 'error', title: 'Delete payment failed', message: err.message ?? 'Unknown error' });
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  return useMutation<Payment, Error, { id: string; status: 'verified' | 'rejected' }>({
    mutationFn: ({ id, status }) => paymentApi.verify(id, status).then((res) => res.data as Payment),
    ...mutationCommon,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all });
      toast.success('Payment status updated', { description: `Payment ${data.id} marked ${data.status}.` });
    },
    onError: (err) => {
      toast.error('Verification failed', { description: err.message ?? 'Unknown error' });
    },
  });
}; 