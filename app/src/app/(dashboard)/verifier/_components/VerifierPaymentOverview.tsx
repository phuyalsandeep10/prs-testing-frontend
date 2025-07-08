// components/dashboard/verifier/VerifierPaymentOverview.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import CardComponent from "@/components/dashboard/verifier/paymentRecords/CardComponent";
import { Skeleton } from "@/components/ui/skeleton";

interface CardData {
  title: string;
  subtitle: string;
  change: string;
  percentage: number; // 🆕 Added
}

const fetchPaymentOverview = async (): Promise<CardData[]> => {
  await new Promise((res) => setTimeout(res, 1000));
  return [
    {
      title: "Total Payment",
      subtitle: "Total payment with Active Invoices",
      change: "+20% than last month",
      percentage: 80,
    },
    {
      title: "Approved Amount",
      subtitle: "Payments Successfully Collected",
      change: "+12% than last month",
      percentage: 78,
    },
    {
      title: "Rejected",
      subtitle: "Failed or Cancelled Transactions",
      change: "-12% than last month",
      percentage: 12,
    },
    {
      title: "Pending Amount",
      subtitle: "Invoices Awaiting Payment",
      change: "+2% than last month",
      percentage: 10,
    },
  ];
};

const VerifierPaymentOverview = () => {
  const { data, isLoading, error } = useQuery<CardData[]>({
    queryKey: ["verifier-payment-overview"],
    queryFn: fetchPaymentOverview,
  });

  if (isLoading) {
    return (
      <div className="flex gap-6 p-6 overflow-x-hidden flex-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center border rounded-2xl p-6 min-w-[256.6px] shadow-sm bg-white flex-1"
          >
            <div className="flex flex-col space-y-3 w-full">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="w-20 h-20 border border-dashed border-gray-300 rounded-xl ml-4" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 text-red-500 text-sm">
        Failed to load payment data.
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {data.map((card, index) => (
        <div key={index} className="flex-grow min-w-[250px] max-w-xs">
          <CardComponent
            title={card.title}
            subtitle={card.subtitle}
            change={card.change}
            percentage={card.percentage} // 🆕 Pass percentage
          />
        </div>
      ))}
    </div>
  );
};

export default VerifierPaymentOverview;
