"use client";

import { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle, Edit2, Check, X } from 'lucide-react';
import { AddRoleDialog } from './AddRoleDialog';

const initialRoles = ['Superadmin', 'Client', 'Salesperson', 'Verifier', 'Worker'];

const permissionGroups = [
  {
    group: 'Client Management',
    permissions: ['View All Client', 'Create Client', 'Edit Client Details', 'View Own Client Data'],
  },
  {
    group: 'Sales Management',
    permissions: ['View All Leads', 'Assign Leads', 'Update Deal Status', 'View Sales Pipeline'],
  },
  {
    group: 'Reporting and Analytics',
    permissions: ['View Sales Report', 'Export Data'],
  },
  {
    group: 'User and Role Management',
    permissions: ['View All Users', 'Manage Roles', 'Add or Remove Users', 'Add or Remove Roles'],
  },
  {
    group: 'System Settings',
    permissions: ['Manage Permission', 'Configure Integration'],
  },
];

export const PermissionClient = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [permissions, setPermissions] = useState(() => {
    const state: { [key: string]: { [key: string]: boolean } } = {};
    permissionGroups.forEach(group => {
      group.permissions.forEach(permission => {
        state[permission] = {};
        initialRoles.forEach(role => {
          state[permission][role] = false;
        });
      });
    });
    return state;
  });

  const handlePermissionChange = (permission: string, role: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: {
        ...prev[permission],
        [role]: checked,
      },
    }));
  };

  const handleGroupPermissionChange = (group: string, role: string, checked: boolean) => {
    const groupData = permissionGroups.find(g => g.group === group);
    if (groupData) {
      setPermissions(prev => {
        const newState = { ...prev };
        groupData.permissions.forEach(permission => {
          newState[permission] = {
            ...newState[permission],
            [role]: checked,
          };
        });
        return newState;
      });
    }
  };

  const isGroupFullyChecked = (group: string, role: string): boolean => {
    const groupData = permissionGroups.find(g => g.group === group);
    if (!groupData) return false;
    return groupData.permissions.every(permission => permissions[permission]?.[role] || false);
  };

  const isGroupPartiallyChecked = (group: string, role: string): boolean => {
    const groupData = permissionGroups.find(g => g.group === group);
    if (!groupData) return false;
    const checkedCount = groupData.permissions.filter(permission => permissions[permission]?.[role] || false).length;
    return checkedCount > 0 && checkedCount < groupData.permissions.length;
  };

  const handleAddRole = (newRole: string) => {
    if (newRole && !roles.includes(newRole)) {
      setRoles(prev => [...prev, newRole]);
      setPermissions(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(permission => {
          newState[permission][newRole] = false;
        });
        return newState;
      });
    }
  };

  const startEditingRole = (role: string) => {
    setEditingRole(role);
    setEditingValue(role);
  };

  const saveRoleName = () => {
    if (editingValue.trim() && editingRole) {
      setRoles(prev => prev.map(role => role === editingRole ? editingValue.trim() : role));
      setPermissions(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(permission => {
          if (newState[permission][editingRole!]) {
            newState[permission][editingValue.trim()] = newState[permission][editingRole!];
            delete newState[permission][editingRole!];
          }
        });
        return newState;
      });
    }
    setEditingRole(null);
    setEditingValue('');
  };

  const cancelEditingRole = () => {
    setEditingRole(null);
    setEditingValue('');
  };

  const filteredGroups = permissionGroups.filter(group => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      group.group.toLowerCase().includes(searchLower) ||
      group.permissions.some(permission => 
        permission.toLowerCase().includes(searchLower)
      )
    );
  }).map(group => ({
    ...group,
    permissions: group.permissions.filter(permission => {
      if (!searchTerm.trim()) return true;
      return permission.toLowerCase().includes(searchTerm.toLowerCase());
    })
  })).filter(group => group.permissions.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Header Section */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
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
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-6 py-2 h-[40px] flex items-center gap-2"
            >
              Add Roles
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 border-b border-gray-200">
                <TableHead className="w-1/4 text-gray-900 font-semibold text-[14px] py-4 px-6">
                  Permission
                </TableHead>
                {roles.map(role => (
                  <TableHead key={role} className="text-center text-gray-900 font-semibold text-[14px] py-4 px-4">
                    {editingRole === role ? (
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="h-8 text-center text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRoleName();
                            if (e.key === 'Escape') cancelEditingRole();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={saveRoleName}
                          className="p-1 text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEditingRole}
                          className="p-1 text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 group">
                        <span>{role}</span>
                        <button
                          onClick={() => startEditingRole(role)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-[#4F46E5] transition-opacity"
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
                      <TableCell key={`${group.group}-${role}`} className="text-center py-3 px-4">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={isGroupFullyChecked(group.group, role)}
                            onCheckedChange={(checked) => handleGroupPermissionChange(group.group, role, !!checked)}
                            className={`h-4 w-4 border-gray-300 data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5] ${
                              isGroupPartiallyChecked(group.group, role) ? 'data-[state=unchecked]:bg-gray-300' : ''
                            }`}
                          />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                  {/* Permission Rows */}
                  {group.permissions.map((permission, index) => (
                    <TableRow 
                      key={permission} 
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index === group.permissions.length - 1 ? 'border-b-gray-200' : ''
                      }`}
                    >
                      <TableCell className="text-gray-700 text-[14px] py-4 px-6 font-medium pl-12">
                        {permission}
                      </TableCell>
                      {roles.map(role => (
                        <TableCell key={`${permission}-${role}`} className="text-center py-4 px-4">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={permissions[permission]?.[role] || false}
                              onCheckedChange={(checked) => handlePermissionChange(permission, role, !!checked)}
                              className="h-4 w-4 border-gray-300 data-[state=checked]:bg-[#4F46E5] data-[state=checked]:border-[#4F46E5]"
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

          {/* No Results Message */}
          {filteredGroups.length === 0 && searchTerm.trim() && (
            <div className="text-center py-8 text-gray-500">
              <p>No permissions found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      <AddRoleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddRole={handleAddRole}
      />
    </div>
  );
};
