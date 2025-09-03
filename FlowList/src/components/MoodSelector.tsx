import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView
} from 'react-native';
import { Mood } from '../types';
import { MOODS } from '../utils/constants';

interface MoodSelectorProps {
  visible: boolean;
  onMoodSelect: (mood: Mood) => void;
  onClose: () => void;
  selectedMood?: string | null;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({
  visible,
  onMoodSelect,
  onClose,
  selectedMood
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>Select your mood after completing this task</Text>
          
          <ScrollView contentContainerStyle={styles.moodsContainer}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.name}
                style={[
                  styles.moodButton,
                  { backgroundColor: mood.color },
                  selectedMood === mood.emoji && styles.selectedMood
                ]}
                onPress={() => onMoodSelect(mood)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodName}>{mood.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 24,
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
  closeButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#4361ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MoodSelector;