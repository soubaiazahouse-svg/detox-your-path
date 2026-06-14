import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { legalContent } from '../constants/strings';
import { colors } from '../constants/colors';

export default function LegalScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, language, isRTL } = useLanguage();

  const type = route.params?.type || 'terms';
  const title = type === 'privacy' ? t.privacyTitle : t.termsTitle;
  const content = legalContent[language]?.[type] || legalContent.en[type];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={26}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, isRTL && { alignItems: 'flex-end' }]}
      >
        <View style={styles.contentCard}>
          <Text style={[styles.body, isRTL && styles.bodyRTL]}>
            {content}
          </Text>
        </View>

        <Text style={styles.footer}>{t.allRightsReserved}</Text>
        <Text style={styles.footerSub}>© AZA HOUSE COMPANY</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  contentCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'left',
  },
  bodyRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footer: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSub: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 2,
  },
});
