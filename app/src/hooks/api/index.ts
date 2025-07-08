/**
 * Central Export for Standardized React Query API Hooks
 * Import all API hooks from here for consistency
 */

// Client operations
export {
  useClients,
  useClient,
  useDashboardClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useClientCache,
  usePrefetchClient,
  clientKeys,
} from './useClients';

// Deal and Payment operations
export {
  useDeals,
  useDeal,
  useClientDeals,
  usePayments,
  useDealPayments,
  useCreateDeal,
  useUpdateDeal,
  useDeleteDeal,
  useAddPayment,
  useUpdatePaymentStatus,
  dealKeys,
  paymentKeys,
} from './useDeals';

// Dashboard operations
export {
  useDashboard,
  useCommissionData,
  useStandings,
  useStreaks,
  useChartData,
  useGoals,
  usePaymentVerificationStatus,
  useVerifierOverview,
  useVerifierPayments,
  useVerifierRefunds,
  useVerifierAudits,
  usePaymentDistribution,
  useOrgDashboard,
  useTeamPerformance,
  useRefreshDashboard,
  useDashboardCache,
  dashboardKeys,
} from './useDashboard';

// Re-export the standardized API client
export { apiClient } from '@/lib/api-client'; 
// Organization operations
export {
  useOrganizations,
  useOrganization,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
  usePrefetchOrganization,
  organizationKeys,
} from './useOrganizations';

// Project operations
export {
  useProjects,
  useProject,
  useOrganizationProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  usePrefetchProject,
  projectKeys,
} from './useProjects';

// Role and admin operations
export {
  useRoles,
  useOrganizationRoles,
  useRole,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useCreateAdmin,
  usePrefetchRole,
  roleKeys,
} from './useRoles';
