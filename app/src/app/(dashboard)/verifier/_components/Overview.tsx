'use client'
import React from "react";
import Card from "@/components/dashboard/verifier/dashboard/OverviewComponent";
import { useQuery } from "@tanstack/react-query";

type StatItem = {
  title: string;
  number: string;
  className: string;
};

const fetchStats = async (): Promise<StatItem[]> => {
  await new Promise((res) => setTimeout(res, 300)); 
  return [
    {
      title: "Total Payments",
      number: "54,321",
      className: "bg-[#010D58] lg:w-[278px] w-full",
    },
    {
      title: "Payment Success",
      number: "12,456",
      className: "bg-[#027545] lg:w-[278px] w-full",
    },
    {
      title: "Payment Unsuccessful",
      number: "54,321",
      className: "bg-[#9D0E04] lg:w-[278px] w-full",
    },
    {
      title: "Verification Pending",
      number: "54,321",
      className: "bg-[#BE6A04] lg:w-[276px] w-full",
    },
    {
      title: "Total Revenue",
      number: "54,321",
      className: "bg-[#00008B] lg:w-[379px] w-full",
    },
    {
      title: "Avg. Transactional Value",
      number: "54,321",
      className: "bg-[#65026C] lg:w-[379px] w-full",
    },
    {
      title: "Refunded Amount",
      number: "54,321",
      className: "bg-[#8C4F05] lg:w-[378px] w-full",
    },
  ];
};

const Overview = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["overview"],
    queryFn: fetchStats,
  });

  if (isLoading) return <p className="text-gray-500 text-sm">Loading...</p>;
  if (isError || !data)
    return <p className="text-red-500 text-sm">Error loading data.</p>;

  return (
    <div className="flex flex-wrap gap-6">
      {data.map((item, index) => (
        <Card
          key={index}
          title={item.title}
          number={item.number}
          className={item.className}
        />
      ))}
    </div>
  );
};

export default Overview;
