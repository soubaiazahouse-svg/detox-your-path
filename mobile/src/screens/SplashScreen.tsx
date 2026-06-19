import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getSession } from '../lib/db';
import { colors, gradients } from '../theme';

const { width } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'> };

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleStart = async () => {
    navigation.navigate('Signup');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      <Animated.View style={[styles.glow, { transform: [{ scale: pulseAnim }] }]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>💧</Text>
        </View>

        <Text style={styles.company}>AZA HOUSE COMPANY</Text>
        <Text style={styles.title}>DETOX</Text>
        <Text style={styles.titleSub}>your Path</Text>
        <Text style={styles.badge}>Digital Wellness · Since 2024</Text>

        <Text style={styles.tagline}>
          Reclaim your time.{'\n'}
          <Text style={styles.taglineAr}>استعد حياتك.</Text>
        </Text>

        <TouchableOpacity style={styles.btn} onPress={handleStart} activeOpacity={0.85}>
          <LinearGradient colors={gradients.sky} style={styles.btnGrad}>
            <Text style={styles.btnText}>Get Started — ابدأي الآن</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.btnSecondaryText}>لدي حساب · I have an account</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute', width: width * 1.4, height: width * 1.4,
    borderRadius: width * 0.7,
    backgroundColor: 'rgba(79,163,224,0.07)',
    top: -width * 0.4,
  },
  content: { alignItems: 'center', paddingHorizontal: 32 },
  logoWrap: {
    width: 88, height: 88, borderRadius: 26,
    backgroundColor: 'rgba(79,163,224,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.3)',
  },
  logoIcon: { fontSize: 42 },
  company: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginBottom: 8 },
  title: { fontSize: 64, fontWeight: '700', color: colors.white, letterSpacing: 4, lineHeight: 68 },
  titleSub: { fontSize: 32, fontStyle: 'italic', color: colors.sky, marginBottom: 8 },
  badge: { fontSize: 11, color: colors.slateLight, letterSpacing: 2, marginBottom: 40 },
  tagline: { fontSize: 18, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 28, marginBottom: 52 },
  taglineAr: { fontSize: 15, color: 'rgba(255,255,255,0.45)' },
  btn: { width: '100%', borderRadius: 50, overflow: 'hidden', shadowColor: colors.sky, shadowOpacity: 0.5, shadowRadius: 20, elevation: 8, marginBottom: 12 },
  btnSecondary: { width: '100%', borderRadius: 50, borderWidth: 1.5, borderColor: 'rgba(79,163,224,0.4)', paddingVertical: 16, alignItems: 'center' },
  btnSecondaryText: { color: colors.skyLight, fontSize: 15 },
  btnGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 50 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
});
