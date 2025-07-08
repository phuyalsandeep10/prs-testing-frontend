import { createApiStore } from "../apiStore";
import type { DashboardResponse } from "../types/Dashboard";

export const useDashboardStore = createApiStore<DashboardResponse>();
