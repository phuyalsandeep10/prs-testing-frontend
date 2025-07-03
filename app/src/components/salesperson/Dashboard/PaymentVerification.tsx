"use client";
import React from "react";

const PaymentVerificationStatus = () => {
  const cleared = 2000;
  const notVerified = 2000;
  const rejected = 1000;
  const total = cleared + notVerified + rejected;

  const clearedPercent = (cleared / total) * 100;
  const notVerifiedPercent = (notVerified / total) * 100;
  const rejectedPercent = (rejected / total) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 w-full  h-[295px]">
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
