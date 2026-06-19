import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTodayChallenges, toggleChallenge, updateStreak } from '../lib/db';
import { CHALLENGES } from '../data/challenges';
import { colors, shadows, radius } from '../theme';

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
  const pct = total > 0 ? done / total : 0;

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerDate}>{todayDate}</Text>
        <Text style={styles.headerTitle}>Daily Challenges</Text>
        <Text style={styles.headerTitleAr}>التحديات اليومية</Text>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{done}/{total} complete</Text>
        </View>
      </View>

      {/* All done banner */}
      {done === total && total > 0 && (
        <View style={styles.allDoneCard}>
          <View style={styles.allDoneIconWrap}>
            <Ionicons name="trophy" size={28} color={colors.gold} />
          </View>
          <View style={styles.allDoneText}>
            <Text style={styles.allDoneTitle}>أكملت تحديات اليوم!</Text>
            <Text style={styles.allDoneSub}>All challenges complete. Come back tomorrow!</Text>
          </View>
        </View>
      )}

      {/* Challenge list */}
      <View style={styles.list}>
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
                <Ionicons
                  name={ch.icon as any}
                  size={22}
                  color={isDone ? colors.mint : colors.navy}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitleAr, isDone && styles.textDone]}>
                  {ch.titleAr}
                </Text>
                <Text style={styles.cardTitle}>{ch.title}</Text>
                <Text style={styles.cardDesc}>{ch.desc}</Text>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
                  {isDone && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <Text style={styles.pointsBadge}>+{ch.points}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

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
    paddingBottom: 24,
    backgroundColor: colors.bg,
  },
  headerDate: {
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  headerTitleAr: {
    fontSize: 17,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
    marginBottom: 20,
  },
  progressSection: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderMed,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.navy,
    borderRadius: radius.full,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },

  allDoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldLight,
    borderRadius: radius.md,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0DFA8',
    gap: 14,
  },
  allDoneIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(212,168,83,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allDoneText: { flex: 1 },
  allDoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B6914',
    marginBottom: 2,
    textAlign: 'right',
  },
  allDoneSub: {
    fontSize: 12,
    color: '#A07820',
  },

  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    ...shadows.sm,
  },
  cardDone: {
    opacity: 0.65,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  iconWrapDone: {
    backgroundColor: colors.mintLight,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitleAr: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'right',
  },
  cardTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 17,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  cardRight: {
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderMed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.mint,
    borderColor: colors.mint,
  },
  pointsBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
