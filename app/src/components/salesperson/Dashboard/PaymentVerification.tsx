"use client";
import React, { useEffect } from "react";
import { User } from "lucide-react";
import { useDashboardStore } from "@/store/apiCall/Achieve";

const PaymentVerificationStatus = () => {
  const { data, loading, error, sendRequest, cancel, retry } =
    useDashboardStore();
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/dashboard/`;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      console.error(
        "NEXT_PUBLIC_API_URL is not defined in environment variables"
      );
      return;
    }

    sendRequest("GET", endpoint);
    return () => cancel(endpoint); // Cancel request on unmount
  }, [sendRequest, cancel]);

  // Debug logging
  useEffect(() => {
    console.log("PaymentVerificationStatus Component State:", {
      data,
      loading: loading[endpoint],
      error,
    });
  }, [data, loading, error, endpoint]);

  const cleared = data?.verification_status?.verified?.total || 0;
  const notVerified = data?.verification_status?.pending?.total || 0;
  const rejected = data?.verification_status?.rejected?.total || 0;
  const total = cleared + notVerified + rejected;

  const clearedPercent = total > 0 ? (cleared / total) * 100 : 0;
  const notVerifiedPercent = total > 0 ? (notVerified / total) * 100 : 0;
  const rejectedPercent = total > 0 ? (rejected / total) * 100 : 0;

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full h-[295px] flex flex-col items-center justify-center">
        <p className="text-md font-outfit font-medium text-red-500 mb-4">
          {error.displayMessage}
        </p>
        <button
          className="text-sm font-medium font-outfit text-[#465FFF] border border-[#465FFF] rounded-md px-4 py-2 hover:bg-[#465FFF] hover:text-white transition-colors duration-150"
          onClick={() => retry()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (loading[endpoint]) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full h-[295px] flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#465FFF]"></div>
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
            className="bg-green-500 h-full"
            style={{ width: `${clearedPercent}%` }}
          ></div>
          <div
            className="bg-orange-400 h-full"
            style={{ width: `${notVerifiedPercent}%` }}
          ></div>
          <div
            className="bg-red-500 h-full"
            style={{ width: `${rejectedPercent}%` }}
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
