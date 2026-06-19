import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, getStreak, getTodayChallenges, getTotalMinutesThisWeek } from '../lib/db';
import { getWeeklyMessage } from '../data/messages';
import { CHALLENGES } from '../data/challenges';
import { UserData, StreakData } from '../types';
import { colors, gradients, shadows, radius } from '../theme';

const { width } = Dimensions.get('window');
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function DashboardScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastActiveDate: '', longestStreak: 0 });
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [weekMinutes, setWeekMinutes] = useState(0);
  const message = getWeeklyMessage();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [u, s, c, wm] = await Promise.all([
          getProfile(), getStreak(), getTodayChallenges(), getTotalMinutesThisWeek(),
        ]);
        setUser(u);
        setStreak(s);
        setCompletedIds(c);
        setWeekMinutes(wm);
      })();
    }, [])
  );

  const weekHours = Math.floor(weekMinutes / 60);
  const weekMins = weekMinutes % 60;
  const todayDone = CHALLENGES.filter(c => completedIds.includes(c.id)).length;
  const todayTotal = CHALLENGES.length;
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();

  const timeDisplay = weekMinutes === 0
    ? '0m'
    : weekHours > 0
      ? `${weekHours}h ${weekMins > 0 ? `${weekMins}m` : ''}`
      : `${weekMins}m`;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>{todayDate}</Text>
          <Text style={styles.greeting}>Hello, {user?.name ?? 'Friend'}</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>{initials}</Text>
        </View>
      </View>

      {/* Hero Card */}
      <LinearGradient colors={gradients.navy} style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroLabel}>Time reclaimed this week</Text>
            <Text style={styles.heroLabelAr}>الوقت المسترد هذا الأسبوع</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame-outline" size={14} color={colors.gold} />
            <Text style={styles.streakNum}>{streak.count}</Text>
          </View>
        </View>

        <Text style={styles.heroTime}>{timeDisplay}</Text>
        <Text style={styles.heroSub}>of mindful time</Text>

        {/* Day bar chart */}
        <View style={styles.dayRow}>
          {DAY_LABELS.map((d, i) => {
            const isToday = i === new Date().getDay();
            return (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayBar, isToday && styles.dayBarActive]} />
                <Text style={[styles.dayLabel, isToday && styles.dayLabelActive]}>{d}</Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>

      {/* Today's Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>{todayDone}/{todayTotal}</Text>
          </View>
        </View>

        {CHALLENGES.slice(0, 3).map(ch => {
          const isDone = completedIds.includes(ch.id);
          return (
            <View key={ch.id} style={[styles.challengeCard, isDone && styles.challengeCardDone]}>
              <View style={[styles.challengeIcon, isDone && styles.challengeIconDone]}>
                <Ionicons
                  name={ch.icon as any}
                  size={20}
                  color={isDone ? colors.mint : colors.navy}
                />
              </View>
              <View style={styles.challengeInfo}>
                <Text style={[styles.challengeTitle, isDone && styles.challengeTitleDone]}>
                  {ch.titleAr}
                </Text>
                <Text style={styles.challengeSubtitle}>{ch.title}</Text>
              </View>
              <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                {isDone && <Ionicons name="checkmark" size={14} color={colors.white} />}
              </View>
            </View>
          );
        })}
      </View>

      {/* Quote card */}
      <View style={styles.quoteCard}>
        <View style={styles.quoteBar} />
        <View style={styles.quoteContent}>
          <Text style={styles.quoteAr}>{message.ar}</Text>
          <Text style={styles.quoteEn}>{message.en}</Text>
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentContainer: { paddingBottom: 16 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: { flex: 1 },
  dateLabel: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },

  heroCard: {
    marginHorizontal: 20,
    borderRadius: radius.lg,
    padding: 22,
    marginBottom: 24,
    ...shadows.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  heroLabelAr: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
    textAlign: 'right',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  streakNum: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gold,
  },
  heroTime: {
    fontSize: 52,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
    lineHeight: 56,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    marginBottom: 20,
  },
  dayRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  dayBar: {
    width: '100%',
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
  },
  dayBarActive: {
    backgroundColor: colors.blue,
    height: 36,
  },
  dayLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  dayLabelActive: {
    color: colors.white,
    fontWeight: '700',
  },

  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.2,
  },
  progressPill: {
    backgroundColor: colors.blueLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  progressPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue,
  },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 8,
    ...shadows.sm,
  },
  challengeCardDone: {
    opacity: 0.6,
  },
  challengeIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  challengeIconDone: {
    backgroundColor: colors.mintLight,
  },
  challengeInfo: { flex: 1 },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  challengeTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  challengeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderMed,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  checkCircleDone: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },

  quoteCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
    ...shadows.sm,
  },
  quoteBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.blue,
    minHeight: 40,
  },
  quoteContent: { flex: 1 },
  quoteAr: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 6,
  },
  quoteEn: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});
