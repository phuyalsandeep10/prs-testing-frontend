"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface CommissionArcProps {
  achieved: number;
  total: number;
  title: string;
  subtitle: string;
  increaseLabel: string; // e.g. "+25%"
  salesAmount: string; // e.g. "$29,000"
  width?: number;
  height?: number;
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
  width = 420,
  height = 174,
  gapDegree = 2,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const padding = 15;
    const radius = width * 0.4;
    const svgWidth = width + padding * 2;
    const svgHeight = height + 10 + padding * 2;
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
      .cornerRadius(8);

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
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("width", null)
      .attr("height", null);

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

    chartGroup
      .append("text")
      .text(`${percentage}%`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("fill", "#000000")
      .attr("font-weight", "700")
      .attr("font-size", radius * 0.2)
      .attr("x", 0)
      .attr("y", radius * -0.4)
      .attr("transform", `rotate(-90)`);

    // Group for increaseLabel with background
    const plusLabelGroup = chartGroup
      .append("g")
      .attr(
        "transform",
        `rotate(-90) translate(${radius * 0.0}, ${radius * -0.1})`
      );

    // Rect background for increaseLabel
    const rectWidth = radius * 0.5;
    const rectHeight = radius * 0.2;
    const rectRx = rectHeight * 0.5; // rounded corners

    plusLabelGroup
      .append("rect")
      .attr("x", -rectWidth / 2)
      .attr("y", -rectHeight / 2)
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("rx", rectRx)
      .attr("ry", rectRx)
      .attr("fill", "#009959"); // green background

    // Text inside the green box
    plusLabelGroup
      .append("text")
      .text(increaseLabel)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("fill", "white")
      .attr("font-weight", "500")
      .attr("font-size", radius * 0.12);
  }, [achieved, total, increaseLabel, width, height, gapDegree]);

  return (
    <div
      style={{
        maxWidth: width,
        width: "auto",
        boxSizing: "border-box",
        border: "1px solid #ccc",
        borderRadius: 8,
        padding: 12,
        margin: "0px 0 4px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <h2
        style={{
          margin: 0,
          marginTop: 12,
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      <h4
        style={{
          margin: 5,
          marginBottom: 20,
          fontSize: 12,
          fontWeight: "normal",
          color: "#7E7E7E",
        }}
      >
        {subtitle}
      </h4>

      <svg
        ref={svgRef}
        style={{
          display: "block",
          margin: "auto",
          width: "100%",
          height: "auto",
          maxWidth: width,
        }}
      />

      <p style={{ fontSize: 13, color: "#7E7E7E", marginTop: 1 }}>
        You’ve done sales of{" "}
        <span style={{ color: "#000000", fontWeight: "500" }}>
          {salesAmount}
        </span>
        , which is higher than last month. Keep up the good work.
      </p>
    </div>
  );
};

export default CommissionArc;
