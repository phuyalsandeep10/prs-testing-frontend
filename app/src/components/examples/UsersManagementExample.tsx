'use client';

import React from 'react';
import { useUsersQuery, useCreateUserMutation, useTableStateSync } from '@/hooks/useIntegratedQuery';
import { useAuth, useUI, usePermissions } from '@/stores';
import { PermissionGate } from '@/components/common/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Search, Filter } from 'lucide-react';

export default function UsersManagementExample() {
  const { user } = useAuth();
  const { addNotification, openModal } = useUI();
  const { hasPermission } = usePermissions();
  
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
  } = useUsersQuery();
  
  // Mutation for creating users
  const createUserMutation = useCreateUserMutation();
  
  const handleCreateUser = () => {
    openModal({
      component: CreateUserModal,
      props: {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'User created successfully',
            message: 'The new user has been added to the system.',
          });
        }
      },
      options: {
        size: 'lg',
      }
    });
  };
  
  const handleSearch = (value: string) => {
    setSearch(value);
  };
  
  const handleRoleFilter = (role: string) => {
    setFilters({ ...tableState.filters, role });
  };
  
  const handleStatusFilter = (status: string) => {
    setFilters({ ...tableState.filters, status });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-600 mb-4">Failed to load users</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-gray-600">
            Manage users in your organization ({usersData?.pagination?.total || 0} total)
          </p>
        </div>
        
        <PermissionGate requiredPermissions={['manage:users']}>
          <Button onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </PermissionGate>
      </div>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={tableState.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Role Filter */}
            <div className="min-w-32">
              <select
                value={tableState.filters.role || ''}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Roles</option>
                <option value="org-admin">Org Admin</option>
                <option value="supervisor">Supervisor</option>
                <option value="salesperson">Salesperson</option>
                <option value="verifier">Verifier</option>
                <option value="team-member">Team Member</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="min-w-32">
              <select
                value={tableState.filters.status || ''}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            {/* Reset Filters */}
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <PermissionGate requiredPermissions={['manage:users']}>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </PermissionGate>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersData?.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary">
                        {user.role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          user.status === 'active' ? 'default' :
                          user.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <PermissionGate requiredPermissions={['manage:users']}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </td>
                    </PermissionGate>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((tableState.page - 1) * tableState.pageSize) + 1} to{' '}
          {Math.min(tableState.page * tableState.pageSize, usersData?.pagination?.total || 0)} of{' '}
          {usersData?.pagination?.total || 0} results
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(tableState.page - 1)}
            disabled={tableState.page <= 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: usersData?.pagination?.totalPages || 1 }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === tableState.page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(tableState.page + 1)}
            disabled={tableState.page >= (usersData?.pagination?.totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Example modal component that would be opened
function CreateUserModal({ onSuccess, onClose }: { onSuccess?: () => void; onClose?: () => void }) {
  const createUserMutation = useCreateUserMutation();
  const { closeModal } = useUI();
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Example user data - in real app this would come from form
    const userData = {
      name: 'New User',
      email: 'newuser@example.com',
      role: 'salesperson' as const,
      permissions: [],
      status: 'active' as const,
    };
    
    createUserMutation.mutate(userData, {
      onSuccess: () => {
        onSuccess?.();
        closeModal('create-user-modal');
      }
    });
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Create New User</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields would go here */}
        <p className="text-gray-600">Form fields would be implemented here...</p>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => closeModal('create-user-modal')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createUserMutation.isPending}>
            {createUserMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 