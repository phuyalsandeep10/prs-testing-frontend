"use client";

import React from 'react';
import { UserRole, Permission } from '@/lib/types/roles';
import { hasPermission, hasAnyPermission, canAccessRoute } from '@/lib/auth/permissions';
import { useAuth } from '@/stores';
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
  const { user } = useAuth();

  // If no user is loaded, don't render anything
  if (!user) {
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
 * Hook version of PermissionGate for conditional logic in components
 */
export function usePermissionGate() {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(permission => hasPermission(user.role, permission));
  };

  const checkRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const checkAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const checkRoute = (route: string): boolean => {
    if (!user) return false;
    return canAccessRoute(user.role, route);
  };

  return {
    user,
    checkPermission,
    checkAnyPermission,
    checkAllPermissions,
    checkRole,
    checkAnyRole,
    checkRoute,
    hasAccess: (options: Omit<PermissionGateProps, 'children' | 'fallback' | 'showError' | 'errorMessage'>) => {
      const {
        requiredPermissions = [],
        requiredRole,
        allowedRoles = [],
        requiredRoute,
        requireAll = false,
      } = options;

      if (!user) return false;

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
    },
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
 */
export function SuperAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['super-admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function OrgAdminOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['org-admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function SupervisorOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['supervisor']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function SalespersonOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['salesperson']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function VerifierOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['verifier']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function AdminOrSuperAdmin({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['super-admin', 'org-admin']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

export function ManagementRoles({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate allowedRoles={['super-admin', 'org-admin', 'supervisor']} fallback={fallback}>
      {children}
    </PermissionGate>
  );
} 