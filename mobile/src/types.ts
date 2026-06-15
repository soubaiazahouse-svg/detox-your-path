export interface UserData {
  name: string;
  goalHours: number;
  detoxTimes: string[];
  onboarded: boolean;
  joinDate: string;
}

export interface DetoxSession {
  id: string;
  date: string;
  intention: string;
  intentionIcon: string;
  durationMinutes: number;
  actualMinutes: number;
  rating: number;
  note?: string;
}

export interface StreakData {
  count: number;
  lastActiveDate: string;
  longestStreak: number;
}

export interface ChallengeCompletion {
  date: string;
  completedIds: string[];
}

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Pause: undefined;
  Challenges: undefined;
  Analytics: undefined;
  Settings: undefined;
};
