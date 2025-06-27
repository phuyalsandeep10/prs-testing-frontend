"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ClientSchema } from "./ClientSchema";

type ClientFormData = z.infer<typeof ClientSchema>;

const submitClientData = async (data: ClientFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: "Client data submitted successfully" };
};

const Clientform = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientSchema),
  });

  const mutation = useMutation({
    mutationFn: submitClientData,
    onSuccess: (response) => {
      console.log(response.message);
      reset();
    },
    onError: (error) => {
      console.error("Submission failed:", error);
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-md mx-auto pt-6 bg-white rounded-lg shadow-md pl-6">
      <h2 className="text-[20px] font-bold mb-6 text-[#465FFF] flex item-center justify-between pr-6">
        Add New Client
        <svg
          className="mt-2"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 8.5858L12.8284 5.75736L14.2426 7.17157L11.4142 10L14.2426 12.8284L12.8284 14.2426L10 11.4142L7.17157 14.2426L5.75736 12.8284L8.5858 10L5.75736 7.17157L7.17157 5.75736L10 8.5858Z"
            fill="#465FFF"
          />
        </svg>
      </h2>
      <hr className="mb-6" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h2 className="text-[#31323A] font-medium text-[16px] ">
            Contact Information
          </h2>
        </div>
        <div>
          <label
            htmlFor="clientName"
            className="block text-[#465FFF] text-[14px] font-normal"
          >
            Client Name<span className="text-[#F61818]">*</span>
          </label>
          <input
            id="clientName"
            type="text"
            {...register("clientName")}
            className="mt-1 block border text-[12px] rounded-[6px] h-[48px] w-[398px] p-2 font-normal border-[#8393FC] focus:ring-1 focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none"
            placeholder="Abinash Gokte Babu Tiwari"
          />
          {errors.clientName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.clientName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-[#465FFF] text-[14px] font-normal"
          >
            Email<span className="text-[#F61818]">*</span>
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block rounded-[6px] h-[48px] w-[398px] border text-[12px] p-2 font-normal border-[#8393FC] focus:ring-1 focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none"
            placeholder="Abinashgoktebabutiwari666@gmail.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          <div>
            <label
              htmlFor="contactNumber"
              className="text-[#465FFF] text-[14px] font-normal"
            >
              Contact Number<span className="text-[#F61818]">*</span>
            </label>
            <input
              id="contactNumber"
              type="tel"
              {...register("contactNumber")}
              className="mt-1 block border rounded-[6px] h-[48px] w-[186px] p-2 text-[12px] font-normal border-[#8393FC] focus:ring-1 focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none"
              placeholder="9807057526"
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.contactNumber.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="nationality"
              className="text-[#465FFF] text-[14px] font-normal"
            >
              Nationality<span className="text-[#F61818]">*</span>
            </label>
            <input
              id="nationality"
              type="text"
              {...register("nationality")}
              className="block mt-1 p-2 border rounded-[6px] h-[48px] w-[186px] text-[12px] font-normal border-[#8393FC] focus:ring-1 focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none"
              placeholder="Nepalese"
            />
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-600">
                {errors.nationality.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-[#31323A] font-medium text-16px">
            Additional Notes
          </h2>
        </div>

        <div>
          <label
            htmlFor="remarks"
            className="block text-[#465FFF] text-[14px] font-normal"
          >
            Remarks
          </label>
          <textarea
            id="remarks"
            {...register("remarks")}
            className="mt-1 p-2 mb-32 block border text-[12px] font-normal border-[#8393FC] rounded-[6px] h-[113px] w-[398px] resize-none focus:ring-1 focus:ring-[#6B7FFF] focus:border-[#6B7FFF] outline-none"
            rows={4}
          />
          {errors.remarks && (
            <p className="mt-1 text-sm text-red-600">
              {errors.remarks.message}
            </p>
          )}
        </div>

        {mutation.isError && (
          <p className="text-red-600 text-sm">
            Error submitting form. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-4 mt-3 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 -ml-6">
          <button
            type="button"
            onClick={() => reset()}
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

export default Clientform;
