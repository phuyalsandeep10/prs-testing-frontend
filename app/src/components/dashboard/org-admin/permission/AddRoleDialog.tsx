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
      <DialogContent className="sm:max-w-[425px] bg-white p-0 font-outfit">
        <DialogHeader className="bg-[#22C55E] px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-white">
            ADD ROLES
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-6 space-y-4">
          <div>
            <label htmlFor="roleName" className="text-sm font-medium text-[#4F46E5] block mb-2">
              Role Name<span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="QA Admin"
              className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
          </div>
        </div>
        <DialogFooter className="bg-[#22C55E] px-6 py-4 flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={handleClear} 
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Clear
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-white text-[#22C55E] hover:bg-gray-50 border border-white"
            disabled={!roleName.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
