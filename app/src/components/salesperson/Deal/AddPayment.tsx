"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Paperclip } from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

const AddPaymentSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  receivedAmount: z.string().min(1, "Received amount is required"),
  chequeNo: z.string().min(1, "Cheque number is required"),
  paymentType: z.string().min(1, "Payment type is required"),
  remarks: z.string().min(1, "Remarks is required"),
});

type AddPaymentData = z.infer<typeof AddPaymentSchema>;

interface AddPaymentProps {
  dealId?: string | null;
  onSave: (data: AddPaymentData) => void;
  onCancel: () => void;
}

const AddPayment: React.FC<AddPaymentProps> = ({
  dealId,
  onSave,
  onCancel,
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState("Advance");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("Receipt.png");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPaymentData>({
    resolver: zodResolver(AddPaymentSchema),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const paymentTypes = [
    { value: "advance", label: "Advance" },
    { value: "partial", label: "Partial Payment" },
    { value: "final", label: "Final Installment" },
  ];

  const mapPaymentTypeToBackend = (frontendType: string): string => {
    const mapping: { [key: string]: string } = {
      advance: "advance",
      partial: "partial_payment",
      final: "full_payment",
    };
    return mapping[frontendType] || "advance";
  };

  const submitPayment = async (data: AddPaymentData) => {
    if (!dealId) {
      toast.error("Deal ID is required");
      return;
    }

    if (!selectedFile) {
      setFileError("Receipt is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("deal_id", dealId.toString());
      formData.append("payment_date", data.paymentDate);
      formData.append("received_amount", data.receivedAmount);
      formData.append("cheque_number", data.chequeNo);
      formData.append(
        "payment_type",
        mapPaymentTypeToBackend(data.paymentType)
      );
      formData.append("payment_remarks", data.remarks);

      if (selectedFile) {
        formData.append("receipt_file", selectedFile);
      }

      await apiClient.postMultipart("/deals/payments/", formData);

      toast.success("Payment added successfully!");
      onSave(data);
      onCancel();
    } catch (error: any) {
      if (error.message?.includes("400")) {
        toast.error(
          `Bad Request: ${
            error.details?.message || error.message || "Invalid data format"
          }`
        );
      } else if (error.message?.includes("timeout")) {
        toast.error("Request timed out. Please try again.");
      } else {
        toast.error(
          error.message || "Failed to add payment. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentTypeSelect = (type: { value: string; label: string }) => {
    setSelectedPaymentType(type.label);
    setValue("paymentType", type.value);
    setShowDropdown(false);
  };

  const handleClear = () => {
    reset();
    setSelectedPaymentType("Advance");
    setSelectedFileName("Receipt.png");
    setSelectedFile(null);
    setFileError("");
    setShowDropdown(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
      setSelectedFile(files[0]);
      setFileError("");
    } else {
      setSelectedFileName("Receipt.png");
      setSelectedFile(null);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".payment-type-dropdown")) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="w-full bg-white">
      <form
        onSubmit={handleSubmit(submitPayment)}
        className="h-full flex flex-col"
      >
        <div className="px-8 py-6 flex-1">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Payment Date<span className="text-red-500">*</span>
              </label>
              <input
                {...register("paymentDate")}
                type="date"
                className="w-full h-[48px] px-4 border-2 border-[#4F46E5] rounded-lg text-[16px] focus:outline-none focus:border-[#4338CA] bg-white"
              />
              {errors.paymentDate && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.paymentDate.message)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Received Amount<span className="text-red-500">*</span>
              </label>
              <input
                {...register("receivedAmount")}
                type="text"
                placeholder="0.00"
                className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 bg-white"
              />
              {errors.receivedAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.receivedAmount.message)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Cheque No.<span className="text-red-500">*</span>
              </label>
              <input
                {...register("chequeNo")}
                type="text"
                placeholder="1234567"
                className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 bg-white"
              />
              {errors.chequeNo && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.chequeNo.message)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Attach Receipt<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  id="attachReceipt"
                  onChange={handleFileChange}
                />
                <div
                  className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-gray-900">{selectedFileName}</span>
                  <Paperclip className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {fileError && (
                <p className="text-red-500 text-sm mt-1">{fileError}</p>
              )}
            </div>
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
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto max-h-[200px] h-[100%]">
                  {paymentTypes.map((type) => (
                    <div
                      key={type.value}
                      className={`px-4 py-3 cursor-pointer text-[16px] border-b border-gray-100 last:border-b-0 transition-colors ${
                        type.label === selectedPaymentType
                          ? "bg-gray-50 text-gray-900"
                          : type.label === "Partial Payment"
                          ? "text-[#4F46E5] hover:bg-blue-50"
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
            <div>
              <label className="block text-[14px] font-medium text-gray-900 mb-2">
                Remarks<span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("remarks")}
                className="w-full h-[48px] px-4 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 resize-none bg-white"
                placeholder="Payment remarks..."
              />
              {errors.remarks && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.remarks.message)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="px-0 py-0 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB]">
          <div className="px-8 py-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 px-8 rounded-lg font-medium text-[16px] transition-colors min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 px-8 rounded-lg font-medium text-[16px] transition-colors min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
