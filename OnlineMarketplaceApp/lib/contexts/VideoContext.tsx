import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useWebsite } from './WebsiteContext';

export interface VideoData {
  id: number;
  title?: string;
  description?: string;
  is_public: boolean;
  video_url: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  website_id: string;
}

interface VideoContextType {
  videos: VideoData[];
  setVideos: React.Dispatch<React.SetStateAction<VideoData[]>>;
  fetchVideos: () => Promise<void>;
  addVideo: (video: Omit<VideoData, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateVideo: (video: VideoData) => Promise<void>;
  deleteVideo: (videoId: number) => Promise<void>;
}

const VideoContext = createContext<VideoContextType | null>(null);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { selectedWebsite } = useWebsite();

  const fetchVideos = useCallback(async () => {
    if (!selectedWebsite?.id || !user) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `https://api.stagebooked.com/videos/${selectedWebsite.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setVideos(data);
      } else if (data.message === "No videos found for this website.") {
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  }, [selectedWebsite?.id, getToken, user]);

  useEffect(() => {
    if (selectedWebsite?.id) {
      fetchVideos();
    }
  }, [selectedWebsite?.id, fetchVideos]);

  const addVideo = async (videoData: Omit<VideoData, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!selectedWebsite?.id || !user) return;

    try {
      const token = await getToken();
      const response = await fetch('https://api.stagebooked.com/videos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...videoData,
          website_id: selectedWebsite.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchVideos();
      }
    } catch (error) {
      console.error("Error adding video:", error);
      throw error;
    }
  };

  const updateVideo = async (videoData: VideoData) => {
    if (!user) return;

    try {
      const token = await getToken();
      const response = await fetch('https://api.stagebooked.com/videos/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: videoData.id,
          is_public: videoData.is_public,
          video_url: videoData.video_url,
          title: videoData.title,
          description: videoData.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        await fetchVideos();
      }
    } catch (error) {
      console.error("Error updating video:", error);
      throw error;
    }
  };

  const deleteVideo = async (videoId: number) => {
    if (!user) return;

    try {
      const token = await getToken();
      const response = await fetch('https://api.stagebooked.com/videos/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: videoId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      await fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      throw error;
    }
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        setVideos,
        fetchVideos,
        addVideo,
        updateVideo,
        deleteVideo,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}; 