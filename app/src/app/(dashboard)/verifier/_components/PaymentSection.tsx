"use client";

import React from "react";
import PaymentOverview from "@/components/dashboard/verifier/dashboard/PaymentOverview";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const fetchInvoiceStatusOverview = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/invoice-status/`,
    {
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch invoice status");

  const data = await res.json();

  return [
    {
      label: "Completed Deal",
      count: Math.floor(data.paid_invoices || 0).toString(),
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Overdue Deal",
      count: Math.floor(data.pending_invoices || 0).toString(),
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Pending Deal",
      count: Math.floor(data.pending_invoices || 0).toString(),
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Refunded Deal",
      count: Math.floor(data.refunded_invoices || 0).toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "Disputed Deal",
      count: Math.floor(data.rejected_invoices || 0).toString(),
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "Processing Deal",
      count: Math.floor(data.pending_invoices || 0).toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
  
};

const fetchPaymentMethodsBreakdown = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/payment-methods/`,
    {
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch payment methods");

  const data = await res.json();

  return [
    {
      label: "Credit Card",
      count: Math.floor(data.credit_card || 0).toString(),
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Bank Transfer",
      count: Math.floor(data.bank_transfer || 0).toString(),
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Mobile Wallet",
      count: Math.floor(data.mobile_wallet || 0).toString(),
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Cheque",
      count: Math.floor(data.cheque || 0).toString(),
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "QR Payment",
      count: Math.floor(data.qr_payment || 0).toString(),
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "In-Hand Cash",
      count: "5", // Already an integer string
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
  
};

const fetchPaymentFailureReasons = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/payment-failure-reasons/`,
    {
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch failure reasons");

  const data = await res.json();

  return [
    {
      label: "Insufficient Funds",
      count: data.insufficient_funds?.toString() || "0",
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Invalid Card",
      count: data.invalid_card?.toString() || "0",
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Bank Decline",
      count: data.bank_decline?.toString() || "0",
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Technical Error",
      count: data.technical_error?.toString() || "0",
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "Cheque Bounce",
      count: data.cheque_bounce?.toString() || "0",
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "Payment Received but Not Reflected",
      count: data.payment_received_not_reflected?.toString() || "0",
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
};

const PaymentSection = () => {
  const {
    data: invoiceStatus,
    isLoading: invoiceLoading,
    isError: invoiceError,
  } = useQuery({
    queryKey: ["invoiceStatusOverview"],
    queryFn: fetchInvoiceStatusOverview,
  });

  const {
    data: paymentMethods,
    isLoading: methodsLoading,
    isError: methodsError,
  } = useQuery({
    queryKey: ["paymentMethodsBreakdown"],
    queryFn: fetchPaymentMethodsBreakdown,
  });

  const {
    data: failureReasons,
    isLoading: failureLoading,
    isError: failureError,
  } = useQuery({
    queryKey: ["paymentFailureReasons"],
    queryFn: fetchPaymentFailureReasons,
  });

  const isLoading = invoiceLoading || methodsLoading || failureLoading;
  const isError = invoiceError || methodsError || failureError;

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
    return <p className="text-sm text-red-500">Error loading payment data.</p>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-10 w-full">
        <PaymentOverview
          title="Deal Status Overview"
          className="bg-[#FFFFFF] h-auto flex-1 min-w-[300px]"
          subtitles={invoiceStatus || []}
        />
        <PaymentOverview
          title="Payment Methods Breakdown"
          className="bg-[#FFFFFF] h-auto flex-1 min-w-[300px]"
          subtitles={paymentMethods || []}
        />
        <PaymentOverview
          title="Deal Failure Reasons"
          className="bg-[#FFFFFF] h-auto flex-1 min-w-[300px]"
          subtitles={failureReasons || []}
        />
      </div>
    </div>
  );
};

export default PaymentSection;
