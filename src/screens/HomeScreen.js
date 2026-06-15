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
import { TRACKS } from '../constants/tracks';
import { colors, gradients } from '../constants/colors';

const MOOD_KEY = '@aza_mood';
const CHALLENGE_GOAL = 5;

const MOODS = [
  { key: 'anxious', emoji: '😰', trackIds: ['3', '6'] },
  { key: 'tired',   emoji: '😴', trackIds: ['9', '1'] },
  { key: 'unfocused', emoji: '😵', trackIds: ['5', '8'] },
  { key: 'sad',     emoji: '😔', trackIds: ['4', '2'] },
  { key: 'calm',    emoji: '😌', trackIds: ['10', '7'] },
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
};

const getTimeRecommendations = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) {
    return { labelKey: 'morningPicks', emoji: '☀️', tracks: TRACKS.filter((t) => t.timeOfDay === 'morning') };
  }
  if (h >= 12 && h < 18) {
    return { labelKey: 'afternoonPicks', emoji: '🌤️', tracks: TRACKS.filter((t) => ['focus', 'balance', 'clear'].includes(t.category)) };
  }
  return { labelKey: 'nightPicks', emoji: '🌙', tracks: TRACKS.filter((t) => t.timeOfDay === 'night') };
};

export default function HomeScreen() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const { streak, daysThisWeek } = useStats();
  const navigation = useNavigation();

  const [todayMood, setTodayMood] = useState(null); // { key, emoji, trackIds, date }

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
  const featuredTracks = TRACKS.slice(0, 4);
  const timeRec = getTimeRecommendations();

  const handlePlay = (track) => {
    playTrack(track, TRACKS);
    navigation.navigate('FullPlayer');
  };

  const moodRecommendedTracks = todayMood
    ? todayMood.trackIds.map((id) => TRACKS.find((t) => t.id === id)).filter(Boolean)
    : [];

  const challengeProgress = Math.min(daysThisWeek, CHALLENGE_GOAL);
  const challengeDone = challengeProgress >= CHALLENGE_GOAL;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a0a2e', colors.background]} style={styles.header}>
          <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, isRTL && { textAlign: 'right' }]}>
                {greeting}, {userName} 👋
              </Text>
              <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>
                {t.homeSubtitle}
              </Text>
            </View>
            <View style={[styles.headerRight, isRTL && styles.rtlRow]}>
              {streak.current >= 2 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>🔥 {streak.current}</Text>
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

        {/* Mood Check-in */}
        <View style={styles.moodCard}>
          <Text style={[styles.moodQuestion, isRTL && { textAlign: 'right' }]}>
            {t.howAreYou}
          </Text>
          {!todayMood ? (
            <View style={[styles.moodRow, isRTL && styles.rtlRow]}>
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={styles.moodBtn}
                  onPress={() => selectMood(m)}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                  <Text style={styles.moodLabel}>{t[`mood${m.key.charAt(0).toUpperCase() + m.key.slice(1)}`]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View>
              <View style={[styles.moodSelectedRow, isRTL && styles.rtlRow]}>
                <Text style={styles.moodEmoji}>{todayMood.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.moodRecLabel, isRTL && { textAlign: 'right' }]}>
                    {t.moodRecommended}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setTodayMood(null)}
                    style={styles.changeMoodBtn}
                  >
                    <Text style={styles.changeMoodText}>
                      {language === 'ar' ? 'تغيير' : 'Change'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.moodTracks, isRTL && styles.rtlRow]}>
                {moodRecommendedTracks.map((track) => (
                  <TouchableOpacity
                    key={track.id}
                    style={styles.moodTrackCard}
                    onPress={() => handlePlay(track)}
                  >
                    <LinearGradient
                      colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || ['#1a1d38', '#14173a'])}
                      style={styles.moodTrackInner}
                    >
                      <Text style={styles.moodTrackEmoji}>{track.emoji}</Text>
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

        {/* Weekly Challenge */}
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
                  style={[
                    styles.dot,
                    i < challengeProgress && (challengeDone ? styles.dotDone : styles.dotActive),
                  ]}
                />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* For You Right Now */}
        <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
          <View style={[styles.sectionTitleRow, isRTL && styles.rtlRow]}>
            <Text style={styles.timeEmoji}>{timeRec.emoji}</Text>
            <View>
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
                <Text style={styles.recEmoji}>{track.emoji}</Text>
                <Text style={styles.recHz}>{track.hz}</Text>
                <Text style={styles.recTitle} numberOfLines={1}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                {currentTrack?.id === track.id && isPlaying && <View style={styles.playingDot} />}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Tracks */}
        <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
          <Text style={styles.sectionTitle}>{t.featuredTracks}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Music')}>
            <Text style={styles.seeAll}>{language === 'ar' ? 'عرض الكل ←' : 'See all →'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {featuredTracks.map((track) => (
            <TouchableOpacity key={track.id} style={styles.trackCard} onPress={() => handlePlay(track)} activeOpacity={0.85}>
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || gradients.card)}
                style={styles.trackCardInner}
              >
                <Text style={styles.trackEmoji}>{track.emoji}</Text>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                <Text style={styles.trackCat}>{track.category}</Text>
                {currentTrack?.id === track.id && isPlaying && <View style={styles.playingDot} />}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All Tracks */}
        <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
          <Text style={styles.sectionTitle}>{t.allTracks}</Text>
        </View>

        {TRACKS.map((track) => (
          <TouchableOpacity
            key={track.id}
            style={[styles.listItem, currentTrack?.id === track.id && styles.listItemActive]}
            onPress={() => handlePlay(track)}
            activeOpacity={0.8}
          >
            <View style={[styles.listItemContent, isRTL && styles.rtlRow]}>
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : (track.trackColor || [colors.surfaceLight, colors.surfaceLight])}
                style={styles.listEmoji}
              >
                <Text style={styles.listEmojiText}>{track.emoji}</Text>
              </LinearGradient>
              <View style={[styles.listText, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.listTitle}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                <Text style={[styles.listDesc, isRTL && { textAlign: 'right' }]} numberOfLines={1}>
                  {language === 'ar' ? track.descriptionAr : track.description}
                </Text>
                <View style={[styles.hzBadge, isRTL && { alignSelf: 'flex-end' }]}>
                  <Text style={styles.hzBadgeText}>{track.hz}</Text>
                </View>
              </View>
              {currentTrack?.id === track.id && isPlaying ? (
                <Ionicons name="pause-circle" size={32} color={colors.primary} />
              ) : (
                <Ionicons name="play-circle-outline" size={32} color={colors.textMuted} />
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: currentTrack ? 80 : 24 }} />
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
    backgroundColor: `${colors.accent}22`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
  },
  streakText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  subBtn: { borderRadius: 20, overflow: 'hidden' },
  subBtnInner: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  // Mood card
  moodCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moodQuestion: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: { alignItems: 'center', flex: 1 },
  moodEmoji: { fontSize: 28, marginBottom: 4 },
  moodLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '600' },
  moodSelectedRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  moodRecLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  changeMoodBtn: {},
  changeMoodText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  moodTracks: { flexDirection: 'row', gap: 12 },
  moodTrackCard: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  moodTrackInner: { padding: 14, borderRadius: 14 },
  moodTrackEmoji: { fontSize: 24, marginBottom: 6 },
  moodTrackHz: { color: colors.accent, fontSize: 10, fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  moodTrackTitle: { color: colors.text, fontSize: 12, fontWeight: '700' },

  // Weekly Challenge
  challengeCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: 18, overflow: 'hidden' },
  challengeInner: { padding: 16, borderRadius: 18 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  challengeTitle: { color: colors.text, fontSize: 13, fontWeight: '800' },
  challengeGoalText: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  challengeCount: { color: colors.accent, fontSize: 16, fontWeight: '900' },
  challengeDots: { flexDirection: 'row', gap: 8 },
  dot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  dotDone: { backgroundColor: '#000' },

  // Section headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeEmoji: { fontSize: 24 },
  sectionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '700' },
  seeAll: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  // Horizontal scrolls
  hScroll: { paddingHorizontal: 20, gap: 12, marginBottom: 28 },
  recCard: { width: 130, borderRadius: 16, overflow: 'hidden' },
  recCardInner: { padding: 14, minHeight: 120, justifyContent: 'space-between' },
  recEmoji: { fontSize: 32, marginBottom: 8 },
  recHz: { color: colors.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  recTitle: { color: colors.text, fontSize: 13, fontWeight: '700' },
  trackCard: { width: 140, borderRadius: 16, overflow: 'hidden' },
  trackCardInner: { padding: 16, minHeight: 130, justifyContent: 'space-between' },
  trackEmoji: { fontSize: 36, marginBottom: 12 },
  trackTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  trackCat: { color: 'rgba(255,255,255,0.5)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },
  playingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, position: 'absolute', top: 12, right: 12 },

  // List items
  listItem: { marginHorizontal: 20, marginBottom: 10, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  listItemActive: { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
  listItemContent: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  listEmoji: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  listEmojiText: { fontSize: 24 },
  listText: { flex: 1 },
  listTitle: { color: colors.text, fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listDesc: { color: colors.textMuted, fontSize: 11, lineHeight: 15, marginBottom: 5 },
  hzBadge: { alignSelf: 'flex-start', backgroundColor: `${colors.accent}22`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: `${colors.accent}44` },
  hzBadgeText: { color: colors.accent, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
});
