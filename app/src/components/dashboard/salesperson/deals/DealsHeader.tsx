"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import filter_fill from "@/assets/icons/filter-fill.svg";
import Pills_button from "@/assets/icons/pills-button.svg";
import Vector from "@/assets/icons/Vector.svg";
import Image from "next/image";

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
    <>
      <div className="flex pt-[20px] pb-9.5">
        <div className="basis-1/2">
          <h1 className="font-[600] text-[20px] leading-[28px] pb-2 text-[#000000]">
            {PageTitle}
          </h1>
          <p className="text-[14px] font-[400] leading-[22px] text-[#7E7E7E]">
            {PageDescription}
          </p>
        </div>
        <div className="flex justify-end gap-5 basis-1/2 items-start">
          <div className="relative">
            <Input
              className="w-[150px] h-[28px] border rounded-[6px] border-[#D1D1D1] px-8"
              placeholder="Search"
            />
            <span className="absolute w-[12px] h-[12] top-2.5 left-3">
              <Image src={Vector} alt="Filter-fill" className="w-auto h-auto" />
            </span>
          </div>
          <Button className="w-[101px] h-[28px] rounded-[6px] bg-[#465FFF] text-[12px] font-[600]">
            Add New Deal
          </Button>
          <Image src={filter_fill} alt="Filter-fill" />
          <Image src={Pills_button} alt="Filter-fill" />
        </div>
      </div>
    </>
  );
};

export default DealsHeader;
