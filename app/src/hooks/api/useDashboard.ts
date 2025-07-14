/**
 * Standardized React Query Hooks for Dashboard Operations
 * Replaces mixed dashboard API patterns and existing Zustand API stores
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ==================== QUERY KEYS ====================
export const dashboardKeys = {
  all: ['dashboard'] as const,
  main: () => [...dashboardKeys.all, 'main'] as const,
  commission: (period?: string) => [...dashboardKeys.all, 'commission', period] as const,
  achievements: () => [...dashboardKeys.all, 'achievements'] as const,
  standings: () => [...dashboardKeys.all, 'standings'] as const,
  streaks: () => [...dashboardKeys.all, 'streaks'] as const,
  chart: (period?: string) => [...dashboardKeys.all, 'chart', period] as const,
  goals: () => [...dashboardKeys.all, 'goals'] as const,
  paymentVerification: () => [...dashboardKeys.all, 'payment-verification'] as const,
  verifier: {
    overview: () => [...dashboardKeys.all, 'verifier', 'overview'] as const,
    payments: () => [...dashboardKeys.all, 'verifier', 'payments'] as const,
    refunds: () => [...dashboardKeys.all, 'verifier', 'refunds'] as const,
    audits: () => [...dashboardKeys.all, 'verifier', 'audits'] as const,
  },
};

// ==================== TYPES ====================
interface DashboardResponse {
  sales_progress?: {
    target: string;
    achieved: string;
    percentage: number;
  };
  outstanding_amount?: number;
  total_clients?: number;
  recent_activity?: any[];
  achievements?: any[];
}

interface CommissionData {
  total_commission: number;
  commission_period: string;
  top_clients_this_period?: Array<{
    client_name: string;
    total_value: number;
  }>;
  regular_clients_all_time?: Array<{
    client_name: string;
    total_value: number;
  }>;
  commission_breakdown?: any[];
}

interface StandingsData {
  user_rank: number;
  total_users: number;
  rankings: Array<{
    user_name: string;
    sales_total: number;
    rank: number;
  }>;
}

interface StreakData {
  current_streak: number;
  longest_streak: number;
  streak_type: string;
}

interface ChartData {
  period: string;
  data: Array<{
    date: string;
    sales: number;
    deals: number;
  }>;
}

interface PaymentVerificationData {
  pending_count: number;
  verified_count: number;
  rejected_count: number;
  total_amount_pending: number;
}

interface VerifierOverviewData {
  total_payments_to_verify: number;
  payments_verified_today: number;
  payments_rejected_today: number;
  total_amount_verified: number;
}

// ==================== SALESPERSON DASHBOARD HOOKS ====================

/**
 * Main dashboard data for salesperson
 */
export const useDashboard = () => {
  return useQuery({
    queryKey: dashboardKeys.main(),
    queryFn: (): Promise<DashboardResponse> => 
      apiClient.get('/dashboard/'),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

/**
 * Commission data with period filtering
 */
export const useCommissionData = (period: string = 'monthly') => {
  return useQuery({
    queryKey: dashboardKeys.commission(period),
    queryFn: (): Promise<CommissionData> => 
      apiClient.get(`/dashboard/commission/?period=${period}&include_details=true`),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Achievement/standings data
 */
export const useStandings = () => {
  return useQuery({
    queryKey: dashboardKeys.standings(),
    queryFn: (): Promise<StandingsData> => 
      apiClient.get('/dashboard/standings/'),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Streak data
 */
export const useStreaks = () => {
  return useQuery({
    queryKey: dashboardKeys.streaks(),
    queryFn: (): Promise<StreakData> => 
      apiClient.get('/dashboard/streaks/'),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Chart data for dashboard
 */
export const useChartData = (period: string = 'monthly') => {
  return useQuery({
    queryKey: dashboardKeys.chart(period),
    queryFn: (): Promise<ChartData> => 
      apiClient.get(`/dashboard/chart/?period=${period}`),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Personal goals data
 */
export const useGoals = () => {
  return useQuery({
    queryKey: dashboardKeys.goals(),
    queryFn: () => apiClient.get('/dashboard/goals/'),
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Payment verification status for salesperson
 */
export const usePaymentVerificationStatus = () => {
  return useQuery({
    queryKey: dashboardKeys.paymentVerification(),
    queryFn: (): Promise<PaymentVerificationData> => 
      apiClient.get('/dashboard/payment-verification/'),
    staleTime: 1 * 60 * 1000, // 1 minute for payment data
  });
};

// ==================== VERIFIER DASHBOARD HOOKS ====================

/**
 * Verifier overview data
 */
export const useVerifierOverview = () => {
  return useQuery({
    queryKey: dashboardKeys.verifier.overview(),
    queryFn: (): Promise<VerifierOverviewData> => 
      apiClient.get('/verifier/overview/'),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Verifier payment section data
 */
export const useVerifierPayments = (status?: 'pending' | 'verified' | 'rejected') => {
  return useQuery({
    queryKey: [...dashboardKeys.verifier.payments(), status],
    queryFn: () => {
      const params = status ? `?status=${status}` : '';
      return apiClient.get(`/verifier/payments/${params}`);
    },
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Verifier refund section data
 */
export const useVerifierRefunds = () => {
  return useQuery({
    queryKey: dashboardKeys.verifier.refunds(),
    queryFn: () => apiClient.get('/verifier/refunds/'),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Verifier audit section data
 */
export const useVerifierAudits = () => {
  return useQuery({
    queryKey: dashboardKeys.verifier.audits(),
    queryFn: () => apiClient.get('/verifier/audits/'),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Payment distribution chart for verifier
 */
export const usePaymentDistribution = () => {
  return useQuery({
    queryKey: [...dashboardKeys.verifier.overview(), 'distribution'],
    queryFn: () => apiClient.get('/verifier/payment-distribution/'),
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== ORGANIZATION DASHBOARD HOOKS ====================

/**
 * Organization admin dashboard data
 */
export const useOrgDashboard = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'organization'],
    queryFn: () => apiClient.get('/org-admin/dashboard/'),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Team performance data for org admin
 */
export const useTeamPerformance = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'team-performance'],
    queryFn: () => apiClient.get('/org-admin/team-performance/'),
    staleTime: 5 * 60 * 1000,
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Refresh all dashboard data
 */
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };
};

/**
 * Get cached dashboard data without making a request
 */
export const useDashboardCache = () => {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<DashboardResponse>(dashboardKeys.main());
}; 