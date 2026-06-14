import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../context/LanguageContext';
import { colors, gradients } from '../constants/colors';

const FEATURES = [
  { icon: 'musical-notes', key: 'feature1' },
  { icon: 'musical-note', key: 'feature2' },
  { icon: 'cloud-download', key: 'feature3' },
  { icon: 'add-circle', key: 'feature4' },
  { icon: 'headset', key: 'feature5' },
];

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { t, isRTL } = useLanguage();
  const [plan, setPlan] = useState('annual');

  const handleSubscribe = () => {
    Alert.alert(
      t.subscribe,
      `You selected the ${plan === 'monthly' ? t.monthlyPrice : t.annualPrice} plan with a ${t.freeTrial}.`,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.subscribe,
          onPress: () => {
            Alert.alert('Coming Soon', 'In-app purchases will be available soon!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <LinearGradient colors={['#1a0a2e', colors.background]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, isRTL && styles.rtlRow]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Crown */}
        <View style={styles.crownSection}>
          <LinearGradient colors={gradients.gold} style={styles.crownCircle}>
            <Text style={styles.crownEmoji}>👑</Text>
          </LinearGradient>
          <Text style={styles.trialBadge}>{t.freeTrial}</Text>
        </View>

        <Text style={[styles.title, isRTL && { textAlign: 'right' }]}>{t.subscribeTitle}</Text>
        <Text style={[styles.subtitle, isRTL && { textAlign: 'right' }]}>{t.subscribeSubtitle}</Text>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.key} style={[styles.featureRow, isRTL && styles.rtlRow]}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={16} color={colors.accent} />
              </View>
              <Text style={styles.featureText}>{t[f.key]}</Text>
            </View>
          ))}
        </View>

        {/* Plan selector */}
        <View style={styles.plans}>
          {/* Annual */}
          <TouchableOpacity
            style={[styles.planCard, plan === 'annual' && styles.planCardActive]}
            onPress={() => setPlan('annual')}
          >
            <LinearGradient
              colors={plan === 'annual' ? gradients.primary : ['transparent', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View style={[styles.planHeader, isRTL && styles.rtlRow]}>
              <View style={styles.planCheck}>
                {plan === 'annual' && <Ionicons name="checkmark" size={14} color={colors.text} />}
              </View>
              <View style={[styles.planInfo, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.planName}>{t.annual}</Text>
                <Text style={styles.planPrice}>{t.annualPrice}</Text>
                <Text style={styles.planSub}>$9.25/month · {t.save20}</Text>
              </View>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>{t.save20}</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Monthly */}
          <TouchableOpacity
            style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
            onPress={() => setPlan('monthly')}
          >
            <View style={[styles.planHeader, isRTL && styles.rtlRow]}>
              <View style={[styles.planCheck, plan === 'monthly' && styles.planCheckActive]}>
                {plan === 'monthly' && <Ionicons name="checkmark" size={14} color={colors.text} />}
              </View>
              <View style={[styles.planInfo, isRTL && { alignItems: 'flex-end' }]}>
                <Text style={styles.planName}>{t.monthly}</Text>
                <Text style={styles.planPrice}>{t.monthlyPrice}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity onPress={handleSubscribe} style={styles.ctaWrap}>
          <LinearGradient colors={gradients.gold} style={styles.ctaBtn}>
            <Text style={styles.ctaText}>{t.subscribe}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.cancelNote}>{t.cancelAnytime}</Text>

        <TouchableOpacity style={styles.restoreBtn}>
          <Text style={styles.restoreText}>{t.restorePurchase}</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© AZA HOUSE COMPANY — {t.allRightsReserved}</Text>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    padding: 8,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  crownSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  crownCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  crownEmoji: {
    fontSize: 40,
  },
  trialBadge: {
    backgroundColor: `${colors.accent}22`,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  features: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 32,
    height: 32,
    backgroundColor: `${colors.accent}22`,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  plans: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  planCardActive: {
    borderColor: colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  planCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  planPrice: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  planSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  saveBadge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  saveBadgeText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '800',
  },
  ctaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  ctaBtn: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
  },
  cancelNote: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 24,
  },
  restoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
