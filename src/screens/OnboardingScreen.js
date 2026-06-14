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

const slides = [
  {
    id: '1',
    emoji: '🎵',
    titleKey: 'onboarding1Title',
    subtitleKey: 'onboarding1Subtitle',
    bgEmojis: ['🌊', '✨', '🎵', '🌙'],
    gradient: ['#1a0533', '#080a1a'],
  },
  {
    id: '2',
    emoji: '🎧',
    titleKey: 'onboarding2Title',
    subtitleKey: 'onboarding2Subtitle',
    bgEmojis: ['🎯', '💜', '🌸', '⚖️'],
    gradient: ['#1a0a1a', '#080a1a'],
  },
  {
    id: '3',
    emoji: '🌟',
    titleKey: 'onboarding3Title',
    subtitleKey: 'onboarding3Subtitle',
    bgEmojis: ['🕊️', '🌊', '✨', '🎨'],
    gradient: ['#0a1a1a', '#080a1a'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const { t, isRTL } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef(null);

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
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

  const renderSlide = ({ item }) => (
    <LinearGradient colors={item.gradient} style={styles.slide}>
      {/* Background emojis */}
      <View style={styles.bgEmojis}>
        {item.bgEmojis.map((e, i) => (
          <Text key={i} style={[styles.bgEmoji, { opacity: 0.08 + i * 0.02, fontSize: 80 + i * 20 }]}>
            {e}
          </Text>
        ))}
      </View>

      {/* Main emoji */}
      <View style={styles.emojiWrap}>
        <LinearGradient colors={gradients.primary} style={styles.emojiCircle}>
          <Text style={styles.mainEmoji}>{item.emoji}</Text>
        </LinearGradient>
      </View>

      {/* Text */}
      <View style={[styles.textContainer, isRTL && styles.rtlText]}>
        <Text style={[styles.brandName, isRTL && { textAlign: 'right' }]}>AZA HOUSE</Text>
        <Text style={[styles.title, isRTL && { textAlign: 'right' }]}>{t[item.titleKey]}</Text>
        <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>{t[item.subtitleKey]}</Text>
      </View>
    </LinearGradient>
  );

  const isLast = activeIndex === slides.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <FlatList
        ref={flatRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(idx);
        }}
        scrollEnabled={true}
      />

      {/* Footer */}
      <View style={[styles.footer, isRTL && styles.rtlRow]}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={[styles.buttons, isRTL && styles.rtlRow]}>
          {!isLast && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>{t.skip}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient colors={gradients.primary} style={styles.nextBtn}>
              <Text style={styles.nextText}>
                {isLast ? t.getStarted : t.next}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bgEmojis: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  bgEmoji: {
    position: 'absolute',
    top: Math.random() * height * 0.6,
    left: Math.random() * width * 0.8,
  },
  emojiWrap: {
    marginBottom: 48,
  },
  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainEmoji: {
    fontSize: 52,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rtlText: {
    alignItems: 'flex-end',
    width: '100%',
  },
  brandName: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  nextText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
