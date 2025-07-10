/**
 * Advanced Prefetching Hooks for Predictive Loading
 * Implements intelligent cache warming and predictive prefetching
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cacheKeys, CacheWarmer } from '@/lib/cache';
import { apiClient } from '@/lib/api-client';

// ==================== PREFETCHING STRATEGIES ====================

/**
 * Hover prefetching hook - prefetches data when user hovers over links
 */
export const useHoverPrefetch = () => {
  const queryClient = useQueryClient();
  const prefetchTimeoutRef = useRef<NodeJS.Timeout>();

  const prefetchOnHover = useCallback(
    (entityType: 'client' | 'deal' | 'organization' | 'user', entityId: string) => {
      // Clear any existing timeout
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }

      // Prefetch after 100ms hover delay
      prefetchTimeoutRef.current = setTimeout(() => {
        switch (entityType) {
          case 'client':
            queryClient.prefetchQuery({
              queryKey: cacheKeys.clients.detail(entityId),
              queryFn: () => apiClient.get(`/clients/${entityId}/`),
              staleTime: 5 * 60 * 1000,
            });
            break;
          case 'deal':
            queryClient.prefetchQuery({
              queryKey: cacheKeys.deals.detail(entityId),
              queryFn: () => apiClient.get(`/deals/${entityId}/`),
              staleTime: 5 * 60 * 1000,
            });
            break;
          case 'organization':
            queryClient.prefetchQuery({
              queryKey: cacheKeys.organizations.detail(entityId),
              queryFn: () => apiClient.get(`/organizations/${entityId}/`),
              staleTime: 5 * 60 * 1000,
            });
            break;
          case 'user':
            queryClient.prefetchQuery({
              queryKey: cacheKeys.users.detail(entityId),
              queryFn: () => apiClient.get(`/users/${entityId}/`),
              staleTime: 5 * 60 * 1000,
            });
            break;
        }
      }, 100);
    },
    [queryClient]
  );

  const cancelPrefetch = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);

  return { prefetchOnHover, cancelPrefetch };
};

/**
 * Route-based prefetching hook - prefetches data based on current route
 */
export const useRoutePrefetch = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const warmer = new CacheWarmer(queryClient);

  const prefetchForRoute = useCallback(
    (route: string) => {
      // Clean route path
      const cleanRoute = route.split('?')[0].split('#')[0];
      
      // Determine prefetch strategy based on route
      if (cleanRoute.includes('dashboard')) {
        // Prefetch dashboard-related data
        warmer.warmDashboardCache();
        
        // Prefetch recent clients and deals
        queryClient.prefetchQuery({
          queryKey: cacheKeys.clients.list({ limit: 10, sort: 'created_at' }),
          queryFn: () => apiClient.get('/clients/?limit=10&sort=created_at'),
          staleTime: 5 * 60 * 1000,
        });
        
        queryClient.prefetchQuery({
          queryKey: cacheKeys.deals.list({ limit: 10, sort: 'created_at' }),
          queryFn: () => apiClient.get('/deals/?limit=10&sort=created_at'),
          staleTime: 5 * 60 * 1000,
        });
      } else if (cleanRoute.includes('client')) {
        // Prefetch client-related data
        warmer.warmClientCache();
        
        // Prefetch client deals
        queryClient.prefetchQuery({
          queryKey: cacheKeys.deals.list({ entity_type: 'client', limit: 20 }),
          queryFn: () => apiClient.get('/deals/?entity_type=client&limit=20'),
          staleTime: 5 * 60 * 1000,
        });
      } else if (cleanRoute.includes('deal')) {
        // Prefetch deal-related data
        warmer.warmDealCache();
        
        // Prefetch payment data
        queryClient.prefetchQuery({
          queryKey: cacheKeys.payments.list({ limit: 20 }),
          queryFn: () => apiClient.get('/payments/?limit=20'),
          staleTime: 2 * 60 * 1000,
        });
      } else if (cleanRoute.includes('commission')) {
        // Prefetch commission data
        queryClient.prefetchQuery({
          queryKey: cacheKeys.dashboard.commission('current'),
          queryFn: () => apiClient.get('/dashboard/commission/?period=current'),
          staleTime: 2 * 60 * 1000,
        });
        
        queryClient.prefetchQuery({
          queryKey: cacheKeys.dashboard.commission('monthly'),
          queryFn: () => apiClient.get('/dashboard/commission/?period=monthly'),
          staleTime: 5 * 60 * 1000,
        });
      }
    },
    [queryClient, warmer]
  );

  return { prefetchForRoute };
};

/**
 * Intelligent prefetching based on user behavior patterns
 */
export const useIntelligentPrefetch = () => {
  const queryClient = useQueryClient();
  const userActionHistoryRef = useRef<string[]>([]);
  const lastActionTimeRef = useRef<number>(Date.now());

  const recordUserAction = useCallback((action: string) => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTimeRef.current;
    
    // Only record if action is different from last or sufficient time has passed
    if (timeSinceLastAction > 1000 || 
        userActionHistoryRef.current[userActionHistoryRef.current.length - 1] !== action) {
      userActionHistoryRef.current.push(action);
      lastActionTimeRef.current = now;
      
      // Keep only last 20 actions
      if (userActionHistoryRef.current.length > 20) {
        userActionHistoryRef.current = userActionHistoryRef.current.slice(-20);
      }
      
      // Trigger predictive prefetching
      predictNextAction();
    }
  }, []);

  const predictNextAction = useCallback(() => {
    const history = userActionHistoryRef.current;
    if (history.length < 2) return;

    const lastAction = history[history.length - 1];
    const secondLastAction = history[history.length - 2];

    // Pattern-based predictions
    if (lastAction === 'view_dashboard' && secondLastAction === 'login') {
      // User likely to check clients after viewing dashboard
      queryClient.prefetchQuery({
        queryKey: cacheKeys.clients.lists(),
        queryFn: () => apiClient.get('/clients/'),
        staleTime: 5 * 60 * 1000,
      });
    } else if (lastAction === 'view_clients' && secondLastAction === 'view_dashboard') {
      // User likely to view client details or deals
      queryClient.prefetchQuery({
        queryKey: cacheKeys.deals.list({ limit: 10 }),
        queryFn: () => apiClient.get('/deals/?limit=10'),
        staleTime: 5 * 60 * 1000,
      });
    } else if (lastAction.startsWith('view_client_') && secondLastAction === 'view_clients') {
      // User viewing client details likely to check deals
      const clientId = lastAction.split('_')[2];
      if (clientId) {
        queryClient.prefetchQuery({
          queryKey: cacheKeys.deals.byClient(clientId),
          queryFn: () => apiClient.get(`/deals/?client_id=${clientId}`),
          staleTime: 5 * 60 * 1000,
        });
      }
    } else if (lastAction === 'view_deals' && secondLastAction.startsWith('view_client_')) {
      // User viewing deals likely to check payments
      queryClient.prefetchQuery({
        queryKey: cacheKeys.payments.list({ limit: 10 }),
        queryFn: () => apiClient.get('/payments/?limit=10'),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [queryClient]);

  return { recordUserAction };
};

/**
 * Background refresh hook for keeping critical data fresh
 */
export const useBackgroundRefresh = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setup background refresh intervals
    const dashboardInterval = setInterval(() => {
      // Refresh dashboard data every 2 minutes
      queryClient.invalidateQueries({ queryKey: cacheKeys.dashboard.main() });
    }, 2 * 60 * 1000);

    const paymentsInterval = setInterval(() => {
      // Refresh payment data every 1 minute (more critical)
      queryClient.invalidateQueries({ queryKey: cacheKeys.payments.verification() });
    }, 1 * 60 * 1000);

    const commissionsInterval = setInterval(() => {
      // Refresh commission data every 5 minutes
      queryClient.invalidateQueries({ queryKey: cacheKeys.dashboard.commission() });
    }, 5 * 60 * 1000);

    // Cleanup intervals on unmount
    return () => {
      clearInterval(dashboardInterval);
      clearInterval(paymentsInterval);
      clearInterval(commissionsInterval);
    };
  }, [queryClient]);

  // Manual refresh functions
  const refreshDashboard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.dashboard.all });
  }, [queryClient]);

  const refreshPayments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: cacheKeys.payments.all });
  }, [queryClient]);

  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return { refreshDashboard, refreshPayments, refreshAll };
};

/**
 * Component-specific prefetching utilities
 */
export const usePrefetchUtils = () => {
  const { prefetchOnHover, cancelPrefetch } = useHoverPrefetch();
  const { prefetchForRoute } = useRoutePrefetch();
  const { recordUserAction } = useIntelligentPrefetch();

  // Combined prefetch function for common use cases
  const prefetchEntityDetails = useCallback(
    (entityType: 'client' | 'deal' | 'organization' | 'user', entityId: string) => {
      prefetchOnHover(entityType, entityId);
      recordUserAction(`prefetch_${entityType}_${entityId}`);
    },
    [prefetchOnHover, recordUserAction]
  );

  // Prefetch related data when viewing an entity
  const prefetchRelatedData = useCallback(
    (entityType: 'client' | 'deal', entityId: string) => {
      const queryClient = useQueryClient();
      
      if (entityType === 'client') {
        // Prefetch client's deals
        queryClient.prefetchQuery({
          queryKey: cacheKeys.deals.byClient(entityId),
          queryFn: () => apiClient.get(`/deals/?client_id=${entityId}`),
          staleTime: 5 * 60 * 1000,
        });
      } else if (entityType === 'deal') {
        // Prefetch deal's payments
        queryClient.prefetchQuery({
          queryKey: cacheKeys.payments.byDeal(entityId),
          queryFn: () => apiClient.get(`/payments/?deal_id=${entityId}`),
          staleTime: 2 * 60 * 1000,
        });
      }
    },
    []
  );

  return {
    prefetchOnHover,
    cancelPrefetch,
    prefetchForRoute,
    prefetchEntityDetails,
    prefetchRelatedData,
    recordUserAction,
  };
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Prefetch data based on viewport visibility
 */
export const usePrefetchOnVisible = () => {
  const queryClient = useQueryClient();
  const observerRef = useRef<IntersectionObserver>();

  const prefetchOnVisible = useCallback(
    (element: HTMLElement, queryKey: any[], queryFn: () => Promise<any>) => {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                queryClient.prefetchQuery({
                  queryKey,
                  queryFn,
                  staleTime: 5 * 60 * 1000,
                });
                observerRef.current?.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.1 }
        );
      }
      
      observerRef.current.observe(element);
    },
    [queryClient]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { prefetchOnVisible };
};

/**
 * Bulk prefetch utility for large datasets
 */
export const useBulkPrefetch = () => {
  const queryClient = useQueryClient();

  const bulkPrefetch = useCallback(
    async (
      prefetchConfigs: Array<{
        queryKey: any[];
        queryFn: () => Promise<any>;
        priority?: 'high' | 'medium' | 'low';
      }>
    ) => {
      // Sort by priority
      const sortedConfigs = prefetchConfigs.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
      });

      // Prefetch in batches to avoid overwhelming the network
      const batchSize = 3;
      for (let i = 0; i < sortedConfigs.length; i += batchSize) {
        const batch = sortedConfigs.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(config =>
            queryClient.prefetchQuery({
              queryKey: config.queryKey,
              queryFn: config.queryFn,
              staleTime: 5 * 60 * 1000,
            })
          )
        );
        
        // Small delay between batches
        if (i + batchSize < sortedConfigs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    },
    [queryClient]
  );

  return { bulkPrefetch };
}; 