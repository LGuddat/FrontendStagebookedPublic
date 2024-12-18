import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useWebsite } from './WebsiteContext';
import { format } from 'date-fns';

export interface Job {
  id: string;
  is_public: boolean;
  job_tid: string | null;
  job_dato: string | null;
  job_hvor: string | null;
  job_spillested: string | null;
  job_by: string | null;
  job_med?: string | null;
  job_title: string | null;
  job_billet: string | null;
  website_id: string;
  user_id: string;
}

interface JobContextType {
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  fetchJobs: () => Promise<void>;
  addJob: (job: Omit<Job, 'id'>) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
}

const initialContext: JobContextType = {
  jobs: [],
  setJobs: () => {},
  fetchJobs: async () => {},
  addJob: async () => {},
  updateJob: async () => {},
  deleteJob: async () => {},
};

const JobContext = createContext<JobContextType>(initialContext);

function JobProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  const { selectedWebsite } = useWebsite();

  useEffect(() => {
    console.warn('JobProvider mounted', {
      hasUser: !!user,
      userId: user?.id,
      hasWebsite: !!selectedWebsite,
      websiteId: selectedWebsite?.id
    });
  }, [user, selectedWebsite?.id]);

  const fetchJobs = useCallback(async () => {
    console.warn('fetchJobs called', { 
      websiteId: selectedWebsite?.id, 
      userId: user?.id 
    });

    if (!selectedWebsite?.id || !user) {
      console.warn('fetchJobs: Missing website or user', {
        hasWebsite: !!selectedWebsite,
        websiteId: selectedWebsite?.id,
        hasUser: !!user,
        userId: user?.id
      });
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.warn('fetchJobs: No token available');
        return;
      }

      console.warn('fetchJobs: Making request', {
        url: `https://api.stagebooked.com/jobs/${selectedWebsite.id}`,
        hasToken: true
      });

      const response = await fetch(
        `https://api.stagebooked.com/jobs/${selectedWebsite.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }
      );

      console.warn('fetchJobs: Got response', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('fetchJobs: Error response', {
          status: response.status,
          error: errorText
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.warn('fetchJobs: Parsed response', {
        isArray: Array.isArray(responseData),
        length: Array.isArray(responseData) ? responseData.length : 'not an array',
        data: responseData
      });

      if (Array.isArray(responseData)) {
        setJobs(responseData);
      } else {
        console.warn('fetchJobs: Invalid response format', responseData);
        setJobs([]);
      }
    } catch (error) {
      console.warn('fetchJobs: Error', error);
      setJobs([]);
      throw error;
    }
  }, [selectedWebsite?.id, getToken, user]);

  useEffect(() => {
    console.warn('JobProvider: Website changed', {
      websiteId: selectedWebsite?.id
    });
    
    if (selectedWebsite?.id) {
      fetchJobs().catch(error => {
        console.warn('Initial fetch failed:', error);
      });
    }
  }, [selectedWebsite?.id, fetchJobs]);

  const formatJobDate = (dateString: string | null): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  const formatJobTime = (timeString: string | null): string | null => {
    if (!timeString) return null;
    try {
      if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
        return timeString;
      }
      const date = new Date(`2000-01-01T${timeString}`);
      if (isNaN(date.getTime())) return null;
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return null;
    }
  };

  const addJob = async (job: Omit<Job, 'id'>) => {
    console.warn('addJob called', { job });

    if (!selectedWebsite?.id || !user) {
      console.warn('addJob: Missing website or user', {
        hasWebsite: !!selectedWebsite,
        websiteId: selectedWebsite?.id,
        hasUser: !!user,
        userId: user?.id
      });
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.warn('addJob: No token available');
        return;
      }

      console.warn('addJob: Got token');

      const formattedDate = formatJobDate(job.job_dato);
      const formattedTime = formatJobTime(job.job_tid);

      console.warn('addJob: Formatted date/time', {
        originalDate: job.job_dato,
        formattedDate,
        originalTime: job.job_tid,
        formattedTime
      });

      if (!formattedDate || !formattedTime) {
        throw new Error('Invalid date or time format');
      }

      const jobData = {
        ...job,
        website_id: selectedWebsite.id,
        user_id: user.id,
        is_public: true,
        job_dato: formattedDate,
        job_tid: formattedTime,
      };

      console.warn('addJob: Sending request', { jobData });

      const response = await fetch('https://api.stagebooked.com/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      console.warn('addJob: Got response', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('addJob: Error response', {
          status: response.status,
          error: errorText
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.warn('addJob: Success', { result });

      await fetchJobs();
    } catch (error) {
      console.warn('addJob: Error', error);
      throw error;
    }
  };

  const updateJob = async (job: Job) => {
    if (!user) {
      console.warn('updateJob: No user available');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.warn('updateJob: No token available');
        return;
      }

      const formattedDate = formatJobDate(job.job_dato);
      const formattedTime = formatJobTime(job.job_tid);

      if (!formattedDate || !formattedTime) {
        throw new Error('Invalid date or time format');
      }

      const jobData = {
        ...job,
        user_id: user.id,
        job_dato: formattedDate,
        job_tid: formattedTime,
      };

      console.warn('updateJob: Sending request', { jobData });

      const response = await fetch('https://api.stagebooked.com/jobs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobData),
      });

      console.warn('updateJob: Got response', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('updateJob: Error response', {
          status: response.status,
          error: errorText
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.warn('updateJob: Success', { result });

      await fetchJobs();
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!user) {
      console.warn('deleteJob: No user available');
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.warn('deleteJob: No token available');
        return;
      }

      console.warn('deleteJob: Sending request', { jobId });

      const response = await fetch('https://api.stagebooked.com/jobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: jobId, user_id: user.id }),
      });

      console.warn('deleteJob: Got response', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('deleteJob: Error response', {
          status: response.status,
          error: errorText
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.warn('deleteJob: Success', { result });

      await fetchJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  };

  return (
    <JobContext.Provider value={{ jobs, setJobs, fetchJobs, addJob, updateJob, deleteJob }}>
      {children}
    </JobContext.Provider>
  );
}

function useJob() {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJob must be used within a JobProvider');
  }
  return context;
}

export { JobProvider, useJob };
export default JobProvider; 