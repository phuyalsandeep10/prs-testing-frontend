"use client";

import { useEffect } from "react";
import { useStreakStore } from "@/store/apiCall/Streak";
import Streaks from "./Streaks";

export default function StreakComponents() {
  const { data, loading, error, sendRequest } = useStreakStore();

  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL; // read env variable
    if (!baseUrl) {
      console.error("API base URL is not defined");
      return;
    }
    sendRequest("GET", `${baseUrl}/dashboard/streak/`);
  }, [sendRequest]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;

  return (
    <Streaks
      total={5}
      active={data?.streak_emoji ? data.streak_emoji : "🔥"} // fallback emoji
    />
  );
}
