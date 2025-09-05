import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DataProvider } from './src/contexts/DataContext';
import HomeScreen from './src/screens/HomeScreen';
import TimerScreen from './src/screens/TimerScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import MoodCheckScreen from './src/screens/MoodCheckScreen';
import { scheduleDailyMoodCheck, registerForPushNotifications } from './src/utils/notifications';
import { SettingsProvider } from './src/contexts/SettingsContext';


// Create the tab navigator type
export type RootTabParamList = {
  Home: undefined;
  Timer: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [showMoodCheck, setShowMoodCheck] = useState(false);

  // Setup notifications
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Request notification permissions
        await registerForPushNotifications();
        
        // Schedule daily mood check
        await scheduleDailyMoodCheck();

        // Handle notifications when app is in foreground
        const subscription = Notifications.addNotificationReceivedListener(notification => {
          if (notification.request.content.data?.type === 'mood-check') {
            setShowMoodCheck(true);
          }
        });

        return () => subscription.remove();
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
  <DataProvider>
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Timer') {
              iconName = focused ? 'timer' : 'timer-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4361ee',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Timer" component={TimerScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  </DataProvider>
)};