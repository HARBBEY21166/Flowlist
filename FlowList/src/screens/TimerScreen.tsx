import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  AppState,
  AppStateStatus,
  ScrollView,
  TextInput,
  Modal,
  Alert
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { TimerState } from '../types';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { saveData, loadData } from '../utils/storage';
import { getColors } from '../constants/Colors';
import { useDarkMode } from '../hooks/useDarkMode';

// Define interfaces
interface TimerDurations {
  work: number;
  shortBreak: number;
  longBreak: number;
}

interface TimerSettings {
  durations: TimerDurations;
  longBreakInterval: number;
}

// Default timer durations
const DEFAULT_DURATIONS: TimerDurations = {
  work: 25,
  shortBreak: 5,
  longBreak: 15
};

const TimerScreen: React.FC = () => {
  const { isDark, toggleDarkMode, setDarkMode, isLoaded } = useDarkMode();
    const colors = getColors(isDark);
  const { tasks, activeTaskId, setActiveTask } = useData();
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.STOPPED);
  const [sessionCount, setSessionCount] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);
  const [showSettings, setShowSettings] = useState(false);
  const [durations, setDurations] = useState<TimerDurations>(DEFAULT_DURATIONS);
  const [longBreakInterval, setLongBreakInterval] = useState<number>(4);

  // Load saved settings
  useEffect(() => {
    loadTimerSettings();
  }, []);

  const loadTimerSettings = async (): Promise<void> => {
    try {
      const savedSettings = await loadData<TimerSettings>('timerSettings');
      if (savedSettings) {
        setDurations(savedSettings.durations || DEFAULT_DURATIONS);
        setLongBreakInterval(savedSettings.longBreakInterval || 4);
        // Update current time if timer is running
        if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
          setTimeLeft(getDuration(timerState, savedSettings.durations));
        }
      }
    } catch (error) {
      console.error('Error loading timer settings:', error);
    }
  };

  const saveTimerSettings = async (): Promise<void> => {
    try {
      const settings: TimerSettings = {
        durations,
        longBreakInterval
      };
      await saveData('timerSettings', settings);
      Alert.alert('Success', 'Timer settings saved!');
      setShowSettings(false);
      
      // Update current timer if needed
      if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
        setTimeLeft(getDuration(timerState, durations));
      }
    } catch (error) {
      console.error('Error saving timer settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer state text
  const getTimerStateText = (): string => {
    switch (timerState) {
      case TimerState.WORK: return 'Focus Time';
      case TimerState.SHORT_BREAK: return 'Short Break';
      case TimerState.LONG_BREAK: return 'Long Break';
      case TimerState.PAUSED: return 'Paused';
      default: return 'Ready to Focus';
    }
  };

  // Get duration based on timer state
  const getDuration = (state: TimerState, customDurations?: TimerDurations): number => {
    const durationsToUse = customDurations || durations;
    switch (state) {
      case TimerState.WORK: return durationsToUse.work * 60;
      case TimerState.SHORT_BREAK: return durationsToUse.shortBreak * 60;
      case TimerState.LONG_BREAK: return durationsToUse.longBreak * 60;
      default: return durationsToUse.work * 60;
    }
  };

  // Get background color based on timer state
  const getBackgroundColor = (): string => {
    switch (timerState) {
      case TimerState.WORK: return '#FF5252';
      case TimerState.SHORT_BREAK: return '#4CAF50';
      case TimerState.LONG_BREAK: return '#2196F3';
      case TimerState.PAUSED: return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
      handleTimerComplete();
    }
  }, [timeLeft, timerState]);


  // Timer effect - This is what makes the countdown work
useEffect(() => {
  let interval: NodeJS.Timeout | null = null;
  
  if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
    interval = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(interval as NodeJS.Timeout);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }
  
  return () => {
    if (interval) clearInterval(interval);
  };
}, [timerState]);

  const handleTimerComplete = async (): Promise<void> => {
    Vibration.vibrate([0, 500, 200, 500]);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Timer Complete!",
        body: timerState === TimerState.WORK ? "Time for a break!" : "Back to work!",
        sound: true,
      },
      trigger: null,
    });

    // Determine next timer state
    let nextState: TimerState;
    if (timerState === TimerState.WORK) {
      const nextSessionCount = sessionCount + 1;
      setSessionCount(nextSessionCount);
      nextState = nextSessionCount % longBreakInterval === 0 
        ? TimerState.LONG_BREAK 
        : TimerState.SHORT_BREAK;
    } else {
      nextState = TimerState.WORK;
    }

    setTimerState(nextState);
    setTimeLeft(getDuration(nextState));
  };

  const startTimer = (): void => {
    if (timerState === TimerState.STOPPED) {
      setTimerState(TimerState.WORK);
      setTimeLeft(getDuration(TimerState.WORK));
    } else if (timerState === TimerState.PAUSED) {
      setTimerState(TimerState.WORK);
    }
  };

  const pauseTimer = (): void => {
    if ([TimerState.WORK, TimerState.SHORT_BREAK, TimerState.LONG_BREAK].includes(timerState)) {
      setTimerState(TimerState.PAUSED);
    }
  };

  const resetTimer = (): void => {
    setTimerState(TimerState.STOPPED);
    setTimeLeft(getDuration(TimerState.WORK));
    setSessionCount(0);
  };

  const skipTimer = (): void => {
    if (timerState === TimerState.WORK) {
      const nextSessionCount = sessionCount + 1;
      setSessionCount(nextSessionCount);
      const nextState = nextSessionCount % longBreakInterval === 0 
        ? TimerState.LONG_BREAK 
        : TimerState.SHORT_BREAK;
      setTimerState(nextState);
      setTimeLeft(getDuration(nextState));
    } else {
      setTimerState(TimerState.WORK);
      setTimeLeft(getDuration(TimerState.WORK));
    }
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    const totalTime = getDuration(timerState);
    return (totalTime - timeLeft) / totalTime;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Settings Button */}
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(true)}
        >
          <Ionicons name="settings" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.stateText}>{getTimerStateText()}</Text>
        
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${getProgress() * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionText}>
            Session: {sessionCount % longBreakInterval}/{longBreakInterval}
          </Text>
          <Text style={styles.sessionText}>
            Next: {sessionCount % longBreakInterval === longBreakInterval - 1 
              ? 'Long Break' 
              : 'Short Break'}
          </Text>
        </View>

        <View style={styles.controls}>
          {(timerState === TimerState.PAUSED || timerState === TimerState.STOPPED) ? (
            <TouchableOpacity style={styles.controlButton} onPress={startTimer}>
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.controlText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.controlButton} onPress={pauseTimer}>
              <Ionicons name="pause" size={24} color="white" />
              <Text style={styles.controlText}>Pause</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.controlText}>Reset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={skipTimer}>
            <Ionicons name="play-skip-forward" size={24} color="white" />
            <Text style={styles.controlText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.taskSelector}>
          <Text style={styles.selectorTitle}>Select Task to Work On</Text>
          <ScrollView style={styles.taskList}>
            {tasks.filter(task => !task.completed).map(task => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskItem,
                  activeTaskId === task.id && styles.activeTaskItem
                ]}
                onPress={() => setActiveTask(task.id)}
              >
                <Text
                  style={[
                    styles.taskText,
                    activeTaskId === task.id && styles.activeTaskText
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
                {activeTaskId === task.id && (
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
            {tasks.filter(task => !task.completed).length === 0 && (
              <Text style={styles.noTasksText}>No tasks available. Add some tasks first!</Text>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Timer Settings Modal */}
      {/* Timer Settings Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={showSettings}
  onRequestClose={() => setShowSettings(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Timer Settings</Text>
        <TouchableOpacity onPress={() => setShowSettings(false)}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Work Duration (minutes)</Text>
          <TextInput
            style={styles.settingInput}
            value={durations.work.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setDurations({...durations, work: Math.min(Math.max(value, 1), 60)});
            }}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Short Break (minutes)</Text>
          <TextInput
            style={styles.settingInput}
            value={durations.shortBreak.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setDurations({...durations, shortBreak: Math.min(Math.max(value, 1), 30)});
            }}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Long Break (minutes)</Text>
          <TextInput
            style={styles.settingInput}
            value={durations.longBreak.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setDurations({...durations, longBreak: Math.min(Math.max(value, 1), 60)});
            }}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.settingGroup}>
          <Text style={styles.settingLabel}>Long Break Interval</Text>
          <Text style={styles.settingDescription}>
            Number of focus sessions before a long break
          </Text>
          <TextInput
            style={styles.settingInput}
            value={longBreakInterval.toString()}
            onChangeText={(text) => {
              const value = parseInt(text) || 1;
              setLongBreakInterval(Math.min(Math.max(value, 1), 10));
            }}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveTimerSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={() => {
            setDurations(DEFAULT_DURATIONS);
            setLongBreakInterval(4);
          }}
        >
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
    </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  stateText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 30,
  },
  sessionText: {
    color: 'white',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 40,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 80,
  },
  controlText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  taskSelector: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 15,
    maxHeight: 200,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskList: {
    maxHeight: 150,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeTaskItem: {
    backgroundColor: '#E8F5E9',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  activeTaskText: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  noTasksText: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  // Modal styles
  // Replace the modalContainer and modalContent styles:
// Modal styles
// Alternative modal styles for full-screen
modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},
modalContent: {
  backgroundColor: 'white',
  margin: 20,
  borderRadius: 20,
  padding: 20,
  flex: 1,
},
modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  paddingBottom: 15,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
},
settingsContainer: {
  flex: 1,
},
settingGroup: {
  marginBottom: 20,
},
settingLabel: {
  fontSize: 16,
  fontWeight: '600',
  marginBottom: 5,
  color: '#333',
},
settingDescription: {
  fontSize: 14,
  color: '#666',
  marginBottom: 10,
},
settingInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 8,
  padding: 12,
  fontSize: 16,
  backgroundColor: '#f9f9f9',
},
saveButton: {
  backgroundColor: '#4361ee',
  padding: 16,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 12,
},
saveButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},
resetButton: {
  backgroundColor: '#f8f9fa',
  padding: 16,
  borderRadius: 8,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#ddd',
},
resetButtonText: {
  color: '#666',
  fontWeight: 'bold',
},
});

export default TimerScreen;