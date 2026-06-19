import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { colors, gradients } from '../theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ScreenTimePermission'> };

export default function ScreenTimePermissionScreen({ navigation }: Props) {
  const [granted, setGranted] = useState(false);

  const openUsageSettings = async () => {
    if (Platform.OS === 'android') {
      try {
        // Open Android Usage Access settings
        await Linking.openSettings();
        // After returning from settings, assume granted
        setGranted(true);
      } catch {
        Alert.alert('تعذّر فتح الإعدادات', 'افتحي الإعدادات يدوياً → الخصوصية → الوصول إلى الاستخدام');
      }
    } else {
      // iOS — explain limitation
      Alert.alert(
        'iOS غير مدعوم',
        'نظام iOS لا يسمح بقراءة وقت الاستخدام للتطبيقات الخارجية.\n\nستعملين التطبيق بالتسجيل اليدوي.',
        [{ text: 'فهمت', onPress: () => continueToApp() }]
      );
    }
  };

  const continueToApp = () => {
    navigation.replace('Main');
  };

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.icon}>📱</Text>
        <Text style={styles.title}>إذن وقت الشاشة</Text>
        <Text style={styles.titleEn}>Screen Time Access</Text>

        <Text style={styles.desc}>
          لكي يتتبع التطبيق وقت استخدامك الفعلي، نحتاج إذناً خاصاً من إعدادات جهازك.
        </Text>

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>كيف تفعّلين الإذن — Android</Text>
          {[
            '١. اضغطي "السماح" أدناه',
            '٢. ستنفتح إعدادات "الوصول إلى الاستخدام"',
            '٣. ابحثي عن Detox Your Path',
            '٤. فعّلي المفتاح',
            '٥. عودي للتطبيق',
          ].map((step, i) => (
            <Text key={i} style={styles.step}>{step}</Text>
          ))}
        </View>

        {Platform.OS === 'ios' && (
          <View style={styles.iosCard}>
            <Text style={styles.iosIcon}>ℹ️</Text>
            <Text style={styles.iosText}>
              iOS لا يسمح بقراءة وقت الشاشة للتطبيقات الخارجية.{'\n'}
              ستعمل الخاصية بالتسجيل اليدوي فقط.
            </Text>
          </View>
        )}

        {granted && (
          <View style={styles.grantedBadge}>
            <Text style={styles.grantedText}>✓ تم منح الإذن — Permission Granted</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={granted ? continueToApp : openUsageSettings}
          activeOpacity={0.85}
        >
          <LinearGradient colors={gradients.blue} style={styles.btnGrad}>
            <Text style={styles.btnText}>
              {granted ? 'ادخلي التطبيق ←' : 'السماح بالوصول — Allow Access'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={continueToApp} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={styles.skipText}>تخطي الآن · Skip for now</Text>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 28, paddingTop: 70, alignItems: 'center' },
  icon: { fontSize: 72, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '700', color: colors.white, textAlign: 'center' },
  titleEn: { fontSize: 16, color: colors.blue, marginBottom: 20, fontStyle: 'italic' },
  desc: {
    fontSize: 15, color: 'rgba(255,255,255,0.7)',
    textAlign: 'right', lineHeight: 24, marginBottom: 32,
  },
  stepsCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 18, padding: 20, width: '100%', marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.2)',
  },
  stepsTitle: { fontSize: 14, color: colors.blue, fontWeight: '600', marginBottom: 12, textAlign: 'right' },
  step: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8, textAlign: 'right', lineHeight: 20 },
  iosCard: {
    flexDirection: 'row', gap: 12, backgroundColor: 'rgba(200,168,75,0.1)',
    borderRadius: 16, padding: 16, width: '100%', marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(200,168,75,0.3)',
  },
  iosIcon: { fontSize: 20 },
  iosText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 20, textAlign: 'right' },
  grantedBadge: {
    backgroundColor: 'rgba(46,189,143,0.15)',
    borderRadius: 12, padding: 12, width: '100%', marginBottom: 16,
    borderWidth: 1, borderColor: colors.success,
  },
  grantedText: { color: colors.success, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  btn: { width: '100%', borderRadius: 50, overflow: 'hidden', elevation: 6, marginTop: 8 },
  btnGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 50 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  skipBtn: { marginTop: 20, padding: 12 },
  skipText: { color: colors.textMuted, fontSize: 14 },
});
