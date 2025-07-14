"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import SelectField from "@/components/ui/clientForm/SelectField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/clientForm/InputField";
import { useUpdatePaymentStatus } from "@/hooks/api";
import { apiClient } from "@/lib/api-client";
import Swal from "sweetalert2";

const createSchema = (action: "verify" | "deny" | "refund") =>
  z.object({
    dealId: z.string().min(1, "Deal ID is required"),
    clientName: z.string().min(1, "Client Name is required"),
    dealName: z.string().min(1, "Deal Name is required"),
    payMethod: z.string().min(1, "Pay Method is required"),
    paymentReceiptLink: z.string().optional(),
    paymentValue: z.string().min(1, "Payment Value is required"),
    chequeNumber: z.string().optional(),
    paymentDate: z.string().min(1, "Payment Date is required"),
    requestedBy: z.string().min(1, "Requested By is required"),
    salesPersonRemarks: z.string().optional(),
    uploadInvoice:
      action === "verify" || action === "refund"
        ? z
            .instanceof(FileList)
            .refine(
              (files) =>
                files &&
                files.length > 0 &&
                typeof files[0].name === "string" &&
                files[0].name.toLowerCase().endsWith(".pdf"),
              { message: "Only PDF files are allowed" }
            )
        : z.instanceof(FileList).optional(),
    amountInInvoice:
      action === "verify" || action === "refund" || action === "deny"
        ? z.string().min(1, { message: "Amount in Invoice is required" })
        : z.string().optional(),
    refundReason:
      action === "deny"
        ? z.string().min(1, { message: "Rejection Reason is required" })
        : z.string().optional(),
    verifierRemarks: z
      .string()
      .min(1, { message: "Verifier Remarks is required" }),
  });

type PaymentVerificationData = z.infer<ReturnType<typeof createSchema>>;

interface PaymentVerificationFormProps {
  mode?: "verification" | "view" | "edit";
  paymentId?: string | number;
  invoiceData?: any;
  onSave?: (data: PaymentVerificationData) => void;
  onCancel?: () => void;
}

function getErrorMessage(error: any): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    if (typeof error.message === "string") return error.message;
    return getErrorMessage(error.message);
  }
  return null;
}

// Using standardized hooks - no manual API functions needed

  const PaymentVerificationForm: React.FC<PaymentVerificationFormProps> = ({
  mode = "verification",
  invoiceData,
  paymentId: invoiceId, // Renaming for clarity
  onSave,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const [activityLogs, setActivityLogs] = useState<
    Array<{ id: number; message: string; timestamp: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "verify" | "deny" | "refund"
  >("verify");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  
  const validationMode = mode; // Align with existing prop name

  // Fetch payment data when paymentId is provided
  const {
    data: paymentData,
    isLoading: isLoadingPayment,
    error: paymentError,
  } = useQuery({
    queryKey: ['payment-verifier-form', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] Making API call to:', `/verifier/verifier-form/${invoiceId}/`);
      try {
        const response = await apiClient.get<any>(`/verifier/verifier-form/${invoiceId}/`);
        console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] API response:', response);
        console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] API response type:', typeof response);
        console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] API response keys:', response ? Object.keys(response) : 'No response');
        return response;
      } catch (error) {
        console.error('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] API call failed:', error);
        throw error;
      }
    },
    enabled: !!invoiceId,
    retry: 1,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
    trigger,
    setError,
    clearErrors,
  } = useForm<PaymentVerificationData>({
    resolver: zodResolver(createSchema(currentAction)),
    mode: "onSubmit",
  });

  // Populate form when payment data is loaded
  useEffect(() => {
    if (paymentData && !isLoadingPayment) {
      const deal = paymentData.deal;
      const payment = paymentData.payment;
      
      reset({
        dealId: deal?.deal_id || '',
        clientName: deal?.client?.client_name || '',
        dealName: deal?.deal_name || '',
        payMethod: payment?.payment_method || '',
        paymentValue: payment?.received_amount?.toString() || '',
        chequeNumber: payment?.cheque_number || '',
        paymentDate: payment?.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : '',
        requestedBy: deal?.created_by?.full_name || '',
        salesPersonRemarks: payment?.payment_remarks || '',
        amountInInvoice: payment?.received_amount?.toString() || '',
        verifierRemarks: '',
      });
    }
  }, [paymentData, isLoadingPayment, reset]);

  // Use standardized hook for payment verification
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  const onSubmit = async (data: PaymentVerificationData) => {
    try {
      // Use the payment ID from the fetched data
      const paymentId = paymentData?.payment?.id || invoiceId;
      
      if (!paymentId) {
        console.error("No payment ID available for submission");
        return;
      }
      
      // Create FormData for the backend (expects form data, not JSON)
      const formData = new FormData();
      formData.append('invoice_status', currentAction === "verify" ? "verified" : "rejected");
      formData.append('verifier_remarks', data.verifierRemarks || '');
      formData.append('amount_in_invoice', data.amountInInvoice || '0');
      
      // Submit to the verifier form endpoint using FormData
      const response = await apiClient.upload<any>(`/verifier/verifier-form/${paymentId}/`, formData);
      
      console.log("Payment verification submitted successfully", response);
      reset();
      
      // Show success notification
      const actionText = currentAction === "verify" ? "verified" : "rejected";
      await Swal.fire({
        icon: "success",
        title: "Payment Verification Successful!",
        text: `Payment has been ${actionText} successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
      
      // Invalidate and refetch relevant queries to update the UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['invoices'] }),
        queryClient.invalidateQueries({ queryKey: ['deals'] }),
        queryClient.invalidateQueries({ queryKey: ['verification-queue'] }),
        queryClient.invalidateQueries({ queryKey: ['payment-verifier-form', invoiceId] }),
        queryClient.invalidateQueries({ predicate: (query) => 
          query.queryKey[0] === 'deals' || 
          query.queryKey[0] === 'invoices' ||
          query.queryKey.includes('verification')
        }),
      ]);
      
      if (onSave) {
        onSave(data);
      }
    } catch (error) {
      console.error("Submission failed:", error);
      
      // Show error notification
      await Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error instanceof Error ? error.message : "An error occurred during verification.",
      });
    }
  };

  const handleClear = () => {
    if (mode === "view") return;
    reset();
    setErrorMessages([]);
    if (onCancel) {
      onCancel();
    }
  };

  const verificationLabelClass =
    "block text-[13px] font-semibold whitespace-nowrap text-black";
  const verificationInputClass =
    "border border-[#C3C3CB] shadow-none focus:outline-none focus:border-[#C3C3CB] focus:ring-0";
  const verificationWrapperClass = "mb-4";

  const uploadInvoiceErrorMsg = getErrorMessage(errors.uploadInvoice);

  const isViewMode = mode === "view";

  // Debug logging
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] ===== PAYMENT VERIFICATION FORM DEBUG =====');
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] paymentId:', invoiceId);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] mode:', mode);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] paymentData:', paymentData);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] paymentData type:', typeof paymentData);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] paymentData keys:', paymentData ? Object.keys(paymentData) : 'No data');
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] isLoadingPayment:', isLoadingPayment);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] paymentError:', paymentError);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] Query enabled:', !!invoiceId);
  console.log('🔍 [PAYMENT_VERIFICATION_FORM_DEBUG] ===========================================');

  // Show loading state while fetching payment data
  if (isLoadingPayment) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if payment fetch failed
  if (paymentError) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load payment details</p>
              <p className="text-gray-600 text-sm">{paymentError.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="h-full w-full flex flex-col overflow-hidden" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex flex-col gap-6 lg:gap-1 lg:flex-row lg:mt-3">
          <div className="div1 w-full flex-1">
            <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-6 mb-2">
              <div className="w-full lg:w-[133px]">
                <InputField
                  id="dealId"
                  label="Deal ID"
                  required
                  registration={register("dealId")}
                  placeholder="DLID3421"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
                />
              </div>

              <div className="w-full lg:w-[240px]">
                <InputField
                  id="clientName"
                  label="Client Name"
                  required
                  registration={register("clientName")}
                  placeholder="Enter Client Name"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
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
                  placeholder="Select method"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  selectClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  disabled
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
                  placeholder="Receipt.pdf"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
                />
              </div>
            </div>

            <div>
              <div className="col-span-1">
                <InputField
                  id="chequeNumber"
                  label="Cheque Number"
                  registration={register("chequeNumber")}
                  placeholder="1967 0889 2002 ****"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-5">
              <div className="col-span-1">
                <InputField
                  id="paymentDate"
                  label="Payment Date"
                  required
                  registration={register("paymentDate")}
                  placeholder="19 - 08 - 2002"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
                />
              </div>

              <div className="col-span-1">
                <InputField
                  id="requestedBy"
                  label="Requested By"
                  required
                  registration={register("requestedBy")}
                  placeholder="Abinash Tiwari"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={verificationLabelClass}
                  inputClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
                />
              </div>

              <div className="col-span-1 sm:col-span-2 lg:col-span-2 -mt-2">
                <TextAreaField
                  id="salesPersonRemarks"
                  label="Deal Remarks"
                  placeholder="remarks from deals here."
                  registration={register("salesPersonRemarks")}
                  width="w-full lg:w-[392px]"
                  height="h-[77px]"
                  labelClassName={verificationLabelClass}
                  textareaClassName={verificationInputClass}
                  wrapperClassName={verificationWrapperClass}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="div2 flex-1 flex-col gap-4 pb-1 pr-6 pl-2 w-full space-y-6">
            <InputField
              id="dealName"
              label="Deal Name"
              required
              registration={register("dealName")}
              placeholder="Chat BOQ Project"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
              readOnly
            />

            <InputField
              id="paymentValue"
              label="Payment Value"
              required
              registration={register("paymentValue")}
              placeholder="Nrs. 250,000"
              width="w-full"
              height="h-[48px]"
              labelClassName={verificationLabelClass}
              inputClassName={verificationInputClass}
              wrapperClassName={verificationWrapperClass}
              readOnly
            />

            <div>
              <label className="block text-[13px] font-semibold mb-2">
                Recent Activities
              </label>
              <div
                className="relative p-2 pt-5 border w-full h-[150px] lg:h-[260px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto scrollbar-hide"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {activityLogs.length === 0 ? (
                  <p className="text-gray-500">No recent activities</p>
                ) : (
                  activityLogs.map(({ id, message, timestamp }) => (
                    <div
                      key={id}
                      className="flex border border-[#EDEEEFEF] mb-2 rounded-sm"
                    >
                      <div className="w-1 bg-[#465FFF] mr-2"></div>
                      <div>
                        <p className="text-[12px] text-black">{message}</p>
                        <p className="text-[12px] text-[#7E7E7E]">
                          {new Date(timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="div3 w-full flex-1 md:w-3/4 lg:w-64 h-auto lg:h-[264px] flex flex-col">
            <div
              className="bg-[#DADFFF] p-4 rounded-lg relative flex flex-col"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 3rem) 0, 100% 3rem, 100% 100%, 0 100%)",
              }}
            >
              <h1 className="text-[#465FFF] font-medium text-[16px] mb-8">
                Approval
              </h1>
              <div
                className="flex-1 overflow-auto max-h-[390px]"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className={verificationWrapperClass}>
                  <label
                    htmlFor="uploadInvoice"
                    className={verificationLabelClass}
                  >
                    Upload Invoice{" "}
                    {(currentAction === "verify" ||
                      currentAction === "refund") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    id="uploadInvoice"
                    type="file"
                    accept=".pdf"
                    {...register("uploadInvoice")}
                    className="hidden"
                    disabled={isViewMode}
                  />
                  <label
                    htmlFor="uploadInvoice"
                    className={`mt-1 flex items-center justify-between w-full h-[48px] p-2 text-[12px] font-normal border rounded-[6px] border-[#C3C3CB] cursor-pointer bg-white ${verificationInputClass}`}
                  >
                    <span className="underline">
                      {watch("uploadInvoice")?.[0]?.name || "Invoice.pdf"}
                    </span>
                    <svg
                      width="13"
                      height="14"
                      viewBox="0 0 13 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.88645 4.17095L5.11518 7.94217C4.85483 8.2025 4.85483 8.62463 5.11518 8.88497C5.37553 9.14537 5.79765 9.14537 6.05798 8.88497L9.82925 5.11375C10.6103 4.33271 10.6103 3.06638 9.82925 2.28533C9.04818 1.50428 7.78185 1.50428 7.00078 2.28533L3.22956 6.05657C1.92782 7.3583 1.92782 9.46883 3.22956 10.7706C4.53131 12.0724 6.64185 12.0724 7.94358 10.7706L11.7149 6.99937L12.6576 7.94217L8.88645 11.7134C7.06398 13.5358 4.1092 13.5358 2.28676 11.7134C0.46431 9.89097 0.46431 6.93623 2.28676 5.11375L6.05798 1.34252C7.35972 0.0407743 9.47032 0.0407743 10.7721 1.34252C12.0738 2.64427 12.0738 4.75481 10.7721 6.05657L7.00078 9.82784C6.21978 10.6088 4.95342 10.6088 4.17238 9.82784C3.39132 9.04677 3.39132 7.78043 4.17238 6.99937L7.94358 3.22814L8.88645 4.17095Z"
                        fill="#A9A9A9"
                      />
                    </svg>
                  </label>
                  {uploadInvoiceErrorMsg && (
                    <p className="mt-1 text-sm text-red-600">
                      {uploadInvoiceErrorMsg}
                    </p>
                  )}
                </div>

                <div className={verificationWrapperClass}>
                  <InputField
                    id="amountInInvoice"
                    label="Amount in Invoice"
                    required={
                      currentAction === "verify" ||
                      currentAction === "refund" ||
                      currentAction === "deny"
                    }
                    registration={register("amountInInvoice")}
                    error={errors.amountInInvoice}
                    placeholder="Nrs. 250,000"
                    width="w-full"
                    height="h-[48px]"
                    labelClassName={verificationLabelClass}
                    inputClassName={verificationInputClass}
                    wrapperClassName="mb-0"
                    disabled={isViewMode}
                  />
                  
                </div>

                <div className={verificationWrapperClass}>
                  <SelectField
                    id="refundReason"
                    label="Reason"
                    required={currentAction === "deny"}
                    registration={register("refundReason")}
                    error={errors.refundReason}
                    placeholder="Rejection Reasons"
                    width="w-full"
                    height="h-[48px]"
                    labelClassName={verificationLabelClass}
                    selectClassName={verificationInputClass}
                    wrapperClassName="mb-0"
                    disabled={isViewMode}
                    options={[
                      {
                        value: "Insufficient Funds",
                        label: "Insufficient Funds",
                      },
                      { value: "Invalid Card", label: "Invalid Card" },
                      { value: "Bank Decline", label: "Bank Decline" },
                      { value: "Technical Error", label: "Technical Error" },
                      { value: "Cheque Bounce", label: "Cheque Bounce" },
                      {
                        value: "Payment Received but Not Reflected",
                        label: "Payment Received but Not Reflected",
                      },
                    ]}
                  />
                 
                </div>

                <div className={verificationWrapperClass}>
                  <TextAreaField
                    id="verifierRemarks"
                    label="Verifier Remarks"
                    required
                    registration={register("verifierRemarks")}
                    error={errors.verifierRemarks}
                    placeholder="Enter remarks"
                    width="w-full"
                    height="h-[105px]"
                    labelClassName={verificationLabelClass}
                    textareaClassName={verificationInputClass}
                    wrapperClassName="mb-0"
                    disabled={isViewMode}
                  />
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between p-4 bg-white border-t border-[#C3C3CB]">
        <Button
          variant="secondary"
          onClick={handleClear}
          className="h-[48px] w-[142px]"
          disabled={isViewMode || isSubmitting}
        >
          Clear
        </Button>
        <div className="flex gap-4">
          <Button
            variant="destructive"
            onClick={() => setCurrentAction("deny")}
            className="h-[48px] w-[142px]"
            disabled={isViewMode || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Denying..." : "Deny"}
          </Button>
          <Button
            variant="default"
            onClick={() => setCurrentAction("verify")}
            className="h-[48px] w-[142px]"
            disabled={isViewMode || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PaymentVerificationForm;
