import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../config';

// Mock data for posts
const MOCK_POSTS = [
  {
    id: '1',
    content: 'Just joined Dragon Forums! Excited to be part of this community.',
    user: {
      id: '2',
      username: 'DragonMaster',
      avatar: null
    },
    community: {
      id: '1',
      name: 'General Discussion'
    },
    likes: 15,
    comments: 3,
    created_at: '2023-05-15T14:30:00Z',
    image: null
  },
  {
    id: '2',
    content: 'Check out this amazing dragon artwork I found!',
    user: {
      id: '3',
      username: 'ArtLover',
      avatar: null
    },
    community: {
      id: '2',
      name: 'Dragon Art'
    },
    likes: 42,
    comments: 7,
    created_at: '2023-05-14T10:15:00Z',
    image: 'https://via.placeholder.com/400x300'
  },
  {
    id: '3',
    content: 'What\'s your favorite dragon from mythology? Mine is the Welsh dragon, Y Ddraig Goch!',
    user: {
      id: '4',
      username: 'MythologyFan',
      avatar: null
    },
    community: {
      id: '3',
      name: 'Dragon Mythology'
    },
    likes: 28,
    comments: 12,
    created_at: '2023-05-13T18:45:00Z',
    image: null
  },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // In a real app, you would fetch posts from your API
      // For demo, we'll use mock data
      setTimeout(() => {
        setPosts(MOCK_POSTS);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderPostItem = ({ item }) => {
    const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    return (
      <TouchableOpacity 
        style={styles.postCard}
        onPress={() => navigation.navigate('Post', { postId: item.id })}
      >
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user.username.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.username}>{item.user.username}</Text>
              <View style={styles.postMeta}>
                <Text style={styles.community}>{item.community.name}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.date}>{formattedDate}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.postContent}>
          <Text style={styles.postText}>{item.content}</Text>
          {item.image && (
            <Image 
              source={{ uri: item.image }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        <View style={styles.postFooter}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="heart-outline" size={20} color="#9ca3af" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {user && (
        <TouchableOpacity 
          style={styles.createPostButton}
          onPress={() => navigation.navigate('Post', { mode: 'create' })}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createPostGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.createPostText}>Create Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={posts}
        renderItem={renderPostItem}
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
            <MaterialCommunityIcons 
              name="post-outline" 
              size={60} 
              color={COLORS.textMuted} 
            />
            <Text style={styles.emptyText}>No posts yet</Text>
            {user && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('Post', { mode: 'create' })}
              >
                <Text style={styles.emptyButtonText}>Create the first post</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
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
  listContent: {
    padding: 12,
  },
  createPostButton: {
    margin: 12,
    marginBottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  createPostText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  postCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(127, 29, 29, 0.1)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  username: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  community: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  dot: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginHorizontal: 4,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    padding: 12,
  },
  postText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 29, 29, 0.1)',
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginRight: 16,
  },
  actionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
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