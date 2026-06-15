import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSessions, getStreak, getTotalMinutesThisWeek, getSessionsThisWeek } from '../storage';
import { DetoxSession, StreakData } from '../types';
import { colors, gradients } from '../theme';

const { width } = Dimensions.get('window');
const DAY_NAMES_AR = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Minutes per day this week
  const now = new Date();
  const weekDayMinutes = Array(7).fill(0);
  weekSessions.forEach(s => {
    const d = new Date(s.date).getDay();
    weekDayMinutes[d] += s.actualMinutes;
  });
  const maxDayMins = Math.max(...weekDayMinutes, 1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.navy} style={styles.header}>
        <Text style={styles.headerLabel}>WEEK MIRROR · مرآة الأسبوع</Text>
        <Text style={styles.headerTitle}>الوقت المسترد</Text>
        <Text style={styles.headerSub}>Time you took back this week</Text>

        <View style={styles.bigStat}>
          <Text style={styles.bigNum}>
            {totalHours > 0 ? `${totalHours}h ` : ''}{totalMins}m
          </Text>
          <Text style={styles.bigLabel}>of mindful time</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* Bar chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Breakdown · توزيع الأيام</Text>
          <View style={styles.barChart}>
            {weekDayMinutes.map((mins, i) => {
              const barH = Math.max(4, (mins / maxDayMins) * 120);
              const isToday = i === now.getDay();
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barValue}>{mins > 0 ? `${mins}m` : ''}</Text>
                  <View style={styles.barWrap}>
                    <View style={[
                      styles.bar,
                      { height: barH },
                      isToday && styles.barToday,
                    ]} />
                  </View>
                  <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{DAY_NAMES[i]}</Text>
                  <Text style={styles.barLabelAr}>{DAY_NAMES_AR[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{streak.count}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
            <Text style={styles.statLabelAr}>سلسلة الأيام</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>🏆 Best</Text>
            <Text style={styles.statLabelAr}>الأفضل</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalSessions}</Text>
            <Text style={styles.statLabel}>⏸ Sessions</Text>
            <Text style={styles.statLabelAr}>جلسات</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{avgRating}</Text>
            <Text style={styles.statLabel}>⭐ Avg</Text>
            <Text style={styles.statLabelAr}>متوسط</Text>
          </View>
        </View>

        {/* Recent sessions */}
        {sessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Sessions · آخر الجلسات</Text>
            {sessions.slice(0, 5).map(s => (
              <View key={s.id} style={styles.sessionRow}>
                <Text style={styles.sessionIcon}>{s.intentionIcon}</Text>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionIntention}>{s.intention}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(s.date).toLocaleDateString('ar-SA')} · {s.actualMinutes} دقيقة
                  </Text>
                </View>
                <View style={styles.sessionRating}>
                  {[1,2,3,4,5].map(n => (
                    <Text key={n} style={[styles.miniStar, n <= s.rating && styles.miniStarOn]}>★</Text>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}

        {sessions.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>⏸</Text>
            <Text style={styles.emptyTitle}>لا توجد جلسات بعد</Text>
            <Text style={styles.emptySub}>Use the Pause tab to start your first mindful session</Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 36 },
  headerLabel: { fontSize: 11, color: colors.slateLight, letterSpacing: 3, marginBottom: 8 },
  headerTitle: { fontSize: 36, fontWeight: '700', color: colors.white, textAlign: 'right' },
  headerSub: { fontSize: 13, color: colors.slateLight, marginBottom: 24 },
  bigStat: { alignItems: 'center', marginTop: 8 },
  bigNum: { fontSize: 64, fontWeight: '700', color: colors.sky, letterSpacing: 2 },
  bigLabel: { fontSize: 14, color: colors.slateLight },
  body: { padding: 20 },
  card: {
    backgroundColor: colors.white, borderRadius: 20,
    padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 20 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 160 },
  barCol: { flex: 1, alignItems: 'center' },
  barValue: { fontSize: 9, color: colors.textMuted, marginBottom: 4, textAlign: 'center' },
  barWrap: { width: '100%', height: 120, justifyContent: 'flex-end' },
  bar: { width: '100%', backgroundColor: colors.skyLight, borderRadius: 6 },
  barToday: { backgroundColor: colors.sky },
  barLabel: { fontSize: 9, color: colors.textMuted, marginTop: 4 },
  barLabelToday: { color: colors.blue2, fontWeight: '700' },
  barLabelAr: { fontSize: 8, color: 'rgba(107,140,174,0.6)' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: 16,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statNum: { fontSize: 28, fontWeight: '700', color: colors.navy, lineHeight: 34 },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  statLabelAr: { fontSize: 9, color: 'rgba(107,140,174,0.6)' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 12 },
  sessionRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14,
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  sessionIcon: { fontSize: 26, marginRight: 14 },
  sessionInfo: { flex: 1 },
  sessionIntention: { fontSize: 15, fontWeight: '600', color: colors.text },
  sessionDate: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sessionRating: { flexDirection: 'row', gap: 2 },
  miniStar: { fontSize: 12, color: 'rgba(200,168,75,0.3)' },
  miniStarOn: { color: colors.gold },
  emptyCard: { alignItems: 'center', padding: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
