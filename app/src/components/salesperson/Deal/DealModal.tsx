"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import SlideModal from "@/components/ui/SlideModal";
import DealForm from "./DealForm";
import AddPayment from "./AddPayment";



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
  const dealFormRef = useRef<{ resetForm: () => void }>(null);

  const handleSave = (data: any) => {
    console.log(`${mode} saved:`, data);
    onOpenChange(false); 
  };

  const handleCancel = () => {
    if (dealFormRef.current) {
      dealFormRef.current.resetForm();
    }
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

  if (mode === "payment") {
    return (
      <SlideModal
        isOpen={isOpen}
        onClose={() => onOpenChange(false)}
        title={getTitle()}
        width={getModalWidth()}
        showCloseButton={true}
      >
        <AddPayment
          dealId={dealId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
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
      <DealForm
        ref={dealFormRef}
        mode={mode}
        onSave={handleSave}
        onCancel={handleCancel} 
      />
    </SlideModal>
  );
};

export default DealModal;
