"use client";

import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DealsTable from "@/components/dashboard/salesperson/deals/DealsTable";
import DealForm from "@/components/salesperson/Deal/DealForm";
import PaymentForm from "@/components/salesperson/payment/PaymentForm";
import DealFilter from "@/components/salesperson/Deal/DealFilter";
import AddPayment from "@/components/salesperson/Deal/AddPayment";
import SlideModal from "@/components/ui/SlideModal";

const DealsPage = () => {
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showEditDealModal, setShowEditDealModal] = useState(false);
  const [showPaymentFormModal, setShowPaymentFormModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEditDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setShowEditDealModal(true);
  };

  const handleAddPayment = (dealId: string) => {
    setSelectedDealId(dealId);
    setShowAddPaymentModal(true);
  };

  const handleFilterApply = (filters: any) => {
    console.log('Applied filters:', filters);
    // Implement filter logic here
  };

  const handlePaymentSave = (paymentData: any) => {
    console.log('Payment saved:', paymentData);
    // Implement payment save logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exact Figma Header Implementation - Matching manage-users layout */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Deal Management
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your deals, payments and access all the details of each deal.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input - RIGHT SIDE as per Figma */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Create Button - RIGHT SIDE as per Figma */}
            <Button 
              onClick={() => setShowAddDealModal(true)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add New Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container - Exact Figma Layout */}
      <div className="px-8 py-6">
        <DealsTable 
          onEditDeal={handleEditDeal}
          onAddPayment={handleAddPayment}
        />
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <DealFilter
          onClose={() => setShowFilterModal(false)}
          onApplyFilter={handleFilterApply}
        />
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <AddPayment
          onClose={() => setShowAddPaymentModal(false)}
          onSave={handlePaymentSave}
        />
      )}

      {/* Add Deal Modal */}
      {showAddDealModal && (
        <SlideModal
          isOpen={showAddDealModal}
          onClose={() => setShowAddDealModal(false)}
          title="Add New Deal"
          width="xl"
        >
          <DealForm mode="add" />
        </SlideModal>
      )}

      {/* Edit Deal Modal */}
      {showEditDealModal && (
        <SlideModal
          isOpen={showEditDealModal}
          onClose={() => setShowEditDealModal(false)}
          title="Edit Deal"
          width="xl"
        >
          <DealForm mode="edit" dealId={selectedDealId} />
        </SlideModal>
      )}

      {/* Payment Form Modal */}
      {showPaymentFormModal && (
        <SlideModal
          isOpen={showPaymentFormModal}
          onClose={() => setShowPaymentFormModal(false)}
          title="Payment Form"
          width="lg"
        >
          <PaymentForm />
        </SlideModal>
      )}
    </div>
  );
};

export default DealsPage;
