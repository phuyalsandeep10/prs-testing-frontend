"use client";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
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

import { useStandingsStore } from "@/store/types/standing";

// Types for individual and team standings

interface IndividualStanding {
  rank: number;
  user_id: number;
  username: string;
  profile_picture: string | null;
  sales_amount: string;
  deals_count: number;
  streak: number;
  performance_score: number;
  is_current_user: boolean;
}

interface TeamStanding {
  rank: number;
  team_id: number;
  team_name: string;
  team_lead_profile_picture: string | null;
  sales_amount: string;
  team_deals: number;
  avg_streak: number;
  member_count: number;
  is_user_team: boolean;
}

// Union type for standings item
type StandingItem = IndividualStanding | TeamStanding;

// Memoized components for better performance
const StandingItem = memo(({ team, index, view, tab }: {
  team: StandingItem;
  index: number;
  view: ViewType;
  tab: TabType;
}) => {
  const image = useMemo(() => {
    return view === "individual"
      ? (team as IndividualStanding).profile_picture
      : (team as TeamStanding).team_lead_profile_picture;
  }, [team, view]);

  const name = useMemo(() => {
    return view === "individual"
      ? (team as IndividualStanding).username
      : (team as TeamStanding).team_name;
  }, [team, view]);

  const id = useMemo(() => {
    return view === "individual"
      ? (team as IndividualStanding).user_id
      : (team as TeamStanding).team_id;
  }, [team, view]);

  return (
    <div
      key={`${id}-${team.rank}-${index}`}
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
        {name && <span>{name}</span>}
      </div>
    </div>
  );
});

StandingItem.displayName = 'StandingItem';

export default function Standing() {
  type ViewType = "team" | "individual";
  type TabType = "top" | "bottom";
  type PeriodType = "daily" | "weekly" | "monthly";

  const [view, setView] = useState<ViewType>("individual");
  const [tab, setTab] = useState<TabType>("top");
  const [period, setPeriod] = useState<PeriodType>("daily");

  const { data, loading, error, sendRequest } = useStandingsStore();

  // Memoize the API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => `${process.env.NEXT_PUBLIC_API_URL}/dashboard/standings/`, []);

  useEffect(() => {
    sendRequest(
      "GET",
      apiUrl,
      undefined,
      {
        type: view,
        period: period,
      }
    );
  }, [view, period, sendRequest, apiUrl]);

  const standings: StandingItem[] = data?.standings || [];

  // Memoize expensive calculations to prevent re-computation on every render
  const sortedByIncomeDesc = useMemo(() => {
    return [...standings].sort(
      (a, b) => parseFloat(b.sales_amount) - parseFloat(a.sales_amount)
    );
  }, [standings]);

  const standingsWithRank = useMemo(() => {
    return standings.map((item) => {
      const rank = sortedByIncomeDesc.findIndex((x) => {
        if (view === "individual") {
          return (
            (x as IndividualStanding).username ===
            (item as IndividualStanding).username
          );
        } else if (view === "team") {
          return (
            (x as TeamStanding).team_name === (item as TeamStanding).team_name
          );
        }
        return false;
      });
      return { ...item, rank: rank + 1 };
    });
  }, [standings, sortedByIncomeDesc, view]);

  // Memoize placeholder function to prevent recreation
  const placeholderItem = useCallback((rank: number): StandingItem => ({
    rank,
    user_id: -rank, // dummy id for individual
    username: "",
    profile_picture: null,
    sales_amount: "0",
    deals_count: 0,
    streak: 0,
    performance_score: 0,
    is_current_user: false,
  }), []);

  // Memoize all expensive computations
  const { completeTop, bottomStandingsDescending } = useMemo(() => {
    // Top 3 actual ranks 1, 2, 3
    const sortedTop = standingsWithRank
      .filter((item) => item.rank <= 3)
      .sort((a, b) => a.rank - b.rank);

    // Ensure exactly 3 top standings with placeholders if missing
    const completeTop = [1, 2, 3].map((rank) => {
      const found = sortedTop.find((item) => item.rank === rank);
      return found ? found : placeholderItem(rank);
    });

    // Find max rank (total number of standings)
    const maxRank = standingsWithRank.reduce(
      (max, item) => (item.rank > max ? item.rank : max),
      0
    );

    // Bottom 3 ranks (maxRank, maxRank-1, maxRank-2), filter positive ranks only
    const lastThreeRanks = [maxRank, maxRank - 1, maxRank - 2].filter(
      (r) => r > 0
    );

    // Get standings for bottom ranks or placeholders
    const bottomStandingsDescending = [0, 1, 2].map((i) => {
      const rank = lastThreeRanks[i] ?? -1; // if less than 3 standings
      if (rank === -1) return placeholderItem(i + 1);
      const found = standingsWithRank.find((item) => item.rank === rank);
      return found ? found : placeholderItem(rank);
    });

    return { completeTop, bottomStandingsDescending };
  }, [standingsWithRank, placeholderItem]);

  const activeStandings = useMemo(() =>
    tab === "top" ? completeTop : bottomStandingsDescending,
    [tab, completeTop, bottomStandingsDescending]
  );

  return (
    <div className="w-full h-[527px] border rounded-xl shadow-sm px-5">
      <h1 className="text-xl font-semibold font-outfit mb-4 pt-[16px]">
        {period.charAt(0).toUpperCase() + period.slice(1)} Standings
      </h1>
      <div className="flex justify-between items-center mb-3">
        <div className="mr-5">
          <Select
            defaultValue="daily"
            onValueChange={(val) => setPeriod(val as PeriodType)}
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

        <div className="flex">
          <button
            className={`px-3 py-1 rounded-md ${
              view === "individual" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={useCallback(() => setView("individual"), [])}
          >
            Individual
          </button>
          <button
            className={`px-4 py-1 rounded-md ${
              view === "team" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={useCallback(() => setView("team"), [])}
          >
            Team
          </button>
        </div>
      </div>

      <div className="flex justify-between w-full h-[30px] border-b border-gray-200">
        <button
          onClick={useCallback(() => setTab("top"), [])}
          className={`text-blue-500 font-outfit font-normal text-[13px] ${
            tab === "top"
              ? "font-semibold underline underline-offset-[8px] decoration-2"
              : "opacity-50"
          }`}
        >
          Top Standings
        </button>
        <button
          onClick={useCallback(() => setTab("bottom"), [])}
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
        {activeStandings.map((team, index) => (
          <StandingItem
            key={`${team.rank}-${index}`}
            team={team}
            index={index}
            view={view}
            tab={tab}
          />
        ))}
      </div>

      <div className="flex flex-col items-center">
        <div className="relative flex justify-center w-full gap-2 ml-1">
          {(tab === "top" ? [2, 1, 0] : [0, 1, 2]).map((i, idx) => {
            const team = activeStandings[i];
            if (!team) return null;

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

            const image =
              view === "individual"
                ? (team as IndividualStanding).profile_picture
                : (team as TeamStanding).team_lead_profile_picture;

            const name =
              view === "individual"
                ? (team as IndividualStanding).username
                : (team as TeamStanding).team_name;

            const id =
              view === "individual"
                ? (team as IndividualStanding).user_id
                : (team as TeamStanding).team_id;

            return (
              <div
                key={`${id}-${team.rank}-${idx}`}
                className={`flex flex-col items-center ${
                  idx === 0 ? "mt-[96px]" : idx === 1 ? "mt-[52px]" : "mt-[0px]"
                }`}
              >
                <div className="relative">
                  <PodiumComponent image={image} alt={name} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
