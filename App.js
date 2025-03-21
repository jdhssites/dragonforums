import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { 
  Ionicons, 
  MaterialCommunityIcons, 
  FontAwesome5 
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

// Import screens
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import CommunitiesScreen from './screens/CommunitiesScreen';
import CommunityScreen from './screens/CommunityScreen';
import ProfileScreen from './screens/ProfileScreen';
import PostScreen from './screens/PostScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Import context
import { AuthProvider, useAuth } from './context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom header component with the Dragon Forums branding
function CustomHeader({ title, navigation, showBackButton = false }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: '#1a1a1a' }}>
      <LinearGradient
        colors={['#1a1a1a', '#2d1a1a', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {showBackButton ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoText}>D</Text>
              </View>
              <View>
                <Text style={styles.logoTitle}>Dragon Forums</Text>
                <Text style={styles.logoSubtitle}>PORTAL</Text>
              </View>
            </View>
          )}
          
          <Text style={styles.headerTitle}>{title}</Text>
          
          <View style={styles.headerRight}>
            {user ? (
              <>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Notifications')}
                  style={styles.iconButton}
                >
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowMenu(!showMenu)}
                  style={styles.profileButton}
                >
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user.username.charAt(0)}</Text>
                  </View>
                </TouchableOpacity>
                
                {showMenu && (
                  <View style={styles.menu}>
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('Profile', { userId: user.id });
                      }}
                    >
                      <Text style={styles.menuText}>Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        navigation.navigate('Settings');
                      }}
                    >
                      <Text style={styles.menuText}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.menuItem, styles.menuItemBorder]}
                      onPress={() => {
                        setShowMenu(false);
                        logout();
                      }}
                    >
                      <Text style={styles.menuText}>Logout</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}
              >
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Communities') {
            iconName = focused ? 'account-group' : 'account-group-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'user-alt' : 'user';
            return <FontAwesome5 name={iconName} size={size-2} color={color} />;
          }
        },
        tabBarActiveTintColor: '#ef4444',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#1a1212',
          borderTopColor: 'rgba(127, 29, 29, 0.3)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        header: ({ navigation, route, options }) => {
          return (
            <CustomHeader 
              title={route.name} 
              navigation={navigation} 
            />
          );
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Communities" component={CommunitiesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main navigation container
function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          header: ({ navigation, route, options }) => {
            // Don't show header for login and register screens
            if (route.name === 'Login' || route.name === 'Register') {
              return null;
            }
            return (
              <CustomHeader 
                title={route.name} 
                navigation={navigation} 
                showBackButton={route.name !== 'MainTabs'}
              />
            );
          }
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabNavigator} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="Post" component={PostScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0a0a',
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.3)',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b91c1c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoSubtitle: {
    color: '#9ca3af',
    fontSize: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 12,
  },
  profileButton: {
    position: 'relative',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b91c1c',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menu: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 150,
    backgroundColor: '#1e1414',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    padding: 12,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(220, 38, 38, 0.1)',
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#b91c1c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    marginRight: 8,
  },
});