"use client";

import React from "react";
import CommissionArc from "@/components/salesperson/commission/CommissionArc";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommissionData } from "@/hooks/api";

interface CommissionData {
  achieved: number;
  total: number;
  increaseLabel: string;
  salesAmount: string;
  subtitle: string;
}

const CommissionSection: React.FC = () => {
  // Use standardized hook for commission data
  const { data: commissionResponse, isLoading, error } = useCommissionData('monthly');
  
  // Transform the data to match the expected format
  const data = commissionResponse ? {
    achieved: commissionResponse.commission_breakdown?.[0]?.achieved_percentage ?? 0,
    total: commissionResponse.total_commission ?? 1,
    increaseLabel: `${commissionResponse.commission_breakdown?.[0]?.growth_percentage ?? 0}%`,
    salesAmount: `$${commissionResponse.total_commission ?? 0}`,
    subtitle: commissionResponse.commission_period ?? "",
  } : null;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-[174px] w-[300px] rounded-lg" />
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-6 w-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">Error: {error.message}</p>;
  }

  return (
    <div style={{ maxWidth: 480, width: "100%" }}>
      <CommissionArc
        achieved={data?.achieved ?? 0}
        total={data?.total ?? 1}
        increaseLabel={data?.increaseLabel ?? "+0%"}
        salesAmount={data?.salesAmount ?? "$0"}
        title="Company Goal"
        subtitle={data?.subtitle ?? ""}
        width={420}
        height={174}
      />
    </div>
  );
};

export default CommissionSection;
