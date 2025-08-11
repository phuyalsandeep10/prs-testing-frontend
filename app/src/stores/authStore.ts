import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole, Permission, User } from '@/lib/types/roles';
import { hasPermission as hasRolePermission } from '@/lib/auth/permissions';

export interface AuthState {
  // State
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  isHydrated: boolean; // Track hydration state to prevent SSR mismatches
  user: User | null;
  token: string | null;
  organization: number | null;
  
  // Actions
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setAuthInitialized: (initialized: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  
  // Getters
  getUserRole: () => UserRole | null;
  getUserPermissions: () => Permission[];
  hasPermission: (permission: Permission) => boolean;
  isRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state - WAIT for hydration
      isAuthenticated: false,
      isAuthInitialized: false, // Start as false until hydrated
      isHydrated: false, // Track hydration to prevent SSR mismatches
      user: null,
      token: null,
      organization: null,

      // Actions
      login: (token: string, userData: User) => {
        // Persist auth token for API client
        localStorage.setItem('authToken', token);
        // Remove any legacy user entry stored by the old AuthContext to avoid duplicates
        localStorage.removeItem('user');

        // Normalize the user role structure
        const rawRole = (userData as any)?.role?.name || (userData as any)?.role || 'team-member';
        const normalizedRole = typeof rawRole === 'string'
          ? rawRole.toLowerCase().replace(/\s+/g, '-')
          : 'team-member';

        const normalizedUser = {
          ...userData,
          role: normalizedRole as UserRole,
        };
        
        const organizationId = (userData as any).organization || null;

        set({
          isAuthenticated: true,
          isAuthInitialized: true, // Ensure initialized on successful login
          user: normalizedUser,
          token,
          organization: organizationId
        });
      },

      logout: () => {
        // Clear persisted auth token and any stale user entry
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        set({
          isAuthenticated: false,
          isAuthInitialized: true, // Keep initialized to allow reuse without reload
          user: null,
          token: null,
          organization: null,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      setAuthInitialized: (initialized: boolean) => {
        set({ isAuthInitialized: initialized });
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },

      // Getters
      getUserRole: () => {
        const user = get().user;
        return user?.role || null;
      },

      getUserPermissions: () => {
        const user = get().user;
        return user?.permissions || [];
      },

      hasPermission: (permission: Permission) => {
        const user = get().user;
        if (!user) return false;
        return hasRolePermission(user.role, permission);
      },

      isRole: (role: UserRole) => {
        const userRole = get().getUserRole();
        return userRole === role;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        organization: state.organization,
      }),
      // Enhanced hydration handler to prevent race conditions
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Auth store hydration failed:', error);
          // Set safe defaults on hydration error
          return {
            isAuthenticated: false,
            isAuthInitialized: true,
            isHydrated: true,
            user: null,
            token: null,
            organization: null,
          };
        }
        
        // Set hydrated and initialized state after successful hydration
        if (state) {
          state.setHydrated(true);
          state.setAuthInitialized(true);
          
          // Validate token exists in localStorage if authenticated
          if (state.isAuthenticated && state.token) {
            const storedToken = localStorage.getItem('authToken');
            if (!storedToken || storedToken !== state.token) {
              // Token mismatch, force logout
              console.warn('Token mismatch detected, forcing logout');
              state.logout();
            }
          }
        }
      },
    }
  )
); 