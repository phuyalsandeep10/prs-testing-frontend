"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { DealSchema } from "../Deal/DealSchema";

type DealFormData = z.infer<typeof DealSchema>;

const submitDealData = async (data: DealFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: "Deal data submitted successfully" };
};

const DealForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DealFormData>({
    resolver: zodResolver(DealSchema),
  });

  const mutation = useMutation({
    mutationFn: submitDealData,
    onSuccess: (response: { success: boolean, message: string }) => {
      console.log(response.message);
      reset();
    },
    onError: (error: Error) => {
      console.error("Submission failed:", error);
    },
  });

  const onSubmit = async (data: DealFormData) => {
    mutation.mutate(data);
  };

  const handleClear = () => {
    reset();
  };

  return (
    <div className="max-w-5xl mx-auto pt-6 bg-white rounded-lg shadow-md pl-4 sm:pl-6 md:pl-8 lg:pl-10 pr-4 sm:pr-6 md:pr-6 lg:pr-6">
      <h2 className="text-[20px] font-bold mb-6 text-[#465FFF] flex items-center justify-between pr-6 pb-3">
        ADD DEAL
        <svg
          className="mt-2 -mr-4"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 8.5858L12.8284 5.75736L14.2426 7.17157L11.4142 10L14.2426 12.8284L12.8284 14.2426L10 11.4142L7.17157 14.2426L5.75736 12.8284L8.5858 10L5.75736 7.17157L7.17157 5.75736L10 8.5858Z"
            fill="#A9A9A9"
          />
        </svg>
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="div1">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 mb-4">
                <div className="w-full lg:w-[133px]">
                  <label
                    htmlFor="dealId"
                    className="block text-[13px] font-semibold"
                  >
                    Deal ID<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="dealId"
                    type="text"
                    {...register("dealId")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="DLID3421"
                  />
                  {errors.dealId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dealId.message}
                    </p>
                  )}
                </div>

                <div className="w-full lg:w-[240px]">
                  <label
                    htmlFor="clientName"
                    className="block text-[13px] font-semibold"
                  >
                    Client Name<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="clientName"
                    type="text"
                    {...register("clientName")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="Enter Client Name"
                  />
                  {errors.clientName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.clientName.message}
                    </p>
                  )}
                </div>

                <div className="w-full lg:w-[252px]">
                  <label
                    htmlFor="dealName"
                    className="block text-[13px] font-semibold"
                  >
                    Deal Name<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="dealName"
                    type="text"
                    {...register("dealName")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="Chat BoQ Project"
                  />
                  {errors.dealName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dealName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 lg:flex-row lg:gap-5 pb-2">
                <div className="w-full lg:w-[133px]">
                  <label
                    htmlFor="payStatus"
                    className="block text-[13px] font-semibold"
                  >
                    Pay Status<span className="text-[#F61818]">*</span>
                  </label>
                  <select
                    id="payStatus"
                    {...register("payStatus")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none bg-white"
                  >
                    <option value="">Select status</option>
                    <option value="Full Pay">Full Pay</option>
                    <option value="Partial Pay">Partial Pay</option>
                  </select>
                  {errors.payStatus && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.payStatus.message}
                    </p>
                  )}
                </div>

                <div className="w-full lg:w-[240px]">
                  <label
                    htmlFor="sourceType"
                    className="block text-[13px] font-semibold"
                  >
                    Source Type<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="sourceType"
                    type="text"
                    {...register("sourceType")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="Client Source"
                  />
                  {errors.sourceType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.sourceType.message}
                    </p>
                  )}
                </div>

                <div className="w-full lg:w-[252px]">
                  <label
                    htmlFor="dealValue"
                    className="block text-[13px] font-semibold"
                  >
                    Deal Value<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="dealValue"
                    type="text"
                    {...register("dealValue")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="Nrs. 250,000"
                  />
                  {errors.dealValue && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dealValue.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-0">
                {/* Deal Date */}
                <div className="col-span-1 row-span-1">
                  <label
                    htmlFor="dealDate"
                    className="block text-[13px] font-semibold"
                  >
                    Deal Date<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="dealDate"
                    type="date"
                    {...register("dealDate")}
                    className="mt-1 block w-full lg:w-[186px] p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                  />
                  {errors.dealDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dealDate.message}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="col-span-1 row-span-1 lg:-ml-5">
                  <label
                    htmlFor="dueDate"
                    className="block text-[13px] font-semibold"
                  >
                    Due Date<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="dueDate"
                    type="date"
                    {...register("dueDate")}
                    className="mt-1 block w-full lg:w-[186px] p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none"
                  />
                  {errors.dueDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dueDate.message}
                    </p>
                  )}
                </div>

                {/* Recent Activities - spans all 3 rows */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-1 lg:row-span-3 w-full">
                  <label className="block text-[13px] font-semibold mb-2 lg:-ml-8">
                    Recent Activities
                  </label>
                  <div className="relative p-2 pt-5 border w-full lg:w-[252px] h-[150px] sm:h-[150px] lg:h-[227px] rounded-[6px] border-[#C3C3CB] text-[12px] text-gray-600 overflow-auto lg:-ml-8">
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
                  </div>
                </div>

                {/* Payment Method */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1 pb-2 pt-2">
                  <label
                    htmlFor="payMethod"
                    className="block text-[13px] font-semibold"
                  >
                    Payment Method<span className="text-[#F61818]">*</span>
                  </label>
                  <select
                    id="payMethod"
                    {...register("payMethod")}
                    className="mt-1 block w-full lg:w-[392px] p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none bg-white"
                  >
                    <option value="">Select payment method</option>
                    <option value="Mobile Wallet">Mobile Wallet</option>
                    <option value="Cash">Cash</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                  {errors.payMethod && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.payMethod.message}
                    </p>
                  )}
                </div>

                {/* Deal Remarks */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-2 row-span-1">
                  <label
                    htmlFor="dealRemarks"
                    className="block text-[13px] font-semibold"
                  >
                    Deal Remarks
                  </label>
                  <textarea
                    id="dealRemarks"
                    {...register("dealRemarks")}
                    className="mt-1 p-2 block w-full lg:w-[392px] border rounded-[6px] h-[80px] sm:h-[80px] lg:h-[70px] text-[12px] font-normal border-[#C3C3CB] resize-none outline-none"
                  />
                  {errors.dealRemarks && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dealRemarks.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="div2 w-full sm:w-full md:w-3/4 lg:w-64 h-auto min-h-[210px] lg:h-[210px] flex flex-col ">
            <div
              className="bg-[#DCFCE7] p-4 rounded-lg space-y-4 relative flex-grow "
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 3rem) 0, 100% 3rem, 100% 100%, 0 100%)",
              }}
            >
              <h2 className="text-[#009959] font-medium text-[16px]">
                First Payment
              </h2>
              <div className="flex-grow overflow-auto space-y-4">
                <div>
                  <label
                    htmlFor="paymentDate"
                    className="block text-[13px] font-semibold"
                  >
                    Payment Date<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    {...register("paymentDate")}
                    className="mt-1 block w-full border rounded-[6px] h-[33px] p-2 text-[12px] font-normal border-[#C3C3CB] outline-none"
                  />
                  {errors.paymentDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.paymentDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="receivedAmount"
                    className="block text-[13px] font-semibold"
                  >
                    Received Amount<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="receivedAmount"
                    type="text"
                    {...register("receivedAmount")}
                    className="mt-1 block w-full border rounded-[6px] h-[33px] p-2 text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="Enter Amount"
                  />
                  {errors.receivedAmount && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.receivedAmount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="chequeNumber"
                    className="block text-[13px] font-semibold"
                  >
                    Cheque Number<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="chequeNumber"
                    type="text"
                    {...register("chequeNumber")}
                    className="mt-1 block w-full border rounded-[6px] h-[33px] p-2 text-[12px] font-normal border-[#C3C3CB] outline-none"
                    placeholder="1234567"
                  />
                  {errors.chequeNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.chequeNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="uploadReceipt"
                    className="block text-[13px] font-semibold"
                  >
                    Upload Receipt<span className="text-[#F61818]">*</span>
                  </label>
                  <input
                    id="uploadReceipt"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    {...register("uploadReceipt", {
                      validate: {
                        required: (fileList) =>
                          fileList?.length > 0 || "Upload Receipt is required",
                        isValidFile: (fileList) => {
                          const file = fileList?.[0];
                          if (!file) return true;
                          const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
                          const fileName = file.name.toLowerCase();
                          return validExtensions.some(ext => fileName.endsWith(ext)) ||
                            "Only PDF, PNG, and JPG files are allowed";
                        },
                      },
                    })}
                    className="hidden"
                  />
                  <label
                    htmlFor="uploadReceipt"
                    className="mt-1 flex items-center justify-between w-full h-[33px] p-2 text-[12px] font-normal border rounded-[6px] border-[#C3C3CB] cursor-pointer bg-white"
                  >
                    <span className="underline">Receipt.pdf</span>
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
                      {errors.uploadReceipt.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="paymentRemarks"
                    className="block text-[13px] font-semibold"
                  >
                    Payment Remarks<span className="text-[#F61818]">*</span>
                  </label>
                  <textarea
                    id="paymentRemarks"
                    {...register("paymentRemarks")}
                    className="mt-1 p-2 block w-full border text-[12px] font-normal border-[#C3C3CB] rounded-[6px] h-[80px] sm:h-[80px] lg:h-[46px] resize-none outline-none"
                    placeholder="Remarks here"
                  />
                  {errors.paymentRemarks && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.paymentRemarks.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm">
            Error submitting form. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-4 mt-3 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 -ml-4 sm:-ml-6 md:-ml-8 lg:-ml-10 -mr-4 sm:-mr-6 md:-mr-6 lg:-mr-6">
          <button
            type="button"
            onClick={handleClear}
            className="bg-[#F61818] text-white w-[83px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#009959] text-white w-[119px] p-2 h-[40px] rounded-[6px] text-[14px] font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Save Client"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealForm;
