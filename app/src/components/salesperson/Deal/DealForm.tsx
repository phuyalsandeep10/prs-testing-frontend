"use client";

import React, { useImperativeHandle, forwardRef, useEffect, useState, useCallback, useRef } from "react";
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
import { apiClient } from "@/lib/api-client";
import { Client } from "@/types/deals";
import { toast } from "sonner";
import { normalizeFieldError, renderErrorMessage } from "@/utils/form-helpers";

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

  // Handle file upload separately with correct field name (only in add mode)
  if (data.uploadReceipt && data.uploadReceipt.length > 0 && mode !== "edit") {
    formData.append("payments[0][receipt_file]", data.uploadReceipt[0]);
    console.log("📎 Receipt file added:", data.uploadReceipt[0].name);
  } else if (data.uploadReceipt && data.uploadReceipt.length > 0 && mode === "edit") {
    console.log("🚫 Skipping receipt file upload in edit mode - payments not editable");
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
        } else if (paymentKeys.includes(key) && mode !== "edit") {
          // Only process payment fields in add mode
          const snakeKey =
            key === "payMethod" ? "payment_method" : toSnakeCase(key);
          paymentData[snakeKey] = value;
        }
      } else if (value === "" && dealKeys.includes(key)) {
        // Log empty values for deal fields
        console.log(`⚠️  Empty deal field: ${key}`);
      } else if (value === "" && paymentKeys.includes(key) && mode !== "edit") {
        // Log empty values for payment fields (only in add mode)
        console.log(`⚠️  Empty payment field: ${key}`);
      }
    }
  }

  // Append nested payment data with correct format (only in add mode)
  if (mode !== "edit") {
    for (const key in paymentData) {
      formData.append(`payments[0][${key}]`, paymentData[key]);
    }
  } else {
    console.log("🚫 Skipping payment data in edit mode - payments not editable");
  }

  // Add version field for edit mode
  if (mode === "edit") {
    formData.append("version", "edited");
    console.log("🔄 Version set to 'edited' for edit mode");
  }

  // Log FormData summary
  console.log("🚀 FormData prepared with", [...formData.keys()].length, "fields");
  console.log("📝 FormData fields:", [...formData.keys()]);
  
  if (mode === "edit") {
    console.log("✏️  Edit mode - only deal fields included, payment fields excluded");
  }

  return formData;
};

const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get<{ results: Client[] }>("/clients/");
    // Handle ApiResponse wrapper
    if (response && response.data) {
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    }
    return [];
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
      console.log(`🔍 Fetching deal data for ID: ${id}`);
      
      try {
        const response = await apiClient.get<any>(`/deals/deals/${id}/`);
        console.log(`✅ Raw API response:`, response);
        
        // The apiClient.get() returns ApiResponse<T>, so we need to access response.data
        if (!response || !response.data) {
          console.error(`❌ No data in API response`);
          throw new Error(`No data returned from API for deal ${id}`);
        }
        
        const dealData = response.data; // API client returns ApiResponse<T>
        console.log(`📋 Processing deal data:`, dealData);
        
        // Ensure we have required fields
        if (!dealData.deal_id) {
          console.error(`❌ Invalid deal data - missing deal_id`);
          throw new Error(`Invalid deal data received for ID ${id}`);
        }
        
        // Handle the case where deal_value is an object with amount property
        if (dealData.deal_value && typeof dealData.deal_value === 'object' && dealData.deal_value.amount) {
          console.log(`🔧 Converting deal_value object to amount:`, dealData.deal_value.amount);
          dealData.deal_value = dealData.deal_value.amount;
        }
        
        // Handle payments_read vs payments field mapping
        if (dealData.payments_read && !dealData.payments) {
          console.log(`🔧 Mapping payments_read to payments:`, dealData.payments_read.length, 'payments');
          dealData.payments = dealData.payments_read;
        }
        
        console.log(`✅ Processed deal data successfully:`, dealData);
        return dealData;
        
      } catch (error: any) {
        console.error(`❌ Error fetching deal data for ID ${id}:`, {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          details: error.details
        });
        
        // Re-throw with more context
        const errorMessage = error.response?.data?.message || error.message || `Failed to fetch deal ${id}`;
        throw new Error(errorMessage);
      }
    };

    const {
      data: dealData,
      isLoading: isLoadingDeal,
      error: dealError,
      refetch: refetchDeal,
      isError: isDealError,
      isSuccess: isDealSuccess,
    } = useQuery({
      queryKey: ["deal", dealId],
      queryFn: () => {
        console.log(`🚀 React Query calling fetchDealById for: ${dealId}`);
        return fetchDealById(dealId!);
      },
      enabled: mode === "edit" && !!dealId,
      retry: (failureCount, error: any) => {
        console.log(`🔄 React Query retry attempt ${failureCount} for deal ${dealId}:`, error?.message);
        // Don't retry on 404 errors
        if (error?.response?.status === 404) {
          console.log(`🚫 Not retrying 404 error for deal ${dealId}`);
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes

    });

    // Handle success and error callbacks using useEffect
    useEffect(() => {
      if (dealData && mode === "edit") {
        console.log(`✅ React Query onSuccess for deal ${dealId}:`, dealData);
      }
    }, [dealData, dealId, mode]);

    useEffect(() => {
      if (dealError && mode === "edit") {
        console.error(`❌ React Query onError for deal ${dealId}:`, dealError);
      }
    }, [dealError, dealId, mode]);

    // Debug logging for deal data
    useEffect(() => {
      if (mode === "edit") {
        console.log("🔍 Edit mode - Deal ID:", dealId);
        console.log("📊 Deal data loading:", isLoadingDeal);
        console.log("📊 Deal data:", dealData);
        console.log("📊 Deal data type:", typeof dealData);
        console.log("📊 Deal data keys:", dealData ? Object.keys(dealData) : 'no data');
        console.log("❌ Deal error:", dealError);
        console.log("❌ Deal error type:", typeof dealError);
        console.log("❌ Deal error message:", dealError?.message);
      }
    }, [mode, dealId, isLoadingDeal, dealData, dealError]);

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
        
        // The API client returns the response directly, not wrapped in .data
        const dealResult = dealResponse as any;

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
        
        // Check for error data in the error object itself or nested
        const responseData = error.details || error.response?.data || error;
        
        if (responseData) {
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
              } else if (paymentErrors?.received_amount) {
                errorMessage = Array.isArray(paymentErrors.received_amount) 
                  ? paymentErrors.received_amount[0] 
                  : paymentErrors.received_amount;
              } else {
                // Get first available error from payment
                const firstPaymentError = Object.values(paymentErrors)[0];
                if (firstPaymentError) {
                  errorMessage = Array.isArray(firstPaymentError) ? firstPaymentError[0] : firstPaymentError;
                }
              }
            } else if (typeof responseData.payments === 'string') {
              errorMessage = responseData.payments;
            }
          }
          // Handle standardized error response format
          else if (responseData.error && responseData.error.message) {
            errorMessage = responseData.error.message;
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
          } else if (error.message?.includes("400")) {
            errorMessage = `Bad Request: ${error.message || "Invalid data format"}`;
          } else if (error.message?.includes("timeout")) {
            errorMessage = "Request timed out. Please try again.";
          } else if (error.message) {
            errorMessage = error.message;
          }
        }

        throw new Error(errorMessage);
      }
    };

    // Fetch activity logs for edit mode (independent of main deal data)
    const { data: activityLogs, isLoading: isLoadingActivities, error: activityError } = useQuery({
      queryKey: ["deal-activities", dealId],
      queryFn: async () => {
        if (!dealId) return [];
        try {
          console.log(`🔍 Fetching activity logs for deal: ${dealId}`);
          const response = await apiClient.get(`/deals/deals/${dealId}/log-activity/`);
          console.log(`✅ Activity logs fetched:`, response.data);
          return response.data || [];
        } catch (error: any) {
          console.error(`❌ Failed to fetch activity logs for ${dealId}:`, error);
          // Don't throw - just return empty array to not block the form
          return [];
        }
      },
      enabled: mode === "edit" && !!dealId && !!dealData, // Only fetch after deal data is loaded
      retry: 1, // Only retry once for activity logs
      staleTime: 2 * 60 * 1000, // 2 minutes
    });

    // Debug activity logs
    useEffect(() => {
      if (mode === "edit" && dealId) {
        console.log(`📋 Activity logs state:`, {
          isLoading: isLoadingActivities,
          data: activityLogs,
          error: activityError,
          count: Array.isArray(activityLogs) ? activityLogs.length : 0
        });
      }
    }, [mode, dealId, isLoadingActivities, activityLogs, activityError]);

    // Unsaved changes tracking
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const initialFormValues = useRef<DealFormData | null>(null);

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
          mode === "edit" && dealData && typeof dealData === 'object' && 'deal_value' in dealData ? Number(dealData.deal_value) : undefined
        )
      ),
    });

    // Watch form values to debug population and for real-time validation
    const watchedValues = watch();
    
    // Track form changes for unsaved changes warning
    useEffect(() => {
      if (mode === "edit" && dealData && !initialFormValues.current) {
        // Store initial values after form is populated
        initialFormValues.current = watchedValues;
      }
    }, [mode, dealData, watchedValues]);

    // Check for unsaved changes
    useEffect(() => {
      if (mode === "edit" && initialFormValues.current) {
        const hasChanges = JSON.stringify(watchedValues) !== JSON.stringify(initialFormValues.current);
        setHasUnsavedChanges(hasChanges);
      }
    }, [watchedValues, mode]);

    // Unsaved changes warning
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges && !isNavigating) {
          e.preventDefault();
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
          return e.returnValue;
        }
      };

      const handlePopState = () => {
        if (hasUnsavedChanges && !isNavigating) {
          const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
          if (!confirmLeave) {
            // Prevent navigation by pushing current state back
            window.history.pushState(null, '', window.location.href);
          }
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          window.removeEventListener('popstate', handlePopState);
        };
      }
    }, [hasUnsavedChanges, isNavigating]);
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

    // Populate form with deal data in edit mode  
    React.useEffect(() => {
      if (
        mode === "edit" &&
        dealData &&
        !isLoadingDeal &&
        clients &&
        clients.length > 0
      ) {
        console.log("📋 Populating form with deal data:", dealData);
        console.log("📋 Deal data keys:", Object.keys(dealData));
        console.log("📋 Deal value type:", typeof dealData.deal_value, dealData.deal_value);
        console.log("📋 Activity logs in deal data:", Array.isArray(dealData.activity_logs) ? dealData.activity_logs.length : 0, 'activities');
        
        try {
          // Always set the client name from deal data in edit mode
          const clientNameToSet = dealData && typeof dealData === 'object' && 'client' in dealData && dealData.client && typeof dealData.client === 'object' && 'client_name' in dealData.client ? dealData.client.client_name : "";
          console.log("👤 Setting client name:", clientNameToSet);

          // Populate deal fields
          setValue("dealId", dealData && typeof dealData === 'object' && 'deal_id' in dealData ? dealData.deal_id : "");
          setValue("clientName", clientNameToSet);
          setValue("dealName", dealData && typeof dealData === 'object' && 'deal_name' in dealData ? dealData.deal_name : "");
          setValue(
            "payStatus",
            (dealData && typeof dealData === 'object' && 'pay_status' in dealData && dealData.pay_status === "full_payment") || 
            (dealData && typeof dealData === 'object' && 'payment_status' in dealData && dealData.payment_status === "full_payment") ? "Full Pay" : "Partial Pay"
          );
          setValue("sourceType", dealData && typeof dealData === 'object' && 'source_type' in dealData ? dealData.source_type : "");
          setValue("currency", dealData && typeof dealData === 'object' && 'currency' in dealData ? dealData.currency : "USD");
          
          // Handle deal_value which might be a string or an object with amount property
          let dealValue = "";
          if (dealData && typeof dealData === 'object' && 'deal_value' in dealData) {
            if (typeof dealData.deal_value === "string" || typeof dealData.deal_value === "number") {
              dealValue = dealData.deal_value.toString();
            } else if (dealData.deal_value && typeof dealData.deal_value === 'object' && 'amount' in dealData.deal_value && dealData.deal_value.amount) {
              dealValue = dealData.deal_value.amount.toString();
            }
          }
          setValue("dealValue", dealValue);
          
          setValue("dealDate", dealData && typeof dealData === 'object' && 'deal_date' in dealData ? dealData.deal_date : "");
          setValue("dueDate", dealData && typeof dealData === 'object' && 'due_date' in dealData ? dealData.due_date : "");
          setValue("payMethod", dealData && typeof dealData === 'object' && 'payment_method' in dealData ? dealData.payment_method : "");
          setValue("dealRemarks", dealData && typeof dealData === 'object' && 'deal_remarks' in dealData ? dealData.deal_remarks : "");
          
          // Populate payment fields if available (use first payment)
          const payments = (dealData && typeof dealData === 'object' && 'payments' in dealData && Array.isArray(dealData.payments) ? dealData.payments : []) || 
                          (dealData && typeof dealData === 'object' && 'payments_read' in dealData && Array.isArray(dealData.payments_read) ? dealData.payments_read : []);
          const paymentData = payments[0];
          console.log("💳 Payment data:", paymentData);
          console.log("💳 Total payments found:", payments.length);
          
          if (paymentData) {
            setValue("paymentDate", paymentData.payment_date || "");
            setValue("receivedAmount", paymentData.received_amount?.toString() || "");
            setValue("chequeNumber", paymentData.cheque_number || "");
            setValue("paymentRemarks", paymentData.payment_remarks || "");

            // Handle uploadReceipt - create a FileList-like object for existing receipt
            if (paymentData.receipt_file) {
              console.log("📄 Setting receipt file:", paymentData.receipt_file);
              // Create a mock FileList object for the existing file
              const mockFileList = {
                0: {
                  name: paymentData.receipt_file.split("/").pop() || "receipt.pdf",
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
          } else {
            console.log("⚠️ No payment data found");
            // Clear payment fields if no payment data
            setValue("paymentDate", "");
            setValue("receivedAmount", "");
            setValue("chequeNumber", "");
            setValue("paymentRemarks", "");
          }
          
          console.log("✅ Form populated successfully");
        } catch (error) {
          console.error("❌ Error populating form:", error);
          toast.error("Failed to load deal data. Please refresh the page.");
        }
      }
    }, [mode, dealData, isLoadingDeal, clients, dealId, setValue]);

    const mutation = useMutation({
      mutationFn: submitDealData,
      onSuccess: (data) => {
        // Clear unsaved changes flag on successful submission
        setHasUnsavedChanges(false);
        setIsNavigating(true);
        console.log("✅ DEBUG: Deal created successfully:", data);
        // The backend response should have deal_id, but data is DealFormData
        // We need to check the actual API response
        console.log("✅ DEBUG: Response structure:", Object.keys(data || {}));
        
        // The backend returns basic deal info, not full payment details
        // We'll rely on cache invalidation to refresh the deals list
        // Note: deal_id comes from the API response, not the form data
        
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
      // Clear unsaved changes warning when submitting
      setIsNavigating(true);
      mutation.mutate(data);
    };

    const handleClear = () => {
      const confirmClear = hasUnsavedChanges 
        ? window.confirm('You have unsaved changes. Are you sure you want to clear the form?')
        : true;
      
      if (!confirmClear) return;
      
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

        setHasUnsavedChanges(false);
        toast.info("Deal fields cleared");
      } else {
        // In add mode, clear everything
        reset();
        setHasUnsavedChanges(false);
        toast.info("Form cleared");
      }
    };

    // Handle cancel with unsaved changes check
    const handleCancel = () => {
      if (hasUnsavedChanges) {
        const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
        if (!confirmLeave) return;
      }
      
      setIsNavigating(true);
      setHasUnsavedChanges(false);
      
      if (onCancel) {
        onCancel();
      } else if (isStandalonePage) {
        router.push('/salesperson/deal');
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
                <p className="text-sm text-gray-500 mt-2">Deal ID: {dealId}</p>
                <p className="text-xs text-gray-400 mt-1">Please wait while we fetch the deal information</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show error state when deal data fetching fails
    if (mode === "edit" && (dealError || (isDealError && !isLoadingDeal))) {
      return (
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="flex-1 p-6 pb-4 overflow-auto grid">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">❌</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Deal</h3>
                <p className="text-gray-600 mb-4">Could not fetch deal data for ID: {dealId}</p>
                <p className="text-sm text-red-600 mb-4">{dealError?.message || 'Unknown error occurred'}</p>
                <div className="space-x-4">
                  <button 
                    onClick={async () => {
                      console.log('🔄 Manual retry button clicked');
                      try {
                        const result = await refetchDeal();
                        console.log('🔄 Manual refetch result:', result);
                      } catch (error) {
                        console.error('🔄 Manual refetch failed:', error);
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={async () => {
                      console.log('🔍 Testing direct API call');
                      try {
                        const directResult = await fetchDealById(dealId!);
                        console.log('🔍 Direct API call result:', directResult);
                        toast.success('Direct API call succeeded! Check console.');
                      } catch (error) {
                        console.error('🔍 Direct API call failed:', error);
                        toast.error('Direct API call failed! Check console.');
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    Test API
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Refresh Page
                  </button>
                  <button 
                    onClick={() => router.push('/salesperson/deal')}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Back to Deals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show message when no deal data is found
    if (mode === "edit" && !isLoadingDeal && !dealData && !dealError) {
      return (
        <div className="h-full w-full flex flex-col overflow-hidden">
          <div className="flex-1 p-6 pb-4 overflow-auto grid">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📜</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Deal Not Found</h3>
                <p className="text-gray-600 mb-4">No deal found with ID: {dealId}</p>
                <button 
                  onClick={() => router.push('/salesperson/deal')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Back to Deals
                </button>
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
                      error={normalizeFieldError(errors.dealId)}
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
                      error={normalizeFieldError(errors.dealId)}
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
                      {renderErrorMessage(errors.clientName)}
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
                    error={normalizeFieldError(errors.payStatus)}
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
                    error={normalizeFieldError(errors.sourceType)}
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
                    error={normalizeFieldError(errors.dealDate)}
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
                    error={normalizeFieldError(errors.dueDate)}
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
                    error={normalizeFieldError(errors.payMethod)}
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
                    error={normalizeFieldError(errors.dealRemarks)}
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
                error={normalizeFieldError(errors.dealName)}
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
                    {renderErrorMessage(errors.dealValue)}
                  </p>
                )}
                {errors.currency && (
                  <p className="mt-1 text-sm text-red-600">
                    {renderErrorMessage(errors.currency)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-2">
                  Recent Activities
                </label>
                <div className="relative p-2 pt-5 border w-full h-[150px] lg:h-[285px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto">
                  {mode === "edit" ? (
                    (() => {
                      // Try to get activities from deal data first, then from separate query
                      const activitiesFromDeal = Array.isArray(dealData?.activity_logs) ? dealData.activity_logs : [];
                      const activitiesFromQuery = Array.isArray(activityLogs) ? activityLogs : [];
                      const allActivities = activitiesFromQuery.length > 0 ? activitiesFromQuery : activitiesFromDeal;
                      
                      if (isLoadingActivities && activitiesFromDeal.length === 0) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-500">Loading activities...</span>
                          </div>
                        );
                      }
                      
                      if (activityError && activitiesFromDeal.length === 0) {
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <p className="text-orange-500 text-sm mb-2">⚠️ Could not load recent activities</p>
                              <p className="text-gray-400 text-xs">Activity logs endpoint is currently unavailable</p>
                            </div>
                          </div>
                        );
                      }
                      
                      if (allActivities.length > 0) {
                        return (
                          <div className="space-y-3">
                            {allActivities.map((activity: any, index: number) => (
                              <div key={activity.id || index} className="border-l-2 border-blue-500 pl-3 pb-2">
                                <p className="font-medium text-gray-800">
                                  {activity.description || activity.message || activity.action || 'Activity logged'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {activity.timestamp 
                                    ? new Date(activity.timestamp).toLocaleString()
                                    : activity.created_at 
                                    ? new Date(activity.created_at).toLocaleString()
                                    : 'Unknown time'
                                  }
                                </p>
                                {(activity.user && typeof activity.user === 'object') ? (
                                  <p className="text-xs text-gray-600 mt-1">
                                    by {activity.user.first_name || activity.user.username || 'Unknown user'}
                                  </p>
                                ) : activity.user && typeof activity.user === 'string' ? (
                                  <p className="text-xs text-gray-600 mt-1">
                                    by {activity.user}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-gray-500">No recent activities found</p>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Recent activities will appear here after deal creation</p>
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
                    error={normalizeFieldError(errors.paymentDate)}
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
                        {renderErrorMessage(errors.receivedAmount)}
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
                    error={normalizeFieldError(errors.chequeNumber)}
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
                      <div className="flex flex-col w-full">
                        {mode === "edit" && dealData?.payments?.[0]?.receipt_file && (
                          <div className="flex items-center justify-between">
                            <a
                              href={dealData.payments[0].receipt_file.startsWith('http') 
                                ? dealData.payments[0].receipt_file 
                                : dealData.payments[0].receipt_file.replace(/\/media\/media\//, '/media/')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-xs"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Current: {dealData.payments[0].receipt_file.split("/").pop()}
                            </a>
                          </div>
                        )}
                        <span className="underline">
                          {watch("uploadReceipt")?.[0]?.name || (mode === "edit" ? "Upload New Receipt" : "Upload Receipt")}
                        </span>
                      </div>

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
                    error={normalizeFieldError(errors.paymentRemarks)}
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
        <div className="flex justify-between gap-4 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 mt-auto">
          {/* Left side - Status indicators */}
          <div className="flex items-center gap-4">
            {hasUnsavedChanges && (
              <div className="flex items-center text-orange-100 text-sm">
                <div className="w-2 h-2 bg-orange-300 rounded-full mr-2 animate-pulse"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            
            {mutation.isError && (
              <p className="text-red-200 text-sm">
                Error submitting form. Please try again.
              </p>
            )}
          </div>

          {/* Right side - Action buttons */}
          <div className="flex gap-4">
            {/* Cancel button for standalone pages */}
            {isStandalonePage && (
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 h-[40px] rounded-[6px] text-[14px] font-semibold disabled:opacity-50 transition-colors"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="bg-[#F61818] hover:bg-red-700 text-white w-[83px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold disabled:opacity-50 transition-colors"
            >
              Clear
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#009959] hover:bg-green-700 text-white w-[119px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold disabled:opacity-50 transition-colors"
            >
              {isLoading
                ? "Submitting..."
                : mode === "edit"
                ? "Update Deal"
                : "Save Deal"}
            </Button>
          </div>
        </div>
      </form>
    );
  }
);

export default DealForm;