import { 
  hasPermission, 
  canManageRole, 
  canAccessRoute, 
  canAccessResource,
  isValidUserRole,
  toUserRole,
  ROLE_HIERARCHY 
} from '../permissions';
import { UserRole, Permission } from '@/lib/types/roles';

describe('Permission System', () => {
  describe('Role Validation', () => {
    test('isValidUserRole should validate correct roles', () => {
      expect(isValidUserRole('super_admin')).toBe(true);
      expect(isValidUserRole('org_admin')).toBe(true);
      expect(isValidUserRole('supervisor')).toBe(true);
      expect(isValidUserRole('salesperson')).toBe(true);
      expect(isValidUserRole('verifier')).toBe(true);
      expect(isValidUserRole('team_member')).toBe(true);
      expect(isValidUserRole('invalid_role')).toBe(false);
    });

    test('toUserRole should normalize role strings', () => {
      expect(toUserRole('super_admin')).toBe('super_admin');
      expect(toUserRole('super-admin')).toBe('super_admin');
      expect(toUserRole('SUPER ADMIN')).toBe('super_admin');
      expect(toUserRole('invalid')).toBe(null);
      expect(toUserRole(null)).toBe(null);
      expect(toUserRole(undefined)).toBe(null);
    });
  });

  describe('Permission Checking', () => {
    test('hasPermission should handle valid roles', () => {
      expect(hasPermission('super_admin', 'create:organization')).toBe(true);
      expect(hasPermission('org_admin', 'manage:users')).toBe(true);
      expect(hasPermission('salesperson', 'manage:deals')).toBe(true);
      expect(hasPermission('team_member', 'view_user')).toBe(true);
    });

    test('hasPermission should handle invalid inputs', () => {
      expect(hasPermission('' as UserRole, 'create:organization')).toBe(false);
      expect(hasPermission('super_admin', '' as Permission)).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    test('canManageRole should respect hierarchy', () => {
      expect(canManageRole('super_admin', 'org_admin')).toBe(true);
      expect(canManageRole('org_admin', 'salesperson')).toBe(true);
      expect(canManageRole('supervisor', 'team_member')).toBe(true);
      expect(canManageRole('salesperson', 'supervisor')).toBe(false);
      expect(canManageRole('team_member', 'org_admin')).toBe(false);
    });

    test('canManageRole should handle invalid inputs', () => {
      expect(canManageRole('' as UserRole, 'org_admin')).toBe(false);
      expect(canManageRole('super_admin', '' as UserRole)).toBe(false);
    });
  });

  describe('Route Access', () => {
    test('canAccessRoute should handle valid routes', () => {
      expect(canAccessRoute('super_admin', '/super-admin')).toBe(true);
      expect(canAccessRoute('org_admin', '/org-admin')).toBe(true);
    });

    test('canAccessRoute should handle invalid inputs', () => {
      expect(canAccessRoute('' as UserRole, '/super-admin')).toBe(false);
      expect(canAccessRoute('super_admin', '')).toBe(false);
    });
  });

  describe('Resource Access', () => {
    test('canAccessResource should handle valid scenarios', () => {
      const userScope = { organizationId: 'org1', teamId: 'team1', userId: 'user1' };
      const resourceScope = { organizationId: 'org1', teamId: 'team1', resourceOwnerId: 'user1' };

      expect(canAccessResource('super_admin', 'manage:deals', userScope, resourceScope)).toBe(true);
      expect(canAccessResource('org_admin', 'manage:deals', userScope, resourceScope)).toBe(true);
    });

    test('canAccessResource should handle invalid inputs', () => {
      const userScope = { organizationId: 'org1' };
      const resourceScope = { organizationId: 'org1' };

      expect(canAccessResource('' as UserRole, 'manage:deals', userScope, resourceScope)).toBe(false);
      expect(canAccessResource('super_admin', '' as Permission, userScope, resourceScope)).toBe(false);
    });
  });
});