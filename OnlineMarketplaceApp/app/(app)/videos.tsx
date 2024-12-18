import React, { useState, useRef, useCallback } from 'react';
import { View, Alert, Platform, FlatList, TouchableOpacity, Image, ViewStyle, TextStyle, ImageStyle, Dimensions, Switch } from 'react-native';
import { Modalize } from 'react-native-modalize';
import { useVideo } from '../../lib/contexts/VideoContext';
import { useWebsite } from '../../lib/contexts/WebsiteContext';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { getYouTubeThumbnail, getYouTubeVideoID, getYouTubeEmbedUrl } from '../../lib/utils/videoUtils';
import { VideoData } from '../../types/video';
import { AntDesign } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import {
  Container,
  Title,
  BodyText,
  Button,
  Input,
} from '../../lib/components/styled/StyledComponents';
import { commonStyles } from '../../lib/constants/Theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoFormState {
  title: string;
  description: string;
  video_url: string;
  is_public: boolean;
}

export default function Videos() {
  const { videos, addVideo, updateVideo, deleteVideo, fetchVideos } = useVideo();
  const { selectedWebsite } = useWebsite();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoData | null>(null);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [formState, setFormState] = useState<VideoFormState>({
    title: '',
    description: '',
    video_url: '',
    is_public: true,
  });

  const addModalRef = useRef<Modalize>(null);
  const editModalRef = useRef<Modalize>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
  }, [fetchVideos]);

  const handleAddVideo = async () => {
    try {
      if (!selectedWebsite) {
        Alert.alert('Error', 'No website selected');
        return;
      }

      await addVideo({
        ...formState,
        website_id: selectedWebsite.id,
        is_public: formState.is_public ? 1 : 0,
      });

      addModalRef.current?.close();
      Alert.alert('Success', 'Video added successfully');
      setFormState({
        title: '',
        description: '',
        video_url: '',
        is_public: true,
      });
    } catch (error) {
      console.error('Error adding video:', error);
      Alert.alert('Error', 'Failed to add video');
    }
  };

  const handleUpdateVideo = async () => {
    try {
      if (!editingVideo) return;

      await updateVideo({
        id: editingVideo.id,
        title: formState.title,
        description: formState.description,
        video_url: formState.video_url,
        is_public: formState.is_public ? 1 : 0,
      });

      editModalRef.current?.close();
      Alert.alert('Success', 'Video updated successfully');
      setEditingVideo(null);
    } catch (error) {
      console.error('Error updating video:', error);
      Alert.alert('Error', 'Failed to update video');
    }
  };

  const confirmDelete = () => {
    if (!editingVideo) return;

    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVideo(editingVideo.id);
              editModalRef.current?.close();
              setEditingVideo(null);
            } catch (error) {
              console.error('Error deleting video:', error);
              Alert.alert('Error', 'Failed to delete video');
            }
          },
        },
      ]
    );
  };

  const handleEditPress = (video: VideoData) => {
    setEditingVideo(video);
    setFormState({
      title: video.title || '',
      description: video.description || '',
      video_url: video.video_url,
      is_public: video.is_public,
    });
    editModalRef.current?.open();
  };

  const renderVideoItem = ({ item }: { item: VideoData }) => {
    const thumbnail = getYouTubeThumbnail(item.video_url);
    const videoId = getYouTubeVideoID(item.video_url);

    return (
      <View style={styles.videoCard}>
        <TouchableOpacity
          style={styles.videoContent}
          onPress={() => handleEditPress(item)}
        >
          {thumbnail && (
            <Image
              source={{ uri: thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
          <View style={styles.videoInfo}>
            <BodyText style={styles.videoTitle} numberOfLines={1}>
              {item.title || 'Untitled Video'}
            </BodyText>
            <BodyText style={styles.videoId} numberOfLines={1}>
              {videoId || 'Invalid URL'}
            </BodyText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPress(item)}
        >
          <AntDesign name="edit" size={20} color={theme.textColor} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderModalContent = (isEditing: boolean) => {
    const embedUrl = getYouTubeEmbedUrl(formState.video_url);
    const videoId = getYouTubeVideoID(formState.video_url);
    
    return (
      <Container style={styles.modalContent}>
        <Title style={styles.modalTitle}>
          {isEditing ? 'Edit Video' : 'Add New Video'}
        </Title>

        <View style={styles.inputGroup}>
          <Input
            placeholder="Title"
            value={formState.title}
            onChangeText={(value) => setFormState(prev => ({ ...prev, title: value }))}
            style={styles.input}
          />
        </View>

        <View style={styles.inputGroup}>
          <Input
            placeholder="Description"
            value={formState.description}
            onChangeText={(value) => setFormState(prev => ({ ...prev, description: value }))}
            multiline
            style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: commonStyles.spacing.sm }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <Input
            placeholder="YouTube URL"
            value={formState.video_url}
            onChangeText={(value) => setFormState(prev => ({ ...prev, video_url: value }))}
            style={styles.input}
          />
        </View>

        {videoId && (
          <View style={styles.embedContainer}>
            <WebView
              source={{
                html: `
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body { margin: 0; background-color: black; }
                        iframe { width: 100%; height: 100%; border: none; }
                      </style>
                    </head>
                    <body>
                      <iframe 
                        src="https://www.youtube.com/embed/${videoId}?playsinline=1"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                      </iframe>
                    </body>
                  </html>
                `
              }}
              style={styles.embedVideo}
              scrollEnabled={false}
              bounces={false}
              androidLayerType="hardware"
            />
          </View>
        )}

        <View style={styles.switchContainer}>
          <BodyText>Public</BodyText>
          <Switch
            value={formState.is_public}
            onValueChange={(value) => setFormState(prev => ({ ...prev, is_public: value }))}
            ios_backgroundColor={theme.borderColor}
            trackColor={{ false: theme.borderColor, true: '#000' }}
            thumbColor={'white'}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={isEditing ? handleUpdateVideo : handleAddVideo}
            variant="primary"
            style={[styles.submitButton, { backgroundColor: '#000' }]}
          >
            <BodyText style={{ color: 'white', fontWeight: '600' }}>
              {isEditing ? 'Update Video' : 'Add Video'}
            </BodyText>
          </Button>

          {isEditing && (
            <Button
              onPress={confirmDelete}
              variant="primary"
              style={[styles.deleteButton, { backgroundColor: theme.errorColor }]}
            >
              <BodyText style={{ color: 'white', fontWeight: '600' }}>
                Delete Video
              </BodyText>
            </Button>
          )}
        </View>
      </Container>
    );
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    } as ViewStyle,
    videoCard: {
      backgroundColor: 'white',
      borderRadius: commonStyles.borderRadius.medium,
      marginBottom: commonStyles.spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.borderColor,
      flexDirection: 'row' as const,
      alignItems: 'center',
    } as ViewStyle,
    videoContent: {
      flex: 1,
      flexDirection: 'row' as const,
      alignItems: 'center',
    } as ViewStyle,
    thumbnail: {
      width: 120,
      height: 80,
    } as ImageStyle,
    videoInfo: {
      flex: 1,
      padding: commonStyles.spacing.md,
    } as ViewStyle,
    videoTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: commonStyles.spacing.xs,
    } as TextStyle,
    videoId: {
      fontSize: 14,
      color: theme.textSecondary,
    } as TextStyle,
    modalContent: {
      padding: commonStyles.spacing.lg,
    } as ViewStyle,
    modalTitle: {
      ...commonStyles.typography.h2,
      marginBottom: commonStyles.spacing.xl,
      textAlign: 'center',
      fontWeight: '600',
    } as TextStyle,
    inputGroup: {
      marginBottom: commonStyles.spacing.md,
    } as ViewStyle,
    input: {
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: commonStyles.borderRadius.medium,
      padding: commonStyles.spacing.sm,
      backgroundColor: 'white',
      height: 45,
      fontSize: 16,
      textAlign: 'left',
      paddingHorizontal: commonStyles.spacing.md,
      textAlignVertical: 'center',
    } as TextStyle,
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: commonStyles.spacing.lg,
      paddingVertical: commonStyles.spacing.sm,
    } as ViewStyle,
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: commonStyles.spacing.md,
    } as ViewStyle,
    submitButton: {
      flex: 1,
    } as ViewStyle,
    deleteButton: {
      flex: 1,
    } as ViewStyle,
    addButton: {
      position: 'absolute',
      bottom: commonStyles.spacing.lg,
      right: commonStyles.spacing.lg,
      backgroundColor: '#000',
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    } as ViewStyle,
    editButton: {
      padding: commonStyles.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    } as ViewStyle,
    embedContainer: {
      height: 200,
      marginBottom: commonStyles.spacing.lg,
      borderRadius: commonStyles.borderRadius.medium,
      overflow: 'hidden',
      backgroundColor: 'black',
    } as ViewStyle,
    embedVideo: {
      flex: 1,
      backgroundColor: 'black',
      opacity: 0.99,
    } as ViewStyle,
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: commonStyles.spacing.lg,
    } as ViewStyle,
    emptyIconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.cardBgColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: commonStyles.spacing.lg,
      borderWidth: 1,
      borderColor: theme.borderColor,
    } as ViewStyle,
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: commonStyles.spacing.sm,
      textAlign: 'center',
      color: theme.textColor,
    } as TextStyle,
    emptySubtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: theme.textSecondary,
      marginBottom: commonStyles.spacing.xl,
      paddingHorizontal: commonStyles.spacing.xl,
    } as TextStyle,
    themePickerButton: {
      position: 'absolute',
      bottom: commonStyles.spacing.lg,
      left: commonStyles.spacing.lg,
      backgroundColor: theme.cardBgColor,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.borderColor,
    } as ViewStyle,
  };

  return (
    <Container>
      {videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <AntDesign name="videocamera" size={32} color={theme.textColor} />
          </View>
          <BodyText style={styles.emptyTitle}>
            Ingen videoer på din hjemmeside endnu
          </BodyText>
          <BodyText style={styles.emptySubtitle}>
            Tilføj YouTube-videoer til din hjemmeside ved at indsætte YouTube-links. Dine besøgende vil kunne se videoerne direkte på din hjemmeside.
          </BodyText>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: commonStyles.spacing.md }}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <TouchableOpacity
        style={styles.themePickerButton}
        onPress={() => setShowThemePicker(true)}
      >
        <AntDesign name="skin" size={24} color={theme.textColor} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addModalRef.current?.open()}
      >
        <AntDesign name="plus" size={24} color="white" />
      </TouchableOpacity>

      <Modalize
        ref={addModalRef}
        modalHeight={SCREEN_HEIGHT * 0.8}
        modalStyle={{
          backgroundColor: theme.backgroundColor,
          borderTopLeftRadius: commonStyles.borderRadius.xl,
          borderTopRightRadius: commonStyles.borderRadius.xl,
        }}
      >
        {renderModalContent(false)}
      </Modalize>

      <Modalize
        ref={editModalRef}
        modalHeight={SCREEN_HEIGHT * 0.8}
        modalStyle={{
          backgroundColor: theme.backgroundColor,
          borderTopLeftRadius: commonStyles.borderRadius.xl,
          borderTopRightRadius: commonStyles.borderRadius.xl,
        }}
      >
        {renderModalContent(true)}
      </Modalize>

      {showThemePicker && (
        <Modalize
          onClose={() => setShowThemePicker(false)}
          modalHeight={SCREEN_HEIGHT * 0.6}
          modalStyle={{
            backgroundColor: theme.backgroundColor,
            borderTopLeftRadius: commonStyles.borderRadius.xl,
            borderTopRightRadius: commonStyles.borderRadius.xl,
          }}
        >
          <View style={{ padding: commonStyles.spacing.lg }}>
            <Title style={{ marginBottom: commonStyles.spacing.lg, textAlign: 'center' }}>
              Vælg et tema
            </Title>
            {/* Theme picker content will go here */}
          </View>
        </Modalize>
      )}
    </Container>
  );
} 