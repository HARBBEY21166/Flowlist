import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useData } from '../contexts/DataContext';
import { Mood } from '../types';
import { MOODS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const MoodAnalytics: React.FC = () => {
  const { tasks } = useData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);

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
        x: mood.name, // Use name instead of emoji for better chart labels
        y: moodCounts[mood.emoji],
        color: mood.color
      });
    }
  });

  // Prepare data for charts
  const chartData = moodData.map(item => ({ x: item.x, y: item.y }));

  // Calculate mood statistics
  const totalMoodEntries = completedTasksWithMoods.length;
  const mostCommonMood = moodData.reduce(
    (max, item) => item.y > max.y ? item : max,
    { x: '', y: 0, color: '' }
  );

  // Get the emoji for the most common mood
  const mostCommonMoodEmoji = MOODS.find(m => m.name === mostCommonMood.x)?.emoji || '';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Mood Analytics</Text>

      {completedTasksWithMoods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Complete tasks with mood tracking to see analytics
          </Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{totalMoodEntries}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Moods Tracked</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.summaryNumber, { color: mostCommonMood.color }]}>
                {mostCommonMoodEmoji}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Most Common</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.summaryNumber, { color: colors.text }]}>{moodData.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Unique Moods</Text>
            </View>
          </View>

          {/* Mood Distribution - Using a custom bar chart */}
          {chartData.length > 0 && (
            <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Mood Distribution</Text>
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

          {/* Mood Proportions - Using a custom chart */}
          {moodData.length > 0 && (
            <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Mood Proportions</Text>
              <View style={styles.pieChartContainer}>
                {moodData.map((item, index) => {
                  const percentage = (item.y / totalMoodEntries) * 100;
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

          {/* Recent Moods */}
          <View style={[styles.recentContainer, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Moods</Text>
            {completedTasksWithMoods.slice(-5).reverse().map((task, index) => (
              <View key={index} style={[styles.recentMoodItem, { 
                borderBottomColor: colors.border,
                borderBottomWidth: index < 4 ? 1 : 0 
              }]}>
                <Text style={styles.recentMoodEmoji}>{task.mood}</Text>
                <View style={styles.recentMoodInfo}>
                  <Text style={[styles.recentMoodTask, { color: colors.text }]} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={[styles.recentMoodDate, { color: colors.textSecondary }]}>
                    {new Date(task.completedAt!).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartContainer: {
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
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
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
  recentContainer: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  recentMoodEmoji: {
    fontSize: 24,
    marginRight: 12,
    width: 30,
  },
  recentMoodInfo: {
    flex: 1,
  },
  recentMoodTask: {
    fontSize: 14,
    marginBottom: 2,
  },
  recentMoodDate: {
    fontSize: 12,
  },
});

export default MoodAnalytics;