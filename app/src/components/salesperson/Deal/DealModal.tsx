"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const DealModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[100000] grid w-full gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      style={{ zIndex: 100000 }}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dealFormRef = useRef<{ resetForm: () => void }>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
    }
  }, [isOpen]);

  const handleSave = async (data: any) => {
    try {
      setIsSubmitting(true);
      // Transform API response to match table structure
      const transformedDeal = {
        ...data,
        client: {
          client_name: data.client_name || (data.client?.client_name) || 'Unknown Client'
        },
        payment_status: data.payment_status || data.pay_status || 'partial_payment',
        pay_status: data.pay_status || data.payment_status || 'partial_payment',
        payments: data.payments || [],
        version: data.version || 1,
        deal_remarks: data.deal_remarks || data.remarks || '',
        client_name: data.client_name || (data.client?.client_name) || 'Unknown Client',
        deal_id: data.deal_id || data.id,
        organization: data.organization || '',
        created_by: data.created_by || { id: '', full_name: '', email: '' },
        activity_logs: data.activity_logs || [],
      };

      // Optimistically update all deals queries in cache (show new deal at top)
      const queryCache = queryClient.getQueryCache();
      const dealsQueries = queryCache.getAll().filter(query => query.queryKey[0] === 'deals');
      dealsQueries.forEach(query => {
        const currentData = query.state.data as any[];
        if (Array.isArray(currentData)) {
          const filteredData = currentData.filter((deal: any) => deal.id !== transformedDeal.id);
          const updatedData = [transformedDeal, ...filteredData].slice(0, 25);
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
      //  update the empty search query
      queryClient.setQueryData(['deals', ''], (oldData: any) => {
        if (!oldData) return [transformedDeal];
        const filtered = oldData.filter((deal: any) => deal.id !== transformedDeal.id);
        return [transformedDeal, ...filtered].slice(0, 25);
      });

      // Close modal, reset form, show toast
      onOpenChange(false);
      if (dealFormRef.current) dealFormRef.current.resetForm();
      toast.success("Deal created successfully!");

      // After backend refetch, merge new deal at top if not present (ensures visibility)
      setTimeout(async () => {
        await queryClient.invalidateQueries({ queryKey: ["deals"], exact: false });
        queryClient.setQueryData(['deals', ''], (oldData: any[]) => {
          if (!oldData) return [transformedDeal];
          if (!oldData.some(deal => deal.id === transformedDeal.id)) {
            return [transformedDeal, ...oldData.slice(0, 24)];
          }
          return oldData;
        });
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (dealFormRef.current) {
      dealFormRef.current.resetForm();
    }
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (mode) {
      case "add":
        return "ADD DEAL";
      case "edit":
        return "Edit Deal";
      case "payment":
        return "ADD PAYMENT";
      default:
        return "Deal";
    }
  };

  const getModalSize = () => {
    if (mode === "payment") {
      return "w-[900px] h-auto max-w-[90vw] max-h-[90vh]";
    }
    return "w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px]";
  };

  if (!isOpen || typeof window === "undefined") return null;

  // Special rendering for payment modal
  if (mode === "payment") {
    return createPortal(
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
        }}
      >
        <div
          className={`p-0 bg-white border shadow-xl ${getModalSize()} rounded-lg overflow-hidden flex flex-col z-[100000]`}
          style={{
            position: "relative",
            zIndex: 100000,
            margin: 0,
          }}
        >
 
          <div className="px-6 py-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h1 className="text-[24px] font-semibold text-[#4F46E5]">
                ADD PAYMENT
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-400 rounded-full"
                disabled={isSubmitting}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <AddPayment
              dealId={dealId}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
      }}
    >
      <div
        className={`p-0 bg-white border shadow-xl ${getModalSize()} rounded-lg overflow-hidden flex flex-col z-[100000]`}
        style={{
          position: "relative",
          zIndex: 100000,
          margin: 0,
        }}
      >
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-[#465FFF]">
              {getTitle()}
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <DealForm
              ref={dealFormRef}
              mode={mode}
              dealId={dealId}
              onSave={handleSave}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DealModal;
