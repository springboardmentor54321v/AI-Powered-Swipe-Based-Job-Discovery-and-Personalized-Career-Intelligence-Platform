import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  INITIAL_USER,
  INITIAL_NOTIFICATIONS,
} from "../utils/mockData";

// import confetti from "canvas-confetti";

import { jobService } from "../services/jobService";
import { authService } from "../services/authService";
import { resumeService } from "../services/resumeService";

export const AppContext = createContext();

export function AppProvider({ children }) {
  // ============================================================
  // AUTH
  // ============================================================

  const [user, setUser] = useState(INITIAL_USER);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authLoading, setAuthLoading] =
    useState(true);

  // ============================================================
  // USER-SPECIFIC DATA
  //
  // IMPORTANT:
  // These are now loaded from backend/PostgreSQL.
  // DO NOT store them in localStorage.
  // ============================================================

  const [savedJobs, setSavedJobs] = useState([]);

  const [applications, setApplications] = useState([]);

  // ============================================================
  // SWIPE UI STATE
  //
  // Backend is source of truth for actual swipes.
  // This state is only used by frontend to control the
  // currently displayed swipe deck.
  // ============================================================

  const [swipedState, setSwipedState] = useState({
    skipped: [],
    liked: [],
  });

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const [notifications, setNotifications] =
    useState(() => {
      const saved = localStorage.getItem(
        "swipex_notifications"
      );

      return saved
        ? JSON.parse(saved)
        : INITIAL_NOTIFICATIONS;
    });

  // ============================================================
  // RESUME ANALYSIS
  // ============================================================

  const [resumeAnalysis, setResumeAnalysis] =
    useState(null);

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const [searchQuery, setSearchQuery] =
    useState("");

  const [activeFilterPill, setActiveFilterPill] =
    useState("All");

  const [filters, setFilters] = useState({
    companyType: "All",
    jobType: "All",
    experienceLevel: "All",
    location: "All",
    competition: "All",
    minSalary: 0,
    isRemote: false,
    isInternship: false,
    isFresherFriendly: false,
    isNewlyFounded: false,
    selectedSkill: "All",
  });

  // ============================================================
  // MODALS / TOASTS
  // ============================================================

  const [applyModalJob, setApplyModalJob] =
    useState(null);

  const [isFilterModalOpen, setIsFilterModalOpen] =
    useState(false);

  const [toasts, setToasts] = useState([]);

  // ============================================================
  // JOBS
  // ============================================================

  const [jobs, setJobs] = useState([]);

  const [jobsLoading, setJobsLoading] =
    useState(false);

  // ============================================================
  // TOAST
  // ============================================================

  const addToast = useCallback(
    (message, type = "success") => {
      const id =
        Date.now() +
        Math.random()
          .toString(36)
          .substring(2, 5);

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.filter(
            (toast) => toast.id !== id
          )
        );
      }, 3500);
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.filter(
        (toast) => toast.id !== id
      )
    );
  }, []);

  // ============================================================
  // LOAD USER-SPECIFIC DATA
  //
  // This is the most important function.
  //
  // Backend identifies the user using JWT:
  //
  // JWT
  //   ↓
  // get_jwt_identity()
  //   ↓
  // user_id
  //   ↓
  // PostgreSQL
  //
  // So User A gets A's data and User B gets B's data.
  // ============================================================

  const loadUserData = useCallback(async () => {
  if (!isAuthenticated) return;

  try {
    const [
      savedResponse,
      applicationsResponse,
      swipeResponse,
    ] = await Promise.all([
      jobService.getSavedJobs(),
      jobService.getApplications(),
      jobService.getSwipeHistory(),
    ]);

    // -----------------------------
    // Saved Jobs
    // -----------------------------

    const backendSavedJobs = (savedResponse.saved_jobs || [])
      .map((item) => item.job)
      .filter(Boolean);

    setSavedJobs(backendSavedJobs);

    // -----------------------------
    // Applications
    // -----------------------------

    const backendApplications =
      applicationsResponse.applications || [];

    setApplications(backendApplications);

    // -----------------------------
    // Swipe History
    // -----------------------------

    const swipes = swipeResponse.swipes || [];

    const skipped = swipes
      .filter((swipe) => swipe.action === "LEFT")
      .map((swipe) => Number(swipe.job_id));

    const liked = swipes
      .filter((swipe) => swipe.action === "RIGHT")
      .map((swipe) => Number(swipe.job_id));

    // -----------------------------
    // IMPORTANT:
    // Applied jobs must also be
    // considered already interacted
    // with by Discover.
    // -----------------------------

    const appliedJobIds = backendApplications
      .map((application) =>
        Number(
          application.jobId ??
          application.job_id
        )
      )
      .filter((id) => !Number.isNaN(id));

    setSwipedState({
      skipped: [...new Set(skipped)],
      liked: [
        ...new Set([
          ...liked,
          ...appliedJobIds,
        ]),
      ],
    });
  } catch (error) {
    console.error(
      "Failed to load user data:",
      error
    );

    addToast(
      error?.response?.data?.message ||
        "Could not load your saved jobs and applications",
      "error"
    );
  }
}, [isAuthenticated, addToast]);

  // ============================================================
  // AUTHENTICATION INITIALIZATION
  //
  // Runs when application starts.
  // ============================================================

  useEffect(() => {
    const token = localStorage.getItem(
      "swipex_access_token"
    );

    if (!token) {
      setAuthLoading(false);
      return;
    }

    authService
      .getMe()
      .then(async (res) => {
        if (res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        localStorage.removeItem(
          "swipex_access_token"
        );

        localStorage.removeItem(
          "swipex_refresh_token"
        );

        setUser(INITIAL_USER);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, []);

  // ============================================================
  // LOAD USER DATA AFTER LOGIN
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    loadUserData();
  }, [
    isAuthenticated,
    loadUserData,
  ]);

  // ============================================================
  // LOAD JOBS
  // ============================================================

  const loadJobs = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    setJobsLoading(true);

    try {
      const res =
        await jobService.getJobs();

      setJobs(res.jobs || []);
    } catch (error) {
      console.error(
        "Failed to load jobs:",
        error
      );

      addToast(
        error?.response?.data?.message ||
          "Could not load jobs",
        "error"
      );
    } finally {
      setJobsLoading(false);
    }
  }, [
    isAuthenticated,
    addToast,
  ]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // ============================================================
  // NOTIFICATION LOCAL STORAGE
  //
  // Notifications are still frontend/local for now.
  // Saved jobs and applications are NOT stored here.
  // ============================================================

  useEffect(() => {
    localStorage.setItem(
      "swipex_notifications",
      JSON.stringify(notifications)
    );
  }, [notifications]);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = useCallback(
    async (email, password) => {
      try {
        const res =
          await authService.login(
            email,
            password
          );

        // Save JWT
        localStorage.setItem(
          "swipex_access_token",
          res.access_token
        );

        localStorage.setItem(
          "swipex_refresh_token",
          res.refresh_token
        );

        // Set authenticated user
        setUser(res.user);

        setIsAuthenticated(true);

        // Clear any previous user's frontend data
        setSavedJobs([]);
        setApplications([]);

        setSwipedState({
          skipped: [],
          liked: [],
        });

        setResumeAnalysis(null);

        addToast(
          "Welcome back to SwipeX!",
          "success"
        );

        return true;
      } catch (error) {
        console.error(
          "Login error:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Invalid email or password",
          "error"
        );

        return false;
      }
    },
    [addToast]
  );

  // ============================================================
  // SIGNUP
  // ============================================================

  const signup = useCallback(
    async (formData) => {
      try {
        // ======================================================
        // STEP 1: REGISTER
        // ======================================================

        await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "JOB_SEEKER",
        });

        // ======================================================
        // STEP 2: LOGIN
        // ======================================================

        const res =
          await authService.login(
            formData.email,
            formData.password
          );

        // ======================================================
        // STEP 3: SAVE JWT
        // ======================================================

        localStorage.setItem(
          "swipex_access_token",
          res.access_token
        );

        localStorage.setItem(
          "swipex_refresh_token",
          res.refresh_token
        );

        // ======================================================
        // STEP 4: SET USER
        // ======================================================

        setUser({
          ...res.user,

          targetRole:
            formData.role,

          experience:
            formData.experience,

          resumeName:
            formData.resumeName || "",
        });

        // Make absolutely sure a new account starts
        // with clean frontend state.
        setSavedJobs([]);
        setApplications([]);

        setSwipedState({
          skipped: [],
          liked: [],
        });

        setIsAuthenticated(true);

        // ======================================================
        // STEP 5: RESUME
        // ======================================================

        if (formData.resumeFile) {
          try {
            const analysis =
              await resumeService.analyzeResume(
                formData.resumeFile
              );

            if (analysis?.analysis) {
              setResumeAnalysis(
                analysis.analysis
              );
            }

            addToast(
              "Resume uploaded and analyzed successfully",
              "success"
            );
          } catch (resumeError) {
            console.error(
              "Resume upload failed:",
              resumeError
            );

            addToast(
              "Account created, but resume upload failed. You can upload it later.",
              "info"
            );
          }
        } else {
          addToast(
            "Account created successfully! Welcome to SwipeX.",
            "success"
          );
        }

        return true;
      } catch (error) {
        console.error(
          "Signup error:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Signup failed",
          "error"
        );

        return false;
      }
    },
    [addToast]
  );

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn(
        "Backend logout failed:",
        error
      );
    }

    // ========================================================
    // REMOVE AUTHENTICATION ONLY
    //
    // DO NOT remove saved jobs/applications from database.
    // They belong to the account and should remain there.
    // ========================================================

    localStorage.removeItem(
      "swipex_access_token"
    );

    localStorage.removeItem(
      "swipex_refresh_token"
    );

    // Clear frontend state
    setUser(INITIAL_USER);

    setIsAuthenticated(false);

    setJobs([]);

    setSavedJobs([]);

    setApplications([]);

    setSwipedState({
      skipped: [],
      liked: [],
    });

    setResumeAnalysis(null);

    setApplyModalJob(null);

    addToast(
      "Logged out successfully.",
      "info"
    );
  }, [addToast]);

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const updateProfile = useCallback(
    async (updatedFields) => {
      try {
        const res =
          await authService.updateProfile(
            updatedFields
          );

        if (res.user) {
          setUser(res.user);
        }

        addToast(
          "Profile updated successfully",
          "success"
        );
      } catch (error) {
        addToast(
          error?.response?.data?.message ||
            "Could not update profile",
          "error"
        );
      }
    },
    [addToast]
  );

  // ============================================================
  // SAVED JOBS
  // ============================================================

  const isJobSaved = useCallback(
    (jobId) => {
      return savedJobs.some(
        (job) =>
          String(job.id) ===
          String(jobId)
      );
    },
    [savedJobs]
  );

  // ============================================================
  // SAVE / UNSAVE JOB
  //
  // NOW USES BACKEND.
  // ============================================================

  const toggleSaveJob = useCallback(
    async (job) => {
      if (!job) {
        return false;
      }

      const alreadySaved =
        isJobSaved(job.id);

      try {
        if (alreadySaved) {
          // ==================================================
          // UNSAVE
          // ==================================================

          await jobService.unsaveJob(
            job.id
          );

          setSavedJobs((current) =>
            current.filter(
              (savedJob) =>
                String(savedJob.id) !==
                String(job.id)
            )
          );

          addToast(
            "Job removed from saved jobs",
            "info"
          );
        } else {
          // ==================================================
          // SAVE
          // ==================================================

          await jobService.saveJob(
            job.id
          );

          setSavedJobs((current) => [
            job,
            ...current.filter(
              (savedJob) =>
                String(savedJob.id) !==
                String(job.id)
            ),
          ]);

          addToast(
            "Job saved successfully",
            "success"
          );
        }

        return true;
      } catch (error) {
        console.error(
          "Failed to update saved job:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Could not update saved job",
          "error"
        );

        return false;
      }
    },
    [isJobSaved, addToast]
  );

  // ============================================================
  // REMOVE SAVED JOB
  // ============================================================

  const removeSavedJob = useCallback(
    async (jobId) => {
      try {
        await jobService.unsaveJob(
          jobId
        );

        setSavedJobs((current) =>
          current.filter(
            (job) =>
              String(job.id) !==
              String(jobId)
          )
        );

        addToast(
          "Job removed from saved jobs",
          "info"
        );

        return true;
      } catch (error) {
        console.error(
          "Failed to remove saved job:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Could not remove saved job",
          "error"
        );

        return false;
      }
    },
    [addToast]
  );

  // ============================================================
  // SWIPE LEFT
  // ============================================================

  const handleSwipeLeft = useCallback(
    async (job) => {
      if (!job) {
        return false;
      }

      try {
        await jobService.swipeJob(
          job.id,
          "LEFT"
        );

        setSwipedState((prev) => ({
          ...prev,

          skipped:
            prev.skipped.includes(job.id)
              ? prev.skipped
              : [
                  ...prev.skipped,
                  job.id,
                ],
        }));

        addToast(
          `Skipped: ${job.title}`,
          "info"
        );

        return true;
      } catch (error) {
        console.error(
          "Swipe LEFT failed:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Could not record swipe",
          "error"
        );

        return false;
      }
    },
    [addToast]
  );

  // ============================================================
  // SWIPE RIGHT
  //
  // IMPORTANT:
  // RIGHT swipe is NOT automatically a saved job anymore.
  //
  // It is stored in the backend as:
  // action = RIGHT
  //
  // If user wants to save the job, they use the Bookmark button.
  // ============================================================

  const handleSwipeRight = useCallback(
    async (job) => {
      if (!job) {
        return false;
      }

      try {
        await jobService.swipeJob(
          job.id,
          "RIGHT"
        );

        setSwipedState((prev) => ({
          ...prev,

          liked:
            prev.liked.includes(job.id)
              ? prev.liked
              : [
                  ...prev.liked,
                  job.id,
                ],
        }));

        addToast(
          `Interested in: ${job.title}`,
          "success"
        );

        return true;
      } catch (error) {
        console.error(
          "Swipe RIGHT failed:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Could not record swipe",
          "error"
        );

        return false;
      }
    },
    [addToast]
  );

  // ============================================================
  // RESET SWIPE DECK
  // ============================================================

  const resetSwipes = useCallback(() => {
    setSwipedState({
      skipped: [],
      liked: [],
    });

    addToast(
      "Deck refreshed! All jobs are ready to explore.",
      "success"
    );
  }, [addToast]);

  // ============================================================
  // APPLY TO JOB
  //
  // NOW USES BACKEND.
  //
  // POST /api/v1/jobs/:jobId/apply
  // ============================================================

  const applyToJob = useCallback(
    async (job, notes = "", resumeId = null) => {
      if (!job) {
        return null;
      }

      // Check current frontend state first.
      const existing =
        applications.find(
          (application) =>
            String(
              application.jobId ??
                application.job_id
            ) ===
            String(job.id)
        );

      if (existing) {
        addToast(
          "You have already applied to this position.",
          "info"
        );

        return existing;
      }

      try {
        // ======================================================
        // SEND APPLICATION TO BACKEND
        // ======================================================

        const response =
          await jobService.applyJob(
            job.id,
            resumeId
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Application submission failed"
          );
        }

        const backendApplication =
          response.application;

        // ======================================================
        // NORMALIZE BACKEND RESPONSE FOR FRONTEND
        // ======================================================

        const newApplication = {
          ...backendApplication,

          id:
            backendApplication?.id ??
            `app-${Date.now()}`,

          jobId:
            backendApplication?.jobId ??
            backendApplication?.job_id ??
            job.id,

          title:
            backendApplication?.job
              ?.title ??
            job.title,

          company:
            backendApplication?.job
              ?.company ??
            job.company,

          logo:
            backendApplication?.job
              ?.logo ??
            job.logo,

          location:
            backendApplication?.job
              ?.location ??
            job.location,

          salary:
            backendApplication?.job
              ?.salary ??
            job.salary,

          status:
            backendApplication?.status ??
            "Applied",

          appliedDate:
            backendApplication?.appliedDate ??
            backendApplication?.applied_at ??
            new Date().toISOString(),

          lastUpdated:
            "Just now",

          matchPercentage:
            backendApplication?.job
              ?.matchPercentage ??
            job.matchPercentage,

          notes:
            notes ||
            "Applied via SwipeX One-Click Application.",
        };

        // ======================================================
        // UPDATE FRONTEND STATE
        // ======================================================

        setApplications((current) => [
          newApplication,
          ...current.filter(
            (application) =>
              String(
                application.jobId ??
                  application.job_id
              ) !==
              String(job.id)
          ),
        ]);

        // ======================================================
        // MARK JOB AS INTERESTED LOCALLY
        // ======================================================

        setSwipedState((prev) => ({
          ...prev,

          liked:
            prev.liked.includes(job.id)
              ? prev.liked
              : [
                  ...prev.liked,
                  job.id,
                ],
        }));

        // ======================================================
        // NOTIFICATION
        // ======================================================

        const newNotification = {
          id: `notif-${Date.now()}`,

          title:
            "Application Submitted",

          message:
            `Successfully applied to ${job.title} at ${job.company}.`,

          time: "Just now",

          read: false,

          type: "application",

          link: "/applications",
        };

        setNotifications((prev) => [
          newNotification,
          ...prev,
        ]);

        // ======================================================
        // CONFETTI
        // ======================================================

        // try {
        //   confetti({
        //     particleCount: 50,
        //     spread: 60,
        //     origin: {
        //       y: 0.7,
        //     },
        //   });
        // } catch {
        //   // Ignore confetti errors.
        // }

        addToast(
          "Application submitted successfully",
          "success"
        );

        return newApplication;
      } catch (error) {
        console.error(
          "Application submission failed:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            error?.message ||
            "Could not submit application",
          "error"
        );

        return null;
      }
    },
    [applications, addToast]
  );

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const markNotificationRead =
    useCallback((id) => {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );
    }, []);

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      addToast(
        "All notifications marked as read",
        "info"
      );
    }, [addToast]);

  const clearNotification =
    useCallback(
      (id) => {
        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              notification.id !== id
          )
        );

        addToast(
          "Notification dismissed",
          "info"
        );
      },
      [addToast]
    );

  const unreadNotificationsCount =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  // ============================================================
  // FILTERS
  // ============================================================

  const resetFilters = useCallback(() => {
    setSearchQuery("");

    setActiveFilterPill("All");

    setFilters({
      companyType: "All",
      jobType: "All",
      experienceLevel: "All",
      location: "All",
      competition: "All",
      minSalary: 0,
      isRemote: false,
      isInternship: false,
      isFresherFriendly: false,
      isNewlyFounded: false,
      selectedSkill: "All",
    });

    addToast(
      "Filters reset to default",
      "info"
    );
  }, [addToast]);

  // ============================================================
  // CONTEXT
  // ============================================================

  return (
    <AppContext.Provider
      value={{
        // ======================================================
        // AUTH
        // ======================================================

        user,
        isAuthenticated,
        authLoading,

        login,
        signup,
        logout,
        updateProfile,

        // ======================================================
        // JOBS
        // ======================================================

        jobs,
        jobsLoading,
        loadJobs,

        // ======================================================
        // SAVED JOBS
        // ======================================================

        savedJobs,
        isJobSaved,
        toggleSaveJob,
        removeSavedJob,

        // ======================================================
        // SWIPES
        // ======================================================

        swipedState,
        handleSwipeLeft,
        handleSwipeRight,
        resetSwipes,

        // ======================================================
        // APPLICATIONS
        // ======================================================

        applications,
        applyToJob,

        // ======================================================
        // NOTIFICATIONS
        // ======================================================

        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotification,

        // ======================================================
        // RESUME
        // ======================================================

        resumeAnalysis,
        setResumeAnalysis,

        // ======================================================
        // SEARCH
        // ======================================================

        searchQuery,
        setSearchQuery,

        activeFilterPill,
        setActiveFilterPill,

        filters,
        setFilters,
        resetFilters,

        // ======================================================
        // MODALS
        // ======================================================

        applyModalJob,
        setApplyModalJob,

        isFilterModalOpen,
        setIsFilterModalOpen,

        // ======================================================
        // TOASTS
        // ======================================================

        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used within an AppProvider"
    );
  }

  return context;
}