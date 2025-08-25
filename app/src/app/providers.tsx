"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
// import { SessionProvider } from "next-auth/react"; // Removed - using custom auth
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
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/components/providers/AuthProvider";

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
    console.log('✅ Notification System');
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
      
      // Cleanup stale entries every 10 minutes (more frequent to prevent accumulation)
      const cleanupInterval = setInterval(() => {
        try {
          memoryManager.cleanupStaleEntries();
          memoryManager.implementLRUEviction(100); // Reduced to 100 for better memory management
          
          // Log cache stats in development
          if (process.env.NODE_ENV === 'development') {
            console.log('🔄 Cache Stats:', memoryManager.getCacheStats());
          }
        } catch (error) {
          console.error('❌ Cache cleanup error:', error);
        }
      }, 10 * 60 * 1000);
      
      // Enhanced cleanup on unmount and visibility change
      const cleanup = () => {
        clearInterval(cleanupInterval);
        memoryManager.cleanupStaleEntries();
      };
      
      window.addEventListener('beforeunload', cleanup);
      window.addEventListener('pagehide', cleanup);
      
      // Clean up when page becomes hidden (tab switching)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          memoryManager.cleanupStaleEntries();
        }
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
      <AuthProvider>
        <NotificationProvider>
          <AdvancedFeaturesProvider queryClient={queryClient}>
            {children}
          </AdvancedFeaturesProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
