import React from "react";
import VerifierPaymentOverview from "../_components/VerifierPaymentOverview";
import Image from "next/image";
import SearchIcon from "@/assets/icons/Search.svg";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import PaymentTable from "./PaymentTable";
import MeetingDetails from "./MeetingDetails";

const page = () => {
  return (
    <div className="ml-6 mr-3 mt-10">
      <div>
        <VerifierPaymentOverview />
      </div>

      {/* Container with justify-between */}
      <div className="flex items-center justify-between mt-2 ml-6 mr-6">
        {/* Search Input */}
        <div className="relative w-[275px]">
          <Image
            src={SearchIcon}
            alt="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3"
          />
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-[#DFDFDF] rounded-[6px] pl-10 text-[10px] py-2 outline-none"
          />
        </div>

        {/* Right-side buttons */}
        <div className="flex items-center gap-4">

          <Select>
            <SelectTrigger className="w-[88px] h-[28px] text-[10px] border-[#DFDFDF] focus:outline-none ring-0">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="focus:outline-none ring-0">
              <SelectItem
                value="daily"
                className="data-[highlighted]:bg-[#465FFF] data-[highlighted]:text-white text-[10px]"
              >
                Daily
              </SelectItem>
              <SelectItem
                value="weekly"
                className="data-[highlighted]:bg-[#465FFF] data-[highlighted]:text-white text-[10px]"
              >
                Weekly
              </SelectItem>
              <SelectItem
                value="monthly"
                className="data-[highlighted]:bg-[#465FFF] data-[highlighted]:text-white text-[10px]"
              >
                Monthly
              </SelectItem>
              <SelectItem
                value="yearly"
                className="data-[highlighted]:bg-[#465FFF] data-[highlighted]:text-white text-[10px]"
              >
                Yearly
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="ml-6 mr-6">
        <PaymentTable />
      </div>
    </div>
  );
};

export default page;
