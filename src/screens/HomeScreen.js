import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useStats } from '../context/StatsContext';
import MiniPlayer from '../components/MiniPlayer';
import TrackSymbol from '../components/TrackSymbol';
import { TRACKS } from '../constants/tracks';
import { colors, gradients } from '../constants/colors';

const MOOD_KEY = '@aza_mood';
const CHALLENGE_GOAL = 5;
const SB_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 28) : 0;

const MOODS = [
  { key: 'anxious',   trackIds: ['3', '6'] },
  { key: 'tired',     trackIds: ['9', '1'] },
  { key: 'unfocused', trackIds: ['5', '8'] },
  { key: 'sad',       trackIds: ['4', '2'] },
  { key: 'calm',      trackIds: ['10', '7'] },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
};

const getTimeRec = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)
    return { labelKey: 'morningPicks', icon: 'sunny-outline', tracks: TRACKS.filter(t => t.timeOfDay === 'morning') };
  if (h >= 12 && h < 18)
    return { labelKey: 'afternoonPicks', icon: 'partly-sunny-outline', tracks: TRACKS.filter(t => ['focus','balance','clear'].includes(t.category)) };
  return { labelKey: 'nightPicks', icon: 'moon-outline', tracks: TRACKS.filter(t => t.timeOfDay === 'night') };
};

export default function HomeScreen() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { streak, daysThisWeek } = useStats();
  const navigation = useNavigation();
  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(MOOD_KEY).then(raw => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.date === new Date().toISOString().slice(0, 10)) setTodayMood(saved);
    });
  }, []);

  const selectMood = async mood => {
    const entry = { ...mood, date: new Date().toISOString().slice(0, 10) };
    setTodayMood(entry);
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(entry));
  };

  const greeting  = t[getGreeting()] || '';
  const userName  = user?.user_metadata?.full_name?.split(' ')[0] || t.hello;
  const timeRec   = getTimeRec();
  const progress  = Math.min(daysThisWeek, CHALLENGE_GOAL);
  const done      = progress >= CHALLENGE_GOAL;
  const moodTracks = todayMood
    ? todayMood.trackIds.map(id => TRACKS.find(tr => tr.id === id)).filter(Boolean)
    : [];

  const play = track => { playTrack(track, TRACKS); navigation.navigate('FullPlayer'); };

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ═══ HEADER — always visible, never hidden ═══ */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.greeting, isRTL && styles.rtlText]}
            numberOfLines={1}
          >
            {greeting}{greeting ? '،' : ''} {userName}
          </Text>
          <Text style={[styles.sub, isRTL && styles.rtlText]} numberOfLines={1}>
            {t.homeSubtitle}
          </Text>
        </View>

        <View style={[styles.headerActions, isRTL && styles.row]}>
          {streak.current >= 2 && (
            <View style={styles.streakPill}>
              <Ionicons name="flame" size={12} color={colors.accent} />
              <Text style={styles.streakNum}>{streak.current}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Subscription')} style={styles.starBtn}>
            <LinearGradient colors={gradients.gold} style={styles.starInner}>
              <Ionicons name="star" size={13} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >

        {/* ── كيف حالك؟ ── */}
        <View style={styles.card}>
          <View style={[styles.rowBetween, isRTL && styles.row]}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t.howAreYou}</Text>
            {todayMood && (
              <TouchableOpacity onPress={() => setTodayMood(null)}>
                <Text style={styles.link}>{language === 'ar' ? 'تغيير' : 'Change'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {!todayMood ? (
            <View style={[styles.chips, isRTL && styles.chipsRTL]}>
              {MOODS.map(m => (
                <TouchableOpacity
                  key={m.key}
                  style={styles.chip}
                  onPress={() => selectMood(m)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipText}>
                    {t[`mood${m.key.charAt(0).toUpperCase() + m.key.slice(1)}`]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={{ gap: 8, marginTop: 4 }}>
              {moodTracks.map(track => (
                <TouchableOpacity
                  key={track.id}
                  style={[styles.moodRow, isRTL && styles.row, currentTrack?.id === track.id && styles.moodRowActive]}
                  onPress={() => play(track)}
                  activeOpacity={0.8}
                >
                  <LinearGradient colors={track.trackColor || gradients.primary} style={styles.moodThumb}>
                    <TrackSymbol category={track.category} size={20} />
                  </LinearGradient>
                  <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={styles.moodTitle} numberOfLines={1}>
                      {language === 'ar' ? track.titleAr : track.title}
                    </Text>
                    <Text style={styles.moodHz}>{track.hz}</Text>
                  </View>
                  <Ionicons
                    name={currentTrack?.id === track.id && isPlaying ? 'pause-circle' : 'play-circle'}
                    size={32}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── مقترح حسب الوقت ── */}
        <View style={[styles.secRow, isRTL && styles.row]}>
          <Ionicons name={timeRec.icon} size={15} color={colors.accent} />
          <Text style={[styles.secLabel, isRTL && styles.rtlText]}>{t[timeRec.labelKey]}</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.hRow, isRTL && styles.hRowRTL]}
        >
          {timeRec.tracks.map(track => (
            <TouchableOpacity
              key={track.id}
              style={styles.recCard}
              onPress={() => play(track)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || gradients.card)}
                style={styles.recInner}
              >
                <TrackSymbol category={track.category} size={26} />
                <Text style={styles.recHz}>{track.hz}</Text>
                <Text style={styles.recTitle} numberOfLines={1}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                {currentTrack?.id === track.id && isPlaying && <View style={styles.dot} />}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── كل المسارات (5 صفوف) ── */}
        <View style={[styles.secRow, isRTL && styles.row]}>
          <Ionicons name="musical-notes-outline" size={15} color={colors.accent} />
          <Text style={[styles.secLabel, { flex: 1 }, isRTL && styles.rtlText]}>
            {language === 'ar' ? 'مسارات مميزة' : 'Featured Tracks'}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Music')}>
            <Text style={styles.link}>{language === 'ar' ? 'الكل' : 'All'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trackList}>
          {TRACKS.slice(0, 5).map(track => (
            <TouchableOpacity
              key={track.id}
              style={[styles.trackRow, isRTL && styles.row, currentTrack?.id === track.id && styles.trackRowActive]}
              onPress={() => play(track)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || [colors.surfaceLight, colors.surfaceLight])}
                style={styles.trackThumb}
              >
                <TrackSymbol category={track.category} size={19} />
              </LinearGradient>
              <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={[styles.trackTitle, currentTrack?.id === track.id && { color: colors.primaryLight }]} numberOfLines={1}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                <Text style={styles.trackHz}>{track.hz}</Text>
              </View>
              <Ionicons
                name={currentTrack?.id === track.id && isPlaying ? 'pause' : 'play'}
                size={15}
                color={currentTrack?.id === track.id ? colors.primaryLight : colors.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── تحدي الأسبوع ── */}
        <View style={styles.challenge}>
          <LinearGradient colors={done ? gradients.gold : ['#1a1d38', '#14173a']} style={styles.challengeInner}>
            <View style={[styles.rowBetween, isRTL && styles.row, { marginBottom: 10 }]}>
              <View style={[styles.rowBetween, isRTL && styles.row, { gap: 8, flex: 1 }]}>
                <Ionicons name={done ? 'trophy-outline' : 'flame-outline'} size={16} color={done ? '#000' : colors.accent} />
                <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={[styles.challengeTitle, done && { color: '#000' }]}>{t.weeklyChallenge}</Text>
                  <Text style={[styles.challengeSub, done && { color: '#333' }]}>
                    {done ? t.challengeDone : t.challengeGoal}
                  </Text>
                </View>
              </View>
              <Text style={[styles.challengeCount, done && { color: '#000' }]}>{progress}/{CHALLENGE_GOAL}</Text>
            </View>
            <View style={styles.dotsRow}>
              {Array.from({ length: CHALLENGE_GOAL }).map((_, i) => (
                <View key={i} style={[styles.challengeDot, i < progress && (done ? styles.dotDone : styles.dotActive)]} />
              ))}
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: currentTrack ? 80 : 24 }} />
      </ScrollView>

      <MiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Header — explicit statusBar height so greeting never hidden
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: SB_H + 14,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 3 },
  sub: { color: colors.textSecondary, fontSize: 12 },
  rtlText: { textAlign: 'right' },
  headerActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row-reverse' },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: `${colors.accent}22`, borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: `${colors.accent}44`,
  },
  streakNum: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  starBtn: { borderRadius: 17, overflow: 'hidden' },
  starInner: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },

  scroll: { paddingTop: 14, paddingHorizontal: 16 },

  // Card
  card: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: colors.border,
    marginBottom: 18,
  },
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  link: { color: colors.primary, fontSize: 12, fontWeight: '700' },

  // Mood chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipsRTL: { flexDirection: 'row-reverse', flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.surfaceLight, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '600' },

  // Mood tracks
  moodRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 10,
  },
  moodRowActive: { borderWidth: 1, borderColor: `${colors.primary}88` },
  moodThumb: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  moodTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  moodHz: { color: colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Section label
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  secLabel: { color: colors.text, fontSize: 14, fontWeight: '700' },

  // Horizontal rec
  hRow: { gap: 10, paddingBottom: 18, paddingRight: 2 },
  hRowRTL: { flexDirection: 'row-reverse' },
  recCard: { width: 112, borderRadius: 14, overflow: 'hidden' },
  recInner: { padding: 12, minHeight: 106, justifyContent: 'space-between' },
  recHz: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 6, marginBottom: 2 },
  recTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, position: 'absolute', top: 8, right: 8 },

  // Track list
  trackList: { gap: 8, marginBottom: 18 },
  trackRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  trackRowActive: { borderColor: `${colors.primary}66`, backgroundColor: `${colors.primary}0d` },
  trackThumb: { width: 38, height: 38, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  trackTitle: { color: colors.text, fontSize: 13, fontWeight: '600' },
  trackHz: { color: colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Challenge
  challenge: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  challengeInner: { paddingHorizontal: 14, paddingVertical: 12 },
  challengeTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  challengeSub: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  challengeCount: { color: colors.accent, fontSize: 14, fontWeight: '900' },
  dotsRow: { flexDirection: 'row', gap: 6 },
  challengeDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  dotDone: { backgroundColor: '#000' },
});
