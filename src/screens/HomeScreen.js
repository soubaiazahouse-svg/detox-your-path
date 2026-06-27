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
        <LinearGradient colors={['#1a0a2e', colors.background]} style={styles.header}>
          <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, isRTL && { textAlign: 'right' }]}>
                {greeting}, {userName}
              </Text>
              <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>
                {t.homeSubtitle}
              </Text>
            </View>
            <View style={[styles.headerRight, isRTL && styles.rtlRow]}>
              {streak.current >= 2 && (
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={13} color={colors.accent} />
                  <Text style={styles.streakText}>{streak.current}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.subBtn}
                onPress={() => navigation.navigate('Subscription')}
              >
                <LinearGradient colors={gradients.gold} style={styles.subBtnInner}>
                  <Ionicons name="star" size={14} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Mood Check-in ── */}
        <View style={styles.moodCard}>
          <Text style={[styles.moodQuestion, isRTL && { textAlign: 'right' }]}>
            {t.howAreYou}
          </Text>
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
            <View>
              <View style={[styles.moodSelectedRow, isRTL && styles.rtlRow]}>
                <View style={[styles.moodDot, { backgroundColor: todayMood.color, width: 20, height: 20, borderRadius: 10 }]} />
                <Text style={[styles.moodRecLabel, isRTL && { textAlign: 'right' }, { flex: 1 }]}>
                  {t.moodRecommended}
                </Text>
                <TouchableOpacity onPress={() => setTodayMood(null)}>
                  <Text style={styles.changeMoodText}>
                    {language === 'ar' ? 'تغيير' : 'Change'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.moodTracks, isRTL && styles.rtlRow]}>
                {moodTracks.map((track) => (
                  <TouchableOpacity key={track.id} style={styles.moodTrackCard} onPress={() => handlePlay(track)}>
                    <LinearGradient
                      colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || ['#1a1d38', '#14173a'])}
                      style={styles.moodTrackInner}
                    >
                      <TrackSymbol category={track.category} size={32} />
                      <Text style={styles.moodTrackHz}>{track.hz}</Text>
                      <Text style={styles.moodTrackTitle} numberOfLines={1}>
                        {language === 'ar' ? track.titleAr : track.title}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── For You Right Now ── */}
        <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
          <View style={[styles.sectionTitleRow, isRTL && styles.rtlRow]}>
            <Ionicons name={timeRec.icon} size={20} color={colors.accent} />
            <View style={isRTL && { alignItems: 'flex-end' }}>
              <Text style={styles.sectionLabel}>{t.forYouNow}</Text>
              <Text style={styles.sectionTitle}>{t[timeRec.labelKey]}</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {timeRec.tracks.map((track) => (
            <TouchableOpacity key={track.id} style={styles.recCard} onPress={() => handlePlay(track)} activeOpacity={0.85}>
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || gradients.card)}
                style={styles.recCardInner}
              >
                <TrackSymbol category={track.category} size={38} />
                <Text style={styles.recHz}>{track.hz}</Text>
                <Text style={styles.recTitle} numberOfLines={1}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                {currentTrack?.id === track.id && isPlaying && (
                  <View style={styles.playingDot} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Weekly Challenge ── */}
        <View style={styles.challengeCard}>
          <LinearGradient
            colors={challengeDone ? gradients.gold : ['#1a1d38', '#14173a']}
            style={styles.challengeInner}
          >
            <View style={[styles.challengeHeader, isRTL && styles.rtlRow]}>
              <Ionicons
                name={challengeDone ? 'trophy' : 'flame'}
                size={20}
                color={challengeDone ? '#000' : colors.accent}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.challengeTitle, challengeDone && { color: '#000' }, isRTL && { textAlign: 'right' }]}>
                  {t.weeklyChallenge}
                </Text>
                <Text style={[styles.challengeGoalText, challengeDone && { color: '#000' }, isRTL && { textAlign: 'right' }]}>
                  {challengeDone ? t.challengeDone : t.challengeGoal}
                </Text>
              </View>
              <Text style={[styles.challengeCount, challengeDone && { color: '#000' }]}>
                {challengeProgress}/{CHALLENGE_GOAL}
              </Text>
            </View>
            <View style={styles.challengeDots}>
              {Array.from({ length: CHALLENGE_GOAL }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i < challengeProgress && (challengeDone ? styles.dotDone : styles.dotActive)]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Explore Library button ── */}
        <TouchableOpacity
          style={styles.exploreBtn}
          onPress={() => navigation.navigate('Music')}
          activeOpacity={0.8}
        >
          <View style={styles.exploreBtnInner}>
            <Ionicons name="musical-notes" size={20} color={colors.primary} />
            <Text style={[styles.exploreBtnText, isRTL && { textAlign: 'right' }]}>
              {language === 'ar' ? 'استعرض كل المسارات' : 'Explore Full Library'}
            </Text>
            <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={18} color={colors.textMuted} />
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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rtlRow: { flexDirection: 'row-reverse' },
  greeting: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 14 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${colors.accent}22`, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: `${colors.accent}44`,
  },
  streakText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  subBtn: { borderRadius: 20, overflow: 'hidden' },
  subBtnInner: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // Mood
  moodCard: {
    marginHorizontal: 20, marginBottom: 28,
    backgroundColor: colors.surface, borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: colors.border,
  },
  moodQuestion: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 16 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', flex: 1, gap: 6 },
  moodDot: { width: 14, height: 14, borderRadius: 7 },
  moodLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  moodSelectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  moodRecLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  changeMoodText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  moodTracks: { flexDirection: 'row', gap: 12 },
  moodTrackCard: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  moodTrackInner: { padding: 14, borderRadius: 14 },
  moodTrackHz: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', marginTop: 8, marginBottom: 4, letterSpacing: 1 },
  moodTrackTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 2 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },

  // Rec cards
  hScroll: { paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  recCard: { width: 130, borderRadius: 16, overflow: 'hidden' },
  recCardInner: { padding: 14, minHeight: 124, justifyContent: 'space-between' },
  recHz: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginBottom: 2 },
  recTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  playingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.accent, position: 'absolute', top: 10, right: 10 },

  // Challenge
  challengeCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: 18, overflow: 'hidden' },
  challengeInner: { padding: 16, borderRadius: 18 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  challengeTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  challengeGoalText: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  challengeCount: { color: colors.accent, fontSize: 16, fontWeight: '900' },
  challengeDots: { flexDirection: 'row', gap: 8 },
  dot: { flex: 1, height: 5, borderRadius: 2.5, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  dotDone: { backgroundColor: '#000' },

  // Explore button
  exploreBtn: { marginHorizontal: 20, borderRadius: 16, overflow: 'hidden' },
  exploreBtnInner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  exploreBtnText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
});
