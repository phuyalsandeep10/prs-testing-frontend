"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ClientSchema } from "./ClientSchema";
import InputField from "@/components/ui/clientForm/InputField";
import TextAreaField from "@/components/ui/clientForm/TextAreaField";
import SelectField from "@/components/ui/clientForm/SelectField";
import Button from "@/components/ui/clientForm/Button";

type ClientFormData = z.infer<typeof ClientSchema>;

const updateClientData = async (data: ClientFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: "Client data updated successfully" };
};

const EditClient = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(ClientSchema),
  });

  const mutation = useMutation({
    mutationFn: updateClientData,
    onSuccess: (response) => {
      console.log(response.message);
      reset();
    },
    onError: (error) => {
      console.error("Update failed:", error);
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
        {/* Contact Info */}
        <div>
          <h2 className="text-[#31323A] font-medium text-[16px]">
            Contact Information
          </h2>
        </div>
        {/* Client Name */}
        <div>
          <InputField
            id="clientName"
            label="Client Name"
            placeholder="Client Name"
            registration={register("clientName")}
            error={errors.clientName}
            required
          />
        </div>
        {/* Email */}
        <div>
          <InputField
            id="email"
            type="email"
            label="Email"
            placeholder="email@example.com"
            registration={register("email")}
            error={errors.email}
            required
          />
        </div>
        {/* Contact Number & Nationality */}
        <div className="flex gap-4">
          <div>
            <InputField
              id="contactNumber"
              type="tel"
              label="Contact Number"
              placeholder="9800000000"
              registration={register("contactNumber")}
              error={errors.contactNumber}
              required
              width="w-[186px]"
            />
          </div>

          <div>
            <InputField
              id="nationality"
              label="Nationality"
              placeholder="Nepalese"
              registration={register("nationality")}
              error={errors.nationality}
              required
              width="w-[186px]"
            />
          </div>
        </div>
        {/* Remarks */}
        <div>
          <TextAreaField
            id="remarks"
            label="Remarks"
            placeholder="Enter remarks"
            registration={register("remarks")}
            error={errors.remarks}
            textareaClassName="shadow-[0_0_4px_#8393FC]"
            height="h-[113px]"
          />
        </div>
        <div className="flex flex-between justify-between pr-7">
          {/* Status Dropdown */}
          <div>
            <SelectField
              id="status"
              label="Status"
              required
              placeholder="Select Status"
              registration={register("status")}
              error={errors.status}
              options={[
                { value: "Pending", label: "Pending" },
                { value: "Bad Depth", label: "Bad Depth" },
                { value: "Clear", label: "Clear" },
              ]}
            />
          </div>

          {/* Satisfaction Dropdown */}
          <div>
            <SelectField
              id="satisfaction"
              label="Satisfaction"
              required
              placeholder="Select Satisfaction"
              registration={register("satisfaction")}
              error={errors.satisfaction}
              options={[
                { value: "Neutral", label: "Neutral" },
                { value: "Negative", label: "Negative" },
                { value: "Positive", label: "Positive" },
              ]}
            />
          </div>
        </div>
        {mutation.isError && (
          <p className="text-red-600 text-sm">
            Error updating form. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-4 mt-3 bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA] p-4 -ml-6">
          <Button
            type="button"
            onClick={() => reset()}
            className="bg-[#F61818] text-white w-[83px]"
          >
            Clear
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#009959] text-white w-[119px]"
          >
            {isSubmitting ? "Updating..." : "Update Client"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditClient;
