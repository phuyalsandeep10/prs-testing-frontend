/**
 * Standardized React Query Hooks for Deal & Payment Operations
 * Replaces inconsistent deal/payment API patterns throughout the app
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { Deal, Payment } from '@/types/deals';

// ==================== QUERY KEYS ====================
export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (filters: string) => [...dealKeys.lists(), { filters }] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
  payments: () => [...dealKeys.all, 'payments'] as const,
  dealPayments: (dealId: string) => [...dealKeys.payments(), dealId] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: string) => [...paymentKeys.lists(), { filters }] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
};

// ==================== TYPES ====================
interface DealsResponse {
  results: Deal[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface PaymentsResponse {
  results: Payment[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface CreateDealData {
  client_id: string;
  deal_value: number;
  source_type: string;
  payment_status: string;
  payment_method: string;
  deal_name?: string;
  deal_remarks?: string;
  due_date?: string;
  deal_date?: string;
  currency?: string;
}

interface UpdateDealData extends Partial<CreateDealData> {
  id: string;
}

interface CreatePaymentData {
  client: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  remarks?: string;
  receipt_file?: File;
}

interface DealFilters {
  client?: string;
  payment_status?: string;
  verification_status?: string;
  source_type?: string;
  payment_method?: string;
  page?: number;
  limit?: number;
}

interface PaymentFilters {
  client?: string;
  deal?: string;
  status?: 'pending' | 'verified' | 'rejected';
  page?: number;
  limit?: number;
}

// ==================== DEAL QUERY HOOKS ====================

/**
 * Fetch all deals with optional filtering
 */
export const useDeals = (filters: DealFilters = {}) => {
  return useQuery({
    queryKey: dealKeys.list(JSON.stringify(filters)),
    queryFn: async (): Promise<Deal[]> => {
      const params = new URLSearchParams();
      
      if (filters.client) params.append('client', filters.client);
      if (filters.payment_status) params.append('payment_status', filters.payment_status);
      if (filters.verification_status) params.append('verification_status', filters.verification_status);
      if (filters.source_type) params.append('source_type', filters.source_type);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<DealsResponse>(`/deals/deals/?${params.toString()}`);
      
      // Handle both paginated and direct array responses
      return Array.isArray(response) ? response : response.results || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // Reduced for better memory management
    structuralSharing: true, // Prevent unnecessary re-renders
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });
};

/**
 * Fetch a single deal by ID
 */
export const useDeal = (dealId: string) => {
  return useQuery({
    queryKey: dealKeys.detail(dealId),
    queryFn: () => apiClient.get<Deal>(`/deals/deals/${dealId}/`),
    enabled: !!dealId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch deals for a specific client
 */
export const useClientDeals = (clientId: string) => {
  return useQuery({
    queryKey: dealKeys.list(JSON.stringify({ client: clientId })),
    queryFn: async (): Promise<Deal[]> => {
      const response = await apiClient.get<DealsResponse>(`/deals/deals/?client=${clientId}`);
      return Array.isArray(response) ? response : response.results || [];
    },
    enabled: !!clientId,
    staleTime: 3 * 60 * 1000,
  });
};

// ==================== PAYMENT QUERY HOOKS ====================

/**
 * Fetch all payments with optional filtering
 */
export const usePayments = (filters: PaymentFilters = {}) => {
  return useQuery({
    queryKey: paymentKeys.list(JSON.stringify(filters)),
    queryFn: async (): Promise<Payment[]> => {
      const params = new URLSearchParams();
      
      if (filters.client) params.append('client', filters.client);
      if (filters.deal) params.append('deal', filters.deal);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get<PaymentsResponse>(`/deals/payments/?${params.toString()}`);
      
      return Array.isArray(response) ? response : response.results || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for payment data
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Fetch payments for a specific deal
 */
export const useDealPayments = (dealId: string) => {
  return useQuery({
    queryKey: dealKeys.dealPayments(dealId),
    queryFn: async (): Promise<Payment[]> => {
      const response = await apiClient.get<PaymentsResponse>(`/deals/${dealId}/payments/`);
      return Array.isArray(response) ? response : response.results || [];
    },
    enabled: !!dealId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Fetch expanded deal data including payment history
 */
export const useDealExpanded = (dealId: string | null) => {
  return useQuery({
    queryKey: [...dealKeys.details(), dealId, 'expanded'],
    queryFn: async (): Promise<any> => {
      if (!dealId) return null;
      
      try {
        const response = await apiClient.get<any>(`/deals/deals/${dealId}/expand/`);
        
        // Only log in development to prevent console spam
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [EXPANDED_API] Full API response:', response);
        }
        
        // The response contains the DealExpandedViewSerializer data directly
        // which has a payment_history field with the payment array
        const paymentHistory = response?.payment_history;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔍 [EXPANDED_API] Payment history:', paymentHistory);
          
          // Log each payment's receipt_link
          paymentHistory?.forEach((payment: any, index: number) => {
            console.log(`🔍 [EXPANDED_API] Payment ${index} receipt_link:`, payment.receipt_link);
          });
        }
        
        // Return the payment history array directly
        return paymentHistory || [];
      } catch (error) {
        console.error('🔍 [USE_DEAL_EXPANDED] Error fetching expanded data:', error);
        throw error;
      }
    },
    enabled: !!dealId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 4 * 60 * 1000, // Reduced from 5 to 4 minutes
    structuralSharing: true, // Prevent unnecessary re-renders
    refetchOnWindowFocus: false, // Prevent excessive refetching
  });
};

// ==================== DEAL MUTATION HOOKS ====================

/**
 * Create a new deal
 */
export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealData) => 
      apiClient.post<Deal>('/deals/deals/', data),
    
    onSuccess: (newDeal) => {
      // Invalidate all deal-related queries to ensure all tables update
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dealKeys.all });
      
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
      
      // Set the new deal data
      queryClient.setQueryData(dealKeys.detail(newDeal.id.toString()), newDeal);
      
      // Invalidate client-specific deals
      const clientId = (newDeal as any).client || (newDeal as any).client_id;
      if (clientId) {
        queryClient.invalidateQueries({ 
          queryKey: dealKeys.list(JSON.stringify({ client: clientId }))
        });
      }
    },
    
    onError: (error) => {
      console.error('Failed to create deal:', error);
    },
  });
};

/**
 * Update an existing deal
 */
export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateDealData) =>
      apiClient.put<Deal>(`/deals/deals/${id}/`, data),
    
    onSuccess: (updatedDeal, variables) => {
      // Update the specific deal in cache
      queryClient.setQueryData(
        dealKeys.detail(variables.id),
        updatedDeal
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to update deal:', error);
    },
  });
};

/**
 * Delete a deal
 */
export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dealId: string) =>
      apiClient.delete(`/deals/deals/${dealId}/`),
    
    onSuccess: (_, dealId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: dealKeys.detail(dealId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to delete deal:', error);
    },
  });
};

// ==================== PAYMENT MUTATION HOOKS ====================

/**
 * Add payment to a deal
 */
export const useAddPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentData) => {
      const formData = new FormData();
      
      // Append all the fields
      formData.append('client', data.client);
      formData.append('amount', data.amount.toString());
      formData.append('payment_method', data.payment_method);
      formData.append('payment_date', data.payment_date);
      
      if (data.remarks) formData.append('remarks', data.remarks);
      if (data.receipt_file) formData.append('receipt_file', data.receipt_file);
      
      return apiClient.upload<Payment>('/deals/payments/', formData);
    },
    
    onSuccess: (newPayment) => {
      // Invalidate payment lists
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      
      // Invalidate deal-specific payments
      const dealId = (newPayment as any).deal || (newPayment as any).deal_id;
      if (dealId) {
        queryClient.invalidateQueries({ 
          queryKey: dealKeys.dealPayments(dealId.toString())
        });
      }
      
      // Invalidate deal lists (payment affects deal status)
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to add payment:', error);
    },
  });
};

/**
 * Update payment verification status
 */
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      paymentId, 
      status,
      notes 
    }: { 
      paymentId: string; 
      status: 'verified' | 'rejected';
      notes?: string;
    }) =>
      apiClient.patch<Payment>(`/deals/payments/${paymentId}/`, { 
        verification_status: status,
        verification_notes: notes 
      }),
    
    onSuccess: (updatedPayment) => {
      // Update payment in cache
      queryClient.setQueryData(
        paymentKeys.detail(updatedPayment.id.toString()),
        updatedPayment
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() });
    },
    
    onError: (error) => {
      console.error('Failed to update payment status:', error);
    },
  });
}; 