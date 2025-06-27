import PaymentDistribution from "@/components/dashboard/verifier/dashboard/PaymentDistribution";
import React from "react";

const legends = [
  { label: "Processing", color: "#465FFF" },
  { label: "Success", color: "#009959" },
  { label: "Failed", color: "#FD8B00" },
  { label: "Pending", color: "#0791A5" },
  { label: "Initiated", color: "#6D59FF" },
  { label: "Refunded", color: "#1E90FA" },
  { label: "Chargeback", color: "#EA1000" },
];

const PaymentChart = () => {
  return (
    <div className="flex flex-wrap gap-4 rounded-sm border-[1px] border-[#A9A9A9] p-4">
      <div>
        <h1 className="text-[#465FFF] text-[20px] font-semibold">
          Payment Status Distibution
        </h1>
        <PaymentDistribution />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <ul className="space-y-2">
          {legends.map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-[8px] h-[8px] rounded-full"
                style={{ backgroundColor: color }}
              ></span>
              {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PaymentChart;
