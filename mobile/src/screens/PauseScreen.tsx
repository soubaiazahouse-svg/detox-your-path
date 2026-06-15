import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addSession, updateStreak } from '../storage';
import { INTENTIONS } from '../data/messages';
import { colors, gradients } from '../theme';

const { width, height } = Dimensions.get('window');

type Phase = 'intention' | 'duration' | 'active' | 'reflection' | 'done';

const DURATIONS = [
  { mins: 10, label: '10 min', labelAr: '١٠ دقائق' },
  { mins: 20, label: '20 min', labelAr: '٢٠ دقيقة' },
  { mins: 30, label: '30 min', labelAr: '٣٠ دقيقة' },
  { mins: 60, label: '1 hour', labelAr: 'ساعة' },
];

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

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [phase]);

  useEffect(() => {
    if (phase === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 3000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        ])
      ).start();

      const totalSecs = DURATIONS[selectedDuration].mins * 60;
      setTimeLeft(totalSecs);
      setStartTime(Date.now());

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            fadeAnim.setValue(0);
            setPhase('reflection');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current!);
    }
  }, [phase]);

  const startPause = () => {
    fadeAnim.setValue(0);
    setPhase('active');
  };

  const endEarly = () => {
    clearInterval(timerRef.current!);
    pulseAnim.stopAnimation();
    fadeAnim.setValue(0);
    setPhase('reflection');
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
    fadeAnim.setValue(0);
    setPhase('done');
  };

  const reset = () => {
    fadeAnim.setValue(0);
    setPhase('intention');
    setRating(0);
    setNote('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPct = phase === 'active'
    ? 1 - timeLeft / (DURATIONS[selectedDuration].mins * 60)
    : 0;

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>

      {/* ── INTENTION ── */}
      {phase === 'intention' && (
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          <Text style={styles.phaseLabel}>PAUSE</Text>
          <Text style={styles.mainTitle}>ماذا ستفعل{'\n'}بهذا الوقت؟</Text>
          <Text style={styles.mainSub}>What will you do with this time?</Text>

          <View style={styles.intentionsGrid}>
            {INTENTIONS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.intentionCard, selectedIntention === idx && styles.intentionSelected]}
                onPress={() => setSelectedIntention(idx)}
                activeOpacity={0.8}
              >
                <Text style={styles.intentionIcon}>{item.icon}</Text>
                <Text style={styles.intentionLabel}>{item.label}</Text>
                <Text style={styles.intentionLabelEn}>{item.labelEn}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={() => { fadeAnim.setValue(0); setPhase('duration'); }} activeOpacity={0.85}>
            <LinearGradient colors={gradients.sky} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>Choose Duration · اختر المدة</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.ScrollView>
      )}

      {/* ── DURATION ── */}
      {phase === 'duration' && (
        <Animated.View style={[styles.scroll, { opacity: fadeAnim }]}>
          <Text style={styles.phaseLabel}>PAUSE</Text>
          <Text style={styles.mainTitle}>كم من الوقت{'\n'}تريد؟</Text>
          <Text style={styles.mainSub}>How long will you be away?</Text>

          <View style={styles.durationsGrid}>
            {DURATIONS.map((d, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.durationCard, selectedDuration === idx && styles.durationSelected]}
                onPress={() => setSelectedDuration(idx)}
                activeOpacity={0.8}
              >
                <Text style={styles.durationNum}>{d.mins}</Text>
                <Text style={styles.durationUnit}>min</Text>
                <Text style={styles.durationAr}>{d.labelAr}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.intentionPreview}>
            <Text style={styles.intentionPreviewIcon}>{INTENTIONS[selectedIntention].icon}</Text>
            <Text style={styles.intentionPreviewText}>
              {INTENTIONS[selectedIntention].label} · {DURATIONS[selectedDuration].labelAr}
            </Text>
          </View>

          <TouchableOpacity style={styles.nextBtn} onPress={startPause} activeOpacity={0.85}>
            <LinearGradient colors={gradients.sky} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>Start Pause · ابدأ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── ACTIVE ── */}
      {phase === 'active' && (
        <Animated.View style={[styles.activeContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
          <Animated.View style={[styles.pulseRing2, { transform: [{ scale: pulseAnim }], opacity: 0.5 }]} />

          <Text style={styles.activeIntention}>{INTENTIONS[selectedIntention].icon}</Text>
          <Text style={styles.activeLabel}>{INTENTIONS[selectedIntention].label}</Text>

          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
          </View>

          <Text style={styles.pauseHint}>ضع جوالك جانباً 📵</Text>
          <Text style={styles.pauseHintEn}>Put your phone away</Text>

          <TouchableOpacity style={styles.endBtn} onPress={endEarly} activeOpacity={0.7}>
            <Text style={styles.endBtnText}>End Early · أنهِ مبكراً</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* ── REFLECTION ── */}
      {phase === 'reflection' && (
        <Animated.ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
        >
          <Text style={styles.reflectEmoji}>🌿</Text>
          <Text style={styles.mainTitle}>كيف كانت{'\n'}تجربتك؟</Text>
          <Text style={styles.mainSub}>How was it?</Text>

          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} activeOpacity={0.7}>
                <Text style={[styles.star, n <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.noteInput}
            placeholder="أي شيء تريد تسجيله؟ (اختياري)  ·  Any thoughts?"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={styles.nextBtn} onPress={saveReflection} activeOpacity={0.85}>
            <LinearGradient colors={gradients.success} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>Save · احفظ ✓</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.ScrollView>
      )}

      {/* ── DONE ── */}
      {phase === 'done' && (
        <Animated.View style={[styles.doneContainer, { opacity: fadeAnim }]}>
          <Text style={styles.doneEmoji}>🎉</Text>
          <Text style={styles.doneTitle}>أحسنت!</Text>
          <Text style={styles.doneSub}>Well done! Another mindful moment added.</Text>
          <Text style={styles.doneDesc}>لقد أضفت لحظة وعي جديدة لرحلتك</Text>

          <TouchableOpacity style={[styles.nextBtn, { marginTop: 48 }]} onPress={reset} activeOpacity={0.85}>
            <LinearGradient colors={gradients.sky} style={styles.nextBtnGrad}>
              <Text style={styles.nextBtnText}>Another Pause · جلسة جديدة</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 70 },
  phaseLabel: { fontSize: 11, color: colors.sky, letterSpacing: 4, marginBottom: 16 },
  mainTitle: { fontSize: 36, fontWeight: '700', color: colors.white, lineHeight: 44, marginBottom: 8, textAlign: 'right' },
  mainSub: { fontSize: 14, color: colors.slateLight, marginBottom: 40 },
  intentionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  intentionCard: {
    width: (width - 56 - 12) / 2 - 6,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
    borderRadius: 20, padding: 20, alignItems: 'center',
  },
  intentionSelected: { borderColor: colors.sky, backgroundColor: 'rgba(79,163,224,0.2)' },
  intentionIcon: { fontSize: 36, marginBottom: 10 },
  intentionLabel: { fontSize: 18, color: colors.white, fontWeight: '600' },
  intentionLabelEn: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  durationsGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  durationCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
    borderRadius: 18, padding: 16, alignItems: 'center',
  },
  durationSelected: { borderColor: colors.sky, backgroundColor: 'rgba(79,163,224,0.2)' },
  durationNum: { fontSize: 28, fontWeight: '700', color: colors.white },
  durationUnit: { fontSize: 11, color: colors.slateLight },
  durationAr: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  intentionPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    padding: 16, marginBottom: 32,
  },
  intentionPreviewIcon: { fontSize: 28 },
  intentionPreviewText: { fontSize: 16, color: colors.white, fontWeight: '500' },
  nextBtn: { borderRadius: 50, overflow: 'hidden', shadowColor: colors.sky, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  nextBtnGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 50 },
  nextBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },

  // Active phase
  activeContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  pulseRing: {
    position: 'absolute', width: width * 0.75, height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: 'rgba(79,163,224,0.08)',
  },
  pulseRing2: {
    position: 'absolute', width: width * 0.55, height: width * 0.55,
    borderRadius: width * 0.275,
    backgroundColor: 'rgba(79,163,224,0.1)',
  },
  activeIntention: { fontSize: 72, marginBottom: 12 },
  activeLabel: { fontSize: 22, color: colors.skyLight, marginBottom: 32, fontWeight: '500' },
  timerText: { fontSize: 80, fontWeight: '700', color: colors.white, letterSpacing: 4, marginBottom: 32 },
  progressBar: {
    width: '100%', height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 40,
  },
  progressFill: { height: 4, backgroundColor: colors.sky, borderRadius: 2 },
  pauseHint: { fontSize: 20, color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginBottom: 4 },
  pauseHintEn: { fontSize: 13, color: colors.slateLight, marginBottom: 48 },
  endBtn: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50, paddingVertical: 14, paddingHorizontal: 32,
  },
  endBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  // Reflection
  reflectEmoji: { fontSize: 56, marginBottom: 16 },
  starsRow: { flexDirection: 'row', gap: 12, marginBottom: 28, justifyContent: 'center' },
  star: { fontSize: 44, color: 'rgba(255,255,255,0.2)' },
  starActive: { color: colors.gold },
  noteInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
    borderRadius: 16, padding: 18,
    color: colors.white, fontSize: 15,
    minHeight: 100, textAlignVertical: 'top',
    marginBottom: 32,
  },

  // Done
  doneContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneEmoji: { fontSize: 80, marginBottom: 24 },
  doneTitle: { fontSize: 48, fontWeight: '700', color: colors.white, marginBottom: 8 },
  doneSub: { fontSize: 16, color: colors.skyLight, textAlign: 'center', marginBottom: 8 },
  doneDesc: { fontSize: 14, color: colors.slateLight, textAlign: 'center', lineHeight: 22 },
});
