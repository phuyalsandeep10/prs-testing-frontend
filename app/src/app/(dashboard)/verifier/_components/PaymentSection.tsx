"use client";

import React, { useMemo } from "react";
import PaymentOverview from "@/components/dashboard/verifier/dashboard/PaymentOverview";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerifierDataContext } from "./VerifierDataProvider";
import { 
  normalizeInvoiceStatusResponse, 
  normalizePaymentMethodsResponse, 
  normalizePaymentFailureResponse,
  transformForInvoiceStatusDisplay,
  transformForPaymentMethodsDisplay,
  transformForPaymentFailureDisplay
} from "../_utils/apiResponseNormalizers";

const PaymentSection = () => {
  const {
    invoiceStatusData,
    invoiceStatusLoading,
    invoiceStatusError,
    paymentMethodsData,
    paymentMethodsLoading,
    paymentMethodsError,
    paymentFailureData,
    paymentFailureLoading,
    paymentFailureError,
  } = useVerifierDataContext();

  // Memoize transformed data for each section
  const invoiceStatus = useMemo(() => {
    if (!invoiceStatusData) return [];
    const normalized = normalizeInvoiceStatusResponse(invoiceStatusData);
    return transformForInvoiceStatusDisplay(normalized);
  }, [invoiceStatusData]);

  const paymentMethods = useMemo(() => {
    if (!paymentMethodsData) return [];
    const normalized = normalizePaymentMethodsResponse(paymentMethodsData);
    return transformForPaymentMethodsDisplay(normalized);
  }, [paymentMethodsData]);

  const failureReasons = useMemo(() => {
    if (!paymentFailureData) return [];
    const normalized = normalizePaymentFailureResponse(paymentFailureData);
    return transformForPaymentFailureDisplay(normalized);
  }, [paymentFailureData]);

  const isLoading = invoiceStatusLoading || paymentMethodsLoading || paymentFailureLoading;
  const isError = invoiceStatusError || paymentMethodsError || paymentFailureError;

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-10">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-[376px] h-[220px] rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-sm text-red-500 mb-2">Error loading payment data.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-500 hover:text-blue-600 text-xs underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-10 w-full">
        <PaymentOverview
          title="Deal Status Overview"
          className="bg-[#FFFFFF] h-auto flex-1 min-w-[300px]"
          subtitles={invoiceStatus}
        />
        <PaymentOverview
          title="Payment Methods Breakdown"
          className="bg-[#FFFFFF] h-auto flex-1 min-w-[300px]"
          subtitles={paymentMethods}
        />
        <PaymentOverview
          title="Deal Failure Reasons"
          className="bg-[#FFFFFF] h-auto flex-1 min-w-[300px]"
          subtitles={failureReasons}
        />
      </div>
    </div>
  );
};

export default PaymentSection;
