"use client";
import React, { useMemo } from "react";
import { User, Loader2, AlertTriangle } from "lucide-react";
import { useDashboard } from "@/hooks/api";
import satisfied from "@/assets/photo/100.png";
import neutral from "@/assets/photo/75.png";
import unsatisfied from "@/assets/photo/35.png";
import Image from "next/image";

const Outstanding: React.FC = () => {
  const { data, isLoading, error, refetch } = useDashboard();

  const deals = useMemo(() => {
    return data?.outstanding_deals
      ? [...data.outstanding_deals]
          .sort((a, b) => b.deal_value - a.deal_value)
          .slice(0, 5)
      : [];
  }, [data?.outstanding_deals]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColors = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
    ];
    return colors[index % colors.length];
  };

  const getSatisfactionImage = (level: string) => {
    switch (level) {
      case "satisfied":
        return satisfied;
      case "neutral":
        return neutral;
      case "unsatisfied":
        return unsatisfied;
      default:
        return neutral;
    }
  };

  if (error) {
    return (
      <div className="w-full min-h-[295px]">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-md font-outfit font-medium text-red-500 mb-4">
            Failed to load outstanding deals
          </p>
          <button
            className="text-sm font-medium font-outfit text-[#465FFF] border border-[#465FFF] rounded-md px-4 py-2 hover:bg-[#465FFF] hover:text-white transition-colors duration-150"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[295px]">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 pt-7 pb-5">
          <h2 className="text-xl font-semibold text-[#000000] font-outfit">
            Deals with Outstanding Payments
          </h2>
        </div>

        {isLoading && (
          <div className="p-6 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#465FFF]" />
          </div>
        )}

        <div className="overflow-y-auto max-h-[300px]">
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className="px-4 sm:px-5 py-2 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Avatar + Satisfaction Image */}
                  <div className="w-[40px] h-[40px] flex items-center justify-center border border-gray-300 rounded-md bg-gray-400">
                    <Image
                      src={getSatisfactionImage(deal.client_satisfaction)}
                      alt={`Client satisfaction: ${
                        deal.client_satisfaction || "neutral"
                      }`}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {deal.client_name}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {formatAmount(deal.deal_value)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {deals.length === 0 && !isLoading && (
          <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No outstanding payments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Outstanding;
