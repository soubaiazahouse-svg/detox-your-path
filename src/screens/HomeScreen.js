import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
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

const MOODS = [
  { key: 'anxious',   color: '#ef4444', trackIds: ['3', '6'] },
  { key: 'tired',     color: '#64748b', trackIds: ['9', '1'] },
  { key: 'unfocused', color: '#f97316', trackIds: ['5', '8'] },
  { key: 'sad',       color: '#3b82f6', trackIds: ['4', '2'] },
  { key: 'calm',      color: '#22c55e', trackIds: ['10', '7'] },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
};

const getTimeRec = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { labelKey: 'morningPicks', icon: 'sunny', tracks: TRACKS.filter((t) => t.timeOfDay === 'morning') };
  if (h >= 12 && h < 18) return { labelKey: 'afternoonPicks', icon: 'partly-sunny', tracks: TRACKS.filter((t) => ['focus', 'balance', 'clear'].includes(t.category)) };
  return { labelKey: 'nightPicks', icon: 'moon', tracks: TRACKS.filter((t) => t.timeOfDay === 'night') };
};

export default function HomeScreen() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { streak, daysThisWeek } = useStats();
  const navigation = useNavigation();

  const [todayMood, setTodayMood] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(MOOD_KEY).then((raw) => {
      if (!raw) return;
      const saved = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      if (saved.date === today) setTodayMood(saved);
    });
  }, []);

  const selectMood = async (mood) => {
    const today = new Date().toISOString().slice(0, 10);
    const entry = { ...mood, date: today };
    setTodayMood(entry);
    await AsyncStorage.setItem(MOOD_KEY, JSON.stringify(entry));
  };

  const greeting = t[getGreeting()];
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || t.hello;
  const timeRec = getTimeRec();
  const challengeProgress = Math.min(daysThisWeek, CHALLENGE_GOAL);
  const challengeDone = challengeProgress >= CHALLENGE_GOAL;
  const moodTracks = todayMood
    ? todayMood.trackIds.map((id) => TRACKS.find((tr) => tr.id === id)).filter(Boolean)
    : [];

  const handlePlay = (track) => {
    playTrack(track, TRACKS);
    navigation.navigate('FullPlayer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={[styles.header, styles.headerRow, isRTL && styles.rtlRow]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, isRTL && { textAlign: 'right' }]}>{greeting}، {userName}</Text>
            <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>{t.homeSubtitle}</Text>
          </View>
          <View style={[styles.headerRight, isRTL && styles.rtlRow]}>
            {streak.current >= 2 && (
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={12} color={colors.accent} />
                <Text style={styles.streakText}>{streak.current}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.subBtn} onPress={() => navigation.navigate('Subscription')}>
              <LinearGradient colors={gradients.gold} style={styles.subBtnInner}>
                <Ionicons name="star" size={13} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Mood Check-in ── */}
        <View style={styles.moodCard}>
          <View style={[styles.moodHeaderRow, isRTL && styles.rtlRow]}>
            <Text style={[styles.moodQuestion, isRTL && { textAlign: 'right' }]}>{t.howAreYou}</Text>
            {todayMood && (
              <TouchableOpacity onPress={() => setTodayMood(null)}>
                <Text style={styles.changeMoodText}>{language === 'ar' ? 'تغيير' : 'Change'}</Text>
              </TouchableOpacity>
            )}
          </View>
          {!todayMood ? (
            <View style={[styles.moodRow, isRTL && styles.rtlRow]}>
              {MOODS.map((m) => (
                <TouchableOpacity key={m.key} style={styles.moodBtn} onPress={() => selectMood(m)}>
                  <View style={[styles.moodDot, { backgroundColor: m.color }]} />
                  <Text style={styles.moodLabel}>{t[`mood${m.key.charAt(0).toUpperCase() + m.key.slice(1)}`]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={[styles.moodTracks, isRTL && styles.rtlRow]}>
              {moodTracks.map((track) => (
                <TouchableOpacity key={track.id} style={[styles.moodTrackRow, isRTL && styles.rtlRow]} onPress={() => handlePlay(track)}>
                  <LinearGradient colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || ['#1a1d38', '#14173a'])} style={styles.moodTrackThumb}>
                    <TrackSymbol category={track.category} size={22} />
                  </LinearGradient>
                  <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={styles.moodTrackTitle} numberOfLines={1}>{language === 'ar' ? track.titleAr : track.title}</Text>
                    <Text style={styles.moodTrackHz}>{track.hz}</Text>
                  </View>
                  <Ionicons name={currentTrack?.id === track.id && isPlaying ? 'pause-circle' : 'play-circle'} size={28} color={colors.primary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── For You Right Now ── */}
        <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
          <Ionicons name={timeRec.icon} size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>{t[timeRec.labelKey]}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {timeRec.tracks.map((track) => (
            <TouchableOpacity key={track.id} style={styles.recCard} onPress={() => handlePlay(track)} activeOpacity={0.85}>
              <LinearGradient colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || gradients.card)} style={styles.recCardInner}>
                <TrackSymbol category={track.category} size={28} />
                <Text style={styles.recHz}>{track.hz}</Text>
                <Text style={styles.recTitle} numberOfLines={1}>{language === 'ar' ? track.titleAr : track.title}</Text>
                {currentTrack?.id === track.id && isPlaying && <View style={styles.playingDot} />}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Weekly Challenge ── */}
        <View style={styles.challengeCard}>
          <LinearGradient colors={challengeDone ? gradients.gold : ['#1a1d38', '#14173a']} style={styles.challengeInner}>
            <View style={[styles.challengeHeader, isRTL && styles.rtlRow]}>
              <Ionicons name={challengeDone ? 'trophy' : 'flame'} size={18} color={challengeDone ? '#000' : colors.accent} />
              <Text style={[styles.challengeTitle, challengeDone && { color: '#000' }, { flex: 1 }, isRTL && { textAlign: 'right' }]}>
                {challengeDone ? t.challengeDone : t.weeklyChallenge}
              </Text>
              <Text style={[styles.challengeCount, challengeDone && { color: '#000' }]}>{challengeProgress}/{CHALLENGE_GOAL}</Text>
            </View>
            <View style={styles.challengeDots}>
              {Array.from({ length: CHALLENGE_GOAL }).map((_, i) => (
                <View key={i} style={[styles.dot, i < challengeProgress && (challengeDone ? styles.dotDone : styles.dotActive)]} />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Explore Library button ── */}
        <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Music')} activeOpacity={0.8}>
          <View style={[styles.exploreBtnInner, isRTL && styles.rtlRow]}>
            <Ionicons name="musical-notes" size={18} color={colors.primary} />
            <Text style={[styles.exploreBtnText, isRTL && { textAlign: 'right' }]}>
              {language === 'ar' ? 'استعرض كل المسارات' : 'Explore Full Library'}
            </Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={16} color={colors.textMuted} />
          </View>
        </TouchableOpacity>

        <View style={{ height: currentTrack ? 80 : 32 }} />
      </ScrollView>

      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rtlRow: { flexDirection: 'row-reverse' },
  greeting: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 2 },
  subtitle: { color: colors.textSecondary, fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: `${colors.accent}22`, borderRadius: 16,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: `${colors.accent}44`,
  },
  streakText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
  subBtn: { borderRadius: 18, overflow: 'hidden' },
  subBtnInner: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },

  // Mood
  moodCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  moodHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  moodQuestion: { color: colors.text, fontSize: 14, fontWeight: '700' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', flex: 1, gap: 5 },
  moodDot: { width: 12, height: 12, borderRadius: 6 },
  moodLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center' },
  changeMoodText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  moodTracks: { flexDirection: 'column', gap: 8 },
  moodTrackRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceLight, borderRadius: 12, padding: 10 },
  moodTrackThumb: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  moodTrackTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  moodTrackHz: { color: colors.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', flex: 1 },

  // Rec cards
  hScroll: { paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  recCard: { width: 108, borderRadius: 14, overflow: 'hidden' },
  recCardInner: { padding: 12, minHeight: 100, justifyContent: 'space-between' },
  recHz: { color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 6, marginBottom: 2 },
  recTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },
  playingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, position: 'absolute', top: 8, right: 8 },

  // Challenge
  challengeCard: { marginHorizontal: 16, marginBottom: 14, borderRadius: 14, overflow: 'hidden' },
  challengeInner: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  challengeTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  challengeCount: { color: colors.accent, fontSize: 14, fontWeight: '900' },
  challengeDots: { flexDirection: 'row', gap: 6 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  dotDone: { backgroundColor: '#000' },

  // Explore button
  exploreBtn: { marginHorizontal: 16, borderRadius: 14 },
  exploreBtnInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  exploreBtnText: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '600' },
});
