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

// ==================== MOCK DATA FOR ORG ADMIN DASHBOARD ====================

// Environment variable to control mock data usage
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || 
                     process.env.NODE_ENV === 'development';

const mockOrgDashboardData: OrgDashboardResponse = {
  overview: {
    total_revenue: 24567890,
    active_deals: 156,
    team_performance: 94.2,
    conversion_rate: 23.8,
    monthly_growth: 12.5,
    total_users: 42,
    pending_approvals: 8,
    system_alerts: 2,
    data_usage: 78
  },
  team_members: [
    {
      id: '1',
      name: 'Alex Johnson',
      role: 'Supervisor',
      avatar: '/api/placeholder/40/40',
      performance: 98,
      status: 'online',
      deals: 24,
      revenue: 4567890
    },
    {
      id: '2',
      name: 'Sarah Chen',
      role: 'Salesperson',
      avatar: '/api/placeholder/40/40',
      performance: 95,
      status: 'busy',
      deals: 18,
      revenue: 3245678
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      role: 'Verifier',
      avatar: '/api/placeholder/40/40',
      performance: 92,
      status: 'online',
      deals: 15,
      revenue: 2890123
    },
    {
      id: '4',
      name: 'Emily Davis',
      role: 'Salesperson',
      avatar: '/api/placeholder/40/40',
      performance: 89,
      status: 'offline',
      deals: 12,
      revenue: 2234567
    },
    {
      id: '5',
      name: 'David Wilson',
      role: 'Supervisor',
      avatar: '/api/placeholder/40/40',
      performance: 87,
      status: 'online',
      deals: 20,
      revenue: 1987654
    }
  ],
  deal_pipeline: [
    {
      stage: "Prospecting",
      count: 45,
      value: 1234567,
      progress: 75
    },
    {
      stage: "Qualification",
      count: 32,
      value: 890123,
      progress: 60
    },
    {
      stage: "Proposal",
      count: 28,
      value: 1567890,
      progress: 85
    },
    {
      stage: "Negotiation",
      count: 18,
      value: 2245678,
      progress: 45
    },
    {
      stage: "Closed Won",
      count: 156,
      value: 24567890,
      progress: 100
    }
  ],
  analytics: {
    monthly_performance: [
      { month: 'Jan', value: 65 },
      { month: 'Feb', value: 78 },
      { month: 'Mar', value: 90 },
      { month: 'Apr', value: 85 },
      { month: 'May', value: 95 },
      { month: 'Jun', value: 88 }
    ],
    revenue_distribution: [
      { category: 'Sales', percentage: 45 },
      { category: 'Services', percentage: 30 },
      { category: 'Products', percentage: 25 }
    ],
    insights: {
      revenue_growth: "+23.5%",
      new_deals: 28,
      team_efficiency: "94.2%"
    }
  },
  recent_activities: [
    {
      id: 1,
      type: 'user',
      action: 'New user added',
      details: 'Supervisor "Alex Doe" was added to the team with full permissions.',
      time: '2 hours ago',
      user: 'Admin',
      avatar: '/api/placeholder/32/32',
      status: 'success'
    },
    {
      id: 2,
      type: 'revenue',
      action: 'Revenue milestone reached',
      details: 'Monthly revenue target exceeded by 15%. Total: ₹2.45 Cr',
      time: '4 hours ago',
      user: 'System',
      status: 'success'
    },
    {
      id: 3,
      type: 'report',
      action: 'Report generated',
      details: 'Monthly sales report was successfully generated and sent to stakeholders.',
      time: '1 day ago',
      user: 'Analytics',
      status: 'info'
    },
    {
      id: 4,
      type: 'security',
      action: 'Security alert',
      details: 'Multiple failed login attempts detected from unknown IP address.',
      time: '1 day ago',
      user: 'Security',
      status: 'warning'
    },
    {
      id: 5,
      type: 'performance',
      action: 'Team performance update',
      details: 'Team efficiency improved by 8.5% this week. Average deal closure time reduced.',
      time: '2 days ago',
      user: 'Performance',
      status: 'success'
    },
    {
      id: 6,
      type: 'settings',
      action: 'Settings updated',
      details: 'Organization profile information and notification preferences were updated.',
      time: '3 days ago',
      user: 'Admin',
      avatar: '/api/placeholder/32/32',
      status: 'info'
    }
  ],
  system_status: {
    database: 'Healthy',
    api_services: 'Online',
    storage: '78% Used',
    last_backup: '2 hours ago'
  }
};

// ==================== ORGANIZATION DASHBOARD HOOKS ====================

interface OrgDashboardData {
  total_revenue: number;
  active_deals: number;
  team_performance: number;
  conversion_rate: number;
  monthly_growth: number;
  total_users: number;
  pending_approvals: number;
  system_alerts: number;
  data_usage: number;
}

interface TeamMemberData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  performance: number;
  status: 'online' | 'offline' | 'busy';
  deals: number;
  revenue: number;
}

interface DealStageData {
  stage: string;
  count: number;
  value: number;
  progress: number;
}

interface AnalyticsData {
  monthly_performance: Array<{
    month: string;
    value: number;
  }>;
  revenue_distribution: Array<{
    category: string;
    percentage: number;
  }>;
  insights: {
    revenue_growth: string;
    new_deals: number;
    team_efficiency: string;
  };
}

interface ActivityData {
  id: number;
  type: 'user' | 'report' | 'settings' | 'revenue' | 'security' | 'performance';
  action: string;
  details: string;
  time: string;
  user: string;
  avatar?: string;
  status: 'success' | 'warning' | 'info' | 'error';
}

interface OrgDashboardResponse {
  overview: OrgDashboardData;
  team_members: TeamMemberData[];
  deal_pipeline: DealStageData[];
  analytics: AnalyticsData;
  recent_activities: ActivityData[];
  system_status: {
    database: string;
    api_services: string;
    storage: string;
    last_backup: string;
  };
}

/**
 * Organization admin dashboard data
 */
export const useOrgDashboard = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'organization'],
    queryFn: async (): Promise<OrgDashboardResponse> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for org admin dashboard');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockOrgDashboardData;
      }

      try {
        const response = await apiClient.get<OrgDashboardResponse>('/org-admin/dashboard/');
        return response;
      } catch (error) {
        console.log('API failed, falling back to mock data for org admin dashboard');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockOrgDashboardData;
      }
    },
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Team performance data for org admin
 */
export const useTeamPerformance = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'team-performance'],
    queryFn: async (): Promise<TeamMemberData[]> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for team performance');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockOrgDashboardData.team_members;
      }

      try {
        const response = await apiClient.get<TeamMemberData[]>('/org-admin/team-performance/');
        return response;
      } catch (error) {
        console.log('API failed, falling back to mock data for team performance');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockOrgDashboardData.team_members;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Deal pipeline data for org admin
 */
export const useDealPipeline = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'deal-pipeline'],
    queryFn: async (): Promise<DealStageData[]> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for deal pipeline');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockOrgDashboardData.deal_pipeline;
      }

      try {
        const response = await apiClient.get<DealStageData[]>('/org-admin/deal-pipeline/');
        return response;
      } catch (error) {
        console.log('API failed, falling back to mock data for deal pipeline');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockOrgDashboardData.deal_pipeline;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Analytics data for org admin
 */
export const useOrgAnalytics = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for analytics');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockOrgDashboardData.analytics;
      }

      try {
        const response = await apiClient.get<AnalyticsData>('/org-admin/analytics/');
        return response;
      } catch (error) {
        console.log('API failed, falling back to mock data for analytics');
        await new Promise(resolve => setTimeout(resolve, 300));
        return mockOrgDashboardData.analytics;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Recent activities for org admin
 */
export const useOrgActivities = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'activities'],
    queryFn: async (): Promise<ActivityData[]> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for activities');
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockOrgDashboardData.recent_activities;
      }

      try {
        const response = await apiClient.get<ActivityData[]>('/org-admin/activities/');
        return response;
      } catch (error) {
        console.log('API failed, falling back to mock data for activities');
        await new Promise(resolve => setTimeout(resolve, 200));
        return mockOrgDashboardData.recent_activities;
      }
    },
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * System status for org admin
 */
export const useSystemStatus = () => {
  return useQuery({
    queryKey: [...dashboardKeys.all, 'system-status'],
    queryFn: async (): Promise<{
      database: string;
      api_services: string;
      storage: string;
      last_backup: string;
    }> => {
      if (USE_MOCK_DATA) {
        console.log('Using mock data for system status');
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockOrgDashboardData.system_status;
      }

      try {
        const response = await apiClient.get<{
          database: string;
          api_services: string;
          storage: string;
          last_backup: string;
        }>('/org-admin/system-status/');
        return response;
      } catch (error) {
        console.log('API failed, falling back to mock data for system status');
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockOrgDashboardData.system_status;
      }
    },
    staleTime: 1 * 60 * 1000,
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