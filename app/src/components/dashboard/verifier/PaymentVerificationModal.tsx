"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SlideModal from "@/components/ui/SlideModal";
import PaymentVerificationForm from "./PaymentVerificationForm";

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "verification" | "view";
  invoiceId?: string;
  invoiceData?: any;
}

const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onOpenChange,
  mode,
  invoiceId,
  invoiceData,
}) => {
  const handleSave = (data: any) => {
    console.log(`Payment verification ${mode} saved:`, data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    if (mode === "verification") {
      return "Payment for PA - 14670";
    }

    if (mode === "view") {
      return "View Payment Details";
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
        invoiceId={invoiceId}
        invoiceData={invoiceData}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </SlideModal>
  );
};

export default PaymentVerificationModal;
