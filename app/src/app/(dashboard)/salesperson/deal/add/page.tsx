"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import DealForm from "@/components/salesperson/Deal/DealForm";

const AddDealPage = () => {
  const router = useRouter();

  const handleDealSave = (dealData: any) => {
    console.log('Deal saved:', dealData);
    // Implement deal save logic here
    router.push('/salesperson/deal'); // Navigate back to deals page
  };

  const handleCancel = () => {
    router.push('/salesperson/deal'); // Navigate back to deals page
  };

  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Header Section */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-[28px] font-semibold text-[#4F46E5] font-outfit">
              Add New Deal
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create a new deal and manage payment information.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DealForm />
        </div>
      </div>
    </div>
  );
};

export default AddDealPage; 