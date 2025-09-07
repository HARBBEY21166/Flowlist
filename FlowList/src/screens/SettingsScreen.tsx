import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { 
  checkNotificationPermissions, 
  requestNotificationPermissions,
  scheduleDailyMoodCheck,
  sendMoodNotification
} from '../utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';
import { saveData, loadData } from '../utils/storage';
import * as Notifications from 'expo-notifications';

// Add the missing function
const cancelScheduledNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

const SettingsScreen: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const colors = getColors(isDark);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const hasPermission = await checkNotificationPermissions();
      const savedDailyReminders = await loadData('dailyReminders');
      
      setNotificationsEnabled(hasPermission);
      // Only enable daily reminders if we have permission AND it was previously enabled
      setDailyReminders(hasPermission && (savedDailyReminders === true));
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      if (value) {
        const granted = await requestNotificationPermissions();
        setNotificationsEnabled(granted);
        
        if (granted) {
          // Only schedule notifications if daily reminders should be enabled
          if (dailyReminders) {
            await scheduleDailyMoodCheck();
          }
          Alert.alert('Success', 'Notifications enabled!');
        } else {
          Alert.alert('Permission Denied', 'Please enable notifications in your device settings');
        }
      } else {
        setNotificationsEnabled(false);
        await cancelScheduledNotifications();
        await saveData('dailyReminders', false);
        Alert.alert('Notifications disabled', 'You will no longer receive reminders');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleDailyRemindersToggle = async (value: boolean) => {
    try {
      setDailyReminders(value);
      await saveData('dailyReminders', value);
      
      if (value && notificationsEnabled) {
        await scheduleDailyMoodCheck();
        Alert.alert('Daily reminders enabled', 'You will receive daily mood check-ins at 8 PM');
      } else {
        await cancelScheduledNotifications();
        Alert.alert('Daily reminders disabled', 'You will no longer receive daily mood check-ins');
      }
    } catch (error) {
      console.error('Error toggling daily reminders:', error);
      Alert.alert('Error', 'Failed to update daily reminders');
    }
  };

  const testNotification = async () => {
    try {
      await sendMoodNotification();
      Alert.alert('Test Notification', 'A test notification has been sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification. Make sure notifications are enabled.');
    }
  };

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Settings</Text>
        
        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Receive reminders and mood check-ins
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={notificationsEnabled ? colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="calendar" size={24} color={colors.primary}/>
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Reminders</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  8 PM mood check-in reminders
                </Text>
              </View>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={handleDailyRemindersToggle}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={dailyReminders ? colors.primary : '#f4f3f4'}
              disabled={!notificationsEnabled}
            />
          </View>

          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: colors.primary }, !notificationsEnabled && styles.testButtonDisabled]}
            onPress={testNotification}
            disabled={!notificationsEnabled}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color={colors.primary} />
              <View style={styles.settingText}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          
          <View style={[styles.aboutItem, { borderBottomColor: colors.border }]}>
            <Ionicons name="heart" size={24} color={colors.warning} />
            <View style={styles.aboutText}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>App Version</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
            </View>
          </View>
          
          <View style={[styles.aboutItem, { borderBottomColor: colors.border }]}>
            <Ionicons name="code-slash" size={24} color={colors.textSecondary} />
            <View style={styles.aboutText}>
              <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Built with</Text>
              <Text style={[styles.aboutValue, { color: colors.text }]}>React Native & Expo</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  aboutText: {
    marginLeft: 12,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default SettingsScreen;