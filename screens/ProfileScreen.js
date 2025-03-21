import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

export default function ProfileScreen({ navigation, route }) {
  const { user, logout } = useAuth();
  const userId = route.params?.userId || (user ? user.id : null);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user ? user.username.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.username}>{user ? user.username : 'Guest'}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Profile ID: {userId}</Text>
        <Text style={styles.message}>This screen is under development</Text>
      </View>
      
      {user && (
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  infoText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginBottom: 20,
  },
  message: {
    color: COLORS.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});