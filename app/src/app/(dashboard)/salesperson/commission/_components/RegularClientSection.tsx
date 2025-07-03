"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import RegularClientCard from "@/components/salesperson/commission/RegularClientCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientItem {
  name: string;
  investedPrice: string;
}

const fetchRegularClients = async (): Promise<ClientItem[]> => {
  // Replace with actual API call
  return [
    { name: "Apple INC.", investedPrice: "$ 20,00,000" },
    { name: "Yubesh Shrestha", investedPrice: "$ 10,00,000" },
    { name: "Laxman Singh Dhami", investedPrice: "$ 3,00,000" },
    { name: "Sagam Ghale", investedPrice: "$ 5,00,000" },
    { name: "Swastika Pokharel", investedPrice: "$ 20,000" },
  ];
};

export default function RegularClientSection() {
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["regularClients"],
    queryFn: fetchRegularClients,
  });

  // Smaller responsive height
  const responsiveHeight = "h-[220px] sm:h-[260px] md:h-[280px] lg:h-[300px]";

  if (isLoading) {
    return (
      <div className={`p-6 pt-0 max-w-screen-xl mx-auto ${responsiveHeight}`}>
        <div className="space-y-4">
          {/* Card header skeletons */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Client list skeletons */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className={`p-6 pt-0 max-w-screen-xl mx-auto flex items-center justify-center text-red-500 ${responsiveHeight}`}
      >
        Error loading regular clients data
      </div>
    );
  }

  return (
    <div className={`p-6 pt-0 max-w-screen-xl mx-auto ${responsiveHeight}`}>
      <RegularClientCard
        title="Regular Clients"
        subtitle="Here are your top five regular Clients."
        clients={clients}
      />
    </div>
  );
}
