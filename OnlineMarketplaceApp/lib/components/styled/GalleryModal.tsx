import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Image, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useGallery } from '../../contexts/GalleryContext';
import { useTheme } from '../../contexts/ThemeContext';
import { commonStyles } from '../../constants/Theme';
import { Title, BodyText, Button } from './StyledComponents';
import type { GalleryImage } from '../../contexts/GalleryContext';

interface GalleryModalProps {
  visible: boolean;
  onClose: () => void;
  onImageSelect: (imageUrl: string) => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({
  visible,
  onClose,
  onImageSelect,
}) => {
  const { galleryImages, isLoading } = useGallery();
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const { theme } = useTheme();

  const handleImageSelect = () => {
    if (selectedImage) {
      onImageSelect(selectedImage.image_url);
      onClose();
    }
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: commonStyles.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      backgroundColor: theme.cardBgColor,
    },
    content: {
      flex: 1,
      padding: commonStyles.spacing.md,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: commonStyles.spacing.sm,
    },
    imageContainer: {
      width: '48%',
      aspectRatio: 1,
      marginBottom: commonStyles.spacing.sm,
      borderRadius: commonStyles.borderRadius.medium,
      overflow: 'hidden',
      backgroundColor: theme.cardBgColor,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedImageContainer: {
      borderColor: theme.textColor,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    footer: {
      padding: commonStyles.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      backgroundColor: theme.cardBgColor,
    },
    footerContent: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: commonStyles.spacing.md,
    },
    cancelButton: {
      backgroundColor: 'transparent',
    },
    cancelText: {
      color: theme.textColor,
      textDecorationLine: 'underline',
    },
    selectButton: {
      backgroundColor: theme.textColor,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Title>Dit galleri</Title>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.textColor} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.textColor} />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.gridContainer}>
              {galleryImages.map((image) => (
                <TouchableOpacity
                  key={image.public_id}
                  style={[
                    styles.imageContainer,
                    selectedImage?.public_id === image.public_id && styles.selectedImageContainer,
                  ]}
                  onPress={() => setSelectedImage(image)}
                >
                  <Image
                    source={{ uri: image.image_url }}
                    style={styles.image}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Button
              onPress={onClose}
              variant="secondary"
              style={styles.cancelButton}
            >
              <BodyText style={styles.cancelText}>Annuller</BodyText>
            </Button>
            <Button
              onPress={handleImageSelect}
              variant="primary"
              style={styles.selectButton}
              disabled={!selectedImage}
            >
              <BodyText style={{ color: 'white' }}>Vælg billede</BodyText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 