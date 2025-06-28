"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, ChevronDown } from "lucide-react";
import SlideModal from "@/components/ui/SlideModal";

const AddPaymentSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required"),
  receivedAmount: z.string().min(1, "Received amount is required"),
  chequeNo: z.string().min(1, "Cheque number is required"),
  attachReceipt: z.any().optional(),
  paymentType: z.string().min(1, "Payment type is required"),
  remarks: z.string().optional(),
});

type AddPaymentData = z.infer<typeof AddPaymentSchema>;

interface AddPaymentProps {
  onClose: () => void;
  onSave: (data: AddPaymentData) => void;
}

const AddPayment: React.FC<AddPaymentProps> = ({ onClose, onSave }) => {
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddPaymentData>({
    resolver: zodResolver(AddPaymentSchema),
  });

  const paymentTypes = [
    { value: "advance", label: "Advance" },
    { value: "partial", label: "Partial Payment" },
    { value: "final", label: "Final Installment" },
  ];

  const onSubmit = (data: AddPaymentData) => {
    onSave(data);
    onClose();
  };

  const handlePaymentTypeSelect = (type: { value: string; label: string }) => {
    setSelectedPaymentType(type.label);
    setValue("paymentType", type.value);
    setShowPaymentTypeDropdown(false);
  };

  return (
    <SlideModal
      isOpen={true}
      onClose={onClose}
      title="ADD PAYMENT"
      width="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Payment Date */}
          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-900 mb-2">
              Payment Date<span className="text-red-500">*</span>
            </label>
            <input
              id="paymentDate"
              type="text"
              {...register("paymentDate")}
              placeholder="19 - 08 - 2002"
              className="w-full px-3 py-3 border-2 border-blue-500 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.paymentDate && (
              <p className="mt-1 text-xs text-red-600">{errors.paymentDate.message}</p>
            )}
          </div>

          {/* Received Amount */}
          <div>
            <label htmlFor="receivedAmount" className="block text-sm font-medium text-gray-900 mb-2">
              Received Amount<span className="text-red-500">*</span>
            </label>
            <input
              id="receivedAmount"
              type="text"
              {...register("receivedAmount")}
              placeholder="$150,000"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.receivedAmount && (
              <p className="mt-1 text-xs text-red-600">{errors.receivedAmount.message}</p>
            )}
          </div>

          {/* Cheque No */}
          <div>
            <label htmlFor="chequeNo" className="block text-sm font-medium text-gray-900 mb-2">
              Cheque No.<span className="text-red-500">*</span>
            </label>
            <input
              id="chequeNo"
              type="text"
              {...register("chequeNo")}
              placeholder="121345235"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.chequeNo && (
              <p className="mt-1 text-xs text-red-600">{errors.chequeNo.message}</p>
            )}
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          
          {/* Attach Receipt */}
          <div>
            <label htmlFor="attachReceipt" className="block text-sm font-medium text-gray-900 mb-2">
              Attach Receipt<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="attachReceipt"
                type="file"
                {...register("attachReceipt")}
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf"
              />
              <div className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between"
                   onClick={() => document.getElementById('attachReceipt')?.click()}
              >
                <span className="text-gray-600">Receipt.png</span>
                <Upload className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Payment Type */}
          <div className="relative">
            <label htmlFor="paymentType" className="block text-sm font-medium text-gray-900 mb-2">
              Payment Type<span className="text-red-500">*</span>
            </label>
            <div
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer flex items-center justify-between"
              onClick={() => setShowPaymentTypeDropdown(!showPaymentTypeDropdown)}
            >
              <span className={selectedPaymentType ? "text-gray-900" : "text-gray-500"}>
                {selectedPaymentType || "Advance"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
            
            {showPaymentTypeDropdown && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                {paymentTypes.map((type) => (
                  <div
                    key={type.value}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    onClick={() => handlePaymentTypeSelect(type)}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            )}
            {errors.paymentType && (
              <p className="mt-1 text-xs text-red-600">{errors.paymentType.message}</p>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-900 mb-2">
              Remarks<span className="text-red-500">*</span>
            </label>
            <textarea
              id="remarks"
              {...register("remarks")}
              placeholder=""
              rows={3}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Clear
          </button>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-8 rounded-lg font-medium transition-colors"
          >
            Save Client
          </button>
        </div>
      </form>
    </SlideModal>
  );
};

export default AddPayment; 