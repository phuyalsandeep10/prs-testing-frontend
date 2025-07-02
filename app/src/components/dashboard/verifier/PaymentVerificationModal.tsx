"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
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
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen) {
      setPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
      });
    }
  }, [isOpen]);

  const handleSave = (data: any) => {
    console.log(`Payment verification ${mode} saved:`, data);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    if (mode === "verification") {
      const paymentId = "PA - 14670";
      return (
        <>
          <span className="text-[#31323A]">Payment for </span>
          <span className="text-[#465FFF]">{paymentId}</span>
        </>
      );
    }

    if (mode === "view") {
      return <span className="text-[#31323A]">View Payment Details</span>;
    }

    return <span className="text-[#31323A]">Payment Verification</span>;
  };

  const getModalSize = () => {
    return "w-[90vw] h-[90vh] max-w-[1200px] max-h-[800px]";
  };

  if (!isOpen || typeof window === "undefined") return null;

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
      onClick={() => onOpenChange(false)} // <-- CLOSE modal on clicking outside
    >
      <div
        className={`p-0 bg-white border shadow-xl ${getModalSize()} rounded-lg overflow-hidden flex flex-col z-[100000]`}
        style={{
          position: "relative",
          zIndex: 100000,
          margin: 0,
        }}
        onClick={(e) => e.stopPropagation()} // <-- PREVENT closing when clicking inside modal
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-bold">{getTitle()}</h1>
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
            <PaymentVerificationForm
              mode={mode}
              invoiceId={invoiceId}
              invoiceData={invoiceData}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentVerificationModal;
