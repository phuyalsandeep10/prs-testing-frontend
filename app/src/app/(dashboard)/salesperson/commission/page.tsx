"use client";

import React, { useState } from "react";
import RegularClientSection from "./_components/RegularClientSection";
import TopClientSection from "./_components/TopClientSection";
import ClientDetailsSection from "./_components/ClientDetailsSection";
import CommissionSection from "./_components/CommisionSection";
import { CommissionPeriodProvider, type CommissionPeriod } from "./_components/CommissionPeriodProvider";
import { CommissionErrorBoundary } from "./_components/CommissionErrorBoundary";
import { CommissionDataProvider } from "./_components/CommissionDataProvider";

const CommissionPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <CommissionPeriodProvider defaultPeriod="monthly">
      <CommissionDataProvider>
        <div className="min-h-screen bg-gray-50">
      {/* Use 10px padding for consistent margin */}
      <div className="px-[10px] py-6">
        {/* Header section with title and search */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="space-y-1 ml-6">
            <h1 className="text-[20px] font-semibold">Commission</h1>
            <p className="text-[#7E7E7E] text-[14px] text-normal">
              View your Obtained Commission based on your Sales Goals.
            </p>
          </div>

          <div className="relative w-full sm:w-52 mr-7">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              width="16"
              height="16"
              viewBox="0 0 11 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.0155 7.78301L10.1568 9.92436L9.44975 10.6315L7.3084 8.49011C6.53845 9.10611 5.562 9.47461 4.5 9.47461C2.016 9.47461 0 7.45861 0 4.97461C0 2.49061 2.016 0.474609 4.5 0.474609C6.984 0.474609 9 2.49061 9 4.97461C9 6.03661 8.6315 7.01306 8.0155 7.78301ZM7.01235 7.41201C7.62375 6.78191 8 5.92241 8 4.97461C8 3.04086 6.43375 1.47461 4.5 1.47461C2.56625 1.47461 1 3.04086 1 4.97461C1 6.90836 2.56625 8.47461 4.5  ascended_at 8.47461C5.4478 8.47461C6.3073 8.09836C6.9374 7.48696L7.01235 7.41201Z"
                fill="#6B7280"
              />
            </svg>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Main grid container with fixed height */}
        <div className="h-[322px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[10px] mb-10 mr-5 ml-4">
          <section className="h-full">
            <CommissionErrorBoundary>
              <CommissionSection />
            </CommissionErrorBoundary>
          </section>

          <section className="h-full mt-2">
            <CommissionErrorBoundary>
              <TopClientSection />
            </CommissionErrorBoundary>
          </section>

          <section className="h-full">
            <CommissionErrorBoundary>
              <RegularClientSection />
            </CommissionErrorBoundary>
          </section>
        </div>

        {/* Bottom full-width section */}
        <div className="mt-6">
          <CommissionErrorBoundary>
            <ClientDetailsSection searchQuery={searchQuery} />
          </CommissionErrorBoundary>
        </div>
        </div>
        </div>
      </CommissionDataProvider>
    </CommissionPeriodProvider>
  );
};

export default CommissionPage;
