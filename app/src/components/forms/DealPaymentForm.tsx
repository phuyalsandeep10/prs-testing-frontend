import React, { useState } from "react";
import { z } from "zod";
import { UnifiedForm } from "@/components/core";
import type { FieldConfig, FormLayout, FormStyling, FormActions } from "@/components/core";
import { X } from "lucide-react";

// Professional form schema with proper validation
const dealPaymentSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  receivedAmount: z.string().min(1, "Received amount is required"),
  chequeNo: z.string().min(1, "Cheque number is required"),
  paymentType: z.enum(["cash", "cheque", "bank_transfer", "card"], {
    required_error: "Payment type is required",
  }),
  remarks: z.string().min(1, "Remarks are required"),
  attachReceipt: z
    .any()
    .refine((files) => files?.length === 1, {
      message: "Receipt upload is required",
    })
    .refine((files) => {
      const file = files?.[0];
      return file && ['image/png', 'image/jpeg', 'application/pdf'].includes(file.type);
    }, {
      message: "Only PNG, JPEG, or PDF files are allowed",
    }),
});

type DealPaymentFormData = z.infer<typeof dealPaymentSchema>;

interface DealPaymentFormProps {
  onClose?: () => void;
  onSubmit?: (data: DealPaymentFormData) => void | Promise<void>;
  loading?: boolean;
}

const DealPaymentForm: React.FC<DealPaymentFormProps> = ({ 
  onClose, 
  onSubmit,
  loading = false 
}) => {
  // Professional field configuration
  const fields: FieldConfig[] = [
    {
      name: "paymentDate",
      label: "Payment Date",
      type: "date",
      required: true,
      description: "Select the date when payment was received",
    },
    {
      name: "receivedAmount",
      label: "Received Amount",
      type: "number",
      required: true,
      placeholder: "$150,000",
      description: "Enter the amount received",
    },
    {
      name: "chequeNo",
      label: "Cheque Number",
      type: "text",
      required: true,
      placeholder: "121345235",
      description: "Enter cheque number if applicable",
    },
    {
      name: "paymentType",
      label: "Payment Type",
      type: "select",
      required: true,
      options: [
        { value: "cash", label: "Cash" },
        { value: "cheque", label: "Cheque" },
        { value: "bank_transfer", label: "Bank Transfer" },
        { value: "card", label: "Card Payment" },
      ],
      description: "Select the payment method used",
    },
    {
      name: "attachReceipt",
      label: "Attach Receipt",
      type: "file",
      required: true,
      accept: ".png,.jpg,.jpeg,.pdf",
      description: "Upload payment receipt (PNG, JPEG, or PDF)",
    },
    {
      name: "remarks",
      label: "Remarks",
      type: "textarea",
      required: true,
      placeholder: "Add any additional notes or comments...",
      description: "Provide any additional information about the payment",
    },
  ];

  // Professional form layout
  const layout: FormLayout = {
    type: 'grid',
    columns: 2,
    spacing: 'lg',
  };

  // Professional styling
  const styling: FormStyling = {
    variant: 'professional',
    size: 'lg',
    theme: 'light',
  };

  // Professional form actions
  const actions: FormActions = {
    submit: {
      text: 'Save Payment',
      variant: 'default',
      loading: loading,
    },
    reset: {
      text: 'Clear Form',
      show: true,
    },
    cancel: {
      text: 'Cancel',
      show: true,
      onClick: onClose,
    },
  };

  const handleSubmit = async (data: DealPaymentFormData) => {
    try {
      console.log("💰 Payment Form Data:", data);
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch (error) {
      console.error("Payment form submission error:", error);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
          Add Payment Details
        </h1>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Unified Form */}
      <UnifiedForm
        schema={dealPaymentSchema}
        fields={fields}
        layout={layout}
        styling={styling}
        actions={actions}
        onSubmit={handleSubmit}
        loading={loading}
        className="deal-payment-form"
      />
    </div>
  );
};

export default DealPaymentForm;
