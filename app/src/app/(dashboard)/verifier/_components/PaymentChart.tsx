"use client";

import React, { useMemo } from "react";
import styles from './PaymentChart.module.css';
import PaymentDistribution from "@/components/dashboard/verifier/dashboard/PaymentDistribution";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifierDataContext } from "./VerifierDataProvider";
import { normalizePaymentDistributionResponse } from "../_utils/apiResponseNormalizers";

const legends = [
  { label: "Processing", color: "#465FFF" },
  { label: "Success", color: "#009959" },
  { label: "Failed", color: "#FD8B00" },
  { label: "Pending", color: "#0791A5" },
  { label: "Initiated", color: "#6D59FF" },
  { label: "Refunded", color: "#1E90FA" },
  { label: "Chargeback", color: "#EA1000" },
];

const PaymentChart = () => {
  const { paymentDistributionData, paymentDistributionLoading, paymentDistributionError } = useVerifierDataContext();

  // Memoize chart data transformation
  const data = useMemo(() => {
    if (!paymentDistributionData) return null;

    // Use normalizer for consistent data structure
    const normalized = normalizePaymentDistributionResponse(paymentDistributionData);

    return [
      { label: "Processing", value: normalized.processing_invoices },
      { label: "Success", value: normalized.paid_invoices },
      { label: "Failed", value: normalized.rejected_invoices },
      { label: "Pending", value: normalized.pending_invoices },
      { label: "Initiated", value: normalized.initiated_invoices },
      { label: "Refunded", value: normalized.refunded_invoices },
      { label: "Chargeback", value: normalized.bad_debt_invoices },
    ];
  }, [paymentDistributionData]);

  if (paymentDistributionLoading || !data) {
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

  if (paymentDistributionError) {
    return (
      <div className="flex flex-wrap gap-4 rounded-sm border-[1px] border-[#A9A9A9] p-4">
        <div className="text-center w-full">
          <p className="text-red-500 text-sm mb-2">Failed to load payment distribution</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:text-blue-600 text-xs underline"
          >
            Retry
          </button>
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
                className={`inline-block w-[8px] h-[8px] rounded-full ${styles.legendColor}`}
                style={{ '--legend-color': color } as React.CSSProperties}
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
