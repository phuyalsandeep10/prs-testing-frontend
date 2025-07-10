"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { 
  createAdvancedQueryClient, 
  setupCachePersistence, 
  CacheWarmer, 
  CacheMemoryManager,
  CacheInvalidator 
} from "@/lib/cache";
import { useRealtimeSync } from "@/lib/realtime";
import { useBackgroundSync } from "@/lib/offline";
import { usePerformanceMonitor } from "@/lib/monitoring";

// Phase 4B Day 2: Advanced Features Provider
function AdvancedFeaturesProvider({ children, queryClient }: { children: ReactNode; queryClient: any }) {
  // Real-time synchronization
  const realtimeSync = useRealtimeSync(queryClient);
  
  // Background sync for offline support
  const backgroundSync = useBackgroundSync(queryClient);
  
  // Performance monitoring
  const performanceMonitor = usePerformanceMonitor(queryClient);
  
  // Initialize advanced features
  useEffect(() => {
    console.log('🚀 Phase 4B Day 2 Advanced Features Initialized:');
    console.log('✅ Real-time Synchronization');
    console.log('✅ Offline Support & Background Sync');
    console.log('✅ Performance Monitoring');
    console.log('✅ Optimistic Updates');
    console.log('✅ Cross-tab Synchronization');
  }, []);

  return <>{children}</>;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = createAdvancedQueryClient();
    
    // Initialize cache utilities
    if (typeof window !== 'undefined') {
      // Setup cache persistence
      setupCachePersistence(client);
      
      // Initialize cache warming
      const warmer = new CacheWarmer(client);
      warmer.warmDashboardCache();
      
      // Setup memory management
      const memoryManager = new CacheMemoryManager(client);
      
      // Cleanup stale entries every 15 minutes
      const cleanupInterval = setInterval(() => {
        memoryManager.cleanupStaleEntries();
        memoryManager.implementLRUEviction(150); // Max 150 cache entries
      }, 15 * 60 * 1000);
      
      // Cleanup on unmount
      window.addEventListener('beforeunload', () => {
        clearInterval(cleanupInterval);
      });
      
      // Make cache utilities available globally for debugging
      if (process.env.NODE_ENV === 'development') {
        (window as any).cacheUtils = {
          warmer,
          memoryManager,
          invalidator: new CacheInvalidator(client),
          getStats: () => memoryManager.getCacheStats(),
        };
      }
    }
    
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AdvancedFeaturesProvider queryClient={queryClient}>
        {children}
      </AdvancedFeaturesProvider>
    </QueryClientProvider>
  );
}
