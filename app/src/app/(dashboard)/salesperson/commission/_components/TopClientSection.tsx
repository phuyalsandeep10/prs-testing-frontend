"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopClientCard from "@/components/salesperson/commission/TopClientCard";

interface ClientData {
  name: string;
  value: number;
}

// Mock API functions (replace with actual API calls)
const fetchDailyTopClients = async (): Promise<ClientData[]> => {
  return [
    { name: "Alice Johnson", value: 25000 },
    { name: "Bob Brown", value: 20000 },
    { name: "John Doe", value: 15000 },
    { name: "Jane Smith", value: 10000 },
    { name: "Emma Davis", value: 5000 },
  ];
};

const fetchMonthlyTopClients = async (): Promise<ClientData[]> => {
  return [
    { name: "John Doe", value: 25000 },
    { name: "Jane Smith", value: 5000 },
    { name: "Alice Johnson", value: 20000 },
    { name: "Bob Brown", value: 10000 },
    { name: "Emma Davis", value: 5000 },
  ];
};

const fetchWeeklyTopClients = async (): Promise<ClientData[]> => {
  return [
    { name: "Jane Smith", value: 25000 },
    { name: "John Doe", value: 20000 },
    { name: "Emma Davis", value: 15000 },
    { name: "Bob Brown", value: 10000 },
    { name: "Alice Johnson", value: 5000 },
  ];
};

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

  return (
    <div className="w-full mx-auto border border-[#D1D1D1] p-6 rounded-md">
      <div className="flex justify-start items-start gap-x-52">
        <div>
          <h1 className="text-[20px] font-semibold mb-1">My top Clients</h1>
          <p className="text-[12px] text-normal text-[#7E7E7E] whitespace-nowrap overflow-hidden text-ellipsis">
            {getSubheading()}
          </p>
        </div>

        <div className="max-w-sm text-[#A9A9A9]">
          <select
            id="viewSelect"
            value={view}
            onChange={(e) =>
              setView(e.target.value as "daily" | "monthly" | "weekly")
            }
            className="block w-full p-2 py-1 border-2 border-[#C3C3CB] rounded-[6px] shadow-sm focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {isLoading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data && <TopClientCard data={data} />}
    </div>
  );
};

export default TopClientSection;
