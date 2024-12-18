import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth, useUser } from "@clerk/clerk-expo";

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
  user_id?: string;
}

interface WebsiteContextType {
  selectedWebsite: Website | null;
  setSelectedWebsite: React.Dispatch<React.SetStateAction<Website | null>>;
  websites: Website[];
  setWebsites: React.Dispatch<React.SetStateAction<Website[]>>;
  refreshWebsite: () => Promise<void>;
}

const initialContext: WebsiteContextType = {
  selectedWebsite: null,
  setSelectedWebsite: () => {},
  websites: [],
  setWebsites: () => {},
  refreshWebsite: async () => {},
};

const WebsiteContext = createContext<WebsiteContextType>(initialContext);

function WebsiteProvider({ children }: { children: React.ReactNode }) {
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  const refreshWebsite = async () => {
    if (!user) return;

    try {
      const token = await getToken();

      const response = await fetch(`https://api.stagebooked.com/websites/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();

      if (Array.isArray(responseData)) {
        setWebsites(responseData);
        
        // If there's a selected website, update it with fresh data
        if (selectedWebsite) {
          const updatedSelectedWebsite = responseData.find(w => w.id === selectedWebsite.id);
          if (updatedSelectedWebsite) {
            setSelectedWebsite(updatedSelectedWebsite);
          }
        }
        // Select the first website by default if none is selected
        else if (responseData.length > 0) {
          setSelectedWebsite(responseData[0]);
        }
      } else {
        console.error("Unexpected response structure:", responseData);
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
    }
  };

  useEffect(() => {
    refreshWebsite();
  }, [user?.id]); // Only refresh when user ID changes

  return (
    <WebsiteContext.Provider value={{ selectedWebsite, setSelectedWebsite, websites, setWebsites, refreshWebsite }}>
      {children}
    </WebsiteContext.Provider>
  );
}

function useWebsite() {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error('useWebsite must be used within a WebsiteProvider');
  }
  return context;
}

export { WebsiteProvider, useWebsite };
export default WebsiteProvider; 