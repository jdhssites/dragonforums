import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { postsAPI, commentsAPI, communitiesAPI } from '../services/api';
import { COLORS, APP_SETTINGS, API_URL } from '../config';

export default function PostScreen({ route, navigation }) {
  const { postId, mode, preselectedCommunity } = route.params || {};
  const { user } = useAuth();
  
  // State for viewing a post
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  
  // State for creating a post
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(preselectedCommunity || null);
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(false);
  const [showCommunities, setShowCommunities] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // State for comments
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef(null);

  // Use useCallback to memoize the fetchPost function
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getPost(postId);
      setPost(data.post);
      setLiked(data.post.liked_by_user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', 'Failed to load post. Please try again.');
      setLoading(false);
    }
  }, [postId]);

  // Use useCallback to memoize the fetchComments function
  const fetchComments = useCallback(async () => {
    try {
      const data = await commentsAPI.getComments(postId);
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    }
  }, [postId]);

  const fetchCommunities = useCallback(async () => {
    try {
      setCommunitiesLoading(true);
      const data = await communitiesAPI.getCommunities();
      setCommunities(data.communities);
      setCommunitiesLoading(false);
    } catch (error) {
      console.error('Error fetching communities:', error);
      Alert.alert('Error', 'Failed to load communities. Please try again.');
      setCommunitiesLoading(false);
    }
  }, []);

  // Fetch post data
  useEffect(() => {
    if (mode === 'create') {
      // Load communities for post creation
      fetchCommunities();
      setLoading(false);
    } else if (postId) {
      fetchPost();
      fetchComments();
    } else {
      setLoading(false);
    }
  }, [postId, mode, fetchPost, fetchComments, fetchCommunities]); // Add fetchPost, fetchComments, and fetchCommunities as dependencies

  const handleLikePost = async () => {
    try {
      if (liked) {
        await postsAPI.unlikePost(postId);
        setPost({
          ...post,
          likes: post.likes - 1
        });
      } else {
        await postsAPI.likePost(postId);
        setPost({
          ...post,
          likes: post.likes + 1
        });
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      Alert.alert('Error', 'Failed to like/unlike post. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setCommentLoading(true);
      const data = await commentsAPI.createComment(postId, commentText);
      setComments([data.comment, ...comments]);
      setCommentText('');
      setCommentLoading(false);
      
      // Update post comment count
      setPost({
        ...post,
        comments: post.comments + 1
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await commentsAPI.deleteComment(commentId);
              setComments(comments.filter(comment => comment.id !== commentId));
              
              // Update post comment count
              setPost({
                ...post,
                comments: post.comments - 1
              });
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permission to upload images.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      
      // Check file size
      const fileInfo = await fetch(selectedAsset.uri).then(res => {
        return {
          size: parseInt(res.headers.get('Content-Length') || '0'),
          type: res.headers.get('Content-Type')
        };
      });
      
      if (fileInfo.size > APP_SETTINGS.maxImageSize) {
        Alert.alert('File Too Large', 'The selected image is too large. Please choose an image under 5MB.');
        return;
      }
      
      if (!APP_SETTINGS.supportedImageTypes.includes(fileInfo.type)) {
        Alert.alert('Unsupported File Type', 'Please select a JPEG, PNG, or GIF image.');
        return;
      }
      
      setImage(selectedAsset.uri);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post.');
      return;
    }
    
    if (!selectedCommunity) {
      Alert.alert('Error', 'Please select a community for your post.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const postData = {
        content,
        communityId: selectedCommunity.id,
        image
      };
      
      const response = await postsAPI.createPost(postData);
      
      setSubmitting(false);
      
      if (response.success) {
        Alert.alert('Success', 'Post created successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
      setSubmitting(false);
    }
  };

  const renderCommentItem = ({ item }) => {
    const isCurrentUserComment = user && item.user_id === user.id;
    
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentUser}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {item.username.charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.commentUsername}>{item.username}</Text>
              <Text style={styles.commentDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          {isCurrentUserComment && (
            <TouchableOpacity
              style={styles.commentDeleteButton}
              onPress={() => handleDeleteComment(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.commentContent}>{item.content}</Text>
      </View>
    );
  };

  // Render create post screen
  if (mode === 'create') {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView contentContainerStyle={styles.createPostContainer}>
            <View style={styles.createPostHeader}>
              <Text style={styles.createPostTitle}>Create Post</Text>
            </View>
            
            <TouchableOpacity
              style={styles.communitySelector}
              onPress={() => setShowCommunities(!showCommunities)}
            >
              <Text style={styles.communitySelectorLabel}>Community:</Text>
              <View style={styles.selectedCommunity}>
                {selectedCommunity ? (
                  <Text style={styles.selectedCommunityText}>
                    {selectedCommunity.name}
                  </Text>
                ) : (
                  <Text style={styles.selectedCommunityPlaceholder}>
                    Select a community
                  </Text>
                )}
                <Ionicons
                  name={showCommunities ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#9ca3af"
                />
              </View>
            </TouchableOpacity>
            
            {showCommunities && (
              <View style={styles.communitiesList}>
                {communitiesLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  communities.map(community => (
                    <TouchableOpacity
                      key={community.id}
                      style={[
                        styles.communityItem,
                        selectedCommunity && selectedCommunity.id === community.id && 
                        styles.communityItemSelected
                      ]}
                      onPress={() => {
                        setSelectedCommunity(community);
                        setShowCommunities(false);
                      }}
                    >
                      <Text style={styles.communityItemText}>{community.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
            
            <TextInput
              style={styles.contentInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#9ca3af"
              multiline
              value={content}
              onChangeText={setContent}
            />
            
            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Ionicons name="close-circle" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.createPostActions}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handlePickImage}
              >
                <Ionicons name="image-outline" size={24} color="#9ca3af" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCreatePost}
                disabled={submitting}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Post</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['bottom']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  // Render post not found
  if (!post && postId) {
    return (
      <SafeAreaView style={styles.notFoundContainer} edges={['bottom']}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.textMuted} />
        <Text style={styles.notFoundText}>Post not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Render post details
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.postContainer}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.postHeader}>
              <View style={styles.postUser}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {post.username.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.username}>{post.username}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.community}>{post.community_name}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.date}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.postContent}>
              <Text style={styles.postText}>{post.content}</Text>
              {post.image && (
                <Image
                  source={{ uri: `${API_URL}/assets/uploads/${post.image}` }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}
            </View>
            
            <View style={styles.postActions}>
              <TouchableOpacity
                style={[styles.actionButton, liked && styles.actionButtonActive]}
                onPress={handleLikePost}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={20}
                  color={liked ? COLORS.primary : "#9ca3af"}
                />
                <Text style={[styles.actionText, liked && styles.actionTextActive]}>
                  {post.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => commentInputRef.current?.focus()}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#9ca3af" />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-social-outline" size={20} color="#9ca3af" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
            </View>
            
            {comments.length > 0 ? (
              comments.map(comment => renderCommentItem({ item: comment }))
            ) : (
              <View style={styles.noCommentsContainer}>
                <Text style={styles.noCommentsText}>No comments yet</Text>
                <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
              </View>
            )}
          </ScrollView>
          
          {user && (
            <View style={styles.commentInputContainer}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {user.username.charAt(0)}
                </Text>
              </View>
              <TextInput
                ref={commentInputRef}
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#9ca3af"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                style={styles.commentSubmitButton}
                onPress={handleAddComment}
                disabled={commentLoading || !commentText.trim()}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Ionicons
                    name="send"
                    size={20}
                    color={commentText.trim() ? COLORS.primary : "#9ca3af"}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
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
  postContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  postHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.1)',
    backgroundColor: COLORS.backgroundSecondary,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  community: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  dot: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginHorizontal: 4,
  },
  date: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  postContent: {
    padding: 16,
    backgroundColor: COLORS.backgroundSecondary,
  },
  postText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  postActions: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 29, 29, 0.1)',
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    padding: 4,
  },
  actionButtonActive: {
    opacity: 1,
  },
  actionText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginLeft: 4,
  },
  actionTextActive: {
    color: COLORS.primary,
  },
  commentsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.1)',
    backgroundColor: COLORS.backgroundSecondary,
  },
  commentsTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  commentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.1)',
    backgroundColor: COLORS.backgroundSecondary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentUsername: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  commentDate: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  commentDeleteButton: {
    padding: 4,
  },
  commentContent: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  noCommentsContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
  },
  noCommentsText: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 4,
  },
  noCommentsSubtext: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(127, 29, 29, 0.1)',
    backgroundColor: COLORS.backgroundSecondary,
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    color: COLORS.text,
    marginHorizontal: 8,
  },
  commentSubmitButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Create post styles
  createPostContainer: {
    padding: 16,
  },
  createPostHeader: {
    marginBottom: 16,
  },
  createPostTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  communitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communitySelectorLabel: {
    color: COLORS.text,
    fontSize: 16,
    marginRight: 8,
  },
  selectedCommunity: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  selectedCommunityText: {
    color: COLORS.text,
    fontSize: 16,
  },
  selectedCommunityPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  communitiesList: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  communityItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(127, 29, 29, 0.1)',
  },
  communityItemSelected: {
    backgroundColor: 'rgba(127, 29, 29, 0.2)',
  },
  communityItemText: {
    color: COLORS.text,
    fontSize: 16,
  },
  contentInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 16,
    padding: 4,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addImageText: {
    color: COLORS.textMuted,
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});