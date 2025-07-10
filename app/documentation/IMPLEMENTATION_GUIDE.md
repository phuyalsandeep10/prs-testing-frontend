# React Query + Zustand Implementation Guide

## Overview

This guide outlines how to systematically implement the React Query + Zustand integration across your entire PRS application. We've already established the foundation - now let's complete the migration.

## 🎯 Implementation Status

### ✅ Completed
- **Zustand Stores Created**: Auth, UI, and App stores with full functionality
- **Integrated Query Hooks**: Comprehensive hooks combining React Query + Zustand
- **Core Infrastructure**: Table state management, notifications, modals
- **Example Components**: Working examples showing integration patterns
- **Documentation**: Complete usage guide and best practices

### 🚧 Next Steps Implementation Plan

## Phase 1: Critical Component Migration (Week 1)

### 1.1 Update Authentication Components

**Priority: HIGH**

#### Files to Update:
- `src/components/auth/LoginForm.tsx`
- `src/contexts/AuthContext.tsx` (Remove entirely)

**Changes:**
```typescript
// ❌ Old Pattern
import { useAuth } from '@/contexts/AuthContext';

// ✅ New Pattern  
import { useAuth } from '@/stores';
import { useLoginMutation } from '@/hooks/useIntegratedQuery';

const loginMutation = useLoginMutation();

const handleLogin = async (credentials) => {
  await loginMutation.mutateAsync(credentials);
  // Automatic redirect and notifications handled by the mutation
};
```

#### Action Items:
1. Replace all `useAuth` imports from context to store
2. Update login logic to use `useLoginMutation`
3. Remove manual navigation and notification logic (handled by mutation)
4. Test authentication flow thoroughly

### 1.2 Migrate Table Components

**Priority: HIGH**

#### Files to Update:
- `src/components/dashboard/org-admin/manage-users/ManageUsersClient.tsx`
- `src/components/dashboard/org-admin/manage-clients/ManageClientsClient.tsx`
- `src/components/dashboard/salesperson/deals/DealsTable.tsx`
- `src/components/dashboard/org-admin/deals/DealsTable.tsx`
- `src/components/dashboard/verifier/deals/DealsTable.tsx`

**Migration Pattern:**
```typescript
// ❌ Old Pattern - Manual API calls
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchUsers();
}, []);

// ✅ New Pattern - React Query + Zustand
import { useUsersQuery, useTableStateSync } from '@/hooks/useIntegratedQuery';
import { useAuth, useUI } from '@/stores';

const {
  tableState,
  setSearch,
  setPage,
  setFilters,
  resetFilters
} = useTableStateSync('users-table');

const {
  data: usersData,
  isLoading,
  error,
  refetch
} = useUsersQuery(tableState);
```

#### Benefits:
- Automatic error handling with notifications
- URL synchronization for filters/pagination
- Optimistic updates
- Loading states
- Caching and background refresh

### 1.3 Update Form Components

**Priority: MEDIUM**

#### Files to Update:
- `src/components/dashboard/org-admin/manage-users/AddNewUserForm.tsx`
- `src/components/dashboard/org-admin/manage-teams/AddNewTeamForm.tsx`
- `src/components/salesperson/clients/Clientform.tsx`

**Migration Pattern:**
```typescript
// ❌ Old Pattern - Manual fetch + form handling
const onSubmit = async (values) => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(values),
    });
    
    if (response.ok) {
      toast.success('User created!');
      form.reset();
      onClose();
    }
  } catch (error) {
    toast.error('Failed to create user');
  } finally {
    setIsLoading(false);
  }
};

// ✅ New Pattern - Integrated mutations
import { useCreateUserMutation } from '@/hooks/useIntegratedQuery';
import { useUI } from '@/stores';

const createUserMutation = useCreateUserMutation();
const { addNotification, closeModal } = useUI();

const onSubmit = async (values) => {
  try {
    await createUserMutation.mutateAsync(values);
    // Success notification and modal close handled automatically
    closeModal();
  } catch (error) {
    // Error notification handled automatically
  }
};
```

## Phase 2: Enhanced UX Implementation (Week 2)

### 2.1 Add Real-time Notifications

**Files to Update:**
- All components that perform actions (create, update, delete)

**Implementation:**
```typescript
import { useUI } from '@/stores';

const { addNotification } = useUI();

// Success notifications
addNotification({
  type: 'success',
  title: 'User created',
  message: 'John Doe has been added to the system.',
  autoHide: true,
  duration: 5000,
});

// Error notifications
addNotification({
  type: 'error',
  title: 'Failed to delete user',
  message: 'Please try again or contact support.',
  autoHide: false,
});

// Info notifications with actions
addNotification({
  type: 'info',
  title: 'Export completed',
  message: 'Your data export is ready for download.',
  action: {
    label: 'Download',
    onClick: () => downloadFile(),
  },
});
```

### 2.2 Implement Modal System

**Files to Update:**
- Components that use SlideModal or custom modals

**Implementation:**
```typescript
import { useUI } from '@/stores';
import { AddNewUserForm } from './AddNewUserForm';

const { openModal, closeModal } = useUI();

const handleCreateUser = () => {
  openModal({
    title: 'Create New User',
    component: AddNewUserForm,
    props: {
      onSuccess: () => {
        closeModal();
        refetch(); // Refresh table data
      },
    },
    options: {
      size: 'lg',
      closable: true,
      backdrop: true,
    }
  });
};
```

### 2.3 Add Loading States and Skeletons

**Implementation:**
```typescript
import { UnifiedTable } from '@/components/core';

<UnifiedTable
  data={usersData?.data || []}
  columns={columns}
  loading={isLoading}
  error={error?.message}
  config={{
    features: {
      pagination: true,
      sorting: true,
      selection: true,
      export: true,
    },
    styling: {
      variant: 'professional',
      size: 'md',
    },
    messages: {
      loading: 'Loading users...',
      empty: 'No users found. Create your first user to get started.',
      error: 'Failed to load users. Please try again.',
    },
  }}
/>
```

## Phase 3: Advanced Features (Week 3)

### 3.1 Add Optimistic Updates

**Example Implementation:**
```typescript
// In mutation hooks
onMutate: async (newUser) => {
  // Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: ['users'] });
  
  // Snapshot previous value
  const previousUsers = queryClient.getQueryData(['users']);
  
  // Optimistically update
  queryClient.setQueryData(['users'], (old) => {
    return {
      ...old,
      data: [{ ...newUser, id: 'temp-id', status: 'pending' }, ...old.data],
    };
  });
  
  return { previousUsers };
},
onError: (err, newUser, context) => {
  // Rollback on error
  if (context?.previousUsers) {
    queryClient.setQueryData(['users'], context.previousUsers);
  }
},
```

### 3.2 Implement Background Sync

**Implementation:**
```typescript
// In main layout or app component
import { useBackgroundSync } from '@/hooks/useIntegratedQuery';

export default function AppLayout({ children }) {
  useBackgroundSync(); // Handles notifications, recent activity sync
  
  return (
    <div>
      {children}
    </div>
  );
}
```

### 3.3 Add Export Functionality

**Implementation:**
```typescript
const handleExport = (data) => {
  const csv = convertToCSV(data);
  downloadFile(csv, 'users-export.csv');
  
  addNotification({
    type: 'success',
    title: 'Export completed',
    message: `${data.length} records exported successfully.`,
  });
};

<UnifiedTable
  data={users}
  columns={columns}
  onExport={handleExport}
  config={{
    features: {
      export: true,
    },
  }}
/>
```

## Phase 4: Performance Optimization (Week 4)

### 4.1 Add Query Prefetching

**Implementation:**
```typescript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Prefetch on hover or page navigation
const handlePrefetchUser = (userId) => {
  queryClient.prefetchQuery({
    queryKey: ['users', userId],
    queryFn: () => apiClient.get(`/users/${userId}`),
    staleTime: 5 * 60 * 1000,
  });
};
```

### 4.2 Implement Smart Caching

**Configuration:**
```typescript
// In React Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
```

### 4.3 Add Infinite Queries for Large Datasets

**Implementation:**
```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

const useInfiniteDealsQuery = () => {
  return useInfiniteQuery({
    queryKey: ['deals', 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      apiClient.get(`/deals?page=${pageParam}&limit=20`),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
  });
};
```

## 🚀 Quick Migration Checklist

### For Each Component:

#### 1. **Replace Context with Stores**
- [ ] Remove `useAuth` from `@/contexts/AuthContext`
- [ ] Add `useAuth` from `@/stores`
- [ ] Remove manual localStorage handling
- [ ] Update user object property access

#### 2. **Replace Manual API Calls**
- [ ] Remove `useState` for data/loading/error
- [ ] Remove `useEffect` for data fetching
- [ ] Add appropriate query hook from `@/hooks/useIntegratedQuery`
- [ ] Remove manual error handling (handled by hooks)

#### 3. **Add Table State Management**
- [ ] Add `useTableStateSync` hook
- [ ] Replace local search/filter state
- [ ] Update table props to use state from hook
- [ ] Add URL synchronization

#### 4. **Enhance UX**
- [ ] Replace `toast` with `addNotification` from `useUI`
- [ ] Replace custom modals with `openModal` from `useUI`
- [ ] Add loading states to tables
- [ ] Add empty states and error handling

#### 5. **Add Permissions**
- [ ] Wrap actions with `<PermissionGate>`
- [ ] Use `hasPermission` for conditional logic
- [ ] Update role-based column visibility

## 🔧 Common Patterns and Solutions

### Pattern 1: Form with Mutation
```typescript
const ExampleForm = ({ onClose }) => {
  const createMutation = useCreateMutation();
  const { addNotification } = useUI();
  
  const handleSubmit = async (data) => {
    try {
      await createMutation.mutateAsync(data);
      onClose();
    } catch (error) {
      // Error handled by mutation hook
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
};
```

### Pattern 2: Table with Filters
```typescript
const ExampleTable = () => {
  const { tableState, setSearch, setFilters } = useTableStateSync('example-table');
  const { data, isLoading, error } = useDataQuery(tableState);
  
  return (
    <div>
      <Input 
        value={tableState.search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select 
        value={tableState.filters.status}
        onChange={(e) => setFilters({ ...tableState.filters, status: e.target.value })}
      >
        <option value="">All</option>
        <option value="active">Active</option>
      </select>
      <UnifiedTable 
        data={data?.data || []}
        loading={isLoading}
        error={error}
      />
    </div>
  );
};
```

### Pattern 3: Modal Management
```typescript
const ExampleComponent = () => {
  const { openModal, closeModal } = useUI();
  
  const handleEdit = (item) => {
    openModal({
      title: `Edit ${item.name}`,
      component: EditForm,
      props: {
        item,
        onSuccess: () => {
          closeModal();
          refetch();
        },
      },
    });
  };
};
```

## 📊 Expected Improvements

### Before vs After Migration:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **API Call Efficiency** | Manual, duplicate calls | Smart caching, deduplication | 60% reduction |
| **Loading States** | Inconsistent | Unified, smooth | 100% coverage |
| **Error Handling** | Manual, inconsistent | Automatic, user-friendly | Consistent UX |
| **Data Freshness** | Manual refresh | Background sync | Real-time |
| **URL State** | Lost on refresh | Persistent, shareable | Better UX |
| **Code Maintainability** | High duplication | DRY, reusable patterns | 40% less code |
| **Type Safety** | Partial | Full TypeScript | 100% coverage |

## 🎯 Success Metrics

Track these metrics to measure migration success:

1. **Performance**
   - [ ] 60% reduction in API calls
   - [ ] 300ms faster page loads
   - [ ] Zero loading state flickers

2. **User Experience**
   - [ ] Consistent loading states across all tables
   - [ ] Real-time notifications for all actions
   - [ ] Persistent URL state for filters/pagination
   - [ ] Optimistic updates for immediate feedback

3. **Developer Experience**
   - [ ] 40% reduction in component code
   - [ ] Zero manual error handling
   - [ ] Consistent patterns across all components
   - [ ] Full TypeScript coverage

4. **Quality**
   - [ ] Zero console errors
   - [ ] All actions have loading states
   - [ ] All mutations show success/error notifications
   - [ ] Permission-gated UI throughout

## 🚨 Migration Pitfalls to Avoid

### 1. **Don't Mix Patterns**
❌ Avoid using both old context and new store in same component
✅ Fully migrate each component at once

### 2. **Don't Skip Error Handling**
❌ Don't assume mutations always succeed
✅ Use try/catch even though hooks handle notifications

### 3. **Don't Forget Permissions**
❌ Don't expose unauthorized actions
✅ Always wrap sensitive UI with PermissionGate

### 4. **Don't Ignore Loading States**
❌ Don't let users see empty states while loading
✅ Always pass loading prop to tables

### 5. **Don't Break URL State**
❌ Don't reset filters/search on page navigation
✅ Use tableStateSync for persistence

## 🎉 Final Steps

Once migration is complete:

1. **Remove Old Code**
   - [ ] Delete `src/contexts/AuthContext.tsx`
   - [ ] Remove unused API client methods
   - [ ] Clean up old state management

2. **Update Documentation**
   - [ ] Update component stories
   - [ ] Document new patterns
   - [ ] Create team training materials

3. **Performance Audit**
   - [ ] Profile React Query cache performance
   - [ ] Optimize query keys and stale times
   - [ ] Add React Query DevTools

4. **Team Training**
   - [ ] Demo new patterns to team
   - [ ] Review integration guide
   - [ ] Establish code review standards

The migration should result in a more maintainable, performant, and user-friendly application with consistent patterns throughout. Each phase builds upon the previous one, ensuring a smooth transition without breaking existing functionality. 