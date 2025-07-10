"use client";

import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/hooks/api";
import { AlertTriangle, Loader2 } from "lucide-react";

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// Constants
const DAILY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WEEKLY_LABELS = Array.from({ length: 52 }, (_, i) => `Week ${i + 1}`);
const MONTHLY_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type ChartDataPoint = {
  label: string;
  value: number;
};

export default function ChartDashboard() {
  const [selectedRange, setSelectedRange] = useState<
    "daily" | "weekly" | "monthly"
  >("daily");

  // Use standardized dashboard hook
  const { data, isLoading: loading, error } = useDashboard();
  
  // Extract chart data from dashboard response
  const apiData: ChartDataPoint[] = useMemo(() => {
    return data?.chart_data?.payment_verification_trend || [];
  }, [data]);

  const { labels, values } = useMemo(() => {
    let labels: string[] = [];
    let values: number[] = [];

    if (selectedRange === "daily") {
      labels = DAILY_LABELS;
      // Map API data to daily labels
      const dateMap: Record<string, number> = {};
      apiData.forEach((item) => {
        const date = new Date(item.label);
        const dayName = DAILY_LABELS[date.getDay()];
        dateMap[dayName] = item.value;
      });
      values = labels.map((label) => dateMap[label] ?? 0);
    } else if (selectedRange === "weekly") {
      labels = WEEKLY_LABELS;
      // Map API data to weekly labels
      const weekMap: Record<string, number> = {};
      apiData.forEach((item) => {
        if (item.label.startsWith("W")) {
          const weekNumber = parseInt(item.label.replace("W", ""));
          weekMap[`Week ${weekNumber}`] = item.value;
        }
      });
      values = labels.map((week) => weekMap[week] ?? 0);
    } else if (selectedRange === "monthly") {
      labels = MONTHLY_LABELS;
      // Map API data to monthly labels
      const monthMap: Record<string, number> = {};
      apiData.forEach((item) => {
        if (MONTHLY_LABELS.includes(item.label)) {
          monthMap[item.label] = item.value;
        }
      });
      values = labels.map((month) => monthMap[month] ?? 0);
    }

    return { labels, values };
  }, [apiData, selectedRange]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Payments",
        data: values,
        fill: false,
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
        tension: 0.4,
        pointBorderColor: "#fff",
        pointBackgroundColor: "#3B82F6",
        pointRadius: 5,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5000,
          callback: (value: number) => `${value / 1000}k`,
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  // Handle loading state
  if (loading) {
    return (
      <Card className="p-5 shadow-sm border rounded-xl w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold font-outfit text-black">
              Payment Verification Status
            </h2>
            <p className="text-[12px] font-outfit font-normal text-[#7E7E7E] pt-1">
              View Detailed Sales Status
            </p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
            <p className="text-gray-500 mt-2">Loading chart data...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className="p-5 shadow-sm border rounded-xl w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold font-outfit text-black">
              Payment Verification Status
            </h2>
            <p className="text-[12px] font-outfit font-normal text-[#7E7E7E] pt-1">
              View Detailed Sales Status
            </p>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
            <p className="text-red-500 mt-2">Failed to load chart data</p>
            <p className="text-gray-500 text-sm mt-1">
              {error.message || 'Please try again later'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 shadow-sm border rounded-xl w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold font-outfit text-black">
            Payment Verification Status
          </h2>
          <p className="text-[12px] font-outfit font-normal text-[#7E7E7E] pt-1">
            View Detailed Sales Status
          </p>
        </div>

        <Select
          value={selectedRange}
          onValueChange={(val) =>
            setSelectedRange(val as "daily" | "weekly" | "monthly")
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-64 w-full">
        <Line data={chartData} options={chartOptions} />
      </div>
    </Card>
  );
} 