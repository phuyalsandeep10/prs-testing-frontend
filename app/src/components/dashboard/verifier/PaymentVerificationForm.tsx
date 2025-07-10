"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import SelectField from "@/components/ui/clientForm/SelectField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import Button from "@/components/ui/clientForm/Button";
import InputField from "@/components/ui/clientForm/InputField";

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

const isValidActivityLog = (
  log: any
): log is { id: number; message: string; timestamp: string } =>
  typeof log === "object" &&
  log !== null &&
  typeof log.id === "number" &&
  typeof log.message === "string" &&
  typeof log.timestamp === "string";

const PaymentVerificationForm: React.FC<PaymentVerificationFormProps> = ({
  mode = "verification",
  invoiceData,
  paymentId,
  onSave,
  onCancel,
}) => {
  const [activityLogs, setActivityLogs] = useState<
    Array<{ id: number; message: string; timestamp: string }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "verify" | "deny" | "refund"
  >("verify");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const {
    register,
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

  useEffect(() => {
    if (paymentId) {
      fetchPaymentData();
    }
  }, [paymentId]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_API_URL is not defined");
  }

  const fetchPaymentData = async () => {
    if (!paymentId || !apiUrl) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("Fetching payment data for ID:", paymentId);
      const res = await fetch(
        `${apiUrl}/verifier/verifier-form/${paymentId}/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend Error:", errorText);
        if (res.status === 401) {
          throw new Error("Unauthorized: Invalid or expired token");
        }
        if (res.status === 404) {
          throw new Error(
            "Payment not found: Verify the endpoint or payment ID"
          );
        }
        throw new Error(
          `Failed to fetch payment details: ${res.status} ${res.statusText}`
        );
      }

      const contentType = res.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Unexpected response format: Expected JSON");
      }

      const data = await res.json();
      console.log("Fetched data:", data);

      const activityLogs = Array.isArray(data.deal?.activity_logs)
        ? data.deal.activity_logs.filter(isValidActivityLog)
        : [];
      setActivityLogs(activityLogs);

      const deal = data?.deal;
      const payment = data?.payment;

      reset({
        dealId: deal?.deal_id || "",
        clientName: deal?.client?.client_name || "",
        dealName: deal?.deal_name || "",
        payMethod: deal?.payment_method || "",
        paymentReceiptLink: payment?.receipt_file || "",
        chequeNumber: payment?.cheque_number || "",
        paymentDate: payment?.payment_date || "",
        requestedBy: deal?.created_by?.username || "",
        salesPersonRemarks: deal?.deal_remarks || "",
        uploadInvoice: undefined,
        paymentValue: payment?.received_amount || "",
        amountInInvoice: "",
        refundReason: "",
        verifierRemarks: "",
      });
    } catch (error) {
      console.error("Failed to fetch payment details:", error);
    }
  };

  const submitPaymentVerification = async (
    data: PaymentVerificationData & {
      paymentId: string;
      invoiceStatus: "verified" | "denied" | "refunded";
    }
  ) => {
    if (!apiUrl) {
      throw new Error("API URL is not defined");
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const formData = new FormData();
    formData.append("payment_id", data.paymentId);
    formData.append("invoice_status", data.invoiceStatus);
    if (data.uploadInvoice && data.uploadInvoice.length > 0) {
      formData.append("invoice_file", data.uploadInvoice[0]);
    }
    if (data.amountInInvoice) {
      formData.append("amount_in_invoice", data.amountInInvoice);
    }
    if (data.refundReason) {
      formData.append("failure_reasons", data.refundReason);
    }
    if (data.verifierRemarks) {
      formData.append("verifier_remarks", data.verifierRemarks);
    }

    const endpoint = `${apiUrl}/verifier/verifier-form/${data.paymentId}/`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      if (res.status === 404) {
        throw new Error(
          `Endpoint not found: Verify the URL ${endpoint} or check if paymentId ${data.paymentId} is valid`
        );
      }
      throw new Error(`Submission failed: ${res.status} ${errorText}`);
    }

    return await res.json();
  };

  const mutation = useMutation<
    any,
    Error,
    PaymentVerificationData & {
      paymentId: string;
      invoiceStatus: "verified" | "denied" | "refunded";
    }
  >({
    mutationFn: submitPaymentVerification,
    onSuccess: (response) => {
      console.log(response.message);
      reset();
      setErrorMessages([]);
      if (onSave) {
        onSave(mutation.variables);
      }
    },
    onError: (error) => {
      console.error("Submission failed:", error);
    },
  });

  const validateFormForAction = async (
    action: "verify" | "deny" | "refund"
  ) => {
    setCurrentAction(action);
    const data = getValues();
    const schema = createSchema(action);

    try {
      await schema.parseAsync(data);
      setErrorMessages([]);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        clearErrors();
        const uniqueErrors = new Set<string>();

        error.errors.forEach((err) => {
          if (err.message) {
            uniqueErrors.add(err.message);
            const path = err.path[0] as keyof PaymentVerificationData;
            setError(path, { message: err.message });
          }
        });

        setErrorMessages(Array.from(uniqueErrors));
        await trigger();
        return false;
      }
      return false;
    }
  };

  const onVerifySubmit = async () => {
    if (mode === "view") return;

    setIsSubmitting(true);
    const actionType = mode === "edit" ? "refund" : "verify";
    await validateFormForAction(actionType);

    try {
      const isValid = await validateFormForAction(actionType);

      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const data = getValues();
      console.log("Verify form data:", data);

      if (!paymentId) {
        throw new Error("Payment ID is required");
      }

      await mutation.mutateAsync({
        ...data,
        paymentId: String(paymentId),
        invoiceStatus: mode === "edit" ? "refunded" : "verified",
      });
    } catch (error) {
      console.error(
        `${mode === "edit" ? "Refund" : "Verification"} failed:`,
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDenySubmit = async () => {
    if (mode === "view") return;

    setIsSubmitting(true);
    await validateFormForAction("deny");

    try {
      const isValid = await validateFormForAction("deny");

      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      const data = getValues();
      console.log("Deny form data:", data);

      if (!paymentId) {
        throw new Error("Payment ID is required");
      }

      await mutation.mutateAsync({
        ...data,
        paymentId: String(paymentId),
        invoiceStatus: "denied",
      });
    } catch (error) {
      console.error("Denial failed:", error);
    } finally {
      setIsSubmitting(false);
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

  return (
    <form className="h-full w-full flex flex-col overflow-hidden">
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
                    placeholder="Add verification notes..."
                    width="w-full"
                    height="h-[180px]"
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

      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
        {mode !== "edit" && (
          <Button
            type="button"
            onClick={onDenySubmit}
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
            disabled={isSubmitting || mutation.isPending || isViewMode}
          >
            {isSubmitting && currentAction === "deny"
              ? "Processing..."
              : "Deny Payment"}
          </Button>
        )}
        <Button
          type="button"
          onClick={onVerifySubmit}
          className="px-6 py-2 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white"
          disabled={isSubmitting || mutation.isPending || isViewMode}
        >
          {isSubmitting && currentAction === "verify"
            ? "Processing..."
            : mode === "edit"
            ? "Refund"
            : mode === "verification"
            ? "Verify Payment"
            : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentVerificationForm;
