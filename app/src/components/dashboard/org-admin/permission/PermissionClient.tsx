"use client";

import { useState, Fragment, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Edit2, Check, X, Loader2 } from 'lucide-react';
import { AddRoleDialog } from './AddRoleDialog';
import { usePermissionsQuery, useRolesQuery, useCreateRoleMutation, useUpdateRoleMutation, type Permission, type Role, type GroupedPermissions } from '@/hooks/usePermissionQuery';
import { toast } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const PermissionClient = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [rolePermissions, setRolePermissions] = useState<{ [roleId: number]: { [permissionId: number]: boolean } }>({});

  // API hooks
  const { data: permissionsData, isLoading: permissionsLoading, error: permissionsError } = usePermissionsQuery();
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useRolesQuery();
  const createRoleMutation = useCreateRoleMutation();
  const updateRoleMutation = useUpdateRoleMutation();

  // Initialize role permissions state when data is loaded
  useEffect(() => {
    if (rolesData && permissionsData) {
      const initialPermissions: { [roleId: number]: { [permissionId: number]: boolean } } = {};
      
      rolesData.forEach(role => {
        initialPermissions[role.id] = {};
        Object.values(permissionsData).flat().forEach(permission => {
          initialPermissions[role.id][permission.id] = role.permissions.includes(permission.id);
        });
      });
      
      setRolePermissions(initialPermissions);
    }
  }, [rolesData, permissionsData]);

  // Transform permissions data for UI
  const permissionGroups = useMemo(() => {
    if (!permissionsData) return [];
    
    return Object.entries(permissionsData).map(([category, permissions]) => ({
      group: category,
      permissions: permissions,
    }));
  }, [permissionsData]);

  const roles = useMemo(() => {
    if (!rolesData) return [];
    // Filter out Super Admin roles
    return rolesData.filter(role => 
      role.name !== 'Super Admin' && 
      role.name !== 'super admin' && 
      role.name !== 'SUPER_ADMIN'
    );
  }, [rolesData]);

  const handlePermissionChange = (permissionId: number, roleId: number, checked: boolean) => {
    console.log('Permission change:', { permissionId, roleId, checked });
    
    setRolePermissions(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        [permissionId]: checked,
      },
    }));

    // Update the role permissions in the backend
    const role = roles.find(r => r.id === roleId);
    if (role) {
      const currentPermissions = role.permissions || [];
      let updatedPermissions;
      
      if (checked) {
        // Add permission if not already present
        updatedPermissions = currentPermissions.includes(permissionId) 
          ? currentPermissions 
          : [...currentPermissions, permissionId];
      } else {
        // Remove permission
        updatedPermissions = currentPermissions.filter(id => id !== permissionId);
      }
      
      console.log('Updating permissions:', { 
        roleId, 
        currentPermissions, 
        updatedPermissions 
      });
      
      updateRoleMutation.mutate({
        id: roleId,
        permissions: updatedPermissions,
      }, {
        onSuccess: (data) => {
          console.log('Permission update successful:', data);
        },
        onError: (error) => {
          console.error('Permission update failed:', error);
          // Revert the local state on error
          setRolePermissions(prev => ({
            ...prev,
            [roleId]: {
              ...prev[roleId],
              [permissionId]: !checked,
            },
          }));
        }
      });
    }
  };

  const handleGroupPermissionChange = (groupPermissions: Permission[], roleId: number, checked: boolean) => {
    console.log('Group permission change:', { 
      groupPermissions: groupPermissions.map(p => p.name), 
      roleId, 
      checked 
    });
    
    setRolePermissions(prev => {
      const newState = { ...prev };
      groupPermissions.forEach(permission => {
        newState[roleId] = {
          ...newState[roleId],
          [permission.id]: checked,
        };
      });
      return newState;
    });

    // Update the role permissions in the backend
    const role = roles.find(r => r.id === roleId);
    if (role) {
      const groupPermissionIds = groupPermissions.map(p => p.id);
      const currentPermissions = role.permissions || [];
      let updatedPermissions = [...currentPermissions];
      
      if (checked) {
        // Add all group permissions
        groupPermissionIds.forEach(id => {
          if (!updatedPermissions.includes(id)) {
            updatedPermissions.push(id);
          }
        });
      } else {
        // Remove all group permissions
        updatedPermissions = updatedPermissions.filter(id => !groupPermissionIds.includes(id));
      }
      
      console.log('Updating group permissions:', { 
        roleId, 
        currentPermissions, 
        updatedPermissions,
        groupPermissionIds
      });
      
      updateRoleMutation.mutate({
        id: roleId,
        permissions: updatedPermissions,
      }, {
        onSuccess: (data) => {
          console.log('Group permission update successful:', data);
        },
        onError: (error) => {
          console.error('Group permission update failed:', error);
          // Revert the local state on error
          setRolePermissions(prev => {
            const newState = { ...prev };
            groupPermissions.forEach(permission => {
              newState[roleId] = {
                ...newState[roleId],
                [permission.id]: !checked,
              };
            });
            return newState;
          });
        }
      });
    }
  };

  const isGroupFullyChecked = (groupPermissions: Permission[], roleId: number): boolean => {
    return groupPermissions.every(permission => rolePermissions[roleId]?.[permission.id] || false);
  };

  const isGroupPartiallyChecked = (groupPermissions: Permission[], roleId: number): boolean => {
    const checkedCount = groupPermissions.filter(permission => rolePermissions[roleId]?.[permission.id] || false).length;
    return checkedCount > 0 && checkedCount < groupPermissions.length;
  };

  const handleAddRole = (newRole: string) => {
    createRoleMutation.mutate({ name: newRole });
  };

  const startEditingRole = (role: Role) => {
    // Don't allow editing if there's already a mutation in progress
    if (updateRoleMutation.isPending) return;
    
    setEditingRole(role.id.toString());
    setEditingValue(role.name);
  };

  const saveRoleName = () => {
    if (editingValue.trim() && editingRole) {
      const trimmedName = editingValue.trim();
      
      // Check if name actually changed
      const currentRole = roles.find(r => r.id === parseInt(editingRole));
      if (currentRole && currentRole.name === trimmedName) {
        // No change, just cancel editing
        setEditingRole(null);
        setEditingValue('');
        return;
      }

      updateRoleMutation.mutate({
        id: parseInt(editingRole),
        name: trimmedName,
      }, {
        onSuccess: () => {
          setEditingRole(null);
          setEditingValue('');
        },
        onError: (error: any) => {
          // Keep editing mode active on error so user can retry
          // Toast error is already handled by the mutation hook
        }
      });
    } else {
      // Invalid input, cancel editing
      setEditingRole(null);
      setEditingValue('');
    }
  };

  const cancelEditingRole = () => {
    setEditingRole(null);
    setEditingValue('');
  };

  const filteredGroups = useMemo(() => {
    if (!permissionGroups) return [];
    
    return permissionGroups.filter(group => {
      if (!searchTerm.trim()) return true;
      
      const searchLower = searchTerm.toLowerCase();
      return (
        group.group.toLowerCase().includes(searchLower) ||
        group.permissions.some(permission => 
          permission.name.toLowerCase().includes(searchLower)
        )
      );
    }).map(group => ({
      ...group,
      permissions: group.permissions.filter(permission => {
        if (!searchTerm.trim()) return true;
        return permission.name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    })).filter(group => group.permissions.length > 0);
  }, [permissionGroups, searchTerm]);

  if (permissionsLoading || rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4F46E5] mx-auto mb-4" />
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }

  if (permissionsError || rolesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load permissions</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="text-red-600">You do not have permission to view or manage permissions.</div>}>
      <div className="w-full h-full flex flex-col bg-gray-50 font-outfit">
        {/* Header Section */}
        <div className="bg-white px-8 py-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-[28px] font-semibold text-black font-outfit">
                Permission
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Easily manage user access and control permissions in one centralized dashboard.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search" 
                  className="pl-10 w-[320px] h-[40px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className=" hover:bg-[#4F46E5]/90 text-white px-6 py-2 h-[40px] flex items-center gap-2"
                disabled={createRoleMutation.isPending}
              >
                {createRoleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add Roles'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content - Full width with better scrolling */}
        <div className="flex-1 overflow-hidden w-full">
          <div className="h-full px-8 py-6 overflow-auto w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
              <div className="overflow-x-auto w-full">
                <Table className="w-full min-w-max">
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow className="bg-gray-50 border-b border-gray-200">
                      <TableHead className="text-gray-900 font-semibold text-[14px] py-4 px-6 min-w-[300px] max-w-[400px]">
                        Permission
                      </TableHead>
                      {roles.map(role => (
                        <TableHead key={role.id} className="text-center text-gray-900 font-semibold text-[14px] py-4 px-4 min-w-[150px] w-[150px]">
                          {editingRole === role.id.toString() ? (
                            <div className="flex items-center justify-center gap-2">
                              <Input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className={`h-8 text-center text-sm min-w-[100px] ${
                                  editingValue.trim().length === 0 ? 'border-red-300 focus:border-red-500' : ''
                                }`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveRoleName();
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelEditingRole();
                                  }
                                }}
                                placeholder="Role name"
                                maxLength={50}
                                autoFocus
                                onFocus={(e) => e.target.select()}
                              />
                              <button
                                onClick={saveRoleName}
                                className={`p-1 flex-shrink-0 transition-colors ${
                                  editingValue.trim().length > 0 && !updateRoleMutation.isPending
                                    ? 'text-green-600 hover:text-green-700 cursor-pointer'
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={updateRoleMutation.isPending || editingValue.trim().length === 0}
                                title={editingValue.trim().length === 0 ? 'Role name cannot be empty' : 'Save changes'}
                              >
                                {updateRoleMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={cancelEditingRole}
                                className="p-1 text-red-600 hover:text-red-700 flex-shrink-0 transition-colors"
                                disabled={updateRoleMutation.isPending}
                                title="Cancel editing"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 group">
                              <span className="truncate">{role.name}</span>
                              <button
                                onClick={() => startEditingRole(role)}
                                className={`p-1 flex-shrink-0 transition-all ${
                                  updateRoleMutation.isPending
                                    ? 'opacity-30 cursor-not-allowed'
                                    : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-[#4F46E5]'
                                }`}
                                disabled={updateRoleMutation.isPending}
                                title={updateRoleMutation.isPending ? 'Cannot edit while updating' : 'Edit role name'}
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map(group => (
                      <Fragment key={group.group}>
                        {/* Group Header Row with Checkboxes */}
                        <TableRow className="bg-[#E0E7FF] border-b border-gray-200">
                          <TableCell className="font-semibold text-[#4F46E5] text-[14px] py-3 px-6">
                            {group.group}
                          </TableCell>
                          {roles.map(role => (
                            <TableCell key={`${group.group}-${role.id}`} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={isGroupFullyChecked(group.permissions, role.id)}
                                  onCheckedChange={(checked) => handleGroupPermissionChange(group.permissions, role.id, !!checked)}
                                  className={`h-4 w-4 border-gray-300 data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5] ${
                                    isGroupPartiallyChecked(group.permissions, role.id) ? 'data-[state=unchecked]:bg-gray-300' : ''
                                  }`}
                                  disabled={updateRoleMutation.isPending}
                                />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* Permission Rows */}
                        {group.permissions.map((permission, index) => (
                          <TableRow 
                            key={permission.id} 
                            className={`border-b border-gray-100 hover:bg-gray-50 ${
                              index === group.permissions.length - 1 ? 'border-b-gray-200' : ''
                            }`}
                          >
                            <TableCell className="text-gray-700 text-[14px] py-4 px-6 font-medium pl-12">
                              {permission.name}
                            </TableCell>
                            {roles.map(role => (
                              <TableCell key={`${permission.id}-${role.id}`} className="text-center py-4 px-4">
                                <div className="flex justify-center">
                                  <Checkbox
                                    checked={rolePermissions[role.id]?.[permission.id] || false}
                                    onCheckedChange={(checked) => handlePermissionChange(permission.id, role.id, !!checked)}
                                    className="h-4 w-4 border-gray-300 data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5]"
                                    disabled={updateRoleMutation.isPending}
                                  />
                                </div>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* No Results Message */}
              {filteredGroups.length === 0 && searchTerm.trim() && (
                <div className="text-center py-8 text-gray-500">
                  <p>No permissions found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AddRoleDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onAddRole={handleAddRole}
        />
      </div>
    </ErrorBoundary>
  );
};
