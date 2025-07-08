"use client";

import React, { useEffect } from "react";
import { useStreakStore } from "@/store/apiCall/Streak";
import { Star } from "lucide-react";

interface StreaksProps {
  total?: number; // Total stars shown (default 5)
}

export default function Streaks({ total = 5 }: StreaksProps) {
  const { data, loading, error, sendRequest, retry } = useStreakStore();

  useEffect(() => {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/streak/`;
    const token = localStorage.getItem("authToken");
    sendRequest("GET", apiUrl, undefined, undefined, {
      getAuthToken: () => token,
    });
  }, [sendRequest]);

  const currentStreak = data?.current_streak ?? 0;

  // Calculate stars according to your custom inverse logic
  const calculateStarsOppositeWithHalf = (
    streak: number,
    totalStars: number
  ) => {
    // Special case for streak 3: 1 full empty + 1 half empty stars
    if (streak === 3) {
      const fullEmptyStars = 1;
      const halfEmptyStars = 1;
      const fullColoredStars = totalStars - fullEmptyStars - halfEmptyStars;
      return { fullColoredStars, halfEmptyStars, fullEmptyStars };
    }

    // For others, linear scaling from 0 to 10 streak:
    // stars empty (white) = (streak / 10) * totalStars
    const scaledEmptyStars = (streak / 10) * totalStars;

    const fullEmptyStars = Math.floor(scaledEmptyStars);
    const halfEmptyStars = scaledEmptyStars - fullEmptyStars >= 0.5 ? 1 : 0;
    const fullColoredStars = totalStars - fullEmptyStars - halfEmptyStars;

    return { fullColoredStars, halfEmptyStars, fullEmptyStars };
  };

  const { fullColoredStars, halfEmptyStars, fullEmptyStars } =
    calculateStarsOppositeWithHalf(currentStreak, total);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/streak/`;

  return (
    <div className="flex items-center gap-3">
      <span className="font-semibold text-black text-[20px] font-outfit">
        Streaks
      </span>
      <div className="flex gap-1">
        {/* Loading state */}
        {loading[apiUrl] && <span className="text-gray-500">Loading...</span>}

        {/* Error state */}
        {error && !loading[apiUrl] && (
          <div className="flex flex-col gap-2">
            <span className="text-red-500">{error.displayMessage}</span>
            <button
              onClick={retry}
              className="px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stars display */}
        {!loading[apiUrl] && !error && (
          <>
            {/* Full colored stars */}
            {[...Array(fullColoredStars)].map((_, i) => (
              <Star
                key={`full-colored-${i}`}
                className="text-[#FFBF10] w-8 h-8"
                fill="#FFBF10"
              />
            ))}

            {/* Half empty star */}
            {halfEmptyStars === 1 && (
              <Star
                className="w-8 h-8"
                style={{
                  fill: "url(#halfStarGradientEmpty)",
                }}
              />
            )}

            {/* Full empty stars */}
            {[...Array(fullEmptyStars)].map((_, i) => (
              <Star
                key={`full-empty-${i}`}
                className="text-[#acabaa] w-8 h-8"
              />
            ))}
          </>
        )}
      </div>

      {/* SVG gradient for half empty star */}
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
            <stop offset="50%" stopColor="#acabaa" />
            <stop offset="50%" stopColor="#FFBF10" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
