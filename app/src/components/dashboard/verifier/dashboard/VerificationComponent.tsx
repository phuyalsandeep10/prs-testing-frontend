import React from "react";

type VerificationQueue = {
  ID: string;
  client: string;
  amount: string;
  status: string;
  actions: string;
};

type VerificationComponentProps = {
  data: VerificationQueue[];
};

const VerificationComponent: React.FC<VerificationComponentProps> = ({
  data,
}) => {
  return (
    <div className="overflow-x-auto border border-gray-300">
      <table className="min-w-[600px] w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-[16px] font-medium text-[#31323A] border-b bg-[#DADFFF] border-gray-400">
            <th className="py-3 px-4 min-w-[80px]">ID</th>
            <th className="py-3 px-4 min-w-[150px]">Client</th>
            <th className="py-3 px-4 min-w-[100px]">Amount</th>
            <th className="py-3 px-4 min-w-[100px]">Status</th>
            <th className="py-3 px-4 min-w-[50px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={`${row.ID}-${index}`}
              className={`text-[12px] text-gray-800 ${
                index !== data.length - 1 ? "border-b border-gray-300" : ""
              }`}
            >
              <td className="py-3 px-4 truncate max-w-[80px]">{row.ID}</td>
              <td className="py-3 px-4 truncate max-w-[150px]">{row.client}</td>
              <td className="py-3 px-4 truncate max-w-[100px]">{row.amount}</td>
              <td className="py-3 px-4 text-[#C86F04] truncate max-w-[100px]">
                {row.status}
              </td>
              <td className="py-3 px-4 truncate max-w-[150px]">
                {row.actions}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationComponent;
