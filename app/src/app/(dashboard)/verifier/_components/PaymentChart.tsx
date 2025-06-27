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
    <div className="flex flex-wrap justify-between gap-4">
      <div>
        <PaymentDistribution />
      </div>

      <div>
        <ul className="space-y-2">
          {legends.map(({ label, color }) => (
            <li key={label} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-3 h-3 rounded-full"
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
