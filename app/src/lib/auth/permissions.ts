import { UserRole, Permission } from '@/lib/types/roles';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'super-admin': [
    'create:organization',
    'manage:users',
    'create:teams',
    'manage:deals',
    'verify:invoices',
    'view:analytics',
    'manage:clients',
    'send:notifications',
    'approve:deals',
    'deny:deals',
  ],
  'org-admin': [
    'view_user',
    'view_all_teams',
    'manage:users',
    'create:teams',
    'view:analytics',
    'manage:clients',
    'send:notifications',
    'manage:deals', // Can view all deals in organization
  ],
  'supervisor': [
    'view_user',
    'view_all_teams',
    'view:analytics', // Team analytics only
    'manage:deals', // Team deals only
    'manage:clients', // Team clients only
    'send:notifications', // Team notifications only
  ],
  'salesperson': [
    'view_user',
    'manage:deals', // Own deals only
    'manage:clients', // Own clients only
    'view:analytics', // Own analytics only
  ],
  'verifier': [
    'verify:invoices',
    'approve:deals',
    'deny:deals',
    'view:analytics', // Verification analytics only
    'send:notifications', // Deal-related notifications only
  ],
  'team-member': [
    'view_user',
    'view:analytics', // Own analytics only
    'manage:clients', // Assigned clients only
  ],
};

// Route-based permissions
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/super-admin': ['create:organization'],
  '/super-admin/organizations': ['create:organization'],
  '/super-admin/manage-admins': ['create:organization'],
  
  '/org-admin': ['manage:users'],
  '/org-admin/manage-users': ['manage:users'],
  '/org-admin/manage-teams': ['create:teams'],
  '/org-admin/deals': ['view:analytics'],
  '/org-admin/manage-clients': ['manage:clients'],
  '/org-admin/commission': ['view:analytics'],
  
  '/supervisor': ['view:analytics'],
  '/supervisor/team-performance': ['view:analytics'],
  
  '/salesperson': ['manage:deals'],
  '/salesperson/deals': ['manage:deals'],
  '/salesperson/clients': ['manage:clients'],
  '/salesperson/commission': ['view:analytics'],
  
  '/verifier': ['verify:invoices'],
  '/verifier/verify-invoice': ['verify:invoices'],
  '/verifier/deals': ['approve:deals', 'deny:deals'],
  
  '/team-member': ['view:analytics'],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  // Gracefully handle cases where the role might not be in the map
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Check if user can access specific route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required
  }
  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Get filtered routes based on user permissions
 */
export function getAccessibleRoutes(userRole: UserRole): string[] {
  return Object.keys(ROUTE_PERMISSIONS).filter(route => 
    canAccessRoute(userRole, route)
  );
}

/**
 * Scope-based permission checking for data access
 */
export interface PermissionScope {
  organizationId?: string;
  teamId?: string;
  userId?: string;
  resourceOwnerId?: string;
}

export function canAccessResource(
  userRole: UserRole,
  permission: Permission,
  userScope: PermissionScope,
  resourceScope: PermissionScope
): boolean {
  // First check if user has the permission
  if (!hasPermission(userRole, permission)) {
    return false;
  }

  // Super admin can access everything
  if (userRole === 'super-admin') {
    return true;
  }

  // Org admin can access everything in their organization
  if (userRole === 'org-admin') {
    return userScope.organizationId === resourceScope.organizationId;
  }

  // Supervisor can access team resources
  if (userRole === 'supervisor') {
    return userScope.organizationId === resourceScope.organizationId &&
           userScope.teamId === resourceScope.teamId;
  }

  // Salesperson and team-member can only access own resources
  if (userRole === 'salesperson' || userRole === 'team-member') {
    return userScope.userId === resourceScope.resourceOwnerId ||
           (userScope.teamId === resourceScope.teamId && ['manage:clients'].includes(permission));
  }

  // Verifier can access deals in their organization
  if (userRole === 'verifier') {
    return userScope.organizationId === resourceScope.organizationId;
  }

  return false;
}

/**
 * Permission middleware for API calls
 */
export function withPermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const userRole = this.getCurrentUserRole?.() as UserRole;
      
      if (!hasPermission(userRole, permission)) {
        throw new Error(`Insufficient permissions. Required: ${permission}`);
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Role hierarchy for inheritance
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  'super-admin': ['org-admin', 'supervisor', 'salesperson', 'verifier', 'team-member'],
  'org-admin': ['supervisor', 'salesperson', 'verifier', 'team-member'],
  'supervisor': ['salesperson', 'team-member'],
  'salesperson': [],
  'verifier': [],
  'team-member': [],
};

/**
 * Check if role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole]?.includes(targetRole) ?? false;
}

/**
 * Get manageable roles for a user
 */
export function getManageableRoles(userRole: UserRole): UserRole[] {
  return ROLE_HIERARCHY[userRole] || [];
}

/**
 * Data filtering based on permissions and scope
 */
export function filterDataByPermissions<T extends { organizationId: string; ownerId?: string; teamId?: string }>(
  data: T[],
  userRole: UserRole,
  userScope: PermissionScope,
  permission: Permission
): T[] {
  return data.filter(item => {
    const resourceScope: PermissionScope = {
      organizationId: item.organizationId,
      teamId: item.teamId,
      resourceOwnerId: item.ownerId,
    };
    
    return canAccessResource(userRole, permission, userScope, resourceScope);
  });
}

/**
 * Permission context for React components
 */
export interface PermissionContextValue {
  userRole: UserRole;
  userScope: PermissionScope;
  hasPermission: (permission: Permission) => boolean;
  canAccessRoute: (route: string) => boolean;
  canAccessResource: (permission: Permission, resourceScope: PermissionScope) => boolean;
  canManageRole: (targetRole: UserRole) => boolean;
}

/**
 * Hook for permission checking in components
 */
export function createPermissionChecker(userRole: UserRole, userScope: PermissionScope): PermissionContextValue {
  return {
    userRole,
    userScope,
    hasPermission: (permission: Permission) => hasPermission(userRole, permission),
    canAccessRoute: (route: string) => canAccessRoute(userRole, route),
    canAccessResource: (permission: Permission, resourceScope: PermissionScope) => 
      canAccessResource(userRole, permission, userScope, resourceScope),
    canManageRole: (targetRole: UserRole) => canManageRole(userRole, targetRole),
  };
} 