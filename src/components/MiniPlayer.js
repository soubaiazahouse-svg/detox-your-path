import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import TrackSymbol from './TrackSymbol';
import { colors, gradients } from '../constants/colors';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, isLoading, progress, togglePlayPause, handleNext } = useAudio();
  const { language, isRTL } = useLanguage();
  const navigation = useNavigation();

  if (!currentTrack) return null;

  const title = language === 'ar' ? currentTrack.titleAr : currentTrack.title;
  const progressWidth = `${(progress * 100).toFixed(1)}%`;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('FullPlayer')}
      activeOpacity={0.95}
    >
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <View style={[styles.content, isRTL && styles.rtl]}>
        {/* Track art */}
        <LinearGradient
          colors={currentTrack.trackColor || gradients.primary}
          style={styles.artContainer}
        >
          <TrackSymbol category={currentTrack.category} size={26} color="rgba(255,255,255,0.9)" />
        </LinearGradient>

        {/* Track info */}
        <View style={[styles.info, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            AZA HOUSE
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.controlBtn} />
          ) : (
            <TouchableOpacity onPress={togglePlayPause} style={styles.controlBtn}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleNext} style={styles.controlBtn}>
            <Ionicons name="play-skip-forward" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressBar: {
    height: 2,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  artContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    padding: 8,
  },
});
