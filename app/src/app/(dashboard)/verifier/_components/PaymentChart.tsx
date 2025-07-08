"use client";

import React, { useEffect, useState } from "react";
import PaymentDistribution from "@/components/dashboard/verifier/dashboard/PaymentDistribution";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const legends = [
  { label: "Processing", color: "#465FFF" },
  { label: "Success", color: "#009959" },
  { label: "Failed", color: "#FD8B00" },
  { label: "Pending", color: "#0791A5" },
  { label: "Initiated", color: "#6D59FF" },
  { label: "Refunded", color: "#1E90FA" },
  { label: "Chargeback", color: "#EA1000" },
];

type PaymentStatus = {
  pending_invoices: number;
  paid_invoices: number;
  rejected_invoices: number;
  refunded_invoices: number;
  bad_debt_invoices: number;
};

const fetchPaymentDistribution = async (token: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/payment-status-distribution/`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Payment Distribution API error:", errorText);
    throw new Error("Failed to fetch payment status distribution");
  }

  const data: PaymentStatus = await res.json();

  // Mapping backend data to chart values
  const chartData = [
    { label: "Processing", value: data.pending_invoices },
    { label: "Success", value: data.paid_invoices },
    { label: "Failed", value: data.rejected_invoices },
    { label: "Pending", value: data.pending_invoices },
    { label: "Initiated", value: data.pending_invoices },
    { label: "Refunded", value: data.refunded_invoices },
    { label: "Chargeback", value: data.bad_debt_invoices },
  ];

  return chartData;
};

const PaymentChart = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      setToken(storedToken);
    }
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment-distribution", token],
    queryFn: () => fetchPaymentDistribution(token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  if (isLoading || !data) {
    return (
      <div className="flex flex-wrap gap-4 p-4">
        <Skeleton className="h-[250px] w-[320px] rounded-md" />
        <div className="flex-1 flex flex-col justify-center space-y-2">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-4 w-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 rounded-sm border-[1px] border-[#A9A9A9] p-4">
      <div>
        <h1 className="text-[#465FFF] text-[20px] font-semibold mb-2">
          Payment Status Distribution
        </h1>
        {/* Pass data to chart here */}
        <PaymentDistribution chartData={data} />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <ul className="space-y-2">
          {legends.map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: color }}
              ></span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentChart;
