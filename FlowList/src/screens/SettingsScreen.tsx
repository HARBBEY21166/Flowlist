import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { 
  checkNotificationPermissions, 
  requestNotificationPermissions,
  scheduleDailyMoodCheck,
  sendMoodNotification
} from '../utils/notifications';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dailyReminders, setDailyReminders] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const hasPermission = await checkNotificationPermissions();
      setNotificationsEnabled(hasPermission);
      // For simplicity, we'll assume daily reminders are enabled if notifications are enabled
      setDailyReminders(hasPermission);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      if (value) {
        const granted = await requestNotificationPermissions();
        setNotificationsEnabled(granted);
        setDailyReminders(granted);
        
        if (granted) {
          await scheduleDailyMoodCheck();
          Alert.alert('Success', 'Notifications enabled!');
        }
      } else {
        setNotificationsEnabled(false);
        setDailyReminders(false);
        Alert.alert('Notifications disabled', 'You will no longer receive reminders');
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const testNotification = async () => {
    try {
      await sendMoodNotification();
      Alert.alert('Test Notification', 'A test notification has been sent!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#4361ee" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Enable Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive reminders and mood check-ins
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={notificationsEnabled ? '#4361ee' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={24} color="#4361ee" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Daily Reminders</Text>
              <Text style={styles.settingDescription}>
                8 PM mood check-in reminders
              </Text>
            </View>
          </View>
          <Switch
            value={dailyReminders}
            onValueChange={setDailyReminders}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={dailyReminders ? '#4361ee' : '#f4f3f4'}
            disabled={!notificationsEnabled}
          />
        </View>

        <TouchableOpacity 
          style={[styles.testButton, !notificationsEnabled && styles.testButtonDisabled]}
          onPress={testNotification}
          disabled={!notificationsEnabled}
        >
          <Ionicons name="send" size={20} color="white" />
          <Text style={styles.testButtonText}>Send Test Notification</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.aboutItem}>
          <Ionicons name="heart" size={24} color="#e74c3c" />
          <View style={styles.aboutText}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.aboutItem}>
          <Ionicons name="code-slash" size={24} color="#2c3e50" />
          <View style={styles.aboutText}>
            <Text style={styles.aboutLabel}>Built with</Text>
            <Text style={styles.aboutValue}>React Native & Expo</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#2c3e50',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
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
    color: '#2c3e50',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4361ee',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  testButtonDisabled: {
    backgroundColor: '#bdc3c7',
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
    borderBottomColor: '#ecf0f1',
  },
  aboutText: {
    marginLeft: 12,
  },
  aboutLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginTop: 2,
  },
});

export default SettingsScreen;