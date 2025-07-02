"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import InputField from "@/components/ui/clientForm/InputField";
import SelectField from "@/components/ui/clientForm/SelectField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import Button from "@/components/ui/clientForm/Button";

// Schema for Payment Verification Form
const PaymentVerificationSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  clientName: z.string().min(1, "Client Name is required"),
  dealName: z.string().min(1, "Deal Name is required"),
  payMethod: z.string().min(1, "Pay Method is required"),
  paymentReceiptLink: z.string().min(1, "Payment Receipt Link is required"),
  paymentValue: z.string().min(1, "Payment Value is required"),
  chequeNumber: z.string().optional(),
  paymentDate: z.string().min(1, "Payment Date is required"),
  requestedBy: z.string().min(1, "Requested By is required"),
  salesPersonRemarks: z.string().optional(),
  uploadInvoice: z.string().min(1, "Upload Invoice is required"),
  amountInInvoice: z.string().min(1, "Amount in Invoice is required"),
  verifierRemarks: z.string().optional(),
});

type PaymentVerificationData = z.infer<typeof PaymentVerificationSchema>;

interface PaymentVerificationFormProps {
  mode?: "verification" | "view";
  invoiceId?: string;
  invoiceData?: any;
  onSave?: (data: PaymentVerificationData) => void;
  onCancel?: () => void;
}

// Mock API function
const submitPaymentVerification = async (data: PaymentVerificationData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: "Payment verification submitted successfully" };
};

const PaymentVerificationForm: React.FC<PaymentVerificationFormProps> = ({ 
  mode = "verification",
  invoiceId,
  invoiceData,
  onSave,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PaymentVerificationData>({
    resolver: zodResolver(PaymentVerificationSchema),
    defaultValues: {
      dealId: invoiceData?.id || "DLID3421",
      clientName: invoiceData?.["Client Name"] || "Yubesh Koirala",
      dealName: invoiceData?.["Deal Name"] || "Chat BOQ Project",
      paymentValue: "Nrs. 250,000",
      paymentReceiptLink: "Receipt.pdf",
      chequeNumber: "1967 0889 2002 ****",
      paymentDate: "19 - 08 - 2002",
      requestedBy: "Abinash Tiwari",
      uploadInvoice: "Invoice.pdf",
      amountInInvoice: "Nrs. 250,000",
    },
  });

  const mutation = useMutation({
    mutationFn: submitPaymentVerification,
    onSuccess: (response) => {
      console.log(response.message);
      reset();
      if (onSave) {
        onSave(mutation.variables as PaymentVerificationData);
      }
    },
    onError: (error) => {
      console.error("Submission failed:", error);
    },
  });

  const onSubmit = async (data: PaymentVerificationData) => {
    mutation.mutate(data);
  };

  const handleClear = () => {
    reset();
    if (onCancel) {
      onCancel();
    }
  };

  // Match DealForm styling classes
  const verificationLabelClass = "block text-[13px] font-semibold whitespace-nowrap text-black";
  const verificationInputClass = "border border-[#C3C3CB] shadow-none focus:outline-none focus:border-[#C3C3CB] focus:ring-0";
  const verificationWrapperClass = "mb-4";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full w-full flex flex-col overflow-hidden"
    >
      <div className="flex-1 p-6 pb-4 overflow-auto">
        <div className="flex flex-col gap-6 lg:gap-1 lg:flex-row">
          {/* Left section - Basic Deal Info */}
          <div className="div1 space-y-3 w-full flex-1">
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 mb-2">
              <div className="w-full lg:w-[133px]">
                <InputField
                  id="dealId"
                  label="Deal ID"
                  required
                  registration={register("dealId")}
                  error={errors.dealId}
                  placeholder="DLID3421"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                />
              </div>

              <div className="w-full lg:w-[240px]">
                <InputField
                  id="clientName"
                  label="Client Name"
                  required
                  registration={register("clientName")}
                  error={errors.clientName}
                  placeholder="Enter Client Name"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 pb-1">
              <div className="w-full lg:w-[133px]">
                <SelectField
                  id="payMethod"
                  label="Pay Method"
                  required
                  registration={register("payMethod")}
                  error={errors.payMethod}
                  placeholder="Select method"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  selectClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  options={[
                    { value: "Full Pay", label: "Full Pay" },
                    { value: "Partial Pay", label: "Partial Pay" },
                    { value: "Installment", label: "Installment" },
                  ]}
                />
              </div>

              <div className="w-full lg:w-[240px]">
                <InputField
                  id="paymentReceiptLink"
                  label="Payment Receipt Link"
                  required
                  registration={register("paymentReceiptLink")}
                  error={errors.paymentReceiptLink}
                  placeholder="Receipt.pdf"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                />
              </div>
            </div>

            {/* Payment details grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-5 pb-2">
              <div className="col-span-1">
                <InputField
                  id="chequeNumber"
                  label="Cheque Number"
                  registration={register("chequeNumber")}
                  error={errors.chequeNumber}
                  placeholder="1967 0889 2002 ****"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                />
              </div>

              <div className="col-span-1">
                <InputField
                  id="paymentDate"
                  label="Payment Date"
                  required
                  registration={register("paymentDate")}
                  error={errors.paymentDate}
                  placeholder="19 - 08 - 2002"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                />
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                <TextAreaField
                  id="salesPersonRemarks"
                  label="Sales Person Remarks"
                  registration={register("salesPersonRemarks")}
                  error={errors.salesPersonRemarks}
                  width="w-full lg:w-[392px]"
                  height="h-[70px]"
                  labelClassName={verificationLabelClass}
                  textareaClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                />
              </div>
            </div>
          </div>

          {/* Middle section - Deal & Payment Info */}
          <div className="div2 flex-1 flex-col gap-4 pb-1 pr-6 w-full">
            <InputField
              id="dealName"
              label="Deal Name"
              required
              registration={register("dealName")}
              error={errors.dealName}
              placeholder="Chat BOQ Project"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
            />

            <InputField
              id="paymentValue"
              label="Payment Value"
              required
              registration={register("paymentValue")}
              error={errors.paymentValue}
              placeholder="Nrs. 250,000"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
            />

            <InputField
              id="requestedBy"
              label="Requested By"
              required
              registration={register("requestedBy")}
              error={errors.requestedBy}
              placeholder="Abinash Tiwari"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
            />

            <div>
              <label className="block text-[13px] font-semibold mb-2">
                Recent Activities
              </label>
              <div className="relative p-2 pt-5 border w-full h-[150px] lg:h-[200px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto">
                <div className="flex border border-[#EDEEEFEF]">
                  <div className="w-1 bg-[#465FFF] mr-2"></div>
                  <div>
                    <p className="text-[12px] text-black">
                      Payment verification requested for {invoiceData?.["Deal Name"] || "DLID3421"}.
                    </p>
                    <p className="text-[12px] text-[#7E7E7E]">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Invoice & Verification */}
          <div className="div3 flex-1 flex-col gap-4 pb-1 w-full">
            <InputField
              id="uploadInvoice"
              label="Upload Invoice"
              required
              registration={register("uploadInvoice")}
              error={errors.uploadInvoice}
              placeholder="Invoice.pdf"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
            />

            <InputField
              id="amountInInvoice"
              label="Amount in Invoice"
              required
              registration={register("amountInInvoice")}
              error={errors.amountInInvoice}
              placeholder="Nrs. 250,000"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
            />

            <TextAreaField
              id="verifierRemarks"
              label="Verifier Remarks"
              registration={register("verifierRemarks")}
              error={errors.verifierRemarks}
              placeholder="Add verification notes..."
              width="w-full"
              height="h-[120px]"
              labelClassName={verificationLabelClass}
              textareaClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
            />

            <div>
              <label className="block text-[13px] font-semibold mb-2">
                Verification Status
              </label>
              <div className="relative p-3 border w-full h-[120px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-[12px] font-medium">Pending Verification</span>
                </div>
                <p className="text-[12px] text-gray-600">
                  Awaiting payment verification by verifier team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons - match DealForm style */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
        <Button
          type="button"
          onClick={handleClear}
          className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="px-6 py-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : (mode === "verification" ? "Verify Payment" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
};

export default PaymentVerificationForm; 