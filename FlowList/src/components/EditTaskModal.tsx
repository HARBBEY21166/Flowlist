import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { Task } from '../types';
import { PRIORITIES } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';

interface EditTaskModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  visible, 
  task, 
  onClose, 
  onSave 
}) => {
  const { updateTask } = useData();
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('general');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  const handleDateChange = (event: any, selectedDate?: Date): void => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    if (!task) return;

    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        dueDate: dueDate ? dueDate.getTime() : null
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task');
    }
  };

  const handleClose = (): void => {
    // Reset form
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setCategory(task.category);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Edit Task</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={[styles.saveButtonText, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              placeholder="Task title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              placeholder="Task description (optional)"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            <Text style={[styles.label, { color: colors.text }]}>Due Date (optional)</Text>
            <TouchableOpacity 
              style={[styles.input, { 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[!dueDate && { color: colors.textSecondary }, { color: colors.text }]}>
                {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Select due date'}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display={isDark ? "spinner" : "default"}
                themeVariant={isDark ? "dark" : "light"}
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity 
              style={styles.clearDateButton}
              onPress={() => setDueDate(null)}
              disabled={!dueDate}
            >
              <Text style={[
                styles.clearDateText, 
                { color: !dueDate ? colors.textSecondary : colors.primary }
              ]}>
                Clear Due Date
              </Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text }]}>Priority</Text>
            <View style={styles.priorityContainer}>
              {Object.entries(PRIORITIES).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.priorityButton,
                    priority === key.toLowerCase() && 
                    { backgroundColor: value.color }
                  ]}
                  onPress={() => setPriority(key.toLowerCase() as 'low' | 'medium' | 'high')}
                >
                  <Text style={styles.priorityText}>{value.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.text }]}>Category</Text>
            <TextInput
              style={[styles.input, { 
                color: colors.text, 
                backgroundColor: colors.background,
                borderColor: colors.border 
              }]}
              placeholder="Category (e.g., work, personal)"
              placeholderTextColor={colors.textSecondary}
              value={category}
              onChangeText={setCategory}
              maxLength={50}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  priorityText: {
    color: 'white',
    fontWeight: 'bold',
  },
  clearDateButton: {
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
  },
  clearDateText: {
    fontSize: 14,
  },
});

export default EditTaskModal;