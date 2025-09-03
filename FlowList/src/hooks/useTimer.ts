import { useState, useEffect, useCallback } from 'react';
import { TimerState } from '../types';
import { loadData } from '../utils/storage';

// Default settings
const DEFAULT_TIMER_DURATIONS = {
  [TimerState.WORK]: 25 * 60,
  [TimerState.SHORT_BREAK]: 5 * 60,
  [TimerState.LONG_BREAK]: 15 * 60
};

export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMER_DURATIONS[TimerState.WORK]);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.STOPPED);
  const [sessionCount, setSessionCount] = useState(0);
  const [timerSettings, setTimerSettings] = useState<any>(null);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  // Load timer settings and set up listener for changes
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadData('timerSettings');
        if (settings) {
          setTimerSettings(settings);
          setLongBreakInterval(settings.longBreakInterval || 4);
          
          // Update current time if timer is running
          if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
            setTimeLeft(getDuration(timerState, settings));
          }
        }
      } catch (error) {
        console.error('Error loading timer settings:', error);
      }
    };

    loadSettings();

    // Set up an interval to check for settings changes
    const intervalId = setInterval(loadSettings, 1000); // Check every second

    return () => clearInterval(intervalId);
  }, []);

  // Get current duration based on state and settings
  const getDuration = useCallback((state: TimerState, customSettings?: any): number => {
    const settings = customSettings || timerSettings;
    if (!settings) return DEFAULT_TIMER_DURATIONS[state];
    
    switch (state) {
      case TimerState.WORK:
        return (settings.workDuration || 25) * 60;
      case TimerState.SHORT_BREAK:
        return (settings.shortBreakDuration || 5) * 60;
      case TimerState.LONG_BREAK:
        return (settings.longBreakDuration || 15) * 60;
      default:
        return DEFAULT_TIMER_DURATIONS[state];
    }
  }, [timerSettings]);

  const startTimer = useCallback((): void => {
    if (timerState === TimerState.STOPPED) {
      setTimerState(TimerState.WORK);
      setTimeLeft(getDuration(TimerState.WORK));
    } else if (timerState === TimerState.PAUSED) {
      setTimerState(TimerState.WORK);
    }
  }, [timerState, getDuration]);

  const pauseTimer = useCallback((): void => {
    if ([TimerState.WORK, TimerState.SHORT_BREAK, TimerState.LONG_BREAK].includes(timerState)) {
      setTimerState(TimerState.PAUSED);
    }
  }, [timerState]);

  const resetTimer = useCallback((): void => {
    setTimerState(TimerState.STOPPED);
    setTimeLeft(getDuration(TimerState.WORK));
    setSessionCount(0);
  }, [getDuration]);

  const skipTimer = useCallback((): void => {
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
  }, [timerState, sessionCount, longBreakInterval, getDuration]);

  // Update timeLeft when settings change
  useEffect(() => {
    if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
      setTimeLeft(getDuration(timerState));
    }
  }, [timerSettings, timerState, getDuration]);

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

  return {
    timeLeft,
    timerState,
    sessionCount,
    longBreakInterval,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setTimerState,
    setTimeLeft
  };
};