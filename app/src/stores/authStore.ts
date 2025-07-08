import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole, Permission, User } from '@/lib/types/roles';
import { hasPermission as hasRolePermission } from '@/lib/auth/permissions';

export interface AuthState {
  // State
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  user: User | null;
  token: string | null;
  
  // Actions
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setAuthInitialized: (initialized: boolean) => void;
  
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
      user: null,
      token: null,

      // Actions
      login: (token: string, userData: User) => {
        // Persist auth token for API client
        localStorage.setItem('authToken', token);
        // Remove any legacy user entry stored by the old AuthContext to avoid duplicates
        localStorage.removeItem('user');

        // Normalize the user role structure
        const normalizedUser = {
          ...userData,
          role: (userData.role as any)?.name || userData.role || 'team-member',
        };

        set({
          isAuthenticated: true,
          isAuthInitialized: true, // Ensure initialized on successful login
          user: normalizedUser,
          token,
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
      }),
      // Add hydration handler to properly set initialized state
      onRehydrateStorage: () => (state) => {
        // Set initialized to true after hydration completes
        if (state) {
          state.setAuthInitialized(true);
        }
      },
    }
  )
); 