'use client'
import PaymentOverview from "@/components/dashboard/verifier/dashboard/PaymentOverview";
import React from "react";
import { useQuery } from "@tanstack/react-query";

const fetchInvoiceStatusOverview = async () => {
  await new Promise((res) => setTimeout(res, 800));
  return [
    {
      label: "Paid Invoice",
      count: "5",
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Overdue Invoices",
      count: "5",
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Pending Invoices",
      count: "5",
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Refunded Invoices",
      count: "5",
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "Disputed Invoices",
      count: "5",
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "Processing Invoices",
      count: "5",
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
};

const fetchPaymentMethodsBreakdown = async () => {
  await new Promise((res) => setTimeout(res, 800));
  return [
    {
      label: "Credit Card",
      count: "5",
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Bank Transfer",
      count: "5",
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Mobile Wallet",
      count: "5",
      color: "#FFCA89",
      textColor: "#814804",
    },
    { label: "Cheque", count: "5", color: "#C0C8FD", textColor: "#0E00D0" },
    { label: "QR Payment", count: "5", color: "#FBDAB1", textColor: "#666403" },
    {
      label: "In-Hand Cash",
      count: "5",
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
  ];
};

const fetchPaymentFailureReasons = async () => {
  await new Promise((res) => setTimeout(res, 800));
  return [
    {
      label: "Insufficient Funds",
      count: "5",
      color: "#C1EAD9",
      textColor: "#026C40",
    },
    {
      label: "Invalid Card",
      count: "5",
      color: "#FBD0D0",
      textColor: "#A90101",
    },
    {
      label: "Bank Decline",
      count: "5",
      color: "#FFCA89",
      textColor: "#814804",
    },
    {
      label: "Technical Error",
      count: "5",
      color: "#C0C8FD",
      textColor: "#0E00D0",
    },
    {
      label: "Cheque Bounce",
      count: "5",
      color: "#FBDAB1",
      textColor: "#666403",
    },
    {
      label: "Payment Received but Not Reflected",
      count: "5",
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

  if (invoiceLoading || methodsLoading || failureLoading)
    return <p>Loading Payment Data...</p>;

  if (invoiceError || methodsError || failureError)
    return <p>Error loading payment data.</p>;

  return (
    <div className="flex flex-wrap gap-10">
      <PaymentOverview
        title="Invoice Status Overview"
        className="bg-[#FFFFFF] h-auto w-[367px]"
        subtitles={invoiceStatus || []}
      />

      <PaymentOverview
        title="Payment Methods Breakdown"
        className="bg-[#FFFFFF] h-auto w-[367px]"
        subtitles={paymentMethods || []}
      />

      <PaymentOverview
        title="Payment Failure Reasons"
        className="bg-[#FFFFFF] h-auto w-[367px]"
        subtitles={failureReasons || []}
      />
    </div>
  );
};

export default PaymentSection;
