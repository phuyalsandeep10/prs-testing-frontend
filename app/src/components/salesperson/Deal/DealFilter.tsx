"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SlideModal from "@/components/ui/SlideModal";

const DealFilterSchema = z.object({
  dealName: z.string().optional(),
  paymentStatus: z.string().optional(),
  payMethod: z.string().optional(),
  time: z.string().optional(),
});

type DealFilterData = z.infer<typeof DealFilterSchema>;

interface DealFilterProps {
  onClose: () => void;
  onApplyFilter: (filters: DealFilterData) => void;
}

const DealFilter: React.FC<DealFilterProps> = ({ onClose, onApplyFilter }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DealFilterData>({
    resolver: zodResolver(DealFilterSchema),
  });

  const onSubmit = (data: DealFilterData) => {
    onApplyFilter(data);
    onClose();
  };

  const handleClearFilters = () => {
    reset();
    onApplyFilter({});
    onClose();
  };

  return (
    <SlideModal
      isOpen={true}
      onClose={onClose}
      title="Deal Management Filter"
      width="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        
        {/* Deal Name */}
        <div>
          <label htmlFor="dealName" className="block text-sm font-medium text-gray-900 mb-2">
            Deal Name
          </label>
          <input
            id="dealName"
            type="text"
            {...register("dealName")}
            placeholder="Enter Deal Name"
            className="w-full px-3 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Payment Status */}
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-900 mb-2">
            Payment Status
          </label>
          <select
            id="paymentStatus"
            {...register("paymentStatus")}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          >
            <option value="">Select Status</option>
            <option value="rejected" className="text-red-600">Rejected</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="partial">Partial Payment</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Pay Method */}
        <div>
          <label htmlFor="payMethod" className="block text-sm font-medium text-gray-900 mb-2">
            Pay Method
          </label>
          <input
            id="payMethod"
            type="text"
            {...register("payMethod")}
            placeholder="Design Wizards"
            className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Time */}
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-900 mb-2">
            Time
          </label>
          <div className="relative">
            <input
              id="time"
              type="text"
              {...register("time")}
              placeholder="Nepali Rupees"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <span className="text-red-500 text-sm">₹</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Clear filters
          </button>
        </div>
      </form>
    </SlideModal>
  );
};

export default DealFilter; 