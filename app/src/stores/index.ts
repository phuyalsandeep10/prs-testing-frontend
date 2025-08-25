// Export all stores
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useAppStore, useAppPreferences, useTableState, useRecentItems } from './appStore';

// Export hydration hooks
export { useStoreHydration, useAuthWithHydration, useUIWithHydration } from '../hooks/useStoreHydration';

// Re-export types
export type { AuthState } from './authStore';
import { Permission } from '@/lib/types/roles';
export type { UIState } from './uiStore';
export type { AppState } from './appStore';

// Combined selectors and utilities
import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';
import { useAppStore } from './appStore';

// Authentication selectors with backward compatibility
export const useAuth = () => {
  const store = useAuthStore();
  
  // Transform the Zustand user format to match updated AuthContext format
  const transformedUser = store.user ? {
    ...store.user,
    permissions: store.user.permissions || [],
    organization: store.organization?.toString() || '',
    organizationId: store.organization?.toString() || store.user.organizationId || '' // Ensure organizationId is set
  } : null;

  return {
    // Backward compatible interface
    isAuthenticated: store.isAuthenticated,
    isAuthInitialized: store.isAuthInitialized,
    user: transformedUser,
    login: (token: string, userData: any) => {
      // Handle both old and new formats
      if (userData.role?.name) {
        // Old format from AuthContext
        const normalizedUser = {
          ...userData,
          role: userData.role.name,
          permissions: userData.role.permissions?.map((p: any) => p.codename) || []
        };
        store.login(token, normalizedUser as any);
      } else {
        // New format (already normalized)
        store.login(token, userData);
      }
    },
    logout: store.logout,
    hasPermission: store.hasPermission,
    hasAnyPermission: (permissions: Permission[]) => 
      permissions.some(p => store.hasPermission(p)),
    hasAllPermissions: (permissions: Permission[]) =>
      permissions.every(p => store.hasPermission(p)),
    
    // Additional Zustand-specific properties for new code
    isHydrated: store.isHydrated,
    token: store.token,
    organization: store.organization,
    updateUser: store.updateUser,
    getUserRole: store.getUserRole,
    getUserPermissions: store.getUserPermissions,
    isRole: store.isRole,
  };
};

// UI selectors (now with hydration safety)
export const useUI = () => {
  const {
    isHydrated,
    sidebarCollapsed,
    sidebarMobileOpen,
    theme,
    globalLoading,
    pageLoading,
    notifications,
    modals,
    globalSearch,
    setHydrated,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileSidebar,
    setMobileSidebarOpen,
    setTheme,
    setGlobalLoading,
    setPageLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    closeAllModals,
    setGlobalSearch,
    clearGlobalSearch,
  } = useUIStore();

  return {
    isHydrated,
    sidebarCollapsed,
    sidebarMobileOpen,
    theme,
    globalLoading,
    pageLoading,
    notifications,
    modals,
    globalSearch,
    setHydrated,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileSidebar,
    setMobileSidebarOpen,
    setTheme,
    setGlobalLoading,
    setPageLoading,
    addNotification,
    removeNotification,
    clearNotifications,
    openModal,
    closeModal,
    closeAllModals,
    setGlobalSearch,
    clearGlobalSearch,
  };
};

// App selectors
export const useApp = () => {
  const {
    preferences,
    updatePreferences,
    resetPreferences,
    updateTableState,
    resetTableState,
    getTableState,
    addRecentItem,
    clearRecentItems,
    setQuickActions,
    addQuickAction,
    removeQuickAction,
  } = useAppStore();

  return {
    preferences,
    updatePreferences,
    resetPreferences,
    updateTableState,
    resetTableState,
    getTableState,
    addRecentItem,
    clearRecentItems,
    setQuickActions,
    addQuickAction,
    removeQuickAction,
  };
};

// Combined hooks for common use cases
export const useCurrentUser = () => {
  const { user, isAuthenticated } = useAuth();
  return { user, isAuthenticated };
};

export const usePermissions = () => {
  const { getUserPermissions, hasPermission, isRole } = useAuth();
  return { getUserPermissions, hasPermission, isRole };
};

export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUI();
  return { notifications, addNotification, removeNotification, clearNotifications };
};

export const useModals = () => {
  const { modals, openModal, closeModal, closeAllModals } = useUI();
  return { modals, openModal, closeModal, closeAllModals };
};

export const useSidebar = () => {
  const { 
    sidebarCollapsed, 
    sidebarMobileOpen, 
    toggleSidebar, 
    setSidebarCollapsed, 
    toggleMobileSidebar, 
    setMobileSidebarOpen 
  } = useUI();
  
  return { 
    sidebarCollapsed, 
    sidebarMobileOpen, 
    toggleSidebar, 
    setSidebarCollapsed, 
    toggleMobileSidebar, 
    setMobileSidebarOpen 
  };
}; 