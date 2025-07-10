/**
 * Performance Monitoring System
 * Tracks cache performance, query metrics, and provides real-time analytics
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { useEffect, useState, useRef, useCallback } from 'react';

// ==================== TYPES ====================

export interface QueryMetrics {
  queryKey: string;
  fetchCount: number;
  cacheHitCount: number;
  cacheMissCount: number;
  errorCount: number;
  totalFetchTime: number;
  averageFetchTime: number;
  lastFetchTime: number;
  lastExecuted: number;
  dataSize?: number;
}

export interface MutationMetrics {
  mutationKey: string;
  successCount: number;
  errorCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  lastExecuted: number;
}

export interface CachePerformanceMetrics {
  totalQueries: number;
  totalCacheHits: number;
  totalCacheMisses: number;
  hitRatio: number;
  averageQueryTime: number;
  slowestQueries: QueryMetrics[];
  mostFrequentQueries: QueryMetrics[];
  errorRate: number;
  totalDataSize: number;
}

export interface SystemMetrics {
  memoryUsage: number;
  cacheSize: number;
  networkRequests: number;
  activeQueries: number;
  activeMutations: number;
  timestamp: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'slow_query' | 'high_error_rate' | 'memory_usage' | 'cache_inefficiency';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  metadata?: any;
}

// ==================== PERFORMANCE MONITOR ====================

export class PerformanceMonitor {
  private queryMetrics = new Map<string, QueryMetrics>();
  private mutationMetrics = new Map<string, MutationMetrics>();
  private systemMetrics: SystemMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private queryClient: QueryClient;
  private maxHistorySize = 1000;
  private alertListeners: ((alert: PerformanceAlert) => void)[] = [];

  // Performance thresholds
  private readonly thresholds = {
    slowQueryTime: 5000, // 5 seconds
    highErrorRate: 0.1, // 10%
    lowHitRatio: 0.7, // 70%
    highMemoryUsage: 100 * 1024 * 1024, // 100MB
  };

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.setupQueryTracking();
    this.setupMutationTracking();
    this.startSystemMetricsCollection();
  }

  /**
   * Setup query performance tracking
   */
  private setupQueryTracking(): void {
    const queryCache = this.queryClient.getQueryCache();

    // Track query events
    queryCache.subscribe((event) => {
      if (event.type === 'added') {
        this.trackQueryStart(event.query);
      } else if (event.type === 'updated') {
        this.trackQueryUpdate(event.query);
      }
    });
  }

  /**
   * Setup mutation performance tracking
   */
  private setupMutationTracking(): void {
    const mutationCache = this.queryClient.getMutationCache();

    mutationCache.subscribe((event) => {
      if (event.type === 'added') {
        this.trackMutationStart(event.mutation);
      } else if (event.type === 'updated') {
        this.trackMutationUpdate(event.mutation);
      }
    });
  }

  /**
   * Track query start
   */
  private trackQueryStart(query: any): void {
    const queryKey = JSON.stringify(query.queryKey);
    
    if (!this.queryMetrics.has(queryKey)) {
      this.queryMetrics.set(queryKey, {
        queryKey,
        fetchCount: 0,
        cacheHitCount: 0,
        cacheMissCount: 0,
        errorCount: 0,
        totalFetchTime: 0,
        averageFetchTime: 0,
        lastFetchTime: 0,
        lastExecuted: Date.now(),
      });
    }
  }

  /**
   * Track query update
   */
  private trackQueryUpdate(query: any): void {
    const queryKey = JSON.stringify(query.queryKey);
    const metrics = this.queryMetrics.get(queryKey);
    
    if (!metrics) return;

    const now = Date.now();
    const fetchTime = now - metrics.lastExecuted;

    // Update metrics
    if (query.state.status === 'success') {
      metrics.fetchCount++;
      metrics.totalFetchTime += fetchTime;
      metrics.averageFetchTime = metrics.totalFetchTime / metrics.fetchCount;
      metrics.lastFetchTime = fetchTime;
      
      // Determine if it was a cache hit or miss
      if (query.state.dataUpdateCount === 0) {
        metrics.cacheHitCount++;
      } else {
        metrics.cacheMissCount++;
      }
    } else if (query.state.status === 'error') {
      metrics.errorCount++;
    }

    // Calculate data size if available
    if (query.state.data) {
      metrics.dataSize = this.calculateDataSize(query.state.data);
    }

    metrics.lastExecuted = now;

    // Check for performance alerts
    this.checkQueryPerformanceAlerts(metrics);
  }

  /**
   * Track mutation start
   */
  private trackMutationStart(mutation: any): void {
    const mutationKey = JSON.stringify(mutation.options.mutationKey || 'anonymous');
    
    if (!this.mutationMetrics.has(mutationKey)) {
      this.mutationMetrics.set(mutationKey, {
        mutationKey,
        successCount: 0,
        errorCount: 0,
        totalExecutionTime: 0,
        averageExecutionTime: 0,
        lastExecuted: Date.now(),
      });
    }
  }

  /**
   * Track mutation update
   */
  private trackMutationUpdate(mutation: any): void {
    const mutationKey = JSON.stringify(mutation.options.mutationKey || 'anonymous');
    const metrics = this.mutationMetrics.get(mutationKey);
    
    if (!metrics) return;

    const now = Date.now();
    const executionTime = now - metrics.lastExecuted;

    // Update metrics
    if (mutation.state.status === 'success') {
      metrics.successCount++;
      metrics.totalExecutionTime += executionTime;
      metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.successCount;
    } else if (mutation.state.status === 'error') {
      metrics.errorCount++;
    }

    metrics.lastExecuted = now;
  }

  /**
   * Start collecting system metrics
   */
  private startSystemMetricsCollection(): void {
    const collect = () => {
      const metrics: SystemMetrics = {
        memoryUsage: this.getMemoryUsage(),
        cacheSize: this.getCacheSize(),
        networkRequests: this.getNetworkRequestCount(),
        activeQueries: this.queryClient.getQueryCache().getAll().length,
        activeMutations: this.queryClient.getMutationCache().getAll().length,
        timestamp: Date.now(),
      };

      this.systemMetrics.push(metrics);
      
      // Keep only recent metrics
      if (this.systemMetrics.length > this.maxHistorySize) {
        this.systemMetrics = this.systemMetrics.slice(-this.maxHistorySize);
      }

      // Check for system performance alerts
      this.checkSystemPerformanceAlerts(metrics);
    };

    // Collect metrics every 10 seconds
    setInterval(collect, 10000);
    collect(); // Initial collection
  }

  /**
   * Check for query performance alerts
   */
  private checkQueryPerformanceAlerts(metrics: QueryMetrics): void {
    // Slow query alert
    if (metrics.lastFetchTime > this.thresholds.slowQueryTime) {
      this.addAlert({
        type: 'slow_query',
        message: `Query ${metrics.queryKey} took ${metrics.lastFetchTime}ms`,
        severity: 'high',
        metadata: { queryKey: metrics.queryKey, fetchTime: metrics.lastFetchTime },
      });
    }

    // High error rate alert
    const errorRate = metrics.errorCount / (metrics.fetchCount + metrics.errorCount);
    if (errorRate > this.thresholds.highErrorRate && metrics.fetchCount > 5) {
      this.addAlert({
        type: 'high_error_rate',
        message: `Query ${metrics.queryKey} has ${(errorRate * 100).toFixed(1)}% error rate`,
        severity: 'medium',
        metadata: { queryKey: metrics.queryKey, errorRate },
      });
    }
  }

  /**
   * Check for system performance alerts
   */
  private checkSystemPerformanceAlerts(metrics: SystemMetrics): void {
    // Memory usage alert
    if (metrics.memoryUsage > this.thresholds.highMemoryUsage) {
      this.addAlert({
        type: 'memory_usage',
        message: `High memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        severity: 'high',
        metadata: { memoryUsage: metrics.memoryUsage },
      });
    }

    // Cache inefficiency alert
    const cacheMetrics = this.getCachePerformanceMetrics();
    if (cacheMetrics.hitRatio < this.thresholds.lowHitRatio && cacheMetrics.totalQueries > 10) {
      this.addAlert({
        type: 'cache_inefficiency',
        message: `Low cache hit ratio: ${(cacheMetrics.hitRatio * 100).toFixed(1)}%`,
        severity: 'medium',
        metadata: { hitRatio: cacheMetrics.hitRatio },
      });
    }
  }

  /**
   * Add performance alert
   */
  private addAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.alerts.unshift(fullAlert);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Notify listeners
    this.alertListeners.forEach(listener => listener(fullAlert));
  }

  /**
   * Get cache performance metrics
   */
  getCachePerformanceMetrics(): CachePerformanceMetrics {
    const metrics = Array.from(this.queryMetrics.values());
    
    const totalQueries = metrics.reduce((sum, m) => sum + m.fetchCount, 0);
    const totalCacheHits = metrics.reduce((sum, m) => sum + m.cacheHitCount, 0);
    const totalCacheMisses = metrics.reduce((sum, m) => sum + m.cacheMissCount, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalFetchTime = metrics.reduce((sum, m) => sum + m.totalFetchTime, 0);
    const totalDataSize = metrics.reduce((sum, m) => sum + (m.dataSize || 0), 0);

    const hitRatio = totalQueries > 0 ? totalCacheHits / totalQueries : 0;
    const errorRate = totalQueries > 0 ? totalErrors / totalQueries : 0;
    const averageQueryTime = totalQueries > 0 ? totalFetchTime / totalQueries : 0;

    // Get slowest queries
    const slowestQueries = metrics
      .filter(m => m.averageFetchTime > 0)
      .sort((a, b) => b.averageFetchTime - a.averageFetchTime)
      .slice(0, 10);

    // Get most frequent queries
    const mostFrequentQueries = metrics
      .filter(m => m.fetchCount > 0)
      .sort((a, b) => b.fetchCount - a.fetchCount)
      .slice(0, 10);

    return {
      totalQueries,
      totalCacheHits,
      totalCacheMisses,
      hitRatio,
      averageQueryTime,
      slowestQueries,
      mostFrequentQueries,
      errorRate,
      totalDataSize,
    };
  }

  /**
   * Get mutation performance metrics
   */
  getMutationPerformanceMetrics() {
    const metrics = Array.from(this.mutationMetrics.values());
    
    const totalMutations = metrics.reduce((sum, m) => sum + m.successCount + m.errorCount, 0);
    const totalSuccesses = metrics.reduce((sum, m) => sum + m.successCount, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const totalExecutionTime = metrics.reduce((sum, m) => sum + m.totalExecutionTime, 0);

    const successRate = totalMutations > 0 ? totalSuccesses / totalMutations : 0;
    const averageExecutionTime = totalSuccesses > 0 ? totalExecutionTime / totalSuccesses : 0;

    return {
      totalMutations,
      totalSuccesses,
      totalErrors,
      successRate,
      averageExecutionTime,
      metrics: metrics.slice(0, 20), // Top 20 mutations
    };
  }

  /**
   * Get system metrics history
   */
  getSystemMetricsHistory(timeRange: number = 3600000): SystemMetrics[] {
    const cutoff = Date.now() - timeRange;
    return this.systemMetrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Get recent alerts
   */
  getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    return severity 
      ? this.alerts.filter(a => a.severity === severity)
      : this.alerts;
  }

  /**
   * Subscribe to performance alerts
   */
  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.alertListeners.push(callback);
    return () => {
      const index = this.alertListeners.indexOf(callback);
      if (index > -1) {
        this.alertListeners.splice(index, 1);
      }
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.queryMetrics.clear();
    this.mutationMetrics.clear();
    this.systemMetrics = [];
    this.alerts = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics() {
    return {
      queryMetrics: Array.from(this.queryMetrics.entries()),
      mutationMetrics: Array.from(this.mutationMetrics.entries()),
      systemMetrics: this.systemMetrics,
      alerts: this.alerts,
      cachePerformance: this.getCachePerformanceMetrics(),
      mutationPerformance: this.getMutationPerformanceMetrics(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Get memory usage estimation
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Get cache size estimation
   */
  private getCacheSize(): number {
    const queries = this.queryClient.getQueryCache().getAll();
    return queries.reduce((size, query) => {
      return size + this.calculateDataSize(query.state.data);
    }, 0);
  }

  /**
   * Get network request count
   */
  private getNetworkRequestCount(): number {
    // This would need to be implemented based on your API client
    // For now, we'll use query fetch count as a proxy
    return Array.from(this.queryMetrics.values())
      .reduce((sum, m) => sum + m.fetchCount, 0);
  }

  /**
   * Calculate data size estimation
   */
  private calculateDataSize(data: any): number {
    if (!data) return 0;
    
    try {
      return JSON.stringify(data).length * 2; // Rough estimation (UTF-16)
    } catch {
      return 0;
    }
  }
}

// ==================== REACT HOOKS ====================

/**
 * Hook for performance monitoring
 */
export const usePerformanceMonitor = (queryClient: QueryClient) => {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<CachePerformanceMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);

  useEffect(() => {
    const monitor = new PerformanceMonitor(queryClient);
    monitorRef.current = monitor;

    // Update metrics periodically
    const updateMetrics = () => {
      setCacheMetrics(monitor.getCachePerformanceMetrics());
      setSystemMetrics(monitor.getSystemMetricsHistory());
      setAlerts(monitor.getAlerts());
    };

    const interval = setInterval(updateMetrics, 10000);
    updateMetrics(); // Initial update

    // Subscribe to alerts
    const unsubscribeAlerts = monitor.onAlert((alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 99)]);
    });

    return () => {
      clearInterval(interval);
      unsubscribeAlerts();
    };
  }, [queryClient]);

  const clearMetrics = useCallback(() => {
    monitorRef.current?.clearMetrics();
    setCacheMetrics(null);
    setSystemMetrics([]);
    setAlerts([]);
  }, []);

  const exportMetrics = useCallback(() => {
    return monitorRef.current?.exportMetrics();
  }, []);

  return {
    cacheMetrics,
    systemMetrics,
    alerts,
    clearMetrics,
    exportMetrics,
  };
};

/**
 * Hook for real-time performance metrics
 */
export const useRealtimeMetrics = (queryClient: QueryClient) => {
  const [metrics, setMetrics] = useState({
    activeQueries: 0,
    cacheHitRatio: 0,
    averageQueryTime: 0,
    errorRate: 0,
  });

  useEffect(() => {
    const monitor = new PerformanceMonitor(queryClient);

    const updateMetrics = () => {
      const cacheMetrics = monitor.getCachePerformanceMetrics();
      setMetrics({
        activeQueries: queryClient.getQueryCache().getAll().length,
        cacheHitRatio: cacheMetrics.hitRatio,
        averageQueryTime: cacheMetrics.averageQueryTime,
        errorRate: cacheMetrics.errorRate,
      });
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [queryClient]);

  return metrics;
};

/**
 * Hook for performance alerts
 */
export const usePerformanceAlerts = (queryClient: QueryClient) => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  useEffect(() => {
    const monitor = new PerformanceMonitor(queryClient);
    monitorRef.current = monitor;

    const unsubscribe = monitor.onAlert((alert) => {
      setAlerts(prev => {
        // Add new alert and keep only recent ones
        const updated = [alert, ...prev];
        return updated.slice(0, 50);
      });
    });

    return unsubscribe;
  }, [queryClient]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    alerts,
    clearAlerts,
    dismissAlert,
  };
}; 