import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScreenTimePermissionScreen from '../screens/ScreenTimePermissionScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PauseScreen from '../screens/PauseScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { RootStackParamList, TabParamList } from '../types';
import { colors, shadows } from '../theme';
import { supabase } from '../lib/supabase';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> = {
  Dashboard: { active: 'home', inactive: 'home-outline' },
  Pause: { active: 'pause-circle', inactive: 'pause-circle-outline' },
  Challenges: { active: 'checkbox', inactive: 'checkbox-outline' },
  Analytics: { active: 'bar-chart', inactive: 'bar-chart-outline' },
  Settings: { active: 'person-circle', inactive: 'person-circle-outline' },
};

function PauseTabButton({ children, onPress, accessibilityState }: BottomTabBarButtonProps) {
  const focused = accessibilityState?.selected;
  return (
    <TouchableOpacity
      style={tabStyles.pauseButtonWrap}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[tabStyles.pauseButton, focused && tabStyles.pauseButtonActive]}>
        <Ionicons
          name={focused ? 'pause-circle' : 'pause-circle-outline'}
          size={30}
          color={colors.white}
        />
      </View>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: tabStyles.bar,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={24}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Challenges" component={ChallengesScreen} />
      <Tab.Screen
        name="Pause"
        component={PauseScreen}
        options={{
          tabBarButton: (props) => <PauseTabButton {...props} />,
        }}
      />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setInitialRoute(data.session ? 'Main' : 'Splash');
    })();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.blue} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ScreenTimePermission" component={ScreenTimePermissionScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 82,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 8,
    ...shadows.sm,
  },
  pauseButtonWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -10,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  pauseButtonActive: {
    backgroundColor: colors.navy,
  },
});
