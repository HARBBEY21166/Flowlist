import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MoodHistory from '../components/MoodHistory';
import MoodAnalytics from '../components/MoodAnalytics';
import { useTheme } from '../contexts/ThemeContext';
import { getColors } from '../constants/Colors';

const AnalyticsScreen: React.FC = () => {
  const { isDark } = useTheme();
  const colors = getColors(isDark);
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Productivity Analytics</Text>
      
      {/* Mood History */}
      <MoodHistory />
      
      {/* Advanced Mood Analytics */}
      <MoodAnalytics />
      
      {/* Placeholder for future analytics */}
      <View style={[styles.comingSoon, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.comingSoonText, { color: colors.primary }]}>
          More Analytics Coming Soon
        </Text>
        <Text style={[styles.comingSoonSubtext, { color: colors.textSecondary }]}>
          Productivity trends, task completion rates, and focus time analysis
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  comingSoon: {
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
  },
  comingSoonSubtext: {
    textAlign: 'center',
  },
});

export default AnalyticsScreen;