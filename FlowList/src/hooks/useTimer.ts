import { useState, useEffect, useCallback } from 'react';
import { TimerState } from '../types';
import { loadData } from '../utils/storage';

export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.STOPPED);
  const [sessionCount, setSessionCount] = useState(0);
  const [timerSettings, setTimerSettings] = useState<any>(null);

  // Load timer settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await loadData('timerSettings');
        if (settings) {
          setTimerSettings(settings);
          // Update current time if needed
          if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
            setTimeLeft(getDuration(timerState, settings));
          }
        }
      } catch (error) {
        console.error('Error loading timer settings:', error);
      }
    };

    loadSettings();
  }, []);

  const getDuration = useCallback((state: TimerState, settings: any = timerSettings): number => {
    if (!settings) {
      // Default durations if no settings
      switch (state) {
        case TimerState.WORK: return 25 * 60;
        case TimerState.SHORT_BREAK: return 5 * 60;
        case TimerState.LONG_BREAK: return 15 * 60;
        default: return 25 * 60;
      }
    }
    
    switch (state) {
      case TimerState.WORK: return (settings.workDuration || 25) * 60;
      case TimerState.SHORT_BREAK: return (settings.shortBreakDuration || 5) * 60;
      case TimerState.LONG_BREAK: return (settings.longBreakDuration || 15) * 60;
      default: return 25 * 60;
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
      const longBreakInterval = timerSettings?.longBreakInterval || 4;
      const nextState = nextSessionCount % longBreakInterval === 0 
        ? TimerState.LONG_BREAK 
        : TimerState.SHORT_BREAK;
      setTimerState(nextState);
      setTimeLeft(getDuration(nextState));
    } else {
      setTimerState(TimerState.WORK);
      setTimeLeft(getDuration(TimerState.WORK));
    }
  }, [timerState, sessionCount, timerSettings, getDuration]);

  // Timer effect
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
    longBreakInterval: timerSettings?.longBreakInterval || 4,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    // Remove these if they're not needed in TimerScreen
    // setTimerState, 
    // setTimeLeft
  };
};