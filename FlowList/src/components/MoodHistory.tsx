import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useData } from '../contexts/DataContext';
import { Mood } from '../types';
import { MOODS } from '../utils/constants';

const MoodHistory: React.FC = () => {
  const { tasks } = useData();

  // Get completed tasks with moods
  const completedTasksWithMoods = tasks.filter(task => task.completed && task.mood);

  // Count mood occurrences
  const moodCounts: { [emoji: string]: number } = {};
  MOODS.forEach(mood => {
    moodCounts[mood.emoji] = 0;
  });

  completedTasksWithMoods.forEach(task => {
    if (task.mood && moodCounts[task.mood] !== undefined) {
      moodCounts[task.mood] += 1;
    }
  });

  // Find most common mood
  const mostCommonMood = Object.entries(moodCounts).reduce(
    (max, [emoji, count]) => count > max.count ? { emoji, count } : max,
    { emoji: '', count: 0 }
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood History</Text>
      
      {completedTasksWithMoods.length === 0 ? (
        <Text style={styles.emptyText}>Complete tasks to track your moods!</Text>
      ) : (
        <>
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              You've tracked your mood on {completedTasksWithMoods.length} tasks
            </Text>
            {mostCommonMood.count > 0 && (
              <View style={styles.commonMood}>
                <Text style={styles.commonMoodText}>Most common mood: </Text>
                <Text style={styles.commonMoodEmoji}>{mostCommonMood.emoji}</Text>
              </View>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.moodChart}>
              {MOODS.map(mood => (
                <View key={mood.name} style={styles.moodBarContainer}>
                  <View 
                    style={[
                      styles.moodBar, 
                      { 
                        backgroundColor: mood.color,
                        height: moodCounts[mood.emoji] > 0 
                          ? Math.max(20, moodCounts[mood.emoji] * 10) 
                          : 5
                      }
                    ]}
                  />
                  <Text style={styles.moodLabel}>{mood.emoji}</Text>
                  <Text style={styles.moodCount}>{moodCounts[mood.emoji]}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.recentMoods}>
            <Text style={styles.recentTitle}>Recent Moods:</Text>
            <View style={styles.moodList}>
              {completedTasksWithMoods.slice(0, 5).map(task => (
                <View key={task.id} style={styles.recentMoodItem}>
                  <Text style={styles.recentMoodEmoji}>{task.mood}</Text>
                  <Text style={styles.recentMoodTask} numberOfLines={1}>
                    {task.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 20,
  },
  summary: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  commonMood: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commonMoodText: {
    fontSize: 14,
    color: '#555',
  },
  commonMoodEmoji: {
    fontSize: 18,
  },
  moodChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  moodBarContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  moodBar: {
    width: 25,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 16,
  },
  moodCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  recentMoods: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  moodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentMoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 8,
    margin: 4,
  },
  recentMoodEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  recentMoodTask: {
    fontSize: 12,
    color: '#666',
    maxWidth: 100,
  },
});

export default MoodHistory;