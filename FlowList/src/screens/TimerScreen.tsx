import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TimerScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Timer Screen - Coming Soon!</Text>
      <Text>Pomodoro timer will be implemented here</Text>
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

export default TimerScreen;