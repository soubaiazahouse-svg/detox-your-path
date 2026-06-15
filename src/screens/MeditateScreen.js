import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import MiniPlayer from '../components/MiniPlayer';
import { TRACKS, GUIDED_SESSIONS, getTrackUrl } from '../constants/tracks';
import { colors, gradients } from '../constants/colors';

const DURATIONS = [5, 10, 15, 20, 30];

const BREATH_PHASES = [
  { label: 'inhale', duration: 4000 },
  { label: 'hold', duration: 4000 },
  { label: 'exhale', duration: 4000 },
];

export default function MeditateScreen() {
  const { t, language, isRTL } = useLanguage();
  const { playTrack, currentTrack, activateSleepTimer } = useAudio();
  const navigation = useNavigation();

  const [selectedDuration, setSelectedDuration] = useState(10);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const breathInterval = useRef(null);
  const countdownInterval = useRef(null);

  const calmTracks = TRACKS.filter((t) => ['peace', 'relax', 'balance'].includes(t.category));

  const startBreathAnimation = (phaseIdx) => {
    const phase = BREATH_PHASES[phaseIdx];
    Animated.timing(scaleAnim, {
      toValue: phase.label === 'inhale' ? 1.4 : 1,
      duration: phase.duration - 200,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const startSession = () => {
    setIsSessionActive(true);
    setSecondsLeft(selectedDuration * 60);
    setBreathPhase(0);
    startBreathAnimation(0);

    let phaseIdx = 0;
    breathInterval.current = setInterval(() => {
      phaseIdx = (phaseIdx + 1) % BREATH_PHASES.length;
      setBreathPhase(phaseIdx);
      startBreathAnimation(phaseIdx);
    }, 4000);

    countdownInterval.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { endSession(); return 0; }
        return s - 1;
      });
    }, 1000);

    const randomTrack = calmTracks[Math.floor(Math.random() * calmTracks.length)];
    playTrack(randomTrack, calmTracks);
    activateSleepTimer(selectedDuration);
  };

  const endSession = () => {
    setIsSessionActive(false);
    clearInterval(breathInterval.current);
    clearInterval(countdownInterval.current);
    Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  const handlePlayGuided = (session) => {
    const fakeTrack = {
      id: session.id,
      title: session.title,
      titleAr: session.titleAr,
      description: session.description,
      descriptionAr: session.descriptionAr,
      file: session.file,
      emoji: session.emoji,
      hz: language === 'ar' ? session.durationAr : session.duration,
      benefit: session.description,
      benefitAr: session.descriptionAr,
      category: 'peace',
    };
    playTrack(fakeTrack, [fakeTrack]);
    navigation.navigate('FullPlayer');
  };

  useEffect(() => {
    return () => {
      clearInterval(breathInterval.current);
      clearInterval(countdownInterval.current);
    };
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const phaseLabel = () => t[BREATH_PHASES[breathPhase].label] || BREATH_PHASES[breathPhase].label;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.title}>{t.meditate}</Text>
          <Text style={styles.subtitle}>{t.meditateSubtitle}</Text>
        </View>

        {/* Guided Sessions */}
        <View style={[styles.sectionHeader, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.sectionTitle}>{t.guidedSessions}</Text>
          <Text style={[styles.sectionSub, isRTL && { textAlign: 'right' }]}>{t.guidedSub}</Text>
        </View>

        <View style={styles.guidedRow}>
          {GUIDED_SESSIONS.map((session) => (
            <TouchableOpacity
              key={session.id}
              style={styles.guidedCard}
              onPress={() => handlePlayGuided(session)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={session.trackColor || gradients.primary} style={styles.guidedCardInner}>
                <Ionicons
                  name={session.id === 'g1' ? 'moon' : 'sunny'}
                  size={30}
                  color="rgba(255,255,255,0.9)"
                  style={{ marginBottom: 10 }}
                />
                <Text style={[styles.guidedTitle, isRTL && { textAlign: 'right' }]}>
                  {language === 'ar' ? session.titleAr : session.title}
                </Text>
                <Text style={[styles.guidedDesc, isRTL && { textAlign: 'right' }]} numberOfLines={2}>
                  {language === 'ar' ? session.descriptionAr : session.description}
                </Text>
                <View style={[styles.guidedFooter, isRTL && styles.rtlRow]}>
                  <View style={styles.guidedDurationBadge}>
                    <Ionicons name="time-outline" size={11} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.guidedDuration}>
                      {language === 'ar' ? session.durationAr : session.duration}
                    </Text>
                  </View>
                  <View style={styles.guidedPlayBtn}>
                    <Ionicons name="play" size={14} color={colors.text} />
                    <Text style={styles.guidedPlayText}>{t.startGuided}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Breathing Session */}
        <View style={[styles.sectionHeader, isRTL && { alignItems: 'flex-end' }, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>
            {language === 'ar' ? 'جلسة التنفس' : 'Breathing Session'}
          </Text>
        </View>

        {/* Breath circle */}
        <View style={styles.circleSection}>
          <Animated.View style={[styles.breathOuter, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={isSessionActive ? gradients.primary : ['#1e2347', '#14173a']}
              style={styles.breathCircle}
            >
              {isSessionActive ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.breathLabel}>{phaseLabel()}</Text>
                  <Text style={styles.countdown}>{formatTime(secondsLeft)}</Text>
                </View>
              ) : (
                <View style={styles.circleSymbol}>
                  <View style={styles.symRing1} />
                  <View style={styles.symRing2} />
                  <View style={styles.symH} />
                  <View style={styles.symV} />
                  <View style={styles.symDot} />
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {isSessionActive && (
            <Text style={styles.breathPhaseHint}>{t[BREATH_PHASES[breathPhase].label]}...</Text>
          )}
        </View>

        {!isSessionActive ? (
          <>
            <View style={[styles.sectionHeader, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={styles.sectionTitle}>{t.selectDuration}</Text>
            </View>
            <View style={styles.durationRow}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, selectedDuration === d && styles.durationChipActive]}
                  onPress={() => setSelectedDuration(d)}
                >
                  <Text style={[styles.durationNum, selectedDuration === d && styles.durationNumActive]}>{d}</Text>
                  <Text style={[styles.durationUnit, selectedDuration === d && styles.durationUnitActive]}>{t.minutes}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.sectionHeader, isRTL && { alignItems: 'flex-end' }]}>
              <Text style={styles.sectionTitle}>
                {language === 'ar' ? 'مسارات هادئة' : 'Calm Tracks'}
              </Text>
            </View>
            {calmTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[styles.calmTrack, isRTL && styles.rtlRow]}
                onPress={() => { playTrack(track, calmTracks); navigation.navigate('FullPlayer'); }}
              >
                <Text style={styles.calmEmoji}>{track.emoji}</Text>
                <View style={[styles.calmInfo, isRTL && { alignItems: 'flex-end' }]}>
                  <Text style={styles.calmTitle}>{language === 'ar' ? track.titleAr : track.title}</Text>
                  <Text style={styles.calmHz}>{track.hz}</Text>
                </View>
                <Ionicons name="play-circle-outline" size={30} color={colors.primary} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={startSession} style={styles.startWrap}>
              <LinearGradient colors={gradients.primary} style={styles.startBtn}>
                <Ionicons name="leaf" size={20} color={colors.text} />
                <Text style={styles.startText}>{t.startSession}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.endWrap} onPress={endSession}>
            <View style={styles.endBtn}>
              <Text style={styles.endText}>
                {language === 'ar' ? 'إنهاء الجلسة' : 'End Session'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: currentTrack ? 80 : 32 }} />
      </ScrollView>

      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { color: colors.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  rtlRow: { flexDirection: 'row-reverse' },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  sectionSub: { color: colors.textMuted, fontSize: 12, marginTop: 3 },

  // Guided Sessions
  guidedRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  guidedCard: { flex: 1, borderRadius: 18, overflow: 'hidden' },
  guidedCardInner: { padding: 16, minHeight: 180 },
  guidedTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  guidedDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17, marginBottom: 14, flex: 1 },
  guidedFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  guidedDurationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  guidedDuration: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },
  guidedPlayBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  guidedPlayText: { color: colors.text, fontSize: 12, fontWeight: '700' },

  // Breath circle
  circleSection: { alignItems: 'center', paddingVertical: 28 },
  breathOuter: { borderRadius: 130, overflow: 'hidden', elevation: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 24 },
  breathCircle: { width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center' },
  circleSymbol: { width: 90, height: 90, justifyContent: 'center', alignItems: 'center' },
  symRing1: { position: 'absolute', width: 88, height: 88, borderRadius: 44, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  symRing2: { position: 'absolute', width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.38)' },
  symH: { position: 'absolute', width: 72, height: 1.5, backgroundColor: 'rgba(255,255,255,0.32)' },
  symV: { position: 'absolute', width: 1.5, height: 72, backgroundColor: 'rgba(255,255,255,0.32)' },
  symDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.80)' },
  breathLabel: { color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  countdown: { color: colors.text, fontSize: 32, fontWeight: '900' },
  breathPhaseHint: { color: colors.textSecondary, fontSize: 16, marginTop: 16, fontStyle: 'italic' },

  // Duration
  durationRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  durationChip: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, alignItems: 'center' },
  durationChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  durationNum: { color: colors.textMuted, fontSize: 18, fontWeight: '800' },
  durationNumActive: { color: colors.text },
  durationUnit: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  durationUnitActive: { color: 'rgba(255,255,255,0.7)' },

  // Calm tracks
  calmTrack: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 14 },
  calmEmoji: { fontSize: 32, width: 44, textAlign: 'center' },
  calmInfo: { flex: 1 },
  calmTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  calmHz: { color: colors.accent, fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 1 },

  // Start / End buttons
  startWrap: { marginHorizontal: 20, marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  startText: { color: colors.text, fontSize: 17, fontWeight: '700' },
  endWrap: { marginHorizontal: 20, marginTop: 24 },
  endBtn: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  endText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
});
