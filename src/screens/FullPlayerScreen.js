import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  ScrollView,
  Share,
  Linking,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, gradients } from '../constants/colors';

const TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

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
    sleepTimerStr,
    sleepTimerRemaining,
    togglePlayPause,
    handleNext,
    handlePrev,
    handleSeek,
    toggleRepeat,
    toggleShuffle,
    activateSleepTimer,
    cancelSleepTimer,
  } = useAudio();

  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleShare = async () => {
    if (!currentTrack) return;
    const trackName = language === 'ar' ? currentTrack.titleAr : currentTrack.title;
    const message = language === 'ar'
      ? `🎵 "${trackName}" (${currentTrack.hz}) — استمع معي في تطبيق AZA للشفاء بالصوت ✨`
      : `🎵 "${trackName}" (${currentTrack.hz}) — Listen with me on AZA Sound Healing ✨`;
    try { await Share.share({ message }); } catch {}
  };

  const handleWhatsAppShare = async () => {
    if (!currentTrack) return;
    const trackName = language === 'ar' ? currentTrack.titleAr : currentTrack.title;
    const desc = language === 'ar' ? currentTrack.descriptionAr : currentTrack.description;
    const message = language === 'ar'
      ? `🎵 "${trackName}" — ${desc}\n(${currentTrack.hz}) في تطبيق AZA للشفاء بالصوت ✨`
      : `🎵 "${trackName}" — ${desc}\n(${currentTrack.hz}) on AZA Sound Healing ✨`;
    try {
      await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
    } catch {
      try { await Share.share({ message }); } catch {}
    }
  };

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
  const benefit = language === 'ar' ? currentTrack.benefitAr : currentTrack.benefit;

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
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowInfoModal(true)}>
          <Ionicons name="information-circle-outline" size={26} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Album art */}
      <View style={styles.artSection}>
        <LinearGradient
          colors={currentTrack.trackColor || (isPlaying ? gradients.primary : ['#1a1d38', '#0d0f24'])}
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
        <View style={styles.hzPill}>
          <Text style={styles.hzText}>{currentTrack.hz}</Text>
        </View>
        <Text style={[styles.trackDescription, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
          {description}
        </Text>
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

      {/* Bottom row */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.bottomBtn}>
          <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Sleep Timer button */}
        <TouchableOpacity
          style={[styles.timerBtn, sleepTimerRemaining && styles.timerBtnActive]}
          onPress={() => setShowTimerModal(true)}
        >
          <Ionicons
            name="moon"
            size={16}
            color={sleepTimerRemaining ? colors.accent : colors.textMuted}
          />
          {sleepTimerStr ? (
            <Text style={styles.timerText}>{sleepTimerStr}</Text>
          ) : (
            <Text style={styles.timerLabel}>{t.sleepTimer}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsAppShare}>
          <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          <Text style={styles.whatsappText}>
            {language === 'ar' ? 'واتساب' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sleep Timer Modal */}
      <Modal
        visible={showTimerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimerModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{t.setTimerTitle}</Text>
            <Text style={styles.modalSub}>{t.setTimerSub}</Text>

            <View style={styles.timerGrid}>
              {TIMER_OPTIONS.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={styles.timerOption}
                  onPress={() => {
                    activateSleepTimer(min);
                    setShowTimerModal(false);
                  }}
                >
                  <LinearGradient colors={gradients.primary} style={styles.timerOptionInner}>
                    <Text style={styles.timerOptionNum}>{min}</Text>
                    <Text style={styles.timerOptionMin}>{t.minutes}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>

            {sleepTimerRemaining && (
              <TouchableOpacity
                style={styles.cancelTimerBtn}
                onPress={() => {
                  cancelSleepTimer();
                  setShowTimerModal(false);
                }}
              >
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <Text style={styles.cancelTimerText}>{t.cancelTimer}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Hz Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInfoModal(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.infoHeader}>
              <Text style={styles.infoEmoji}>{currentTrack.emoji}</Text>
              <View style={styles.infoTitleWrap}>
                <Text style={styles.infoTrackName}>{title}</Text>
                <View style={styles.infoHzBadge}>
                  <Text style={styles.infoHz}>{currentTrack.hz}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.infoSectionLabel}>
              {language === 'ar' ? '✦ ' : '✦ '}{t.knowYourFrequency}
            </Text>

            <View style={styles.infoCard}>
              <Text style={styles.infoFreqLabel}>{t.frequency}</Text>
              <Text style={styles.infoFreqValue}>{currentTrack.hz}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoFreqLabel}>{t.frequencyBenefits}</Text>
              <Text style={[styles.infoBenefit, isRTL && { textAlign: 'right' }]}>
                {benefit}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.infoDoneBtn}
              onPress={() => setShowInfoModal(false)}
            >
              <LinearGradient colors={gradients.primary} style={styles.infoDoneBtnInner}>
                <Text style={styles.infoDoneText}>✓</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: 28,
  },
  artCircle: {
    width: 210,
    height: 210,
    borderRadius: 105,
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
    marginTop: 20,
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
    marginBottom: 20,
    alignItems: 'center',
  },
  trackTitle: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  hzPill: {
    backgroundColor: `${colors.accent}22`,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
  },
  hzText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },
  trackDescription: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    marginBottom: 28,
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
    paddingHorizontal: 28,
  },
  bottomBtn: {
    padding: 12,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(37,211,102,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,211,102,0.35)',
  },
  whatsappText: {
    color: '#25D366',
    fontSize: 13,
    fontWeight: '700',
  },
  timerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timerBtnActive: {
    borderColor: colors.accent,
    backgroundColor: `${colors.accent}11`,
  },
  timerText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  timerLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
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

  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Timer modal
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  timerOptionInner: {
    width: 80,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  timerOptionNum: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  timerOptionMin: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
  cancelTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelTimerText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },

  // Hz Info modal
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  infoEmoji: {
    fontSize: 52,
  },
  infoTitleWrap: {
    flex: 1,
  },
  infoTrackName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoHzBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.accent}22`,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${colors.accent}55`,
  },
  infoHz: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoSectionLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoFreqLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  infoFreqValue: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  infoBenefit: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  infoDoneBtn: {
    borderRadius: 50,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 8,
  },
  infoDoneBtnInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoDoneText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
});
