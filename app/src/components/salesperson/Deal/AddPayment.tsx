"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Paperclip } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useUI } from "@/stores";

const AddPaymentSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  receivedAmount: z.string().min(1, "Received amount is required"),
  chequeNo: z.string().min(1, "Cheque number is required"),
  attachReceipt: z
    .any()
    .refine((file) => file instanceof FileList && file.length > 0, {
      message: "Receipt is required",
    }),
  paymentType: z.string().min(1, "Payment type is required"),
  remarks: z.string().min(1, "Remarks is required"),
});

type AddPaymentData = z.infer<typeof AddPaymentSchema>;

interface AddPaymentProps {
  dealId?: string | null;
  onSave: (data: AddPaymentData) => void;
  onCancel: () => void;
}

const AddPayment: React.FC<AddPaymentProps> = ({ dealId, onSave, onCancel }) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState("Advance");
  const [showDropdown, setShowDropdown] = useState(false); 

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPaymentData>({
    resolver: zodResolver(AddPaymentSchema),
  });

  const paymentTypes = [
    { value: "advance", label: "Advance" },
    { value: "partial", label: "Partial Payment" },
    { value: "final", label: "Final Installment" },
  ];

  const queryClient = useQueryClient();
  const { addNotification } = useUI();

  const createPaymentMutation = useMutation({
    mutationFn: async (fd: FormData) => {
      return apiClient.postMultipart("/deals/payments/", fd);
    },
    onSuccess: () => {
      // invalidate deals query so tables refresh
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      addNotification({
        type: "success",
        title: "Payment added",
        message: "Payment has been submitted for verification.",
      });
      onCancel();
    },
    onError: (err: any) => {
      addNotification({
        type: "error",
        title: "Failed to add payment",
        message: err.message || "Please try again.",
      });
    },
  });

  const onSubmit = (data: AddPaymentData) => {
    if (!dealId) return; // safety

    const fd = new FormData();
    fd.append("client", dealId);
    fd.append("amount", data.receivedAmount);
    fd.append("payment_method", data.paymentType);
    fd.append("remarks", data.remarks);
    fd.append("payment_date", data.paymentDate);
    if (data.attachReceipt && data.attachReceipt[0]) {
      fd.append("receipt_file", data.attachReceipt[0]);
    }

    createPaymentMutation.mutate(fd);
  };

  const handlePaymentTypeSelect = (type: { value: string; label: string }) => {
    setSelectedPaymentType(type.label);
    setValue("paymentType", type.value);
    setShowDropdown(false); // Close dropdown after selection
  };

  const handleClear = () => {
    reset();
    setSelectedPaymentType("Advance");
    setValue("paymentDate", "19 - 08 - 2002");
    setValue("receivedAmount", "$150,000");
    setValue("chequeNo", "12145235");
    setShowDropdown(false); // Close dropdown when clearing
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.payment-type-dropdown')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="w-full bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
        {/* Main Form Content */}
        <div className="px-8 py-6 flex-1">
          {/* 3x2 Grid Layout exactly as shown in screenshot */}
          <div className="grid grid-cols-3 gap-6">
            {/* Row 1, Col 1: Payment Date - with blue border (active field) */}
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Payment Date<span className="text-red-500">*</span>
              </label>
              <input
                {...register("paymentDate")}
                type="text"
                className="w-full h-[48px] px-4 border-2 border-[#4F46E5] rounded-lg text-[16px] focus:outline-none focus:border-[#4338CA] bg-white"
              />
              {errors.paymentDate && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.paymentDate.message)}
                </p>
              )}
            </div>

            {/* Row 1, Col 2: Received Amount */}
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Received Amount<span className="text-red-500">*</span>
              </label>
              <input
                {...register("receivedAmount")}
                type="text"
                className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 bg-white"
              />
              {errors.receivedAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.receivedAmount.message)}
                </p>
              )}
            </div>

            {/* Row 1, Col 3: Cheque No */}
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Cheque No.<span className="text-red-500">*</span>
              </label>
              <input
                {...register("chequeNo")}
                type="text"
                className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 bg-white"
              />
              {errors.chequeNo && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.chequeNo.message)}
                </p>
              )}
            </div>

            {/* Row 2, Col 1: Attach Receipt */}
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Attach Receipt<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("attachReceipt")}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  id="attachReceipt"
                />
                <div
                  className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                  onClick={() =>
                    document.getElementById("attachReceipt")?.click()
                  }
                >
                  <span className="text-gray-900">Receipt.png</span>
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {errors.attachReceipt && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.attachReceipt.message)}
                </p>
              )}
            </div>

            {/* Row 2, Col 2: Payment Type with dropdown */}
            <div className="relative payment-type-dropdown">
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Payment Type<span className="text-red-500">*</span>
              </label>
              <div
                className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="text-gray-900">{selectedPaymentType}</span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Dropdown - only show when state is true */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto max-h-[150px]">
                  {paymentTypes.map((type, index) => (
                    <div
                      key={type.value}
                      className={`px-4 py-3 cursor-pointer text-[16px] border-b border-gray-100 last:border-b-0 transition-colors ${
                        type.label === selectedPaymentType
                          ? "bg-gray-50 text-gray-900"
                          : type.label === "Partial Payment"
                          ? "text-[#4F46E5] hover:bg-blue-50" // Blue text for Partial Payment as in screenshot
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => handlePaymentTypeSelect(type)}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.paymentType && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.paymentType.message)}
                </p>
              )}
            </div>

            {/* Row 2, Col 3: Remarks */}
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Remarks<span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("remarks")}
                className="w-full h-[48px] px-4 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 resize-none bg-white"
                placeholder=""
              />
              {errors.remarks && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.remarks.message)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer with blue gradient background exactly as in screenshot */}
        <div className="px-0 py-0 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB]">
          <div className="px-8 py-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleClear}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 px-8 rounded-lg font-medium text-[16px] transition-colors min-w-[100px]"
              >
                Clear
              </button>
              <button
                type="submit"
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 px-8 rounded-lg font-medium text-[16px] transition-colors min-w-[140px]"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPayment; 