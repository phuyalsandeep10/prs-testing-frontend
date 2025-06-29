"use client";

import React, { useState } from "react";

interface CommissionArcProps {
  percentage: number; // The percentage to display (0-100)
  size?: number; // The overall size of the arc
  strokeWidth?: number; // The thickness of the arc line
}

const CommissionArc: React.FC<CommissionArcProps> = ({
  percentage,
  size = 200,
  strokeWidth = 20,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const arcLength = (Math.PI * radius) / 2; // Length of one 90-degree quadrant

  // Path for the first quadrant (9 o'clock to 12 o'clock)
  const path1 = `M ${strokeWidth / 2},${center} A ${radius},${radius} 0 0 1 ${center},${
    strokeWidth / 2
  }`;

  // Path for the second quadrant (12 o'clock to 3 o'clock)
  const path2 = `M ${center},${strokeWidth / 2} A ${radius},${radius} 0 0 1 ${
    size - strokeWidth / 2
  },${center}`;

  // Calculate the fill for the first quadrant (0-50%)
  const firstArcFill = Math.min(1, percentage / 50);
  const firstArcOffset = arcLength * (1 - firstArcFill);

  // Calculate the fill for the second quadrant (51-100%)
  const secondArcFill = Math.min(1, Math.max(0, percentage - 50) / 50);
  const secondArcOffset = arcLength * (1 - secondArcFill);

  const commonProps = {
    fill: "none",
    strokeWidth: strokeWidth,
    strokeLinecap: "round" as const,
  };

  return (
    <svg
      width={size}
      height={size / 2 + strokeWidth}
      viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}
    >
      <g transform={`translate(0, ${strokeWidth / 2})`}>
        {/* Background Arcs */}
        <path d={path1} stroke="#E5E7EB" {...commonProps} />
        <path d={path2} stroke="#E5E7EB" {...commonProps} />

        {/* Foreground Arcs */}
        <path
          d={path1}
          stroke="#34D399" // A nice green
          strokeDasharray={arcLength}
          strokeDashoffset={firstArcOffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
          {...commonProps}
        />
        <path
          d={path2}
          stroke="#10B981" // A slightly darker green
          strokeDasharray={arcLength}
          strokeDashoffset={secondArcOffset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
          {...commonProps}
        />
        <text
          x={center}
          y={center - strokeWidth}
          textAnchor="middle"
          dy="-0.5em"
          className="text-2xl font-bold fill-current text-gray-700"
        >
          {`${Math.round(percentage)}%`}
        </text>
        <text
          x={center}
          y={center - strokeWidth}
          textAnchor="middle"
          dy="1.2em"
          className="text-sm font-medium fill-current text-gray-500"
        >
          Commission
        </text>
      </g>
    </svg>
  );
};

// Example parent component to demonstrate usage
const CommissionArcContainer = () => {
  const [value, setValue] = useState(75);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-lg">
      <CommissionArc percentage={value} />
      <div className="w-full max-w-xs mt-4">
        <label
          htmlFor="percentage-slider"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Adjust Percentage: {value}%
        </label>
        <input
          id="percentage-slider"
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
};

export default CommissionArcContainer;
