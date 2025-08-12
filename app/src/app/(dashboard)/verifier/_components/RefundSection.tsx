"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import RefundComponent from "@/components/dashboard/verifier/dashboard/RefundComponent";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./RefundSection.module.css";

const fetchRefunds = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/recent-refunds-or-bad-debts/`,
    {
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch refund data");

  const data = await res.json();

  const slicedData = Array.isArray(data) ? data.slice(0, 5) : [];

  return slicedData.map((item: any) => {
    const status =
      item.invoice_status === "bad_debt"
        ? "Bad Debt"
        : item.invoice_status === "refunded"
        ? "Refunded"
        : item.invoice_status || "Unknown";

    const reasons =
      item.invoice_status === "bad_debt"
        ? item.failure_remarks || "No failure reason"
        : item.invoice_status === "refunded"
        ? item.approved_remarks || "No approved remarks"
        : "No remarks";

    return {
      transactionId: item.invoice_id || "N/A",
      client: item.client_name || "Unknown",
      amount: item.payment_amount
        ? `$ ${parseFloat(item.payment_amount).toFixed(2)}`
        : "$ 0.00",
      status,
      reasons,
      date: item.approval_date || "N/A",
    };
  });
};

const RefundSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["refunds"],
    queryFn: fetchRefunds,
  });

  return (
    <div>
      {!isLoading && (
        <h1 className="text-[#465FFF] text-[20px] font-semibold mb-3">
          Recent Refunds and Bad Debts
        </h1>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className={`flex justify-between space-x-4 ${styles.skeletonRow}`}
            >
              <Skeleton className="w-20 h-6 rounded" />
              <Skeleton className="w-32 h-6 rounded" />
              <Skeleton className="w-20 h-6 rounded" />
              <Skeleton className="w-24 h-6 rounded" />
              <Skeleton className="w-36 h-6 rounded" />
              <Skeleton className="w-36 h-6 rounded" />
            </div>
          ))}
        </div>
      )}

      {isError && <p className="text-red-500">Failed to load refund data.</p>}

      {!isLoading && data && <RefundComponent data={data} />}
    </div>
  );
};

export default RefundSection;
