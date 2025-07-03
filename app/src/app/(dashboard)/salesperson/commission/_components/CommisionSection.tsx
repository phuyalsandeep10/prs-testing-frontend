"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import CommissionArc from "@/components/salesperson/commission/CommissionArc";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchCommissionData() {
  return new Promise<{
    achieved: number;
    total: number;
    increaseLabel: string;
    salesAmount: string;
  }>((resolve) => {
    setTimeout(() => {
      resolve({
        achieved: 68.4,
        total: 100,
        increaseLabel: "+25%",
        salesAmount: "$29,000",
      });
    }, 1000);
  });
}

const CommissionSection: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["commissionData"],
    queryFn: fetchCommissionData,
  });

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="space-y-4">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-32" />

          {/* Arc chart skeleton - matching the dimensions of your CommissionArc */}
          <Skeleton className="h-[174px] w-[400px] rounded-lg" />

          {/* Stats skeletons */}
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

  if (error) return <div>Error loading commission data</div>;

  const subtitle =
    data && data.achieved >= data.total
      ? "Goal achieved!"
      : "Little bit more now.";

  return (
    <div style={{ maxWidth: 480, width: "100%" }}>
      <CommissionArc
        achieved={data?.achieved ?? 0}
        total={data?.total ?? 1}
        increaseLabel={data?.increaseLabel ?? "+0%"}
        salesAmount={data?.salesAmount ?? "$0"}
        title="Company Goal"
        subtitle={subtitle}
        width={420}
        height={174}
      />
    </div>
  );
};

export default CommissionSection;
