import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useWebsite } from './WebsiteContext';

interface GalleryImage {
  Id: string;
  image_url: string;
  public_id: string;
  is_favorite: boolean;
}

interface GalleryContextType {
  galleryImages: GalleryImage[];
  favoriteImages: GalleryImage[];
  isLoading: boolean;
  uploadImage: (imageUrl: string, publicId: string) => Promise<void>;
  updateFavorites: (imageIds: string[]) => Promise<void>;
  refreshGallery: () => Promise<void>;
  deleteImage: (imageId: string) => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | null>(null);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getToken } = useAuth();
  const { selectedWebsite } = useWebsite();

  const refreshGallery = async () => {
    if (!selectedWebsite?.id) {
      console.log('No website selected for gallery refresh');
      return;
    }
    
    try {
      setIsLoading(true);
      const token = await getToken();
      console.log('Fetching gallery images for website:', selectedWebsite.id);
      
      const response = await fetch(
        `https://api.stagebooked.com/images/galleryImages/${selectedWebsite.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gallery fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to fetch gallery images: ${response.status} ${response.statusText}`);
      }

      const images = await response.json();
      console.log('Fetched gallery images:', images.length);
      setGalleryImages(images);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (imageUrl: string, publicId: string) => {
    if (!selectedWebsite?.id) {
      console.log('No website selected for image upload');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      console.log('Uploading image to gallery:', {
        websiteId: selectedWebsite.id,
        publicId,
        imageUrl: imageUrl.substring(0, 50) + '...'
      });

      const response = await fetch('https://api.stagebooked.com/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl,
          public_id: publicId,
          website_id: selectedWebsite.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to upload image: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      await refreshGallery();
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFavorites = async (imageIds: string[]) => {
    if (!selectedWebsite?.id) {
      console.log('No website selected for favorites update');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      console.log('Updating favorite images:', {
        websiteId: selectedWebsite.id,
        imageIds
      });

      const response = await fetch('https://api.stagebooked.com/images/updateGalleryImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageIds,
          website_id: selectedWebsite.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Favorites update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to update favorites: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Favorites update successful:', result);
      await refreshGallery();
    } catch (error) {
      console.error('Error updating favorites:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!selectedWebsite?.id) {
      console.log('No website selected for image deletion');
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      console.log('Attempting to delete image:', {
        imageId,
        websiteId: selectedWebsite.id
      });

      const response = await fetch('https://api.stagebooked.com/images', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          public_id: imageId,
          website_id: selectedWebsite.id
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete image failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          imageId,
          websiteId: selectedWebsite.id
        });
        throw new Error(`Failed to delete image: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('Image deleted successfully:', imageId);
      await refreshGallery();
    } catch (error) {
      console.error('Error deleting image:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWebsite?.id) {
      console.log('Initial gallery refresh for website:', selectedWebsite.id);
      refreshGallery();
    }
  }, [selectedWebsite?.id]);

  const favoriteImages = galleryImages.filter(img => img.is_favorite);

  return (
    <GalleryContext.Provider
      value={{
        galleryImages,
        favoriteImages,
        isLoading,
        uploadImage,
        updateFavorites,
        refreshGallery,
        deleteImage,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}; 