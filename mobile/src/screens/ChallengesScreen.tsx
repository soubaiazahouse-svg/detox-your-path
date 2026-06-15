import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTodayChallenges, toggleChallenge, updateStreak } from '../storage';
import { CHALLENGES } from '../data/challenges';
import { colors, gradients } from '../theme';

export default function ChallengesScreen() {
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getTodayChallenges().then(setCompletedIds);
    }, [])
  );

  const handleToggle = async (id: string) => {
    const updated = await toggleChallenge(id);
    setCompletedIds(updated);
    if (updated.includes(id)) await updateStreak();
  };

  const done = CHALLENGES.filter(c => completedIds.includes(c.id)).length;
  const total = CHALLENGES.length;
  const pct = Math.round((done / total) * 100);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.navy} style={styles.header}>
        <Text style={styles.headerLabel}>TODAY · اليوم</Text>
        <Text style={styles.headerTitle}>Daily Challenges</Text>
        <Text style={styles.headerTitleAr}>التحديات اليومية</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>{done}/{total}</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {done === total && total > 0 && (
          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneEmoji}>🌟</Text>
            <Text style={styles.allDoneTitle}>أكملت تحديات اليوم!</Text>
            <Text style={styles.allDoneSub}>All done for today! Come back tomorrow.</Text>
          </View>
        )}

        {CHALLENGES.map(ch => {
          const isDone = completedIds.includes(ch.id);
          return (
            <TouchableOpacity
              key={ch.id}
              style={[styles.card, isDone && styles.cardDone]}
              onPress={() => handleToggle(ch.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.iconWrap, isDone && styles.iconWrapDone]}>
                <Text style={styles.icon}>{ch.icon}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.titleAr, isDone && styles.strike]}>{ch.titleAr}</Text>
                <Text style={styles.title}>{ch.title}</Text>
                <Text style={styles.desc}>{ch.descAr}</Text>
              </View>
              <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                {isDone && <Text style={styles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32 },
  headerLabel: { fontSize: 11, color: colors.slateLight, letterSpacing: 3, marginBottom: 8 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: colors.white },
  headerTitleAr: { fontSize: 18, color: colors.sky, fontStyle: 'italic', marginBottom: 24 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: colors.success, borderRadius: 3 },
  progressText: { fontSize: 13, color: colors.slateLight, fontWeight: '600' },
  body: { padding: 20 },
  allDoneCard: {
    backgroundColor: colors.success + '20',
    borderWidth: 1, borderColor: colors.success + '50',
    borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 20,
  },
  allDoneEmoji: { fontSize: 40, marginBottom: 8 },
  allDoneTitle: { fontSize: 20, fontWeight: '700', color: colors.success, marginBottom: 4 },
  allDoneSub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 18,
    padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  cardDone: { opacity: 0.65 },
  iconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: colors.ice,
    alignItems: 'center', justifyContent: 'center', marginRight: 16,
  },
  iconWrapDone: { backgroundColor: colors.success + '20' },
  icon: { fontSize: 26 },
  info: { flex: 1 },
  titleAr: { fontSize: 17, fontWeight: '700', color: colors.text, textAlign: 'right' },
  title: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 18, textAlign: 'right' },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginLeft: 12,
  },
  checkCircleDone: { backgroundColor: colors.success, borderColor: colors.success },
  checkMark: { color: colors.white, fontSize: 14, fontWeight: '700' },
});
