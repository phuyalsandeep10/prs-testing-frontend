"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreaksProps {
  total?: number;
  active?: number;
}

export default function Streaks({ total = 5, active = 3 }: StreaksProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-black text-[20px] font-outfit">
        Streaks
      </span>
      <div className="flex gap-1">
        {[...Array(total)].map((_, i) => (
          <Star
            key={i}
            size={30}
            className={cn(
              "stroke-gray-400 fill-transparent",
              i < active && "fill-yellow-400 stroke-yellow-400 "
            )}
          />
        ))}
      </div>
    </div>
  );
}
