// Export all stores
export { useAuthStore } from './authStore';
export { useUIStore } from './uiStore';
export { useAppStore, useAppPreferences, useTableState, useRecentItems } from './appStore';

// Export hydration hooks
export { useStoreHydration, useAuthWithHydration, useUIWithHydration } from '../hooks/useStoreHydration';

// Re-export types
export type { AuthState } from './authStore';
export type { UIState } from './uiStore';
export type { AppState } from './appStore';

// Combined selectors and utilities
import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';
import { useAppStore } from './appStore';

// Authentication selectors (now with hydration safety)
export const useAuth = () => {
  const {
    isAuthenticated,
    isAuthInitialized,
    isHydrated,
    user,
    token,
    login,
    logout,
    updateUser,
    getUserRole,
    getUserPermissions,
    hasPermission,
    isRole,
  } = useAuthStore();

  return {
    isAuthenticated,
    isAuthInitialized,
    isHydrated,
    user,
    token,
    login,
    logout,
    updateUser,
    getUserRole,
    getUserPermissions,
    hasPermission,
    isRole,
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