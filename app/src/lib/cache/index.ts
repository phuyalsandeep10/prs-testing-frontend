/**
 * Advanced Cache Management System for React Query
 * Implements sophisticated caching strategies, tag-based invalidation,
 * and performance optimization for the PRS application
 */

import { QueryClient, QueryKey, QueryFilters } from '@tanstack/react-query';

// ==================== CACHE CONFIGURATION ====================

/**
 * Enhanced QueryClient with advanced caching strategies
 */
export const createAdvancedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error: any) => {
          // Smart retry logic
          if (error?.status === 401 || error?.status === 403) {
            // Don't retry auth errors
            return false;
          }
          if (error?.status === 404) {
            // Don't retry not found errors
            return false;
          }
          if (error?.status >= 500) {
            // Retry server errors with exponential backoff
            return failureCount < 3;
          }
          // Retry network errors
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => {
          // Exponential backoff with jitter
          const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
          const jitter = Math.random() * 0.1 * baseDelay;
          return baseDelay + jitter;
        },
        // Advanced network mode configuration
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: (failureCount, error: any) => {
          // Don't retry client errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'offlineFirst',
      },
         },
   });
};

// ==================== CACHE TAGS SYSTEM ====================

/**
 * Unified cache tags for intelligent invalidation
 */
export const CacheTags = {
  // Core entities
  CLIENTS: 'clients',
  DEALS: 'deals',
  PAYMENTS: 'payments',
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  TEAMS: 'teams',
  
  // Dashboard and analytics
  DASHBOARD: 'dashboard',
  COMMISSION: 'commission',
  STANDINGS: 'standings',
  ANALYTICS: 'analytics',
  CHARTS: 'charts',
  
  // System data
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  
  // Verification workflow
  VERIFICATION: 'verification',
  AUDIT: 'audit',
  APPROVAL: 'approval',
} as const;

export type CacheTag = typeof CacheTags[keyof typeof CacheTags];

/**
 * Cache key factory with tag-based invalidation
 */
export const cacheKeys = {
  // Client operations
  clients: {
    all: [CacheTags.CLIENTS] as const,
    lists: () => [...cacheKeys.clients.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...cacheKeys.clients.lists(), { filters }] as const,
    details: () => [...cacheKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.clients.details(), id] as const,
    dashboard: () => [...cacheKeys.clients.all, CacheTags.DASHBOARD] as const,
    tags: [CacheTags.CLIENTS, CacheTags.DEALS, CacheTags.DASHBOARD] as CacheTag[],
  },
  
  // Deal operations
  deals: {
    all: [CacheTags.DEALS] as const,
    lists: () => [...cacheKeys.deals.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...cacheKeys.deals.lists(), { filters }] as const,
    details: () => [...cacheKeys.deals.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.deals.details(), id] as const,
    byClient: (clientId: string) => [...cacheKeys.deals.all, 'client', clientId] as const,
    byStatus: (status: string) => [...cacheKeys.deals.all, 'status', status] as const,
    tags: [CacheTags.DEALS, CacheTags.CLIENTS, CacheTags.PAYMENTS, CacheTags.COMMISSION] as CacheTag[],
  },
  
  // Payment operations
  payments: {
    all: [CacheTags.PAYMENTS] as const,
    lists: () => [...cacheKeys.payments.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...cacheKeys.payments.lists(), { filters }] as const,
    details: () => [...cacheKeys.payments.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.payments.details(), id] as const,
    byDeal: (dealId: string) => [...cacheKeys.payments.all, 'deal', dealId] as const,
    verification: () => [...cacheKeys.payments.all, CacheTags.VERIFICATION] as const,
    tags: [CacheTags.PAYMENTS, CacheTags.DEALS, CacheTags.VERIFICATION, CacheTags.COMMISSION] as CacheTag[],
  },
  
  // Dashboard operations
  dashboard: {
    all: [CacheTags.DASHBOARD] as const,
    main: () => [...cacheKeys.dashboard.all, 'main'] as const,
    commission: (period?: string) => [...cacheKeys.dashboard.all, CacheTags.COMMISSION, period] as const,
    standings: () => [...cacheKeys.dashboard.all, CacheTags.STANDINGS] as const,
    charts: (type?: string, period?: string) => [...cacheKeys.dashboard.all, CacheTags.CHARTS, type, period] as const,
    analytics: (type?: string) => [...cacheKeys.dashboard.all, CacheTags.ANALYTICS, type] as const,
    tags: [CacheTags.DASHBOARD, CacheTags.COMMISSION, CacheTags.ANALYTICS, CacheTags.CHARTS] as CacheTag[],
  },
  
  // User and organization operations
  users: {
    all: [CacheTags.USERS] as const,
    lists: () => [...cacheKeys.users.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...cacheKeys.users.lists(), { filters }] as const,
    details: () => [...cacheKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.users.details(), id] as const,
    profile: () => [...cacheKeys.users.all, 'profile'] as const,
    tags: [CacheTags.USERS, CacheTags.ORGANIZATIONS, CacheTags.TEAMS] as CacheTag[],
  },
  
  // Organization operations
  organizations: {
    all: [CacheTags.ORGANIZATIONS] as const,
    lists: () => [...cacheKeys.organizations.all, 'list'] as const,
    list: (filters?: Record<string, any>) => [...cacheKeys.organizations.lists(), { filters }] as const,
    details: () => [...cacheKeys.organizations.all, 'detail'] as const,
    detail: (id: string) => [...cacheKeys.organizations.details(), id] as const,
    tags: [CacheTags.ORGANIZATIONS, CacheTags.USERS, CacheTags.TEAMS] as CacheTag[],
  },
};

// ==================== CACHE INVALIDATION UTILITIES ====================

/**
 * Tag-based cache invalidation utility
 */
export class CacheInvalidator {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate cache by tags
   */
  invalidateByTags(tags: CacheTag[]) {
    tags.forEach(tag => {
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && queryKey.includes(tag);
        },
      });
    });
  }

  /**
   * Invalidate all client-related cache
   */
  invalidateClients() {
    this.invalidateByTags(cacheKeys.clients.tags);
  }

  /**
   * Invalidate all deal-related cache
   */
  invalidateDeals() {
    this.invalidateByTags(cacheKeys.deals.tags);
  }

  /**
   * Invalidate all payment-related cache
   */
  invalidatePayments() {
    this.invalidateByTags(cacheKeys.payments.tags);
  }

  /**
   * Invalidate all dashboard-related cache
   */
  invalidateDashboard() {
    this.invalidateByTags(cacheKeys.dashboard.tags);
  }

  /**
   * Smart invalidation based on entity relationships
   */
  invalidateRelated(entityType: 'client' | 'deal' | 'payment', entityId: string) {
    switch (entityType) {
      case 'client':
        // Invalidate client, their deals, and dashboard
        this.invalidateByTags([CacheTags.CLIENTS, CacheTags.DEALS, CacheTags.DASHBOARD]);
        break;
      case 'deal':
        // Invalidate deal, related payments, commission, and dashboard
        this.invalidateByTags([CacheTags.DEALS, CacheTags.PAYMENTS, CacheTags.COMMISSION, CacheTags.DASHBOARD]);
        break;
      case 'payment':
        // Invalidate payment, related deal, commission, and verification
        this.invalidateByTags([CacheTags.PAYMENTS, CacheTags.DEALS, CacheTags.COMMISSION, CacheTags.VERIFICATION]);
        break;
    }
  }
}

// ==================== CACHE PERSISTENCE ====================

/**
 * Cache persistence configuration (placeholder for future implementation)
 * Note: Requires @tanstack/react-query-persist-client and @tanstack/query-sync-storage-persister
 */
export const setupCachePersistence = (queryClient: QueryClient) => {
  // TODO: Implement cache persistence when persistence packages are installed
  console.log('Cache persistence not yet implemented');
  return Promise.resolve();
};

// ==================== CACHE WARMING ====================

/**
 * Cache warming utilities for predictable user flows
 */
export class CacheWarmer {
  constructor(private queryClient: QueryClient) {}

  /**
   * Warm dashboard cache on app startup
   */
  warmDashboardCache() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Prefetch critical dashboard data
    this.queryClient.prefetchQuery({
      queryKey: cacheKeys.dashboard.main(),
      queryFn: () => fetch(`${API_BASE_URL}/dashboard/`).then(res => res.json()),
      staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
    });

    // Prefetch commission data
    this.queryClient.prefetchQuery({
      queryKey: cacheKeys.dashboard.commission(),
      queryFn: () => fetch(`${API_BASE_URL}/dashboard/commission/`).then(res => res.json()),
      staleTime: 5 * 60 * 1000,
    });
  }

  /**
   * Warm client-related cache for client management pages
   */
  warmClientCache() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Prefetch client list
    this.queryClient.prefetchQuery({
      queryKey: cacheKeys.clients.lists(),
      queryFn: () => fetch(`${API_BASE_URL}/clients/`).then(res => res.json()),
      staleTime: 5 * 60 * 1000,
    });
  }

  /**
   * Warm deal-related cache for deal management
   */
  warmDealCache() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Prefetch recent deals
    this.queryClient.prefetchQuery({
      queryKey: cacheKeys.deals.list({ limit: 20, sort: 'created_at' }),
      queryFn: () => fetch(`${API_BASE_URL}/deals/deals/?limit=20&sort=created_at`).then(res => res.json()),
      staleTime: 2 * 60 * 1000,
    });
  }

  /**
   * Predictive cache warming based on user navigation patterns
   */
  warmPredictiveCache(currentPage: string) {
    switch (currentPage) {
      case 'dashboard':
        // From dashboard, users often go to clients or deals
        this.warmClientCache();
        this.warmDealCache();
        break;
      case 'clients':
        // From clients page, users often view client details
        // Warm first few client details
        this.warmClientDetailsCache();
        break;
      case 'deals':
        // From deals page, users often view payments
        this.warmPaymentCache();
        break;
    }
  }

  private warmClientDetailsCache() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    // Get client list from cache and prefetch first 5 client details
    const clientsData = this.queryClient.getQueryData(cacheKeys.clients.lists());
    if (Array.isArray(clientsData)) {
      clientsData.slice(0, 5).forEach((client: any) => {
        this.queryClient.prefetchQuery({
          queryKey: cacheKeys.clients.detail(client.id),
          queryFn: () => fetch(`${API_BASE_URL}/clients/${client.id}/`).then(res => res.json()),
          staleTime: 5 * 60 * 1000,
        });
      });
    }
  }

  private warmPaymentCache() {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    
    this.queryClient.prefetchQuery({
      queryKey: cacheKeys.payments.lists(),
      queryFn: () => fetch(`${API_BASE_URL}/deals/payments/`).then(res => res.json()),
      staleTime: 2 * 60 * 1000,
    });
  }
}

// ==================== CACHE MEMORY MANAGEMENT ====================

/**
 * Memory management for cache optimization
 */
export class CacheMemoryManager {
  constructor(private queryClient: QueryClient) {}

  /**
   * Clean up stale cache entries
   */
  cleanupStaleEntries() {
    // Remove queries that haven't been used in 30 minutes
    this.queryClient.getQueryCache().getAll().forEach(query => {
      const timeSinceLastUsed = Date.now() - query.state.dataUpdatedAt;
      if (timeSinceLastUsed > 30 * 60 * 1000) {
        this.queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }

  /**
   * Implement LRU eviction for cache size management
   */
  implementLRUEviction(maxCacheSize: number = 100) {
    const allQueries = this.queryClient.getQueryCache().getAll();
    
    if (allQueries.length > maxCacheSize) {
      // Sort by last accessed time and remove oldest
      const sortedQueries = allQueries.sort((a, b) => 
        a.state.dataUpdatedAt - b.state.dataUpdatedAt
      );
      
      const queriesToRemove = sortedQueries.slice(0, allQueries.length - maxCacheSize);
      queriesToRemove.forEach(query => {
        this.queryClient.removeQueries({ queryKey: query.queryKey });
      });
    }
  }

  /**
   * Get cache memory usage statistics
   */
  getCacheStats() {
    const queries = this.queryClient.getQueryCache().getAll();
    const mutations = this.queryClient.getMutationCache().getAll();
    
    return {
      queriesCount: queries.length,
      mutationsCount: mutations.length,
      totalEntries: queries.length + mutations.length,
      successfulQueries: queries.filter(q => q.state.status === 'success').length,
      pendingQueries: queries.filter(q => q.state.status === 'pending').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      estimatedMemoryUsage: JSON.stringify(queries).length + JSON.stringify(mutations).length,
    };
  }
}

// ==================== EXPORTS ====================

export type { QueryClient, QueryFilters, QueryKey } from '@tanstack/react-query'; 