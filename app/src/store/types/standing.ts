
import { createApiStore } from "../apiStore";

export const useStandingsStore = createApiStore<{
  type: string;
  date: string;
  total_participants: number;
  current_user_rank: number;
  standings: {
    rank: number;
    user_id: number;
    username: string;
    profile_picture: string | null;
    sales_amount: string;
    deals_count: number;
    streak: number;
    performance_score: number;
    is_current_user: boolean;
  }[];
  summary: {
    top_performer_sales: number;
  };
}>();
