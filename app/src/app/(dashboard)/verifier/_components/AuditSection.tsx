"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AuditComponents from "@/components/dashboard/verifier/dashboard/AuditComponents";
import { Skeleton } from "@/components/ui/skeleton";

const AuditSection = () => {
  const fetchAuditData = async () => {
    return [
      {
        timestamp: "2025-10-26 14:34",
        verifier: "Verifier A",
        actions: "Verified",
        status: "Success",
        txnid: "TXN001",
      },
      {
        timestamp: "2025-10-26 14:34",
        verifier: "Verifier B",
        actions: "Verified",
        status: "Failed",
        txnid: "TXN002",
      },
      {
        timestamp: "2025-10-26 14:34",
        verifier: "Verifier C",
        actions: "Verified",
        status: "Success",
        txnid: "TXN003",
      },
      {
        timestamp: "2025-10-26 14:34",
        verifier: "Verifier B",
        actions: "Verified",
        status: "Pending",
        txnid: "TXN004",
      },
      {
        timestamp: "2025-10-26 14:34",
        verifier: "Verifier C",
        actions: "Verified",
        status: "Success",
        txnid: "TXN005",
      },
      {
        timestamp: "2025-10-26 14:34",
        verifier: "Verifier C",
        actions: "Verified",
        status: "Success",
        txnid: "TXN005",
      },
    ];
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-queue"],
    queryFn: fetchAuditData,
  });

  if (isLoading) {
    return (
      <div className="pt-3 rounded-[6px] w-fit">
        <div className="pl-4 py-1 mb-3">
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between space-x-4"
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

  if (isError || !data) {
    return (
      <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-full">
        <p className="text-sm text-red-500 p-4">Failed to load data</p>
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
