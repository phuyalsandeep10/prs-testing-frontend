"use client";
import React from "react";
import { User } from "lucide-react";
import Image from "next/image";

interface Deal {
  id: string;
  personName: string;
  projectName: string;
  amount: number;
  avatar?: string;
  initials?: string;
}

const sampleDeals: Deal[] = [
  {
    id: "1",
    personName: "Abinash Tiwari",
    projectName: "Project AB",
    amount: 20000,
    initials: "AT",
  },
  {
    id: "2",
    personName: "Pankaj Gurung",
    projectName: "Project Web Dev",
    amount: 30000,
    initials: "PG",
  },
  {
    id: "3",
    personName: "Kiran Rai",
    projectName: "SEO",
    amount: 22000,
    initials: "KR",
  },
  {
    id: "4",
    personName: "Sarah Johnson",
    projectName: "Mobile App Design",
    amount: 18000,
    initials: "SJ",
  },
  {
    id: "5",
    personName: "Mike Chen",
    projectName: "E-commerce Platform",
    amount: 35000,
    initials: "MC",
  },
];

const Outstanding: React.FC = () => {
  const deals = sampleDeals;

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

  return (
    <div className="w-full  max-w-[450px] min-h-[295px]">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 pt-7 pb-5">
          <h2 className="text-xl font-semibold text-[#000000] font-outfit">
            Deals with Outstanding Payments
          </h2>
        </div>
        <div className="overflow-y-auto max-h-[300px]">
          {deals.slice(0, 5).map((deal, index) => (
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
                    {deal.avatar ? (
                      <Image
                        height={40}
                        width={40}
                        src={deal.avatar}
                        alt={deal.personName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span>
                        {deal.initials || getInitials(deal.personName)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {deal.personName}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  {formatAmount(deal.amount)}
                </div>
              </div>
            </div>
          ))}
        </div>
        {deals.length === 0 && (
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
