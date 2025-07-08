"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AuditComponents from "@/components/dashboard/verifier/dashboard/AuditComponents";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLog {
  action: string;
  timestamp: string;
  user: string;
  details: string;
}

interface ParsedAudit {
  timestamp: string;
  verifier: string;
  actions: string;
  status: string;
  txnid: string;
}

const fetchAuditData = async (token: string): Promise<ParsedAudit[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/audit-logs/`,
    {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("Audit Logs Fetch Error:", error);
    throw new Error("Failed to fetch audit logs");
  }

  const json = await res.json();
  const results: AuditLog[] = json.results;

  return results.map((log) => {
    const invoiceMatch = log.details.match(/Invoice (\S+)/);
    const txnid = invoiceMatch ? invoiceMatch[1] : "N/A";

    let status = "Pending";
    if (log.action === "Verified") status = "Success";
    else if (log.action === "Rejected") status = "Failed";

    return {
      timestamp: new Date(log.timestamp).toLocaleString(),
      verifier: log.user,
      actions: log.action,
      status,
      txnid,
    };
  });
};

const AuditSection = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["audit-logs", token],
    queryFn: () => fetchAuditData(token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  if (isLoading || !token || !data) {
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

  if (isError) {
    return (
      <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-full">
        <p className="text-sm text-red-500 p-4">Failed to load audit logs.</p>
      </div>
    );
  }

  const limitedData = Array.isArray(data) ? data.slice(0, 6) : [];

  return (
    <div className="border border-[#A9A9A9] pt-3 rounded-[6px] w-full">
      <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3 pl-4 py-1">
        Audit Logs
      </h1>
      <AuditComponents data={limitedData} />
    </div>
  );
};

export default AuditSection;
