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
  
  // Transform the data to match the expected format using the correct backend structure
  const data = commissionResponse ? {
    achieved: commissionResponse.company_goal_chart?.achieved_percentage ?? 0,
    total: commissionResponse.organization_goal ?? 1,
    increaseLabel: `${commissionResponse.company_goal_chart?.sales_growth_percentage ?? 0}%`,
    salesAmount: `$${commissionResponse.company_goal_chart?.current_sales ?? 0}`,
    subtitle: commissionResponse.period_summary?.period ?? "Monthly",
  } : null;

  if (isLoading) {
    return (
      <div className="w-full h-[322px] flex flex-col p-[10px]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="flex justify-between items-center px-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-5 w-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[322px] flex items-center justify-center p-[10px]">
        <p className="text-red-500 text-xs text-center">
          Error: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[322px] p-[10px]">
      <CommissionArc
        achieved={data?.achieved ?? 0}
        total={data?.total ?? 1}
        increaseLabel={data?.increaseLabel ?? "+0%"}
        salesAmount={data?.salesAmount ?? "$0"}
        title="Company Goal"
        subtitle={data?.subtitle ?? ""}
      />
    </div>
  );
};

export default CommissionSection;
