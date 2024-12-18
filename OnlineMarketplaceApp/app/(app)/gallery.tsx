import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, Dimensions, Platform } from 'react-native';
import { useGallery } from '../../lib/contexts/GalleryContext';
import { ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../lib/utils/imageUtils';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { Container, Title, BodyText, Button } from '../../lib/components/styled/StyledComponents';
import { commonStyles } from '../../lib/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

interface GalleryImage {
  Id: string;
  image_url: string;
  public_id: string;
  is_favorite: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const GRID_SPACING = 12;
const HORIZONTAL_PADDING = commonStyles.spacing.md;
const GRID_WIDTH = screenWidth - (HORIZONTAL_PADDING * 2);
const ITEM_WIDTH = (GRID_WIDTH - GRID_SPACING) / 2;

export default function Gallery() {
  const { galleryImages, favoriteImages, isLoading, uploadImage: addGalleryImage, updateFavorites, deleteImage } = useGallery();
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { theme } = useTheme();
  const favoritesScrollRef = useRef<ScrollView>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  // Filter out favorite images from the main gallery
  const nonFavoriteImages = galleryImages.filter(img => !img.is_favorite);

  const handleImagePress = (image: GalleryImage) => {
    setSelectedImage(image);
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteImage(image.public_id);
              setSelectedImage(null);
              Alert.alert('Success', 'Image deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleImagePick = async () => {
    let hasStartedUpload = false;
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        hasStartedUpload = true;
        setUploading(true);
        
        console.log('Starting image upload process...');
        const uploadResult = await uploadImage(result.assets[0].uri).catch(error => {
          console.error('Upload failed:', error);
          return null;
        });

        if (!uploadResult) {
          throw new Error('Upload failed');
        }

        console.log('Image uploaded, adding to gallery...');
        await addGalleryImage(uploadResult.url, uploadResult.public_id).catch(error => {
          console.error('Failed to add to gallery:', error);
          throw error;
        });

        console.log('Upload process completed successfully');
        Alert.alert('Success', 'Image uploaded successfully');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      if (hasStartedUpload) {
        console.log('Clearing upload state');
        setUploading(false);
      }
    }
  };

  const toggleFavorite = async (imageId: string) => {
    try {
      const currentFavorites = favoriteImages.map(img => img.Id);
      const isCurrentlyFavorite = currentFavorites.includes(imageId);
      
      let newFavorites: string[];
      if (isCurrentlyFavorite) {
        newFavorites = currentFavorites.filter(id => id !== imageId);
      } else {
        if (currentFavorites.length >= 4) {
          Alert.alert('Limit Reached', 'You can only have up to 4 favorite images');
          return;
        }
        newFavorites = [...currentFavorites, imageId];
      }
      
      await updateFavorites(newFavorites);
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const renderImage = (item: GalleryImage, isFavorite: boolean = false) => {
    const imageKey = `${item.Id}-${isFavorite ? 'fav' : 'grid'}`;
    
    return (
      <TouchableOpacity 
        key={imageKey}
        style={[
          styles.imageContainer,
          { backgroundColor: theme.cardBgColor },
          isFavorite ? styles.favoriteImageContainer : styles.gridImageContainer
        ]}
        onPress={() => handleImagePress(item)}
      >
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.image}
        />
        <TouchableOpacity 
          style={[
            styles.favoriteButton,
            item.is_favorite && styles.favoriteButtonActive
          ]}
          onPress={() => toggleFavorite(item.Id)}
        >
          <Ionicons
            name={item.is_favorite ? 'heart' : 'heart-outline'}
            size={20}
            color={item.is_favorite ? theme.errorColor : theme.textColor}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderGridImages = () => {
    const rows = [];
    for (let i = 0; i < nonFavoriteImages.length; i += 2) {
      const isLastRow = i + 2 >= nonFavoriteImages.length;
      const isOddCount = nonFavoriteImages.length % 2 !== 0;
      
      const row = (
        <View 
          key={`row-${i}`} 
          style={[
            styles.gridRow,
            isLastRow && isOddCount && styles.lastRowOdd
          ]}
        >
          <View style={[styles.gridItem, { marginRight: GRID_SPACING / 2 }]}>
            {renderImage(nonFavoriteImages[i], false)}
          </View>
          {i + 1 < nonFavoriteImages.length && (
            <View style={[styles.gridItem, { marginLeft: GRID_SPACING / 2 }]}>
              {renderImage(nonFavoriteImages[i + 1], false)}
            </View>
          )}
        </View>
      );
      rows.push(row);
    }
    return rows;
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    setScrollPosition(contentOffset.x);
    setContainerWidth(layoutMeasurement.width);
    setContentWidth(contentSize.width);
    
    const isAtEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
    setIsScrolledToEnd(isAtEnd);
  };

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const scrollToNext = () => {
    if (!favoritesScrollRef.current) return;

    const scrollAmount = containerWidth - GRID_SPACING;
    let newPosition;

    if (isScrolledToEnd) {
      // If at the end, scroll to start
      newPosition = 0;
    } else {
      // Calculate next position
      newPosition = scrollPosition + scrollAmount;
      
      // If next position would go past the end, scroll to end
      if (newPosition + containerWidth > contentWidth) {
        newPosition = contentWidth - containerWidth;
      }
    }

    favoritesScrollRef.current.scrollTo({ x: newPosition, animated: true });
  };

  // Set initial scroll position when favorites are loaded
  useEffect(() => {
    if (favoriteImages.length > 0) {
      setTimeout(() => {
        favoritesScrollRef.current?.scrollTo({ x: -HORIZONTAL_PADDING, y: 0, animated: false });
      }, 100);
    }
  }, [favoriteImages.length]);

  if (isLoading && !uploading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.textColor} />
          <BodyText style={{ marginTop: 16 }}>Loading gallery...</BodyText>
        </View>
      </Container>
    );
  }

  if (uploading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.textColor} />
          <BodyText style={{ marginTop: 16 }}>Uploading image...</BodyText>
        </View>
      </Container>
    );
  }

  return (
    <Container style={styles.mainContainer}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {galleryImages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={48} color={theme.textColorLight} />
            <BodyText style={[styles.emptyStateText, { color: theme.textColorLight }]}>
              No images in your gallery yet
            </BodyText>
            <BodyText style={[styles.emptyStateSubtext, { color: theme.textColorLight }]}>
              Tap the + button to add some!
            </BodyText>
          </View>
        ) : (
          <>
            {favoriteImages.length > 0 && (
              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Favorites</Title>
                <View style={styles.favoritesOuterContainer}>
                  <ScrollView 
                    ref={favoritesScrollRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.favoritesContainer}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                    onLayout={handleLayout}
                  >
                    {favoriteImages.map((item, index) => (
                      <View 
                        key={item.Id} 
                        style={[
                          styles.favoriteWrapper,
                          index === favoriteImages.length - 1 && { marginRight: HORIZONTAL_PADDING + 20 }
                        ]}
                      >
                        {renderImage(item, true)}
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.scrollIndicatorContainer}>
                    <LinearGradient
                      colors={['transparent', 'rgba(255,255,255,0.8)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.gradient}
                    />
                    <TouchableOpacity 
                      style={styles.scrollIconContainer}
                      onPress={scrollToNext}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={isScrolledToEnd ? "chevron-back" : "chevron-forward"}
                        size={16} 
                        color={theme.textColorLight}
                        style={{ opacity: 0.6 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Title style={styles.sectionTitle}>All Images</Title>
              <View style={styles.gridContainer}>
                {renderGridImages()}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.textColor }]}
        onPress={handleImagePick}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.textColor} />
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.image_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <View style={styles.modalActions}>
                  <Button
                    onPress={() => {
                      toggleFavorite(selectedImage.Id);
                      setSelectedImage(null);
                    }}
                    variant="secondary"
                    style={[
                      styles.modalButton,
                      { backgroundColor: theme.cardBgColor }
                    ]}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons
                        name={selectedImage.is_favorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={selectedImage.is_favorite ? theme.errorColor : theme.textColor}
                      />
                      <BodyText style={{ marginLeft: 8 }}>
                        {selectedImage.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      </BodyText>
                    </View>
                  </Button>
                  <Button
                    onPress={() => handleDeleteImage(selectedImage)}
                    variant="primary"
                    style={[styles.modalButton, { backgroundColor: theme.errorColor }]}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="trash-outline" size={20} color="white" />
                      <BodyText style={{ color: 'white', marginLeft: 8 }}>
                        Delete Image
                      </BodyText>
                    </View>
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  container: {
    flex: 1,
  },
  section: {
    marginBottom: commonStyles.spacing.lg,
  },
  sectionTitle: {
    marginBottom: commonStyles.spacing.md,
  },
  favoritesOuterContainer: {
    marginLeft: -HORIZONTAL_PADDING,
    marginRight: -HORIZONTAL_PADDING,
    position: 'relative',
  },
  favoritesContainer: {
    paddingLeft: HORIZONTAL_PADDING,
    gap: GRID_SPACING,
  },
  favoriteWrapper: {
    width: ITEM_WIDTH,
  },
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_SPACING,
    width: '100%',
  },
  lastRowOdd: {
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: ITEM_WIDTH,
  },
  imageContainer: {
    aspectRatio: 1,
    borderRadius: commonStyles.borderRadius.medium,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  favoriteImageContainer: {
    width: '100%',
  },
  gridImageContainer: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  favoriteButtonActive: {
    backgroundColor: 'white',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: commonStyles.borderRadius.large,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: commonStyles.spacing.sm,
  },
  modalCloseButton: {
    padding: commonStyles.spacing.sm,
  },
  modalImage: {
    width: '100%',
    height: screenWidth * 0.8,
  },
  modalActions: {
    padding: commonStyles.spacing.lg,
    gap: commonStyles.spacing.sm,
  },
  modalButton: {
    width: '100%',
  },
  scrollIndicatorContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: HORIZONTAL_PADDING,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 60,
  },
  scrollIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
}); 