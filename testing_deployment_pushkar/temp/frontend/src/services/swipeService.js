import { jobService } from "./jobService";

/**
 * Swipe Service
 * Keeps a local swipe log and syncs real swipes to the backend:
 *   right swipe  -> RIGHT  (job-service creates the swipe AND the application = apply)
 *   left swipe   -> LEFT   (skip)
 *   save button  -> POST /jobs/:id/save   (separate saved_jobs table)
 * The AI service reads all of these tables to personalise recommendations.
 */

const SWIPE_STORAGE_KEY = "swipex_swipe_history";

const toBackendAction = (action) => {
  const a = String(action).toLowerCase();
  if (["interested", "right", "apply", "applied"].includes(a)) return "RIGHT";
  if (["skipped", "left", "skip"].includes(a)) return "LEFT";
  if (["saved", "save"].includes(a)) return "SAVE";
  return null;
};

// Mock/demo jobs have ids like "job-1"; only real database ids are synced.
const isBackendId = (id) => Number.isInteger(Number(id)) && Number(id) > 0;
const hasSession = () => Boolean(localStorage.getItem("swipex_access_token"));

export async function recordSwipe(jobId, action) {
  const swipeRecord = { jobId, action, timestamp: new Date().toISOString() };

  try {
    const raw = localStorage.getItem(SWIPE_STORAGE_KEY);
    const history = raw ? JSON.parse(raw) : [];
    localStorage.setItem(SWIPE_STORAGE_KEY, JSON.stringify([swipeRecord, ...history]));
  } catch (error) {
    console.warn("Failed to persist swipe record to localStorage:", error);
  }

  const backendAction = toBackendAction(action);
  if (backendAction && isBackendId(jobId) && hasSession()) {
    try {
      if (backendAction === "SAVE") {
        await jobService.saveJob(Number(jobId));
      } else {
        await jobService.swipeJob(Number(jobId), backendAction);
      }
    } catch (apiErr) {
      console.info("Swipe kept locally (backend call failed):", apiErr?.message);
    }
  }

  return swipeRecord;
}

export async function removeSavedJob(jobId) {
  if (isBackendId(jobId) && hasSession()) {
    try {
      await jobService.unsaveJob(Number(jobId));
    } catch (err) {
      console.info("Unsave kept locally (backend call failed):", err?.message);
    }
  }
  return { success: true, jobId };
}

/** Undo is local only: the backend has no undo endpoint yet. */
export async function undoSwipe(jobId) {
  try {
    const raw = localStorage.getItem(SWIPE_STORAGE_KEY);
    if (raw) {
      const history = JSON.parse(raw).filter((item) => item.jobId !== jobId);
      localStorage.setItem(SWIPE_STORAGE_KEY, JSON.stringify(history));
    }
  } catch (error) {
    console.warn("Failed to update localStorage on undo:", error);
  }
  return { success: true, jobId };
}

export async function getSwipeHistory() {
  try {
    const raw = localStorage.getItem(SWIPE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Failed to load swipe history:", error);
    return [];
  }
}

export async function clearSwipeHistory() {
  localStorage.removeItem(SWIPE_STORAGE_KEY);
  return { success: true };
}

export default { recordSwipe, removeSavedJob, undoSwipe, getSwipeHistory, clearSwipeHistory };
