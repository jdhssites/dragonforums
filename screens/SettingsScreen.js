import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../config';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Text style={styles.message}>This screen is under development</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    color: COLORS.primary,
    fontSize: 16,
    textAlign: 'center',
  },
});