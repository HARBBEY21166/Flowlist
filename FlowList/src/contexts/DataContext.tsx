import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadData, saveData } from '../utils/storage';
import { Task, Analytics } from '../types';

// Define the shape of our context
interface DataContextType {
  tasks: Task[];
  analytics: Analytics;
  isLoading: boolean;
  activeTaskId: string | null;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'mood' | 'pomodoroSessions'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (taskId: string) => Promise<void>;
  setActiveTask: (taskId: string | null) => void;
}

// Create the context with a default value
const DataContext = createContext<DataContextType | undefined>(undefined);

// Create a provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<Analytics>({
    dailyStats: {},
    streaks: { current: 0, longest: 0, lastCompletionDate: null },
    weeklyData: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTaskId, setActiveTask] = useState<string | null>(null);

  useEffect(() => {
    loadAppData();
  }, []);

  const loadAppData = async (): Promise<void> => {
    try {
      const [loadedTasks, loadedAnalytics] = await Promise.all([
        loadData<Task[]>('tasks'),
        loadData<Analytics>('analytics')
      ]);
      
      setTasks(loadedTasks || []);
      setAnalytics(loadedAnalytics || {
        dailyStats: {},
        streaks: { current: 0, longest: 0, lastCompletionDate: null },
        weeklyData: []
      });
    } catch (error) {
      console.error('Error loading app data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'mood' | 'pomodoroSessions'>): Promise<Task> => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
      dueDate: taskData.dueDate || null,
      priority: taskData.priority || 'medium',
      category: taskData.category || 'general',
      mood: null,
      pomodoroSessions: 0
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    await saveData('tasks', updatedTasks);
    return newTask;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task | undefined> => {
    try {
      // Create a new array with the updated task
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      );
      
      // Update state
      setTasks(updatedTasks);
      
      // Save to storage
      await saveData('tasks', updatedTasks);
      
      // Find and return the updated task
      const updatedTask = updatedTasks.find(task => task.id === taskId);
      
      // If task was marked as completed, update analytics
      if (updates.completed && updatedTask) {
        await updateAnalyticsOnTaskCompletion(updatedTask);
      }
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      await saveData('tasks', updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Helper function to get current date string (YYYY-MM-DD)
  const getCurrentDateString = (): string => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const updateAnalyticsOnTaskCompletion = async (task: Task): Promise<void> => {
    try {
      const currentDate = getCurrentDateString();
      const currentHour = new Date().getHours();
      
      // Get current daily stats or create new ones
      const currentStats = analytics.dailyStats[currentDate] || {
        tasksCompleted: 0,
        pomodoroSessions: 0,
        mostActiveHour: currentHour,
        dominantMood: task.mood || '😐'
      };

      // Update stats
      const updatedStats = {
        ...currentStats,
        tasksCompleted: currentStats.tasksCompleted + 1,
        dominantMood: task.mood || currentStats.dominantMood
      };

      // Update streaks
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;

      let updatedStreaks = { ...analytics.streaks };
      
      if (analytics.streaks.lastCompletionDate === yesterdayString) {
        // Consecutive day
        updatedStreaks.current += 1;
        updatedStreaks.longest = Math.max(updatedStreaks.longest, updatedStreaks.current);
      } else if (analytics.streaks.lastCompletionDate !== currentDate) {
        // New day (not today)
        updatedStreaks.current = 1;
        updatedStreaks.longest = Math.max(updatedStreaks.longest, 1);
      }
      
      updatedStreaks.lastCompletionDate = currentDate;

      // Update analytics state
      const updatedAnalytics = {
        ...analytics,
        dailyStats: {
          ...analytics.dailyStats,
          [currentDate]: updatedStats
        },
        streaks: updatedStreaks
      };

      setAnalytics(updatedAnalytics);
      await saveData('analytics', updatedAnalytics);
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  const value: DataContextType = {
    tasks,
    analytics,
    isLoading,
    activeTaskId,
    addTask,
    updateTask,
    deleteTask,
    setActiveTask
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Create a custom hook to use the context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};