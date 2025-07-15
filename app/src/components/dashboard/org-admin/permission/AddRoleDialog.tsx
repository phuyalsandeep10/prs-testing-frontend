"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRole: (roleName: string) => void;
}

export const AddRoleDialog = ({
  isOpen,
  onClose,
  onAddRole,
}: AddRoleDialogProps) => {
  const [roleName, setRoleName] = useState("");

  const handleSave = () => {
    if (roleName.trim()) {
      onAddRole(roleName.trim());
      setRoleName("");
      onClose();
    }
  };

  const handleClear = () => {
    setRoleName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0 font-outfit">
        <DialogHeader className=" px-6 py-4">
          <DialogTitle className="text-xl font-semibold text-[#465FFF]">
            ADD ROLES
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-6 space-y-4">
          <div>
            <label
              htmlFor="roleName"
              className="text-sm font-medium text-[#4F46E5] block mb-2"
            >
              Role Name<span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="QA Admin"
              className="h-[48px] border-gray-300 focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] focus:outline-offset-1
  data-[state=open]:outline data-[state=open]:outline-[#4F46E5] 
  data-[state=open]:ring-1 data-[state=open]:ring-[#4F46E5] 
  data-[state=open]:outline-offset-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
            />
          </div>
        </div>
        <DialogFooter className=" px-6 py-4 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClear}
            className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Clear
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#465FFF] text-[#fff] hover:bg-gray-50 border border-white"
            disabled={!roleName.trim()}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
