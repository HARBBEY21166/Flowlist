import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadData, saveData } from '../utils/storage';

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
}

interface SettingsContextType {
  timerSettings: TimerSettings;
  updateTimerSettings: (newSettings: TimerSettings) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    longBreakInterval: 4
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async (): Promise<void> => {
    try {
      const savedSettings = await loadData<TimerSettings>('timerSettings');
      if (savedSettings) {
        setTimerSettings(savedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimerSettings = async (newSettings: TimerSettings): Promise<void> => {
    try {
      setTimerSettings(newSettings);
      await saveData('timerSettings', newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  const value: SettingsContextType = {
    timerSettings,
    updateTimerSettings,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};