"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { DealSchema, createDealSchema } from "./DealSchema";
import InputField from "@/components/ui/clientForm/InputField";
import SelectField from "@/components/ui/clientForm/SelectField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import Button from "@/components/ui/clientForm/Button";
import { Combobox } from "@/components/ui/combobox";
import CurrencySelector from "./CurrencySelector";
import { apiClient } from "@/lib/api";
import { Client } from "@/types/deals";
import { toast } from "sonner";

// currency flag list
import US from "country-flag-icons/react/3x2/US";

type DealFormData = z.infer<typeof DealSchema>;

const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

// currency list
const currencies = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
  },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "Nrs." },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

// Currency formatter function
// const formatCurrency = (amount: string | number, currency: string = "USD") => {
//   const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
//   if (isNaN(numAmount)) return amount;

//   const currencySymbols: { [key: string]: string } = {
//     USD: "$",
//     EUR: "€",
//     GBP: "£",
//     NPR: "Nrs.",
//     INR: "₹",
//   };

//   const symbol = currencySymbols[currency] || currency;

//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: currency,
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(numAmount);
// };

// Function to get currency symbol for placeholder
// const getCurrencySymbol = (currency: string = "USD") => {
//   const currencySymbols: { [key: string]: string } = {
//     USD: "$",
//     EUR: "€",
//     GBP: "£",
//     NPR: "Nrs.",
//     INR: "₹",
//   };

//   return currencySymbols[currency] || currency;
// };

const transformDataForApi = (data: DealFormData, clients: Client[], mode?: "add" | "edit") => {
  console.log("🔍 Transforming form data for API...");
  
  const formData = new FormData();
  const paymentData: { [key: string]: any } = {};

  // Handle file upload separately with correct field name
  if (data.uploadReceipt && data.uploadReceipt.length > 0) {
    formData.append("payments[0][receipt_file]", data.uploadReceipt[0]);
    console.log("📎 Receipt file added:", data.uploadReceipt[0].name);
  }

  // Handle client_name to client_id conversion
  if (data.clientName && clients) {
    const selectedClient = clients.find(client => client.client_name === data.clientName);
    if (selectedClient) {
      formData.append("client_id", selectedClient.id.toString());
      console.log("👤 Client ID mapped:", selectedClient.id);
    } else {
      console.error("❌ Client not found:", data.clientName);
    }
  }

  const dealKeys = [
    // "clientName", // ✅ Skip clientName since we manually add client_id
    "dealName", 
    "payStatus",
    "sourceType",
    "dealValue",
    "dealDate",
    "dueDate",
    "dealRemarks",
    "currency",
    "payMethod", // ✅ Add payment method to deal fields since backend expects it
  ];
  const paymentKeys = [
    "paymentDate",
    "receivedAmount", 
    "chequeNumber",
    "paymentRemarks",
  ];

  // Add deal fields
  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      key !== "uploadReceipt"
    ) {
      let value = (data as any)[key];
      
      // Handle array values - extract first element if it's an array
      if (Array.isArray(value) && value.length > 0) {
        value = value[0];
        console.log(`⚠️  Fixed array value for ${key}:`, value);
      }
      
      if (value !== undefined && value !== null && value !== "") {
        if (dealKeys.includes(key)) {
          let snakeKey = toSnakeCase(key);
          let apiValue = value;
          
          // Handle special field mappings
          if (key === "payStatus") {
            snakeKey = "payment_status";
            apiValue = value === "Full Pay" ? "full_payment" : "partial_payment";
          } else if (key === "payMethod") {
            snakeKey = "payment_method";
          }
          
          formData.append(snakeKey, apiValue);
        } else if (paymentKeys.includes(key)) {
          const snakeKey =
            key === "payMethod" ? "payment_method" : toSnakeCase(key);
          paymentData[snakeKey] = value;
        }
      } else if (value === "" && dealKeys.includes(key)) {
        // Log empty values for deal fields
        console.log(`⚠️  Empty deal field: ${key}`);
      } else if (value === "" && paymentKeys.includes(key)) {
        // Log empty values for payment fields  
        console.log(`⚠️  Empty payment field: ${key}`);
      }
    }
  }

  // Append nested payment data with correct format
  for (const key in paymentData) {
    formData.append(`payments[0][${key}]`, paymentData[key]);
  }

  // Add version field for edit mode
  if (mode === "edit") {
    formData.append("version", "edited");
    console.log("🔄 Version set to 'edited' for edit mode");
  }

  // Log FormData summary
  console.log("🚀 FormData prepared with", [...formData.keys()].length, "fields");

  return formData;
};

const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<{ results: Client[] }>("/clients/");
    return response.data.results || [];
  } catch (error) {
    throw error;
  }
};

interface DealFormProps {
  onSave?: (data: DealFormData) => void;
  onCancel?: () => void;
  mode?: "add" | "edit";
  dealId?: string;
  isSubmitting?: boolean;
}

export interface DealFormHandle {
  resetForm: () => void;
}

const DealForm = forwardRef<DealFormHandle, DealFormProps>(
  ({ onSave, onCancel, mode = "add", dealId, isSubmitting = false }, ref) => {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const isStandalonePage =
      pathname?.includes("/add") || pathname?.includes("/edit");

    // Fetch clients for combobox
    const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
      queryKey: ["clients", "clientsName"],
      queryFn: fetchClients,
    });

    // Fetch deal data for edit mode
    const fetchDealById = async (id: string): Promise<any> => {
      try {
        const response = await apiClient.get<any>(`/deals/deals/${id}/`);
        return response.data;
      } catch (error) {
        throw error;
      }
    };

    const {
      data: dealData,
      isLoading: isLoadingDeal,
      error: dealError,
    } = useQuery({
      queryKey: ["deal", dealId],
      queryFn: () => fetchDealById(dealId!),
      enabled: mode === "edit" && !!dealId,
    });

    // const TestActivity = dealData.activity_logs.map((activityData: any) => {
    //   return <div key={activityData.id}>{activityData.message}</div>;
    // });

    // console.log("dealData fetched to display", TestActivity);

    const submitDealData = async (data: DealFormData): Promise<DealFormData> => {
      try {
        console.log("Submitting deal data:", data);

        const dealPayload = transformDataForApi(data, clients || [], mode);

        // Log what we're actually sending
        console.log("Deal payload (FormData):");
        for (let [key, value] of dealPayload.entries()) {
          console.log(key, value);
        }

        const endpoint = mode === "edit" ? `/deals/deals/${dealId}/` : "/deals/deals/";

        // 1. Create or update the deal using multipart methods for FormData
        let dealResponse;
        if (mode === "edit") {
          dealResponse = await apiClient.putMultipart(endpoint, dealPayload);
        } else {
          dealResponse = await apiClient.postMultipart(endpoint, dealPayload);
        }
        const dealResult = dealResponse.data as import("@/types/deals").Deal;

        // Get the deal id for payment association
        const dealIdentifier = dealResult.deal_id || dealResult.id || dealId;

        // Note: Payment data is now included in the deal creation payload
        // No separate payment API call needed

        return dealResult;
      } catch (error: any) {
        console.error("❌ Deal submission failed:", error.message);
        console.error("📋 Error details:", error.details || error.response?.data);
        
        // Parse detailed error information
        let errorMessage = `Failed to ${mode} deal. Please try again.`;
        
        if (error.details || error.response?.data) {
          const responseData = error.details || error.response?.data;
          console.log("🔍 Parsing validation errors:", responseData);
          
          // Handle nested payment validation errors
          if (responseData.payments) {
            if (Array.isArray(responseData.payments)) {
              // Handle array of payment errors
              const paymentErrors = responseData.payments[0];
              if (paymentErrors?.cheque_number) {
                errorMessage = Array.isArray(paymentErrors.cheque_number) 
                  ? paymentErrors.cheque_number[0] 
                  : paymentErrors.cheque_number;
              } else if (paymentErrors?.receipt_file) {
                errorMessage = Array.isArray(paymentErrors.receipt_file) 
                  ? paymentErrors.receipt_file[0] 
                  : paymentErrors.receipt_file;
              }
            } else if (typeof responseData.payments === 'string') {
              errorMessage = responseData.payments;
            }
          }
          // Handle direct field validation errors
          else if (responseData.cheque_number) {
            errorMessage = Array.isArray(responseData.cheque_number) 
              ? responseData.cheque_number[0] 
              : responseData.cheque_number;
          }
          // Handle general validation errors
          else if (responseData.non_field_errors) {
            errorMessage = Array.isArray(responseData.non_field_errors) 
              ? responseData.non_field_errors[0] 
              : responseData.non_field_errors;
          }
          // Handle detail field
          else if (responseData.detail) {
            errorMessage = responseData.detail;
          }
          // Handle error field
          else if (responseData.error) {
            errorMessage = responseData.error;
          }
          // Handle first available error message
          else if (typeof responseData === 'object') {
            const firstError = Object.values(responseData)[0];
            if (firstError) {
              errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
            }
          }
        } else if (error.message?.includes("400")) {
          errorMessage = `Bad Request: ${error.message || "Invalid data format"}`;
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }
    };

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting: formIsSubmitting },
      reset,
      setValue,
      watch,
      control,
    } = useForm<DealFormData>({
      resolver: zodResolver(
        createDealSchema(
          mode === "edit", 
          mode === "edit" && dealData ? Number(dealData.deal_value) : undefined
        )
      ),
    });

    // Watch form values to debug population and for real-time validation
    const watchedValues = watch();
    const [dealValue, payStatus, receivedAmount] = watch(['dealValue', 'payStatus', 'receivedAmount']);
    
    // Real-time validation feedback
    const getPaymentValidationMessage = () => {
      if (!dealValue || !receivedAmount || !payStatus) return null;
      
      const dealValueNum = parseFloat(dealValue);
      const receivedAmountNum = parseFloat(receivedAmount);
      
      if (isNaN(dealValueNum) || isNaN(receivedAmountNum)) return null;
      
      if (payStatus === "Full Pay") {
        if (Math.abs(dealValueNum - receivedAmountNum) > 0.01) {
          return {
            type: 'error',
            message: `For Full Pay, received amount must equal deal value (${dealValue})`
          };
        } else {
          return {
            type: 'success',
            message: 'Payment amount matches deal value ✓'
          };
        }
      } else if (payStatus === "Partial Pay") {
        if (receivedAmountNum >= dealValueNum) {
          return {
            type: 'error',
            message: `For Partial Pay, received amount must be less than deal value (${dealValue})`
          };
        } else if (receivedAmountNum > 0) {
          const percentage = ((receivedAmountNum / dealValueNum) * 100).toFixed(1);
          return {
            type: 'info',
            message: `Partial payment: ${percentage}% of deal value`
          };
        }
      }
      
      return null;
    };
    
    const validationMessage = getPaymentValidationMessage();

    useImperativeHandle(ref, () => ({
      resetForm: () => reset(),
    }));

    React.useEffect(() => {
      if (
        mode === "edit" &&
        dealData &&
        !isLoadingDeal &&
        clients &&
        clients.length > 0
      ) {
        // Always set the client name from deal data in edit mode
        const clientNameToSet = dealData.client?.client_name || "";

        setValue("dealId", dealData.deal_id);
        setValue("clientName", clientNameToSet);
        setValue("dealName", dealData.deal_name);
        setValue(
          "payStatus",
          dealData.pay_status === "full_payment" ? "Full Pay" : "Partial Pay"
        );
        setValue("sourceType", dealData.source_type);
        setValue("currency", dealData.currency || "USD");
        setValue("dealValue", dealData.deal_value?.toString() || "");
        setValue("dealDate", dealData.deal_date);
        setValue("dueDate", dealData.due_date);
        setValue("payMethod", dealData.payment_method);
        setValue(
          "dealRemarks",
          dealData.deal_remarks || dealData.deal_remarks || ""
        );
        setValue("paymentDate", dealData.payments?.[0]?.payment_date || "");
        setValue(
          "receivedAmount",
          dealData.payments?.[0]?.received_amount?.toString() || ""
        );
        setValue("chequeNumber", dealData.payments?.[0]?.cheque_number || "");
        setValue(
          "paymentRemarks",
          dealData.payments?.[0]?.payment_remarks || ""
        );

        // Handle uploadReceipt - create a FileList-like object for existing receipt
        if (dealData.payments?.[0]?.receipt_file) {
          // Create a mock FileList object for the existing file
          const mockFileList = {
            0: {
              name:
                dealData.payments[0].receipt_file.split("/").pop() ||
                "receipt.pdf",
              type: "application/pdf",
              size: 0,
              lastModified: Date.now(),
            },
            length: 1,
            item: (index: number) => mockFileList[index],
            [Symbol.iterator]: function* () {
              yield mockFileList[0];
            },
          } as unknown as FileList;

          setValue("uploadReceipt", mockFileList);
        }
      }
    }, [mode, dealData, isLoadingDeal, clients, dealId]);

    const mutation = useMutation({
      mutationFn: submitDealData,
      onSuccess: (data) => {
        console.log("✅ DEBUG: Deal created successfully:", data);
        console.log("✅ DEBUG: Deal ID:", data?.deal_id);
        console.log("✅ DEBUG: Payments in response:", data?.payments_read);
        console.log("✅ DEBUG: Number of payments:", data?.payments_read?.length || 0);
        
        if (data?.payments_read && data.payments_read.length > 0) {
          data.payments_read.forEach((payment: any, index: number) => {
            console.log(`✅ DEBUG: Payment ${index + 1}:`, {
              id: payment.id,
              amount: payment.received_amount,
              status: payment.status,
              transaction_id: payment.transaction_id
            });
          });
        } else {
          console.log("⚠️  DEBUG: No payments found in response!");
        }
        
        // Only invalidate queries if this is a standalone form (not in modal)
        // In modal, let DealModal handle cache updates for optimistic UI
        if (isStandalonePage) {
          queryClient.invalidateQueries({ queryKey: ["deals"] });
          queryClient.invalidateQueries({ queryKey: ["deals"], exact: false });
          toast.success(
            mode === "edit"
              ? "Deal updated successfully!"
              : "Deal created successfully!"
          );
          router.push("/salesperson/deal");
        } else {
          // In modal: just call onSave, modal will update cache
          if (onSave) {
            onSave(data as DealFormData);
          }
        }
      },
      // Show error toast on failure
      onError: (error: any) => {
        toast.error(
          error.message || `Failed to ${mode} deal. Please try again.`
        );
      },
    });

    const onSubmit = (data: DealFormData) => {
      mutation.mutate(data);
    };

    const handleClear = () => {
      if (mode === "edit") {
        // In edit mode, preserve payment fields and only clear deal fields
        const currentValues = watch();
        const paymentFields = {
          paymentDate: currentValues.paymentDate,
          receivedAmount: currentValues.receivedAmount,
          chequeNumber: currentValues.chequeNumber,
          uploadReceipt: currentValues.uploadReceipt,
          paymentRemarks: currentValues.paymentRemarks,
        };

        // Reset the form
        reset();

        // Restore payment fields
        setValue("paymentDate", paymentFields.paymentDate || "");
        setValue("receivedAmount", paymentFields.receivedAmount || "");
        setValue("chequeNumber", paymentFields.chequeNumber || "");
        setValue("uploadReceipt", paymentFields.uploadReceipt || null);
        setValue("paymentRemarks", paymentFields.paymentRemarks || "");

        toast.info("Deal fields cleared");
      } else {
        // In add mode, clear everything
        reset();
        toast.info("Form cleared");
      }
    };

    const dealLabelClass =
      "block text-[13px] font-semibold whitespace-nowrap text-black";
    const dealInputClass =
      "border border-[#C3C3CB] shadow-none focus:outline-none focus:border-[#C3C3CB] focus:ring-0";
    const dealWrapperClass = "mb-4";

    const isLoading =
      formIsSubmitting || mutation.isPending || isSubmitting || isLoadingDeal;

    // Show loading state when fetching deal data in edit mode
    if (mode === "edit" && isLoadingDeal) {
      return (
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="flex-1 p-6 pb-4 overflow-auto grid">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading deal data...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="h-full w-full flex flex-col overflow-hidden"
      >
        <div className="flex-1 p-6 pb-4 overflow-auto">
          <div className="flex flex-col gap-6 lg:gap-1 lg:flex-row">
            {/* Left section */}
            <div className="div1  w-full flex-1">
              <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 mb-0">
                <div className="w-full lg:w-[133px]">
                  {mode === "edit" ? (
                    <InputField
                      id="dealId"
                      label="Deal ID"
                      registration={register("dealId")}
                      error={errors.dealId}
                      placeholder={dealData?.deal_id || "Deal ID"}
                      width="w-full"
                      height="h-[48px]"
                      labelClassName={dealLabelClass}
                      inputClassName={dealInputClass}
                      wrapperClassName={dealWrapperClass}
                      disabled
                    />
                  ) : (
                    <InputField
                      id="dealId"
                      label="Deal ID"
                      registration={register("dealId")}
                      error={errors.dealId}
                      placeholder="Auto-generated"
                      width="w-full"
                      height="h-[48px]"
                      labelClassName={dealLabelClass}
                      inputClassName={dealInputClass}
                      wrapperClassName={dealWrapperClass}
                      disabled
                    />
                  )}
                </div>

                <div className="w-full lg:w-[240px]">
                  <label htmlFor="clientName" className={dealLabelClass}>
                    Client Name<span className="text-[#F61818]">*</span>
                  </label>
                  <Controller
                    name="clientName"
                    control={control}
                    render={({ field }) => {
                      let options =
                        clients?.map((client: Client) => ({
                          value: client.client_name,
                          label: client.client_name,
                        })) || [];

                      // In edit mode, ensure the current deal's client name is in the options
                      if (
                        mode === "edit" &&
                        dealData?.client?.client_name &&
                        !options.some(
                          (opt) => opt.value === dealData.client.client_name
                        )
                      ) {
                        options = [
                          {
                            value: dealData.client.client_name,
                            label: dealData.client.client_name + " (current)",
                          },
                          ...options,
                        ];
                      }

                      return (
                        <Combobox
                          options={options}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={
                            mode === "edit"
                              ? dealData?.client?.client_name || "Select Client"
                              : isLoadingClients
                              ? "Loading..."
                              : "Select Client"
                          }
                          searchPlaceholder="Search clients..."
                          emptyText="No clients found."
                          disabled={isLoadingClients || isLoading}
                          className="mt-1"
                        />
                      );
                    }}
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.clientName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5">
                <div className="w-full lg:w-[133px]">
                  <SelectField
                    id="payStatus"
                    label="Pay Status"
                    required
                    registration={register("payStatus")}
                    error={errors.payStatus}
                    placeholder="Select status"
                    width="w-full"
                    height="h-[48px]"
                    labelClassName={dealLabelClass}
                    selectClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading}
                    options={[
                      { value: "Full Pay", label: "Full Pay" },
                      { value: "Partial Pay", label: "Partial Pay" },
                    ]}
                  />
                </div>

                <div className="w-full lg:w-[240px]">
                  <SelectField
                    id="sourceType"
                    label="Source Type"
                    required
                    registration={register("sourceType")}
                    error={errors.sourceType}
                    placeholder="Select source"
                    width="w-full"
                    height="h-[48px]"
                    labelClassName={dealLabelClass}
                    selectClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading}
                    options={[
                      { value: "linkedin", label: "LinkedIn" },
                      { value: "instagram", label: "Instagram" },
                      { value: "google", label: "Google" },
                      { value: "referral", label: "Referral" },
                      { value: "others", label: "Others" },
                    ]}
                  />
                </div>
              </div>

              {/* Third row grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-x-52 lg:gap-0">
                <div>
                  <InputField
                    id="dealDate"
                    label="Deal Date"
                    required
                    registration={register("dealDate")}
                    error={errors.dealDate}
                    type="date"
                    width="w-full lg:w-[186px]"
                    height="h-[48px]"
                    labelClassName={dealLabelClass}
                    inputClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <InputField
                    id="dueDate"
                    label="Due Date"
                    required
                    registration={register("dueDate")}
                    error={errors.dueDate}
                    type="date"
                    width="w-full lg:w-[186px]"
                    height="h-[48px]"
                    labelClassName={dealLabelClass}
                    inputClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 pb-2 pt-2">
                  <SelectField
                    id="payMethod"
                    label="Payment Method"
                    required
                    registration={register("payMethod")}
                    error={errors.payMethod}
                    placeholder="Select payment method"
                    width="w-full lg:w-[392px]"
                    height="h-[48px]"
                    labelClassName={dealLabelClass}
                    selectClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading}
                    options={[
                      { value: "wallet", label: "Mobile Wallet" },
                      { value: "cash", label: "Cash" },
                      { value: "cheque", label: "Cheque" },
                      { value: "bank", label: "Bank Transfer" },
                    ]}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1">
                  <TextAreaField
                    id="dealRemarks"
                    label="Deal Remarks"
                    registration={register("dealRemarks")}
                    error={errors.dealRemarks}
                    width="w-full lg:w-[392px]"
                    height="h-[70px]"
                    labelClassName={dealLabelClass}
                    textareaClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    readOnly={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Middle section*/}
            <div className="div2 flex-1 flex-col gap-4 pb-1 pr-6 w-full">
              <InputField
                id="dealName"
                label="Deal Name"
                required
                registration={register("dealName")}
                error={errors.dealName}
                placeholder="Chat BoQ Project"
                width="w-full"
                height="h-[48px]"
                labelClassName={dealLabelClass}
                inputClassName={dealInputClass}
                wrapperClassName={dealWrapperClass}
                disabled={isLoading}
              />

              <div className={dealWrapperClass}>
                <label htmlFor="dealValue" className={dealLabelClass}>
                  Deal Value<span className="text-[#F61818]">*</span>
                </label>
                <div className="flex relative">
                  <Controller
                    name="currency"
                    control={control}
                    defaultValue="USD"
                    render={({ field }) => (
                      <div className="flex items-center  bg-gray-50 border border-[#C3C3CB] border-r-0 rounded-l-md text-sm font-medium text-gray-700 px-2">
                        {currencies.find((curr) => curr.code === field.value)
                          ?.code || "USD"}
                      </div>
                    )}
                  />
                  <div className="flex-1">
                    <input
                      id="dealValue"
                      type="text"
                      {...register("dealValue")}
                      placeholder="0.00"
                      className={`${dealInputClass} w-full h-[48px] border-l-0 border-r-0 rounded-none`}
                      disabled={isLoading}
                    />
                  </div>
                  <Controller
                    name="currency"
                    control={control}
                    defaultValue="USD"
                    render={({ field }) => (
                      <CurrencySelector
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading}
                      />
                    )}
                  />
                </div>
                {errors.dealValue && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dealValue.message}
                  </p>
                )}
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.currency.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-2">
                  Recent Activities
                </label>
                <div className="relative p-2 pt-5 border w-full h-[150px] lg:h-[285px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto">
                  {mode === "edit" && dealData?.activity_logs && (
                    <div className="flex flex-col ">
                      <div className="w-1 bg-[#465FFF] mr-2"></div>
                      {dealData.activity_logs.map((activityData: any) => (
                        <div key={activityData.id} className="mb-2">
                          <p className="font-medium">{activityData.message}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(activityData.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right section */}
            <div className="div3 w-full flex-1 md:w-3/4 lg:w-64 h-auto lg:h-[264px] flex flex-col">
              <div
                className="bg-[#DCFCE7] p-4 rounded-lg space-y-4 relative flex-grow"
                style={{
                  clipPath:
                    "polygon(0 0, calc(100% - 3rem) 0, 100% 3rem, 100% 100%, 0 100%)",
                }}
              >
                <h2 className="text-[#009959] font-medium text-[16px] mb-8">
                  First Payment
                </h2>
                <div className="flex-grow overflow-auto space-y-6">
                  <InputField
                    id="paymentDate"
                    label="Payment Date"
                    required
                    registration={register("paymentDate")}
                    error={errors.paymentDate}
                    type="date"
                    width="w-full"
                    height="h-[33px]"
                    labelClassName={dealLabelClass}
                    inputClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading || mode === "edit"}
                  />
                  <div className={dealWrapperClass}>
                    <label htmlFor="receivedAmount" className={dealLabelClass}>
                      Received Amount<span className="text-[#F61818]">*</span>
                    </label>
                    <div className="flex">
                      <div className="flex-1 flex relative">
                        <input
                          id="receivedAmount"
                          type="text"
                          {...register("receivedAmount")}
                          placeholder="0.00"
                          className={`${dealInputClass} w-full h-[33px] border-r-0 pl-2`}
                          disabled={isLoading || mode === "edit"}
                        />
                        <Controller
                          name="currency"
                          control={control}
                          defaultValue="USD"
                          render={({ field }) => (
                            <CurrencySelector
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isLoading || mode === "edit"}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {errors.receivedAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.receivedAmount.message}
                      </p>
                    )}
                    {!errors.receivedAmount && validationMessage && (
                      <p className={`mt-1 text-sm ${
                        validationMessage.type === 'error' ? 'text-red-600' :
                        validationMessage.type === 'success' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {validationMessage.message}
                      </p>
                    )}
                  </div>
                  <InputField
                    id="chequeNumber"
                    label="Cheque Number"
                    required
                    registration={register("chequeNumber")}
                    error={errors.chequeNumber}
                    placeholder="1234567"
                    width="w-full"
                    height="h-[33px]"
                    labelClassName={dealLabelClass}
                    inputClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    disabled={isLoading || mode === "edit"}
                  />

                  <div>
                    <label htmlFor="uploadReceipt" className={dealLabelClass}>
                      Upload Receipt<span className="text-[#F61818]">*</span>
                    </label>
                    <input
                      id="uploadReceipt"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      {...register("uploadReceipt")}
                      className="hidden"
                      disabled={isLoading || mode === "edit"}
                    />
                    <label
                      htmlFor="uploadReceipt"
                      className={`mt-1 flex items-center justify-between w-full h-[33px] p-2 text-[12px] font-normal bg-white ${
                        isLoading || mode === "edit"
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {mode === "edit" && dealData?.payments?.[0]?.receipt_file ? (
                        <a
                          href={dealData.payments[0].receipt_file.startsWith('http') 
                            ? dealData.payments[0].receipt_file 
                            : dealData.payments[0].receipt_file.replace(/\/media\/media\//, '/media/')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {dealData.payments[0].receipt_file.split("/").pop()}
                        </a>
                      ) : (
                        <span className="underline">
                          {watch("uploadReceipt")?.[0]?.name || "Upload Receipt"}
                        </span>
                      )}

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
                    {errors.uploadReceipt && (
                      <p className="mt-1 text-sm text-red-600">
                        {String(
                          errors.uploadReceipt.message || errors.uploadReceipt
                        )}
                      </p>
                    )}
                  </div>

                  <TextAreaField
                    id="paymentRemarks"
                    label="Payment Remarks"
                    required
                    registration={register("paymentRemarks")}
                    error={errors.paymentRemarks}
                    placeholder="Remarks here"
                    width="w-full"
                    height="h-[46px]"
                    labelClassName={dealLabelClass}
                    textareaClassName={dealInputClass}
                    wrapperClassName={dealWrapperClass}
                    readOnly={isLoading || mode === "edit"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-4 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 mt-auto">
          {mutation.isError && (
            <p className="text-red-600 text-sm mr-auto">
              Error submitting form. Please try again.
            </p>
          )}
          <Button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="bg-[#F61818] text-white w-[83px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold disabled:opacity-50"
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#009959] text-white w-[119px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold disabled:opacity-50"
          >
            {isLoading
              ? "Submitting..."
              : mode === "edit"
              ? "Update Deal"
              : "Save Deal"}
          </Button>
        </div>
      </form>
    );
  }
);

export default DealForm;