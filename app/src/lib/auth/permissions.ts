import { UserRole } from '@/types';
import { Permission } from '@/lib/types/roles';

/**
 * Validate if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  const validRoles: UserRole[] = ['super_admin', 'org_admin', 'supervisor', 'salesperson', 'verifier', 'team_member'];
  return validRoles.includes(role as UserRole);
}

/**
 * Safely cast a string to UserRole with validation
 */
export function toUserRole(role: string | undefined | null): UserRole | null {
  if (!role || typeof role !== 'string') {
    return null;
  }

  const normalizedRole = role.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return isValidUserRole(normalizedRole) ? normalizedRole as UserRole : null;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  'super_admin': [
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
  'org_admin': [
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
  'team_member': [
    'view_user',
    'view:analytics', // Own analytics only
    'manage:clients', // Assigned clients only
  ],
};

// Route-based permissions
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/super_admin': ['create:organization'],
  '/super_admin/organizations': ['create:organization'],
  '/super_admin/manage-admins': ['create:organization'],

  '/org_admin': ['manage:users'],
  '/org_admin/manage-users': ['manage:users'],
  '/org_admin/manage-teams': ['create:teams'],
  '/org_admin/deals': ['view:analytics'],
  '/org_admin/manage-clients': ['manage:clients'],
  '/org_admin/commission': ['view:analytics'],

  '/supervisor': ['view:analytics'],
  '/supervisor/team-performance': ['view:analytics'],

  '/salesperson': ['manage:deals'],
  '/salesperson/deals': ['manage:deals'],
  '/salesperson/clients': ['manage:clients'],
  '/salesperson/commission': ['view:analytics'],

  '/verifier': ['verify:invoices'],
  '/verifier/verify-invoice': ['verify:invoices'],
  '/verifier/deals': ['approve:deals', 'deny:deals'],

  '/team_member': ['view:analytics'],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole | undefined | null, permission: Permission): boolean {
  // Handle undefined or invalid roles
  if (!userRole || !permission || !isValidPermission(permission)) {
    return false;
  }

  // Normalize the role to handle different formats (org-admin -> org_admin)
  const normalizedRole = typeof userRole === 'string' 
    ? userRole.toLowerCase().replace(/[\s\-_]+/g, '_') as UserRole
    : userRole;

  const rolePermissions = ROLE_PERMISSIONS[normalizedRole];
  // Gracefully handle cases where the role might not be in the map
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userRole: UserRole | undefined | null, permissions: Permission[]): boolean {
  if (!userRole || !Array.isArray(permissions)) return false;
  const validPermissions = toPermissionArray(permissions);
  return validPermissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(userRole: UserRole | undefined | null, permissions: Permission[]): boolean {
  if (!userRole || !Array.isArray(permissions)) return false;
  const validPermissions = toPermissionArray(permissions);
  return validPermissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Check if user can access specific route
 */
export function canAccessRoute(userRole: UserRole | undefined | null, route: string): boolean {
  // Handle undefined or invalid inputs
  if (!userRole || !route) {
    return false;
  }

  const requiredPermissions = ROUTE_PERMISSIONS[route];
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // No specific permissions required
  }
  return hasAnyPermission(userRole, requiredPermissions);
}

/**
 * Get filtered routes based on user permissions
 */
export function getAccessibleRoutes(userRole: UserRole | undefined | null): string[] {
  if (!userRole) return [];
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
  userRole: UserRole | undefined | null,
  permission: Permission,
  userScope: PermissionScope,
  resourceScope: PermissionScope
): boolean {
  // Handle undefined or invalid inputs
  if (!userRole || !permission || !userScope || !resourceScope) {
    return false;
  }

  // First check if user has the permission
  if (!hasPermission(userRole, permission)) {
    return false;
  }

  // Super admin can access everything
  if (userRole === 'super_admin') {
    return true;
  }

  // Org admin can access everything in their organization
  if (userRole === 'org_admin') {
    return userScope.organizationId === resourceScope.organizationId;
  }

  // Supervisor can access team resources
  if (userRole === 'supervisor') {
    return userScope.organizationId === resourceScope.organizationId &&
      userScope.teamId === resourceScope.teamId;
  }

  // Salesperson and team_member can only access own resources
  if (userRole === 'salesperson' || userRole === 'team_member') {
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
  return function (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      // Get user role from context or passed parameters
      const userRole = args[0]?.userRole || args[0]?.user?.role as UserRole;

      if (!userRole || !hasPermission(userRole, permission)) {
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
  'super_admin': ['org_admin', 'supervisor', 'salesperson', 'verifier', 'team_member'],
  'org_admin': ['supervisor', 'salesperson', 'verifier', 'team_member'],
  'supervisor': ['salesperson', 'team_member'],
  'salesperson': [],
  'verifier': [],
  'team_member': [],
};

/**
 * Check if role can manage another role
 */
export function canManageRole(managerRole: UserRole | undefined | null, targetRole: UserRole | undefined | null): boolean {
  // Ensure both roles are valid UserRole values
  if (!managerRole || !targetRole) {
    return false;
  }

  // Super admin can manage all roles
  if (managerRole === 'super_admin') {
    return true;
  }

  return ROLE_HIERARCHY[managerRole]?.includes(targetRole) ?? false;
}

/**
 * Get manageable roles for a user
 */
export function getManageableRoles(userRole: UserRole | undefined | null): UserRole[] {
  if (!userRole) return [];
  return ROLE_HIERARCHY[userRole] || [];
}

/**
 * Data filtering based on permissions and scope
 */
export function filterDataByPermissions<T extends { organizationId: string; ownerId?: string; teamId?: string }>(
  data: T[],
  userRole: UserRole | undefined | null,
  userScope: PermissionScope,
  permission: Permission
): T[] {
  if (!userRole || !Array.isArray(data)) return [];
  
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
 * Type guard to check if a permission is a valid Permission string
 */
export function isValidPermission(permission: any): permission is Permission {
  const validPermissions: Permission[] = [
    'create:organization', 'manage:users', 'create:teams', 'manage:deals', 
    'verify:invoices', 'view:analytics', 'manage:clients', 'send:notifications',
    'approve:deals', 'deny:deals', 'view_team', 'view_all_teams', 'add_team',
    'change_team', 'delete_team', 'view_user', 'add_user', 'change_user',
    'delete_user', 'view_own_clients', 'view_all_clients', 'create_client',
    'edit_client_details', 'delete_client', 'view_own_deals', 'view_all_deals',
    'create_deal', 'log_deal_activity', 'verify_deal_payment', 'update_deal_status'
  ];
  return typeof permission === 'string' && validPermissions.includes(permission as Permission);
}

/**
 * Type guard to check if an array contains valid Permission strings
 */
export function isValidPermissionArray(permissions: any[]): permissions is Permission[] {
  return Array.isArray(permissions) && permissions.every(isValidPermission);
}

/**
 * Safely convert permission array to Permission[] type
 */
export function toPermissionArray(permissions: any[]): Permission[] {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter(isValidPermission);
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
export function createPermissionChecker(userRole: UserRole | undefined | null, userScope: PermissionScope): PermissionContextValue {
  // Validate inputs
  if (!userRole || !userScope) {
    // Return a safe default that denies all permissions
    return {
      userRole: userRole || 'team_member',
      userScope: userScope || {},
      hasPermission: () => false,
      canAccessRoute: () => false,
      canAccessResource: () => false,
      canManageRole: () => false,
    };
  }

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