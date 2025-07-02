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
  //replace the below static data with an actual API call
  // const response = await fetch("/api/clients");
  // return response.json();

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

  if (isLoading) {
    return (
      <div className="p-6 pt-0 max-w-screen-xl mx-auto">
        <div className="space-y-4">
          {/* Card header skeletons */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" /> {/* Title */}
            <Skeleton className="h-4 w-80" /> {/* Subtitle */}
          </div>

          {/* Client list skeletons */}
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
                  <Skeleton className="h-5 w-32" /> {/* Client name */}
                </div>
                <Skeleton className="h-5 w-24" /> {/* Invested price */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 pt-0 max-w-screen-xl mx-auto">
        <div className="text-center text-red-500">
          Error loading regular clients data
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-0 max-w-screen-xl mx-auto">
      <RegularClientCard
        title="Regular Clients"
        subtitle="Here are your top five regular Clients."
        clients={clients}
      />
    </div>
  );
}
