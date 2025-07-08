import { createApiStore } from "../apiStore";

interface GoalResponse {
  message: string;
}

export const useGoalStore = createApiStore<GoalResponse>();
