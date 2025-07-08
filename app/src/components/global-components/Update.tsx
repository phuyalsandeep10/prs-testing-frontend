"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpdateModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onLogout?: () => void;
  onCancel?: () => void;
}

const Update: React.FC<UpdateModalProps> = ({
  open,
  onOpenChange,
  trigger,
  onLogout,
  onCancel,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleUpdate = () => {
    setIsOpen(false);
    onLogout?.(); // Call the actual update function
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {(trigger || !open) && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-[560px] max-h-[200px] bg-white border-2 border-purple-200 shadow-xl">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-black text-left">
            Do you want to save Changes?
          </DialogTitle>
          <DialogDescription className="text-[16px] text-[#6C6C6C] text-left leading-relaxed">
            Changes Done will be saved, Are you sure you want to same changes
            done ?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-end gap-3 mt-5">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-[14px]"
          >
            No
          </Button>
          <Button
            onClick={handleUpdate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px]"
          >
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default Update;
