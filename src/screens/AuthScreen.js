import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signIn, signUp } from '../services/supabase';
import { supabase } from '../services/supabase';
import { useLanguage } from '../context/LanguageContext';
import { colors, gradients } from '../constants/colors';

// ─── Email Confirmation Screen ────────────────────────────────────────────────
function ConfirmEmailScreen({ email, onBack, language }) {
  const [resending, setResending] = useState(false);
  const isAr = language === 'ar';

  const resendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          isAr ? 'تم الإرسال' : 'Sent!',
          isAr ? 'تم إرسال رابط تأكيد جديد لبريدك.' : 'A new confirmation link was sent to your email.'
        );
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.confirmContainer}>
      <LinearGradient colors={gradients.dark} style={StyleSheet.absoluteFill} />

      <View style={styles.confirmIcon}>
        <LinearGradient colors={gradients.primary} style={styles.confirmCircle}>
          <Text style={{ fontSize: 48 }}>📧</Text>
        </LinearGradient>
      </View>

      <Text style={[styles.confirmTitle, isAr && { textAlign: 'right' }]}>
        {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
      </Text>

      <Text style={[styles.confirmSubtitle, isAr && { textAlign: 'right' }]}>
        {isAr
          ? `أرسلنا رابط تأكيد إلى:\n${email}\n\nافتح الرابط ثم ارجع للتطبيق وسجّل الدخول.`
          : `We sent a confirmation link to:\n${email}\n\nOpen the link then come back and login.`}
      </Text>

      <View style={styles.confirmSteps}>
        {[
          isAr ? '١. افتح بريدك الإلكتروني' : '1. Open your email inbox',
          isAr ? '٢. ابحث عن إيميل من AZA HOUSE' : '2. Find email from AZA HOUSE',
          isAr ? '٣. اضغط رابط التأكيد' : '3. Click the confirmation link',
          isAr ? '٤. ارجع هنا وسجّل الدخول' : '4. Come back here and login',
        ].map((step, i) => (
          <View key={i} style={[styles.stepRow, isAr && styles.rtlRow]}>
            <View style={styles.stepDot} />
            <Text style={[styles.stepText, isAr && { textAlign: 'right' }]}>{step}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={resendEmail} disabled={resending} style={styles.resendBtn}>
        {resending ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={styles.resendText}>
            {isAr ? 'إعادة إرسال الرابط' : 'Resend confirmation link'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onBack} style={styles.backToLogin}>
        <LinearGradient colors={gradients.primary} style={styles.backToLoginInner}>
          <Text style={styles.backToLoginText}>
            {isAr ? 'تسجيل الدخول' : 'Go to Login'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Auth Screen ─────────────────────────────────────────────────────────
export default function AuthScreen() {
  const { t, isRTL, language } = useLanguage();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState(null);

  // Show email confirmation screen after signup
  if (pendingConfirmEmail) {
    return (
      <ConfirmEmailScreen
        email={pendingConfirmEmail}
        language={language}
        onBack={() => {
          setPendingConfirmEmail(null);
          setMode('login');
          setPassword('');
        }}
      />
    );
  }

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = t.emailRequired;
    if (!password) errs.password = t.passwordRequired;
    if (password && password.length < 6) errs.password = t.passwordMinLength;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn({ email: email.trim(), password });
        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('email not confirmed')) {
            // Show confirmation screen instead of error
            setPendingConfirmEmail(email.trim());
          } else if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
            Alert.alert('Error', t.loginError);
          } else {
            Alert.alert('Error', error.message || t.loginError);
          }
        }
        // If no error, AuthContext picks up the session automatically
      } else {
        const { data, error } = await signUp({ email: email.trim(), password, fullName });
        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('already registered') || msg.includes('already been registered')) {
            Alert.alert(
              language === 'ar' ? 'حساب موجود' : 'Account Exists',
              language === 'ar'
                ? 'هذا الإيميل مسجّل بالفعل. جرّب تسجيل الدخول.'
                : 'This email is already registered. Try logging in.',
              [{ text: 'OK', onPress: () => { setMode('login'); setErrors({}); } }]
            );
          } else {
            Alert.alert('Error', error.message || t.signupError);
          }
        } else if (data?.user && !data.user.confirmed_at) {
          // Email confirmation required — show confirm screen
          setPendingConfirmEmail(email.trim());
        }
        // If confirmed_at exists, user is auto-confirmed → AuthContext handles login
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => [
    styles.input,
    isRTL && styles.inputRTL,
    errors[field] && styles.inputError,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <LinearGradient colors={gradients.dark} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <LinearGradient colors={gradients.primary} style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🎵</Text>
          </LinearGradient>
          <Text style={styles.appName}>AZA</Text>
          <Text style={styles.tagline}>{t.appTagline}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Mode Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => { setMode('login'); setErrors({}); }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                {t.login}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => { setMode('signup'); setErrors({}); }}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                {t.signup}
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <View style={styles.fieldWrap}>
              <TextInput
                style={inputStyle('fullName')}
                placeholder={t.fullName}
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                textAlign={isRTL ? 'right' : 'left'}
              />
            </View>
          )}

          <View style={styles.fieldWrap}>
            <TextInput
              style={inputStyle('email')}
              placeholder={t.email}
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: null })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign={isRTL ? 'right' : 'left'}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.fieldWrap}>
            <View style={[styles.passwordRow, isRTL && styles.rtlRow]}>
              <TextInput
                style={[inputStyle('password'), { flex: 1 }]}
                placeholder={t.password}
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
                secureTextEntry={!showPassword}
                textAlign={isRTL ? 'right' : 'left'}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitWrap}>
            <LinearGradient colors={gradients.primary} style={styles.submitBtn}>
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? t.login : t.signup}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={[styles.switchRow, isRTL && styles.rtlRow]}>
            <Text style={styles.switchLabel}>
              {mode === 'login' ? t.noAccount : t.haveAccount}
            </Text>
            <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}>
              <Text style={styles.switchLink}>
                {mode === 'login' ? t.signup : t.login}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>© AZA HOUSE COMPANY</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoEmoji: { fontSize: 40 },
  appName: { color: colors.text, fontSize: 36, fontWeight: '900', letterSpacing: 8 },
  tagline: { color: colors.accent, fontSize: 13, letterSpacing: 3, marginTop: 4, textTransform: 'uppercase' },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border },
  tabs: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: colors.text },
  fieldWrap: { marginBottom: 16 },
  input: { backgroundColor: colors.surfaceLight, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border },
  inputRTL: { textAlign: 'right' },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLight, borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingRight: 12 },
  rtlRow: { flexDirection: 'row-reverse' },
  eyeBtn: { padding: 8 },
  submitWrap: { marginTop: 8, marginBottom: 20 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  switchLabel: { color: colors.textMuted, fontSize: 13 },
  switchLink: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  footer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 32 },

  // Confirm email screen
  confirmContainer: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 28 },
  confirmIcon: { marginBottom: 32 },
  confirmCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  confirmTitle: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  confirmSubtitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  confirmSteps: { width: '100%', backgroundColor: colors.surface, borderRadius: 16, padding: 20, gap: 12, marginBottom: 24, borderWidth: 1, borderColor: colors.border },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  stepText: { color: colors.text, fontSize: 14 },
  resendBtn: { paddingVertical: 14, paddingHorizontal: 24, marginBottom: 16 },
  resendText: { color: colors.primary, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  backToLogin: { borderRadius: 14, overflow: 'hidden', width: '100%' },
  backToLoginInner: { paddingVertical: 16, alignItems: 'center' },
  backToLoginText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
