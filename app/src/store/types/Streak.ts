export interface StreakHistory {
  date: string;
  deals_closed: number;
  total_value: string;
  streak_updated: boolean;
}

export interface StreakStatistics {
  longest_streak: number;
  total_days_tracked: number;
  average_deals_per_day: number;
}

export interface StreakResponse {
  current_streak: number;
  streak_emoji: string;
  streak_level: string;
  days_until_next_level: number;
  recent_history: StreakHistory[];
  streak_statistics: StreakStatistics;
  performance_insights: string[];
}
