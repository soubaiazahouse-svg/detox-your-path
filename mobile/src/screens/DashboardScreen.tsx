import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getProfile, getStreak, getTodayChallenges, getTotalMinutesThisWeek } from '../lib/db';
import { getWeeklyMessage } from '../data/messages';
import { CHALLENGES } from '../data/challenges';
import { UserData, StreakData } from '../types';
import { colors, gradients } from '../theme';

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
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={gradients.navy} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{user?.name ?? 'Friend'} ✨</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakNum}>{streak.count}</Text>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
        </View>

        <View style={styles.weekCard}>
          <Text style={styles.weekTitle}>This week you reclaimed</Text>
          <Text style={styles.weekTitleAr}>هذا الأسبوع استرجعت</Text>
          <Text style={styles.weekTime}>
            {weekHours > 0 ? `${weekHours}h ` : ''}{weekMins}m
            <Text style={styles.weekTimeSub}> of your life</Text>
          </Text>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((d, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayBar, i === new Date().getDay() && styles.dayBarActive]} />
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* Weekly Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageQuote}>❝</Text>
          <Text style={styles.messageAr}>{message.ar}</Text>
          <Text style={styles.messageEn}>{message.en}</Text>
        </View>

        {/* Today's Progress */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          <Text style={styles.sectionBadge}>{todayDone}/{todayTotal}</Text>
        </View>

        {CHALLENGES.slice(0, 3).map(ch => (
          <View key={ch.id} style={[styles.challengeRow, completedIds.includes(ch.id) && styles.challengeDone]}>
            <Text style={styles.challengeIcon}>{ch.icon}</Text>
            <View style={styles.challengeInfo}>
              <Text style={[styles.challengeName, completedIds.includes(ch.id) && styles.strikethrough]}>
                {ch.titleAr}
              </Text>
              <Text style={styles.challengeNameEn}>{ch.title}</Text>
            </View>
            {completedIds.includes(ch.id) && <Text style={styles.doneCheck}>✓</Text>}
          </View>
        ))}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 13, color: colors.slateLight, letterSpacing: 1 },
  name: { fontSize: 28, fontWeight: '700', color: colors.white, marginTop: 2 },
  streakBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, minWidth: 64 },
  streakNum: { fontSize: 28, fontWeight: '700', color: colors.white, lineHeight: 32 },
  streakFire: { fontSize: 18 },
  streakLabel: { fontSize: 10, color: colors.slateLight, letterSpacing: 1 },
  weekCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
  },
  weekTitle: { fontSize: 13, color: colors.slateLight, letterSpacing: 0.5 },
  weekTitleAr: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginBottom: 8 },
  weekTime: { fontSize: 36, fontWeight: '700', color: colors.white, marginBottom: 16 },
  weekTimeSub: { fontSize: 16, fontWeight: '400', color: colors.slateLight },
  dayRow: { flexDirection: 'row', gap: 8 },
  dayCol: { flex: 1, alignItems: 'center', gap: 4 },
  dayBar: { width: '100%', height: 32, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6 },
  dayBarActive: { backgroundColor: colors.sky },
  dayLabel: { fontSize: 10, color: colors.slateLight },
  body: { padding: 20 },
  messageCard: {
    backgroundColor: colors.navy,
    borderRadius: 20, padding: 24, marginBottom: 24,
    shadowColor: colors.navy, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4,
  },
  messageQuote: { fontSize: 32, color: colors.sky, lineHeight: 36, marginBottom: 8 },
  messageAr: { fontSize: 18, color: colors.white, lineHeight: 28, fontWeight: '500', textAlign: 'right', marginBottom: 8 },
  messageEn: { fontSize: 13, color: colors.slateLight, fontStyle: 'italic', lineHeight: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  sectionBadge: { fontSize: 13, color: colors.textMuted, backgroundColor: colors.ice, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  challengeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14,
    padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  challengeDone: { opacity: 0.6 },
  challengeIcon: { fontSize: 24, marginRight: 14 },
  challengeInfo: { flex: 1 },
  challengeName: { fontSize: 16, fontWeight: '600', color: colors.text },
  challengeNameEn: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  strikethrough: { textDecorationLine: 'line-through', color: colors.textMuted },
  doneCheck: { fontSize: 20, color: colors.success, fontWeight: '700' },
});
