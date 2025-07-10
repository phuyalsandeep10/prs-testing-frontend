# Next Steps: React Query + Zustand Migration Guide

## 🎯 Current Status
✅ **Foundation Complete**: Stores, hooks, and infrastructure are ready
🚧 **Next Phase**: Component migration and UX enhancements

## 🚀 Priority Migration Order

### Phase 1: Critical Components (Week 1)

#### 1. Authentication Components
**Files to Update:**
- `src/components/auth/LoginForm.tsx`
- `src/contexts/AuthContext.tsx` (Remove)

**Pattern:**
```typescript
// ❌ Old: Manual API + Context
import { useAuth } from '@/contexts/AuthContext';

// ✅ New: Integrated hooks
import { useAuth } from '@/stores';
import { useLoginMutation } from '@/hooks/useIntegratedQuery';

const loginMutation = useLoginMutation();
const handleLogin = async (credentials) => {
  await loginMutation.mutateAsync(credentials);
  // Auto-redirect and notifications handled
};
```

#### 2. Table Components
**Files to Update:**
- `src/components/dashboard/org-admin/manage-users/ManageUsersClient.tsx`
- `src/components/dashboard/org-admin/manage-clients/ManageClientsClient.tsx`
- `src/components/dashboard/salesperson/deals/DealsTable.tsx`

**Pattern:**
```typescript
// ❌ Old: Manual state management
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

// ✅ New: React Query + URL sync
const { tableState, setSearch, setFilters } = useTableStateSync('table-id');
const { data, isLoading, error } = useDataQuery(tableState);
```

#### 3. Form Components
**Files to Update:**
- `src/components/dashboard/org-admin/manage-users/AddNewUserForm.tsx`
- `src/components/salesperson/clients/Clientform.tsx`

**Pattern:**
```typescript
// ❌ Old: Manual submissions
const onSubmit = async (values) => {
  setLoading(true);
  try {
    await fetch('/api/users', { method: 'POST', body: JSON.stringify(values) });
    toast.success('Created!');
  } catch (error) {
    toast.error('Failed!');
  }
};

// ✅ New: Integrated mutations
const createMutation = useCreateUserMutation();
const onSubmit = async (values) => {
  await createMutation.mutateAsync(values);
  // Success/error handling automatic
};
```

### Phase 2: Enhanced UX (Week 2)

#### 1. Replace All Toast with Notifications
```typescript
// ❌ Old
import { toast } from 'sonner';
toast.success('User created');

// ✅ New
import { useUI } from '@/stores';
const { addNotification } = useUI();
addNotification({
  type: 'success',
  title: 'User created',
  message: 'John Doe has been added to the system.',
});
```

#### 2. Replace Custom Modals
```typescript
// ❌ Old
const [isModalOpen, setIsModalOpen] = useState(false);

// ✅ New
const { openModal, closeModal } = useUI();
const handleEdit = (item) => {
  openModal({
    title: 'Edit User',
    component: EditForm,
    props: { item, onSuccess: () => closeModal() },
  });
};
```

#### 3. Add Permission Gates
```typescript
// ❌ Old: Manual permission checks
{user?.role === 'admin' && <Button>Delete</Button>}

// ✅ New: Declarative gates
<PermissionGate requiredPermissions={['manage:users']}>
  <Button>Delete</Button>
</PermissionGate>
```

## 🔧 Migration Checklist

### For Each Component:

#### Step 1: Replace Context/State
- [ ] Remove `useAuth` from `@/contexts/AuthContext`
- [ ] Add `useAuth` from `@/stores`
- [ ] Remove `useState` for data/loading/error
- [ ] Add appropriate query hook

#### Step 2: Update API Calls
- [ ] Remove `useEffect` for data fetching
- [ ] Remove manual error handling
- [ ] Add `useTableStateSync` for tables
- [ ] Remove manual localStorage usage

#### Step 3: Enhance UX
- [ ] Replace `toast` with `addNotification`
- [ ] Replace custom modals with `openModal`
- [ ] Add loading states to buttons/tables
- [ ] Add `<PermissionGate>` wrappers

#### Step 4: Test & Verify
- [ ] URL state persists on refresh
- [ ] Loading states work correctly
- [ ] Notifications appear for all actions
- [ ] Permissions hide/show correct elements

## 📋 Common Patterns

### Pattern 1: Data Table
```typescript
const ExampleTable = () => {
  const { tableState, setSearch, setFilters } = useTableStateSync('example');
  const { data, isLoading, error } = useDataQuery(tableState);
  
  return (
    <div>
      <Input 
        value={tableState.search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <UnifiedTable 
        data={data?.data || []}
        loading={isLoading}
        error={error}
      />
    </div>
  );
};
```

### Pattern 2: Form with Mutation
```typescript
const ExampleForm = ({ onClose }) => {
  const createMutation = useCreateMutation();
  
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
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
};
```

### Pattern 3: Action with Confirmation
```typescript
const ExampleComponent = () => {
  const deleteMutation = useDeleteMutation();
  const { addNotification } = useUI();
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addNotification({
          type: 'success',
          title: 'Deleted successfully',
        });
      } catch (error) {
        // Error handled by mutation
      }
    }
  };
};
```

## 🎯 Expected Results

### Before Migration:
- Manual API calls with duplicated logic
- Inconsistent loading states
- Manual error handling
- Lost URL state on refresh
- Toast notifications everywhere

### After Migration:
- 🚀 **60% fewer API calls** (smart caching)
- 📊 **Consistent loading states** across all tables
- 🔔 **Rich notifications** with actions
- 🔗 **URL state persistence** 
- 🛡️ **Permission-gated UI**
- ⚡ **Optimistic updates**

## 🚨 Common Pitfalls

1. **Don't mix patterns** - Fully migrate each component
2. **Don't skip error handling** - Always use try/catch
3. **Don't forget permissions** - Wrap sensitive UI
4. **Don't ignore loading states** - Always pass loading prop
5. **Don't break URL state** - Use tableStateSync

## 🏁 Final Cleanup

Once migration is complete:
1. Delete `src/contexts/AuthContext.tsx`
2. Remove unused API methods
3. Clean up old state management
4. Add React Query DevTools
5. Update team documentation

The migration will result in a more maintainable, performant, and user-friendly application with consistent patterns throughout. 