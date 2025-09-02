import { useState, useEffect, useCallback } from 'react';
import { TimerState } from '../types';
import { TIMER_DURATIONS } from '../utils/constants';

export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS[TimerState.WORK]);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.STOPPED);
  const [sessionCount, setSessionCount] = useState(0);

  const startTimer = useCallback((): void => {
    if (timerState === TimerState.STOPPED) {
      setTimerState(TimerState.WORK);
      setTimeLeft(TIMER_DURATIONS[TimerState.WORK]);
    } else if (timerState === TimerState.PAUSED) {
      setTimerState(TimerState.WORK);
    }
  }, [timerState]);

  const pauseTimer = useCallback((): void => {
    if ([TimerState.WORK, TimerState.SHORT_BREAK, TimerState.LONG_BREAK].includes(timerState)) {
      setTimerState(TimerState.PAUSED);
    }
  }, [timerState]);

  const resetTimer = useCallback((): void => {
    setTimerState(TimerState.STOPPED);
    setTimeLeft(TIMER_DURATIONS[TimerState.WORK]);
  }, []);

  const skipTimer = useCallback((): void => {
    if (timerState === TimerState.WORK) {
      const nextSessionCount = sessionCount + 1;
      setSessionCount(nextSessionCount);
      const nextState = nextSessionCount % 4 === 0 
        ? TimerState.LONG_BREAK 
        : TimerState.SHORT_BREAK;
      setTimerState(nextState);
      setTimeLeft(TIMER_DURATIONS[nextState]);
    } else {
      setTimerState(TimerState.WORK);
      setTimeLeft(TIMER_DURATIONS[TimerState.WORK]);
    }
  }, [timerState, sessionCount]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerState !== TimerState.STOPPED && timerState !== TimerState.PAUSED) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(interval as NodeJS.Timeout);
            // Timer completed - we'll handle this in the component
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
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    setTimerState,
    setTimeLeft
  };
};