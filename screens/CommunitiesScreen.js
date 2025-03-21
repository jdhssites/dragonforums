import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

// Mock data for communities
const MOCK_COMMUNITIES = [
  {
    id: '1',
    name: 'General Discussion',
    description: 'A place to discuss anything related to dragons and the forum.',
    memberCount: 1250,
    postCount: 3456,
    avatar: null,
    isMember: true,
  },
  {
    id: '2',
    name: 'Dragon Art',
    description: 'Share and appreciate dragon artwork from around the world.',
    memberCount: 876,
    postCount: 2134,
    avatar: null,
    isMember: false,
  },
  {
    id: '3',
    name: 'Dragon Mythology',
    description: 'Explore dragon myths and legends from different cultures.',
    memberCount: 654,
    postCount: 1432,
    avatar: null,
    isMember: true,
  },
  {
    id: '4',
    name: 'Dragon Games',
    description: 'Discuss games featuring dragons as main characters or themes.',
    memberCount: 432,
    postCount: 987,
    avatar: null,
    isMember: false,
  },
  {
    id: '5',
    name: 'Dragon Literature',
    description: 'Books, stories, and poems about dragons.',
    memberCount: 321,
    postCount: 765,
    avatar: null,
    isMember: false,
  },
];

export default function CommunitiesScreen({ navigation }) {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCommunities(communities);
    } else {
      const filtered = communities.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommunities(filtered);
    }
  }, [searchQuery, communities]);

  const fetchCommunities = async () => {
    try {
      // In a real app, you would fetch communities from your API
      // For demo, we'll use mock data
      setTimeout(() => {
        setCommunities(MOCK_COMMUNITIES);
        setFilteredCommunities(MOCK_COMMUNITIES);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching communities:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommunities();
  };

  const handleJoinCommunity = (communityId) => {
    // In a real app, you would make an API call to join the community
    // For demo, we'll update the local state
    const updatedCommunities = communities.map(community => {
      if (community.id === communityId) {
        return { ...community, isMember: true };
      }
      return community;
    });
    
    setCommunities(updatedCommunities);
    setFilteredCommunities(
      filteredCommunities.map(community => {
        if (community.id === communityId) {
          return { ...community, isMember: true };
        }
        return community;
      })
    );
  };

  const renderCommunityItem = ({ item }) => {
    // Get first letter of community name for avatar placeholder
    const firstLetter = item.name.charAt(0);

    return (
      <TouchableOpacity
        style={styles.communityCard}
        onPress={() => navigation.navigate('Community', { communityId: item.id })}
      >
        <View style={styles.communityHeader}>
          <View style={styles.communityAvatar}>
            <Text style={styles.communityAvatarText}>{firstLetter}</Text>
          </View>
          <View style={styles.communityInfo}>
            <Text style={styles.communityName}>{item.name}</Text>
            <View style={styles.communityStats}>
              <Text style={styles.communityStatText}>
                {item.memberCount} members
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.communityStatText}>
                {item.postCount} posts
              </Text>
            </View>
          </View>
          {user && (
            <TouchableOpacity
              style={[
                styles.joinButton,
                item.isMember && styles.joinedButton
              ]}
              onPress={() => handleJoinCommunity(item.id)}
              disabled={item.isMember}
            >
              <Text style={styles.joinButtonText}>
                {item.isMember ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.communityDescription}>{item.description}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {user && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateCommunity')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create Community</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {searchQuery.length > 0
                ? 'No communities found matching your search'
                : 'No communities available'}
            </Text>
            {user && searchQuery.length === 0 && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateCommunity')}
              >
                <Text style={styles.emptyButtonText}>Create a community</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 18, 18, 0.8)',
    borderRadius: 20,
    margin: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.3)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  createButton: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContent: {
    padding: 12,
    paddingTop: 0,
  },
  communityCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  communityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  communityAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStatText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  dot: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginHorizontal: 4,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinedButton: {
    backgroundColor: 'rgba(127, 29, 29, 0.3)',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  communityDescription: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});