import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = '@aza_stats';
const STREAK_KEY = '@aza_streak';

const StatsContext = createContext(null);

const todayStr = () => new Date().toISOString().slice(0, 10);

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState({ playHistory: [], weeklyDays: 0 });
  const [streak, setStreak] = useState({ current: 0, longest: 0, lastPlayDate: null });

  useEffect(() => {
    AsyncStorage.getItem(STATS_KEY).then((raw) => { if (raw) setStats(JSON.parse(raw)); });
    AsyncStorage.getItem(STREAK_KEY).then((raw) => { if (raw) setStreak(JSON.parse(raw)); });
  }, []);

  const recordPlay = useCallback(async (trackId) => {
    const today = todayStr();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    setStats((prev) => {
      const history = [...prev.playHistory, { trackId, date: today }]
        .filter((h) => h.date >= weekAgo)
        .slice(-200);
      const weeklyDays = new Set(history.map((h) => h.date)).size;
      const next = { playHistory: history, weeklyDays };
      AsyncStorage.setItem(STATS_KEY, JSON.stringify(next));
      return next;
    });

    setStreak((prev) => {
      if (prev.lastPlayDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const current = prev.lastPlayDate === yesterday ? prev.current + 1 : 1;
      const next = { current, longest: Math.max(current, prev.longest), lastPlayDate: today };
      AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const daysThisWeek = stats.weeklyDays;

  const mostPlayedId = (() => {
    const counts = {};
    stats.playHistory.forEach((h) => { counts[h.trackId] = (counts[h.trackId] || 0) + 1; });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
  })();

  return (
    <StatsContext.Provider value={{ streak, daysThisWeek, mostPlayedId, recordPlay }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used within StatsProvider');
  return ctx;
};
