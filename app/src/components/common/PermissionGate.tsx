"use client";

import React, { useMemo } from 'react';
import { UserRole, Permission } from '@/lib/types/roles';
import { hasPermission, hasAnyPermission, canAccessRoute } from '@/lib/auth/permissions';
import { useAuth } from '@/stores';
import { permissionService } from '@/lib/services/PermissionService';
import { Lock } from 'lucide-react';

interface PermissionGateProps {
  children: React.ReactNode;
  requiredPermissions?: Permission[];
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  requiredRoute?: string;
  requireAll?: boolean; // If true, user must have ALL permissions, otherwise ANY
  fallback?: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

/**
 * PermissionGate component - Controls access to UI elements based on user permissions
 * 
 * @example
 * ```tsx
 * <PermissionGate requiredPermissions={['manage:users']}>
 *   <AddUserButton />
 * </PermissionGate>
 * 
 * <PermissionGate allowedRoles={['org-admin', 'super-admin']}>
 *   <AdminPanel />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  children,
  requiredPermissions = [],
  requiredRole,
  allowedRoles = [],
  requiredRoute,
  requireAll = false,
  fallback = null,
  showError = false,
  errorMessage = "You don't have permission to access this feature.",
}: PermissionGateProps) {
  const { user, isHydrated } = useAuth();
  
  // Auto-refresh permissions when component mounts with user
  React.useEffect(() => {
    if (user && isHydrated && requiredPermissions.length > 0) {
      // Silently refresh permissions in background for better UX
      permissionService.refreshPermissions(user).catch(() => {
        // Fail silently - user won't notice, but permissions will be fresher next time
      });
    }
  }, [user?.id, isHydrated, requiredPermissions.length]);

  // If no user is loaded or still hydrating, don't render anything
  if (!user || !isHydrated) {
    return showError ? (
      <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
        <Lock className="h-4 w-4" />
        <span>Please log in to access this feature.</span>
      </div>
    ) : fallback;
  }

  const userRole = user.role;

  // Check role-based access
  if (requiredRole && userRole !== requiredRole) {
    return showError ? (
      <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
        <Lock className="h-4 w-4" />
        <span>{errorMessage}</span>
      </div>
    ) : fallback;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return showError ? (
      <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
        <Lock className="h-4 w-4" />
        <span>{errorMessage}</span>
      </div>
    ) : fallback;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasPermission(userRole, permission))
      : hasAnyPermission(userRole, requiredPermissions);

    if (!hasAccess) {
      return showError ? (
        <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
          <Lock className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      ) : fallback;
    }
  }

  // Check route-based access
  if (requiredRoute && !canAccessRoute(userRole, requiredRoute)) {
    return showError ? (
      <div className="flex items-center gap-2 p-4 mb-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg">
        <Lock className="h-4 w-4" />
        <span>{errorMessage}</span>
      </div>
    ) : fallback;
  }

  // If all checks pass, render the children
  return <>{children}</>;
}

/**
 * Enhanced hook version of PermissionGate with centralized service integration
 */
export function usePermissionGate() {
  const { user, isHydrated } = useAuth();

  // Memoize permission functions to prevent recreations
  const checkPermission = React.useCallback((permission: Permission): boolean => {
    if (!user || !isHydrated) return false;
    return hasPermission(user.role, permission);
  }, [user?.role, isHydrated]);

  const checkAnyPermission = React.useCallback((permissions: Permission[]): boolean => {
    if (!user || !isHydrated) return false;
    return hasAnyPermission(user.role, permissions);
  }, [user?.role, isHydrated]);

  const checkAllPermissions = React.useCallback((permissions: Permission[]): boolean => {
    if (!user || !isHydrated) return false;
    return permissions.every(permission => hasPermission(user.role, permission));
  }, [user?.role, isHydrated]);

  const checkRole = React.useCallback((role: UserRole): boolean => {
    if (!user || !isHydrated) return false;
    return user.role === role;
  }, [user?.role, isHydrated]);

  const checkAnyRole = React.useCallback((roles: UserRole[]): boolean => {
    if (!user || !isHydrated) return false;
    return roles.includes(user.role);
  }, [user?.role, isHydrated]);

  const checkRoute = React.useCallback((route: string): boolean => {
    if (!user || !isHydrated) return false;
    return canAccessRoute(user.role, route);
  }, [user?.role, isHydrated]);

  // Add refresh capability
  const refreshPermissions = React.useCallback(async (): Promise<void> => {
    if (!user) return;
    try {
      await permissionService.refreshPermissions(user);
    } catch (error) {
      console.warn('Failed to refresh permissions:', error);
    }
  }, [user]);

  // Add cache management
  const clearPermissionCache = React.useCallback((): void => {
    if (user) {
      permissionService.clearUserCache(user.id.toString());
    }
  }, [user]);

  // Memoize available permissions for current user
  const availablePermissions = useMemo(() => {
    if (!user) return [];
    return permissionService.getAvailablePermissions(user.role);
  }, [user?.role]);

  return {
    user,
    isHydrated,
    availablePermissions,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkRole,
    checkAnyRole,
    checkRoute,
    refreshPermissions,
    clearPermissionCache,
    hasAccess: React.useCallback((options: Omit<PermissionGateProps, 'children' | 'fallback' | 'showError' | 'errorMessage'>) => {
      const {
        requiredPermissions = [],
        requiredRole,
        allowedRoles = [],
        requiredRoute,
        requireAll = false,
      } = options;

      if (!user || !isHydrated) return false;

      // Check role-based access
      if (requiredRole && user.role !== requiredRole) return false;
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) return false;

      // Check permission-based access
      if (requiredPermissions.length > 0) {
        const hasAccess = requireAll
          ? requiredPermissions.every(permission => hasPermission(user.role, permission))
          : hasAnyPermission(user.role, requiredPermissions);
        if (!hasAccess) return false;
      }

      // Check route-based access
      if (requiredRoute && !canAccessRoute(user.role, requiredRoute)) return false;

      return true;
    }, [user, isHydrated]),
  };
}

/**
 * Higher-order component version of PermissionGate
 */
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  permissionConfig: Omit<PermissionGateProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <PermissionGate {...permissionConfig}>
        <Component {...props} />
      </PermissionGate>
    );
  };
}

/**
 * Conditional rendering components for different roles
 * Enhanced with memoization for better performance
 */
export const SuperAdminOnly = React.memo(function SuperAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['super-admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
});

export const OrgAdminOnly = React.memo(function OrgAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['org-admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
});

export const SupervisorOnly = React.memo(function SupervisorOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['supervisor']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
});

export const SalespersonOnly = React.memo(function SalespersonOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['salesperson']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
});

export const VerifierOnly = React.memo(function VerifierOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['verifier']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
});

export const AdminOrSuperAdmin = React.memo(function AdminOrSuperAdmin({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['super-admin', 'org-admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
});

export const ManagementRoles = React.memo(function ManagementRoles({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['super-admin', 'org-admin', 'supervisor']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}); 