"use client";

import { cn } from "@/lib/utils";

interface StreaksProps {
  total?: number;
  active?: string;
}

export default function Streaks({ total = 5, active = "🔥" }: StreaksProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-black text-[20px] font-outfit">
        Streaks
      </span>
      <div className="flex gap-1 text-[22px]">
        {[...Array(total)].map((_, i) => (
          <span key={i}>
            {i < 1 ? active : "☆"}{" "}
            {/* show emoji on first, star outline for rest */}
          </span>
        ))}
      </div>
    </div>
  );
}
