import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import { colors, gradients } from '../constants/colors';

const { width, height } = Dimensions.get('window');
const ONBOARDING_DONE_KEY = '@aza_onboarding_done';

// Geometric art components — no emojis

function ArtWaves() {
  return (
    <View style={art.wrap}>
      {/* Outer rings */}
      {[140, 108, 76].map((d, i) => (
        <View key={i} style={[art.ring, { width: d, height: d, borderRadius: d / 2, borderColor: `rgba(255,255,255,${0.08 + i * 0.07})` }]} />
      ))}
      {/* Wave bars inside */}
      <View style={art.bars}>
        {[28, 48, 22, 42, 32, 50, 26, 38, 28].map((h, i) => (
          <View key={i} style={[art.bar, { height: h, opacity: 0.5 + (i % 3) * 0.17 }]} />
        ))}
      </View>
    </View>
  );
}

function ArtFrequency() {
  return (
    <View style={art.wrap}>
      {/* Star rays */}
      {[0, 30, 60, 90, 120, 150].map((deg) => (
        <View key={deg} style={[art.ray, { transform: [{ rotate: `${deg}deg` }] }]} />
      ))}
      {/* Concentric rings */}
      {[130, 92, 58].map((d, i) => (
        <View key={i} style={[art.ring, { width: d, height: d, borderRadius: d / 2, borderColor: `rgba(255,255,255,${0.06 + i * 0.09})` }]} />
      ))}
      {/* Center dot */}
      <View style={art.centerDot} />
    </View>
  );
}

function ArtSacred() {
  return (
    <View style={art.wrap}>
      {/* Nested diamonds */}
      {[120, 88, 56, 24].map((s, i) => (
        <View key={i} style={[art.diamond, {
          width: s,
          height: s,
          borderColor: `rgba(255,255,255,${0.1 + i * 0.18})`,
          borderWidth: i === 0 ? 1 : 1.5,
          transform: [{ rotate: `${i * 15}deg` }],
        }]} />
      ))}
      {/* Horizontal & vertical lines */}
      <View style={[art.axisLine, { width: 100 }]} />
      <View style={[art.axisLine, { height: 100, width: 1.5 }]} />
    </View>
  );
}

const SLIDES = [
  {
    id: '1',
    Art: ArtWaves,
    titleKey: 'onboarding1Title',
    subtitleKey: 'onboarding1Subtitle',
    gradient: ['#0d0a2e', '#080a1a'],
    accentColor: '#a78bfa',
  },
  {
    id: '2',
    Art: ArtFrequency,
    titleKey: 'onboarding2Title',
    subtitleKey: 'onboarding2Subtitle',
    gradient: ['#0a1520', '#080a1a'],
    accentColor: '#38bdf8',
  },
  {
    id: '3',
    Art: ArtSacred,
    titleKey: 'onboarding3Title',
    subtitleKey: 'onboarding3Subtitle',
    gradient: ['#0f1a10', '#080a1a'],
    accentColor: '#34d399',
  },
];

export default function OnboardingScreen({ navigation }) {
  const { t, isRTL } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => finishOnboarding();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');
    navigation.replace('Auth');
  };

  const renderSlide = ({ item }) => {
    const { Art, gradient, accentColor } = item;
    return (
      <LinearGradient colors={gradient} style={styles.slide}>
        {/* Decorative background rings */}
        <View style={styles.bgDecor}>
          {[300, 220, 140].map((d, i) => (
            <View key={i} style={[styles.bgRing, {
              width: d, height: d, borderRadius: d / 2,
              borderColor: `rgba(255,255,255,${0.03 + i * 0.02})`,
            }]} />
          ))}
        </View>

        {/* Geometric art */}
        <View style={styles.artContainer}>
          <LinearGradient
            colors={[`${accentColor}22`, `${accentColor}08`]}
            style={styles.artGlow}
          >
            <Art />
          </LinearGradient>
        </View>

        {/* Text */}
        <View style={[styles.textContainer, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={[styles.brandLabel, { color: accentColor }]}>AZA HOUSE</Text>
          <Text style={[styles.title, isRTL && { textAlign: 'right' }]}>{t[item.titleKey]}</Text>
          <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>{t[item.subtitleKey]}</Text>
        </View>
      </LinearGradient>
    );
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const accent = SLIDES[activeIndex].accentColor;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
      />

      {/* Footer */}
      <View style={[styles.footer, isRTL && styles.rtlRow]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && [styles.dotActive, { backgroundColor: accent }],
              ]}
            />
          ))}
        </View>

        <View style={[styles.buttons, isRTL && styles.rtlRow]}>
          {!isLast && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t.skip}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient colors={gradients.primary} style={styles.nextBtn}>
              <Text style={styles.nextText}>{isLast ? t.getStarted : t.next}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Shared art styles
const art = StyleSheet.create({
  wrap: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bar: {
    width: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  ray: {
    position: 'absolute',
    width: 110,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  diamond: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  axisLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  bgDecor: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgRing: {
    position: 'absolute',
    borderWidth: 1,
  },

  artContainer: {
    marginBottom: 52,
  },
  artGlow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 5,
    marginBottom: 18,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
  },

  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rtlRow: { flexDirection: 'row-reverse' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
  },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skipBtn: { paddingHorizontal: 16, paddingVertical: 12 },
  skipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  nextBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  nextText: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
