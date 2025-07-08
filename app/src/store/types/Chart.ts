
export interface PaymentVerificationTrend {
  label: string; // e.g., "2025-07-07", "W27", "Jul"
  value: number;
}

export interface ChartData {
  payment_verification_trend: PaymentVerificationTrend[];
  // (optional) add these if you use them
  sales_trend?: any;
  deal_status_distribution?: any;
}

export interface DashboardChartData {
  chart_data: ChartData;
}


