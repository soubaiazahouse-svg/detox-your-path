import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { getUser, getStreak, clearAll } from '../storage';
import { UserData, StreakData } from '../types';
import { colors, gradients } from '../theme';

export default function SettingsScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastActiveDate: '', longestStreak: 0 });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [u, s] = await Promise.all([getUser(), getStreak()]);
        setUser(u);
        setStreak(s);
      })();
    }, [])
  );

  const confirmReset = () => {
    Alert.alert(
      'Reset All Data',
      'هل أنت متأكد؟ سيتم مسح جميع بياناتك.\nAre you sure? All your data will be deleted.',
      [
        { text: 'Cancel · إلغاء', style: 'cancel' },
        {
          text: 'Reset · إعادة ضبط', style: 'destructive',
          onPress: async () => { await clearAll(); Alert.alert('Done · تم', 'Restart the app.'); },
        },
      ]
    );
  };

  const joinDate = user?.joinDate
    ? new Date(user.joinDate).toLocaleDateString('ar-SA')
    : '—';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={gradients.navy} style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>💧</Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Friend'}</Text>
        <Text style={styles.joinDate}>معنا منذ · Joined {joinDate}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{streak.count}</Text>
            <Text style={styles.statLabel}>🔥 Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>🏆 Best</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user?.goalHours ?? 2}</Text>
            <Text style={styles.statLabel}>🎯 Goal hrs</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROFILE · الملف الشخصي</Text>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>👤</Text>
            <Text style={styles.rowLabel}>Name · الاسم</Text>
            <Text style={styles.rowValue}>{user?.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>🎯</Text>
            <Text style={styles.rowLabel}>Daily Goal · الهدف</Text>
            <Text style={styles.rowValue}>{user?.goalHours}h</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowIcon}>⏰</Text>
            <Text style={styles.rowLabel}>Detox Times · أوقات الديتوكس</Text>
            <Text style={styles.rowValue}>{(user?.detoxTimes ?? []).length} set</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT · عن التطبيق</Text>
          <View style={styles.row}>
            <Text style={styles.rowIcon}>💧</Text>
            <Text style={styles.rowLabel}>Detox Your Path</Text>
            <Text style={styles.rowValue}>v1.0</Text>
          </View>
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowIcon}>🏠</Text>
            <Text style={styles.rowLabel}>AZA House Company</Text>
            <Text style={styles.rowValue}>2024</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={confirmReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>Reset All Data · مسح البيانات</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Made with 💙 by AZA House{'\n'}
          Your data stays on your device only
        </Text>

        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32, alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(79,163,224,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.sky,
    marginBottom: 12,
  },
  avatarIcon: { fontSize: 36 },
  name: { fontSize: 26, fontWeight: '700', color: colors.white, marginBottom: 4 },
  joinDate: { fontSize: 12, color: colors.slateLight, marginBottom: 20 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '700', color: colors.white },
  statLabel: { fontSize: 11, color: colors.slateLight, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)' },
  body: { padding: 20 },
  section: {
    backgroundColor: colors.white, borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: 'hidden',
  },
  sectionLabel: { fontSize: 10, color: colors.textMuted, letterSpacing: 2, padding: 16, paddingBottom: 0 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { fontSize: 18, marginRight: 14 },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  rowValue: { fontSize: 14, color: colors.textMuted },
  resetBtn: {
    borderWidth: 1.5, borderColor: colors.danger + '50',
    borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20,
  },
  resetBtnText: { color: colors.danger, fontSize: 15, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textMuted, lineHeight: 20 },
});
