import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notifications with proper TypeScript types
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  } as Notifications.NotificationBehavior),
});

// Request permissions
export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

// Schedule daily mood check-in
export const scheduleDailyMoodCheck = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Schedule for 8 PM daily with proper trigger type
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'How was your day?',
      body: 'Track your overall mood and reflect on your productivity',
      sound: true,
      data: { type: 'mood-check' },
    },
    trigger: {
      type: 'daily',
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    } as Notifications.DailyTriggerInput,
  });
};

// Send immediate notification
export const sendMoodNotification = async (): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Mood Check-in',
      body: 'How are you feeling right now?',
      sound: true,
      data: { type: 'instant-mood' },
    },
    trigger: null,
  });
};

// Check if notifications are enabled
export const checkNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

// Request notification permissions explicitly
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};