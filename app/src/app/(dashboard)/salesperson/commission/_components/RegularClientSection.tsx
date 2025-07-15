"use client";

import React, { useMemo } from "react";
import { useCommissionData } from "@/hooks/api";
import RegularClientCard from "@/components/salesperson/commission/RegularClientCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientItem {
  name: string;
  investedPrice: string;
}

export default function RegularClientSection() {
  // Use standardized commission hook
  const {
    data: commissionData,
    isLoading,
    error: isError,
  } = useCommissionData('monthly'); // Get monthly commission data which includes all-time clients

  // Transform commission data to client items format
  const clients: ClientItem[] = useMemo(() => {
    if (!commissionData?.regular_clients_all_time) return [];
    
    return commissionData.regular_clients_all_time.map((client: any) => ({
      name: client.client_name || client.client__client_name || client.name,
      investedPrice: `$ ${Number(client.total_value || client.value || 0).toLocaleString()}`,
    }));
  }, [commissionData]);

  if (isLoading) {
    return (
      <div className="w-full h-[322px] p-[10px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>
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
      <div className="w-full h-[322px] p-[10px] flex items-center justify-center text-red-500">
        Error loading regular clients data
      </div>
    );
  }

  return (
    <div className="w-full h-[322px] p-[10px]">
      <RegularClientCard
        title="Regular Clients"
        subtitle="Here are your top clients this period."
        clients={clients}
      />
    </div>
  );
}
