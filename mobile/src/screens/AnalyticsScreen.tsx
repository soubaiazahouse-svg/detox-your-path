import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getSessions, getStreak, getTotalMinutesThisWeek, getSessionsThisWeek } from '../lib/db';
import { DetoxSession, StreakData } from '../types';
import { colors, shadows, radius } from '../theme';

const { width } = Dimensions.get('window');
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

export default function AnalyticsScreen() {
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastActiveDate: '', longestStreak: 0 });
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessions, setSessions] = useState<DetoxSession[]>([]);
  const [weekSessions, setWeekSessions] = useState<DetoxSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [s, tm, all, ws] = await Promise.all([
          getStreak(), getTotalMinutesThisWeek(), getSessions(), getSessionsThisWeek(),
        ]);
        setStreak(s);
        setTotalMinutes(tm);
        setSessions(all);
        setWeekSessions(ws);
      })();
    }, [])
  );

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const totalSessions = sessions.length;
  const avgRating = sessions.length
    ? (sessions.reduce((a, s) => a + s.rating, 0) / sessions.length).toFixed(1)
    : '—';

  const now = new Date();
  const weekDayMinutes = Array(7).fill(0);
  weekSessions.forEach(s => {
    const d = new Date(s.date).getDay();
    weekDayMinutes[d] += s.actualMinutes;
  });
  const maxDayMins = Math.max(...weekDayMinutes, 1);

  const timeDisplay = totalMinutes === 0
    ? '0m'
    : totalHours > 0
      ? `${totalHours}h ${totalMins > 0 ? `${totalMins}m` : ''}`
      : `${totalMins}m`;

  const statCards = [
    { value: streak.count.toString(), label: 'Streak', labelAr: 'سلسلة', icon: 'flame-outline' as const, color: '#FF6B35' },
    { value: streak.longestStreak.toString(), label: 'Best', labelAr: 'الأفضل', icon: 'trophy-outline' as const, color: colors.gold },
    { value: totalSessions.toString(), label: 'Sessions', labelAr: 'جلسات', icon: 'time-outline' as const, color: colors.blue },
    { value: String(avgRating), label: 'Avg Rating', labelAr: 'متوسط', icon: 'star-outline' as const, color: '#9B59B6' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>This week</Text>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerTitleAr}>الوقت المسترد</Text>
        <Text style={styles.heroTime}>{timeDisplay}</Text>
        <Text style={styles.heroSub}>of mindful time reclaimed</Text>
      </View>

      {/* Bar chart */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Breakdown</Text>
        <Text style={styles.cardTitleAr}>توزيع الأيام</Text>
        <View style={styles.barChart}>
          {weekDayMinutes.map((mins, i) => {
            const barH = Math.max(4, (mins / maxDayMins) * 110);
            const isToday = i === now.getDay();
            return (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barValue}>{mins > 0 ? `${mins}m` : ''}</Text>
                <View style={styles.barTrack}>
                  <View style={[
                    styles.bar,
                    { height: barH },
                    isToday ? styles.barToday : styles.barDefault,
                  ]} />
                </View>
                <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                  {DAY_NAMES[i]}
                </Text>
                <Text style={styles.barLabelAr}>{DAY_NAMES_AR[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {statCards.map((stat, i) => (
          <View key={i} style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={styles.statNum}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statLabelAr}>{stat.labelAr}</Text>
          </View>
        ))}
      </View>

      {/* Recent sessions */}
      {sessions.length > 0 ? (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          <Text style={styles.sectionTitleAr}>آخر الجلسات</Text>
          {sessions.slice(0, 5).map(s => (
            <View key={s.id} style={styles.sessionCard}>
              <View style={styles.sessionIconWrap}>
                <Ionicons name="time-outline" size={20} color={colors.navy} />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionIntention}>{s.intention}</Text>
                <Text style={styles.sessionDate}>
                  {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}{s.actualMinutes} min
                </Text>
              </View>
              <View style={styles.sessionStars}>
                {[1, 2, 3, 4, 5].map(n => (
                  <Ionicons
                    key={n}
                    name={n <= s.rating ? 'star' : 'star-outline'}
                    size={11}
                    color={n <= s.rating ? colors.gold : colors.borderMed}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="time-outline" size={36} color={colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>لا توجد جلسات بعد</Text>
          <Text style={styles.emptySub}>
            Use the Pause tab to start your first mindful session
          </Text>
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentContainer: { paddingBottom: 16 },

  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 28,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  headerTitleAr: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'right',
  },
  heroTime: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -2,
    lineHeight: 62,
  },
  heroSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  cardTitleAr: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 20,
    textAlign: 'right',
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 155,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: 8,
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
    height: 12,
  },
  barTrack: {
    width: '100%',
    height: 110,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 5,
  },
  barDefault: {
    backgroundColor: colors.blueLight,
  },
  barToday: {
    backgroundColor: colors.blue,
  },
  barLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 5,
    fontWeight: '500',
  },
  barLabelToday: {
    color: colors.blue,
    fontWeight: '700',
  },
  barLabelAr: {
    fontSize: 8,
    color: 'rgba(142,142,147,0.5)',
    marginTop: 1,
  },

  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  statLabelAr: {
    fontSize: 9,
    color: 'rgba(142,142,147,0.6)',
    textAlign: 'center',
  },

  recentSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.2,
  },
  sectionTitleAr: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 14,
    textAlign: 'right',
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    ...shadows.sm,
  },
  sessionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: { flex: 1 },
  sessionIntention: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  sessionStars: {
    flexDirection: 'row',
    gap: 2,
  },

  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
