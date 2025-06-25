"use client";

import { useState, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, PlusCircle } from 'lucide-react';
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

  const handleAddRole = (newRole: string) => {
    if (newRole && !roles.includes(newRole)) {
      setRoles(prev => [...prev, newRole]);
      // Initialize permissions for the new role
      setPermissions(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(permission => {
          newState[permission][newRole] = false;
        });
        return newState;
      });
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Permission</h1>
          <p className="text-gray-500 mt-1">Easily manage user access and control permissions in one centralized dashboard.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Search..." className="pl-10 w-64" />
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-5 w-5" /> Add Roles
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-1/4 text-gray-600 font-bold text-lg">Permission</TableHead>
              {roles.map(role => (
                <TableHead key={role} className="text-center text-gray-600 font-bold text-lg">{role}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissionGroups.map(group => (
              <Fragment key={group.group}>
                <TableRow key={group.group} className="bg-gray-200">
                  <TableCell colSpan={roles.length + 1} className="font-bold text-blue-600 text-base">{group.group}</TableCell>
                </TableRow>
                {group.permissions.map(permission => (
                  <TableRow key={permission}>
                    <TableCell className="text-gray-700">{permission}</TableCell>
                    {roles.map(role => (
                      <TableCell key={`${permission}-${role}`} className="text-center">
                        <Checkbox
                          checked={permissions[permission]?.[role] || false}
                          onCheckedChange={(checked) => handlePermissionChange(permission, role, !!checked)}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddRoleDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddRole={handleAddRole}
      />
    </div>
  );
};
