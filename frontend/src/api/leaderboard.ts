import { apiClient } from './client';
import type { LeaderboardEntry } from '../types';

export async function getLeaderboard() {
  const { data } = await apiClient.get<LeaderboardEntry[]>('/leaderboard/');
  return data;
}
