"use client";

import React from "react";
import SlideModal from "@/components/ui/SlideModal";
import PaymentVerificationForm from "./PaymentVerificationForm";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "verification" | "view" | "edit";
  paymentId?: string | number;
}

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  paymentId,
}) => {
  const handleSave = (data: any) => {
    console.log(`Payment ${mode} saved:`, data);
    onOpenChange(false);
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
