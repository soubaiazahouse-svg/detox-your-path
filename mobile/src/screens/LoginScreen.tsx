import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { signIn } from '../lib/db';
import { colors, gradients } from '../theme';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('خطأ', 'أدخلي الإيميل وكلمة المرور');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    if (error) {
      Alert.alert('خطأ في الدخول', error.message);
    } else {
      navigation.replace('ScreenTimePermission');
    }
  };

  return (
    <LinearGradient colors={gradients.navy} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← رجوع</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>💧</Text>
        <Text style={styles.title}>مرحباً بعودتك</Text>
        <Text style={styles.sub}>Welcome back · Continue your journey</Text>

        <View style={styles.form}>
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
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            <LinearGradient colors={gradients.sky} style={styles.btnGrad}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>دخول · Log In</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.switchRow}>
            <Text style={styles.switchText}>
              ما عندك حساب؟ <Text style={styles.switchLink}>سجّلي الآن</Text>
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
