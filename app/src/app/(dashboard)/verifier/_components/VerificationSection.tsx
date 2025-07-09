"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import VerificationComponent from "@/components/dashboard/verifier/dashboard/VerificationComponent";
import { Skeleton } from "@/components/ui/skeleton";

const fetchVerificationData = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/verification-queue/`,
    {
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch verification queue");

  const data = await res.json();

  const slicedData = Array.isArray(data) ? data.slice(0, 6) : [];

  return slicedData.map((item: any) => ({
    ID: item.invoice_id || "N/A",
    client: item.client_name || "Unknown",
    amount: item.payment_amount
      ? `$${parseFloat(item.payment_amount).toFixed(2)}`
      : "$0.00",
    status:
      item.invoice_status === "pending"
        ? "Pending"
        : item.invoice_status || "Unknown",
    actions: "Verify", // Static for now
  }));
};

const VerificationSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["verification-queue"],
    queryFn: fetchVerificationData,
  });

  if (isLoading)
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

  if (isError || !data)
    return <p className="text-sm text-red-500">Failed to load data</p>;

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
