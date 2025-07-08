'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserRole, Permission } from '@/lib/types/roles';
import { apiClient } from '@/lib/api';
import { ROLE_PERMISSIONS } from '@/lib/auth/permissions';

interface UserData {
  id: string;
  email: string;
  role: {
    name: UserRole;
    permissions?: { codename: Permission }[];
  };
  organization: string;
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthInitialized: boolean;
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  /** Check if the currently logged-in user has a specific permission */
  hasPermission: (permission: Permission) => boolean;
  /** Check if user possesses ANY permission in the provided list */
  hasAnyPermission: (permissions: Permission[]) => boolean;
  /** Check if user possesses ALL permissions in the provided list */
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  const setupAuth = useCallback((token: string, userData: UserData) => {
    const userRole = (userData.role?.name || 'unknown').toLowerCase().replace(/\s+/g, '-') as UserRole;
    const permissions = userData.role?.permissions?.map(p => p.codename) || [];
    const userScope = { userId: userData.id, organizationId: userData.organization };

    apiClient.setAuth(token, userRole, permissions, userData.organization, userScope);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const userData = JSON.parse(userString);
        setupAuth(token, userData);
      } catch (error) {
        console.error("Failed to initialize auth from localStorage", error);
        logout(); // Clear corrupted data
      }
    }
    setIsAuthInitialized(true);
  }, [setupAuth]);

  const login = (token: string, userData: UserData) => {
    setupAuth(token, userData);
  };

  const logout = () => {
    apiClient.clearAuth();
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  // =================== PERMISSION HELPERS ===================
  const userRole = user?.role?.name as UserRole | undefined;

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!userRole) return false;
      return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
    },
    [userRole]
  );

  const hasAnyPermission = useCallback(
    (permissions: Permission[]): boolean => permissions.some(hasPermission),
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: Permission[]): boolean => permissions.every(hasPermission),
    [hasPermission]
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthInitialized,
        isAuthenticated: !!user,
        user,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 