"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onClose: () => void;
  invoiceData?: any;
  mode?: "verification" | "view";
}

// Mock API function
const submitPaymentVerification = async (data: PaymentVerificationData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: "Payment verification submitted successfully" };
};

const PaymentVerificationForm: React.FC<PaymentVerificationFormProps> = ({ 
  onClose, 
  invoiceData, 
  mode = "verification" 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
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
    },
  });

  const mutation = useMutation({
    mutationFn: submitPaymentVerification,
    onSuccess: (response) => {
      console.log(response.message);
      reset();
      onClose();
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-[1200px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-[20px] font-bold text-white">
              Payment for PA - 14670
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
          <div className="flex-1 p-6 overflow-auto">
            <div className="flex gap-6">
              {/* Left Section */}
              <div className="flex-1 space-y-4">
                {/* First Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="dealId" className="text-[13px] font-semibold text-black">
                      Deal Id<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dealId"
                      {...register("dealId")}
                      placeholder="DLID3421"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.dealId && (
                      <p className="text-red-500 text-sm mt-1">{errors.dealId.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="clientName" className="text-[13px] font-semibold text-black">
                      Client Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="clientName"
                      {...register("clientName")}
                      placeholder="Yubesh Koirala"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.clientName && (
                      <p className="text-red-500 text-sm mt-1">{errors.clientName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dealName" className="text-[13px] font-semibold text-black">
                      Deal Name<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dealName"
                      {...register("dealName")}
                      placeholder="Chat BOQ Project"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.dealName && (
                      <p className="text-red-500 text-sm mt-1">{errors.dealName.message}</p>
                    )}
                  </div>
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="payMethod" className="text-[13px] font-semibold text-black">
                      Pay Method<span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("payMethod", value)}>
                      <SelectTrigger className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]">
                        <SelectValue placeholder="Full Pay" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full Pay">Full Pay</SelectItem>
                        <SelectItem value="Partial Pay">Partial Pay</SelectItem>
                        <SelectItem value="Installment">Installment</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.payMethod && (
                      <p className="text-red-500 text-sm mt-1">{errors.payMethod.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="paymentReceiptLink" className="text-[13px] font-semibold text-black">
                      Payment Receipt Link<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="paymentReceiptLink"
                      {...register("paymentReceiptLink")}
                      placeholder="Receipt.pdf"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.paymentReceiptLink && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentReceiptLink.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="paymentValue" className="text-[13px] font-semibold text-black">
                      Payment Value<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="paymentValue"
                      {...register("paymentValue")}
                      placeholder="Nrs. 250,000"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.paymentValue && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentValue.message}</p>
                    )}
                  </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="chequeNumber" className="text-[13px] font-semibold text-black">
                      Cheque Number
                    </Label>
                    <Input
                      id="chequeNumber"
                      {...register("chequeNumber")}
                      placeholder="1967 0889 2002 ****"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate" className="text-[13px] font-semibold text-black">
                      Payment Date<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="paymentDate"
                      {...register("paymentDate")}
                      placeholder="19 - 08 - 2002"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.paymentDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.paymentDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="requestedBy" className="text-[13px] font-semibold text-black">
                      Requested By<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="requestedBy"
                      {...register("requestedBy")}
                      placeholder="Abinash Tiwari"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.requestedBy && (
                      <p className="text-red-500 text-sm mt-1">{errors.requestedBy.message}</p>
                    )}
                  </div>
                </div>

                {/* Sales Person Remarks */}
                <div>
                  <Label htmlFor="salesPersonRemarks" className="text-[13px] font-semibold text-black">
                    Sales person Remarks
                  </Label>
                  <Textarea
                    id="salesPersonRemarks"
                    {...register("salesPersonRemarks")}
                    placeholder="remarks from sales here."
                    className="mt-1 min-h-[100px] border-[#C3C3CB] text-[12px]"
                  />
                </div>

                {/* Recent Activities */}
                <div>
                  <Label className="text-[13px] font-semibold text-black">
                    Recent Activities
                  </Label>
                  <div className="mt-2 border border-[#C3C3CB] rounded-[6px] p-4 h-[120px] overflow-auto bg-gray-50">
                    <div className="flex">
                      <div className="w-1 bg-[#465FFF] mr-3"></div>
                      <div>
                        <p className="text-[12px] text-black font-medium">
                          Deal Submitted in DLID3421.
                        </p>
                        <p className="text-[12px] text-gray-500">Jan 02, 2020</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Approval */}
              <div className="w-[300px] bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-700 mb-4">Approval</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="uploadInvoice" className="text-[13px] font-semibold text-black">
                      Upload Invoice<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="uploadInvoice"
                      {...register("uploadInvoice")}
                      placeholder="Invoice.pdf"
                      className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]"
                    />
                    {errors.uploadInvoice && (
                      <p className="text-red-500 text-sm mt-1">{errors.uploadInvoice.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="amountInInvoice" className="text-[13px] font-semibold text-black">
                      Amount in Invoice<span className="text-red-500">*</span>
                    </Label>
                    <Select onValueChange={(value) => setValue("amountInInvoice", value)}>
                      <SelectTrigger className="mt-1 h-[48px] border-[#C3C3CB] text-[12px]">
                        <SelectValue placeholder="Enter Amount" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100000">Rs. 100,000</SelectItem>
                        <SelectItem value="150000">Rs. 150,000</SelectItem>
                        <SelectItem value="200000">Rs. 200,000</SelectItem>
                        <SelectItem value="250000">Rs. 250,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.amountInInvoice && (
                      <p className="text-red-500 text-sm mt-1">{errors.amountInInvoice.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="verifierRemarks" className="text-[13px] font-semibold text-black">
                      Verifier Remarks
                    </Label>
                    <Textarea
                      id="verifierRemarks"
                      {...register("verifierRemarks")}
                      placeholder="Remarks here"
                      className="mt-1 min-h-[100px] border-[#C3C3CB] text-[12px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 flex justify-end gap-4">
            {mutation.isError && (
              <p className="text-red-600 text-sm mr-auto">
                Error submitting form. Please try again.
              </p>
            )}
            <Button
              type="button"
              onClick={handleClear}
              className="bg-[#F61818] text-white w-[83px] h-[40px] rounded-[6px] text-[14px] font-semibold hover:bg-[#E11515] transition-colors"
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#009959] text-white w-[119px] h-[40px] rounded-[6px] text-[14px] font-semibold hover:bg-[#008A4F] transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentVerificationForm; 