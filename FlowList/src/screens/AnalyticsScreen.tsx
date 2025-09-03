import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MoodHistory from '../components/MoodHistory';

const AnalyticsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Productivity Analytics</Text>
      <MoodHistory />
      
      {/* We'll add more analytics components here later */}
      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>More analytics coming soon!</Text>
        <Text>Task completion rates, productivity trends, and more...</Text>
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
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4361ee',
  },
});

export default AnalyticsScreen;