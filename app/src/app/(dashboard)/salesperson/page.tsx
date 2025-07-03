"use client";
import Acheve from "@/components/salesperson/Dashboard/Acheve";
import ChartDashboard from "@/components/salesperson/Dashboard/Chart";
import Outstanding from "@/components/salesperson/Dashboard/Outstanding";
import PaymentVerificationStatus from "@/components/salesperson/Dashboard/PaymentVerification";
import Shortcuts from "@/components/salesperson/Dashboard/Shortcut";
import Standing from "@/components/salesperson/Dashboard/Standing";
import Streaks from "@/components/salesperson/Dashboard/Streaks";

export default function SalespersonDashboard({ isSidebarCollapsed }) {
  return (
    <div className="min-h-screen bg-gray-50 px-8 py-4">
      <div className="flex justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold font-outfit text-[#000000] mb-1">
            Dashboard
          </h1>
          <p className="text-[14px] font-normal font-outfit text-[#7E7E7E]">
            View your overall stats and metrics at one place. Boost your
            productivity.
          </p>
        </div>
        <Streaks total={5} active={3} />
      </div>
      <div className="grid grid-cols-3 gap-[20px] w-full">
        {/* Acheve spans first two columns */}
        <div className="col-span-2">
          <Acheve />
        </div>
        {/* Standing spans third column and two rows */}
        <div className="row-span-2">
          <Standing />
        </div>
        {/* PaymentVerificationStatus in first column */}
        <div className="col-span-1">
          <PaymentVerificationStatus />
        </div>
        {/* Shortcuts in second column */}
        <div className="col-span-1">
          <Shortcuts />
        </div>
        {/* Outstanding in first column */}
        <div className="col-span-1">
          <Outstanding />
        </div>
        {/* ChartDashboard spans second and third columns */}
        <div className="col-span-2">
          <ChartDashboard />
        </div>
      </div>
    </div>
  );
}
