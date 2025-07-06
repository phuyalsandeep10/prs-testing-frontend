"use client";
import React, { useEffect, useMemo } from "react";
import { User } from "lucide-react";
import { useDashboardStore } from "@/store/apiCall/Achieve";

const Outstanding: React.FC = () => {
  const { data, loading, error, sendRequest, cancel } = useDashboardStore();

  useEffect(() => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/`;
    sendRequest("GET", endpoint);
    return () => cancel(endpoint); // Cancel request on unmount
  }, [sendRequest, cancel]);

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

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.message} {error.status && `(${error.status})`}
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
        {loading[`${process.env.NEXT_PUBLIC_API_URL}/dashboard/`] && (
          <div className="text-center py-8">Loading...</div>
        )}
        <div className="overflow-y-auto max-h-[300px]">
          {deals.map((deal, index) => (
            <div
              key={deal.id}
              className="px-4 sm:px-5 py-2 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`min-w-[40px] min-h-[40px] rounded-md flex items-center justify-center text-white text-md font-outfit font-medium ${getAvatarColors(
                      index
                    )}`}
                  >
                    <span>{getInitials(deal.client_name)}</span>
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
        {deals.length === 0 &&
          !loading[`${process.env.NEXT_PUBLIC_API_URL}/dashboard/`] && (
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
