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
      // Initial state
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      theme: 'system',
      globalLoading: false,
      pageLoading: false,
      notifications: [],
      modals: [],
      globalSearch: '',

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
        const id = Date.now().toString();
        const newNotification: Notification = {
          id,
          duration: 5000,
          ...notification,
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }));

        // Auto-remove notification after duration
        if (newNotification.duration) {
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
        const id = Date.now().toString();
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
    }
  )
); 