"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SlideModal from "@/components/ui/SlideModal";
import DealForm from "./DealForm";
import AddPayment from "./AddPayment";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";



interface DealModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef?: React.RefObject<HTMLElement>;
  mode: "add" | "edit" | "payment";
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
          client_name:
            data.client_name || data.client?.client_name || "Unknown Client",
        },
        payment_status:
          data.payment_status || data.pay_status || "partial_payment",
        pay_status: data.pay_status || data.payment_status || "partial_payment",
        payments: data.payments || [],
        version: data.version || 1,
        deal_remarks: data.deal_remarks || data.remarks || "",
        client_name:
          data.client_name || data.client?.client_name || "Unknown Client",
        deal_id: data.deal_id || data.id,
        organization: data.organization || "",
        created_by: data.created_by || { id: "", full_name: "", email: "" },
        activity_logs: data.activity_logs || [],
      };

      // Optimistically update all deals queries in cache (show new deal at top)
      const queryCache = queryClient.getQueryCache();
      const dealsQueries = queryCache
        .getAll()
        .filter((query) => query.queryKey[0] === "deals");
      dealsQueries.forEach((query) => {
        const currentData = query.state.data as any[];
        if (Array.isArray(currentData)) {
          const filteredData = currentData.filter(
            (deal: any) => deal.id !== transformedDeal.id
          );
          const updatedData = [transformedDeal, ...filteredData].slice(0, 25);
          queryClient.setQueryData(query.queryKey, updatedData);
        }
      });
      //  update the empty search query
      queryClient.setQueryData(["deals", ""], (oldData: any) => {
        if (!oldData) return [transformedDeal];
        const filtered = oldData.filter(
          (deal: any) => deal.id !== transformedDeal.id
        );
        return [transformedDeal, ...filtered].slice(0, 25);
      });

      // Close modal, reset form, show toast
      onOpenChange(false);
      if (dealFormRef.current) dealFormRef.current.resetForm();
      toast.success("Deal created successfully!");

      // After backend refetch, merge new deal at top if not present (ensures visibility)
      setTimeout(async () => {
        await queryClient.invalidateQueries({
          queryKey: ["deals"],
          exact: false,
        });
        queryClient.setQueryData(["deals", ""], (oldData: any[]) => {
          if (!oldData) return [transformedDeal];
          if (!oldData.some((deal) => deal.id === transformedDeal.id)) {
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

  const handlePaymentSave = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      // For payments, we need to invalidate the deals query to refresh the data
      // This will show the new payment in the nested payments table
      await queryClient.invalidateQueries({
        queryKey: ["deals"],
        exact: false,
      });

      // This ensures the expanded payment column shows fresh data
      if (dealId) {
        // Remove the specific deal's nested data from cache
        queryClient.removeQueries({
          queryKey: ["deals", dealId, "payments"],
          exact: false,
        });
        
        // Also clear any cached expand data for this deal
        queryClient.removeQueries({
          queryKey: ["deals", dealId, "expand"],
          exact: false,
        });
      }

      // Close modal and show success message
      onOpenChange(false);
      toast.success("Payment added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add payment. Please try again.");
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

  const getModalWidth = () => {
    if (mode === "payment") {
      return "lg";
    }
    return "xl";
  };

  const getModalSize = () => {
    if (mode === "payment") {
      return "max-w-lg";
    }
    return "max-w-4xl";
  };

  if (mode === "payment") {
    return (
      <SlideModal
        isOpen={isOpen}
        onClose={() => onOpenChange(false)}
        title={getTitle()}
        width={getModalWidth()}
        showCloseButton={true}
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
            onSave={handlePaymentSave}
            onCancel={handleCancel}
          />
        </div>
      </SlideModal>
    );
  }

  return (
    <SlideModal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title={getTitle()}
      width={getModalWidth()}
      showCloseButton={true}
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
    </SlideModal>
  );
};

export default DealModal;
