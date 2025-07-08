import { createApiStore } from "../apiStore";
import type { DashboardChartData } from "../types/Chart";

export const useDashboardStore = createApiStore<DashboardChartData>();
