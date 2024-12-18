import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "@clerk/clerk-expo";
import { useWebsite } from "./WebsiteContext";

export interface Job {
  id: string;
  is_public: boolean;
  job_tid: string;
  job_dato: string;
  job_hvor: string;
  job_spillested: string;
  job_by: string;
  job_med?: string;
  job_title: string;
  job_billet: string;
  website_id: string;
  created_at: string;
  updated_at: string;
}

interface JobContextType {
  jobs: Job[];
  setJobs: React.Dispatch<
    React.SetStateAction<Job[]>
  >;
  fetchJobs: () => Promise<void>;
  addJob: (
    job: Omit<
      Job,
      "id" | "created_at" | "updated_at"
    >
  ) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  isLoading: boolean;
}

const JobContext =
  createContext<JobContextType | null>(null);

const JobProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] =
    useState(false);
  const { getToken } = useAuth();
  const { selectedWebsite } = useWebsite();

  const fetchJobs = useCallback(async () => {
    if (!selectedWebsite?.id) return;

    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetch(
        `https://api.stagebooked.com/jobs/${selectedWebsite.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}`
        );
      }

      const responseData = await response.json();
      if (
        responseData.success &&
        Array.isArray(responseData.data)
      ) {
        setJobs(responseData.data);
      } else {
        console.error(
          "Unexpected response structure:",
          responseData
        );
      }
    } catch (error) {
      console.error(
        "Error fetching jobs:",
        error
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getToken, selectedWebsite?.id]);

  useEffect(() => {
    if (selectedWebsite?.id) {
      fetchJobs().catch(console.error);
    }
  }, [fetchJobs, selectedWebsite?.id]);

  const addJob = async (
    job: Omit<
      Job,
      "id" | "created_at" | "updated_at"
    >
  ) => {
    if (!selectedWebsite?.id) {
      throw new Error("No website selected");
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetch(
        'https://api.stagebooked.com/jobs/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...job,
            website_id: selectedWebsite.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}`
        );
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(
          responseData.message ||
            "Failed to add job"
        );
      }

      await fetchJobs();
    } catch (error) {
      console.error("Error adding job:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateJob = async (job: Job) => {
    if (!selectedWebsite?.id) {
      throw new Error("No website selected");
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetch(
        'https://api.stagebooked.com/jobs/',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...job,
            website_id: selectedWebsite.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}`
        );
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(
          responseData.message ||
            "Failed to update job"
        );
      }

      await fetchJobs();
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!selectedWebsite?.id) {
      throw new Error("No website selected");
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const response = await fetch(
        'https://api.stagebooked.com/jobs/',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id: jobId, website_id: selectedWebsite.id }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}`
        );
      }

      const responseData = await response.json();
      if (!responseData.success) {
        throw new Error(
          responseData.message ||
            "Failed to delete job"
        );
      }

      await fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        setJobs,
        fetchJobs,
        addJob,
        updateJob,
        deleteJob,
        isLoading,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error(
      "useJob must be used within a JobProvider"
    );
  }
  return context;
};

export default JobProvider;
