import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

type FileInfo = {
  exists: boolean;
  size?: number;
  uri: string;
};

async function compressAndSaveImage(uri: string): Promise<string> {
  const tempDirectory = FileSystem.cacheDirectory + 'compressed/';
  const tempUri = tempDirectory + 'compressed_image.jpg';

  try {
    // Ensure temp directory exists
    await FileSystem.makeDirectoryAsync(tempDirectory, { intermediates: true });

    // Get the original image info
    const originalInfo = await FileSystem.getInfoAsync(uri);
    console.log('Original file info:', originalInfo);

    // Read the file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Save the compressed image
    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const compressedInfo = await FileSystem.getInfoAsync(tempUri);
    console.log('Compressed file info:', compressedInfo);

    return tempUri;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}

export const pickImage = async (): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      console.log('Permission to access media library was denied');
      return null;
    }

    // First pick the image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.01,
    });

    if (result.canceled || !result.assets || !result.assets[0]) {
      return null;
    }

    const originalUri = result.assets[0].uri;
    console.log('Original image info:', {
      width: result.assets[0].width,
      height: result.assets[0].height,
      uri: originalUri,
    });

    // Compress the image
    const compressedUri = await compressAndSaveImage(originalUri);
    const compressedInfo = await FileSystem.getInfoAsync(compressedUri);

    console.log('Compressed image info:', {
      size: compressedInfo.size,
      sizeInMB: compressedInfo.size ? (compressedInfo.size / (1024 * 1024)).toFixed(2) + 'MB' : 'unknown',
      uri: compressedUri,
    });

    if (compressedInfo.size && compressedInfo.size > MAX_FILE_SIZE) {
      // If still too large, try reading as base64 and recompressing
      const base64 = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Save the recompressed image
      const finalUri = FileSystem.cacheDirectory + 'final_compressed.jpg';
      await FileSystem.writeAsStringAsync(finalUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const finalInfo = await FileSystem.getInfoAsync(finalUri);
      console.log('Final compressed image info:', {
        size: finalInfo.size,
        sizeInMB: finalInfo.size ? (finalInfo.size / (1024 * 1024)).toFixed(2) + 'MB' : 'unknown',
        uri: finalUri,
      });

      return finalUri;
    }

    return compressedUri;
  } catch (error) {
    console.error('Error picking/compressing image:', error);
    throw error;
  }
};

export const uploadImage = async (uri: string): Promise<{ url: string; public_id: string } | null> => {
  let compressedUri = '';
  
  try {
    // First, try to compress the image
    compressedUri = await compressAndSaveImage(uri);
    const fileInfo = await FileSystem.getInfoAsync(compressedUri) as FileInfo;
    console.log('Compressed file info:', fileInfo);

    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
      throw new Error('Image is too large. Please try a smaller image.');
    }

    const filename = uri.split('/').pop() || 'image.jpg';
    const formData = new FormData();
    
    const fileToUpload = {
      uri: Platform.OS === 'ios' ? compressedUri.replace('file://', '') : compressedUri,
      type: 'image/jpeg',
      name: filename,
    };

    console.log('Preparing to upload file:', {
      name: filename,
      size: fileInfo.size ? `${(fileInfo.size / (1024 * 1024)).toFixed(2)}MB` : 'unknown',
      type: 'image/jpeg'
    });

    formData.append('file', fileToUpload as any);

    console.log('Sending request to image server...');
    const uploadResponse = await fetch('https://image.stagebooked.com/', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Response status:', uploadResponse.status);
    console.log('Response headers:', {
      status: uploadResponse.status,
      contentType: uploadResponse.headers.get('content-type'),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload failed with status:', uploadResponse.status);
      console.error('Error response:', errorText);
      throw new Error(`Failed to upload image: ${uploadResponse.status} ${errorText}`);
    }

    const data = await uploadResponse.json();
    console.log('Upload successful, received data:', data);
    
    if (!data.url || !data.public_id) {
      console.error('Invalid response data:', data);
      throw new Error('Server response missing required fields');
    }

    return {
      url: data.url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  } finally {
    // Clean up temporary files
    try {
      if (compressedUri) {
        await FileSystem.deleteAsync(compressedUri, { idempotent: true });
      }
    } catch (cleanupError) {
      console.warn('Error cleaning up temporary files:', cleanupError);
    }
  }
}; 