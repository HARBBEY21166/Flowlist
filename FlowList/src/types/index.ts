// Define the mood options
export interface Mood {
  emoji: string;
  name: string;
  color: string;
}

// Define the task structure
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
  completedAt: number | null;
  dueDate: number | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  mood: string | null;
  pomodoroSessions: number;
}

// Define analytics data structure
export interface DailyStats {
  tasksCompleted: number;
  pomodoroSessions: number;
  mostActiveHour: number;
  dominantMood: string;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompletionDate: string | null;
}

export interface Analytics {
  dailyStats: {
    [date: string]: DailyStats;
  };
  streaks: Streak;
  weeklyData: any[]; // We'll define this more precisely later
}

// Define timer states
export enum TimerState {
  WORK = 'work',
  SHORT_BREAK = 'shortBreak',
  LONG_BREAK = 'longBreak',
  PAUSED = 'paused',
  STOPPED = 'stopped'
}