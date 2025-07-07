"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Acheve from "@/components/salesperson/Dashboard/Acheve";
import ChartDashboard from "@/components/salesperson/Dashboard/Chart";
import Outstanding from "@/components/salesperson/Dashboard/Outstanding";
import PaymentVerificationStatus from "@/components/salesperson/Dashboard/PaymentVerification";
import Shortcuts from "@/components/salesperson/Dashboard/Shortcut";
import Standing from "@/components/salesperson/Dashboard/Standing";
import PersonalGoal from "@/components/salesperson/Dashboard/PersonalGoal";
import Streaks from "@/components/salesperson/Dashboard/Streaks";
import { useDashboardStore } from "@/store/apiCall/Achieve";

export default function SalespersonDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data, sendRequest, loading, error } = useDashboardStore();
  const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/dashboard/`;

  const refreshDashboard = () => {
    sendRequest("GET", endpoint);
  };

  useEffect(() => {
    setMounted(true);
    refreshDashboard(); // Fetch dashboard data on mount
  }, []);

  useEffect(() => {
    if (data) {
      const currentTarget = parseFloat(data.sales_progress?.target || "0");
      if (currentTarget === 1) {
        setIsModalOpen(true);
        const html = document.documentElement;
        html.classList.add("overflow-hidden", "pointer-events-none");
      } else {
        setIsModalOpen(false);
        const html = document.documentElement;
        html.classList.remove("overflow-hidden", "pointer-events-none");
      }
    }
  }, [data]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    const html = document.documentElement;
    html.classList.remove("overflow-hidden", "pointer-events-none");
    html.style.removeProperty("pointer-events");
    document.body.style.removeProperty("pointer-events");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-4 relative">
      {isModalOpen &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60"
            onClick={handleCloseModal}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center pointer-events-auto"
            >
              <PersonalGoal
                onClose={handleCloseModal}
                refreshDashboard={refreshDashboard}
              />
            </div>
          </div>,
          document.body
        )}

      <div className={isModalOpen ? "opacity-50" : ""}>
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
          <Streaks />
        </div>
        <div className="grid grid-cols-3 gap-[20px] w-full">
          <div className="col-span-2">
            <Acheve />
          </div>
          <div className="row-span-2">
            <Standing />
          </div>
          <div className="col-span-1">
            <PaymentVerificationStatus />
          </div>
          <div className="col-span-1">
            <Shortcuts />
          </div>
          <div className="col-span-1">
            <Outstanding />
          </div>
          <div className="col-span-2">
            <ChartDashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
