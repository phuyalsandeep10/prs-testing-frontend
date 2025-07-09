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
  const token = localStorage.getItem("authToken");

  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/commission/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend Error:", errorText);
    throw new Error("Failed to fetch regular clients");
  }

  const json = await res.json();
  console.log("Response JSON data:", json);

  const clients = json.regular_clients_all_time ?? [];

  return clients.map((client: any) => ({
    name: client.client__client_name,
    investedPrice: `$ ${Number(client.total_value).toLocaleString()}`,
  }));
};

export default function RegularClientSection() {
  const {
    data: clients = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["regularClients"],
    queryFn: fetchRegularClients,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

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
