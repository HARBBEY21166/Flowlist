import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { PRIORITIES } from '../utils/constants';
import { Task, Mood } from '../types';
import { Ionicons } from '@expo/vector-icons';
import MoodSelector from './MoodSelector';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);

  const handleEditMood = (): void => {
  if (task.completed) {
    setShowMoodSelector(true);
  }
};

  const handleComplete = async (): Promise<void> => {
    // For completed tasks, show mood selector
    if (!task.completed) {
      setShowMoodSelector(true);
    } else {
      // If already completed, just update without mood
      await updateTask(task.id, { completed: false, completedAt: null, mood: null });
    }
  };

  const handleMoodSelect = async (mood: Mood): Promise<void> => {
    await updateTask(task.id, { 
      completed: true, 
      completedAt: Date.now(), 
      mood: mood.emoji 
    });
    setShowMoodSelector(false);
  };

  const handleDelete = (): void => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deleteTask(task.id), style: "destructive" }
      ]
    );
  };

  const priority = PRIORITIES[task.priority.toUpperCase() as keyof typeof PRIORITIES];

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={[styles.priorityIndicator, { backgroundColor: priority.color }]} />
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, task.completed && styles.completedTitle]}>
              {task.title}
            </Text>
            
            {isExpanded && task.description ? (
              <Text style={styles.description}>{task.description}</Text>
            ) : null}
            
            {isExpanded && (
              <View style={styles.metaContainer}>
                <Text style={styles.category}>{task.category}</Text>
                <Text style={[styles.priority, { color: priority.color }]}>
                  {priority.label}
                </Text>
              </View>
            )}
            
            {isExpanded && task.completed && task.mood && (
              <View style={styles.moodContainer}>
                <Text style={styles.moodLabel}>Mood: </Text>
                <Text style={styles.moodEmoji}>{task.mood}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleComplete} style={styles.actionButton}>
              <Ionicons 
                name={task.completed ? "refresh-circle" : "checkmark-circle"} 
                size={24} 
                color={task.completed ? "#FFA500" : "#4CAF50"} 
              />
            </TouchableOpacity>
            // Add an edit button to the actions
<TouchableOpacity onPress={handleEditMood} style={styles.actionButton}>
  <Ionicons 
    name="color-palette" 
    size={24} 
    color={task.completed ? "#9C27B0" : "#ccc"} 
  />
</TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Ionicons name="trash" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <MoodSelector
        visible={showMoodSelector}
        onMoodSelect={handleMoodSelect}
        onClose={() => setShowMoodSelector(false)}
        selectedMood={task.mood}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    marginRight: 12,
    borderRadius: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  priority: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
  },
  moodEmoji: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
});

export default TaskItem;