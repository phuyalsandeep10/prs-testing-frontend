"use client";

import React, { useMemo } from "react";
import TopClientCard from "@/components/salesperson/commission/TopClientCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommissionPeriod } from "./CommissionPeriodProvider";
import { useCommissionDataContext } from "./CommissionDataProvider";
import { normalizeCommissionResponse } from "../_utils/apiResponseNormalizer";

interface ClientData {
  name: string;
  value: number;
}

// Using standardized hooks - no manual API functions needed

// 🔁 Dynamic content only
const TopClientContent = () => {
  // Use shared data context for coordinated API calls
  const { commissionData: commissionResponse, commissionLoading: isLoading, commissionError: error } = useCommissionDataContext();
  
  // Transform the data using normalizer for consistent format
  const data = useMemo(() => {
    if (!commissionResponse) return [];
    
    const normalizedData = normalizeCommissionResponse(commissionResponse);
    return normalizedData.top_clients_this_period.map(client => ({
      name: client.client_name,
      value: client.total_value,
    }));
  }, [commissionResponse]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-8 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">Error: {error.message}</p>;
  }

  return data.length > 0 ? <TopClientCard data={data} /> : null;
};

const TopClientSection = () => {
  const { period, setPeriod } = useCommissionPeriod();

  const getSubheading = () => {
    switch (period) {
      case "yearly":
        return "Yearly Top Clients";
      case "monthly":
        return "Monthly Top Clients";
      case "quarterly":
        return "Quarterly Top Clients";
      default:
        return "";
    }
  };

  return (
    <div className="w-full min-h-[260px] p-4 md:p-6 rounded-md border border-[#D1D1D1]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-[16px] md:text-[18px] font-semibold mb-1">
                My Top Clients
              </h1>
              <p className="text-[12px] text-[#7E7E7E] truncate">
                {getSubheading()}
              </p>
            </div>
            <div className="w-full md:w-40">
              <select
                value={period}
                onChange={(e) =>
                  setPeriod(e.target.value as "yearly" | "monthly" | "quarterly")
                }
                className="w-full px-3 py-1.5 border border-[#C3C3CB] rounded-md text-sm text-[#4B5563] shadow-sm focus:outline-none"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
      </div>

      {/* Dynamic section (only this rerenders) */}
      <TopClientContent />
    </div>
  );
};

export default TopClientSection;
