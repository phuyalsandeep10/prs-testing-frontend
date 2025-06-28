"use client";

import React from "react";

// type define for pagetitle and pagedescription
type DealHeaderProps = {
  PageTitle: string;
  PageDescription: string;
};

const DealsHeader: React.FC<DealHeaderProps> = ({
  PageTitle,
  PageDescription,
}) => {
  return (
    <div className="pt-[20px] pb-9.5">
      <div>
        <h1 className="font-[600] text-[20px] leading-[28px] pb-2 text-[#000000]">
          {PageTitle}
        </h1>
        <p className="text-[14px] font-[400] leading-[22px] text-[#7E7E7E]">
          {PageDescription}
        </p>
      </div>
    </div>
  );
};

export default DealsHeader;
