export interface StreakResponse {
  current_streak: number;
  streak_rating: string;
  days_until_next_level: number;
  recent_history: {
    date: string;
    deals_closed: number;
    total_value: string;
    streak_updated: boolean;
  }[];
  streak_statistics: {
    longest_streak: number;
    total_days_tracked: number;
    average_deals_per_day: number;
  };
  performance_insights: string[];
}
