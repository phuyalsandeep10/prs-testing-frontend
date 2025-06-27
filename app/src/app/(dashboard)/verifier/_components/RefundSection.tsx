'use client'
import React from "react";
import { useQuery } from "@tanstack/react-query";
import RefundComponent from "@/components/dashboard/verifier/dashboard/RefundComponent";

const fetchRefunds = async () => {
  await new Promise((res) => setTimeout(res, 500));
  return [
    {
      transactionId: "TXN 001",
      client: "Joshna Khadka",
      amount: "$ 2,000.00",
      status: "Refunded",
      reasons: "Customer Reports",
      date: "2025-10-26 14:34",
    },
    {
      transactionId: "TXN 002",
      client: "Bomb Padka",
      amount: "$ 2,000.00",
      status: "Chargeback",
      reasons: "Unauthorized Transactions",
      date: "2025-10-26 14:34",
    },
    {
      transactionId: "TXN 003",
      client: "Abinash Babu Tiwari",
      amount: "$ 2,000.00",
      status: "Refunded",
      reasons: "Customer Reports",
      date: "2025-10-26 14:34",
    },
    {
      transactionId: "TXN 004",
      client: "Prekxya Adhikari",
      amount: "$ 2,000.00",
      status: "Chargeback",
      reasons: "Unauthorized Transactions",
      date: "2025-10-26 14:34",
    },
    {
      transactionId: "TXN 005",
      client: "Yubina Koirala",
      amount: "$ 2,000.00",
      status: "Refunded",
      reasons: "Customer Reports",
      date: "2025-10-26 14:34",
    },
  ];
};

const RefundSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["refunds"],
    queryFn: fetchRefunds,
  });

  return (
    <div>
      <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3">
        Recent Refunds and Chargebacks
      </h1>

      {isLoading && <p>Loading refunds...</p>}
      {isError && <p>Failed to load refund data.</p>}
      {data && <RefundComponent data={data} />}
    </div>
  );
};

export default RefundSection;
