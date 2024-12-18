import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWebsite } from './WebsiteContext';
import { useAuth } from '@clerk/clerk-expo';

export interface Website {
  id: string;
  title?: string;
  under_title?: string;
  template_id?: string;
  spotify_url?: string;
  embed_spotify?: boolean;
  spotify_highlight_url?: string;
  bandcamp_embed_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  bandcamp_url?: string;
  soundcloud_url?: string;
  ticketmaster_url?: string;
  booking_url?: string;
  contact_email?: string;
  image_url?: string;
  mobile_image_url?: string;
  phone_number?: string;
  description?: string;
  has_description?: boolean;
  has_booking_section?: boolean;
  subdomain?: string;
  repertoire_list?: string[];
  reference_list?: string[];
  press_material_url?: string;
  favicon_url?: string;
}

interface WebmanagerContextType {
  websiteInstance: Website | null;
  updateWebsiteField: (field: keyof Website, value: string | number | boolean | string[]) => void;
  hasChanges: boolean;
  saveChanges: () => Promise<void>;
}

const WebmanagerContext = createContext<WebmanagerContextType | null>(null);

export const WebmanagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedWebsite, refreshWebsite } = useWebsite();
  const [websiteInstance, setWebsiteInstance] = useState<Website | null>(selectedWebsite);
  const [hasChanges, setHasChanges] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    setWebsiteInstance(selectedWebsite);
    setHasChanges(false);
  }, [selectedWebsite]);

  const updateWebsiteField = (
    field: keyof Website,
    value: string | number | boolean | string[]
  ) => {
    setWebsiteInstance((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(selectedWebsite));
      return updated;
    });
  };

  const saveChanges = async () => {
    if (!websiteInstance) return;
    
    try {
      const token = await getToken();
      const response = await fetch('https://api.stagebooked.com/websites/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...websiteInstance,
          id: websiteInstance.id,
          user_id: selectedWebsite?.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Use the refreshWebsite function to update all website data
      await refreshWebsite();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      throw error;
    }
  };

  return (
    <WebmanagerContext.Provider
      value={{
        websiteInstance,
        updateWebsiteField,
        hasChanges,
        saveChanges,
      }}
    >
      {children}
    </WebmanagerContext.Provider>
  );
};

export const useWebmanager = () => {
  const context = useContext(WebmanagerContext);
  if (!context) {
    throw new Error('useWebmanager must be used within a WebmanagerProvider');
  }
  return context;
}; 