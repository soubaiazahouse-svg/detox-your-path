import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { signOut } from '../services/supabase';
import { colors } from '../constants/colors';
import { APP_VERSION, SUPPORT_EMAIL } from '../constants/config';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { t, language, switchLanguage, isRTL } = useLanguage();
  const { user } = useAuth();
  const { stopAudio } = useAudio();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(t.logout, t.logoutConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.logout,
        style: 'destructive',
        onPress: async () => {
          await stopAudio();
          await signOut();
        },
      },
    ]);
  };

  const handleLanguage = (lang) => {
    Alert.alert(
      lang === 'ar' ? 'تغيير اللغة' : 'Change Language',
      lang === 'ar'
        ? 'سيتطلب تغيير اللغة إعادة تشغيل التطبيق لتطبيق اتجاه RTL.'
        : 'Changing to Arabic will restart the app to apply RTL layout.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.confirm,
          onPress: () => switchLanguage(lang),
        },
      ]
    );
  };

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';
  const initial = userName[0]?.toUpperCase() || 'U';

  const SettingRow = ({ icon, label, onPress, right, danger }) => (
    <TouchableOpacity
      style={[styles.row, isRTL && styles.rtlRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon} size={18} color={danger ? colors.error : colors.textSecondary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger, isRTL && { flex: 1, textAlign: 'right' }]}>
        {label}
      </Text>
      {right || (
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={16}
          color={colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, isRTL && { alignItems: 'flex-end' }]}>
          <Text style={styles.title}>{t.settings}</Text>
        </View>

        {/* Profile card */}
        <View style={[styles.profileCard, isRTL && styles.rtlRow]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={[styles.profileInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
          </View>
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => navigation.navigate('Subscription')}
          >
            <Ionicons name="star" size={12} color={colors.accent} />
            <Text style={styles.upgradeText}> Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, isRTL && { textAlign: 'right' }]}>{t.account}</Text>
        <View style={styles.section}>
          <SettingRow
            icon="person-outline"
            label={t.account}
            onPress={() => navigation.navigate('Subscription')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="star-outline"
            label={t.subscription}
            onPress={() => navigation.navigate('Subscription')}
          />
        </View>

        {/* Language */}
        <Text style={[styles.sectionLabel, isRTL && { textAlign: 'right' }]}>{t.language}</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.row, language === 'en' && styles.rowActive, isRTL && styles.rtlRow]}
            onPress={() => handleLanguage('en')}
          >
            <View style={[styles.langDot, { backgroundColor: '#3b5998' }]}>
              <Text style={styles.langCode}>EN</Text>
            </View>
            <Text style={[styles.rowLabel, { flex: 1 }, isRTL && { textAlign: 'right' }]}>
              {t.english}
            </Text>
            {language === 'en' && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.row, language === 'ar' && styles.rowActive, isRTL && styles.rtlRow]}
            onPress={() => handleLanguage('ar')}
          >
            <View style={[styles.langDot, { backgroundColor: '#1a7a3c' }]}>
              <Text style={styles.langCode}>ع</Text>
            </View>
            <Text style={[styles.rowLabel, { flex: 1 }, isRTL && { textAlign: 'right' }]}>
              {t.arabic}
            </Text>
            {language === 'ar' && (
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, isRTL && { textAlign: 'right' }]}>Preferences</Text>
        <View style={styles.section}>
          <View style={[styles.row, isRTL && styles.rtlRow]}>
            <View style={styles.rowIcon}>
              <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            </View>
            <Text style={[styles.rowLabel, { flex: 1 }, isRTL && { textAlign: 'right' }]}>
              {t.notifications}
            </Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>

        {/* Legal */}
        <Text style={[styles.sectionLabel, isRTL && { textAlign: 'right' }]}>Legal</Text>
        <View style={styles.section}>
          <SettingRow
            icon="document-text-outline"
            label={t.terms}
            onPress={() => navigation.navigate('Legal', { type: 'terms' })}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield-outline"
            label={t.privacy}
            onPress={() => navigation.navigate('Legal', { type: 'privacy' })}
          />
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginBottom: 8 }]}>
          <SettingRow
            icon="log-out-outline"
            label={t.logout}
            onPress={handleLogout}
            danger
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>
          {t.version} {APP_VERSION} · © AZA HOUSE COMPANY
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.accent}22`,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upgradeText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
  },
  rowActive: {
    backgroundColor: `${colors.primary}11`,
  },
  rowIcon: {
    width: 32,
    height: 32,
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowIconDanger: {
    backgroundColor: `${colors.error}22`,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  rowLabelDanger: {
    color: colors.error,
  },
  langDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langCode: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 64,
  },
  version: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
