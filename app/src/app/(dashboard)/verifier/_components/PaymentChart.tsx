"use client";

import PaymentDistribution from "@/components/dashboard/verifier/dashboard/PaymentDistribution";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const legends = [
  { label: "Processing", color: "#465FFF" },
  { label: "Success", color: "#009959" },
  { label: "Failed", color: "#FD8B00" },
  { label: "Pending", color: "#0791A5" },
  { label: "Initiated", color: "#6D59FF" },
  { label: "Refunded", color: "#1E90FA" },
  { label: "Chargeback", color: "#EA1000" },
];

// Dummy query to simulate loading
const useChartLoader = () =>
  useQuery({
    queryKey: ["payment-distribution"],
    queryFn: async () => {
      await new Promise((res) => setTimeout(res, 800));
      return true;
    },
  });

const PaymentChart = () => {
  const { isLoading } = useChartLoader();

  if (isLoading) {
    // Show skeleton only without border/title container
    return (
      <div className="flex flex-wrap gap-4 p-4">
        <Skeleton className="h-[250px] w-[320px] rounded-md" />
        <div className="flex-1 flex flex-col justify-center space-y-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-4 w-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-sm border-[1px] border-[#A9A9A9] p-4">
      <div>
        <h1 className="text-[#465FFF] text-[20px] font-semibold mb-2">
          Payment Status Distribution
        </h1>
        <PaymentDistribution />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <ul className="space-y-2">
          {legends.map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: color }}
              ></span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentChart;
