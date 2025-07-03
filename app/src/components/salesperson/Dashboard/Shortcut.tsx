"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Add from "@/components/svg/shortcut/Add";
import Deals from "@/components/svg/shortcut/Deals";
import Mode from "@/components/svg/shortcut/Mode";
import User from "@/components/svg/shortcut/User";

const shortcuts = [
  { label: "Add Clients", icon: <User />, active: true },
  { label: "Add Deals", icon: <Deals />, active: false },
  { label: "Kanban Mode", icon: <Mode />, active: false },
  { label: "Clients", icon: <User />, active: false },
  { label: "Projects", icon: <Deals />, active: false },
  { label: "Settings", icon: <Mode />, active: false },
  { label: "Analytics", icon: <User />, active: false },
];

const ITEMS_PER_PAGE = 4;

export default function Shortcuts() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(shortcuts.length / ITEMS_PER_PAGE);
  const paginatedShortcuts = shortcuts.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <Card className="w-full max-w-[390px] h-[295px] rounded-xl shadow-sm border p-5 gap-0 relative">
      <h2 className="text-xl font-semibold font-outfit text-black pb-1">
        Shortcuts
      </h2>
      <p className="text-[12px] text-[#7E7E7E] font-normal font-outfit pb-5">
        Looking for something else?
      </p>

      {/* Add padding-bottom to prevent overlap */}
      <div className="flex flex-wrap gap-[14px] justify-start pb-12">
        {paginatedShortcuts.map((shortcut, index) => (
          <Button
            key={index}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center py-5 rounded-lg border text-[8px] font-outfit font-medium h-[73px] w-[73px]",
              shortcut.active
                ? "bg-indigo-500 text-white"
                : "bg-indigo-100 text-indigo-500"
            )}
          >
            <div className="text-2xl">{shortcut.icon}</div>
            <span>{shortcut.label}</span>
          </Button>
        ))}
        <div className="w-[73px] h-[73px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg py-5 text-gray-400 text-[8px] cursor-pointer hover:border-gray-400">
          <Add />
          <span>Add Shortcuts</span>
        </div>
      </div>

      {/* Fixed-position pagination inside the card */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
        <div className="flex items-center gap-1 cursor-pointer">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "cursor-pointer rounded-full",
                i === page
                  ? "bg-indigo-500 w-[46px] h-2"
                  : "bg-gray-300 w-2 h-2"
              )}
            />
          ))}
        </div>
        <span className="text-xs font-normal font-outfit text-[#D1D1D1] cursor-pointer">
          {page + 1}/{totalPages}
        </span>
      </div>
    </Card>
  );
}
