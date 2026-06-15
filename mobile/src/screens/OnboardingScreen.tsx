import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { saveUser } from '../storage';
import { colors, gradients } from '../theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'> };

const GOAL_OPTIONS = [
  { hours: 1, label: '1 hr', labelAr: 'ساعة' },
  { hours: 2, label: '2 hrs', labelAr: 'ساعتان' },
  { hours: 3, label: '3 hrs', labelAr: '٣ ساعات' },
  { hours: 4, label: '4 hrs+', labelAr: '٤+ ساعات' },
];

const TIME_OPTIONS = [
  { id: 'morning', icon: '🌅', label: 'Morning', labelAr: 'الصباح', desc: 'First hour after waking' },
  { id: 'meals', icon: '🍽️', label: 'Meals', labelAr: 'أوقات الطعام', desc: 'No screens while eating' },
  { id: 'night', icon: '🌙', label: 'Night', labelAr: 'الليل', desc: '1 hour before sleep' },
];

export default function OnboardingScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goalHours, setGoalHours] = useState(2);
  const [detoxTimes, setDetoxTimes] = useState<string[]>(['morning']);

  const toggleTime = (id: string) => {
    setDetoxTimes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const finish = async () => {
    await saveUser({
      name: name.trim() || 'Friend',
      goalHours,
      detoxTimes,
      onboarded: true,
      joinDate: new Date().toISOString(),
    });
    navigation.replace('Main');
  };

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.progress}>
          {[1, 2, 3].map(n => (
            <View key={n} style={[styles.dot, step >= n && styles.dotActive]} />
          ))}
        </View>

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.titleAr}>ما اسمك؟</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name · اسمك"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity style={styles.btn} onPress={() => setStep(2)} activeOpacity={0.85}>
              <LinearGradient colors={gradients.sky} style={styles.btnGrad}>
                <Text style={styles.btnText}>Next · التالي</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>Daily Screen Goal</Text>
            <Text style={styles.titleAr}>هدف وقت الشاشة اليومي</Text>
            <Text style={styles.desc}>How many hours of screen time per day is your target?{'\n'}
              <Text style={styles.descAr}>ما هدفك اليومي لوقت الشاشة؟</Text>
            </Text>
            <View style={styles.options}>
              {GOAL_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.hours}
                  style={[styles.optionCard, goalHours === opt.hours && styles.optionSelected]}
                  onPress={() => setGoalHours(opt.hours)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optHours}>{opt.hours}</Text>
                  <Text style={styles.optLabel}>{opt.label}</Text>
                  <Text style={styles.optLabelAr}>{opt.labelAr}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => setStep(3)} activeOpacity={0.85}>
              <LinearGradient colors={gradients.sky} style={styles.btnGrad}>
                <Text style={styles.btnText}>Next · التالي</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text style={styles.emoji}>⏰</Text>
            <Text style={styles.title}>Detox Times</Text>
            <Text style={styles.titleAr}>أوقات الديتوكس</Text>
            <Text style={styles.desc}>When do you want to be screen-free?{'\n'}
              <Text style={styles.descAr}>متى تريد أن تكون بعيداً عن الشاشة؟</Text>
            </Text>
            {TIME_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.timeCard, detoxTimes.includes(opt.id) && styles.timeSelected]}
                onPress={() => toggleTime(opt.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.timeIcon}>{opt.icon}</Text>
                <View style={styles.timeText}>
                  <Text style={styles.timeName}>{opt.label} · {opt.labelAr}</Text>
                  <Text style={styles.timeDesc}>{opt.desc}</Text>
                </View>
                <Text style={styles.check}>{detoxTimes.includes(opt.id) ? '✓' : ''}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.btn, { marginTop: 28 }]} onPress={finish} activeOpacity={0.85}>
              <LinearGradient colors={gradients.success} style={styles.btnGrad}>
                <Text style={styles.btnText}>Start My Detox · ابدأ الديتوكس 🌿</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 70 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 40, alignSelf: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: colors.sky, width: 24 },
  step: { flex: 1 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: '700', color: colors.white, marginBottom: 4 },
  titleAr: { fontSize: 20, color: colors.sky, marginBottom: 16, fontStyle: 'italic' },
  desc: { fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 22, marginBottom: 28 },
  descAr: { fontSize: 13, color: 'rgba(255,255,255,0.45)' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.3)',
    borderRadius: 14, padding: 18,
    color: colors.white, fontSize: 18,
    marginBottom: 32,
  },
  options: { flexDirection: 'row', gap: 12, marginBottom: 32, flexWrap: 'wrap' },
  optionCard: {
    flex: 1, minWidth: '22%',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
    borderRadius: 16, padding: 16, alignItems: 'center',
  },
  optionSelected: { borderColor: colors.sky, backgroundColor: 'rgba(79,163,224,0.2)' },
  optHours: { fontSize: 28, fontWeight: '700', color: colors.white },
  optLabel: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  optLabelAr: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  timeCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
    borderRadius: 16, padding: 18, marginBottom: 12,
  },
  timeSelected: { borderColor: colors.sky, backgroundColor: 'rgba(79,163,224,0.15)' },
  timeIcon: { fontSize: 28, marginRight: 16 },
  timeText: { flex: 1 },
  timeName: { fontSize: 16, color: colors.white, fontWeight: '500' },
  timeDesc: { fontSize: 12, color: colors.slateLight, marginTop: 2 },
  check: { fontSize: 18, color: colors.success, fontWeight: '700' },
  btn: { borderRadius: 50, overflow: 'hidden', shadowColor: colors.sky, shadowOpacity: 0.4, shadowRadius: 16, elevation: 6 },
  btnGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 50 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
