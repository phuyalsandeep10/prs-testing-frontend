// MigrationExample.tsx - Shows before/after patterns for migrating to React Query + Zustand

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UnifiedTable } from '@/components/core';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useUsersQuery, useCreateUserMutation, useTableStateSync } from '@/hooks/useIntegratedQuery';
import { useAuth, useUI } from '@/stores';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

// ❌ OLD PATTERN - Before Migration
const UserManagementOLD = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual API calls
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Manual form submission
  const handleCreateUser = async (userData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) throw new Error('Failed to create user');
      
      const newUser = await response.json();
      setUsers(prev => [newUser, ...prev]);
      setIsModalOpen(false);
      toast.success('User created successfully');
    } catch (err) {
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Manual filtering
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management (OLD)</h1>
        <Button onClick={() => setIsModalOpen(true)}>Add User</Button>
      </div>

      <Input
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <Button variant="outline" size="sm">Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom Modal Logic */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2>Add New User</h2>
            {/* Form implementation */}
            <div className="flex space-x-2 mt-4">
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => handleCreateUser({})}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ NEW PATTERN - After Migration
const UserManagementNEW = () => {
  const { user } = useAuth();
  const { addNotification, openModal, closeModal } = useUI();
  
  // Table state management with URL sync
  const {
    tableState,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    resetFilters
  } = useTableStateSync('users-table');
  
  // React Query for server state
  const {
    data: usersData,
    isLoading,
    error,
    refetch
  } = useUsersQuery(tableState);
  
  // Mutations
  const createUserMutation = useCreateUserMutation();
  
  // Column definition with permissions
  const columns: ColumnDef<any>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {row.original.role}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <PermissionGate requiredPermissions={['manage:users']}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditUser(row.original)}
          >
            Edit
          </Button>
        </PermissionGate>
      ),
    },
  ];

  // Event handlers
  const handleCreateUser = () => {
    openModal({
      title: 'Create New User',
      component: UserForm,
      props: {
        onSuccess: () => {
          closeModal();
          refetch();
          addNotification({
            type: 'success',
            title: 'User created',
            message: 'The new user has been added to the system.',
          });
        },
      },
    });
  };

  const handleEditUser = (userData) => {
    openModal({
      title: 'Edit User',
      component: UserForm,
      props: {
        initialData: userData,
        onSuccess: () => {
          closeModal();
          refetch();
          addNotification({
            type: 'success',
            title: 'User updated',
            message: 'The user has been updated successfully.',
          });
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management (NEW)</h1>
          <p className="text-gray-600">Enhanced with React Query + Zustand</p>
        </div>
        <PermissionGate requiredPermissions={['manage:users']}>
          <Button onClick={handleCreateUser}>Add User</Button>
        </PermissionGate>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search users..."
              value={tableState.search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={tableState.filters.role || ''}
              onChange={(e) => setFilters({ ...tableState.filters, role: e.target.value })}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table */}
      <Card>
        <CardContent className="p-0">
          <UnifiedTable
            data={usersData?.data || []}
            columns={columns}
            loading={isLoading}
            error={error?.message}
            onRefresh={refetch}
            config={{
              features: {
                pagination: true,
                sorting: true,
                selection: true,
                export: true,
                refresh: true,
              },
              styling: {
                variant: 'professional',
                size: 'md',
              },
              pagination: {
                pageSize: tableState.pageSize,
                page: tableState.page,
                total: usersData?.pagination.total,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
              },
              messages: {
                empty: 'No users found. Create your first user to get started.',
                loading: 'Loading users...',
                error: 'Failed to load users. Please try again.',
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Simple form component for the modal
const UserForm = ({ initialData, onSuccess }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [role, setRole] = useState(initialData?.role || 'user');
  
  const createMutation = useCreateUserMutation();
  const { addNotification } = useUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createMutation.mutateAsync({
        name,
        email,
        role,
      });
      
      onSuccess();
    } catch (error) {
      // Error notification handled by mutation hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

// Export both for comparison
export { UserManagementOLD, UserManagementNEW };

// Key Migration Benefits Summary:
/*
✅ NEW PATTERN BENEFITS:

1. **Automatic State Management**
   - No manual useState for data/loading/error
   - URL synchronization for filters/pagination
   - Automatic caching and background refresh

2. **Enhanced UX**
   - Rich notifications with actions
   - Unified modal system
   - Loading states with skeletons
   - Permission-gated UI elements

3. **Better Performance**
   - Smart caching reduces API calls
   - Optimistic updates for immediate feedback
   - Background synchronization

4. **Improved DX**
   - Consistent patterns across components
   - Less boilerplate code
   - Type-safe throughout
   - Centralized error handling

5. **Scalability**
   - Reusable hooks and components
   - Consistent state management
   - Easy to add new features
   - Better testing capabilities
*/ 