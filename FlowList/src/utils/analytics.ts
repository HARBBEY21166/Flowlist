import { Task } from '../types';

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  mostProductiveDay: string;
  mostProductiveTime: string;
}

export interface MoodStats {
  moodDistribution: { [emoji: string]: number };
  mostCommonMood: string;
  moodProductivityCorrelation: number;
  moodByDay: { [day: string]: string[] };
}

export interface WeeklyReport {
  week: string;
  tasksCompleted: number;
  totalFocusTime: number;
  averageMood: string;
  productivityScore: number;
  trends: string[];
}

export const calculateProductivityStats = (tasks: Task[]): ProductivityStats => {
  const completedTasks = tasks.filter(task => task.completed);
  const totalTasks = tasks.length;
  
  // Calculate completion rate
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  // Calculate average completion time (simplified)
  const completionTimes = completedTasks
    .filter(task => task.createdAt && task.completedAt)
    .map(task => (task.completedAt! - task.createdAt!) / (1000 * 60 * 60)); // hours

  const averageCompletionTime = completionTimes.length > 0 
    ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length 
    : 0;

  // Analyze by day of week
  const dayStats: { [key: string]: number } = {};
  completedTasks.forEach(task => {
    if (task.completedAt) {
      const day = new Date(task.completedAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayStats[day] = (dayStats[day] || 0) + 1;
    }
  });

  const mostProductiveDay = Object.entries(dayStats).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

  return {
    totalTasks,
    completedTasks: completedTasks.length,
    completionRate,
    averageCompletionTime,
    mostProductiveDay,
    mostProductiveTime: 'Afternoon', // Simplified for now
  };
};

export const calculateMoodStats = (tasks: Task[]): MoodStats => {
  const completedTasksWithMood = tasks.filter(task => task.completed && task.mood);
  
  const moodDistribution: { [emoji: string]: number } = {};
  completedTasksWithMood.forEach(task => {
    if (task.mood) {
      moodDistribution[task.mood] = (moodDistribution[task.mood] || 0) + 1;
    }
  });

  const mostCommonMood = Object.entries(moodDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';

  return {
    moodDistribution,
    mostCommonMood,
    moodProductivityCorrelation: 0.75, // Placeholder
    moodByDay: {},
  };
};

export const generateWeeklyReport = (tasks: Task[]): WeeklyReport => {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentTasks = tasks.filter(task => 
    task.completed && task.completedAt && task.completedAt > oneWeekAgo
  );

  const moodStats = calculateMoodStats(recentTasks);
  const productivityStats = calculateProductivityStats(recentTasks);

  return {
    week: `Week of ${new Date().toLocaleDateString()}`,
    tasksCompleted: recentTasks.length,
    totalFocusTime: recentTasks.length * 25, // Assuming 25min per task
    averageMood: moodStats.mostCommonMood,
    productivityScore: Math.min(100, Math.round(productivityStats.completionRate * 1.5)),
    trends: recentTasks.length > 3 ? ['Increasing productivity', 'Consistent mood tracking'] : ['Getting started'],
  };
};

export const exportToCSV = (tasks: Task[]): string => {
  const headers = ['Title', 'Description', 'Priority', 'Category', 'Completed', 'CompletedAt', 'Mood', 'CreatedAt'];
  
  const rows = tasks.map(task => [
    `"${task.title.replace(/"/g, '""')}"`,
    `"${task.description.replace(/"/g, '""')}"`,
    task.priority,
    task.category,
    task.completed ? 'Yes' : 'No',
    task.completedAt ? new Date(task.completedAt).toISOString() : '',
    task.mood || '',
    new Date(task.createdAt).toISOString()
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

export const exportToJSON = (tasks: Task[]): string => {
  return JSON.stringify(tasks, null, 2);
};