import { Mood, TimerState } from '../types';

export const MOODS: Mood[] = [
  { emoji: '😊', name: 'Happy', color: '#FFD700' },
  { emoji: '😐', name: 'Neutral', color: '#808080' },
  { emoji: '😔', name: 'Sad', color: '#4169E1' },
  { emoji: '😤', name: 'Frustrated', color: '#FF6347' },
  { emoji: '🤗', name: 'Accomplished', color: '#32CD32' },
  { emoji: '😴', name: 'Tired', color: '#DDA0DD' },
  { emoji: '🤔', name: 'Focused', color: '#FF8C00' },
  { emoji: '😰', name: 'Stressed', color: '#DC143C' }
];

export const TIMER_DURATIONS = {
  [TimerState.WORK]: 25 * 60,        // 1500 seconds (25 minutes)
  [TimerState.SHORT_BREAK]: 5 * 60,  // 300 seconds (5 minutes)
  [TimerState.LONG_BREAK]: 15 * 60   // 900 seconds (15 minutes)
};

export const PRIORITIES = {
  LOW: { label: 'Low', color: '#4CAF50' },
  MEDIUM: { label: 'Medium', color: '#FFC107' },
  HIGH: { label: 'High', color: '#F44336' }
};