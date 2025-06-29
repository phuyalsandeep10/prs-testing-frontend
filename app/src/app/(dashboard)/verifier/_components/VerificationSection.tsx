'use client'
import React from "react";
import { useQuery } from "@tanstack/react-query";
import VerificationComponent from "@/components/dashboard/verifier/dashboard/VerificationComponent";

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

  if (isLoading) return <p className="text-sm text-gray-600">Loading...</p>;
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
