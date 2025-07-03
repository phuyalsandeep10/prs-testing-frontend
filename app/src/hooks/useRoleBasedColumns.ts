import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'salesperson' | 'org-admin' | 'verifier' | 'super-admin' | 'supervisor' | 'team-member';

interface ColumnConfig {
  shouldShowSalesperson: boolean;
  shouldShowActions: boolean;
  allowedActions: string[];
}

export const useRoleBasedColumns = (): ColumnConfig => {
  const { user } = useAuth();
  
  return useMemo(() => {
    if (!user?.role) {
      return {
        shouldShowSalesperson: false,
        shouldShowActions: false,
        allowedActions: [],
      };
    }

    const role = user.role.name.toLowerCase().replace(/\s+/g, '-') as UserRole;

    switch (role) {
      case 'salesperson':
        return {
          shouldShowSalesperson: false, // Don't show salesperson column for own deals
          shouldShowActions: true,
          allowedActions: ['edit', 'addPayment', 'expand'],
        };
      
      case 'org-admin':
        return {
          shouldShowSalesperson: true, // Show salesperson to identify deal owner
          shouldShowActions: true,
          allowedActions: ['edit', 'addPayment', 'expand'],
        };
      
      case 'verifier':
        return {
          shouldShowSalesperson: true, // Show salesperson to identify deal owner
          shouldShowActions: true,
          allowedActions: ['verify', 'expand'], // Different actions for verifiers
        };
      
      case 'super-admin':
        return {
          shouldShowSalesperson: true,
          shouldShowActions: true,
          allowedActions: ['edit', 'addPayment', 'verify', 'delete', 'expand'],
        };
      
      case 'supervisor':
        return {
          shouldShowSalesperson: true, // Show salesperson for team management
          shouldShowActions: true,
          allowedActions: ['edit', 'addPayment', 'expand'],
        };
      
      case 'team-member':
        return {
          shouldShowSalesperson: true,
          shouldShowActions: false,
          allowedActions: ['expand'], // Read-only access
        };
      
      default:
        return {
          shouldShowSalesperson: false,
          shouldShowActions: false,
          allowedActions: [],
        };
    }
  }, [user?.role]);
};

export default useRoleBasedColumns; 