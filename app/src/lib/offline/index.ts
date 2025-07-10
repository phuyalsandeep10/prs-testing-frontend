/**
 * Offline Support System
 * Handles offline action queuing, background sync, and network status detection
 */

import { QueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { CacheInvalidator } from '@/lib/cache';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'client' | 'deal' | 'payment' | 'user' | 'organization';
  entityId: string;
  data: any;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[]; // IDs of actions this depends on
}

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string; // 'slow-2g' | '2g' | '3g' | '4g'
  downlink?: number;
  rtt?: number;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
}

// ==================== OFFLINE ACTION QUEUE ====================

export class OfflineActionQueue {
  private queue: OfflineAction[] = [];
  private processing = false;
  private queryClient: QueryClient;
  private invalidator: CacheInvalidator;
  private syncProgressListeners: ((progress: SyncProgress) => void)[] = [];

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.invalidator = new CacheInvalidator(queryClient);
    this.loadQueue();
  }

  /**
   * Add action to offline queue
   */
  enqueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): string {
    const fullAction: OfflineAction = {
      ...action,
      id: this.generateActionId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(fullAction);
    this.saveQueue();
    
    toast.info('Action queued for sync', {
      description: 'Will sync when connection is restored',
    });

    return fullAction.id;
  }

  /**
   * Process all queued actions
   */
  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.notifyProgress();

    // Sort by priority and timestamp
    const sortedQueue = this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.timestamp - b.timestamp;
    });

    const results = await this.processBatch(sortedQueue);
    
    // Remove successful actions
    this.queue = this.queue.filter(action => !results.successful.includes(action.id));
    
    // Update retry counts for failed actions
    results.failed.forEach(failedId => {
      const action = this.queue.find(a => a.id === failedId);
      if (action) {
        action.retryCount++;
        if (action.retryCount >= action.maxRetries) {
          // Remove actions that have exceeded max retries
          this.queue = this.queue.filter(a => a.id !== failedId);
          toast.error(`Action failed permanently: ${action.type} ${action.entityType}`);
        }
      }
    });

    this.saveQueue();
    this.processing = false;
    this.notifyProgress();
  }

  /**
   * Process a batch of actions with dependency resolution
   */
  private async processBatch(actions: OfflineAction[]): Promise<{
    successful: string[];
    failed: string[];
  }> {
    const successful: string[] = [];
    const failed: string[] = [];
    const processed = new Set<string>();

    // Process actions in dependency order
    while (processed.size < actions.length) {
      const readyActions = actions.filter(action => 
        !processed.has(action.id) &&
        (action.dependencies?.every(dep => successful.includes(dep)) ?? true)
      );

      if (readyActions.length === 0) {
        // Remaining actions have unresolvable dependencies
        actions.filter(a => !processed.has(a.id)).forEach(a => {
          failed.push(a.id);
          processed.add(a.id);
        });
        break;
      }

      // Process ready actions in parallel (limited concurrency)
      const batchSize = 3;
      for (let i = 0; i < readyActions.length; i += batchSize) {
        const batch = readyActions.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(action => this.executeAction(action))
        );

        results.forEach((result, index) => {
          const action = batch[index];
          processed.add(action.id);
          
          if (result.status === 'fulfilled') {
            successful.push(action.id);
            this.notifyProgress();
          } else {
            failed.push(action.id);
            console.error(`Action ${action.id} failed:`, result.reason);
          }
        });
      }
    }

    return { successful, failed };
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: OfflineAction): Promise<any> {
    const { method, endpoint, data } = action;

    try {
      let result;
      switch (method) {
        case 'POST':
          result = await apiClient.post(endpoint, data);
          break;
        case 'PUT':
          result = await apiClient.put(endpoint, data);
          break;
        case 'PATCH':
          result = await apiClient.patch(endpoint, data);
          break;
        case 'DELETE':
          result = await apiClient.delete(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Invalidate related cache
      this.invalidator.invalidateRelated(action.entityType, action.entityId);

      toast.success(`${action.type} ${action.entityType} synced successfully`);
      return result;
    } catch (error: any) {
      toast.error(`Failed to sync ${action.type} ${action.entityType}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    totalActions: number;
    pendingActions: number;
    failedActions: number;
    oldestAction?: OfflineAction;
  } {
    const failed = this.queue.filter(a => a.retryCount > 0);
    const oldest = this.queue.length > 0 
      ? this.queue.reduce((oldest, current) => 
          current.timestamp < oldest.timestamp ? current : oldest
        )
      : undefined;

    return {
      totalActions: this.queue.length,
      pendingActions: this.queue.length - failed.length,
      failedActions: failed.length,
      oldestAction: oldest,
    };
  }

  /**
   * Clear all queued actions
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
    this.notifyProgress();
  }

  /**
   * Remove specific action from queue
   */
  removeAction(actionId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter(action => action.id !== actionId);
    
    if (this.queue.length < initialLength) {
      this.saveQueue();
      this.notifyProgress();
      return true;
    }
    return false;
  }

  /**
   * Subscribe to sync progress updates
   */
  onSyncProgress(callback: (progress: SyncProgress) => void): () => void {
    this.syncProgressListeners.push(callback);
    return () => {
      const index = this.syncProgressListeners.indexOf(callback);
      if (index > -1) {
        this.syncProgressListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify sync progress listeners
   */
  private notifyProgress(): void {
    const status = this.getQueueStatus();
    const progress: SyncProgress = {
      total: status.totalActions,
      completed: 0, // This would be tracked during processing
      failed: status.failedActions,
      inProgress: this.processing,
    };

    this.syncProgressListeners.forEach(callback => callback(progress));
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem('offline_action_queue');
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem('offline_action_queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Generate unique action ID
   */
  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== NETWORK STATUS MANAGER ====================

export class NetworkStatusManager {
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private currentStatus: NetworkStatus = { isOnline: navigator.onLine };

  constructor() {
    this.setupEventListeners();
    this.updateNetworkInfo();
  }

  /**
   * Setup network event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Enhanced network information if available
    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', this.handleConnectionChange);
    }
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    this.currentStatus.isOnline = true;
    this.updateNetworkInfo();
    this.notifyListeners();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.currentStatus.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Handle connection change
   */
  private handleConnectionChange = (): void => {
    this.updateNetworkInfo();
    this.notifyListeners();
  };

  /**
   * Update network information
   */
  private updateNetworkInfo(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.currentStatus = {
        ...this.currentStatus,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return { ...this.currentStatus };
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.getStatus()));
  }

  /**
   * Check if network is suitable for heavy operations
   */
  isSuitableForHeavyOperations(): boolean {
    if (!this.currentStatus.isOnline) return false;
    
    const effectiveType = this.currentStatus.effectiveType;
    return !effectiveType || ['3g', '4g'].includes(effectiveType);
  }

  /**
   * Cleanup event listeners
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if ('connection' in navigator) {
      (navigator as any).connection.removeEventListener('change', this.handleConnectionChange);
    }
  }
}

// ==================== BACKGROUND SYNC MANAGER ====================

export class BackgroundSyncManager {
  private queryClient: QueryClient;
  private actionQueue: OfflineActionQueue;
  private networkManager: NetworkStatusManager;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncInterval = 30000; // 30 seconds

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.actionQueue = new OfflineActionQueue(queryClient);
    this.networkManager = new NetworkStatusManager();
    
    this.setupAutoSync();
  }

  /**
   * Setup automatic sync when online
   */
  private setupAutoSync(): void {
    // Listen for network status changes
    this.networkManager.subscribe((status) => {
      if (status.isOnline) {
        this.startAutoSync();
        // Immediate sync when coming online
        this.syncNow();
      } else {
        this.stopAutoSync();
      }
    });

    // Start auto sync if currently online
    if (this.networkManager.getStatus().isOnline) {
      this.startAutoSync();
    }
  }

  /**
   * Start automatic sync timer
   */
  private startAutoSync(): void {
    this.stopAutoSync(); // Clear existing timer
    
    this.syncTimer = setInterval(() => {
      this.syncNow();
    }, this.syncInterval);
  }

  /**
   * Stop automatic sync timer
   */
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Perform immediate sync
   */
  async syncNow(): Promise<void> {
    if (!this.networkManager.getStatus().isOnline) {
      return;
    }

    try {
      await this.actionQueue.processQueue();
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }

  /**
   * Queue action for offline sync
   */
  queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): string {
    return this.actionQueue.enqueue(action);
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      networkStatus: this.networkManager.getStatus(),
      queueStatus: this.actionQueue.getQueueStatus(),
      autoSyncEnabled: this.syncTimer !== null,
    };
  }

  /**
   * Subscribe to sync progress
   */
  onSyncProgress(callback: (progress: SyncProgress) => void): () => void {
    return this.actionQueue.onSyncProgress(callback);
  }

  /**
   * Clear all queued actions
   */
  clearQueue(): void {
    this.actionQueue.clearQueue();
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoSync();
    this.networkManager.destroy();
  }
}

// ==================== REACT HOOKS ====================

/**
 * Hook for network status monitoring
 */
export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({ isOnline: navigator.onLine });
  const managerRef = useRef<NetworkStatusManager | null>(null);

  useEffect(() => {
    const manager = new NetworkStatusManager();
    managerRef.current = manager;
    
    setStatus(manager.getStatus());
    
    const unsubscribe = manager.subscribe(setStatus);
    
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, []);

  return {
    ...status,
    isSuitableForHeavyOperations: managerRef.current?.isSuitableForHeavyOperations() ?? true,
  };
};

/**
 * Hook for offline action queue management
 */
export const useOfflineQueue = (queryClient: QueryClient) => {
  const [queueStatus, setQueueStatus] = useState({
    totalActions: 0,
    pendingActions: 0,
    failedActions: 0,
    oldestAction: undefined as OfflineAction | undefined,
  });
  
  const queueRef = useRef<OfflineActionQueue | null>(null);

  useEffect(() => {
    const queue = new OfflineActionQueue(queryClient);
    queueRef.current = queue;
    
    // Update status initially and periodically
    const updateStatus = () => setQueueStatus(queue.getQueueStatus());
    updateStatus();
    
    const interval = setInterval(updateStatus, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [queryClient]);

  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    return queueRef.current?.enqueue(action) || '';
  }, []);

  const processQueue = useCallback(() => {
    return queueRef.current?.processQueue();
  }, []);

  const clearQueue = useCallback(() => {
    queueRef.current?.clearQueue();
  }, []);

  const removeAction = useCallback((actionId: string) => {
    return queueRef.current?.removeAction(actionId) || false;
  }, []);

  return {
    queueStatus,
    queueAction,
    processQueue,
    clearQueue,
    removeAction,
  };
};

/**
 * Hook for background sync management
 */
export const useBackgroundSync = (queryClient: QueryClient) => {
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
  });
  
  const managerRef = useRef<BackgroundSyncManager | null>(null);

  useEffect(() => {
    const manager = new BackgroundSyncManager(queryClient);
    managerRef.current = manager;
    
    const unsubscribe = manager.onSyncProgress(setSyncProgress);
    
    return () => {
      unsubscribe();
      manager.destroy();
    };
  }, [queryClient]);

  const syncNow = useCallback(() => {
    return managerRef.current?.syncNow();
  }, []);

  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    return managerRef.current?.queueAction(action) || '';
  }, []);

  const getSyncStatus = useCallback(() => {
    return managerRef.current?.getSyncStatus();
  }, []);

  const clearQueue = useCallback(() => {
    managerRef.current?.clearQueue();
  }, []);

  return {
    syncProgress,
    syncNow,
    queueAction,
    getSyncStatus,
    clearQueue,
  };
}; 