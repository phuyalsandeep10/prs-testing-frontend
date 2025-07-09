"use client";

import React, { useEffect } from "react";
import { useStreakStore } from "@/store/apiCall/Streak";
import { Star } from "lucide-react";

interface StreaksProps {
  total?: number; // Total stars shown (default 5)
}

export default function Streaks({ total = 5 }: StreaksProps) {
  const { data, loading, error, sendRequest, retry } = useStreakStore();

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/dashboard/streak/`;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    sendRequest("GET", apiUrl, undefined, undefined, {
      getAuthToken: () => token,
    });
  }, [sendRequest]);

  const currentStreak = data?.current_streak ?? 0;

  const calculateInverseStars = (streak: number, totalStars: number) => {
    const fullEmptyStars = Math.floor(streak);
    const halfEmptyStars = streak - fullEmptyStars >= 0.5 ? 1 : 0;
    const fullColoredStars = totalStars - fullEmptyStars - halfEmptyStars;

    return { fullColoredStars, halfEmptyStars, fullEmptyStars };
  };

  const { fullColoredStars, halfEmptyStars, fullEmptyStars } =
    calculateInverseStars(currentStreak, total);

  return (
    <div className="flex items-center gap-3">
      <span className="font-semibold text-black text-[20px] font-outfit">
        Streaks
      </span>

      <div className="flex gap-1">
        {/* Loading */}
        {loading[apiUrl] && <span className="text-gray-500">Loading...</span>}

        {/* Error */}
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

        {/* Stars */}
        {!loading[apiUrl] && !error && (
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
