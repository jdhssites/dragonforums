import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config';

// Mock data for trending posts
const MOCK_TRENDING = [
  {
    id: '1',
    title: 'The History of Dragons in Asian Culture',
    community: 'Dragon Mythology',
    likes: 245,
    comments: 42
  },
  {
    id: '2',
    title: 'Top 10 Dragon Games of All Time',
    community: 'Dragon Games',
    likes: 189,
    comments: 37
  },
  {
    id: '3',
    title: 'How to Draw a Realistic Dragon - Tutorial',
    community: 'Dragon Art',
    likes: 156,
    comments: 28
  },
  {
    id: '4',
    title: 'Dragons in Modern Literature: A Review',
    community: 'Dragon Literature',
    likes: 132,
    comments: 24
  },
  {
    id: '5',
    title: 'The Science Behind Dragon Fire Breathing',
    community: 'General Discussion',
    likes: 118,
    comments: 31
  }
];

export default function ExploreScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      // In a real app, you would fetch trending posts from your API
      // For demo, we'll use mock data
      setTimeout(() => {
        setTrending(MOCK_TRENDING);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrending();
  };

  const handleSearch = () => {
    // In a real app, you would navigate to search results
    console.log('Searching for:', searchQuery);
    // navigation.navigate('SearchResults', { query: searchQuery });
  };

  const renderTrendingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.trendingItem}
      onPress={() => navigation.navigate('Post', { postId: item.id })}
    >
      <View style={styles.trendingContent}>
        <Text style={styles.trendingTitle}>{item.title}</Text>
        <Text style={styles.trendingCommunity}>in {item.community}</Text>
      </View>
      <View style={styles.trendingStats}>
        <View style={styles.trendingStat}>
          <Ionicons name="heart" size={16} color={COLORS.primary} />
          <Text style={styles.trendingStatText}>{item.likes}</Text>
        </View>
        <View style={styles.trendingStat}>
          <Ionicons name="chatbubble" size={16} color={COLORS.textMuted} />
          <Text style={styles.trendingStatText}>{item.comments}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          placeholder="Search Dragon Forums..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Topics</Text>
      </View>

      <FlatList
        data={trending}
        renderItem={renderTrendingItem}
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.3)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 12,
  },
  trendingItem: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  trendingContent: {
    marginBottom: 8,
  },
  trendingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendingCommunity: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  trendingStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  trendingStatText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
});