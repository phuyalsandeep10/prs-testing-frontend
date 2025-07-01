"use client";

import React, { useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ClientData {
  name: string;
  value: number;
}

interface TopClientCardProps {
  data: ClientData[];
  title?: string;
}

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const TopClientCard: React.FC<TopClientCardProps> = ({ data, title }) => {
  const chartRef = useRef<any>(null);

  // ✅ REMOVED problematic useEffect and gradient state

  const chartData = {
    labels: data.map((client) => getInitials(client.name)),
    datasets: [
      {
        label: "Client Value",
        data: data.map((client) => client.value),
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return "#465FFF"; // fallback for initial load

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "#465FFF");
          gradient.addColorStop(1, "#6F60E0");
          return gradient;
        },
        borderRadius: 10,
        barPercentage: 1.0,
        categoryPercentage: 0.5,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        font: { size: 16 },
        padding: { bottom: 20 },
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => data[tooltipItems[0].dataIndex].name,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "#E5E5E5",
        },
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="w-full h-[235px]">
      <Bar ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

export default TopClientCard;
