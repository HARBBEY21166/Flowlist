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

const HomeScreen: React.FC = () => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks.filter(task => !task.completed)}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks yet. Add one to get started!</Text>
          </View>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={newTask.title}
              onChangeText={text => setNewTask({...newTask, title: text})}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              multiline
              value={newTask.description}
              onChangeText={text => setNewTask({...newTask, description: text})}
            />
            
            <Text style={styles.label}>Priority:</Text>
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
                  <Text style={styles.priorityText}>{value.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.addTaskButton]}
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4361ee',
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
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
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
    borderRadius: 5,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
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
    borderRadius: 5,
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