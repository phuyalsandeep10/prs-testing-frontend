"use client";

import React, { useState, useRef } from "react";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import pillsButton from "@/assets/icons/pills-button.svg";
import DealsTable from "@/components/dashboard/org-admin/deals/DealsTable";
import Image from "next/image";
import DealModal from "@/components/salesperson/Deal/DealModal";

const DealsPage = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add" as "add" | "edit" | "payment",
    dealId: null as string | null,
    dealData: null as any,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const actionButtonRef = useRef<HTMLButtonElement>(null);

  const openModal = (
    mode: "add" | "edit" | "payment",
    dealId?: string,
    dealData?: any
  ) => {
    setModalState({
      isOpen: true,
      mode,
      dealId: dealId || null,
      dealData: dealData || null,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleEditDeal = (dealId: string) => {
    // In a real app, you would fetch the deal data here
    const dealData = { id: dealId }; // Mock data
    openModal("edit", dealId, dealData);
  };

  const handleAddPayment = (dealId: string) => {
    openModal("payment", dealId);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Header Section */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold text-black font-outfit">
              Deal Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your user base, teams and access all the details of each
              user.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                className="pl-10 w-[320px] h-[40px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100">
              <Image
                src={pillsButton}
                alt="Pills Button"
                width={40}
                height={40}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <DealsTable
          onEditDeal={handleEditDeal}
          onAddPayment={handleAddPayment}
          searchTerm={searchTerm}
        />
      </div>

      {/* Unified Deal Modal */}
      <DealModal
        isOpen={modalState.isOpen}
        onOpenChange={closeModal}
        anchorRef={actionButtonRef}
        mode={modalState.mode}
        dealId={modalState.dealId}
        dealData={modalState.dealData}
      />
    </div>
  );
};

export default DealsPage;
