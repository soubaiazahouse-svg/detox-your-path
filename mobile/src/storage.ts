import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, DetoxSession, StreakData, ChallengeCompletion } from './types';

const KEYS = {
  USER: '@detox:user',
  SESSIONS: '@detox:sessions',
  STREAK: '@detox:streak',
  CHALLENGES: '@detox:challenges',
};

const today = () => new Date().toISOString().split('T')[0];

// ── User ──────────────────────────────────────────────
export async function getUser(): Promise<UserData | null> {
  const raw = await AsyncStorage.getItem(KEYS.USER);
  return raw ? JSON.parse(raw) : null;
}

export async function saveUser(data: UserData): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(data));
}

// ── Sessions ──────────────────────────────────────────
export async function getSessions(): Promise<DetoxSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  return raw ? JSON.parse(raw) : [];
}

export async function addSession(session: DetoxSession): Promise<void> {
  const sessions = await getSessions();
  sessions.unshift(session);
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

export async function getSessionsThisWeek(): Promise<DetoxSession[]> {
  const sessions = await getSessions();
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return sessions.filter(s => new Date(s.date) >= startOfWeek);
}

export async function getTotalMinutesThisWeek(): Promise<number> {
  const sessions = await getSessionsThisWeek();
  return sessions.reduce((acc, s) => acc + s.actualMinutes, 0);
}

// ── Streak ────────────────────────────────────────────
const defaultStreak: StreakData = { count: 0, lastActiveDate: '', longestStreak: 0 };

export async function getStreak(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  return raw ? JSON.parse(raw) : defaultStreak;
}

export async function updateStreak(): Promise<StreakData> {
  const streak = await getStreak();
  const todayStr = today();
  if (streak.lastActiveDate === todayStr) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCount = streak.lastActiveDate === yesterdayStr ? streak.count + 1 : 1;
  const updated: StreakData = {
    count: newCount,
    lastActiveDate: todayStr,
    longestStreak: Math.max(newCount, streak.longestStreak),
  };
  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(updated));
  return updated;
}

// ── Challenges ────────────────────────────────────────
export async function getTodayChallenges(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.CHALLENGES);
  const all: ChallengeCompletion[] = raw ? JSON.parse(raw) : [];
  const todayEntry = all.find(e => e.date === today());
  return todayEntry?.completedIds ?? [];
}

export async function toggleChallenge(id: string): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.CHALLENGES);
  const all: ChallengeCompletion[] = raw ? JSON.parse(raw) : [];
  const idx = all.findIndex(e => e.date === today());
  let completed: string[];
  if (idx === -1) {
    completed = [id];
    all.push({ date: today(), completedIds: completed });
  } else {
    const set = new Set(all[idx].completedIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    completed = Array.from(set);
    all[idx].completedIds = completed;
  }
  await AsyncStorage.setItem(KEYS.CHALLENGES, JSON.stringify(all));
  return completed;
}

export async function clearAll(): Promise<void> {
  for (const key of Object.values(KEYS)) {
    await AsyncStorage.removeItem(key);
  }
}
