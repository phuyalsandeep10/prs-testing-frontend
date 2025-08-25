"use client";

import React from "react";
import SlideModal from "@/components/ui/SlideModal";
import PaymentVerificationForm from "./PaymentVerificationForm";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "verification" | "view" | "edit";
  paymentId?: string | number;
  onVerificationSuccess?: () => void; // New callback for successful verification
}

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  paymentId,
  onVerificationSuccess,
}) => {
  const handleSave = (data: any) => {
    try {
      // If this was a verification and we have a success callback, call it
      if (mode === "verification" && data.success && onVerificationSuccess) {
        onVerificationSuccess();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error in payment verification callback:', error);
      // Don't close modal if there's an error, let user retry
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    if (mode === "verification") {
      return `Payment for PA - ${paymentId}`;
    }
    if (mode === "view") {
      return "View Payment Details";
    }
    if (mode === "edit") {
      return `Edit Payment for PA - ${paymentId}`;
    }
    return "Payment Verification";
  };

  return (
    <SlideModal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      title={getTitle()}
      width="xl"
      showCloseButton={true}
    >
      <PaymentVerificationForm
        mode={mode}
        paymentId={paymentId}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </SlideModal>
  );
};

export default PaymentVerificationModal;
