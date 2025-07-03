"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopClientCard from "@/components/salesperson/commission/TopClientCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ClientData {
  name: string;
  value: number;
}

const fetchDailyTopClients = async (): Promise<ClientData[]> => [
  { name: "Alice Johnson", value: 25000 },
  { name: "Bob Brown", value: 20000 },
  { name: "John Doe", value: 15000 },
  { name: "Jane Smith", value: 10000 },
  { name: "Emma Davis", value: 5000 },
];

const fetchMonthlyTopClients = async (): Promise<ClientData[]> => [
  { name: "John Doe", value: 25000 },
  { name: "Jane Smith", value: 5000 },
  { name: "Alice Johnson", value: 20000 },
  { name: "Bob Brown", value: 10000 },
  { name: "Emma Davis", value: 5000 },
];

const fetchWeeklyTopClients = async (): Promise<ClientData[]> => [
  { name: "Jane Smith", value: 25000 },
  { name: "John Doe", value: 20000 },
  { name: "Emma Davis", value: 15000 },
  { name: "Bob Brown", value: 10000 },
  { name: "Alice Johnson", value: 5000 },
];

const TopClientSection: React.FC = () => {
  const [view, setView] = useState<"daily" | "monthly" | "weekly">("daily");

  const { data, isLoading, error } = useQuery<ClientData[], Error>({
    queryKey: ["topClients", view],
    queryFn: () => {
      if (view === "daily") return fetchDailyTopClients();
      if (view === "monthly") return fetchMonthlyTopClients();
      return fetchWeeklyTopClients();
    },
  });

  const getSubheading = () => {
    switch (view) {
      case "daily":
        return "Daily Top Clients";
      case "monthly":
        return "Monthly top clients for this month";
      case "weekly":
        return "Weekly Top Clients, Jan 30";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto border border-[#D1D1D1] p-4 rounded-md">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-10 mb-4">
        <div>
          <h1 className="text-[18px] font-semibold mb-1">My top Clients</h1>
          <p className="text-[12px] text-[#7E7E7E] truncate">
            {getSubheading()}
          </p>
        </div>

        <div className="w-30">
          <select
            id="viewSelect"
            value={view}
            onChange={(e) =>
              setView(e.target.value as "daily" | "monthly" | "weekly")
            }
            className="w-full px-3 py-1.5 border border-[#C3C3CB] rounded-md text-sm text-[#4B5563] shadow-sm focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">Error: {error.message}</p>}
      {data && <TopClientCard data={data} />}
    </div>
  );
};

export default TopClientSection;
