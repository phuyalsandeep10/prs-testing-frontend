"use client";
import React from "react";
import { User, Loader2, AlertTriangle } from "lucide-react";
import { usePaymentVerificationStatus } from "@/hooks/api";
import styles from "./PaymentVerification.module.css";

const PaymentVerificationStatus = () => {
  const { data, isLoading, error, refetch } = usePaymentVerificationStatus();

  // Debug logging
  console.log("PaymentVerificationStatus Component State:", {
    data,
    isLoading,
    error,
  });

  const cleared = data?.verified?.total || 0;
  const notVerified = data?.pending?.total || 0;
  const rejected = data?.rejected?.total || 0;
  const total = cleared + notVerified + rejected;

  const clearedPercent = total > 0 ? (cleared / total) * 100 : 0;
  const notVerifiedPercent = total > 0 ? (notVerified / total) * 100 : 0;
  const rejectedPercent = total > 0 ? (rejected / total) * 100 : 0;

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full h-[295px] flex flex-col items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-md font-outfit font-medium text-red-500 mb-4">
          Failed to load payment verification data
        </p>
        <button
          className="text-sm font-medium font-outfit text-[#465FFF] border border-[#465FFF] rounded-md px-4 py-2 hover:bg-[#465FFF] hover:text-white transition-colors duration-150"
          onClick={() => refetch()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full h-[295px] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#465FFF]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full h-[295px] flex flex-col items-center justify-center">
        <User className="w-8 h-8 mb-2 text-gray-300" />
        <p className="text-sm font-outfit text-gray-500">
          No payment verification data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full h-[295px]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-lg font-semibold font-outfit text-gray-900">
            Payment Verification Status
          </h2>
          <p className="text-sm font-outfit text-gray-500 mt-1">
            View Detailed Sales Status
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">
            ${total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex rounded-lg overflow-hidden h-2 bg-gray-100">
          <div
            className={`bg-green-500 h-full ${styles.progressBar}`}
            style={{ '--progress-width': `${clearedPercent}%` } as React.CSSProperties}
          ></div>
          <div
            className={`bg-orange-400 h-full ${styles.progressBar}`}
            style={{ '--progress-width': `${notVerifiedPercent}%` } as React.CSSProperties}
          ></div>
          <div
            className={`bg-red-500 h-full ${styles.progressBar}`}
            style={{ '--progress-width': `${rejectedPercent}%` } as React.CSSProperties}
          ></div>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[21px] bg-green-500"></div>
            <span className="text-sm font-medium text-gray-900">
              ${cleared.toLocaleString()}
            </span>
          </div>
          <span className="text-sm text-gray-500">Cleared</span>
        </div>
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[21px] bg-orange-400"></div>
            <span className="text-sm font-medium text-gray-900">
              ${notVerified.toLocaleString()}
            </span>
          </div>
          <span className="text-sm text-gray-500">Not Verified</span>
        </div>
        <div className="flex items-center justify-between mb-[12px]">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-[21px] bg-red-500"></div>
            <span className="text-sm font-medium text-gray-900">
              ${rejected.toLocaleString()}
            </span>
          </div>
          <span className="text-sm text-gray-500">Rejected</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationStatus;
