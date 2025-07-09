"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import CommissionArc from "@/components/salesperson/commission/CommissionArc";
import { Skeleton } from "@/components/ui/skeleton";

interface CommissionData {
  achieved: number;
  total: number;
  increaseLabel: string;
  salesAmount: string;
  subtitle: string;
}

const fetchCommissionData = async (token: string): Promise<CommissionData> => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/commission/`
  );
  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Commission API error:", errorText);
    throw new Error("Failed to fetch commission data");
  }

  const data = await res.json();
  const chart = data.company_goal_chart;

  return {
    achieved: chart.achieved_percentage ?? 0,
    total: data.organization_goal ?? 1,
    increaseLabel: `${chart.sales_growth_percentage ?? 0}%`,
    salesAmount: `$${chart.current_sales ?? 0}`,
    subtitle: chart.subtitle ?? "",
  };
};

const CommissionSection: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      setToken(storedToken);
    }
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ["commissionData", token],
    queryFn: () => fetchCommissionData(token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

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
