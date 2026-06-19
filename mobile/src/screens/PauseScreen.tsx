import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { addSession, updateStreak } from '../lib/db';
import { INTENTIONS } from '../data/messages';
import { colors, gradients, shadows, radius } from '../theme';

const { width } = Dimensions.get('window');

type Phase = 'intention' | 'duration' | 'active' | 'reflection' | 'done';

const DURATIONS = [
  { mins: 10, label: '10', sub: 'min', labelAr: '١٠ دقائق' },
  { mins: 20, label: '20', sub: 'min', labelAr: '٢٠ دقيقة' },
  { mins: 30, label: '30', sub: 'min', labelAr: '٣٠ دقيقة' },
  { mins: 60, label: '1', sub: 'hour', labelAr: 'ساعة' },
];

const INTENTION_ICONS: Record<string, string> = {
  'أقرأ': 'book-outline',
  'أمشي': 'walk-outline',
  'أتحدث': 'chatbubble-outline',
  'أرتاح': 'bed-outline',
  'أبدع': 'color-palette-outline',
  'أتأمل': 'leaf-outline',
};

export default function PauseScreen() {
  const [phase, setPhase] = useState<Phase>('intention');
  const [selectedIntention, setSelectedIntention] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const transitionTo = (newPhase: Phase) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setPhase(newPhase);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (phase === 'active') {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 3000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();

      const totalSecs = DURATIONS[selectedDuration].mins * 60;
      setTimeLeft(totalSecs);
      setStartTime(Date.now());

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            transitionTo('reflection');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timerRef.current!);
        pulseLoop.current?.stop();
      };
    }
  }, [phase]);

  const startPause = () => transitionTo('active');

  const endEarly = () => {
    clearInterval(timerRef.current!);
    pulseLoop.current?.stop();
    pulseAnim.setValue(1);
    transitionTo('reflection');
  };

  const saveReflection = async () => {
    const elapsed = Math.floor((Date.now() - startTime) / 60000);
    const intention = INTENTIONS[selectedIntention];
    await addSession({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      intention: intention.label,
      intentionIcon: intention.icon,
      durationMinutes: DURATIONS[selectedDuration].mins,
      actualMinutes: Math.max(1, elapsed),
      rating,
      note,
    });
    await updateStreak();
    transitionTo('done');
  };

  const reset = () => {
    setRating(0);
    setNote('');
    transitionTo('intention');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPct = phase === 'active'
    ? 1 - timeLeft / (DURATIONS[selectedDuration].mins * 60)
    : 0;

  const activeIntention = INTENTIONS[selectedIntention];
  const activeIntentionIcon = INTENTION_ICONS[activeIntention.label] ?? 'leaf-outline';

  // ── INTENTION ──────────────────────────────────────────
  if (phase === 'intention') {
    return (
      <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseChip}>PAUSE</Text>
            <Text style={styles.phaseTitle}>What will you do{'\n'}instead?</Text>
            <Text style={styles.phaseTitleAr}>ماذا ستفعل بهذا الوقت؟</Text>
          </View>

          <View style={styles.intentionGrid}>
            {INTENTIONS.map((item, idx) => {
              const isSelected = selectedIntention === idx;
              const iconName = INTENTION_ICONS[item.label] ?? 'leaf-outline';
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.intentionCard, isSelected && styles.intentionCardSelected]}
                  onPress={() => setSelectedIntention(idx)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.intentionIconWrap, isSelected && styles.intentionIconWrapSelected]}>
                    <Ionicons
                      name={iconName as any}
                      size={26}
                      color={isSelected ? colors.white : colors.navy}
                    />
                  </View>
                  <Text style={[styles.intentionLabel, isSelected && styles.intentionLabelSelected]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.intentionLabelEn, isSelected && styles.intentionLabelEnSelected]}>
                    {item.labelEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => transitionTo('duration')}
            activeOpacity={0.9}
          >
            <Text style={styles.nextBtnText}>Choose Duration</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── DURATION ──────────────────────────────────────────
  if (phase === 'duration') {
    return (
      <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => transitionTo('intention')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.phaseHeader}>
            <Text style={styles.phaseChip}>DURATION</Text>
            <Text style={styles.phaseTitle}>How long will{'\n'}you be away?</Text>
            <Text style={styles.phaseTitleAr}>كم من الوقت تريد؟</Text>
          </View>

          <View style={styles.durationGrid}>
            {DURATIONS.map((d, idx) => {
              const isSelected = selectedDuration === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.durationCard, isSelected && styles.durationCardSelected]}
                  onPress={() => setSelectedDuration(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.durationNum, isSelected && styles.durationNumSelected]}>
                    {d.label}
                  </Text>
                  <Text style={[styles.durationSub, isSelected && styles.durationSubSelected]}>
                    {d.sub}
                  </Text>
                  <Text style={[styles.durationAr, isSelected && styles.durationArSelected]}>
                    {d.labelAr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.intentionPreview}>
            <Ionicons name={activeIntentionIcon as any} size={22} color={colors.navy} />
            <View style={styles.intentionPreviewText}>
              <Text style={styles.intentionPreviewLabel}>{activeIntention.label}</Text>
              <Text style={styles.intentionPreviewSub}>
                for {DURATIONS[selectedDuration].label} {DURATIONS[selectedDuration].sub}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.nextBtn}
            onPress={startPause}
            activeOpacity={0.9}
          >
            <Text style={styles.nextBtnText}>Start Pause</Text>
            <Ionicons name="play" size={16} color={colors.white} />
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── ACTIVE ──────────────────────────────────────────
  if (phase === 'active') {
    const circleSize = width * 0.72;
    return (
      <LinearGradient colors={gradients.navy} style={styles.activeScreen}>
        <Animated.View style={{ opacity: fadeAnim, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Pulsing rings */}
          <Animated.View style={[
            styles.pulseRing,
            {
              width: circleSize * 1.25,
              height: circleSize * 1.25,
              borderRadius: circleSize * 0.625,
              transform: [{ scale: pulseAnim }],
            },
          ]} />
          <Animated.View style={[
            styles.pulseRing,
            {
              width: circleSize * 1.05,
              height: circleSize * 1.05,
              borderRadius: circleSize * 0.525,
              transform: [{ scale: pulseAnim }],
              opacity: 0.6,
            },
          ]} />

          {/* Main circle */}
          <View style={[styles.activeCircle, { width: circleSize, height: circleSize, borderRadius: circleSize / 2 }]}>
            <Ionicons name={activeIntentionIcon as any} size={36} color="rgba(255,255,255,0.4)" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerLabel}>{activeIntention.labelEn}</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarFill, { width: `${progressPct * 100}%` }]} />
          </View>

          <Text style={styles.activeHint}>ضع جوالك جانباً</Text>
          <Text style={styles.activeHintEn}>Put your phone away and enjoy this time</Text>

          <TouchableOpacity style={styles.endBtn} onPress={endEarly} activeOpacity={0.7}>
            <Text style={styles.endBtnText}>End Early</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    );
  }

  // ── REFLECTION ──────────────────────────────────────────
  if (phase === 'reflection') {
    return (
      <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseChip}>REFLECT</Text>
            <Text style={styles.phaseTitle}>How was it?</Text>
            <Text style={styles.phaseTitleAr}>كيف كانت تجربتك؟</Text>
          </View>

          <View style={styles.starsSection}>
            <Text style={styles.starsLabel}>Rate your session</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(n => (
                <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                  <Ionicons
                    name={n <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={n <= rating ? colors.gold : colors.borderMed}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.noteWrap}>
            <Text style={styles.noteLabel}>Any thoughts? (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What did you notice? · أي ملاحظات؟"
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.nextBtn, styles.mintBtn]}
            onPress={saveReflection}
            activeOpacity={0.9}
          >
            <Ionicons name="checkmark" size={20} color={colors.white} />
            <Text style={styles.nextBtnText}>Save Session</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    );
  }

  // ── DONE ──────────────────────────────────────────
  return (
    <Animated.View style={[styles.fullScreen, styles.doneScreen, { opacity: fadeAnim }]}>
      <View style={styles.doneIconWrap}>
        <Ionicons name="checkmark-circle" size={72} color={colors.mint} />
      </View>
      <Text style={styles.doneTitle}>أحسنت!</Text>
      <Text style={styles.doneTitleEn}>Well done</Text>
      <Text style={styles.doneMinutes}>
        {Math.floor((Date.now() - startTime) / 60000) || DURATIONS[selectedDuration].mins}
      </Text>
      <Text style={styles.doneMinutesLabel}>minutes of mindful time</Text>
      <Text style={styles.doneDesc}>لقد أضفت لحظة وعي جديدة لرحلتك</Text>

      <TouchableOpacity
        style={[styles.nextBtn, { marginTop: 48 }]}
        onPress={reset}
        activeOpacity={0.9}
      >
        <Ionicons name="refresh" size={18} color={colors.white} />
        <Text style={styles.nextBtnText}>Another Session</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  phaseHeader: {
    marginBottom: 32,
  },
  phaseChip: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.blue,
    letterSpacing: 3,
    marginBottom: 12,
  },
  phaseTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  phaseTitleAr: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'right',
  },

  intentionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  intentionCard: {
    width: (width - 48 - 12) / 2 - 6,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  intentionCardSelected: {
    borderColor: colors.navy,
    backgroundColor: colors.blueLight,
  },
  intentionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  intentionIconWrapSelected: {
    backgroundColor: colors.navy,
  },
  intentionLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy,
    marginBottom: 2,
  },
  intentionLabelSelected: {
    color: colors.navy,
  },
  intentionLabelEn: {
    fontSize: 12,
    color: colors.textMuted,
  },
  intentionLabelEnSelected: {
    color: colors.textSecondary,
  },

  durationGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  durationCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  durationCardSelected: {
    borderColor: colors.navy,
    backgroundColor: colors.blueLight,
  },
  durationNum: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.5,
  },
  durationNumSelected: {
    color: colors.navy,
  },
  durationSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  durationSubSelected: {
    color: colors.textSecondary,
  },
  durationAr: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  durationArSelected: {
    color: colors.textSecondary,
  },

  intentionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 16,
    marginBottom: 28,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  intentionPreviewText: { flex: 1 },
  intentionPreviewLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.navy,
  },
  intentionPreviewSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  nextBtn: {
    backgroundColor: colors.navy,
    borderRadius: radius.full,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1B2B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  mintBtn: {
    backgroundColor: colors.mint,
  },
  nextBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Active phase
  activeScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: 'rgba(76,126,243,0.07)',
  },
  activeCircle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 8,
  },
  timerText: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  progressBarWrap: {
    width: width * 0.6,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    marginTop: 36,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: colors.blue,
    borderRadius: 2,
  },
  activeHint: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  activeHintEn: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 40,
    textAlign: 'center',
  },
  endBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  endBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '500',
  },

  // Reflection phase
  starsSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  starsLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  noteWrap: {
    marginBottom: 28,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderMed,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    minHeight: 100,
  },

  // Done phase
  doneScreen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  doneIconWrap: {
    marginBottom: 20,
  },
  doneTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.navy,
    marginBottom: 4,
  },
  doneTitleEn: {
    fontSize: 18,
    color: colors.textMuted,
    marginBottom: 32,
  },
  doneMinutes: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.mint,
    letterSpacing: -2,
    lineHeight: 78,
  },
  doneMinutesLabel: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 12,
    fontWeight: '500',
  },
  doneDesc: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
