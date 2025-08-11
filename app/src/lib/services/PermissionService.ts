"use client";

import { UserRole, Permission, User } from '@/lib/types/roles';
import { 
  hasPermission as coreHasPermission, 
  canAccessRoute as coreCanAccessRoute,
  canAccessResource as coreCanAccessResource,
  PermissionScope,
  ROLE_PERMISSIONS,
  ROUTE_PERMISSIONS
} from '@/lib/auth/permissions';
import { apiClient } from '@/lib/api-client';

/**
 * Enhanced Permission Service with caching, refresh mechanisms, and centralized logic
 * This service provides a single source of truth for all permission-related operations
 */
export class PermissionService {
  private static instance: PermissionService;
  private permissionCache = new Map<string, boolean>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private refreshInProgress = false;
  private refreshPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Generate cache key for permission checks
   */
  private getCacheKey(userId: string, operation: string, ...params: any[]): string {
    return `${userId}:${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Get from cache or compute permission
   */
  private async getOrCompute<T>(
    key: string,
    computeFn: () => T | Promise<T>
  ): Promise<T> {
    // Check cache first
    if (this.isCacheValid(key) && this.permissionCache.has(key)) {
      return this.permissionCache.get(key) as T;
    }

    // Compute new value
    const result = await computeFn();
    
    // Cache the result
    this.permissionCache.set(key, result as any);
    this.cacheTimestamps.set(key, Date.now());
    
    return result;
  }

  /**
   * Clear all cached permissions for a user
   */
  clearUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.permissionCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.permissionCache.delete(key);
      this.cacheTimestamps.delete(key);
    });
    
    console.log(`🧹 Cleared ${keysToDelete.length} cached permissions for user ${userId}`);
  }

  /**
   * Clear all cached permissions
   */
  clearAllCache(): void {
    const cacheSize = this.permissionCache.size;
    this.permissionCache.clear();
    this.cacheTimestamps.clear();
    console.log(`🧹 Cleared all ${cacheSize} cached permissions`);
  }

  /**
   * Refresh permissions from server
   */
  async refreshPermissions(user: User): Promise<void> {
    // Prevent multiple concurrent refresh operations
    if (this.refreshInProgress) {
      if (this.refreshPromise) {
        await this.refreshPromise;
      }
      return;
    }

    this.refreshInProgress = true;
    
    this.refreshPromise = (async () => {
      try {
        console.log(`🔄 Refreshing permissions for user ${user.id}...`);
        
        // Clear existing cache for this user
        this.clearUserCache(user.id.toString());
        
        // Fetch fresh permissions from server
        const response = await apiClient.get(`/auth/permissions/${user.id}/`);
        
        if (response.permissions) {
          // Pre-warm cache with server permissions
          const userId = user.id.toString();
          response.permissions.forEach((permission: Permission) => {
            const key = this.getCacheKey(userId, 'hasPermission', permission);
            this.permissionCache.set(key, true);
            this.cacheTimestamps.set(key, Date.now());
          });
          
          console.log(`✅ Refreshed ${response.permissions.length} permissions for user ${user.id}`);
        }
        
        // Pre-warm route access cache
        await this.preWarmRouteCache(user);
        
      } catch (error) {
        console.error('❌ Failed to refresh permissions:', error);
        // Don't throw - fall back to local permissions
      }
    })();

    await this.refreshPromise;
    this.refreshInProgress = false;
    this.refreshPromise = null;
  }

  /**
   * Pre-warm route access cache for better performance
   */
  private async preWarmRouteCache(user: User): Promise<void> {
    const userId = user.id.toString();
    const routes = Object.keys(ROUTE_PERMISSIONS);
    
    for (const route of routes) {
      const key = this.getCacheKey(userId, 'canAccessRoute', route);
      const canAccess = coreCanAccessRoute(user.role, route);
      this.permissionCache.set(key, canAccess);
      this.cacheTimestamps.set(key, Date.now());
    }
    
    console.log(`🔥 Pre-warmed ${routes.length} route permissions for user ${user.id}`);
  }

  /**
   * Enhanced permission checking with caching
   */
  async hasPermission(user: User, permission: Permission): Promise<boolean> {
    const userId = user.id.toString();
    const key = this.getCacheKey(userId, 'hasPermission', permission);
    
    return this.getOrCompute(key, () => {
      return coreHasPermission(user.role, permission);
    });
  }

  /**
   * Enhanced route access checking with caching
   */
  async canAccessRoute(user: User, route: string): Promise<boolean> {
    const userId = user.id.toString();
    const key = this.getCacheKey(userId, 'canAccessRoute', route);
    
    return this.getOrCompute(key, () => {
      return coreCanAccessRoute(user.role, route);
    });
  }

  /**
   * Enhanced resource access checking with caching
   */
  async canAccessResource(
    user: User, 
    permission: Permission, 
    userScope: PermissionScope, 
    resourceScope: PermissionScope
  ): Promise<boolean> {
    const userId = user.id.toString();
    const key = this.getCacheKey(userId, 'canAccessResource', permission, userScope, resourceScope);
    
    return this.getOrCompute(key, () => {
      return coreCanAccessResource(user.role, permission, userScope, resourceScope);
    });
  }

  /**
   * Batch permission checking for better performance
   */
  async checkMultiplePermissions(user: User, permissions: Permission[]): Promise<Record<Permission, boolean>> {
    const results: Record<Permission, boolean> = {} as any;
    
    // Use Promise.all for concurrent checking
    const checks = permissions.map(async (permission) => {
      const hasAccess = await this.hasPermission(user, permission);
      return { permission, hasAccess };
    });
    
    const resolvedChecks = await Promise.all(checks);
    
    resolvedChecks.forEach(({ permission, hasAccess }) => {
      results[permission] = hasAccess;
    });
    
    return results;
  }

  /**
   * Get all available permissions for a user's role
   */
  getAvailablePermissions(userRole: UserRole): Permission[] {
    return ROLE_PERMISSIONS[userRole] || [];
  }

  /**
   * Get permission statistics for debugging
   */
  getPermissionStats(): {
    cacheSize: number;
    cacheHitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    const timestamps = Array.from(this.cacheTimestamps.values());
    const now = Date.now();
    
    return {
      cacheSize: this.permissionCache.size,
      cacheHitRate: this.permissionCache.size > 0 ? 
        timestamps.filter(t => now - t < this.CACHE_DURATION).length / this.permissionCache.size : 0,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
    };
  }

  /**
   * Validate user permissions against server (for critical operations)
   */
  async validatePermissionWithServer(user: User, permission: Permission): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/validate-permission/', {
        user_id: user.id,
        permission,
      });
      
      return response.valid === true;
    } catch (error) {
      console.error('❌ Server permission validation failed:', error);
      // Fall back to local check
      return coreHasPermission(user.role, permission);
    }
  }

  /**
   * Auto-refresh permissions based on user activity
   */
  setupAutoRefresh(user: User, intervalMs: number = 30 * 60 * 1000): () => void {
    const interval = setInterval(() => {
      this.refreshPermissions(user).catch(error => {
        console.warn('⚠️ Auto-refresh permissions failed:', error);
      });
    }, intervalMs);

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }
}

// Create singleton instance
export const permissionService = PermissionService.getInstance();