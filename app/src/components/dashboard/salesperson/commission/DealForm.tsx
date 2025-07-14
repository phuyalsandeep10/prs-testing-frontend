"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DealSchema } from "../../../salesperson/Deal/DealSchema";
import { apiClient } from "@/lib/api";
import { Client } from "@/types/deals";

type DealFormData = z.infer<typeof DealSchema>;

const toSnakeCase = (str: string) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformDataForApi = (data: DealFormData) => {
  console.log('Starting transform with data:', data);
  const transformed: { [key: string]: any } = {};
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    console.log(`Processing key: ${key}, value:`, (data as any)[key]);

    if (key === 'clientName') {
      console.log('Mapping clientName to client_id:', (data as any)[key]);
      transformed['client_id'] = (data as any)[key];
      continue;
    }

    if (key === 'payStatus') {
      console.log('Mapping payStatus to payment_status:', (data as any)[key]);
      transformed['payment_status'] = (data as any)[key] === 'Full Pay' ? 'full_payment' : 'partial_payment';
      continue;
    }

    if (key === 'payMethod') {
      console.log('Mapping payMethod to payment_method:', (data as any)[key]);
      transformed['payment_method'] = (data as any)[key];
      continue;
    }

    const snakeKey = toSnakeCase(key);
    console.log(`Converting ${key} to ${snakeKey}:`, (data as any)[key]);
    transformed[snakeKey] = (data as any)[key];
  }
  console.log('Final transformed data:', transformed);
  return transformed;
};

const fetchClients = async (): Promise<Client[]> => {
  const response = await apiClient.get<Client[]>("/clients/");
  return response.data || [];
};

const submitDealData = async (data: DealFormData) => {
  console.log('Raw form data:', data);
  const transformedData = transformDataForApi(data);
  console.log('Transformed data for API:', transformedData);
  const response = await apiClient.post('/deals/deals/', transformedData);
  return response.data;
};

const DealForm = () => {
  const queryClient = useQueryClient();
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

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
    onSuccess: (data) => {
      console.log("Deal created successfully:", data);
      reset();
      // Invalidate all deal-related queries to ensure all tables update
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "list"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "list", {}] });
      
      // Invalidate cache-based queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 (queryKey.includes('deals') || 
                  queryKey.includes('DEALS') ||
                  (queryKey[0] === 'deals'));
        }
      });
      
      // Force refetch all deals queries
      queryClient.refetchQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 (queryKey.includes('deals') || 
                  queryKey.includes('DEALS') ||
                  (queryKey[0] === 'deals'));
        }
      });
      
      // Specifically invalidate the salesperson deals table pattern
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return Array.isArray(queryKey) && 
                 queryKey.length >= 2 && 
                 queryKey[0] === 'deals' && 
                 typeof queryKey[1] === 'object';
        }
      });
    },
    onError: (error: any) => {
      console.error("Failed to create deal:", error);
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
                <div className="w-full lg:w-[240px]">
                  <label
                    htmlFor="clientName"
                    className="block text-[13px] font-semibold"
                  >
                    Client Name<span className="text-[#F61818]">*</span>
                  </label>
                  <select
                    id="clientName"
                    {...register("clientName")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none bg-white"
                    disabled={isLoadingClients}
                  >
                    <option value="">{isLoadingClients ? 'Loading...' : 'Select Client'}</option>
                    {clients?.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.client_name}
                      </option>
                    ))}
                  </select>
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
                <div className="w-full lg:w-[133px]">
                  <label htmlFor="payMethod" className="block text-[13px] font-semibold">
                    Payment Method<span className="text-[#F61818]">*</span>
                  </label>
                  <select
                    id="payMethod"
                    {...register("payMethod")}
                    className="mt-1 block w-full p-2 border rounded-[6px] h-[48px] text-[12px] font-normal border-[#C3C3CB] outline-none bg-white"
                  >
                    <option value="">Select method</option>
                    <option value="wallet">Mobile Wallet</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                  </select>
                  {errors.payMethod && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.payMethod.message}
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
                      <p>
                        Deal created -{" "}
                        <span className="text-[#A9A9A9] ml-16">
                          28th May, 2024
                        </span>
                      </p>
                    </div>
                  </div>
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

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DealForm;
