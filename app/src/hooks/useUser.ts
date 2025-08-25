"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { User, UserRole, ApiResponse } from '@/types';
import { Permission } from '@/lib/types/roles';
import { apiClient } from '@/lib/api-client';
import { USER_ROLES, ERROR_MESSAGES } from '@/lib/constants';

interface UseUserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface UseUserActions {
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  clearError: () => void;
}

type UseUserReturn = UseUserState & UseUserActions;

/**
 * Custom hook for managing user state and authentication
 * Provides user data, authentication status, and user-related actions
 */
export function useUser(): UseUserReturn {
  const { data: session, status, update } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const isAuthenticated = !!session?.user && !!user;

  /**
   * Initialize user data from session
   */
  useEffect(() => {
    const initializeUser = async () => {
      if (status === 'loading') return;
      
      setIsLoading(true);
      setError(null);

      try {
        if (session?.user) {
          // If we have a session, try to fetch full user data
          const userId = (session.user as any).id;
          if (userId) {
            try {
              const response = await apiClient.get<User>(`/auth/users/${userId}/`);
              setUser(response.data);
            } catch (apiError) {
              console.warn('Failed to fetch user data from API, using session data:', apiError);
              // Fallback to session data if API call fails
              setUser(session.user as User);
            }
          } else {
            // Fallback to session data if no ID
            setUser(session.user as User);
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error('Failed to initialize user:', err);
        setError(err.message || ERROR_MESSAGES.SERVER_ERROR);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [session, status]);

  /**
   * Update user data
   */
  const updateUser = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user to update');

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put<User>(`/auth/users/${user.id}/`, data);
      setUser(response.data);
      
      // Update session if needed
      await update({
        ...session,
        user: response.data,
      });
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, session, update]);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<User>(`/auth/users/${user.id}/`);
      setUser(response.data);
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.SERVER_ERROR;
      setError(errorMessage);
      console.error('Failed to refresh user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear local state
      setUser(null);
      setError(null);
      
      // Redirect to login (NextAuth handles session clearing)
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if user has specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !user.permissions) return false;
    
    // Super admin has all permissions
    if (user.role === USER_ROLES.SUPER_ADMIN) return true;
    
    // Check if user has the specific permission (permissions are strings, not objects)
    return user.permissions.includes(permission as Permission);
  }, [user]);

  /**
   * Check if user has specific role(s)
   */
  const hasRole = useCallback((roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  }, [user]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    user,
    isLoading: isLoading || status === 'loading',
    error,
    isAuthenticated,
    
    // Actions
    updateUser,
    refreshUser,
    logout,
    hasPermission,
    hasRole,
    clearError,
  };
}

/**
 * Hook for checking if user has specific permissions
 */
export function usePermissions(requiredPermissions: string[] = []) {
  const { hasPermission, user, isLoading } = useUser();
  
  const hasAllPermissions = requiredPermissions.every(permission => hasPermission(permission));
  const hasAnyPermission = requiredPermissions.some(permission => hasPermission(permission));
  
  return {
    hasAllPermissions,
    hasAnyPermission,
    hasPermission,
    isLoading,
    user,
  };
}

/**
 * Hook for role-based access control
 */
export function useRoleAccess(allowedRoles: UserRole[] = []) {
  const { hasRole, user, isLoading } = useUser();
  
  const hasAccess = allowedRoles.length === 0 || hasRole(allowedRoles);
  
  return {
    hasAccess,
    hasRole,
    userRole: user?.role,
    isLoading,
    user,
  };
}
