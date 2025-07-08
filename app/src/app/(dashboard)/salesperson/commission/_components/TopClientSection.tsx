"use client";

import React, { useState } from "react";
import TopClientCard from "@/components/salesperson/commission/TopClientCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommissionData } from "@/hooks/api";

interface ClientData {
  name: string;
  value: number;
}

// Using standardized hooks - no manual API functions needed

// 🔁 Dynamic content only
const TopClientContent = ({ view }: { view: string }) => {
  // Use standardized hook for commission data with period filtering
  const { data: commissionResponse, isLoading, error } = useCommissionData(view);
  
  // Transform the data to match the expected format
  const data = commissionResponse?.top_clients_this_period?.map(client => ({
    name: client.client_name,
    value: client.total_value,
  })) || [];

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
  const [view, setView] = useState<"yearly" | "monthly" | "quarterly">(
    "monthly"
  );

  const getSubheading = () => {
    switch (view) {
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
    <div className="w-full mx-auto border border-[#D1D1D1] p-4 rounded-md">
      {/* Static header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-10 mb-4">
        <div>
          <h1 className="text-[18px] font-semibold mb-1">My Top Clients</h1>
          <p className="text-[12px] text-[#7E7E7E] truncate">
            {getSubheading()}
          </p>
        </div>

        <div className="w-30">
          <select
            value={view}
            onChange={(e) =>
              setView(e.target.value as "yearly" | "monthly" | "quarterly")
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
      <TopClientContent view={view} />
    </div>
  );
};

export default TopClientSection;
