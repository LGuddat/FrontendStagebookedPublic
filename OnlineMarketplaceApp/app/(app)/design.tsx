import React, { useState, useRef } from 'react';
import { View, ScrollView, Alert, Image, Platform, ViewStyle, TextStyle, ImageStyle, Switch, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useWebmanager } from '../../lib/contexts/WebmanagerContext';
import { useTheme } from '../../lib/contexts/ThemeContext';
import { useWebsite } from '../../lib/contexts/WebsiteContext';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@clerk/clerk-expo';
import { AntDesign, Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Modalize } from 'react-native-modalize';
import {
  Container,
  Title,
  BodyText,
  Button,
  Input,
} from '../../lib/components/styled/StyledComponents';
import { PremiumModal } from '../../lib/components/styled/PremiumModal';
import { commonStyles } from '../../lib/constants/Theme';
import { Website } from '../../types/website';

interface Theme {
  backgroundColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  accentBgColor: string;
}

const themes: { [key: number]: Theme } = {
  1: { // Light theme
    backgroundColor: '#ffffff',
    accentBgColor: '#F5F5F5',
    textColor: '#282828',
    buttonBgColor: '#eeeeee',
    buttonTextColor: '#000000',
  },
  2: { // Dark theme
    backgroundColor: '#1b1b1b',
    accentBgColor: '#1f1f1f',
    textColor: '#ffffff',
    buttonBgColor: '#282828',
    buttonTextColor: '#ffffff',
  },
  3: { // Ocean floor
    backgroundColor: '#FFEFDB',
    accentBgColor: '#79CDCD',
    textColor: '#ffffff',
    buttonBgColor: '#7AC5CD',
    buttonTextColor: '#ffffff',
  },
  4: { // Dark Navy
    backgroundColor: '#172831',
    accentBgColor: '#2D4957',
    textColor: '#ffffff',
    buttonBgColor: '#172831',
    buttonTextColor: '#ffffff',
  },
  5: { // Candy
    backgroundColor: '#F8DEF2',
    accentBgColor: '#EFB0D1',
    textColor: '#0E1A15',
    buttonBgColor: '#EA9DC5',
    buttonTextColor: '#0E1A15',
  },
  6: { // Sort & Gul
    backgroundColor: '#2B2B2B',
    accentBgColor: '#3F3F3F',
    textColor: '#ffffff',
    buttonBgColor: '#ECC936',
    buttonTextColor: '#2B2B2B',
  },
  7: { // Ørken
    backgroundColor: '#F6F3EB',
    accentBgColor: '#E8DAC9',
    textColor: '#1d1d1d',
    buttonBgColor: '#9D6F4D',
    buttonTextColor: '#ffffff',
  },
};

interface FormData {
  uri: string;
  type: string;
  name: string;
}

const freeTemplates = [
  { value: "1", label: "Lyst Tema" },
  { value: "2", label: "Mørkt Tema" },
];

const enhancedTemplates = [
  { value: "3", label: "Havbund" },
  { value: "4", label: "Marineblå" },
  { value: "5", label: "Slik" },
  { value: "6", label: "Stjerner" },
  { value: "7", label: "Oase" },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  section: {
    padding: commonStyles.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  sectionTitle: {
    ...commonStyles.typography.h2,
    marginBottom: commonStyles.spacing.md,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: commonStyles.spacing.md,
  },
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
  },
  imageSection: {
    marginBottom: commonStyles.spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: commonStyles.spacing.sm,
    borderRadius: commonStyles.borderRadius.medium,
    resizeMode: 'cover',
  },
  faviconPreview: {
    width: 64,
    height: 64,
    marginBottom: commonStyles.spacing.sm,
    borderRadius: commonStyles.borderRadius.medium,
    resizeMode: 'cover',
  },
  uploadButton: {
    backgroundColor: '#000',
    marginTop: commonStyles.spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: commonStyles.spacing.md,
    paddingVertical: commonStyles.spacing.sm,
  },
  helperText: {
    ...commonStyles.typography.caption,
    color: theme.textColor,
    marginTop: commonStyles.spacing.xs,
  },
  bottomPadding: {
    height: 80,
  },
  inputLabel: {
    ...commonStyles.typography.label,
    marginBottom: commonStyles.spacing.xs,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: commonStyles.spacing.xs,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
    paddingVertical: commonStyles.spacing.md,
    paddingHorizontal: commonStyles.spacing.lg,
  },
  saveButton: {
    backgroundColor: '#000',
    width: '100%',
    height: 45,
    borderRadius: commonStyles.borderRadius.medium,
  },
  themeSection: {
    backgroundColor: theme.cardBgColor,
    padding: commonStyles.spacing.lg,
    borderRadius: commonStyles.borderRadius.medium,
    marginBottom: commonStyles.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: commonStyles.spacing.md,
  },
  themeInfo: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.textColor,
  },
  themeSubtitle: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: commonStyles.spacing.md,
    marginTop: commonStyles.spacing.sm,
  },
  themeOption: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: theme.cardBgColor,
    borderRadius: commonStyles.borderRadius.medium,
    padding: commonStyles.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  selectedTheme: {
    borderColor: theme.accentColor,
    borderWidth: 2,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: commonStyles.spacing.sm,
  },
  themeOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textColor,
    textAlign: 'center',
  },
});

export default function Design() {
  const { websiteInstance, updateWebsiteField, hasChanges, saveChanges } = useWebmanager();
  const { theme } = useTheme();
  const { getToken } = useAuth();
  const { paymentStatus } = useWebsite();
  const [isUploading, setIsUploading] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const themePickerRef = useRef<Modalize>(null);
  const premiumModalRef = useRef<Modalize>(null);
  const styles = createStyles(theme);

  const handleThemeSelect = (templateId: number) => {
    const isEnhancedTheme = enhancedTemplates.some(
      template => parseInt(template.value) === templateId
    );

    if (isEnhancedTheme && !paymentStatus) {
      premiumModalRef.current?.open();
      return;
    }

    updateWebsiteField('template_id', templateId);
    themePickerRef.current?.close();
  };

  const handleImageUpload = async (type: 'desktop' | 'mobile' | 'favicon') => {
    try {
      setIsUploading(true);
      
      // Request permissions first
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'favicon' ? [1, 1] : [4, 3],
        quality: 0.5,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Check file size (10MB limit)
        const fileSize = result.assets[0].fileSize || 0;
        if (fileSize > 10 * 1024 * 1024) { // 10MB in bytes
          Alert.alert('Error', 'Image file size must be less than 10MB');
          return;
        }

        try {
          // Create form data for image upload
          const formData = new FormData();
          const imageUri = result.assets[0].uri;
          const filename = imageUri.split('/').pop() || 'image.jpg';
          
          formData.append('file', {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            type: 'image/jpeg',
            name: filename,
          } as any);

          // Step 1: Upload to image server
          const uploadResponse = await fetch('https://image.stagebooked.com/', {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error('Upload failed:', errorText);
            throw new Error(`Failed to upload image: ${uploadResponse.status}`);
          }

          const data = await uploadResponse.json();

          if (!data.url || !data.public_id) {
            throw new Error('Invalid response from image server');
          }

          // Step 2: Update the website field with the new image URL
          const field = type === 'desktop' ? 'image_url' : 
                       type === 'mobile' ? 'mobile_image_url' : 'favicon_url';
          updateWebsiteField(field, data.url);
          Alert.alert('Success', 'Image uploaded successfully');

        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          if (uploadError instanceof Error) {
            Alert.alert('Error', `Failed to upload image: ${uploadError.message}`);
          } else {
            Alert.alert('Error', 'Failed to upload image. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      Alert.alert('Error', 'Failed to access image library. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveChanges();
      Alert.alert('Success', 'Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const handleSwitchChange = (field: keyof Website) => (value: boolean) => {
    updateWebsiteField(field, value);
  };

  if (!websiteInstance) {
    return (
      <Container>
        <BodyText>No website selected</BodyText>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Basic Information</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Title"
              value={websiteInstance.title}
              onChangeText={(value) => updateWebsiteField('title', value)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Subtitle"
              value={websiteInstance.under_title}
              onChangeText={(value) => updateWebsiteField('under_title', value)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Description"
              value={websiteInstance.description}
              onChangeText={(value) => updateWebsiteField('description', value)}
              multiline
              style={[styles.input, { height: 100, textAlignVertical: 'top', paddingTop: commonStyles.spacing.sm }]}
            />
          </View>
          <View style={styles.switchContainer}>
            <BodyText>Has Description</BodyText>
            <Switch
              value={websiteInstance.has_description}
              onValueChange={handleSwitchChange('has_description')}
              trackColor={{ false: theme.borderColor, true: '#000' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Theme</Title>
          <TouchableOpacity
            style={styles.themeSection}
            onPress={() => themePickerRef.current?.open()}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.themeIcon}>
                <AntDesign name="skin" size={20} color={theme.textColor} />
              </View>
              <View style={styles.themeInfo}>
                <BodyText style={styles.themeTitle}>Vælg tema</BodyText>
                <BodyText style={styles.themeSubtitle}>Tilpas din hjemmesides udseende</BodyText>
              </View>
              <AntDesign name="right" size={20} color={theme.textColor} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Images</Title>
          
          <View style={styles.imageSection}>
            <BodyText style={styles.inputLabel}>Desktop Image</BodyText>
            {websiteInstance.image_url && (
              <Image
                source={{ uri: websiteInstance.image_url }}
                style={styles.previewImage}
              />
            )}
            <Button
              onPress={() => handleImageUpload('desktop')}
              variant="primary"
              style={styles.uploadButton}
            >
              <View style={styles.buttonContent}>
                <AntDesign name="upload" size={20} color="white" />
                <BodyText style={[styles.buttonText, { color: 'white', marginLeft: commonStyles.spacing.xs }]}>
                  Upload Desktop Image
                </BodyText>
              </View>
            </Button>
          </View>

          <View style={styles.imageSection}>
            <BodyText style={styles.inputLabel}>Mobile Image</BodyText>
            {websiteInstance.mobile_image_url && (
              <Image
                source={{ uri: websiteInstance.mobile_image_url }}
                style={styles.previewImage}
              />
            )}
            <Button
              onPress={() => handleImageUpload('mobile')}
              variant="primary"
              style={styles.uploadButton}
            >
              <View style={styles.buttonContent}>
                <AntDesign name="upload" size={20} color="white" />
                <BodyText style={[styles.buttonText, { color: 'white', marginLeft: commonStyles.spacing.xs }]}>
                  Upload Mobile Image
                </BodyText>
              </View>
            </Button>
          </View>

          <View style={styles.imageSection}>
            <BodyText style={styles.inputLabel}>Favicon</BodyText>
            {websiteInstance.favicon_url && (
              <Image
                source={{ uri: websiteInstance.favicon_url }}
                style={styles.faviconPreview}
              />
            )}
            <Button
              onPress={() => handleImageUpload('favicon')}
              variant="primary"
              style={styles.uploadButton}
            >
              <View style={styles.buttonContent}>
                <AntDesign name="upload" size={20} color="white" />
                <BodyText style={[styles.buttonText, { color: 'white', marginLeft: commonStyles.spacing.xs }]}>
                  Upload Favicon
                </BodyText>
              </View>
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Music Platforms</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Spotify URL"
              value={websiteInstance.spotify_url}
              onChangeText={(value) => updateWebsiteField('spotify_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.switchContainer}>
            <BodyText>Embed Spotify</BodyText>
            <Switch
              value={websiteInstance.embed_spotify}
              onValueChange={handleSwitchChange('embed_spotify')}
              trackColor={{ false: theme.borderColor, true: '#000' }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Spotify Highlight URL"
              value={websiteInstance.spotify_highlight_url}
              onChangeText={(value) => updateWebsiteField('spotify_highlight_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Bandcamp URL"
              value={websiteInstance.bandcamp_url}
              onChangeText={(value) => updateWebsiteField('bandcamp_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Bandcamp Embed URL"
              value={websiteInstance.bandcamp_embed_url}
              onChangeText={(value) => updateWebsiteField('bandcamp_embed_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Soundcloud URL"
              value={websiteInstance.soundcloud_url}
              onChangeText={(value) => updateWebsiteField('soundcloud_url', value)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Social Media</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Facebook URL"
              value={websiteInstance.facebook_url}
              onChangeText={(value) => updateWebsiteField('facebook_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Instagram URL"
              value={websiteInstance.instagram_url}
              onChangeText={(value) => updateWebsiteField('instagram_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="YouTube URL"
              value={websiteInstance.youtube_url}
              onChangeText={(value) => updateWebsiteField('youtube_url', value)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Booking & Tickets</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Booking URL"
              value={websiteInstance.booking_url}
              onChangeText={(value) => updateWebsiteField('booking_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Ticketmaster URL"
              value={websiteInstance.ticketmaster_url}
              onChangeText={(value) => updateWebsiteField('ticketmaster_url', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.switchContainer}>
            <BodyText>Has Booking Section</BodyText>
            <Switch
              value={websiteInstance.has_booking_section}
              onValueChange={handleSwitchChange('has_booking_section')}
              trackColor={{ false: theme.borderColor, true: '#000' }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Contact Information</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Email"
              value={websiteInstance.contact_email}
              onChangeText={(value) => updateWebsiteField('contact_email', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Input
              placeholder="Phone"
              value={websiteInstance.phone_number}
              onChangeText={(value) => updateWebsiteField('phone_number', value)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Press & Materials</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Press Material URL"
              value={websiteInstance.press_material_url}
              onChangeText={(value) => updateWebsiteField('press_material_url', value)}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Domain Settings</Title>
          <View style={styles.inputGroup}>
            <Input
              placeholder="Subdomain"
              value={websiteInstance.subdomain}
              onChangeText={(value) => updateWebsiteField('subdomain', value)}
              style={styles.input}
            />
          </View>
          <BodyText style={styles.helperText}>
            Your website will be available at: {websiteInstance.subdomain}.stagebooked.com
          </BodyText>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {hasChanges && (
        <View style={styles.fixedButtonContainer}>
          <Button
            onPress={handleSave}
            variant="primary"
            style={styles.saveButton}
          >
            <BodyText style={styles.buttonText}>
              Save Changes
            </BodyText>
          </Button>
        </View>
      )}

      <Modalize
        ref={themePickerRef}
        modalHeight={SCREEN_HEIGHT * 0.8}
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
          <View style={{ marginBottom: commonStyles.spacing.xl }}>
            <BodyText style={{ marginBottom: commonStyles.spacing.md, fontWeight: '600' }}>
              Gratis temaer
            </BodyText>
            <View style={styles.themeGrid}>
              {freeTemplates.map((template) => {
                const themeColors = themes[parseInt(template.value)];
                return (
                  <TouchableOpacity
                    key={template.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: themeColors.backgroundColor,
                      },
                      websiteInstance?.template_id === parseInt(template.value) && styles.selectedTheme
                    ]}
                    onPress={() => handleThemeSelect(parseInt(template.value))}
                  >
                    <View style={[styles.themeIconContainer, { backgroundColor: themeColors.accentBgColor }]}>
                      {template.value === "1" ? (
                        <Ionicons name="sunny-outline" size={24} color={themeColors.buttonTextColor} />
                      ) : (
                        <Ionicons name="moon-outline" size={24} color={themeColors.buttonTextColor} />
                      )}
                    </View>
                    <BodyText style={[styles.themeOptionLabel, { color: themeColors.textColor }]}>
                      {template.label}
                    </BodyText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View>
            <BodyText style={{ marginBottom: commonStyles.spacing.md, fontWeight: '600' }}>
              Premium temaer
            </BodyText>
            <View style={styles.themeGrid}>
              {enhancedTemplates.map((template) => {
                const themeColors = themes[parseInt(template.value)];
                return (
                  <TouchableOpacity
                    key={template.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: themeColors.backgroundColor,
                      },
                      websiteInstance?.template_id === parseInt(template.value) && styles.selectedTheme
                    ]}
                    onPress={() => handleThemeSelect(parseInt(template.value))}
                  >
                    <View style={[styles.themeIconContainer, { backgroundColor: themeColors.accentBgColor }]}>
                      {template.value === "3" ? (
                        <Feather name="droplet" size={24} color={themeColors.buttonTextColor} />
                      ) : template.value === "4" ? (
                        <Feather name="anchor" size={24} color={themeColors.buttonTextColor} />
                      ) : template.value === "5" ? (
                        <MaterialCommunityIcons name="candy-outline" size={24} color={themeColors.buttonTextColor} />
                      ) : template.value === "6" ? (
                        <Ionicons name="star-outline" size={24} color={themeColors.buttonTextColor} />
                      ) : (
                        <MaterialCommunityIcons name="palm-tree" size={24} color={themeColors.buttonTextColor} />
                      )}
                    </View>
                    <BodyText style={[styles.themeOptionLabel, { color: themeColors.textColor }]}>
                      {template.label}
                    </BodyText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modalize>

      <PremiumModal
        modalRef={premiumModalRef}
        title="Dette er et Enhanced tema"
      />
    </Container>
  );
} 