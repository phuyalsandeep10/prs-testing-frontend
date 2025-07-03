"use client";

import React from "react";
import Card from "@/components/dashboard/verifier/dashboard/OverviewComponent";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type StatItem = {
  title: string;
  number: string;
  className: string;
  span?: number;
};

const fetchStats = async (): Promise<StatItem[]> => {
  await new Promise((res) => setTimeout(res, 300));
  return [
    {
      title: "Total Payments",
      number: "54,321",
      className: "bg-[#010D58]",
    },
    {
      title: "Payment Success",
      number: "12,456",
      className: "bg-[#027545]",
    },
    {
      title: "Payment Unsuccessful",
      number: "54,321",
      className: "bg-[#9D0E04]",
    },
    {
      title: "Verification Pending",
      number: "54,321",
      className: "bg-[#BE6A04]",
    },
    {
      title: "Total Revenue",
      number: "54,321",
      className: "bg-[#00008B]",
    },
    {
      title: "Avg. Transactional Value",
      number: "54,321",
      className: "bg-[#65026C]",
    },
    {
      title: "Refunded Amount",
      number: "54,321",
      className: "bg-[#8C4F05]",
    },
  ];
};

const Overview = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["overview"],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-md" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-red-500 text-sm">Error loading data.</p>;
  }

  const firstRow = data.slice(0, 4); 
  const secondRow = data.slice(4); 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {firstRow.map((item: StatItem, index: number) => (
        <div key={index} className="w-full col-span-1">
          <Card
            title={item.title}
            number={item.number}
            className={`${item.className} w-full h-full`}
          />
        </div>
      ))}
      <div className="col-span-1 sm:col-span-2 xl:col-span-4 flex flex-col xl:flex-row gap-6">
        {secondRow.map((item: StatItem, index: number) => (
          <div key={index} className="flex-1">
            <Card
              title={item.title}
              number={item.number}
              className={`${item.className} w-full h-full`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Overview;
