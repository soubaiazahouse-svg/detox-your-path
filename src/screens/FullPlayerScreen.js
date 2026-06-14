import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, gradients } from '../constants/colors';

export default function FullPlayerScreen() {
  const navigation = useNavigation();
  const { t, language, isRTL } = useLanguage();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    positionMillis,
    durationMillis,
    progress,
    positionStr,
    durationStr,
    isRepeat,
    isShuffle,
    togglePlayPause,
    handleNext,
    handlePrev,
    handleSeek,
    toggleRepeat,
    toggleShuffle,
  } = useAudio();

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t.nowPlaying}</Text>
          <Text style={styles.emptySubText}>No track selected</Text>
        </View>
      </SafeAreaView>
    );
  }

  const title = language === 'ar' ? currentTrack.titleAr : currentTrack.title;
  const description = language === 'ar' ? currentTrack.descriptionAr : currentTrack.description;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <LinearGradient colors={['#1a0a2e', colors.background, colors.background]} style={StyleSheet.absoluteFill} />

      {/* Top bar */}
      <View style={[styles.topBar, isRTL && styles.rtlRow]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.nowPlayingLabel, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.nowPlayingText}>{t.nowPlaying}</Text>
          <Text style={styles.azaLabel}>AZA HOUSE</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Album art */}
      <View style={styles.artSection}>
        <LinearGradient
          colors={isPlaying ? gradients.primary : ['#1a1d38', '#0d0f24']}
          style={styles.artCircle}
        >
          <Text style={styles.artEmoji}>{currentTrack.emoji}</Text>
        </LinearGradient>

        {isPlaying && (
          <View style={styles.wavesContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                style={[
                  styles.wave,
                  { height: 4 + i * 6, opacity: 0.3 + i * 0.1 },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Track info */}
      <View style={[styles.trackInfo, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={[styles.trackTitle, isRTL && { textAlign: 'right' }]}>{title}</Text>
        <Text style={[styles.trackDesc, isRTL && { textAlign: 'right' }]}>{description}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={durationMillis || 1}
          value={positionMillis}
          onSlidingComplete={(val) => handleSeek(val)}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primaryLight}
        />
        <View style={[styles.timeRow, isRTL && styles.rtlRow]}>
          <Text style={styles.timeText}>{positionStr}</Text>
          <Text style={styles.timeText}>{durationStr}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, isRTL && styles.rtlRow]}>
        <TouchableOpacity
          style={[styles.sideBtn, isShuffle && styles.sideBtnActive]}
          onPress={toggleShuffle}
        >
          <Ionicons name="shuffle" size={22} color={isShuffle ? colors.primary : colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.prevNext} onPress={handlePrev}>
          <Ionicons name="play-skip-back" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause} disabled={isLoading}>
          <LinearGradient colors={gradients.primary} style={styles.playBtnInner}>
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={34} color={colors.text} />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.prevNext} onPress={handleNext}>
          <Ionicons name="play-skip-forward" size={32} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sideBtn, isRepeat && styles.sideBtnActive]}
          onPress={toggleRepeat}
        >
          <Ionicons name="repeat" size={22} color={isRepeat ? colors.primary : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Bottom */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomBtn}>
          <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.azaFooter}>AZA HOUSE</Text>
        <TouchableOpacity style={styles.bottomBtn}>
          <Ionicons name="share-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.playerBg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nowPlayingLabel: {
    alignItems: 'center',
  },
  nowPlayingText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  azaLabel: {
    color: colors.accent,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '700',
  },
  artSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  artCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  artEmoji: {
    fontSize: 96,
  },
  wavesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
    height: 40,
  },
  wave: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  trackInfo: {
    paddingHorizontal: 28,
    marginBottom: 24,
    alignItems: 'center',
  },
  trackTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackDesc: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  timeText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
    marginBottom: 32,
  },
  sideBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  sideBtnActive: {
    backgroundColor: `${colors.primary}22`,
  },
  prevNext: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    borderRadius: 40,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  playBtnInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  bottomBtn: {
    padding: 12,
  },
  azaFooter: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubText: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  backBtn: {
    padding: 20,
  },
});
