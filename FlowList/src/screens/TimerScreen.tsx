import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  AppState,
  AppStateStatus,
  ScrollView
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { useTimer } from '../hooks/useTimer';
import { TimerState } from '../types';
import { TIMER_DURATIONS } from '../utils/constants';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../contexts/SettingsContext';
import { useIsFocused } from '@react-navigation/native';



const TimerScreen: React.FC = () => {
  const { tasks, activeTaskId, setActiveTask } = useData();
  const {
    timeLeft,
    timerState,
    sessionCount,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer
  } = useTimer();

  const { timerSettings } = useSettings();

  const isFocused = useIsFocused();

useEffect(() => {
  if (isFocused) {
    // Reload settings when screen comes into focus
    const reloadSettings = async () => {
      const settings = await loadData('timerSettings');
      if (settings) {
        // Force timer reset to apply new settings
        if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
          setTimeLeft(getDuration(timerState, settings));
        }
      }
    };
    reloadSettings();
  }
}, [isFocused]);
  
  const [appState, setAppState] = useState(AppState.currentState);

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

  // Get background color based on timer state
  const getBackgroundColor = (): string => {
    switch (timerState) {
      case TimerState.WORK: return '#FF5252'; // Red for focus
      case TimerState.SHORT_BREAK: return '#4CAF50'; // Green for short break
      case TimerState.LONG_BREAK: return '#2196F3'; // Blue for long break
      case TimerState.PAUSED: return '#FF9800'; // Orange for paused
      default: return '#9E9E9E'; // Gray for stopped
    }
  };

  // Handle app state changes (background/foreground)
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

  const handleTimerComplete = async (): Promise<void> => {
    // Vibrate when timer completes
    Vibration.vibrate([0, 500, 200, 500]);
    
    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Timer Complete!",
        body: timerState === TimerState.WORK 
          ? "Time for a break!" 
          : "Back to work!",
        sound: true,
      },
      trigger: null,
    });

    // Determine next timer state
    let nextState: TimerState;
    if (timerState === TimerState.WORK) {
      const nextSessionCount = sessionCount + 1;
      nextState = nextSessionCount % 4 === 0 
        ? TimerState.LONG_BREAK 
        : TimerState.SHORT_BREAK;
    } else {
      nextState = TimerState.WORK;
    }

    // For now, we'll just log this. We'll implement the full state management later
    console.log(`Timer completed. Next state: ${nextState}`);
  };

  // Calculate progress percentage
  const getProgress = (): number => {
    const totalTime = TIMER_DURATIONS[timerState] || TIMER_DURATIONS[TimerState.WORK];
    return (totalTime - timeLeft) / totalTime;
  };

  const getDuration = (state: TimerState): number => {
  switch (state) {
    case TimerState.WORK:
      return timerSettings.workDuration * 60;
    case TimerState.SHORT_BREAK:
      return timerSettings.shortBreakDuration * 60;
    case TimerState.LONG_BREAK:
      return timerSettings.longBreakDuration * 60;
    default:
      return 25 * 60;
  }
};

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.content}>
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
  Session: {sessionCount % timerSettings.longBreakInterval}/{timerSettings.longBreakInterval}
</Text>
<Text style={styles.sessionText}>
  Next: {sessionCount % timerSettings.longBreakInterval === timerSettings.longBreakInterval - 1 
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
            <Ionicons name="skip-forward" size={24} color="white" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});

export default TimerScreen;