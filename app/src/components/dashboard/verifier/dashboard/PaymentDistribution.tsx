"use client";
import React, { useRef, useState } from "react";
import * as d3 from "d3";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";

type Slice = {
  label: string;
  value: number;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
  fontSize?: number;
};

const constantSlices: Omit<Slice, "value" | "outerRadius">[] = [
  {
    label: "Processing",
    startAngle: 0,
    endAngle: 0.9,
    innerRadius: 80,
    color: "#465FFF",
  },
  {
    label: "Success",
    startAngle: 0.9,
    endAngle: 1.8,
    innerRadius: 80,
    color: "#009959",
  },
  {
    label: "Failed",
    startAngle: 1.8,
    endAngle: 2.7,
    innerRadius: 80,
    color: "#FD8B00",
  },
  {
    label: "Pending",
    startAngle: 2.7,
    endAngle: 3.6,
    innerRadius: 80,
    color: "#0791A5",
  },
  {
    label: "Initiated",
    startAngle: 3.6,
    endAngle: 4.5,
    innerRadius: 80,
    color: "#6D59FF",
  },
  {
    label: "Refunded",
    startAngle: 4.5,
    endAngle: 5.4,
    innerRadius: 80,
    color: "#1E90FA",
  },
  {
    label: "Chargeback",
    startAngle: 5.4,
    endAngle: 6.283,
    innerRadius: 80,
    color: "#EA1000",
  },
];

const fetchChartData = async (): Promise<
  { label: string; value: number }[]
> => {
  return [
    { label: "Processing", value: 70 },
    { label: "Success", value: 50 },
    { label: "Failed", value: 40 },
    { label: "Pending", value: 30 },
    { label: "Initiated", value: 20 },
    { label: "Refunded", value: 20 },
    { label: "Chargeback", value: 5 },
  ];
};

const PaymentDistribution: React.FC = () => {
  const [selected, setSelected] = useState<{
    text: string;
    color: string;
    fontSize?: number;
  }>({
    text: "Click a slice",
    color: "#009959",
    fontSize: 20,
  });
  const sliceRefs = useRef<(SVGPathElement | null)[]>([]);

  const {
    data: chartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment-chart"],
    queryFn: fetchChartData,
  });

  if (isLoading)
    return (
      <p className="text-center text-sm text-gray-600">Loading chart...</p>
    );
  if (isError || !chartData)
    return (
      <p className="text-center text-sm text-red-500">Failed to load chart</p>
    );

  const valueMap = Object.fromEntries(chartData.map((d) => [d.label, d.value]));
  const values = constantSlices.map((slice) => valueMap[slice.label] || 0);

  const outerRadiusScale = d3
    .scaleLinear()
    .domain([d3.min(values) || 0, d3.max(values) || 100])
    .range([120, 200]);

  const slices: Slice[] = constantSlices.map((slice, index) => ({
    ...slice,
    value: values[index],
    outerRadius: outerRadiusScale(values[index]),
  }));

  const arcGenerator = d3.arc<any>().padAngle(0);
  const chartSize = 440;
  const center = chartSize / 2;

  const handleHover = (index: number, hover: boolean) => {
    const originalOuter = slices[index].outerRadius;
    const newOuter = hover ? originalOuter + 20 : originalOuter;

    const newPath = arcGenerator({
      startAngle: slices[index].startAngle,
      endAngle: slices[index].endAngle,
      innerRadius: slices[index].innerRadius,
      outerRadius: newOuter,
    });

    gsap.to(sliceRefs.current[index], {
      duration: 0.3,
      attr: { d: newPath! },
      ease: "power2.out",
    });
  };

  return (
    <div className="w-full max-w-[440px] aspect-square mx-auto">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${chartSize} ${chartSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform={`translate(${center}, ${center})`}>
          {slices.map((slice, index) => {
            const path = arcGenerator({
              startAngle: slice.startAngle,
              endAngle: slice.endAngle,
              innerRadius: slice.innerRadius,
              outerRadius: slice.outerRadius,
            });

            return (
              <path
                key={index}
                ref={(el) => void (sliceRefs.current[index] = el)}
                d={path!}
                fill={slice.color}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setSelected({
                    text: `${slice.value}%`,
                    color: slice.color,
                    fontSize: 20,
                  })
                }
                onMouseEnter={() => handleHover(index, true)}
                onMouseLeave={() => handleHover(index, false)}
              />
            );
          })}

          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={selected.fontSize || 20}
            fontWeight="bold"
            fill={selected.color}
          >
            {selected.text}
          </text>
        </g>
      </svg>
    </div>
  );
};

export default  PaymentDistribution;
