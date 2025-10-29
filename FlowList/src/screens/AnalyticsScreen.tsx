import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Share, 
  Alert,
  Dimensions 
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { Mood, Task } from '../types';
import { MOODS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

import { 
  calculateProductivityStats, 
  calculateMoodStats, 
  generateWeeklyReport,
  exportToCSV,
  exportToJSON 
} from '../utils/analytics';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  let tasks: Task[] = [];
  try {
    const dataCtx = useData();
    tasks = dataCtx.tasks || [];
  } catch (err) {
    // If the context is not available (unexpected), avoid crashing the screen.
    // Log the error and fall back to an empty tasks array so the UI can render a helpful message.
    // This should not happen when `DataProvider` is correctly mounted — keeping this defensive
    // avoids an app-wide crash while we investigate why the context wasn't available.
    // eslint-disable-next-line no-console
    console.warn('useData() unavailable in AnalyticsScreen:', err);
    tasks = [];
  }
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const [exporting, setExporting] = useState(false);

  // Get completed tasks with moods
  const completedTasksWithMoods = tasks.filter(task => task.completed && task.mood);
  
  // Count mood occurrences
  const moodCounts: { [emoji: string]: number } = {};
  const moodData: { x: string; y: number; color: string }[] = [];
  
  MOODS.forEach(mood => {
    moodCounts[mood.emoji] = 0;
  });

  completedTasksWithMoods.forEach(task => {
    if (task.mood && moodCounts[task.mood] !== undefined) {
      moodCounts[task.mood] += 1;
    }
  });

  MOODS.forEach(mood => {
    if (moodCounts[mood.emoji] > 0) {
      moodData.push({
        x: mood.name,
        y: moodCounts[mood.emoji],
        color: mood.color
      });
    }
  });

  // Calculate advanced statistics
  const productivityStats = calculateProductivityStats(tasks);
  const moodStats = calculateMoodStats(tasks);
  const weeklyReport = generateWeeklyReport(tasks);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      const data = format === 'csv' ? exportToCSV(tasks) : exportToJSON(tasks);
      
      await Share.share({
        title: `Productivity Data Export`,
        message: `Here's my productivity data exported from the app`,
        url: `data:text/${format};charset=utf-8,${encodeURIComponent(data)}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const StatCard = ({ title, value, icon, color = colors.primary }: { title: string; value: string | number; icon: string; color?: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  if (tasks.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Start adding and completing tasks to see analytics
          </Text>
        </View>
      </View>
    );
  }

  return (
 <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>      <Text style={[styles.header, { color: colors.text }]}>Productivity Analytics</Text>
<ScrollView>
      {/* Summary Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
        <View style={styles.summaryContainer}>
          <StatCard title="Total Tasks" value={tasks.length} icon="list" />
          <StatCard title="Completed" value={productivityStats.completedTasks} icon="checkmark-circle" />
          <StatCard title="Completion Rate" value={`${productivityStats.completionRate.toFixed(0)}%`} icon="stats-chart" />
          <StatCard title="Productivity Score" value={`${weeklyReport.productivityScore}/100`} icon="trending-up" color="#4CAF50" />
        </View>
      </ScrollView>

      {/* Weekly Overview */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week's Performance</Text>
        <View style={styles.weeklyGrid}>
          <View style={styles.weeklyStat}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={[styles.weeklyValue, { color: colors.text }]}>{weeklyReport.totalFocusTime}m</Text>
            <Text style={[styles.weeklyLabel, { color: colors.textSecondary }]}>Focus Time</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={[styles.weeklyValue, { color: colors.text }]}>{weeklyReport.tasksCompleted}</Text>
            <Text style={[styles.weeklyLabel, { color: colors.textSecondary }]}>Tasks Done</Text>
          </View>
          <View style={styles.weeklyStat}>
            <Ionicons name="happy" size={20} color={colors.primary} />
            <Text style={[styles.weeklyValue, { color: colors.text }]}>{weeklyReport.averageMood || '📊'}</Text>
            <Text style={[styles.weeklyLabel, { color: colors.textSecondary }]}>Avg Mood</Text>
          </View>
        </View>

        {weeklyReport.trends.length > 0 && (
          <View style={styles.trendsBox}>
            <Text style={[styles.trendsTitle, { color: colors.text }]}>📈 Trends</Text>
            {weeklyReport.trends.map((trend, index) => (
              <Text key={index} style={[styles.trend, { color: colors.textSecondary }]}>
                • {trend}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* Mood Distribution */}
      {moodData.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Distribution</Text>
          <View style={styles.barChart}>
            {moodData.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barLabelContainer}>
                  <Text style={[styles.barLabel, { color: colors.text }]}>{item.x}</Text>
                  <Text style={[styles.barCount, { color: colors.textSecondary }]}>{item.y}</Text>
                </View>
                <View style={[styles.barBackground, { backgroundColor: isDark ? '#374151' : '#ecf0f1' }]}>
                  <View 
                    style={[
                      styles.barFill,
                      { 
                        backgroundColor: item.color,
                        width: `${(item.y / Math.max(...moodData.map(m => m.y))) * 85}%`
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Mood Proportions */}
      {moodData.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mood Breakdown</Text>
          <View style={styles.pieChartContainer}>
            {moodData.map((item, index) => {
              const percentage = (item.y / completedTasksWithMoods.length) * 100;
              return (
                <View key={index} style={styles.pieItem}>
                  <View style={[styles.pieColor, { backgroundColor: item.color }]} />
                  <Text style={[styles.pieLabel, { color: colors.text }]}>
                    {item.x}: {Math.round(percentage)}% ({item.y})
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Productivity Insights */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📊 Productivity Insights</Text>
        <View style={styles.insightsContainer}>
          <Ionicons name="bulb" size={20} color={colors.warning} />
          <View style={styles.insightsContent}>
            <Text style={[styles.insightText, { color: colors.text }]}>
              • You complete most tasks on {productivityStats.mostProductiveDay}s{'\n'}
              • Your completion rate is {productivityStats.completionRate.toFixed(0)}%{'\n'}
              • Keep tracking moods to discover patterns!
            </Text>
          </View>
        </View>
      </View>

      {/* Export Section */}
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Export Data</Text>
        <Text style={[styles.exportDescription, { color: colors.textSecondary }]}>
          Download your data for analysis or backup
        </Text>
        
        <View style={styles.exportButtons}>
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={() => handleExport('csv')}
            disabled={exporting}
          >
            <Ionicons name="download" size={18} color="white" />
            <Text style={styles.exportButtonText}>
              {exporting ? 'Exporting...' : 'CSV Export'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: colors.primary + '40' }]}
            onPress={() => handleExport('json')}
            disabled={exporting}
          >
            <Ionicons name="code-slash" size={18} color={colors.primary} />
            <Text style={[styles.exportButtonText, { color: colors.primary }]}>
              {exporting ? 'Exporting...' : 'JSON Export'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Moods */}
      {completedTasksWithMoods.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Moods</Text>
          <View style={styles.recentMoodsGrid}>
            {completedTasksWithMoods.slice(-6).reverse().map((task, index) => (
              <View key={index} style={styles.recentMoodItem}>
                <Text style={styles.recentMoodEmoji}>{task.mood}</Text>
                <Text style={[styles.recentMoodTask, { color: colors.textSecondary }]} numberOfLines={1}>
                  {task.title}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#2c3e50',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  summaryScroll: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    minWidth: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  weeklyStat: {
    alignItems: 'center',
  },
  weeklyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  weeklyLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  trendsBox: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  trendsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  trend: {
    fontSize: 14,
    marginBottom: 4,
  },
  barChart: {
    marginTop: 10,
  },
  barContainer: {
    marginBottom: 12,
  },
  barLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  barCount: {
    fontSize: 12,
  },
  barBackground: {
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  pieChartContainer: {
    marginTop: 10,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  pieLabel: {
    fontSize: 14,
  },
  insightsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightsContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exportDescription: {
    marginBottom: 16,
    textAlign: 'center',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  exportButtonText: {
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 14,
  },
  recentMoodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  recentMoodItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minWidth: 80,
  },
  recentMoodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  recentMoodTask: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AnalyticsScreen;