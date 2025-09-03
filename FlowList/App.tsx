import React, { useEffect } from 'react';
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

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create the tab navigator type
export type RootTabParamList = {
  Home: undefined;
  Timer: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// Create a simple placeholder screen for the tabs we haven't built yet
const PlaceholderScreen: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <p>{name} Screen - Coming Soon!</p>
    </div>
  );
};

export default function App() {
  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    requestPermissions();
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
  );
}