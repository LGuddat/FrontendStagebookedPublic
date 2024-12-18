import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";
import { useAuth } from "@clerk/clerk-expo";

export interface Website {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface WebsiteContextType {
  selectedWebsite: Website | null;
  setSelectedWebsite: React.Dispatch<
    React.SetStateAction<Website | null>
  >;
  websites: Website[];
  setWebsites: React.Dispatch<
    React.SetStateAction<Website[]>
  >;
}

const WebsiteContext =
  createContext<WebsiteContextType | null>(null);

const WebsiteProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [selectedWebsite, setSelectedWebsite] =
    useState<Website | null>(null);
  const [websites, setWebsites] = useState<
    Website[]
  >([]);
  const { getToken } = useAuth();

  const fetchWebsites = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.warn('fetchWebsites: No token available');
        return;
      }

      console.warn('fetchWebsites: Making request');
      const response = await fetch(
        "https://api.stagebooked.com/website",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      console.warn('fetchWebsites: Got response', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}`
        );
      }

      const responseData = await response.json();
      console.warn('fetchWebsites: Parsed response', responseData);

      if (
        responseData.success &&
        Array.isArray(responseData.data)
      ) {
        setWebsites(responseData.data);

        // Select the first website by default if none is selected
        if (
          !selectedWebsite &&
          responseData.data.length > 0
        ) {
          setSelectedWebsite(
            responseData.data[0]
          );
        }
      } else {
        console.error(
          "Unexpected response structure:",
          responseData
        );
      }
    } catch (error) {
      console.error(
        "Error fetching websites:",
        error
      );
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, [getToken]); // Only re-run when getToken changes

  return (
    <WebsiteContext.Provider
      value={{
        selectedWebsite,
        setSelectedWebsite,
        websites,
        setWebsites,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsite = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error(
      "useWebsite must be used within a WebsiteProvider"
    );
  }
  return context;
};

export default WebsiteProvider;
