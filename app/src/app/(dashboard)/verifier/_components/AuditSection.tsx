"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AuditComponents from "@/components/dashboard/verifier/dashboard/AuditComponents";

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
    ];
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-queue"],
    queryFn: fetchAuditData,
  });

  if (isLoading) return <p className="text-sm text-gray-600">Loading...</p>;
  if (isError || !data)
    return <p className="text-sm text-red-500">Failed to load data</p>;

  return (
    <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-fit">
      <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3 pl-4 py-1">
        Audit Logs
      </h1>
      <AuditComponents data={data} />
    </div>
  );
};

export default AuditSection;
