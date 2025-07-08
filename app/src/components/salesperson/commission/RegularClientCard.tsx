"use client";

import React from "react";

interface ClientItem {
  name: string;
  investedPrice: string;
}

interface RegularClientCardProps {
  title: string;
  subtitle: string;
  clients: ClientItem[];
}

const RegularClientCard: React.FC<RegularClientCardProps> = ({
  title,
  subtitle,
  clients,
}) => {
  return (
    <div className="border border-[#D1D1D1] p-4 rounded-md bg-white max-w-[900px] min-w-[300px] mx-auto h-[319px] flex flex-col">
      <div className="mb-4">
        <h2 className="text-[20px] font-semibold mb-1 mt-2">{title}</h2>
        <p className="text-[12px] text-[#7E7E7E]">{subtitle}</p>
      </div>

      <div className="space-y-1 flex-1 overflow-y-hidden">
        {clients.map((client, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 pb-2 pt-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center overflow-hidden space-x-4">
              <p className="font-medium text-[13px]">{client.name}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-[#6C6C6C] text-[13px]">
                {client.investedPrice}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegularClientCard;
