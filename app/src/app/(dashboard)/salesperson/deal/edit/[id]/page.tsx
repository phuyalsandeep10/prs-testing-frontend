"use client";

import React, { use } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DealForm from "@/components/salesperson/Deal/DealForm";

interface EditDealPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditDealPage = ({ params }: EditDealPageProps) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const dealId = resolvedParams.id;

  const handleCancel = () => {
    router.push("/salesperson/deal");
  };

  // Don't render the form if dealId is not available
  if (!dealId) {
    return (
      <div className="min-h-screen bg-gray-50 font-outfit">
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
                Edit Deal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Invalid deal ID. Please go back and try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Edit Deal
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Edit deal information and manage payment details.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <DealForm mode="edit" dealId={dealId} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
};

export default EditDealPage;
