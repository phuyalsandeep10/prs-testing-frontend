import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/stores';
import { UserRole } from '@/types';

interface UseRoleBasedColumnsProps<T> {
  columns: ColumnDef<T>[];
  rolePermissions: Record<UserRole, string[]>;
}

export function useRoleBasedColumns<T>({
  columns,
  rolePermissions,
}: UseRoleBasedColumnsProps<T>): ColumnDef<T>[] {
  const { user, isRole } = useAuth();

  return useMemo(() => {
    if (!user || !user.role) return columns;

    const currentRole = user.role;
    const allowedColumns = rolePermissions[currentRole] || [];

    return columns.filter((column) => {
      if (!column.id) return true;
      return allowedColumns.includes(column.id);
    });
  }, [columns, rolePermissions, user]);
}

// Helper function to get role-based column visibility
export function useRoleBasedColumnVisibility<T>(
  columns: ColumnDef<T>[],
  rolePermissions: Record<UserRole, string[]>
): Record<string, boolean> {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user || !user.role) return {};

    const currentRole = user.role;
    const allowedColumns = rolePermissions[currentRole] || [];
    const visibility: Record<string, boolean> = {};

    columns.forEach((column) => {
      if (column.id) {
        visibility[column.id] = allowedColumns.includes(column.id);
      }
    });

    return visibility;
  }, [columns, rolePermissions, user]);
}

// ==================== ROLE CONFIG FOR DEALS TABLE ====================
interface RoleUIConfig {
  shouldShowSalesperson: boolean;
  allowedActions: string[];
}

/**
 * Lightweight helper to expose UI specific configuration based on the current
 * authenticated user's role. This is intentionally kept separate from the
 * column–filtering logic so components can opt-in to whichever behaviour they
 * need.
 */
export function useRoleConfig(): RoleUIConfig {
  const { user } = useAuth();

  // Default to salesperson settings when user is not yet loaded
  const role = (user?.role || 'salesperson') as UserRole;
  
  // Debug logging to help identify role issues
  if (process.env.NODE_ENV === 'development') {
    console.log('🎭 [useRoleConfig] User:', user, 'Role:', role);
  }

  const configMap: Record<UserRole, RoleUIConfig> = {
    'super_admin': {
      shouldShowSalesperson: true,
      allowedActions: ['edit', 'addPayment', 'delete', 'verify'],
    },
    'org_admin': {
      shouldShowSalesperson: true,
      allowedActions: ['edit', 'addPayment', 'delete', 'verify'],
    },
    supervisor: {
      shouldShowSalesperson: true,
      allowedActions: ['edit', 'addPayment'],
    },
    salesperson: {
      shouldShowSalesperson: false,
      allowedActions: ['edit', 'addPayment'],
    },
    verifier: {
      shouldShowSalesperson: true,
      allowedActions: ['verify'],
    },
    'team_member': {
      shouldShowSalesperson: false,
      allowedActions: ['view'],
    },
  };

  // Always return a valid config, fallback to salesperson if role not found
  return configMap[role] || configMap['salesperson'];
} 