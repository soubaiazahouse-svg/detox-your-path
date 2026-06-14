import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import MiniPlayer from '../components/MiniPlayer';
import { TRACKS, CATEGORIES } from '../constants/tracks';
import { colors } from '../constants/colors';

export default function MusicScreen() {
  const { t, language, isRTL } = useLanguage();
  const { playTrack, currentTrack, isPlaying } = useAudio();
  const navigation = useNavigation();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = useMemo(() => {
    return TRACKS.filter((track) => {
      const title = language === 'ar' ? track.titleAr : track.title;
      const desc = language === 'ar' ? track.descriptionAr : track.description;
      const matchesSearch =
        !search ||
        title.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase());
      const matchesCat = activeCategory === 'all' || track.category === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory, language]);

  const handlePlay = (track) => {
    playTrack(track, filtered.length > 0 ? filtered : TRACKS);
    navigation.navigate('FullPlayer');
  };

  const renderTrack = ({ item }) => {
    const isActive = currentTrack?.id === item.id;
    const title = language === 'ar' ? item.titleAr : item.title;
    const desc = language === 'ar' ? item.descriptionAr : item.description;

    return (
      <TouchableOpacity
        style={[styles.trackItem, isActive && styles.trackItemActive]}
        onPress={() => handlePlay(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.trackRow, isRTL && styles.rtlRow]}>
          <View style={[styles.emojiWrap, isActive && styles.emojiWrapActive]}>
            <Text style={styles.emoji}>{item.emoji}</Text>
          </View>
          <View style={[styles.trackInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.trackTitle, isActive && styles.trackTitleActive]}>
              {title}
            </Text>
            <Text style={styles.trackDesc} numberOfLines={1}>{desc}</Text>
            <View style={[styles.catBadge, isRTL && { alignSelf: 'flex-end' }]}>
              <Text style={styles.catText}>{item.category}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.playBtn, isActive && styles.playBtnActive]}
            onPress={() => handlePlay(item)}
          >
            <Ionicons
              name={isActive && isPlaying ? 'pause' : 'play'}
              size={18}
              color={isActive ? colors.text : colors.primary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={styles.screenTitle}>{t.music}</Text>
        <Text style={styles.trackCount}>{TRACKS.length} tracks</Text>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, isRTL && styles.rtlRow]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isRTL && { textAlign: 'right' }]}
          placeholder={t.search}
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.catChip,
              activeCategory === item.id && styles.catChipActive,
            ]}
            onPress={() => setActiveCategory(item.id)}
          >
            <Text
              style={[
                styles.catChipText,
                activeCategory === item.id && styles.catChipTextActive,
              ]}
            >
              {language === 'ar' ? item.labelAr : item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Track list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t.noTracksFound}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: currentTrack ? 80 : 24 }} />}
      />

      <MiniPlayer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  trackCount: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 12,
  },
  categories: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  catChipTextActive: {
    color: colors.text,
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
  },
  trackItem: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackItemActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}11`,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  emojiWrap: {
    width: 52,
    height: 52,
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiWrapActive: {
    backgroundColor: `${colors.primary}33`,
  },
  emoji: {
    fontSize: 26,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  trackTitleActive: {
    color: colors.primaryLight,
  },
  trackDesc: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLight,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catText: {
    color: colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 15,
  },
});
