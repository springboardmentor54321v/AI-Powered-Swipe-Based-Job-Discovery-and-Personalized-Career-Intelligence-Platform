/**
 * SwipeX AI Suggestions Service Layer — Milestone 3 (Live Backend Integration)
 * 
 * Contract:
 * - POST /api/v1/suggestions/
 * Request:
 *   {
 *     "resume_id": "<uuid>",
 *     "job_id": "<optional string/uuid>"
 *   }
 * Response:
 *   {
 *     "resume_id": "...",
 *     "job_id": null,
 *     "source": "ai_generated | rule_based",
 *     "suggestions": [
 *       {
 *         "category": "skills | experience | formatting | keywords | education | summary | general",
 *         "priority": "high | medium | low",
 *         "title": "string",
 *         "detail": "string",
 *         "related_skills": ["string"] | null
 *       }
 *     ],
 *     "generated_at": "ISO date-time"
 *   }
 * 
 * Maintained by Intern 1 (Frontend & User Experience)
 * Aligned with Domain-1 (Intern 2) OpenAPI 3.0 Contract.
 */

import api, { ApiError } from './api.js';

/**
 * Normalizes raw suggestions response into consistent UI models.
 */
export function normalizeSuggestionsResult(raw, resumeId, jobId = null) {
  if (!raw) return { resume_id: resumeId, job_id: jobId, source: 'rule_based', suggestions: [] };

  // Determine generator source: 'ai_generated' vs 'rule_based'
  const source = raw.source === 'ai_generated' ? 'ai_generated' : 'rule_based';

  let rawList = [];
  if (Array.isArray(raw)) {
    rawList = raw;
  } else if (Array.isArray(raw.suggestions)) {
    rawList = raw.suggestions;
  } else if (Array.isArray(raw.results)) {
    rawList = raw.results;
  }

  const normalizedList = rawList.map((item, idx) => {
    if (typeof item === 'string') {
      return {
        title: `Optimization Tip #${idx + 1}`,
        detail: item,
        category: 'General',
        priority: idx === 0 ? 'high' : 'medium',
        related_skills: null,
      };
    }

    return {
      title: item.title || `Optimization Tip #${idx + 1}`,
      detail: item.detail || item.message || item.text || '',
      category: item.category ? (item.category.charAt(0).toUpperCase() + item.category.slice(1)) : 'General',
      priority: (item.priority || 'medium').toLowerCase(),
      related_skills: Array.isArray(item.related_skills) ? item.related_skills : null,
    };
  });

  return {
    resume_id: raw.resume_id || resumeId,
    job_id: raw.job_id || jobId || null,
    source: source,
    suggestions: normalizedList,
    generated_at: raw.generated_at || new Date().toISOString(),
  };
}

export const suggestionsService = {
  /**
   * Fetch AI/Rule-based optimization suggestions for a candidate resume.
   * Optionally targeted at a specific job requisition.
   * Endpoint: POST /api/v1/suggestions/
   * 
   * @param {string} resumeId - Candidate resume UUID
   * @param {string|number} [jobId] - Optional target job ID
   * @returns {Promise<{ source: string, suggestions: Array, resume_id: string, job_id: string|null }>}
   */
  async getSuggestions(resumeId, jobId = null) {
    if (!resumeId) {
      throw new ApiError('Resume ID is required to generate optimization suggestions.', 400);
    }

    const payload = {
      resume_id: String(resumeId),
      job_id: jobId ? String(jobId) : null,
    };

    const response = await api.post('/suggestions/', payload);
    return normalizeSuggestionsResult(response, resumeId, jobId);
  },
};

export default suggestionsService;
