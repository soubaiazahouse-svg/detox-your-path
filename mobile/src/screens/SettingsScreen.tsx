import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getProfile, getStreak, signOut } from '../lib/db';
import { UserData, StreakData, RootStackParamList } from '../types';
import { colors, shadows, radius } from '../theme';

type SettingRow = {
  icon: string;
  label: string;
  value?: string;
};

export default function SettingsScreen() {
  const [user, setUser] = useState<UserData | null>(null);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastActiveDate: '', longestStreak: 0 });
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [u, s] = await Promise.all([getProfile(), getStreak()]);
        setUser(u);
        setStreak(s);
      })();
    }, [])
  );

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.replace('Splash');
          },
        },
      ]
    );
  };

  const initials = (user?.name ?? 'U').charAt(0).toUpperCase();
  const joinDate = user?.joinDate
    ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const profileRows: SettingRow[] = [
    { icon: 'person-outline', label: 'Name · الاسم', value: user?.name ?? '—' },
    { icon: 'flag-outline', label: 'Daily Goal · الهدف', value: `${user?.goalHours ?? 2}h / day` },
    { icon: 'calendar-outline', label: 'Joined', value: joinDate },
  ];

  const appRows: SettingRow[] = [
    { icon: 'information-circle-outline', label: 'Detox Your Path', value: 'v2.0' },
    { icon: 'shield-checkmark-outline', label: 'Data is synced securely', value: '' },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name ?? 'Friend'}</Text>
        <Text style={styles.userJoined}>Member since {joinDate}</Text>

        {/* Streak stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={styles.statIconWrap}>
              <Ionicons name="flame-outline" size={16} color="#FF6B35" />
            </View>
            <Text style={styles.statNum}>{streak.count}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.statIconWrap}>
              <Ionicons name="trophy-outline" size={16} color={colors.gold} />
            </View>
            <Text style={styles.statNum}>{streak.longestStreak}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.statIconWrap}>
              <Ionicons name="flag-outline" size={16} color={colors.blue} />
            </View>
            <Text style={styles.statNum}>{user?.goalHours ?? 2}h</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>
      </View>

      {/* Profile section */}
      <View style={styles.body}>
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.section}>
          {profileRows.map((row, i) => (
            <View key={i} style={[styles.row, i === profileRows.length - 1 && styles.rowLast]}>
              <View style={styles.rowIconWrap}>
                <Ionicons name={row.icon as any} size={18} color={colors.navy} />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.borderMed} />
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.section}>
          {appRows.map((row, i) => (
            <View key={i} style={[styles.row, i === appRows.length - 1 && styles.rowLast]}>
              <View style={styles.rowIconWrap}>
                <Ionicons name={row.icon as any} size={18} color={colors.navy} />
              </View>
              <Text style={styles.rowLabel}>{row.label}</Text>
              {row.value ? <Text style={styles.rowValue}>{row.value}</Text> : null}
            </View>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={confirmSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Made with care by AZA House{'\n'}
          بياناتك محفوظة بأمان في السحابة
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentContainer: { paddingBottom: 40 },

  profileHeader: {
    backgroundColor: colors.surface,
    paddingTop: 64,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...shadows.md,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 4,
  },
  userJoined: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: colors.border,
  },

  body: { padding: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: 24,
    overflow: 'hidden',
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: colors.textMuted,
  },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2F1',
    borderRadius: radius.md,
    paddingVertical: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FFD5D3',
    marginBottom: 24,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.error,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
