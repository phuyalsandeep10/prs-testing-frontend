"use client";

import React, { useImperativeHandle, forwardRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, usePathname } from "next/navigation";
import { DealSchema } from "./DealSchema";
import InputField from "@/components/ui/clientForm/InputField";
import SelectField from "@/components/ui/clientForm/SelectField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import Button from "@/components/ui/clientForm/Button";
import { useClients, useCreateDeal } from "@/hooks/api";
import { Client } from "@/types/deals";

type DealFormData = z.infer<typeof DealSchema>;

// Using standardized hooks - no manual API functions needed

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
    const isStandalonePage =
      pathname?.includes("/add") || pathname?.includes("/edit");

    // Use standardized hooks
    const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useClients();
    const createDealMutation = useCreateDeal();

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

    const onSubmit = async (data: DealFormData) => {
      try {
        const dealData = {
          client: data.clientName,
          deal_amount: parseFloat(data.dealValue.replace(/[$,]/g, '')),
          deal_type: data.sourceType,
          deal_details: data.dealRemarks,
          expected_closing_date: data.dueDate,
        };

        await createDealMutation.mutateAsync(dealData);
        
        // Show success message
        if (typeof window !== "undefined" && window.alert) {
          window.alert("Deal created successfully!");
        }
        
        reset();
        
        if (onSave) {
          onSave(data);
        } else if (isStandalonePage) {
          router.push("/salesperson/deal");
        }
      } catch (error: any) {
        console.error("Failed to create deal:", error);
        
        // Show error message
        if (typeof window !== "undefined" && window.alert) {
          window.alert(`Failed to create deal: ${error.message || "Unknown error"}`);
        }
      }
    };

    const dealLabelClass =
      "block text-[13px] font-semibold whitespace-nowrap text-black";
    const dealInputClass =
      "border border-[#C3C3CB] shadow-none focus:outline-none focus:border-[#C3C3CB] focus:ring-0";
    const dealWrapperClass = "mb-4";

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
                      options={
                        clients && Array.isArray(clients)
                          ? clients.map((c) => ({
                              value: c.client_name,
                              label: c.client_name,
                            }))
                          : []
                      }
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
          {createDealMutation.isError && (
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
            disabled={createDealMutation.isPending}
            className="bg-[#009959] text-white w-[119px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
            onClick={handleSubmit(onSubmit)}
          >
            {createDealMutation.isPending ? "Submitting..." : "Save Deal"}
          </Button>
        </div>
      </div>
    );
  }
);

export default DealForm;