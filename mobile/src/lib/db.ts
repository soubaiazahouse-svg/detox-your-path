import { supabase } from './supabase';
import { UserData, DetoxSession, StreakData } from '../types';

const today = () => new Date().toISOString().split('T')[0];

// ── Auth ──────────────────────────────────────────────
export async function signUp(email: string, password: string, name: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Profile ───────────────────────────────────────────
export async function getProfile(): Promise<UserData | null> {
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!data) return null;
  return {
    name: data.name,
    goalHours: data.goal_hours,
    detoxTimes: data.detox_times ?? [],
    onboarded: true,
    joinDate: data.join_date,
  };
}

export async function saveProfile(profile: Partial<UserData>) {
  const session = await getSession();
  if (!session) return;

  await supabase.from('profiles').upsert({
    id: session.user.id,
    name: profile.name,
    goal_hours: profile.goalHours,
    detox_times: profile.detoxTimes,
    updated_at: new Date().toISOString(),
  });
}

// ── Sessions ──────────────────────────────────────────
export async function addSession(session: DetoxSession) {
  const authSession = await getSession();
  if (!authSession) return;

  await supabase.from('detox_sessions').insert({
    user_id: authSession.user.id,
    intention: session.intention,
    intention_icon: session.intentionIcon,
    duration_minutes: session.durationMinutes,
    actual_minutes: session.actualMinutes,
    rating: session.rating,
    note: session.note ?? null,
  });
}

export async function getSessions(): Promise<DetoxSession[]> {
  const session = await getSession();
  if (!session) return [];

  const { data } = await supabase
    .from('detox_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return (data ?? []).map(r => ({
    id: r.id,
    date: r.created_at,
    intention: r.intention,
    intentionIcon: r.intention_icon,
    durationMinutes: r.duration_minutes,
    actualMinutes: r.actual_minutes,
    rating: r.rating,
    note: r.note ?? undefined,
  }));
}

export async function getSessionsThisWeek(): Promise<DetoxSession[]> {
  const session = await getSession();
  if (!session) return [];

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const { data } = await supabase
    .from('detox_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .gte('created_at', startOfWeek.toISOString());

  return (data ?? []).map(r => ({
    id: r.id,
    date: r.created_at,
    intention: r.intention,
    intentionIcon: r.intention_icon,
    durationMinutes: r.duration_minutes,
    actualMinutes: r.actual_minutes,
    rating: r.rating,
  }));
}

export async function getTotalMinutesThisWeek(): Promise<number> {
  const sessions = await getSessionsThisWeek();
  return sessions.reduce((acc, s) => acc + s.actualMinutes, 0);
}

// ── Streak ────────────────────────────────────────────
export async function getStreak(): Promise<StreakData> {
  const session = await getSession();
  if (!session) return { count: 0, lastActiveDate: '', longestStreak: 0 };

  const { data } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  return {
    count: data?.count ?? 0,
    lastActiveDate: data?.last_active_date ?? '',
    longestStreak: data?.longest_streak ?? 0,
  };
}

export async function updateStreak(): Promise<StreakData> {
  const session = await getSession();
  if (!session) return { count: 0, lastActiveDate: '', longestStreak: 0 };

  const streak = await getStreak();
  const todayStr = today();
  if (streak.lastActiveDate === todayStr) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const newCount = streak.lastActiveDate === yesterdayStr ? streak.count + 1 : 1;
  const updated = {
    count: newCount,
    lastActiveDate: todayStr,
    longestStreak: Math.max(newCount, streak.longestStreak),
  };

  await supabase.from('streaks').upsert({
    user_id: session.user.id,
    count: updated.count,
    last_active_date: updated.lastActiveDate,
    longest_streak: updated.longestStreak,
    updated_at: new Date().toISOString(),
  });

  return updated;
}

// ── Challenges ────────────────────────────────────────
export async function getTodayChallenges(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  const { data } = await supabase
    .from('challenge_completions')
    .select('challenge_id')
    .eq('user_id', session.user.id)
    .eq('completed_date', today());

  return (data ?? []).map(r => r.challenge_id);
}

export async function toggleChallenge(id: string): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];

  const current = await getTodayChallenges();
  if (current.includes(id)) {
    await supabase
      .from('challenge_completions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('challenge_id', id)
      .eq('completed_date', today());
    return current.filter(c => c !== id);
  } else {
    await supabase.from('challenge_completions').insert({
      user_id: session.user.id,
      challenge_id: id,
      completed_date: today(),
    });
    return [...current, id];
  }
}

// ── Screen Time ───────────────────────────────────────
export async function saveScreenTimeLog(totalMinutes: number, appBreakdown?: Record<string, number>) {
  const session = await getSession();
  if (!session) return;

  await supabase.from('screen_time_logs').upsert({
    user_id: session.user.id,
    log_date: today(),
    total_minutes: totalMinutes,
    app_breakdown: appBreakdown ?? null,
  });
}
