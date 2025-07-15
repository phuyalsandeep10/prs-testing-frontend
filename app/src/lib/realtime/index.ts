/**
 * Real-time Synchronization System
 * Handles WebSocket connections, cross-tab sync, and real-time cache updates
 */

import { QueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cacheKeys, CacheInvalidator } from '@/lib/cache';
import { toast } from 'sonner';

// ==================== TYPES ====================

export interface RealtimeMessage {
  type: 'entity_updated' | 'entity_created' | 'entity_deleted' | 'cache_invalidate' | 'user_action';
  entityType: 'client' | 'deal' | 'payment' | 'user' | 'organization';
  entityId: string;
  data?: any;
  timestamp: number;
  userId?: string;
  organizationId?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  heartbeatInterval?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface CrossTabMessage {
  type: 'cache_invalidate' | 'user_action' | 'data_sync';
  payload: any;
  timestamp: number;
  tabId: string;
}

// ==================== WEBSOCKET CONNECTION MANAGER ====================

export class WebSocketConnectionManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private listeners = new Map<string, Function[]>();

  constructor(config: WebSocketConfig) {
    this.config = {
      heartbeatInterval: 30000, // 30 seconds
      reconnectInterval: 5000,  // 5 seconds
      maxReconnectAttempts: 10,
      ...config,
    };
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;

    try {
      // Validate WebSocket URL before attempting connection
      console.log('DEBUG: process.env.NEXT_PUBLIC_WS_URL =', process.env.NEXT_PUBLIC_WS_URL);
      console.log('DEBUG: this.config.url =', this.config.url);
      const defaultUrl = 'ws://localhost:8000/ws/';
      if (!this.config.url || this.config.url === defaultUrl) {
        console.warn('WebSocket URL not configured or using default. Real-time features will be disabled.');
        this.isConnecting = false;
        return;
      }

      // Attach auth token if available and not already present in the URL
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      let urlWithToken = this.config.url;
      if (token && !urlWithToken.includes('token=')) {
        urlWithToken += (urlWithToken.includes('?') ? '&' : '?') + `token=${token}`;
      }
      this.ws = new WebSocket(urlWithToken, this.config.protocols);

      this.ws.onopen = () => {
        console.log('WebSocket connected to:', this.config.url);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected', null);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket connection error:', {
          url: this.config.url,
          error: error,
          readyState: this.ws?.readyState,
          timestamp: new Date().toISOString()
        });
        this.isConnecting = false;
        this.emit('error', { 
          message: 'WebSocket connection failed', 
          url: this.config.url,
          error: error 
        });
      };

    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create WebSocket connection:', {
        url: this.config.url,
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  /**
   * Send message to server
   */
  send(message: any): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: RealtimeMessage): void {
    this.emit('message', message);
    this.emit(message.type, message);
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: Date.now() });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get connection status
   */
  getStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws?.readyState === WebSocket.CLOSED) return 'disconnected';
    return 'error';
  }
}

// ==================== CROSS-TAB SYNCHRONIZATION ====================

export class CrossTabSyncManager {
  private channel: BroadcastChannel;
  private tabId: string;
  private listeners = new Map<string, Function[]>();

  constructor() {
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.channel = new BroadcastChannel('prs_cross_tab_sync');
    
    this.channel.onmessage = (event) => {
      const message: CrossTabMessage = event.data;
      
      // Ignore messages from the same tab
      if (message.tabId !== this.tabId) {
        this.handleMessage(message);
      }
    };
  }

  /**
   * Send message to other tabs
   */
  broadcast(type: CrossTabMessage['type'], payload: any): void {
    const message: CrossTabMessage = {
      type,
      payload,
      timestamp: Date.now(),
      tabId: this.tabId,
    };

    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Failed to broadcast cross-tab message:', error);
    }
  }

  /**
   * Subscribe to cross-tab events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Unsubscribe from cross-tab events
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming cross-tab messages
   */
  private handleMessage(message: CrossTabMessage): void {
    this.emit('message', message);
    this.emit(message.type, message.payload);
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.channel.close();
    this.listeners.clear();
  }
}

// ==================== REALTIME CACHE SYNC ====================

export class RealtimeCacheSync {
  private queryClient: QueryClient;
  private invalidator: CacheInvalidator;
  private wsManager: WebSocketConnectionManager | null = null;
  private crossTabManager: CrossTabSyncManager;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.invalidator = new CacheInvalidator(queryClient);
    this.crossTabManager = new CrossTabSyncManager();
    
    this.setupCrossTabSync();
  }

  /**
   * Initialize WebSocket connection
   */
  initializeWebSocket(config: WebSocketConfig): void {
    this.wsManager = new WebSocketConnectionManager(config);
    this.setupWebSocketSync();
    this.wsManager.connect();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketSync(): void {
    if (!this.wsManager) return;

    this.wsManager.on('entity_updated', (message: RealtimeMessage) => {
      this.handleEntityUpdate(message);
    });

    this.wsManager.on('entity_created', (message: RealtimeMessage) => {
      this.handleEntityCreate(message);
    });

    this.wsManager.on('entity_deleted', (message: RealtimeMessage) => {
      this.handleEntityDelete(message);
    });

    this.wsManager.on('cache_invalidate', (message: RealtimeMessage) => {
      this.handleCacheInvalidate(message);
    });
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    this.crossTabManager.on('cache_invalidate', (payload: any) => {
      this.invalidateCache(payload.entityType, payload.entityId);
    });

    this.crossTabManager.on('data_sync', (payload: any) => {
      // Sync data across tabs
      this.syncDataAcrossTabs(payload);
    });
  }

  /**
   * Handle entity update from WebSocket
   */
  private handleEntityUpdate(message: RealtimeMessage): void {
    const { entityType, entityId, data } = message;

    // Update cache with new data
    if (data) {
      this.updateEntityInCache(entityType, entityId, data);
    }

    // Invalidate related cache
    this.invalidateRelatedCache(entityType, entityId);

    // Broadcast to other tabs
    this.crossTabManager.broadcast('cache_invalidate', {
      entityType,
      entityId,
    });

    // Show notification
    toast.info(`${entityType} updated`, {
      description: `${entityType} ${entityId} has been updated`,
    });
  }

  /**
   * Handle entity creation from WebSocket
   */
  private handleEntityCreate(message: RealtimeMessage): void {
    const { entityType, data } = message;

    // Add to cache if we have data
    if (data) {
      this.addEntityToCache(entityType, data);
    }

    // Invalidate lists to show new entity
    this.invalidateEntityLists(entityType);

    // Broadcast to other tabs
    this.crossTabManager.broadcast('cache_invalidate', {
      entityType,
      entityId: data?.id,
    });

    // Show notification
    toast.success(`New ${entityType} created`, {
      description: `A new ${entityType} has been added`,
    });
  }

  /**
   * Handle entity deletion from WebSocket
   */
  private handleEntityDelete(message: RealtimeMessage): void {
    const { entityType, entityId } = message;

    // Remove from cache
    this.removeEntityFromCache(entityType, entityId);

    // Invalidate related cache
    this.invalidateRelatedCache(entityType, entityId);

    // Broadcast to other tabs
    this.crossTabManager.broadcast('cache_invalidate', {
      entityType,
      entityId,
    });

    // Show notification
    toast.warning(`${entityType} deleted`, {
      description: `${entityType} ${entityId} has been deleted`,
    });
  }

  /**
   * Handle cache invalidation from WebSocket
   */
  private handleCacheInvalidate(message: RealtimeMessage): void {
    const { entityType, entityId } = message;
    this.invalidateCache(entityType, entityId);
  }

  /**
   * Update entity in cache
   */
  private updateEntityInCache(entityType: string, entityId: string, data: any): void {
    switch (entityType) {
      case 'client':
        this.queryClient.setQueryData(cacheKeys.clients.detail(entityId), data);
        break;
      case 'deal':
        this.queryClient.setQueryData(cacheKeys.deals.detail(entityId), data);
        break;
      case 'payment':
        this.queryClient.setQueryData(cacheKeys.payments.detail(entityId), data);
        break;
    }
  }

  /**
   * Add entity to cache lists
   */
  private addEntityToCache(entityType: string, data: any): void {
    switch (entityType) {
      case 'client':
        this.queryClient.setQueryData(cacheKeys.clients.lists(), (oldData: any[]) => {
          return oldData ? [data, ...oldData] : [data];
        });
        break;
      case 'deal':
        this.queryClient.setQueryData(cacheKeys.deals.lists(), (oldData: any[]) => {
          return oldData ? [data, ...oldData] : [data];
        });
        break;
      case 'payment':
        this.queryClient.setQueryData(cacheKeys.payments.lists(), (oldData: any[]) => {
          return oldData ? [data, ...oldData] : [data];
        });
        break;
    }
  }

  /**
   * Remove entity from cache
   */
  private removeEntityFromCache(entityType: string, entityId: string): void {
    switch (entityType) {
      case 'client':
        this.queryClient.removeQueries({ queryKey: cacheKeys.clients.detail(entityId) });
        break;
      case 'deal':
        this.queryClient.removeQueries({ queryKey: cacheKeys.deals.detail(entityId) });
        break;
      case 'payment':
        this.queryClient.removeQueries({ queryKey: cacheKeys.payments.detail(entityId) });
        break;
    }
  }

  /**
   * Invalidate related cache entries
   */
  private invalidateRelatedCache(entityType: string, entityId: string): void {
    this.invalidator.invalidateRelated(entityType as any, entityId);
  }

  /**
   * Invalidate entity lists
   */
  private invalidateEntityLists(entityType: string): void {
    switch (entityType) {
      case 'client':
        this.invalidator.invalidateClients();
        break;
      case 'deal':
        this.invalidator.invalidateDeals();
        break;
      case 'payment':
        this.invalidator.invalidatePayments();
        break;
    }
  }

  /**
   * Generic cache invalidation
   */
  private invalidateCache(entityType: string, entityId?: string): void {
    if (entityId) {
      this.invalidateRelatedCache(entityType, entityId);
    } else {
      this.invalidateEntityLists(entityType);
    }
  }

  /**
   * Sync data across tabs
   */
  private syncDataAcrossTabs(payload: any): void {
    // Implementation for syncing specific data across tabs
    // This could include user preferences, UI state, etc.
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.wsManager?.disconnect();
    this.crossTabManager.destroy();
  }
}

// ==================== REACT HOOKS ====================

/**
 * Hook for WebSocket connection management
 */
export const useWebSocketConnection = (config?: WebSocketConfig) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const managerRef = useRef<WebSocketConnectionManager | null>(null);

  useEffect(() => {
    if (!config || !config.url) {
      console.log('WebSocket configuration not provided. Connection disabled.');
      return;
    }

    const manager = new WebSocketConnectionManager(config);
    managerRef.current = manager;

    manager.on('connected', () => setStatus('connected'));
    manager.on('disconnected', () => setStatus('disconnected'));
    manager.on('error', () => setStatus('error'));
    manager.on('message', (message: RealtimeMessage) => setLastMessage(message));

    // Auto-connect
    manager.connect();

    return () => {
      manager.disconnect();
    };
  }, [config?.url]);

  const send = useCallback((message: any) => {
    return managerRef.current?.send(message) || false;
  }, []);

  const reconnect = useCallback(() => {
    managerRef.current?.connect();
  }, []);

  return {
    status,
    lastMessage,
    send,
    reconnect,
  };
};

/**
 * Hook for real-time cache synchronization
 */
export const useRealtimeSync = (queryClient: QueryClient) => {
  const syncManagerRef = useRef<RealtimeCacheSync | null>(null);

  useEffect(() => {
    const syncManager = new RealtimeCacheSync(queryClient);
    syncManagerRef.current = syncManager;

    // Initialize WebSocket if config is available and not using default
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (typeof window !== 'undefined' && wsUrl && wsUrl !== 'ws://localhost:8000/ws/') {
      const wsConfig = {
        url: wsUrl,
      };
      console.log('Initializing WebSocket for real-time sync:', wsUrl);
      syncManager.initializeWebSocket(wsConfig);
    } else {
      console.log('WebSocket URL not configured. Real-time sync disabled.');
    }

    return () => {
      syncManager.destroy();
    };
  }, [queryClient]);

  return syncManagerRef.current;
};

/**
 * Hook for cross-tab synchronization
 */
export const useCrossTabSync = () => {
  const managerRef = useRef<CrossTabSyncManager | null>(null);
  const [otherTabsCount, setOtherTabsCount] = useState(0);

  useEffect(() => {
    const manager = new CrossTabSyncManager();
    managerRef.current = manager;

    // Listen for tab count updates
    manager.on('tab_count', (count: number) => setOtherTabsCount(count));

    return () => {
      manager.destroy();
    };
  }, []);

  const broadcast = useCallback((type: CrossTabMessage['type'], payload: any) => {
    managerRef.current?.broadcast(type, payload);
  }, []);

  const subscribe = useCallback((event: string, callback: Function) => {
    managerRef.current?.on(event, callback);
    return () => managerRef.current?.off(event, callback);
  }, []);

  return {
    broadcast,
    subscribe,
    otherTabsCount,
  };
}; 