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

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask } = useData();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleComplete = async (): Promise<void> => {
    await updateTask(task.id, { completed: true, completedAt: Date.now() });
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
    <TouchableOpacity 
      style={styles.container}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.priorityIndicator, { backgroundColor: priority.color }]} />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{task.title}</Text>
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
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleComplete} style={styles.actionButton}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
});

export default TaskItem;