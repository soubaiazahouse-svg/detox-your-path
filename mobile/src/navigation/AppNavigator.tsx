import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PauseScreen from '../screens/PauseScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { RootStackParamList, TabParamList } from '../types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Text style={tabStyles.icon}>{icon}</Text>
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabStyles.bar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Pause"
        component={PauseScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⏸" label="Pause" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Challenges"
        component={ChallengesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="🎯" label="Challenges" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Analytics" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: colors.navy,
    borderTopColor: 'rgba(79,163,224,0.15)',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 8,
  },
  iconWrap: { alignItems: 'center', paddingTop: 8, paddingHorizontal: 4 },
  iconWrapActive: {},
  icon: { fontSize: 22 },
  label: { fontSize: 9, color: colors.slateLight, marginTop: 3, letterSpacing: 0.5 },
  labelActive: { color: colors.sky },
});
