"use client";

import React, { useMemo } from "react";
import CommissionArc from "@/components/salesperson/commission/CommissionArc";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommissionPeriod } from "./CommissionPeriodProvider";
import { useCommissionDataContext } from "./CommissionDataProvider";
import { normalizeCommissionResponse } from "../_utils/apiResponseNormalizer";

interface CommissionData {
  achieved: number;
  total: number;
  increaseLabel: string;
  salesAmount: string;
  subtitle: string;
}

interface CommissionResponse {
  organization_goal?: number;
  company_goal_chart?: {
    achieved_percentage?: number;
    sales_growth_percentage?: number;
    current_sales?: number;
  };
  period_summary?: {
    period?: string;
  };
}

const CommissionSection: React.FC = () => {
  // Use shared data context for coordinated API calls
  const { commissionData: commissionResponse, commissionLoading: isLoading, commissionError: error } = useCommissionDataContext();
  
  // Memoize data transformation to prevent unnecessary recalculations
  const data = useMemo((): CommissionData | null => {
    if (!commissionResponse) return null;

    // Use normalizer for consistent data structure
    const normalizedData = normalizeCommissionResponse(commissionResponse);
    const { organization_goal, company_goal_chart, period_summary } = normalizedData;

    return {
      achieved: company_goal_chart.achieved_percentage,
      total: organization_goal,
      increaseLabel: `${company_goal_chart.sales_growth_percentage >= 0 ? '+' : ''}${company_goal_chart.sales_growth_percentage.toFixed(1)}%`,
      salesAmount: `$${company_goal_chart.current_sales.toLocaleString()}`,
      subtitle: period_summary.period,
    };
  }, [commissionResponse]);

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
        <div className="text-center space-y-2">
          <div className="text-red-500 text-sm font-medium">
            Unable to load commission data
          </div>
          <p className="text-gray-500 text-xs">
            {error.message || 'Please try again later'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:text-blue-600 text-xs underline"
          >
            Retry
          </button>
        </div>
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
