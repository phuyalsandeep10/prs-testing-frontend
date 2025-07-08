"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopClientCard from "@/components/salesperson/commission/TopClientCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientData {
  name: string;
  value: number;
}

const fetchTopClients = async (
  period: string,
  token: string
): Promise<ClientData[]> => {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/commission/`
  );
  url.searchParams.set("period", period);
  url.searchParams.set("include_details", "true");

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API error:", errorText);
    throw new Error("Failed to fetch top clients");
  }

  const json = await res.json();
  const clientsRaw = json.top_clients_this_period ?? [];

  return clientsRaw.map((client: any) => ({
    name: client.client_name,
    value: client.total_value,
  }));
};

const TopClientContent = ({
  view,
  token,
}: {
  view: string;
  token: string | null;
}) => {
  const { data, isLoading, error } = useQuery<ClientData[], Error>({
    queryKey: ["topClients", view, token],
    queryFn: () => fetchTopClients(view, token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  if (isLoading || !token) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-8 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm">Error: {error.message}</p>;
  }

  return data ? <TopClientCard data={data} /> : null;
};

const TopClientSection = () => {
  const [view, setView] = useState<"yearly" | "monthly" | "daily">("monthly");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("authToken"));
    }
  }, []);

  const getSubheading = () => {
    switch (view) {
      case "yearly":
        return "Yearly Top Clients";
      case "monthly":
        return "Monthly Top Clients";
      case "daily":
        return "Daily Top Clients";
      default:
        return "";
    }
  };

  return (
    <div
      className={`w-full mx-auto p-4 rounded-md ${
        !token ? "" : "border border-[#D1D1D1]"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-10 mb-4">
        {!token ? (
          <>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>

            <div className="w-30">
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-[18px] font-semibold mb-1">My Top Clients</h1>
              <p className="text-[12px] text-[#7E7E7E] truncate">
                {getSubheading()}
              </p>
            </div>

            <div className="w-30">
              <select
                value={view}
                onChange={(e) =>
                  setView(e.target.value as "yearly" | "monthly" | "daily")
                }
                className="w-full px-3 py-1.5 border border-[#C3C3CB] rounded-md text-sm text-[#4B5563] shadow-sm focus:outline-none"
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Dynamic content */}
      <TopClientContent view={view} token={token} />
    </div>
  );
};

export default TopClientSection;
