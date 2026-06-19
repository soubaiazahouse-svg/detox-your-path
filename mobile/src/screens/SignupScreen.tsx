import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { signUp } from '../lib/db';
import { colors, gradients } from '../theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Signup'> };

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('خطأ', 'أكملي جميع الحقول');
      return;
    }
    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, name.trim());
    setLoading(false);
    if (error) {
      Alert.alert('خطأ في التسجيل', error.message);
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>💧</Text>
        <Text style={styles.title}>ابدأي رحلتك</Text>
        <Text style={styles.sub}>Create your account · أنشئي حسابك</Text>

        <View style={styles.form}>
          <Text style={styles.label}>NAME · الاسم</Text>
          <TextInput
            style={styles.input}
            placeholder="اسمك"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>EMAIL · الإيميل</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>PASSWORD · كلمة المرور</Text>
          <TextInput
            style={styles.input}
            placeholder="6 أحرف على الأقل"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={gradients.success} style={styles.btnGrad}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>إنشاء الحساب · Sign Up 🌿</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchRow}>
            <Text style={styles.switchText}>
              عندك حساب؟ <Text style={styles.switchLink}>ادخلي هنا</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, padding: 28, paddingTop: 60 },
  back: { marginBottom: 32 },
  backText: { color: colors.slateLight, fontSize: 14 },
  logo: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 34, fontWeight: '700', color: colors.white, marginBottom: 4 },
  sub: { fontSize: 14, color: colors.slateLight, marginBottom: 40 },
  form: { flex: 1 },
  label: { fontSize: 11, color: colors.slateLight, letterSpacing: 2, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(79,163,224,0.25)',
    borderRadius: 14, padding: 16,
    color: colors.white, fontSize: 16, marginBottom: 20,
  },
  btn: { borderRadius: 50, overflow: 'hidden', marginTop: 8, elevation: 6 },
  btnGrad: { paddingVertical: 18, alignItems: 'center', borderRadius: 50 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  switchRow: { alignItems: 'center', marginTop: 24 },
  switchText: { color: colors.slateLight, fontSize: 14 },
  switchLink: { color: colors.sky, fontWeight: '600' },
});
