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
import { Task } from '../types';
import { Ionicons } from '@expo/vector-icons';
import MoodSelector from './MoodSelector';
import EditTaskModal from './EditTaskModal';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';


interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { updateTask, deleteTask } = useData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleComplete = async (): Promise<void> => {
    try {
      if (!task.completed) {
        // For incomplete tasks, show mood selector
        setShowMoodSelector(true);
      } else {
        // If already completed, mark as incomplete
        await updateTask(task.id, { 
          completed: false, 
          completedAt: null, 
          mood: null 
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleMoodSelect = async (mood: { emoji: string; name: string; color: string }): Promise<void> => {
    try {
      await updateTask(task.id, { 
        completed: true, 
        completedAt: Date.now(), 
        mood: mood.emoji 
      });
      setShowMoodSelector(false);
    } catch (error) {
      console.error('Error updating mood:', error);
      Alert.alert('Error', 'Failed to save mood');
    }
  };

  const handleDelete = (): void => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              await deleteTask(task.id);
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }, 
          style: "destructive" 
        }
      ]
    );
  };

  const handleEditMood = (): void => {
    if (task.completed) {
      setShowMoodSelector(true);
    }
  };

  const handleEditTask = (): void => {
    setShowEditModal(true);
  };

  const handleSaveEdit = (): void => {
    setIsExpanded(false);
  };

  const priority = PRIORITIES[task.priority.toUpperCase() as keyof typeof PRIORITIES];

  return (
    <>
      <TouchableOpacity 
        style={[styles.container, { 
          backgroundColor: colors.cardBackground, 
          borderColor: colors.border,
          shadowColor: isDark ? '#000' : '#000',
          shadowOpacity: isDark ? 0.3 : 0.2,
          elevation: isDark ? 3 : 2
        }]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.content}>
          <View style={[styles.priorityIndicator, { backgroundColor: priority.color }]} />
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }, task.completed && styles.completedTitle]}>
              {task.title}
            </Text>
            
            {isExpanded && task.description ? (
              <Text style={[styles.description, { color: colors.textSecondary }]}>{task.description}</Text>
            ) : null}
            
            {isExpanded && (
              <View style={styles.metaContainer}>
                <Text style={[styles.category, { color: colors.textSecondary }]}>{task.category}</Text>
                <Text style={[styles.priority, { color: priority.color }]}>
                  {priority.label}
                </Text>
              </View>
            )}
            
            {isExpanded && task.completed && task.mood && (
              <View style={styles.moodContainer}>
                <Text style={[styles.moodLabel, { color: colors.textSecondary }]}>Mood: </Text>
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
            
            <TouchableOpacity onPress={handleEditTask} style={styles.actionButton}>
              <Ionicons name="create" size={24} color="#2196F3" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                if (task.completed) {
                  handleEditMood();
                } else {
                  Alert.alert(
                    "Mood Tracking", 
                    "Mood tracking is available after you complete a task. This helps you reflect on how you felt when finishing it.\n\nComplete the task first, then you can add or edit your mood!",
                    [
                      { 
                        text: "Complete Task", 
                        onPress: () => handleComplete() 
                      },
                      { 
                        text: "OK", 
                        style: "cancel" 
                      }
                    ]
                  );
                }
              }} 
              style={styles.actionButton}
            >
              <View style={styles.moodButtonContainer}>
                <Ionicons 
                  name="color-palette" 
                  size={24} 
                  color={task.completed ? "#9C27B0" : colors.textSecondary} 
                />
                {!task.completed && (
                  <Ionicons 
                    name="information-circle" 
                    size={12} 
                    color={colors.textSecondary} 
                    style={styles.infoIcon}
                  />
                )}
              </View>
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

      <EditTaskModal
        visible={showEditModal}
        task={task}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
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
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  priority: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  moodContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'center',
  },
  infoIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  moodLabel: {
    fontSize: 12,
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
  moodButtonContainer: {
    position: 'relative',
  },
});

export default TaskItem;