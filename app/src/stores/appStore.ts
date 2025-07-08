import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '@/lib/types/roles';

interface TableState {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, any>;
  selectedRows: string[];
}

interface AppPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  itemsPerPage: number;
  autoRefresh: boolean;
  autoRefreshInterval: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
}

export interface AppState {
  // App preferences
  preferences: AppPreferences;
  
  // Table states by component
  tableStates: Record<string, TableState>;
  
  // Recently viewed items
  recentItems: Array<{
    id: string;
    type: 'user' | 'client' | 'deal' | 'team';
    name: string;
    url: string;
    timestamp: number;
  }>;
  
  // Quick actions
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    url: string;
    permissions: string[];
  }>;
  
  // Actions
  updatePreferences: (updates: Partial<AppPreferences>) => void;
  resetPreferences: () => void;
  
  updateTableState: (tableId: string, updates: Partial<TableState>) => void;
  resetTableState: (tableId: string) => void;
  getTableState: (tableId: string) => TableState;
  
  addRecentItem: (item: Omit<AppState['recentItems'][0], 'timestamp'>) => void;
  clearRecentItems: () => void;
  
  setQuickActions: (actions: AppState['quickActions']) => void;
  addQuickAction: (action: AppState['quickActions'][0]) => void;
  removeQuickAction: (id: string) => void;
}

const defaultPreferences: AppPreferences = {
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  currency: 'USD',
  itemsPerPage: 10,
  autoRefresh: false,
  autoRefreshInterval: 30000,
  emailNotifications: true,
  pushNotifications: true,
  soundEnabled: true,
};

const defaultTableState: TableState = {
  page: 1,
  pageSize: 10,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  filters: {},
  selectedRows: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: defaultPreferences,
      tableStates: {},
      recentItems: [],
      quickActions: [],

      // Preferences actions
      updatePreferences: (updates: Partial<AppPreferences>) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },

      // Table state actions
      updateTableState: (tableId: string, updates: Partial<TableState>) => {
        set((state) => ({
          tableStates: {
            ...state.tableStates,
            [tableId]: {
              ...get().getTableState(tableId),
              ...updates,
            },
          },
        }));
      },

      resetTableState: (tableId: string) => {
        set((state) => ({
          tableStates: {
            ...state.tableStates,
            [tableId]: defaultTableState,
          },
        }));
      },

      getTableState: (tableId: string) => {
        const state = get().tableStates[tableId];
        return state || defaultTableState;
      },

      // Recent items actions
      addRecentItem: (item: Omit<AppState['recentItems'][0], 'timestamp'>) => {
        const timestamp = Date.now();
        set((state) => {
          const filtered = state.recentItems.filter(
            (existing) => existing.id !== item.id || existing.type !== item.type
          );
          
          return {
            recentItems: [
              { ...item, timestamp },
              ...filtered,
            ].slice(0, 10), // Keep only last 10 items
          };
        });
      },

      clearRecentItems: () => {
        set({ recentItems: [] });
      },

      // Quick actions
      setQuickActions: (actions: AppState['quickActions']) => {
        set({ quickActions: actions });
      },

      addQuickAction: (action: AppState['quickActions'][0]) => {
        set((state) => ({
          quickActions: [...state.quickActions, action],
        }));
      },

      removeQuickAction: (id: string) => {
        set((state) => ({
          quickActions: state.quickActions.filter((action) => action.id !== id),
        }));
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        tableStates: state.tableStates,
        recentItems: state.recentItems,
        quickActions: state.quickActions,
      }),
    }
  )
);

// Selectors for better performance
export const useAppPreferences = () => useAppStore((state) => state.preferences);
export const useTableState = (tableId: string) => useAppStore((state) => state.getTableState(tableId));
export const useRecentItems = () => useAppStore((state) => state.recentItems); 