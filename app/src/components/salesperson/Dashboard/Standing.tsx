"use client";
import { useState } from "react";
import data from "./StandingData";
import FirstPlace from "@/components/svg/standing/FirstPlace";
import SecondPlace from "@/components/svg/standing/SecondPlace";
import ThirdPlace from "@/components/svg/standing/ThirdPlace";
import BottomFirst from "@/components/svg/standing/BottomFirst";
import BottomSecond from "@/components/svg/standing/BottomSecond";
import BottomThird from "@/components/svg/standing/BottomThird";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Standing() {
  const [view, setView] = useState<"team" | "individual">("individual");
  const [tab, setTab] = useState<"top" | "bottom">("top");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  const activeData = data[period][view];

  const sortedTop = [...activeData]
    .sort((a, b) => b.income - a.income)
    .slice(0, 3)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const sortedByIncomeDesc = [...activeData].sort(
    (a, b) => b.income - a.income
  );

  const sortedBottom = [...activeData]
    .sort((a, b) => a.income - b.income)
    .slice(0, 3)
    .map((item) => {
      const actualRank =
        sortedByIncomeDesc.findIndex((x) => x.name === item.name) + 1;
      return { ...item, rank: actualRank };
    });

  const standings = tab === "top" ? sortedTop : sortedBottom;

  return (
    <div className="w-full  h-[527px] border rounded-xl shadow-sm px-5">
      <h1 className="text-xl font-semibold font-outfit mb-4 pt-[16px]">
        {period.charAt(0).toUpperCase() + period.slice(1)} Standings
      </h1>
      <div className="flex justify-between items-center mb-3">
        <div className="mr-5">
          <Select
            defaultValue="daily"
            onValueChange={(val) =>
              setPeriod(val as "daily" | "weekly" | "monthly")
            }
          >
            <SelectTrigger className="w-24 h-8 text-xs border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wrap buttons in a flex container without gap */}
        <div className="flex">
          <button
            className={`px-3 py-1 rounded-md ${
              view === "individual" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("individual")}
          >
            Individual
          </button>
          <button
            className={`px-4 py-1 rounded-md ${
              view === "team" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setView("team")}
          >
            Team
          </button>
        </div>
      </div>

      <div className="flex justify-between w-full h-[30px] border-b border-gray-200">
        <button
          onClick={() => setTab("top")}
          className={`text-blue-500 font-outfit font-normal text-[13px] ${
            tab === "top"
              ? "font-semibold underline underline-offset-[8px] decoration-2"
              : "opacity-50"
          }`}
        >
          Top Standings
        </button>
        <button
          onClick={() => setTab("bottom")}
          className={`text-blue-500 font-outfit font-normal text-[13px] ${
            tab === "bottom"
              ? "font-semibold underline underline-offset-[8px] decoration-2"
              : "opacity-50"
          }`}
        >
          Bottom Standings
        </button>
      </div>
      <div className="flex flex-col gap-[23px] pt-[16px]">
        {standings.map((team, index) => (
          <div
            key={team.name}
            className={`flex items-center bg-[#DADFFF] rounded pr-4 h-[25px] ${
              index === 0
                ? "w-full md:w-[85%]"
                : index === 1
                ? "w-full md:w-[70%]"
                : "w-full md:w-[50%]"
            }`}
          >
            <div className="flex items-center gap-2 text-[14px] font-normal font-outfit text-black">
              <div
                className={`w-[30px] h-[30px] transform rotate-45 flex items-center justify-center shadow-lg ${
                  tab === "bottom"
                    ? "bg-gradient-to-b from-[#FF6B6B] to-[#FF0000]"
                    : index === 0
                    ? "bg-gradient-to-b from-[#FFFB00] to-[#F9A914]"
                    : index === 1
                    ? "bg-gradient-to-b from-[#F8F8F8] to-[#929292]"
                    : "bg-gradient-to-b from-[#FF8E56] to-[#FFA424]"
                }`}
              >
                <span className="text-black text-[13px] font-medium transform -rotate-45">
                  #{team.rank}
                </span>
              </div>
              <span>{team.name}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center">
        <div className="relative flex justify-center w-full gap-2  ml-1">
          {[2, 1, 0].map((i, idx) => {
            const team = standings[i];
            const PodiumComponent =
              tab === "top"
                ? idx === 0
                  ? FirstPlace
                  : idx === 1
                  ? SecondPlace
                  : ThirdPlace
                : idx === 0
                ? BottomFirst
                : idx === 1
                ? BottomSecond
                : BottomThird;

            return (
              <div
                key={team.name}
                className={`flex flex-col items-center ${
                  idx === 0 ? "mt-[96px]" : idx === 1 ? "mt-[52px]" : "mt-[0px]"
                }`}
              >
                <div className="relative">
                  {tab === "top" && idx === 2 && (
                    <div className="absolute -top-[50px] left-[62%] transform -translate-x-1/2 z-10">
                      {/* <Crown /> */}
                    </div>
                  )}
                  <PodiumComponent image={team.image} alt={team.name} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
