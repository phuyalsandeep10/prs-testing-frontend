"use client";
import React, { useMemo } from "react";
import RefundComponent from "@/components/dashboard/verifier/dashboard/RefundComponent";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./RefundSection.module.css";
import { useVerifierDataContext } from "./VerifierDataProvider";
import { normalizeRefundsResponse } from "../_utils/apiResponseNormalizers";

const RefundSection = () => {
  const { refundsData, refundsLoading, refundsError } = useVerifierDataContext();

  // Memoize data transformation to prevent unnecessary recalculations
  const data = useMemo(() => {
    if (!refundsData) return [];

    // Use normalizer for consistent data structure
    const normalizedData = normalizeRefundsResponse(refundsData);
    
    // Transform to expected format for RefundComponent
    return normalizedData.map((item) => ({
      transactionId: item.transaction_id,
      client: item.client_name,
      amount: item.formatted_amount,
      status: item.status,
      reasons: item.reasons,
      date: item.date,
    }));
  }, [refundsData]);

  return (
    <div>
      {!refundsLoading && (
        <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3">
          Recent Refunds and Bad Debts
        </h1>
      )}

      {refundsLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex justify-between space-x-4 ${styles.skeletonRow}`}
            >
              <Skeleton className="w-20 h-6 rounded" />
              <Skeleton className="w-32 h-6 rounded" />
              <Skeleton className="w-20 h-6 rounded" />
              <Skeleton className="w-24 h-6 rounded" />
              <Skeleton className="w-36 h-6 rounded" />
              <Skeleton className="w-36 h-6 rounded" />
            </div>
          ))}
        </div>
      )}

      {refundsError && (
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">Failed to load refund data.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:text-blue-600 text-xs underline"
          >
            Retry
          </button>
        </div>
      )}

      {!refundsLoading && data && <RefundComponent data={data} />}
    </div>
  );
};

export default RefundSection;
