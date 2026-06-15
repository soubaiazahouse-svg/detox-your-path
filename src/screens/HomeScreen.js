import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MiniPlayer from '../components/MiniPlayer';
import { TRACKS } from '../constants/tracks';
import { colors, gradients } from '../constants/colors';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'goodMorning';
  if (h < 17) return 'goodAfternoon';
  return 'goodEvening';
};

const getTimeRecommendations = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) {
    return {
      labelKey: 'morningPicks',
      emoji: '☀️',
      tracks: TRACKS.filter((t) => t.timeOfDay === 'morning'),
    };
  }
  if (h >= 12 && h < 18) {
    return {
      labelKey: 'afternoonPicks',
      emoji: '🌤️',
      tracks: TRACKS.filter((t) => ['focus', 'balance', 'clear'].includes(t.category)),
    };
  }
  return {
    labelKey: 'nightPicks',
    emoji: '🌙',
    tracks: TRACKS.filter((t) => t.timeOfDay === 'night'),
  };
};

export default function HomeScreen() {
  const { t, isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const navigation = useNavigation();

  const greeting = t[getGreeting()];
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || t.hello;
  const featuredTracks = TRACKS.slice(0, 4);
  const timeRec = getTimeRecommendations();

  const handlePlay = (track) => {
    playTrack(track, TRACKS);
    navigation.navigate('FullPlayer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#1a0a2e', colors.background]} style={styles.header}>
          <View style={[styles.headerRow, isRTL && styles.rtlRow]}>
            <View>
              <Text style={[styles.greeting, isRTL && { textAlign: 'right' }]}>
                {greeting}, {userName} 👋
              </Text>
              <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>
                {t.homeSubtitle}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.subBtn}
              onPress={() => navigation.navigate('Subscription')}
            >
              <LinearGradient colors={gradients.gold} style={styles.subBtnInner}>
                <Ionicons name="star" size={14} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Featured banner */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => handlePlay(TRACKS[8])}
          activeOpacity={0.9}
        >
          <LinearGradient colors={gradients.primary} style={styles.bannerGrad}>
            <Text style={styles.bannerEmoji}>🕊️</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerLabel}>FEATURED</Text>
              <Text style={styles.bannerTitle}>
                {language === 'ar' ? TRACKS[8].titleAr : TRACKS[8].title}
              </Text>
              <Text style={styles.bannerSub}>
                {language === 'ar' ? TRACKS[8].descriptionAr : TRACKS[8].description}
              </Text>
            </View>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={20} color={colors.text} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {timeRec.tracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={styles.recCard}
              onPress={() => handlePlay(track)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : gradients.card}
                style={styles.recCardInner}
              >
                <Text style={styles.recEmoji}>{track.emoji}</Text>
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

        {/* Featured tracks */}
        <View style={[styles.sectionHeader, isRTL && styles.rtlRow]}>
          <Text style={styles.sectionTitle}>{t.featuredTracks}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Music')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {featuredTracks.map((track) => (
            <TouchableOpacity
              key={track.id}
              style={styles.trackCard}
              onPress={() => handlePlay(track)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={currentTrack?.id === track.id ? gradients.primary : gradients.card}
                style={styles.trackCardInner}
              >
                <Text style={styles.trackEmoji}>{track.emoji}</Text>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {language === 'ar' ? track.titleAr : track.title}
                </Text>
                <Text style={styles.trackCat}>{track.category}</Text>
                {currentTrack?.id === track.id && isPlaying && (
                  <View style={styles.playingDot} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* All tracks */}
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
              <View style={[styles.listEmoji, currentTrack?.id === track.id && styles.listEmojiActive]}>
                <Text style={styles.listEmojiText}>{track.emoji}</Text>
              </View>
              <View style={[styles.listText, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.listTitle}>
                  {language === 'ar' ? track.titleAr : track.title}
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  greeting: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  subBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  subBtnInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  bannerEmoji: {
    fontSize: 48,
  },
  bannerText: {
    flex: 1,
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    lineHeight: 17,
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeEmoji: {
    fontSize: 24,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  hScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 28,
  },
  recCard: {
    width: 130,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recCardInner: {
    padding: 14,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  recEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  recHz: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  recTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  trackCard: {
    width: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  trackCardInner: {
    padding: 16,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  trackEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  trackCat: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    position: 'absolute',
    top: 12,
    right: 12,
  },
  listItem: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  listItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  listEmoji: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listEmojiActive: {
    backgroundColor: `${colors.primary}33`,
  },
  listEmojiText: {
    fontSize: 24,
  },
  listText: {
    flex: 1,
  },
  listTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  hzBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.accent}22`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
  },
  hzBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
