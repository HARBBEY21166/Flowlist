import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { saveData, loadData } from '../utils/storage';
import { Ionicons } from '@expo/vector-icons';

interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number; // number of pomodoros before long break
}

const TimerSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      const savedSettings = await loadData<TimerSettings>('timerSettings');
      if (savedSettings) {
        setSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading timer settings:', error);
    }
  };

  const saveSettings = async (newSettings: TimerSettings): Promise<void> => {
    try {
      setSettings(newSettings);
      await saveData('timerSettings', newSettings);
      Alert.alert('Success', 'Timer settings saved!');
    } catch (error) {
      console.error('Error saving timer settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const updateSetting = <K extends keyof TimerSettings>(key: K, value: TimerSettings[K]): void => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = (): void => {
    const defaultSettings: TimerSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      autoStartBreaks: false,
      autoStartPomodoros: false,
      longBreakInterval: 4
    };
    saveSettings(defaultSettings);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Timer Settings</Text>

      {/* Work Duration */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Ionicons name="time" size={24} color="#4361ee" />
          <Text style={styles.settingTitle}>Work Duration</Text>
        </View>
        <Text style={styles.settingDescription}>
          How long your focus sessions last
        </Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={styles.durationInput}
            value={settings.workDuration.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              updateSetting('workDuration', Math.min(Math.max(value, 1), 60));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.durationLabel}>minutes</Text>
        </View>
      </View>

      {/* Short Break Duration */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Ionicons name="cafe" size={24} color="#4361ee" />
          <Text style={styles.settingTitle}>Short Break Duration</Text>
        </View>
        <Text style={styles.settingDescription}>
          Duration of your short breaks
        </Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={styles.durationInput}
            value={settings.shortBreakDuration.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              updateSetting('shortBreakDuration', Math.min(Math.max(value, 1), 30));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.durationLabel}>minutes</Text>
        </View>
      </View>

      {/* Long Break Duration */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Ionicons name="bed" size={24} color="#4361ee" />
          <Text style={styles.settingTitle}>Long Break Duration</Text>
        </View>
        <Text style={styles.settingDescription}>
          Duration of your long breaks
        </Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={styles.durationInput}
            value={settings.longBreakDuration.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              updateSetting('longBreakDuration', Math.min(Math.max(value, 1), 60));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.durationLabel}>minutes</Text>
        </View>
      </View>

      {/* Long Break Interval */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Ionicons name="repeat" size={24} color="#4361ee" />
          <Text style={styles.settingTitle}>Long Break Interval</Text>
        </View>
        <Text style={styles.settingDescription}>
          Number of focus sessions before a long break
        </Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={styles.durationInput}
            value={settings.longBreakInterval.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              updateSetting('longBreakInterval', Math.min(Math.max(value, 1), 10));
            }}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.durationLabel}>sessions</Text>
        </View>
      </View>

      {/* Auto-start Settings */}
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Ionicons name="play-circle" size={24} color="#4361ee" />
          <Text style={styles.settingTitle}>Auto-start</Text>
        </View>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto-start breaks</Text>
            <Switch
              value={settings.autoStartBreaks}
              onValueChange={(value) => updateSetting('autoStartBreaks', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.autoStartBreaks ? '#4361ee' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto-start focus sessions</Text>
            <Switch
              value={settings.autoStartPomodoros}
              onValueChange={(value) => updateSetting('autoStartPomodoros', value)}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.autoStartPomodoros ? '#4361ee' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
        <Ionicons name="refresh" size={20} color="#e74c3c" />
        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
      </TouchableOpacity>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Pomodoro Technique Tips</Text>
        <Text style={styles.helpText}>
          • 25-minute work sessions are standard, but adjust to your focus level{'\n'}
          • Short breaks (5 minutes) help you recharge{'\n'}
          • Long breaks (15-30 minutes) after 4 sessions prevent burnout{'\n'}
          • Experiment to find what works best for you!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
    color: '#2c3e50',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  durationLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  switchContainer: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  switchLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  resetButtonText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helpSection: {
    backgroundColor: '#e8f4f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
});

export default TimerSettingsScreen;