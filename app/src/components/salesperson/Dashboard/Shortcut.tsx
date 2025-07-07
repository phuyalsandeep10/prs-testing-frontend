"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Add from "@/components/svg/shortcut/Add";
import Deals from "@/components/svg/shortcut/Deals";
import Mode from "@/components/svg/shortcut/Mode";
import User from "@/components/svg/shortcut/User";

// Add routes for each shortcut
const shortcuts = [
  { label: "Add Clients", icon: <User />, route: "/clients/add", active: true },
  {
    label: "Add Deals",
    icon: <Deals />,
    route: "/salesperson/deal",
    active: false,
  },
  {
    label: "Kanban Mode",
    icon: <Mode />,
    route: "/salesperson/client",
    active: false,
  },
  {
    label: "Clients",
    icon: <User />,
    route: "/salesperson/client",
    active: false,
  },
  {
    label: "Projects",
    icon: <Deals />,
    route: "/salesperson/client",
    active: false,
  },
  { label: "Settings", icon: <Mode />, route: "/settings", active: false },
  { label: "Analytics", icon: <User />, route: "/analytics", active: false },
];

const ITEMS_PER_PAGE = 4;

export default function Shortcuts() {
  const [page, setPage] = useState(0);
  const router = useRouter();

  const totalPages = Math.ceil(shortcuts.length / ITEMS_PER_PAGE);
  const paginatedShortcuts = shortcuts.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <Card className="w-full h-[295px] rounded-xl shadow-sm border p-5 gap-0 relative">
      <h2 className="text-xl font-semibold font-outfit text-black pb-1">
        Shortcuts
      </h2>
      <p className="text-[12px] text-[#7E7E7E] font-normal font-outfit pb-5">
        Looking for something else?
      </p>

      {/* Shortcut buttons */}
      <div className="flex flex-wrap gap-2 pb-12">
        {paginatedShortcuts.map((shortcut, index) => (
          <Button
            key={index}
            onClick={() => router.push(shortcut.route)}
            variant="ghost"
            className={cn(
              "flex flex-col items-center justify-center py-5 rounded-lg border text-[8px] font-outfit font-medium h-[73px]",
              "min-w-[70px] basis-[73px] max-w-[120px] flex-grow",
              shortcut.active
                ? "bg-indigo-500 text-white"
                : "bg-indigo-100 text-indigo-500"
            )}
          >
            <div className="text-2xl">{shortcut.icon}</div>
            <span>{shortcut.label}</span>
          </Button>
        ))}

        {/* Add Shortcut Button (optional navigation or modal trigger) */}
        <div
          onClick={() => alert("Open Add Shortcut modal or redirect")}
          className="min-w-[70px] basis-[73px] max-w-[120px] flex-grow h-[73px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg py-5 text-gray-400 text-[8px] cursor-pointer hover:border-gray-400"
        >
          <Add />
          <span>Add Shortcuts</span>
        </div>
      </div>

      {/* Pagination dots */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pt-2">
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
