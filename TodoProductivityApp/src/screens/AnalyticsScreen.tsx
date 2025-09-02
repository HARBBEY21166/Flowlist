import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AnalyticsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Analytics Screen - Coming Soon!</Text>
      <Text>Productivity insights and charts will be here</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default AnalyticsScreen;