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

interface LogoutModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onLogout?: () => void;
  onCancel?: () => void;
}

const Logout: React.FC<LogoutModalProps> = ({
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

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
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
            Are You sure you want to logout?
          </DialogTitle>
          <DialogDescription className="text-[16px] text-[#6C6C6C] text-left leading-relaxed">
            You will be logged out of the payment Record System and redirected
            to the login page.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-end gap-3 mt-5">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold text-[14px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px]"
          >
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default Logout;
