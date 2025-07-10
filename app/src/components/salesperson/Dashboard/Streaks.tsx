"use client";

import React from "react";
import { useStreaks } from "@/hooks/api";
import { Star, Loader2, AlertTriangle } from "lucide-react";

interface StreaksProps {
  total?: number; // Total stars shown (default 5)
}

export default function Streaks({ total = 5 }: StreaksProps) {
  // Use standardized streaks hook
  const { data, isLoading, error, refetch } = useStreaks();

  const currentStreak = data?.current_streak ?? 0;

  const calculateStarsOppositeWithHalf = (streak: number, totalStars: number) => {
    const fullEmptyStars = Math.floor(streak);
    const halfEmptyStars = streak - fullEmptyStars >= 0.5 ? 1 : 0;
    const fullColoredStars = totalStars - fullEmptyStars - halfEmptyStars;

    return { fullColoredStars, halfEmptyStars, fullEmptyStars };
  };

  const { fullColoredStars, halfEmptyStars, fullEmptyStars } =
    calculateStarsOppositeWithHalf(currentStreak, total);

  return (
    <div className="flex items-center gap-3">
      <span className="font-semibold text-black text-[20px] font-outfit">
        Streaks
      </span>

      <div className="flex gap-1">
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            <span className="text-gray-500">Loading...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-500">{error.message || 'Failed to load streaks'}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stars display */}
        {!isLoading && !error && (
          <>
            {/* Full colored stars */}
            {[...Array(fullColoredStars)].map((_, i) => (
              <Star
                key={`full-colored-${i}`}
                className="w-8 h-8 text-[#FFBF10]"
                fill="#FFBF10"
              />
            ))}

            {/* Half empty star */}
            {halfEmptyStars === 1 && (
              <Star
                className="w-8 h-8"
                style={{ fill: "url(#halfStarGradientEmpty)" }}
              />
            )}

            {/* Full empty stars */}
            {[...Array(fullEmptyStars)].map((_, i) => (
              <Star
                key={`full-empty-${i}`}
                className="w-8 h-8 text-[#acabaa]"
                fill="#acabaa"
              />
            ))}
          </>
        )}
      </div>

      {/* SVG gradient for half-empty star */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          <linearGradient
            id="halfStarGradientEmpty"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="50%" stopColor="#FFBF10" />
            <stop offset="50%" stopColor="#acabaa" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
