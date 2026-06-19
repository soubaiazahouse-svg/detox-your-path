import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, gradients, shadows, radius } from '../theme';

const { width } = Dimensions.get('window');

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'> };

export default function SplashScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 2500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      {/* Background circles */}
      <Animated.View style={[styles.bgCircle, styles.bgCircle1, { transform: [{ scale: pulseAnim }] }]} />
      <View style={[styles.bgCircle, styles.bgCircle2]} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <View style={styles.logoInner} />
        </View>

        <Text style={styles.appName}>Detox Your Path</Text>
        <Text style={styles.taglineEn}>Take back your time</Text>
        <Text style={styles.taglineAr}>استرجعي وقتك</Text>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Signup')}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Sign In · لدي حساب</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bgCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  bgCircle1: {
    width: width * 1.1,
    height: width * 1.1,
    top: -width * 0.3,
    left: -width * 0.05,
  },
  bgCircle2: {
    width: width * 0.7,
    height: width * 0.7,
    bottom: -width * 0.15,
    right: -width * 0.15,
    backgroundColor: 'rgba(76,126,243,0.08)',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: 'rgba(76,126,243,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(76,126,243,0.4)',
  },
  logoInner: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.blue,
    transform: [{ rotate: '45deg' }],
  },
  appName: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  taglineEn: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 4,
    textAlign: 'center',
  },
  taglineAr: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
  divider: {
    width: 40,
    height: 1.5,
    backgroundColor: 'rgba(76,126,243,0.5)',
    borderRadius: 1,
    marginVertical: 40,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: colors.blue,
    borderRadius: radius.full,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 12,
    ...shadows.md,
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    width: '100%',
    borderRadius: radius.full,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  secondaryBtnText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '500',
  },
});
