import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { AudioProvider } from './src/context/AudioContext';
import Navigation from './src/navigation';
import { colors } from './src/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <LanguageProvider>
        <AuthProvider>
          <AudioProvider>
            <Navigation />
          </AudioProvider>
        </AuthProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
