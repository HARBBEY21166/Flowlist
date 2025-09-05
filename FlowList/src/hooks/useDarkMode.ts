import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { loadData, saveData } from '../utils/storage';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const savedDarkMode = await loadData('darkMode');
      if (savedDarkMode !== null) {
        setIsDark(savedDarkMode);
      } else {
        // Default to system preference
        setIsDark(Appearance.getColorScheme() === 'dark');
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
      setIsDark(false); // Fallback to light mode
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await saveData('darkMode', newValue);
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setIsDark(value);
    try {
      await saveData('darkMode', value);
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  };

  return {
    isDark,
    toggleDarkMode,
    setDarkMode,
    isLoaded
  };
};