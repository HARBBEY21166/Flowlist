import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DataProvider } from './src/contexts/DataContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import HomeScreen from './src/screens/HomeScreen';
import TimerScreen from './src/screens/TimerScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { getColors } from './src/constants/Colors';

const Tab = createBottomTabNavigator();

// Create custom themes instead of using React Navigation's built-in themes
const LightTheme = {
  dark: false,
  colors: {
    primary: '#4361ee',
    background: '#f8f9fa',
    card: '#ffffff',
    text: '#212529',
    border: '#dee2e6',
    notification: '#ff3b30',
  },
};

const DarkTheme = {
  dark: true,
  colors: {
    primary: '#4cc9f0',
    background: '#121212',
    card: '#1e1e1e',
    text: '#e9ecef',
    border: '#343a40',
    notification: '#ff453a',
  },
};

function TabNavigator() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.cardBackground,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        headerTintColor: colors.primary,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'My Tasks' }}
      />
      <Tab.Screen 
        name="Timer" 
        component={TimerScreen}
        options={{ title: 'Focus Timer' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </DataProvider>
    </ThemeProvider>
  );
}