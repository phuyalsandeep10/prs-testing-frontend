import React from "react";

type RefundRow = {
  transactionId: string;
  client: string;
  amount: string;
  status: string;
  reasons: string;
  date: string;
};

type RefundComponentProps = {
  data: RefundRow[];
};

const RefundComponent: React.FC<RefundComponentProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto rounded-[6px] border border-gray-300">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="text-left text-[16px] font-medium text-[#31323A] border-b bg-[#DADFFF] border-gray-400">
            <th className="py-3 pl-6 pr-6">Transactional ID</th>
            <th className="py-3 pl-6 pr-6">Client</th>
            <th className="py-3 pl-6 pr-6">Amount</th>
            <th className="py-3 pl-6 pr-6">Status</th>
            <th className="py-3 pl-6 pr-6">Reasons</th>
            <th className="py-3 pl-6 pr-6">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={`${row.transactionId}-${index}`}
              className={`text-[12px] text-gray-800 ${
                index !== data.length - 1 ? "border-b border-gray-300" : ""
              }`}
            >
              <td className="py-3 pl-7 pr-2">{row.transactionId}</td>
              <td className="py-3 pl-7 pr-2">{row.client}</td>
              <td className="py-3 pl-7 pr-2">{row.amount}</td>
              <td
                className={`py-3 pl-7 pr-2 ${
                  row.status.toLowerCase() === "refunded"
                    ? "text-[#EA12F9]"
                    :row.status.toLowerCase() === "bad debt"
                    ? "text-[#FF2626]"
                    : ""
                }`}
              >
                {row.status}
              </td>
              <td className="py-3 pl-7 pr-2">{row.reasons}</td>
              <td className="py-3 pl-7 pr-2">{row.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RefundComponent;
