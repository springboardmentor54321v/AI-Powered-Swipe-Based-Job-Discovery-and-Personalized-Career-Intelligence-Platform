/**
 * SwipeX Career Recommendation Service Layer — Milestone 3 (Upgraded Recommendations)
 * 
 * Contracts:
 * - GET /api/v1/recommendations/?resume_id={uuid}&limit=10&include_ats=true
 * 
 * New Milestone 3 Fields:
 * - match_type: "semantic" | "heuristic" | "hybrid"
 * - ats_score: float | null (computed when include_ats=true)
 * - semantic_similarity: float | null (cosine similarity 0.0 - 1.0)
 * 
 * Preserves M2 Backward Compatibility:
 * - match_score / match_percentage
 * - reason_tags
 * - generated_by
 * 
 * Maintained by Intern 1 (Frontend & User Experience)
 * Aligned with Domain-1 (Intern 2) OpenAPI 3.0 Contract.
 */

import api, { ApiError } from './api.js';

/**
 * Normalizes a single recommended job item from the upgraded Recommendation Engine.
 */
export function normalizeRecommendation(item) {
  if (!item) return null;

  const rawScore = item.match_percentage ?? item.match_score ?? item.score;
  const score = typeof rawScore === 'number'
    ? Math.round(rawScore > 1 ? rawScore : rawScore * 100)
    : null;

  const atsScore = typeof item.ats_score === 'number' ? Math.round(item.ats_score) : null;
  const semanticSimilarity = typeof item.semantic_similarity === 'number' ? item.semantic_similarity : null;
  const matchType = item.match_type || (semanticSimilarity !== null ? 'semantic' : 'heuristic');

  // Reason tags
  let tags = [];
  if (Array.isArray(item.reason_tags) && item.reason_tags.length > 0) {
    tags = item.reason_tags;
  } else {
    tags = [];
    if (score !== null) tags.push(`${score}% Skill alignment`);
    if (matchType === 'semantic') tags.push('Semantic sentence embedding fit');
    else if (matchType) tags.push('Capability match with profile');
    if (atsScore !== null) tags.push(`ATS Compatibility: ${atsScore}%`);
  }

  // Skills
  let skills = [];
  if (Array.isArray(item.skills)) {
    skills = item.skills;
  } else if (typeof item.skills === 'string') {
    skills = item.skills.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
  }

  return {
    job_id: item.job_id || item.id,
    id: item.job_id || item.id,
    title: item.title || 'Engineering Specialist',
    company: item.company || 'Enterprise Partner',
    location: item.location || 'Remote / Flexible',
    salary: item.salary || item.salary_range || 'Competitive',
    skills: skills,
    match_percentage: score,
    match_score: score,
    match_type: matchType,
    ats_score: atsScore,
    semantic_similarity: semanticSimilarity,
    reason_tags: tags,
    generated_by: item.generated_by || (matchType === 'semantic' ? 'semantic-v1' : 'heuristic-v0'),
  };
}

export const recommendationService = {
  /**
   * Fetch personalized job recommendations for an authenticated candidate.
   * Milestone 3 adds semantic-similarity and ATS-aware scoring.
   * Endpoint: GET /api/v1/recommendations/?resume_id={uuid}&limit=10&include_ats=true
   * 
   * @param {string|number} [userId] - Candidate User ID
   * @param {string} [resumeId] - Candidate Resume UUID
   * @param {Object} [options] - Additional query options ({ limit, include_ats })
   * @returns {Promise<Array<Object>>} Normalized list of recommended jobs
   */
  async getRecommendations(userId, resumeId, options = {}) {
    const queryParams = new URLSearchParams();
    if (resumeId) queryParams.append('resume_id', String(resumeId));
    if (userId) queryParams.append('user_id', String(userId));

    const limit = options.limit || 10;
    queryParams.append('limit', String(limit));

    const includeAts = options.include_ats !== undefined ? options.include_ats : true;
    queryParams.append('include_ats', String(includeAts));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/recommendations/?${queryString}` : '/recommendations/';
    const response = await api.get(endpoint);

    // Parse list from various response wrappers
    let list = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (response && Array.isArray(response.recommendations)) {
      list = response.recommendations;
    } else if (response && Array.isArray(response.results)) {
      list = response.results;
    } else if (response && Array.isArray(response.data)) {
      list = response.data;
    }

    return list.map(normalizeRecommendation).filter(Boolean);
  },
};

export default recommendationService;
