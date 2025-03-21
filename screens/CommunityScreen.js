import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { communitiesAPI, postsAPI } from '../services/api';
import { COLORS, API_URL } from '../config';

export default function CommunityScreen({ route, navigation }) {
  const { communityId } = route.params;
  const { user } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  
  const fetchPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      const data = await communitiesAPI.getCommunityPosts(communityId);
      setPosts(data.posts);
      setPostsLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPostsLoading(false);
      setRefreshing(false);
    }
  }, [communityId]);
  
  // Use useCallback to memoize the fetchCommunity function
  const fetchCommunity = useCallback(async () => {
    try {
      setLoading(true);
      const data = await communitiesAPI.getCommunity(communityId);
      
      setCommunity(data.community);
      setMembers(data.members || []);
      setIsMember(data.community.is_member);
      
      // Fetch posts if user is a member or community is public
      if (!data.community.is_private || data.community.is_member) {
        fetchPosts();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching community:', error);
      Alert.alert('Error', 'Failed to load community. Please try again.');
      setLoading(false);
    }
  }, [communityId, fetchPosts]); // Add communityId and fetchPosts as dependencies
  
  useEffect(() => {
    fetchCommunity();
  }, [fetchCommunity]); // Add fetchCommunity as a dependency
  
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCommunity();
  }, [fetchCommunity]);
  
  const handleJoinCommunity = async () => {
    try {
      await communitiesAPI.joinCommunity(communityId);
      setIsMember(true);
      setCommunity({
        ...community,
        member_count: community.member_count + 1
      });
      
      // Fetch posts after joining
      fetchPosts();
    } catch (error) {
      console.error('Error joining community:', error);
      Alert.alert('Error', 'Failed to join community. Please try again.');
    }
  };
  
  const handleLeaveCommunity = async () => {
    Alert.alert(
      'Leave Community',
      'Are you sure you want to leave this community?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await communitiesAPI.leaveCommunity(communityId);
              setIsMember(false);
              setCommunity({
                ...community,
                member_count: community.member_count - 1
              });
            } catch (error) {
              console.error('Error leaving community:', error);
              Alert.alert('Error', 'Failed to leave community. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleLikePost = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await postsAPI.unlikePost(postId);
      } else {
        await postsAPI.likePost(postId);
      }
      
      // Update post in the list
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            liked_by_user: !isLiked
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      Alert.alert('Error', 'Failed to like/unlike post. Please try again.');
    }
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
                {item.username.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.postContent}>
          <Text style={styles.postText} numberOfLines={3}>{item.content}</Text>
          {item.image && (
            <Image 
              source={{ uri: `${API_URL}/assets/uploads/${item.image}` }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
        </View>
        
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePost(item.id, item.liked_by_user)}
          >
            <Ionicons 
              name={item.liked_by_user ? "heart" : "heart-outline"} 
              size={20} 
              color={item.liked_by_user ? COLORS.primary : "#9ca3af"} 
            />
            <Text style={[
              styles.actionText,
              item.liked_by_user && styles.actionTextActive
            ]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderMemberItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.memberItem}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    >
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {item.username.charAt(0)}
        </Text>
      </View>
      <Text style={styles.memberName}>{item.username}</Text>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }
  
  if (!community) {
    return (
      <SafeAreaView style={styles.notFoundContainer} edges={['bottom']}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.textMuted} />
        <Text style={styles.notFoundText}>Community not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id.toString()}
        ListHeaderComponent={() => (
          <>
            <View style={styles.communityHeader}>
              <View style={styles.bannerContainer}>
                {community.banner ? (
                  <Image 
                    source={{ uri: `${API_URL}/assets/communities/${community.banner}` }} 
                    style={styles.banner}
                    resizeMode="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={['#1a1a1a', '#2d1a1a', '#1a1a1a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.bannerGradient}
                  />
                )}
                <View style={styles.bannerOverlay} />
              </View>
              
              <View style={styles.communityInfo}>
                <View style={styles.communityAvatar}>
                  {community.avatar ? (
                    <Image 
                      source={{ uri: `${API_URL}/assets/communities/${community.avatar}` }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.communityAvatarText}>
                      {community.name.charAt(0)}
                    </Text>
                  )}
                </View>
                
                <View style={styles.communityDetails}>
                  <Text style={styles.communityName}>{community.name}</Text>
                  <View style={styles.communityStats}>
                    <Text style={styles.communityStat}>
                      {community.member_count} members
                    </Text>
                    <Text style={styles.communityStat}>
                      {community.post_count} posts
                    </Text>
                  </View>
                </View>
                
                {user && (
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      isMember && styles.leaveButton
                    ]}
                    onPress={isMember ? handleLeaveCommunity : handleJoinCommunity}
                  >
                    <Text style={styles.joinButtonText}>
                      {isMember ? 'Leave' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {community.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.description}>{community.description}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.membersSection}>
              <Text style={styles.sectionTitle}>Members</Text>
              <FlatList
                data={members.slice(0, 5)}
                renderItem={renderMemberItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.membersList}
                ListEmptyComponent={() => (
                  <Text style={styles.emptyText}>No members yet</Text>
                )}
              />
              {members.length > 5 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Members</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.postsSection}>
              <Text style={styles.sectionTitle}>Posts</Text>
              
              {user && isMember && (
                <TouchableOpacity 
                  style={styles.createPostButton}
                  onPress={() => navigation.navigate('Post', { 
                    mode: 'create',
                    preselectedCommunity: {
                      id: community.id,
                      name: community.name
                    }
                  })}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createPostGradient}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.createPostText}>Create Post</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {community.is_private && !isMember ? (
                <View style={styles.privateContainer}>
                  <Ionicons name="lock-closed" size={40} color={COLORS.textMuted} />
                  <Text style={styles.privateText}>
                    This is a private community
                  </Text>
                  <Text style={styles.privateSubtext}>
                    Join this community to see its posts
                  </Text>
                  
                  {user && (
                    <TouchableOpacity
                      style={styles.joinPrivateButton}
                      onPress={handleJoinCommunity}
                    >
                      <Text style={styles.joinPrivateButtonText}>
                        Join Community
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : postsLoading ? (
                <View style={styles.loadingPostsContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingPostsText}>Loading posts...</Text>
                </View>
              ) : posts.length === 0 ? (
                <View style={styles.emptyPostsContainer}>
                  <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.emptyPostsText}>No posts yet</Text>
                  
                  {user && isMember && (
                    <TouchableOpacity 
                      style={styles.createFirstPostButton}
                      onPress={() => navigation.navigate('Post', { 
                        mode: 'create',
                        preselectedCommunity: {
                          id: community.id,
                          name: community.name
                        }
                      })}
                    >
                      <Text style={styles.createFirstPostText}>
                        Create the first post
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          </>
        )}
        ListEmptyComponent={() => (
          !postsLoading && isMember && posts.length === 0 ? (
            <View style={styles.emptyPostsContainer}>
              <Ionicons name="document-text-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyPostsText}>No posts yet</Text>
              
              {user && isMember && (
                <TouchableOpacity 
                  style={styles.createFirstPostButton}
                  onPress={() => navigation.navigate('Post', { 
                    mode: 'create',
                    preselectedCommunity: {
                      id: community.id,
                      name: community.name
                    }
                  })}
                >
                  <Text style={styles.createFirstPostText}>
                    Create the first post
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContent}
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  notFoundText: {
    color: COLORS.text,
    fontSize: 18,
    marginTop: 12,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  communityHeader: {
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: 12,
  },
  bannerContainer: {
    height: 150,
    position: 'relative',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  communityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  communityAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
    borderWidth: 3,
    borderColor: COLORS.background,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  communityAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  communityDetails: {
    flex: 1,
    marginLeft: 12,
  },
  communityName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  communityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityStat: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginRight: 12,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  leaveButton: {
    backgroundColor: 'rgba(127, 29, 29, 0.5)',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    padding: 16,
    paddingTop: 0,
  },
  description: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  membersSection: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  membersList: {
    paddingVertical: 8,
  },
  memberItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberName: {
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'center',
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 12,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
    padding: 12,
  },
  postsSection: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 16,
    paddingBottom: 8,
  },
  createPostButton: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  createPostText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  privateContainer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  privateText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  privateSubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  joinPrivateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinPrivateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingPostsContainer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  loadingPostsText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
  emptyPostsContainer: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  emptyPostsText: {
    color: COLORS.text,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  createFirstPostButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createFirstPostText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    marginHorizontal: 16,
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
  date: {
    color: COLORS.textMuted,
    fontSize: 12,
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
  actionTextActive: {
    color: COLORS.primary,
  },
});