import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal
} from 'react-native';
import { useData } from '../contexts/DataContext';
import { Mood } from '../types';
import { MOODS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';
// Add TextInput import at the top
import { TextInput } from 'react-native';


interface MoodCheckScreenProps {
  visible: boolean;
  onClose: () => void;
}

const MoodCheckScreen: React.FC<MoodCheckScreenProps> = ({ visible, onClose }) => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [note, setNote] = useState('');
  const { analytics, updateTask } = useData();

  const handleMoodSelect = (mood: Mood): void => {
    setSelectedMood(mood);
  };

  const handleSave = async (): Promise<void> => {
    if (selectedMood) {
      // Create a special task for the mood check-in
      await updateTask(`mood-check-${Date.now()}`, {
        title: 'Daily Mood Check-in',
        description: note || 'No notes',
        completed: true,
        completedAt: Date.now(),
        mood: selectedMood.emoji,
        category: 'mood-check',
        priority: 'medium'
      } as any);
      
      onClose();
      setSelectedMood(null);
      setNote('');
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Daily Mood Check-in</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.question}>How are you feeling today?</Text>
          <Text style={styles.subtitle}>Select the mood that best represents your day</Text>

          <View style={styles.moodsContainer}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.name}
                style={[
                  styles.moodButton,
                  { backgroundColor: mood.color },
                  selectedMood?.emoji === mood.emoji && styles.selectedMood
                ]}
                onPress={() => handleMoodSelect(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodName}>{mood.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.notesLabel}>Add a note (optional):</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What made you feel this way today?"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[styles.saveButton, !selectedMood && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!selectedMood}
          >
            <Text style={styles.saveButtonText}>Save Mood</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  closeButton: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  content: {
    padding: 20,
  },
  question: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  moodButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedMood: {
    borderWidth: 3,
    borderColor: 'white',
    transform: [{ scale: 1.1 }],
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#4361ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MoodCheckScreen;