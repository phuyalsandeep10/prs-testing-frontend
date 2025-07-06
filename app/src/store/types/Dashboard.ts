export interface UserInfo {
  username: string;
  email: string;
  organization: string;
  role: string;
  full_name: string;
}

export interface SalesProgress {
  current_sales: string;
  target: string;
  percentage: number;
  deals_closed: number;
  deals_pending: number;
  period: string;
}

export interface StreakInfo {
  current_streak: number;
  streak_emoji: string;
  streak_level: string;
  last_updated: string;
}

export interface Deal {
  id: string;
  client_name: string;
  deal_value: number;
  deal_date: string;
}

export interface VerificationStatus {
  verified: {
    count: number;
    total: number;
  };
  pending: {
    count: number;
    total: number;
  };
  rejected: {
    count: number;
    total: number;
  };
  partial: {
    count: number;
    total: number;
  };
}

export interface ChartData {
  sales_trend: unknown[]; // You can replace `unknown` with more specific type if available
  deal_status_distribution: Record<string, unknown>;
  commission_trend: unknown[];
}

export interface DashboardResponse {
  user_info: UserInfo;
  sales_progress: SalesProgress;
  streak_info: StreakInfo;
  outstanding_deals: Deal[];
  recent_payments: unknown[]; // Replace with proper type if needed
  verification_status: VerificationStatus;
  chart_data: ChartData;
}
