"use client";
import React, { useState } from "react";
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

const chartData = {
  daily: {
    labels: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    data: [13000, 15000, 44000, 40500, 7000, 7500, 500],
  },
  weekly: {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    data: [15000, 12000, 18000, 17000],
  },
  monthly: {
    labels: [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ],
    data: [
      12000, 17000, 9000, 13000, 10000, 19000, 10000, 8000, 7500, 11000, 1000,
      5000,
    ],
  },
};

const ChartDashboard = () => {
  const [selectedRange, setSelectedRange] = useState<
    "daily" | "weekly" | "monthly"
  >("monthly");

  const chartLabels = chartData[selectedRange].labels;
  const chartValues = chartData[selectedRange].data;

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: "Payments",
        data: chartValues,
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

  const options = {
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
          <SelectTrigger className="w-full max-w-[120px] h-[35px] rounded-md text-[12px] font-outfit font-normal mt-2 sm:mt-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full min-h-[200px] sm:min-h-[260px] aspect-[2/1]">
        <Line data={data} options={options} />
      </div>
    </Card>
  );
};

export default ChartDashboard;
