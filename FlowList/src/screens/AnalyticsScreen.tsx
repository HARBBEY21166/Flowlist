import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MoodHistory from '../components/MoodHistory';
import MoodAnalytics from '../components/MoodAnalytics';
import { useDarkMode } from '../hooks/useDarkMode';
import { getColors } from '../constants/Colors';


const AnalyticsScreen: React.FC = () => {
  const { isDark, toggleDarkMode, setDarkMode, isLoaded } = useDarkMode();
    const colors = getColors(isDark);
  return (
<ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.header}>Productivity Analytics</Text>
      
      {/* Mood History */}
      <MoodHistory />
      
      {/* Advanced Mood Analytics */}
      <MoodAnalytics />
      
      {/* Placeholder for future analytics */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>More Analytics Coming Soon</Text>
        <Text style={styles.comingSoonSubtext}>
          Productivity trends, task completion rates, and focus time analysis
        </Text>
      </View>
    </ScrollView>
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
  comingSoon: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4361ee',
  },
  comingSoonSubtext: {
    textAlign: 'center',
    color: '#666',
  },
});

export default AnalyticsScreen;