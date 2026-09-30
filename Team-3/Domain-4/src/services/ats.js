/**
 * SwipeX ATS Scoring Service Layer — Milestone 3 (Live Backend Integration)
 * 
 * Contract:
 * - POST /api/v1/ats/score
 * Request:
 *   {
 *     "resume_id": "<uuid>",
 *     "job_id": "<string|uuid>"
 *   }
 * Response:
 *   {
 *     "resume_id": "...",
 *     "job_id": "...",
 *     "match_score": 78.5,
 *     "matched_skills": ["Python", "Django"],
 *     "missing_skills": ["Kubernetes", "AWS"],
 *     "missing_keywords": ["Microservices", ...],
 *     "suggestions": ["..."],
 *     "generated_by": "semantic-v1",
 *     "scored_at": "..."
 *   }
 * 
 * Maintained by Intern 1 (Frontend & User Experience)
 * Aligned with Domain-1 (Intern 2) OpenAPI 3.0 Contract.
 */

import api, { ApiError } from './api.js';

/**
 * Normalizes the raw ATS response into a safe, consistent presentation structure.
 */
export function normalizeAtsResult(raw, resumeId, jobId) {
  if (!raw) return null;

  const matchScore = typeof raw.final_ats_score === 'number'
    ? raw.final_ats_score
    : typeof raw.match_score === 'number'
    ? raw.match_score
    : typeof raw.score === 'number'
    ? raw.score
    : typeof raw.compatibility_score === 'number'
    ? raw.compatibility_score
    : 0;

  const matchedSkills = Array.isArray(raw.matched_skills)
    ? raw.matched_skills.map((s) => typeof s === 'string' ? s : s.skill_name || String(s)).filter(Boolean)
    : [];

  const missingSkills = Array.isArray(raw.missing_skills)
    ? raw.missing_skills.map((s) => typeof s === 'string' ? s : s.skill_name || String(s)).filter(Boolean)
    : [];

  const missingKeywords = Array.isArray(raw.missing_keywords)
    ? raw.missing_keywords.map((k) => typeof k === 'string' ? k : k.keyword || String(k)).filter(Boolean)
    : [];

  // Normalize suggestions array (can be strings or objects)
  let suggestions = [];
  if (Array.isArray(raw.suggestions)) {
    suggestions = raw.suggestions.map((s, idx) => {
      if (typeof s === 'string') {
        const isHigh = idx === 0 && matchScore < 80;
        return {
          title: `Optimization Tip #${idx + 1}`,
          detail: s,
          category: 'skills',
          priority: isHigh ? 'high' : 'medium',
          related_skills: null,
        };
      }
      return {
        title: s.title || `Optimization Tip #${idx + 1}`,
        detail: s.detail || s.message || s.text || '',
        category: s.category || 'skills',
        priority: s.priority || 'medium',
        related_skills: Array.isArray(s.related_skills) ? s.related_skills : null,
      };
    });
  }

  return {
    resume_id: raw.resume_id || resumeId,
    job_id: raw.job_id || jobId,
    match_score: Math.round(matchScore * 10) / 10,
    keyword_score: typeof raw.keyword_score === 'number' ? raw.keyword_score : null,
    semantic_similarity: typeof raw.semantic_score === 'number'
      ? raw.semantic_score
      : typeof raw.semantic_similarity === 'number'
      ? (raw.semantic_similarity <= 1 ? raw.semantic_similarity * 100 : raw.semantic_similarity)
      : null,
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    missing_keywords: missingKeywords,
    suggestions: suggestions,
    raw_suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
    generated_by: raw.generated_by || 'blended-keyword-semantic-v1',
    scored_at: raw.scored_at || new Date().toISOString(),
  };
}

export const atsService = {
  /**
   * Request live ATS compatibility scoring for a selected resume version and job.
   * Endpoint: POST /api/v1/ats/score
   * 
   * @param {string} resumeId - UUID of the candidate's resume or version
   * @param {string|number} jobId - Identifier of the target job requisition
   * @returns {Promise<Object>} Normalized ATS score result
   */
  async scoreResume(resumeId, jobId) {
    if (!resumeId) {
      throw new ApiError('Please select a resume version to analyze.', 400);
    }
    if (!jobId) {
      throw new ApiError('Please select a target job opening to analyze against.', 400);
    }

    const payload = {
      resume_id: String(resumeId),
      job_id: String(jobId),
    };

    const response = await api.post('/ats/score', payload);
    return normalizeAtsResult(response, resumeId, jobId);
  },
};

export default atsService;
