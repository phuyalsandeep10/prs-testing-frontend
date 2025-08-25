/**
 * Standardized React Query Hooks for Commission Operations
 * Handles all commission-related data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

// ==================== QUERY KEYS ====================
export const commissionKeys = {
  all: ['commissions'] as const,
  lists: () => [...commissionKeys.all, 'list'] as const,
  list: (filters: string) => [...commissionKeys.lists(), { filters }] as const,
  details: () => [...commissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...commissionKeys.details(), id] as const,
  userCommissions: (userId: string) => [...commissionKeys.all, 'user', userId] as const,
  orgAdminCommissions: () => [...commissionKeys.all, 'org-admin'] as const,
  analytics: () => [...commissionKeys.all, 'analytics'] as const,
};

// ==================== TYPES ====================
export interface Commission {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  deal: {
    id: number;
    deal_name: string;
    client_name: string;
    deal_value: number;
  };
  commission_percentage: number;
  commission_amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface CommissionsResponse {
  results: Commission[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface CreateCommissionData {
  user_id: number;
  deal_id: number;
  commission_percentage: number;
  currency?: string;
  status?: 'pending' | 'paid' | 'cancelled';
}

interface UpdateCommissionData extends Partial<CreateCommissionData> {
  id: string;
}

interface CommissionFilters {
  user_id?: number;
  deal_id?: number;
  status?: 'pending' | 'paid' | 'cancelled';
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
}

// ==================== QUERY HOOKS ====================

/**
 * Fetch all commissions with optional filtering
 */
export const useCommissions = (filters: CommissionFilters = {}) => {
  return useQuery({
    queryKey: commissionKeys.list(JSON.stringify(filters)),
    queryFn: async (): Promise<Commission[]> => {
      const params = new URLSearchParams();
      
      if (filters.user_id) params.append('user_id', filters.user_id.toString());
      if (filters.deal_id) params.append('deal_id', filters.deal_id.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await apiClient.get<CommissionsResponse>('/commission/commissions/', Object.fromEntries(params));
      
      // Handle ApiResponse<T> structure
      const responseData = response.data;
      return Array.isArray(responseData) ? responseData : responseData.results || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - commission data changes frequently
    gcTime: 8 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch a single commission by ID
 */
export const useCommission = (commissionId: string) => {
  return useQuery({
    queryKey: commissionKeys.detail(commissionId),
    queryFn: async () => {
      const response = await apiClient.get<Commission>(`/commission/commissions/${commissionId}/`);
      return response.data;
    },
    enabled: !!commissionId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch commissions for a specific user
 */
export const useUserCommissions = (userId: string) => {
  return useQuery({
    queryKey: commissionKeys.userCommissions(userId),
    queryFn: async (): Promise<Commission[]> => {
      const response = await apiClient.get<Commission[]>(`/commission/commissions/user/${userId}/`);
      const responseData = response.data;
      return Array.isArray(responseData) ? responseData : [];
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Fetch org admin commission overview
 */
export const useOrgAdminCommissions = () => {
  return useQuery({
    queryKey: commissionKeys.orgAdminCommissions(),
    queryFn: async () => {
      const response = await apiClient.get('/commission/commissions/org-admin/');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch commission analytics
 */
export const useCommissionAnalytics = () => {
  return useQuery({
    queryKey: commissionKeys.analytics(),
    queryFn: async () => {
      const response = await apiClient.get('/commission/commissions/analytics/');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Analytics data can be cached longer
  });
};

// ==================== MUTATION HOOKS ====================

/**
 * Create a new commission
 */
export const useCreateCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCommissionData) => {
      const response = await apiClient.post<Commission>('/commission/commissions/', data);
      return response.data;
    },
    
    onSuccess: (newCommission) => {
      // Invalidate commission lists
      queryClient.invalidateQueries({ queryKey: commissionKeys.lists() });
      
      // Set the new commission data
      queryClient.setQueryData(commissionKeys.detail(newCommission.id.toString()), newCommission);
      
      // Invalidate user-specific and org admin commissions
      queryClient.invalidateQueries({ 
        queryKey: commissionKeys.userCommissions(newCommission.user.id.toString()) 
      });
      queryClient.invalidateQueries({ queryKey: commissionKeys.orgAdminCommissions() });
      
      toast.success('Commission created successfully');
    },
    
    onError: (error) => {
      console.error('Failed to create commission:', error);
      toast.error('Failed to create commission');
    },
  });
};

/**
 * Update an existing commission
 */
export const useUpdateCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCommissionData) => {
      const response = await apiClient.put<Commission>(`/commission/commissions/${id}/`, data);
      return response.data;
    },
    
    onSuccess: (updatedCommission, variables) => {
      // Update the specific commission in cache
      queryClient.setQueryData(
        commissionKeys.detail(variables.id),
        updatedCommission
      );
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: commissionKeys.lists() });
      queryClient.invalidateQueries({ 
        queryKey: commissionKeys.userCommissions(updatedCommission.user.id.toString()) 
      });
      queryClient.invalidateQueries({ queryKey: commissionKeys.orgAdminCommissions() });
      
      toast.success('Commission updated successfully');
    },
    
    onError: (error) => {
      console.error('Failed to update commission:', error);
      toast.error('Failed to update commission');
    },
  });
};

/**
 * Delete a commission
 */
export const useDeleteCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      await apiClient.delete(`/commission/commissions/${commissionId}/`);
    },
    
    onSuccess: (_, commissionId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: commissionKeys.detail(commissionId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: commissionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: commissionKeys.orgAdminCommissions() });
      
      toast.success('Commission deleted successfully');
    },
    
    onError: (error) => {
      console.error('Failed to delete commission:', error);
      toast.error('Failed to delete commission');
    },
  });
};

/**
 * Calculate commission for a specific commission
 */
export const useCalculateCommission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionId: string) => {
      const response = await apiClient.post(`/commission/commissions/${commissionId}/calculate/`);
      return response.data;
    },
    
    onSuccess: (_, commissionId) => {
      // Invalidate the specific commission to refetch updated data
      queryClient.invalidateQueries({ queryKey: commissionKeys.detail(commissionId) });
      queryClient.invalidateQueries({ queryKey: commissionKeys.lists() });
      
      toast.success('Commission calculated successfully');
    },
    
    onError: (error) => {
      console.error('Failed to calculate commission:', error);
      toast.error('Failed to calculate commission');
    },
  });
};

/**
 * Bulk update commissions
 */
export const useBulkUpdateCommissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionData: any[]) => {
      const response = await apiClient.put('/commission/commissions/bulk-update/', commissionData);
      return response.data;
    },
    
    onSuccess: () => {
      // Invalidate all commission-related queries
      queryClient.invalidateQueries({ queryKey: commissionKeys.all });
      
      toast.success('Commission data saved successfully');
    },
    
    onError: (error) => {
      console.error('Failed to bulk update commissions:', error);
      toast.error('Failed to save commission data');
    },
  });
};

/**
 * Bulk calculate commissions
 */
export const useBulkCalculateCommissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commissionIds: string[]) => {
      const response = await apiClient.post('/commission/commissions/bulk-calculate/', {
        commission_ids: commissionIds
      });
      return response.data;
    },
    
    onSuccess: () => {
      // Invalidate all commission-related queries
      queryClient.invalidateQueries({ queryKey: commissionKeys.all });
      
      toast.success('Bulk commission calculation completed');
    },
    
    onError: (error) => {
      console.error('Failed to bulk calculate commissions:', error);
      toast.error('Failed to bulk calculate commissions');
    },
  });
};

/**
 * Export selected commissions
 */
export const useExportSelectedCommissions = () => {
  return useMutation({
    mutationFn: async ({ userIds, format = 'csv' }: { userIds: string[]; format?: 'csv' | 'json' }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/commission/commissions/export-selected/?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ user_ids: userIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const blob = await response.blob();
      return { blob, filename: `selected_commissions.${format}` };
    },
    
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Commission export completed');
    },
    
    onError: (error) => {
      console.error('Failed to export commissions:', error);
      toast.error('Failed to export commissions');
    },
  });
};

/**
 * Export commissions
 */
export const useExportCommissions = () => {
  return useMutation({
    mutationFn: async ({ format, filters }: { format: 'csv' | 'excel'; filters?: CommissionFilters }) => {
      const params = new URLSearchParams();
      
      if (filters) {
        if (filters.user_id) params.append('user_id', filters.user_id.toString());
        if (filters.status) params.append('status', filters.status);
        if (filters.date_from) params.append('date_from', filters.date_from);
        if (filters.date_to) params.append('date_to', filters.date_to);
      }
      
      const response = await apiClient.get(
        `/commission/commissions/export/${format}/?${params.toString()}`
      );
      return response.data;
    },
    
    onSuccess: () => {
      toast.success('Commission export completed');
    },
    
    onError: (error) => {
      console.error('Failed to export commissions:', error);
      toast.error('Failed to export commissions');
    },
  });
};