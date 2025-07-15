"use client";
import { useEffect, useState } from "react";
import SlideModal from "@/components/ui/SlideModal";
import Acheve from "@/components/salesperson/Dashboard/Acheve";
import ChartDashboard from "@/components/salesperson/Dashboard/Chart";
import Outstanding from "@/components/salesperson/Dashboard/Outstanding";
import PaymentVerificationStatus from "@/components/salesperson/Dashboard/PaymentVerification";
import Shortcuts from "@/components/salesperson/Dashboard/Shortcut";
import Standing from "@/components/salesperson/Dashboard/Standing";
import PersonalGoal from "@/components/salesperson/Dashboard/PersonalGoal";
import Streaks from "@/components/salesperson/Dashboard/Streaks";
import { useDashboard } from "@/hooks/api";
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function SalespersonDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data, isLoading, error, refetch } = useDashboard();

  const refreshDashboard = () => {
    refetch();
  };

  useEffect(() => {
    setMounted(true);
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
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 px-8 py-4 relative">
        <SlideModal
          isOpen={isModalOpen && mounted}
          onClose={handleCloseModal}
          title="Personal Goal"
          width="lg"
          showCloseButton={true}
        >
          <PersonalGoal
            onClose={handleCloseModal}
            refreshDashboard={refreshDashboard}
          />
        </SlideModal>
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
              <ErrorBoundary>
                <Acheve />
              </ErrorBoundary>
            </div>
            <div className="row-span-2">
              <ErrorBoundary>
                <Standing />
              </ErrorBoundary>
            </div>
            <div className="col-span-1">
              <PaymentVerificationStatus />
            </div>
            <div className="col-span-1">
              <Shortcuts />
            </div>
            <div className="col-span-1">
              <ErrorBoundary>
                <Outstanding />
              </ErrorBoundary>
            </div>
            <div className="col-span-2">
              <ErrorBoundary>
                <ChartDashboard />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
