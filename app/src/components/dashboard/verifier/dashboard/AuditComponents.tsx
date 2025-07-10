"use client"
import React from "react";

type AuditQueue = {
  timestamp: string;
  verifier: string;
  actions: string;
  status: string;
  txnid: string;
};

type AuditComponentProps = {
  data: AuditQueue[];
};

const AuditComponents: React.FC<AuditComponentProps> = ({ data }) => {
  return (
    <div className="overflow-x-hidden">
      <table className="min-w-[580px] w-full table-auto border-collapse">
        <thead>
          <tr className="text-left text-[16px] font-medium text-[#31323A] border-b bg-[#DADFFF] border-gray-400">
            <th className="py-3 px-4 min-w-[140px]">Time Stamp</th>
            <th className="py-3 px-4 min-w-[120px]">Verifier</th>
            <th className="py-3 px-4 min-w-[180px]">Actions</th>
            <th className="py-3 px-4 min-w-[100px]">TXN ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-gray-200 text-[12px]">
              <td className="py-3 px-4 break-words">{row.timestamp}</td>
              <td className="py-3 px-4 break-words">{row.verifier}</td>
              <td className="py-3 px-4 break-words">
                {row.actions} {row.txnid}{" "}
                <span
                  className={
                    row.status === "Pending"
                      ? "text-[#FD8B00]"
                      : row.status === "Success"
                      ? "text-[#009959]"
                      : "text-[#EA1000]"
                  }
                >
                  ({row.status})
                </span>
              </td>
              <td className="py-3 px-4 pr-6 text-[#465FFF] break-words">
                {row.txnid}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditComponents;
