"use client";

import React, { useMemo } from "react";
import Card from "@/components/dashboard/verifier/dashboard/OverviewComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifierDataContext } from "./VerifierDataProvider";
import { normalizeOverviewResponse } from "../_utils/apiResponseNormalizers";

type StatItem = {
  title: string;
  number: string;
  className: string;
};

const Overview = () => {
  const { overviewData, overviewLoading, overviewError } = useVerifierDataContext();

  // Memoize data transformation to prevent unnecessary recalculations
  const data = useMemo((): StatItem[] => {
    if (!overviewData) return [];

    // Debug log to check data structure
    console.log('Overview raw data:', overviewData);

    // Use normalizer for consistent data structure
    const normalizedData = normalizeOverviewResponse(overviewData);
    console.log('Overview normalized data:', normalizedData);

    return [
      {
        title: "Total Payments",
        number: normalizedData.total_payments.toString(),
        className: "bg-[#010D58]",
      },
      {
        title: "Payment Success",
        number: normalizedData.total_successful_payments.toString(),
        className: "bg-[#027545]",
      },
      {
        title: "Payment Unsuccessful",
        number: normalizedData.total_unsuccess_payments.toString(),
        className: "bg-[#9D0E04]",
      },
      {
        title: "Verification Pending",
        number: normalizedData.total_verification_pending_payments.toString(),
        className: "bg-[#BE6A04]",
      },
      {
        title: "Total Revenue",
        number: normalizedData.total_revenue,
        className: "bg-[#00008B]",
      },
      {
        title: "Avg. Transactional Value",
        number: normalizedData.average_transaction_value.toFixed(2),
        className: "bg-[#65026C]",
      },
      {
        title: "Refunded Amount",
        number: normalizedData.total_refunded_amount,
        className: "bg-[#8C4F05]",
      },
    ];
  }, [overviewData]);

  if (overviewLoading || data.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-md" />
        ))}
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="text-center mt-4">
        <p className="text-sm text-red-500 mb-2">
          Failed to load overview stats.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-500 hover:text-blue-600 text-xs underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const firstRow = data.slice(0, 4);
  const secondRow = data.slice(4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {firstRow.map((item, index) => (
        <div key={index} className="w-full col-span-1">
          <Card
            title={item.title}
            number={item.number}
            className={`${item.className} w-full h-full`}
          />
        </div>
      ))}
      <div className="col-span-1 sm:col-span-2 xl:col-span-4 flex flex-col xl:flex-row gap-6">
        {secondRow.map((item, index) => (
          <div key={index} className="flex-1">
            <Card
              title={item.title}
              number={item.number}
              className={`${item.className} w-full h-full`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
