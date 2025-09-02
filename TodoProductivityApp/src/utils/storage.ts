import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Analytics } from '../types';

// Save data to storage
export const saveData = async (key: string, value: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Load data from storage
export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading data:', error);
    return null;
  }
};

// Clear data from storage
export const clearData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};