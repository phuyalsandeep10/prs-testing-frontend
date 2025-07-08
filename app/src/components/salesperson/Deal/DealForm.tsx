"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { DealSchema } from "./DealSchema";
import InputField from "@/components/ui/clientForm/InputField";
import SelectField from "@/components/ui/clientForm/SelectField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import Button from "@/components/ui/clientForm/Button";
import { apiClient } from "@/lib/api";
import { Client } from "@/types/deals";

type DealFormData = z.infer<typeof DealSchema>;

<<<<<<< HEAD
// Removed toSnakeCase function as it's no longer needed

// Removed transformDataForApi function as we now handle data transformation directly in submitDealData

const fetchClients = async (): Promise<Client[]> => {
  try {
    // Try to fetch from deals endpoint first (backend manages clients through deals)
    const response = await apiClient.get<Client[]>("/deals/");
    console.log("Fetched clients from /deals/:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    // Fallback to empty array if API fails
    return [];
  }
};

const submitDealData = async (data: DealFormData, clientsData?: Client[]) => {
  try {
    // Check if client already exists
    let clientId: string | null = null;
    
    // Find existing client by name
    if (clientsData && clientsData.length > 0) {
      const existingClient = clientsData.find(c => c.client_name === data.clientName);
      if (existingClient) {
        clientId = existingClient.id;
      }
    }

    // Step 1: Create or update the client/deal
    // Backend expects form data, not JSON
    console.log("Creating client form data with:", data);
    
    const clientFormData = new FormData();
    clientFormData.append("client_name", data.clientName);
    clientFormData.append("email", `${data.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`);
    clientFormData.append("phone_number", "+977-9841234567"); // Default phone number
    clientFormData.append("value", data.dealValue);
    clientFormData.append("status", data.payStatus === "Full Pay" ? "active" : "pending");
    clientFormData.append("satisfaction", "neutral");
    clientFormData.append("category", "occasional");
    clientFormData.append("remarks", data.dealRemarks || "");
    clientFormData.append("expected_close", data.dueDate);
    clientFormData.append("last_contact", new Date().toISOString());
    
    // Add deal-specific fields
    clientFormData.append("deal_name", data.dealName);
    clientFormData.append("source_type", data.sourceType);
    clientFormData.append("deal_date", data.dealDate);
    clientFormData.append("due_date", data.dueDate);

    // Debug: log form data contents
    console.log("Client form data contents:");
    for (const [key, value] of clientFormData.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    let clientResponse;
    if (clientId) {
      // Update existing client
      console.log(`Updating existing client ${clientId} with form data...`);
      clientResponse = await apiClient.putMultipart(`/deals/${clientId}/`, clientFormData);
    } else {
      // Create new client  
      console.log("Creating new client with form data...");
      clientResponse = await apiClient.postMultipart("/deals/", clientFormData);
    }
    
    console.log("Client API response:", clientResponse);
    
    if (!clientResponse.success || !clientResponse.data) {
      throw new Error("Failed to save deal");
    }

    const savedClient = clientResponse.data as any;

    // Step 2: Create the payment
    const paymentData = {
      client: savedClient.id,
      amount: parseFloat(data.receivedAmount),
      currency: "NPR", 
      payment_method: data.payMethod,
      sequence_number: 1,
    };

    // Create FormData for payment with file upload
    const paymentFormData = new FormData();
    for (const [key, value] of Object.entries(paymentData)) {
      paymentFormData.append(key, value.toString());
    }

    // Add payment remarks if provided
    if (data.paymentRemarks) {
      paymentFormData.append("remarks", data.paymentRemarks);
    }

    // Add the receipt file if provided
    if (data.uploadReceipt && data.uploadReceipt.length > 0) {
      paymentFormData.append("receipt_file", data.uploadReceipt[0]);
    }

    const paymentResponse = await apiClient.postMultipart("/payments/", paymentFormData);
    
    if (!paymentResponse.success) {
      console.warn("Payment creation failed:", paymentResponse);
      // Don't throw error for payment failure, just log it
    }

    return {
      deal: savedClient,
      payment: paymentResponse.data,
    };
  } catch (error) {
    console.error("Error in submitDealData:", error);
    throw error;
  }
=======
const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformDataForApi = (data: DealFormData) => {
  const formData = new FormData();
  const paymentData: { [key: string]: any } = {};

  // Handle file upload separately
  if (data.uploadReceipt && data.uploadReceipt.length > 0) {
    formData.append("payments[0]receipt_file", data.uploadReceipt[0]);
  }

  const dealKeys = [
    "clientName",
    "dealName",
    "payStatus",
    "sourceType",
    "dealValue",
    "dealDate",
    "dueDate",
    "dealRemarks",
  ];
  const paymentKeys = [
    "paymentDate",
    "receivedAmount",
    "chequeNumber",
    "payMethod",
    "paymentRemarks",
  ];

  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      key !== "uploadReceipt"
    ) {
      const value = (data as any)[key];
      if (value !== undefined && value !== null && value !== "") {
        if (dealKeys.includes(key)) {
          const snakeKey = toSnakeCase(key);
          const apiValue =
            key === "payStatus"
              ? value === "Full Pay"
                ? "full_payment"
                : "partial_payment"
              : value;
          formData.append(snakeKey, apiValue);
        } else if (paymentKeys.includes(key)) {
          const snakeKey =
            key === "payMethod" ? "payment_method" : toSnakeCase(key);
          paymentData[snakeKey] = value;
        }
      }
    }
  }

  // Append nested payment data
  for (const key in paymentData) {
    formData.append(`payments[0]${key}`, paymentData[key]);
  }

  return formData;
};

const fetchClients = async (): Promise<Client[]> => {
  const response = await apiClient.get<Client[]>("/clients/");
  return response.data || [];
};

const submitDealData = async (data: DealFormData) => {
  const formData = transformDataForApi(data);
  const response = await apiClient.postMultipart("/deals/", formData);
  return response.data;
>>>>>>> Nishreyta
};

interface DealFormProps {
  onSave?: (data: DealFormData) => void;
  onCancel?: () => void;
  mode?: "add" | "edit";
}

export interface DealFormHandle {
  resetForm: () => void;
}

const DealForm = forwardRef<DealFormHandle, DealFormProps>(
  ({ onSave, onCancel, mode = "add" }, ref) => {
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const isStandalonePage =
      pathname?.includes("/add") || pathname?.includes("/edit");

<<<<<<< HEAD
    const { data: clients, isLoading: isLoadingClients, error: clientsError } = useQuery<Client[]>({
=======
    const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
>>>>>>> Nishreyta
      queryKey: ["clients"],
      queryFn: fetchClients,
    });

<<<<<<< HEAD
    // Debug logging
    console.log("Clients query state:", {
      clients,
      isLoadingClients,
      clientsError,
      clientsCount: clients?.length || 0,
    });

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      setValue,
      watch,
    } = useForm<DealFormData>({
      resolver: zodResolver(DealSchema),
    });

    useImperativeHandle(ref, () => ({
      resetForm: () => reset(),
    }));

      const mutation = useMutation({
    mutationFn: (data: DealFormData) => submitDealData(data, clients),
    onSuccess: (data) => {
      console.log("Deal created successfully", data);
      reset();
      
      // Invalidate all deal-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      // Show success message
      if (typeof window !== "undefined" && window.alert) {
        window.alert("Deal created successfully!");
      }
      
      if (onSave) {
        onSave(data as DealFormData);
      } else if (isStandalonePage) {
        router.push("/salesperson/deal");
      }
    },
    onError: (error: any) => {
      console.error("Failed to create deal:", error);
      
      // Show error message
      if (typeof window !== "undefined" && window.alert) {
        window.alert(`Failed to create deal: ${error.message || "Unknown error"}`);
      }
    },
  });

    const onSubmit = (data: DealFormData) => {
      mutation.mutate(data);
    };

    const dealLabelClass =
      "block text-[13px] font-semibold whitespace-nowrap text-black";
    const dealInputClass =
      "border border-[#C3C3CB] shadow-none focus:outline-none focus:border-[#C3C3CB] focus:ring-0";
    const dealWrapperClass = "mb-4";

=======
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      setValue,
      watch,
    } = useForm<DealFormData>({
      resolver: zodResolver(DealSchema),
    });

    useImperativeHandle(ref, () => ({
      resetForm: () => reset(),
    }));

    const mutation = useMutation({
      mutationFn: submitDealData,
      onSuccess: (data) => {
        console.log("Deal created successfully", data);
        reset();
        queryClient.invalidateQueries({ queryKey: ["deals"] });
        if (onSave) {
          onSave(data as DealFormData);
        } else if (isStandalonePage) {
          router.push("/salesperson/deal");
        }
      },
      onError: (error: any) => {
        console.error("Failed to create deal:", error);
      },
    });

    const onSubmit = (data: DealFormData) => {
      mutation.mutate(data);
    };

    const dealLabelClass =
      "block text-[13px] font-semibold whitespace-nowrap text-black";
    const dealInputClass =
      "border border-[#C3C3CB] shadow-none focus:outline-none focus:border-[#C3C3CB] focus:ring-0";
    const dealWrapperClass = "mb-4";

>>>>>>> Nishreyta
    return (
      <div className="h-full w-full flex flex-col">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 overflow-auto">
            <div className="flex flex-col gap-6 lg:gap-1 lg:flex-row p-6">
              {/* Left section */}
              <div className="div1 space-y-3 w-full flex-1">
                <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 mb-2">
                  <div className="w-full lg:w-[133px]">
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
                  </div>

                  <div className="w-full lg:w-[240px]">
                    <SelectField
                      id="clientName"
                      label="Client Name"
                      required
                      registration={register("clientName")}
                      error={errors.clientName}
                      placeholder="Select Client"
                      width="w-full"
                      height="h-[48px]"
                      labelClassName={dealLabelClass}
                      selectClassName={dealInputClass}
                      wrapperClassName={dealWrapperClass}
                      disabled={isLoadingClients}
<<<<<<< HEAD
                      options={(() => {
                        if (isLoadingClients) {
                          return [{ value: "", label: "Loading clients..." }];
                        }
                        
                        const options = clients && Array.isArray(clients)
                          ? clients.map((c) => {
                              console.log("Client data:", c);
                              return {
                                value: c.client_name || c.id,
                                label: c.client_name || c.id,
                              };
                            })
                          : [];
                        
                        console.log("Generated dropdown options:", options);
                        
                        if (options.length === 0) {
                          return [{ value: "", label: "No clients found" }];
                        }
                        
                        return options;
                      })()}
=======
                      options={
                        clients && Array.isArray(clients)
                          ? clients.map((c) => ({
                              value: c.client_name,
                              label: c.client_name,
                            }))
                          : []
                      }
>>>>>>> Nishreyta
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 pb-1">
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
                      options={[
<<<<<<< HEAD
                        { value: "Mobile Wallet", label: "Mobile Wallet" },
                        { value: "Bank Transfer", label: "Bank Transfer" },
                        { value: "QR Payment", label: "QR Payment" },
                        { value: "Credit Card", label: "Credit Card" },
                        { value: "Cash", label: "Cash" },
=======
                        { value: "wallet", label: "Mobile Wallet" },
                        { value: "cash", label: "Cash" },
                        { value: "cheque", label: "Cheque" },
                        { value: "bank", label: "Bank Transfer" },
>>>>>>> Nishreyta
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
                />

                <InputField
                  id="dealValue"
                  label="Deal Value"
                  required
                  registration={register("dealValue")}
                  error={errors.dealValue}
                  placeholder="Nrs. 250,000"
                  width="w-full"
                  height="h-[48px]"
                  labelClassName={dealLabelClass}
                  inputClassName={dealInputClass}
                  wrapperClassName={dealWrapperClass}
                />

                <div>
                  <label className="block text-[13px] font-semibold mb-2">
                    Recent Activities
                  </label>
                  <div className="relative p-2 pt-5 border w-full h-[150px] lg:h-[285px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto">
                    {mode === "edit" && (
                      <div className="flex border border-[#EDEEEFEF]">
                        <div className="w-1 bg-[#465FFF] mr-2"></div>
                        <div>
                          <p className="text-[12px] text-black">
                            Changes done due date in DLID3421.
                          </p>
                          <p className="text-[12px] text-[#7E7E7E]">
                            Jan 02, 2020
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right section */}
              <div className="div3 w-full flex-1 md:w-3/4 lg:w-64 h-auto lg:h-[272px] flex flex-col">
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
                  <div className="flex-grow overflow-y-auto space-y-6 h-[400px]">
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
                    />
                    <InputField
                      id="receivedAmount"
                      label="Received Amount"
                      required
                      registration={register("receivedAmount")}
                      error={errors.receivedAmount}
                      placeholder="Enter Amount"
                      width="w-full"
                      height="h-[33px]"
                      labelClassName={dealLabelClass}
                      inputClassName={dealInputClass}
                      wrapperClassName={dealWrapperClass}
                    />
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
                    />

                    <div>
                      <label htmlFor="uploadReceipt" className={dealLabelClass}>
                        Upload Receipt<span className="text-[#F61818]">*</span>
                      </label>
                      <input
                        id="uploadReceipt"
                        type="file"
                        accept=".pdf"
                        {...register("uploadReceipt", {
                          validate: {
                            required: (fileList) =>
                              fileList?.length > 0 ||
                              "Upload Receipt is required",
                            isPdf: (fileList) =>
                              fileList?.[0]?.name
                                ?.toLowerCase()
                                .endsWith(".pdf") ||
                              "Only PDF files are allowed",
                          },
                        })}
                        className="hidden"
                      />
                      <label
                        htmlFor="uploadReceipt"
                        className="mt-1 flex items-center justify-between w-full h-[33px] p-2 text-[12px] font-normal border rounded-[6px] border-[#C3C3CB] cursor-pointer bg-white"
                      >
                        <span className="underline">
                          {watch("uploadReceipt")?.[0]?.name ||
                            "Upload Receipt"}
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
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Fixed bottom button container */}
        <div className="flex-shrink-0 flex justify-end gap-4 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4">
          {mutation.isError && (
            <p className="text-red-600 text-sm mr-auto">
              Error submitting form. Please try again.
            </p>
          )}
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-[#F61818] text-white w-[83px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
          >
            Clear
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#009959] text-white w-[119px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Submitting..." : "Save Deal"}
          </Button>
        </div>
      </div>
    );
  }
);

export default DealForm;