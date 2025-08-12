import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import styles from "./CardComponent.module.css";

interface CardProps {
  title: string;
  subtitle: string;
  change: string;
  percentage?: number;
}

const colorConfig: Record<
  string,
  {
    text: string;
    border: string;
    gradientId: string;
    gradient: { from: string; to: string };
  }
> = {
  "Total Payment": {
    text: "#605BFF",
    border: "#605BFF",
    gradientId: "totalGradient",
    gradient: { from: "#605BFF", to: "#605BFF" },
  },
  "Approved Amount": {
    text: "#80D600",
    border: "#80D600",
    gradientId: "approvedGradient",
    gradient: { from: "#80D600", to: "#DAFFA3" },
  },
  Rejected: {
    text: "#FE4D49",
    border: "#FE4D49",
    gradientId: "rejectedGradient",
    gradient: { from: "#FE4D49", to: "#FFD9D9" },
  },
  "Pending Amount": {
    text: "#FD8B00",
    border: "#FD8B00",
    gradientId: "pendingGradient",
    gradient: { from: "#FD8B00", to: "#D8A260" },
  },
};

const monthlyData = [
  { name: "Jan", value: 10 },
  { name: "Feb", value: 20 },
  { name: "Mar", value: 15 },
  { name: "Apr", value: 25 },
  { name: "May", value: 18 },
  { name: "Jun", value: 30 },
  { name: "Jul", value: 28 },
  { name: "Aug", value: 35 },
  { name: "Sep", value: 40 },
  { name: "Oct", value: 32 },
  { name: "Nov", value: 45 },
  { name: "Dec", value: 50 },
];

const CircleProgress = ({
  percentage = 0,
  size = 40, // Smaller circle size here
  strokeWidth = 6,
  trackColor = "#E5E7EB",
  gradientId,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  gradientId: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div 
      className={styles.circleProgress}
      style={{ 
        "--circle-size": `${size}px`,
        "--progress-color": `url(#${gradientId})`
      } as React.CSSProperties}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {/* Injected */}
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className={styles.progressText}>
        {percentage}%
      </span>
    </div>
  );
};

const CardComponent: React.FC<CardProps> = ({
  title,
  subtitle,
  change,
  percentage = 0,
}) => {
  const color = colorConfig[title] || {
    text: "#999999",
    border: "#CCCCCC",
    gradientId: "defaultGradient",
    gradient: { from: "#999999", to: "#cccccc" },
  };

  const isTotalPayment = title === "Total Payment";

  return (
    <div className="flex items-center border border-[#E7E7E8] rounded-2xl p-2.5 bg-white min-w-[260px] max-w-[280px] gap-1">
      {/* Left side: flex-grow so it takes all leftover space */}
      <div className="flex flex-col space-y-1 min-w-0 flex-grow">
        <h2
          className="text-[12.5px] font-semibold text-[#020032]"
          title={title}
        >
          {title}
        </h2>
        <p
          className="text-[9px] font-medium text-[#999999] break-words"
          title={subtitle}
        >
          {subtitle}
        </p>
        <div
          className={styles.changeTag}
          style={{
            "--tag-color": color.text,
            "--tag-border-color": color.border,
          } as React.CSSProperties}
        >
          {change}
        </div>
      </div>

      {/* Right side: smaller fixed width container */}
      <div className="w-[60px] h-[60px] flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {isTotalPayment ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <defs>
                      <filter id="shadow" height="150%">
                        <feDropShadow
                          dx="0"
                          dy="5"
                          stdDeviation="3"
                          floodColor={color.text}
                          floodOpacity="0.5"
                        />
                      </filter>
                    </defs>

                    <XAxis hide dataKey="name" />

                    <RechartsTooltip
                      cursor={{
                        stroke: color.text,
                        strokeDasharray: "3 3",
                      }}
                      content={({ payload }) =>
                        payload?.[0] ? (
                          <TooltipContent>
                            <p className="text-xs">
                              {payload[0].payload.name}:{" "}
                              <strong>{payload[0].value}</strong>
                            </p>
                          </TooltipContent>
                        ) : null
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={color.text}
                      strokeWidth={2}
                      dot={false}
                      filter="url(#shadow)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TooltipTrigger>
          </Tooltip>
        ) : (
          <>
            <svg width={0} height={0}>
              <defs>
                <linearGradient
                  id={color.gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={color.gradient.from} />
                  <stop offset="100%" stopColor={color.gradient.to} />
                </linearGradient>
              </defs>
            </svg>
            <CircleProgress
              percentage={percentage}
              gradientId={color.gradientId}
              strokeWidth={5}
              size={40}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CardComponent;
