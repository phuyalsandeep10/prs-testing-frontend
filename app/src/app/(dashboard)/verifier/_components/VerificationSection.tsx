"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import VerificationComponent from "@/components/dashboard/verifier/dashboard/VerificationComponent";
import { Skeleton } from "@/components/ui/skeleton";

const VerificationSection = () => {
  const fetchVerificationData = async () => {
    return [
      {
        ID: "TXN 001",
        client: "Yubesh Koirala",
        amount: "$200.00",
        status: "Pending",
        actions: "Verify",
      },
      {
        ID: "TXN 002",
        client: "Bhanu Raj Acharya",
        amount: "$200.00",
        status: "Pending",
        actions: "Verify",
      },
      {
        ID: "TXN 003",
        client: "Kushal Rai",
        amount: "$200.00",
        status: "Pending",
        actions: "Verify",
      },
      {
        ID: "TXN 004",
        client: "Pratigya Dhakal",
        amount: "$200.00",
        status: "Pending",
        actions: "Verify",
      },
      {
        ID: "TXN 005",
        client: "Pankaj Gurung",
        amount: "$200.00",
        status: "Pending",
        actions: "Verify",
      },
      {
        ID: "TXN 006",
        client: " Akhileshwor Magar",
        amount: "$200.00",
        status: "Pending",
        actions: "Verify",
      },
    ];
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verification-queue"],
    queryFn: fetchVerificationData,
  });

  if (isLoading)
    return (
      <div className="space-y-3 w-fit rounded-[6px] p-4">
        {/* Render skeleton rows resembling your verification data */}
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex space-x-4 items-center">
            <Skeleton className="w-20 h-6 rounded" /> {/* ID */}
            <Skeleton className="w-32 h-6 rounded" /> {/* client */}
            <Skeleton className="w-20 h-6 rounded" /> {/* amount */}
            <Skeleton className="w-24 h-6 rounded" /> {/* status */}
            <Skeleton className="w-20 h-6 rounded" /> {/* actions */}
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
