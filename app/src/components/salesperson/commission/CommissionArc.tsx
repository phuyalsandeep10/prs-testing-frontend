"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface CommissionArcProps {
  achieved: number;
  total: number;
  title: string;
  subtitle: string;
  increaseLabel: string;
  salesAmount: string;
  gapDegree?: number;
  description?: string;
}

const CommissionArc: React.FC<CommissionArcProps> = ({
  achieved,
  total,
  title,
  subtitle,
  increaseLabel,
  salesAmount,
  gapDegree = 2,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 200 });

  // Update dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const padding = 10; // Match grid gap and section padding
        const availableWidth = containerWidth - padding * 2;

        // Responsive width calculation
        const width = Math.min(Math.max(availableWidth, 280), 500);
        const height = Math.max(width * 0.5, 120);

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const { width, height } = dimensions;
    const padding = 10;
    const radius = Math.min(width * 0.9, height * 0.8);
    const svgWidth = width + padding * 2;
    const svgHeight = height + padding * 2;
    const centerX = width / 2 + padding;
    const centerY = radius + padding;

    const gapRadians = (gapDegree * Math.PI) / 180;
    const remaining = Math.max(total - achieved, 0);
    const sum = achieved + remaining;
    const arcAvailable = Math.PI - gapRadians;
    const achievedArcLength = (achieved / sum) * arcAvailable;
    const remainingArcLength = (remaining / sum) * arcAvailable;

    const arcGenerator = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius)
      .cornerRadius(Math.max(radius * 0.05, 4));

    const arcs = [
      {
        label: "Achieved",
        value: achieved,
        color: "#465FFF",
        startAngle: Math.PI,
        endAngle: Math.PI + achievedArcLength,
      },
      {
        label: "Remaining",
        value: remaining,
        color: "#C8D4FF",
        startAngle: Math.PI + achievedArcLength + gapRadians,
        endAngle: Math.PI + achievedArcLength + gapRadians + remainingArcLength,
      },
    ];

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${centerX},${centerY}) rotate(90)`);

    chartGroup
      .selectAll("path")
      .data(arcs)
      .join("path")
      .attr(
        "d",
        (d) =>
          arcGenerator({
            startAngle: d.startAngle,
            endAngle: d.endAngle,
            innerRadius: radius * 0.7,
            outerRadius: radius,
          })!
      )
      .attr("fill", (d) => d.color);

    const percentage =
      total > 0 ? ((achieved / total) * 100).toFixed(1) : "0.0";

    const percentageFontSize = Math.max(radius * 0.18, 20);
    const labelFontSize = Math.max(radius * 0.13, 12);

    chartGroup
      .append("text")
      .text(`${percentage}%`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline","middle")
      .attr("fill", "#000000")
      .attr("font-weight", "700")
      .attr("font-size", percentageFontSize)
      .attr("x", 0)
      .attr("y", radius * -0.3)
      .attr("transform", `rotate(-90)`);

    const plusLabelGroup = chartGroup
      .append("g")
      .attr(
        "transform",
        `rotate(-90) translate(${radius * 0.0}, ${radius * -0.1})`
      );

    const rectWidth = Math.max(radius * 0.45, 40);
    const rectHeight = Math.max(radius * 0.18, 16);
    const rectRx = rectHeight * 0.5;

    plusLabelGroup
      .append("rect")
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("rx", rectRx)
      .attr("ry", rectRx)
      .attr("fill", "#009959");

    plusLabelGroup
      .append("text")
      .text(increaseLabel)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("dy", "0.1rem")
      .attr("fill", "white")
      .attr("font-weight", "500")
      .attr("font-size", labelFontSize);
  }, [achieved, total, increaseLabel, dimensions, gapDegree]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[302px] border border-[#D1D1D1] rounded-lg p-[10px] text-center font-sans flex flex-col justify-between"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-900 mt-1 mb-1">
          {title}
        </h2>
        <h4 className="text-xs text-gray-500 font-normal mb-2 px-2">
          {subtitle}
        </h4>
      </div>

      <div className="w-full flex justify-center overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-auto max-w-full"
          style={{ maxHeight: "180px" }}
        />
      </div>

      <p className="text-xs text-gray-500 leading-relaxed px-2">
        You've done sales of{" "}
        <span className="text-gray-900 font-medium">{salesAmount}</span>, which
        is higher than last month. Keep up the good work.
      </p>
    </div>
  );
};

export default CommissionArc;