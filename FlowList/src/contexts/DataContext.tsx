import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadData, saveData } from '../utils/storage';
import { Task, Analytics } from '../types';

// Define the shape of our context
interface DataContextType {
  tasks: Task[];
  analytics: Analytics;
  isLoading: boolean;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt' | 'mood' | 'pomodoroSessions'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (taskId: string) => Promise<void>;
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
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    
    setTasks(updatedTasks);
    await saveData('tasks', updatedTasks);
    
    const updatedTask = updatedTasks.find(task => task.id === taskId);
    
    // If task was marked as completed, update analytics
    if (updates.completed && updatedTask) {
      await updateAnalyticsOnTaskCompletion(updatedTask);
    }
    
    return updatedTask;
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    await saveData('tasks', updatedTasks);
  };

  const updateAnalyticsOnTaskCompletion = async (task: Task): Promise<void> => {
    // Implementation will be added later
    console.log('Task completed:', task);
  };

  const value: DataContextType = {
    tasks,
    analytics,
    isLoading,
    addTask,
    updateTask,
    deleteTask
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