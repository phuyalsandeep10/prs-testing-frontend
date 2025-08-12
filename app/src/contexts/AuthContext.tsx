/**
 * @deprecated AuthContext has been migrated to Zustand AuthStore
 * Please use `useAuth` from '@/stores' instead
 * This file is kept for backward compatibility only
 */
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { UserRole, Permission } from '@/lib/types/roles';
import { useAuth } from '@/stores';

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

/**
 * @deprecated AuthProvider is now a wrapper around Zustand store
 * Consider removing this and using the store directly
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Use the new Zustand-based auth
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @deprecated Use `useAuth` from '@/stores' instead
 */
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};