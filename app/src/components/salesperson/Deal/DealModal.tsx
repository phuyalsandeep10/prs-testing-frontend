"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import DealForm from "./DealForm";
import AddPayment from "./AddPayment";

// Custom DialogContent without built-in close button
const DealModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 grid w-full gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DealModalContent.displayName = "DealModalContent";

interface DealModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef?: React.RefObject<HTMLElement>;
  mode: 'add' | 'edit' | 'payment';
  dealId?: string;
  dealData?: any;
}

const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onOpenChange,
  anchorRef,
  mode,
  dealId,
  dealData,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position - centered on screen
  useEffect(() => {
    if (isOpen) {
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
    }
  }, [isOpen]);

  const handleSave = (data: any) => {
    console.log(`${mode} saved:`, data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'add':
        return 'Add New Deal';
      case 'edit':
        return 'Edit Deal';
      case 'payment':
        return 'ADD PAYMENT';
      default:
        return 'Deal';
    }
  };

  const getModalSize = () => {
    if (mode === 'payment') {
      return 'w-[900px] h-auto max-w-[90vw] max-h-[90vh]';
    }
    return 'w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px]';
  };

  // Special rendering for payment modal
  if (mode === 'payment') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DealModalContent
          className={`p-0 bg-white border shadow-xl ${getModalSize()} rounded-lg overflow-hidden flex flex-col`}
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translate(-50%, -50%)",
            margin: 0,
          }}
          onInteractOutside={(e) => {
            // Prevent closing when clicking on the trigger button
            if (anchorRef?.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
        >
          {/* Header with blue title and close button */}
          <div className="px-6 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[24px] font-semibold text-[#4F46E5]">
                ADD PAYMENT
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Payment Form Content */}
          <div className="flex-1">
            <AddPayment 
              dealId={dealId}
              onSave={handleSave} 
              onCancel={handleCancel} 
            />
          </div>
        </DealModalContent>
      </Dialog>
    );
  }

  // Original modal for add/edit deals
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DealModalContent
        className={`p-0 bg-white border shadow-xl ${getModalSize()} rounded-lg overflow-hidden flex flex-col`}
        style={{
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translate(-50%, -50%)",
          margin: 0,
        }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking on the trigger button
          if (anchorRef?.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        {/* Header with close button */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[20px] font-semibold text-gray-900">
              {getTitle()}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <DealForm 
              onSave={handleSave} 
              onCancel={handleCancel}
            />
          </div>
        </div>
      </DealModalContent>
    </Dialog>
  );
};

export default DealModal; 