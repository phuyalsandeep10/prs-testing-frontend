"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRole: (roleName: string) => void;
}

export const AddRoleDialog = ({ isOpen, onClose, onAddRole }: AddRoleDialogProps) => {
  const [roleName, setRoleName] = useState('');

  const handleSave = () => {
    if (roleName.trim()) {
      onAddRole(roleName.trim());
      setRoleName('');
      onClose();
    }
  };

  const handleClear = () => {
    setRoleName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-bold text-blue-600">ADD ROLES</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4">
          <label htmlFor="roleName" className="text-sm font-medium text-gray-700">Role Name*</label>
          <Input
            id="roleName"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="QA Admin"
            className="mt-2 border-purple-400 focus:border-purple-600 focus:ring-purple-600"
          />
        </div>
        <DialogFooter className="bg-blue-100/50 px-6 py-4 flex justify-end gap-4">
          <Button variant="outline" onClick={handleClear} className="bg-red-500 text-white hover:bg-red-600 border-none">
            Clear
          </Button>
          <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
