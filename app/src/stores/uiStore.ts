import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: any;
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
  };
}

export interface UIState {
  // Hydration state
  isHydrated: boolean;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Modals
  modals: Modal[];
  
  // Search
  globalSearch: string;
  
  // Actions
  setHydrated: (hydrated: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  openModal: (modal: Omit<Modal, 'id'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  setGlobalSearch: (search: string) => void;
  clearGlobalSearch: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state - prevent hydration mismatches
      isHydrated: false,
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      theme: 'system',
      globalLoading: false,
      pageLoading: false,
      notifications: [],
      modals: [],
      globalSearch: '',

      // Hydration action
      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      toggleMobileSidebar: () => {
        set((state) => ({
          sidebarMobileOpen: !state.sidebarMobileOpen,
        }));
      },

      setMobileSidebarOpen: (open: boolean) => {
        set({ sidebarMobileOpen: open });
      },

      // Theme actions
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      setPageLoading: (loading: boolean) => {
        set({ pageLoading: loading });
      },

      // Notification actions
      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`; // More unique ID
        const newNotification: Notification = {
          id,
          duration: 5000,
          ...notification,
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration (only if hydrated to avoid SSR issues)
        if (newNotification.duration && get().isHydrated) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // Modal actions
      openModal: (modal: Omit<Modal, 'id'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`; // More unique ID
        const newModal: Modal = { id, ...modal };
        
        set((state) => ({
          modals: [...state.modals, newModal],
        }));
      },

      closeModal: (id: string) => {
        set((state) => ({
          modals: state.modals.filter((m) => m.id !== id),
        }));
      },

      closeAllModals: () => {
        set({ modals: [] });
      },

      // Search actions
      setGlobalSearch: (search: string) => {
        set({ globalSearch: search });
      },

      clearGlobalSearch: () => {
        set({ globalSearch: '' });
      },
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
      // Add hydration handler to prevent race conditions
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('UI store hydration failed:', error);
          // Return safe defaults on hydration error
          return {
            isHydrated: true,
            sidebarCollapsed: false,
            theme: 'system' as const,
          };
        }
        
        // Set hydrated state after successful hydration
        if (state) {
          state.setHydrated(true);
        }
      },
      // Add skip hydration check to prevent SSR mismatches
      skipHydration: false,
    }
  )
); 