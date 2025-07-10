/**
 * Optimistic Updates System
 * Provides immediate UI feedback with automatic rollback on failures
 */

import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface OptimisticUpdateContext<T = any> {
  previousData: T | undefined;
  optimisticData: T;
  timestamp: number;
  retryCount: number;
}

export interface ConflictResolutionStrategy {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  mergeFunction?: (server: any, client: any) => any;
}

export interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: any[];
  optimisticUpdateFn: (variables: TVariables, previousData: TData | undefined) => TData;
  conflictResolution?: ConflictResolutionStrategy;
  onOptimisticUpdate?: (data: TData) => void;
  onRollback?: (previousData: TData | undefined) => void;
  onConflict?: (serverData: TData, clientData: TData) => TData;
}

// ==================== OPTIMISTIC UPDATE MANAGER ====================

export class OptimisticUpdateManager {
  private pendingUpdates = new Map<string, OptimisticUpdateContext>();
  private conflictQueue = new Map<string, any>();

  constructor(private queryClient: QueryClient) {}

  /**
   * Execute optimistic update with automatic rollback
   */
  async executeOptimisticUpdate<TData, TVariables>(
    options: OptimisticMutationOptions<TData, TVariables>,
    variables: TVariables
  ): Promise<TData> {
    const { queryKey, optimisticUpdateFn, mutationFn, conflictResolution } = options;
    const updateId = this.generateUpdateId(queryKey, variables);

    try {
      // Cancel outgoing refetches
      await this.queryClient.cancelQueries({ queryKey });

      // Snapshot previous data
      const previousData = this.queryClient.getQueryData<TData>(queryKey);

      // Generate optimistic data
      const optimisticData = optimisticUpdateFn(variables, previousData);

      // Store context for potential rollback
      this.pendingUpdates.set(updateId, {
        previousData,
        optimisticData,
        timestamp: Date.now(),
        retryCount: 0,
      });

      // Apply optimistic update
      this.queryClient.setQueryData(queryKey, optimisticData);
      options.onOptimisticUpdate?.(optimisticData);

      // Execute actual mutation
      const serverData = await mutationFn(variables);

      // Check for conflicts
      if (this.hasConflict(optimisticData, serverData)) {
        const resolvedData = this.resolveConflict(
          serverData,
          optimisticData,
          conflictResolution || { strategy: 'server-wins' }
        );
        
        this.queryClient.setQueryData(queryKey, resolvedData);
        options.onConflict?.(serverData, optimisticData);
        
        return resolvedData;
      }

      // Update with server data
      this.queryClient.setQueryData(queryKey, serverData);
      this.pendingUpdates.delete(updateId);

      return serverData;
    } catch (error) {
      // Rollback optimistic update
      const context = this.pendingUpdates.get(updateId);
      if (context) {
        this.queryClient.setQueryData(queryKey, context.previousData);
        options.onRollback?.(context.previousData);
        this.pendingUpdates.delete(updateId);
      }

      throw error;
    }
  }

  /**
   * Batch optimistic updates for multiple operations
   */
  async executeBatchOptimisticUpdates<T>(
    updates: Array<{
      queryKey: any[];
      updateFn: (previous: T | undefined) => T;
      mutationFn: () => Promise<T>;
    }>
  ): Promise<T[]> {
    const updateIds: string[] = [];
    const contexts: OptimisticUpdateContext[] = [];

    try {
      // Apply all optimistic updates first
      for (const update of updates) {
        await this.queryClient.cancelQueries({ queryKey: update.queryKey });
        
        const previousData = this.queryClient.getQueryData<T>(update.queryKey);
        const optimisticData = update.updateFn(previousData);
        const updateId = this.generateUpdateId(update.queryKey, optimisticData);
        
        const context: OptimisticUpdateContext = {
          previousData,
          optimisticData,
          timestamp: Date.now(),
          retryCount: 0,
        };
        
        updateIds.push(updateId);
        contexts.push(context);
        this.pendingUpdates.set(updateId, context);
        
        this.queryClient.setQueryData(update.queryKey, optimisticData);
      }

      // Execute all mutations
      const results = await Promise.all(updates.map(update => update.mutationFn()));

      // Update with server data
      results.forEach((result, index) => {
        this.queryClient.setQueryData(updates[index].queryKey, result);
        this.pendingUpdates.delete(updateIds[index]);
      });

      return results;
    } catch (error) {
      // Rollback all optimistic updates
      contexts.forEach((context, index) => {
        this.queryClient.setQueryData(updates[index].queryKey, context.previousData);
        this.pendingUpdates.delete(updateIds[index]);
      });

      throw error;
    }
  }

  /**
   * Check if there's a conflict between optimistic and server data
   */
  private hasConflict(optimisticData: any, serverData: any): boolean {
    // Simple conflict detection - can be enhanced based on needs
    if (typeof optimisticData === 'object' && typeof serverData === 'object') {
      // Check for version conflicts
      if (optimisticData.version && serverData.version) {
        return optimisticData.version !== serverData.version;
      }
      
      // Check for timestamp conflicts
      if (optimisticData.updated_at && serverData.updated_at) {
        return new Date(optimisticData.updated_at) < new Date(serverData.updated_at);
      }
    }
    
    return false;
  }

  /**
   * Resolve conflicts between optimistic and server data
   */
  private resolveConflict(
    serverData: any,
    clientData: any,
    strategy: ConflictResolutionStrategy
  ): any {
    switch (strategy.strategy) {
      case 'server-wins':
        return serverData;
      
      case 'client-wins':
        return clientData;
      
      case 'merge':
        if (strategy.mergeFunction) {
          return strategy.mergeFunction(serverData, clientData);
        }
        // Default merge strategy
        return { ...serverData, ...clientData };
      
      case 'manual':
        // Store conflict for manual resolution
        this.conflictQueue.set(this.generateUpdateId([serverData.id], serverData), {
          server: serverData,
          client: clientData,
          timestamp: Date.now(),
        });
        return serverData; // Default to server data until manual resolution
      
      default:
        return serverData;
    }
  }

  /**
   * Generate unique update ID
   */
  private generateUpdateId(queryKey: any[], variables: any): string {
    return `${JSON.stringify(queryKey)}_${JSON.stringify(variables)}_${Date.now()}`;
  }

  /**
   * Get pending updates count
   */
  getPendingUpdatesCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * Get conflicts that need manual resolution
   */
  getConflicts(): Map<string, any> {
    return new Map(this.conflictQueue);
  }

  /**
   * Resolve a manual conflict
   */
  resolveManualConflict(conflictId: string, resolvedData: any): void {
    if (this.conflictQueue.has(conflictId)) {
      // Apply resolved data
      // The specific implementation would depend on how we track the query key
      this.conflictQueue.delete(conflictId);
    }
  }

  /**
   * Clear all pending updates (useful for cleanup)
   */
  clearPendingUpdates(): void {
    this.pendingUpdates.clear();
  }
}

// ==================== OPTIMISTIC UPDATE HOOKS ====================

/**
 * Hook for creating optimistic mutations
 */
export const useOptimisticMutation = <TData, TVariables>(
  options: OptimisticMutationOptions<TData, TVariables>
) => {
  const queryClient = useQueryClient();
  const manager = useRef(new OptimisticUpdateManager(queryClient));

  return useMutation({
    mutationFn: (variables: TVariables) =>
      manager.current.executeOptimisticUpdate(options, variables),
    
    onError: (error: any) => {
      toast.error(error.message || 'Update failed. Changes have been reverted.');
    },
    
    onSuccess: (data: TData) => {
      toast.success('Update successful!');
    },
  });
};

/**
 * Hook for batch optimistic updates
 */
export const useBatchOptimisticMutation = () => {
  const queryClient = useQueryClient();
  const manager = useRef(new OptimisticUpdateManager(queryClient));

  const executeBatch = useCallback(
    async <T>(updates: Array<{
      queryKey: any[];
      updateFn: (previous: T | undefined) => T;
      mutationFn: () => Promise<T>;
    }>) => {
      try {
        const results = await manager.current.executeBatchOptimisticUpdates(updates);
        toast.success(`${updates.length} updates completed successfully!`);
        return results;
      } catch (error: any) {
        toast.error(error.message || 'Batch update failed. Changes have been reverted.');
        throw error;
      }
    },
    [manager]
  );

  return { executeBatch };
};

/**
 * Hook for monitoring optimistic updates
 */
export const useOptimisticUpdateMonitor = () => {
  const queryClient = useQueryClient();
  const manager = useRef(new OptimisticUpdateManager(queryClient));
  const [pendingCount, setPendingCount] = useState(0);
  const [conflicts, setConflicts] = useState<Map<string, any>>(new Map());

  const updateStatus = useCallback(() => {
    setPendingCount(manager.current.getPendingUpdatesCount());
    setConflicts(manager.current.getConflicts());
  }, []);

  // Update status periodically
  React.useEffect(() => {
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  const resolveConflict = useCallback((conflictId: string, resolvedData: any) => {
    manager.current.resolveManualConflict(conflictId, resolvedData);
    updateStatus();
  }, [updateStatus]);

  const clearPending = useCallback(() => {
    manager.current.clearPendingUpdates();
    updateStatus();
  }, [updateStatus]);

  return {
    pendingCount,
    conflicts,
    resolveConflict,
    clearPending,
    updateStatus,
  };
};

// ==================== OPTIMISTIC UPDATE PATTERNS ====================

/**
 * Common optimistic update patterns for different entities
 */
export const OptimisticPatterns = {
  /**
   * Client update pattern
   */
  updateClient: (clientId: string, updates: any) => ({
    optimisticUpdateFn: (variables: any, previousData: any) => {
      if (Array.isArray(previousData)) {
        return previousData.map(client => 
          client.id === clientId ? { ...client, ...updates } : client
        );
      }
      return { ...previousData, ...updates };
    },
    conflictResolution: {
      strategy: 'merge' as const,
      mergeFunction: (server: any, client: any) => ({
        ...server,
        // Preserve client-side changes that don't conflict
        client_name: client.client_name || server.client_name,
        email: client.email || server.email,
        phone_number: client.phone_number || server.phone_number,
      }),
    },
  }),

  /**
   * Deal update pattern
   */
  updateDeal: (dealId: string, updates: any) => ({
    optimisticUpdateFn: (variables: any, previousData: any) => {
      if (Array.isArray(previousData)) {
        return previousData.map(deal => 
          deal.id === dealId ? { ...deal, ...updates, updated_at: new Date().toISOString() } : deal
        );
      }
      return { ...previousData, ...updates, updated_at: new Date().toISOString() };
    },
    conflictResolution: {
      strategy: 'server-wins' as const, // Deals are more critical, server wins
    },
  }),

  /**
   * Payment update pattern
   */
  updatePayment: (paymentId: string, updates: any) => ({
    optimisticUpdateFn: (variables: any, previousData: any) => {
      if (Array.isArray(previousData)) {
        return previousData.map(payment => 
          payment.id === paymentId ? { ...payment, ...updates } : payment
        );
      }
      return { ...previousData, ...updates };
    },
    conflictResolution: {
      strategy: 'manual' as const, // Payments need manual review for conflicts
    },
  }),

  /**
   * Create entity pattern
   */
  createEntity: (tempId: string) => ({
    optimisticUpdateFn: (variables: any, previousData: any) => {
      const newEntity = {
        ...variables,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Mark as optimistic for UI indicators
        _optimistic: true,
      };

      if (Array.isArray(previousData)) {
        return [newEntity, ...previousData];
      }
      return newEntity;
    },
    conflictResolution: {
      strategy: 'server-wins' as const,
    },
  }),

  /**
   * Delete entity pattern
   */
  deleteEntity: (entityId: string) => ({
    optimisticUpdateFn: (variables: any, previousData: any) => {
      if (Array.isArray(previousData)) {
        return previousData.filter(entity => entity.id !== entityId);
      }
      return null; // Entity deleted
    },
    conflictResolution: {
      strategy: 'server-wins' as const,
    },
  }),
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate temporary ID for optimistic creates
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if data is optimistic (temporary)
 */
export const isOptimistic = (data: any): boolean => {
  return data?._optimistic === true || data?.id?.startsWith('temp_');
};

/**
 * Clean optimistic markers from data
 */
export const cleanOptimisticData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.filter(item => !isOptimistic(item));
  }
  
  if (data && typeof data === 'object') {
    const { _optimistic, ...cleanData } = data;
    return cleanData;
  }
  
  return data;
}; 