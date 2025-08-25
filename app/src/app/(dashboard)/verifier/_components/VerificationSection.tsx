"use client";
import React, { useMemo } from "react";
import VerificationComponent from "@/components/dashboard/verifier/dashboard/VerificationComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifierDataContext } from "./VerifierDataProvider";
import { normalizeVerificationQueueResponse } from "../_utils/apiResponseNormalizers";

const VerificationSection = () => {
  const { verificationQueueData, verificationQueueLoading, verificationQueueError } = useVerifierDataContext();

  // Memoize data transformation to prevent unnecessary recalculations
  const data = useMemo(() => {
    if (!verificationQueueData) return [];

    // Debug log to check data structure
    console.log('Raw verification queue data:', verificationQueueData);

    // Use normalizer for consistent data structure
    const normalizedData = normalizeVerificationQueueResponse(verificationQueueData);
    console.log('Normalized verification data:', normalizedData);
    
    // Transform to expected format for VerificationComponent
    const transformedData = normalizedData.map((item) => ({
      ID: String(item.invoice_id || ''),
      client: String(item.client_name || ''),
      amount: String(item.formatted_amount || ''),
      status: String(item.invoice_status || ''),
      actions: "Verify", // Static for now
    }));
    
    console.log('Transformed verification data:', transformedData);
    return transformedData;
  }, [verificationQueueData]);

  if (verificationQueueLoading || data.length === 0)
    return (
      <div className="space-y-3 w-fit rounded-[6px] p-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex space-x-4 items-center">
            <Skeleton className="w-20 h-6 rounded" />
            <Skeleton className="w-32 h-6 rounded" />
            <Skeleton className="w-20 h-6 rounded" />
            <Skeleton className="w-24 h-6 rounded" />
            <Skeleton className="w-20 h-6 rounded" />
          </div>
        ))}
      </div>
    );

  if (verificationQueueError)
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500 mb-2">Failed to load verification queue</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-500 hover:text-blue-600 text-xs underline"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-fit">
      <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3 pl-4 py-1">
        Verification Queue
      </h1>
      <VerificationComponent data={data} />
    </div>
  );
};

export default VerificationSection;
