import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { useData } from '../contexts/DataContext';
import TaskItem from '../components/TaskItem';
import { PRIORITIES } from '../utils/constants';
import { Task } from '../types';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';

const HomeScreen: React.FC = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  const { tasks, addTask } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: 'general',
    dueDate: null as number | null
  });

  const handleAddTask = async (): Promise<void> => {
    if (newTask.title.trim()) {
      await addTask(newTask);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        dueDate: null
      });
      setModalVisible(false);
    } else {
      Alert.alert('Error', 'Please enter a task title');
    }
  };

  const renderTask = ({ item }: { item: Task }) => <TaskItem task={item} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Tasks</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks.filter(task => !task.completed)}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={tasks.length === 0 && { flex: 1, justifyContent: 'center' }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No tasks yet. Add one to get started!
            </Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalContent, { 
            backgroundColor: colors.cardBackground, 
            borderColor: colors.border 
          }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>
            
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              placeholder="Task title"
              placeholderTextColor={colors.textSecondary}
              value={newTask.title}
              onChangeText={text => setNewTask({...newTask, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              value={newTask.description}
              onChangeText={text => setNewTask({...newTask, description: text})}
            />
            
            <Text style={[styles.label, { color: colors.text }]}>Priority:</Text>
            <View style={styles.priorityContainer}>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.priorityButton, 
                    newTask.priority === key.toLowerCase() && 
                    { backgroundColor: value.color }
                  ]}
                  onPress={() => setNewTask({
                    ...newTask, 
                    priority: key.toLowerCase() as 'low' | 'medium' | 'high'
                  })}
                >
                  <Text style={[styles.priorityText, { color: colors.text }]}>
                    {value.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton, { backgroundColor: colors.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addTaskButton, { backgroundColor: colors.primary }]}
                onPress={handleAddTask}
              >
                <Text style={styles.buttonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityText: {
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  addTaskButton: {
    backgroundColor: '#4361ee',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;