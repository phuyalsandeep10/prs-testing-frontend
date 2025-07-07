import { createApiStore } from './../apiStore';
import type { StreakResponse } from '../types/Streak';

export const useStreakStore = createApiStore<StreakResponse>();