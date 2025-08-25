"use client";

import React, { useMemo } from "react";
import AuditComponents from "@/components/dashboard/verifier/dashboard/AuditComponents";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifierDataContext } from "./VerifierDataProvider";
import { normalizeAuditLogsResponse } from "../_utils/apiResponseNormalizers";

const AuditSection = () => {
  const { auditLogsData, auditLogsLoading, auditLogsError } = useVerifierDataContext();

  // Memoize data transformation to prevent unnecessary recalculations
  const data = useMemo(() => {
    if (!auditLogsData) return [];

    // Use normalizer for consistent data structure
    return normalizeAuditLogsResponse({ results: auditLogsData }).slice(0, 6);
  }, [auditLogsData]);

  if (auditLogsLoading || data.length === 0) {
    return (
      <div className="pt-3 rounded-[6px] w-fit">
        <div className="pl-4 py-1 mb-3">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-2"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (auditLogsError) {
    return (
      <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-full">
        <p className="text-sm text-red-500 p-4 mb-2">Failed to load audit logs.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-500 hover:text-blue-600 text-xs underline ml-4 mb-4"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-full">
      <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3 pl-4 py-1">
        Audit Logs
      </h1>
      <AuditComponents data={data} />
    </div>
  );
};

export default AuditSection;
