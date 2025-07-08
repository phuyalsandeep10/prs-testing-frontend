"use client";

import React, { useEffect, useState } from "react";
import Card from "@/components/dashboard/verifier/dashboard/OverviewComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

type StatItem = {
  title: string;
  number: string;
  className: string;
};

const fetchStats = async (token: string): Promise<StatItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/verifier/dashboard/`,
    {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Dashboard stats fetch error:", err);
    return [];
  }

  const data = await res.json();

  return [
    {
      title: "Total Payments",
      number: data.total_payments?.toString() ?? "0",
      className: "bg-[#010D58]",
    },
    {
      title: "Payment Success",
      number: data.total_successful_payments?.toString() ?? "0",
      className: "bg-[#027545]",
    },
    {
      title: "Payment Unsuccessful",
      number: data.total_unsuccess_payments?.toString() ?? "0",
      className: "bg-[#9D0E04]",
    },
    {
      title: "Verification Pending",
      number: data.total_verification_pending_payments?.toString() ?? "0",
      className: "bg-[#BE6A04]",
    },
    {
      title: "Total Revenue",
      number: data.total_revenue ?? "0.00",
      className: "bg-[#00008B]",
    },
    {
      title: "Avg. Transactional Value",
      number: (
        Number(data.total_revenue || 0) / (data.total_payments || 1)
      ).toFixed(2),
      className: "bg-[#65026C]",
    },
    {
      title: "Refunded Amount",
      number: data.total_refunded_amount ?? "0.00",
      className: "bg-[#8C4F05]",
    },
  ];
};

const Overview = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("authToken");
      setToken(storedToken);
    }
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verifier-overview", token],
    queryFn: () => fetchStats(token!),
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-500 text-center mt-4">
        Failed to load overview stats.
      </p>
    );
  }

  const firstRow = data.slice(0, 4);
  const secondRow = data.slice(4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {firstRow.map((item, index) => (
        <div key={index} className="w-full col-span-1">
          <Card
            title={item.title}
            number={item.number}
            className={`${item.className} w-full h-full`}
          />
        </div>
      ))}
      <div className="col-span-1 sm:col-span-2 xl:col-span-4 flex flex-col xl:flex-row gap-6">
        {secondRow.map((item, index) => (
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
