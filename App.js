import 'react-native-url-polyfill/auto';
import React, { useEffect, useRef, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainerRef } from '@react-navigation/native';

import { LanguageProvider } from './src/context/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';
import { AudioProvider } from './src/context/AudioContext';
import { SubscriptionProvider, useSubscription } from './src/context/SubscriptionContext';
import Navigation from './src/navigation';
import { colors } from './src/constants/colors';

SplashScreen.preventAutoHideAsync();

// Inner component so it can access SubscriptionContext
function AppContent() {
  const { isSubscribed } = useSubscription();
  const navRef = useRef(null);

  const handleSubscriptionRequired = () => {
    if (navRef.current) {
      navRef.current.navigate('Subscription');
    }
  };

  return (
    <AudioProvider isSubscribed={isSubscribed} onSubscriptionRequired={handleSubscriptionRequired}>
      <Navigation navRef={navRef} />
    </AudioProvider>
  );
}

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <LanguageProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AppContent />
          </SubscriptionProvider>
        </AuthProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
