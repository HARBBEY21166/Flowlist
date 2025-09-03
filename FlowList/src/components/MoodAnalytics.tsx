import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useData } from '../contexts/DataContext';
import Victory from 'victory-native';
import { Mood } from '../types';
import { MOODS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MoodAnalytics: React.FC = () => {
  const { tasks } = useData();

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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mood Analytics</Text>

      {completedTasksWithMoods.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Complete tasks with mood tracking to see analytics</Text>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{totalMoodEntries}</Text>
              <Text style={styles.summaryLabel}>Moods Tracked</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: mostCommonMood.color }]}>
                {mostCommonMoodEmoji}
              </Text>
              <Text style={styles.summaryLabel}>Most Common</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{moodData.length}</Text>
              <Text style={styles.summaryLabel}>Unique Moods</Text>
            </View>
          </View>

          {/* Mood Distribution - Using a custom bar chart */}
          {chartData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Mood Distribution</Text>
              <View style={styles.barChart}>
                {moodData.map((item, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View style={styles.barLabelContainer}>
                      <Text style={styles.barLabel}>{item.x}</Text>
                      <Text style={styles.barCount}>{item.y}</Text>
                    </View>
                    <View style={styles.barBackground}>
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
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Mood Proportions</Text>
              <View style={styles.pieChartContainer}>
                {moodData.map((item, index) => {
                  const percentage = (item.y / totalMoodEntries) * 100;
                  return (
                    <View key={index} style={styles.pieItem}>
                      <View style={[styles.pieColor, { backgroundColor: item.color }]} />
                      <Text style={styles.pieLabel}>
                        {item.x}: {Math.round(percentage)}% ({item.y})
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Recent Moods */}
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent Moods</Text>
            {completedTasksWithMoods.slice(-5).reverse().map((task, index) => (
              <View key={index} style={styles.recentMoodItem}>
                <Text style={styles.recentMoodEmoji}>{task.mood}</Text>
                <View style={styles.recentMoodInfo}>
                  <Text style={styles.recentMoodTask} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={styles.recentMoodDate}>
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
    backgroundColor: '#f8f9fa',
  },
  title: {
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
    color: '#7f8c8d',
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
    backgroundColor: 'white',
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
    color: '#7f8c8d',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: 'white',
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
    color: '#2c3e50',
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
    color: '#2c3e50',
  },
  barCount: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  barBackground: {
    height: 20,
    backgroundColor: '#ecf0f1',
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
    color: '#2c3e50',
  },
  recentContainer: {
    backgroundColor: 'white',
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
    color: '#2c3e50',
  },
  recentMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
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
    color: '#34495e',
    marginBottom: 2,
  },
  recentMoodDate: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});

export default MoodAnalytics;