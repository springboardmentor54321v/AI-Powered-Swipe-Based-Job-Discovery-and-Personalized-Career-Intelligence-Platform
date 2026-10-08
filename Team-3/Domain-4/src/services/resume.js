/**
 * SwipeX Resume Service Layer — Milestone 3 (Live Backend Integration)
 * 
 * Live M3 API Contracts:
 * - POST /api/v1/resumes/upload (multipart/form-data: file, optional label)
 *     -> returns ResumeUploadResponse
 * - GET  /api/v1/resumes/
 *     -> returns ResumeListResponse (User's resumes and versions)
 * - GET  /api/v1/resumes/{resume_id}/versions/{version_id}
 *     -> returns ResumeVersionDetailResponse
 * - POST /api/v1/ats/score
 *     -> returns ATSScoreResponse
 * 
 * Maintained by Intern 1 (Frontend & User Experience)
 * Aligned with Domain-1 (Intern 2) OpenAPI 3.0 Contract.
 */

import api, { ApiError } from './api.js';

const RESUME_STORAGE_KEY = 'swipex_active_resume';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per M3 specification
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

/**
 * Normalizes an individual raw version object from list or detail responses.
 */
function normalizeVersion(ver, parentResumeId = null) {
  if (!ver) return null;

  const versionId = ver.version_id || ver.id || `ver_${Date.now()}`;
  const resumeId = ver.resume_id || parentResumeId || `res_${Date.now()}`;
  const filename = ver.original_filename || ver.filename || 'Resume Document';
  const isDocx = filename.toLowerCase().endsWith('.docx');

  // Parse extracted skills safely into normalized array of objects
  let extractedSkills = [];
  if (Array.isArray(ver.extracted_skills)) {
    extractedSkills = ver.extracted_skills.map((s) => {
      if (typeof s === 'string') {
        return { skill_name: s, normalized_name: s.toLowerCase(), source: 'pdf_parser', confidence: null };
      }
      return {
        skill_name: s.skill_name || s.name || 'Skill',
        normalized_name: s.normalized_name || (s.skill_name || '').toLowerCase(),
        source: s.source || 'pdf_parser',
        confidence: typeof s.confidence === 'number' ? s.confidence : null,
      };
    });
  } else if (Array.isArray(ver.parsed_skills)) {
    extractedSkills = ver.parsed_skills.map((s) => {
      if (typeof s === 'string') {
        return { skill_name: s, normalized_name: s.toLowerCase(), source: 'pdf_parser', confidence: null };
      }
      return {
        skill_name: s.skill_name || s.name || 'Skill',
        normalized_name: s.normalized_name || (s.skill_name || '').toLowerCase(),
        source: s.source || 'pdf_parser',
        confidence: typeof s.confidence === 'number' ? s.confidence : null,
      };
    });
  }

  // Determine extraction status
  let extractionStatus = ver.extraction_status || 'completed';
  if (!ver.extraction_status) {
    extractionStatus = extractedSkills.length > 0 ? 'completed' : 'pending';
  }

  return {
    version_id: versionId,
    resume_id: resumeId,
    version_number: ver.version_number != null ? ver.version_number : 1,
    original_filename: filename,
    mime_type: ver.content_type || ver.mime_type || (isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf'),
    file_size_bytes: ver.file_size_bytes || 0,
    sha256_hash: ver.sha256_hash || '',
    uploaded_at: ver.uploaded_at || ver.created_at || new Date().toISOString(),
    label: ver.label || null,
    is_active: Boolean(ver.is_active || ver.is_current),
    extraction_status: extractionStatus,
    extracted_skills: extractedSkills,
    metadata: ver.metadata || {},
  };
}

export const resumeService = {
  /**
   * Get active resume metadata from local session cache
   */
  getActiveResume() {
    try {
      const raw = localStorage.getItem(RESUME_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Persist active resume metadata to session cache
   */
  setActiveResume(data) {
    try {
      if (data) {
        localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.removeItem(RESUME_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  },

  /**
   * Upload resume document (PDF or DOCX) to the LIVE backend.
   * Endpoint: POST /api/v1/resumes/upload
   * 
   * @param {File} file - Resume file (PDF or DOCX, max 5MB)
   * @param {string} [label] - Optional version label
   * @returns {Promise<Object>} Normalized newly created resume version
   */
  async uploadResume(file, label) {
    if (!file) {
      throw new ApiError('No file selected. Please choose a PDF or DOCX resume document.', 400);
    }

    // Client-side extension validation
    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      throw new ApiError('Unsupported file format. Please upload a PDF (.pdf) or DOCX (.docx) document.', 400);
    }

    // Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError('File is too large. Maximum permitted file size is 5MB.', 400);
    }

    const formData = new FormData();
    formData.append('file', file);
    if (label && typeof label === 'string' && label.trim()) {
      formData.append('label', label.trim());
    }

    // Execute live multipart/form-data upload
    const response = await api.upload('/resumes/upload', formData);

    // Normalize response according to Day-1/Day-2 OpenAPI schema
    const normalized = normalizeVersion(response);

    // Sync newly active uploaded version with local session
    this.setActiveResume({
      resume_id: normalized.resume_id,
      version_id: normalized.version_id,
      version_number: normalized.version_number,
      filename: normalized.original_filename,
      parsed_skills: normalized.extracted_skills.map((s) => s.skill_name),
      uploaded_at: normalized.uploaded_at,
      label: normalized.label,
      extraction_status: normalized.extraction_status,
    });

    return normalized;
  },

  /**
   * List all resumes and version history for the authenticated Job Seeker.
   * Endpoint: GET /api/v1/resumes/
   * 
   * @param {Object} [params] - Query options: { page, page_size }
   * @returns {Promise<{ resumes: Array, versions: Array, count: number }>}
   */
  async listResumes(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.page_size) query.append('page_size', String(params.page_size));

    const endpoint = `/resumes/${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await api.get(endpoint);

    // Handle possible response structures:
    // 1. DRF standard paginated: { count: N, results: [ ... ] }
    // 2. Direct array: [ ... ]
    // 3. Object with resumes: { resumes: [ ... ] }
    let rawResumes = [];
    let totalCount = 0;

    if (Array.isArray(response)) {
      rawResumes = response;
      totalCount = response.length;
    } else if (response && Array.isArray(response.results)) {
      rawResumes = response.results;
      totalCount = typeof response.count === 'number' ? response.count : response.results.length;
    } else if (response && Array.isArray(response.resumes)) {
      rawResumes = response.resumes;
      totalCount = typeof response.total === 'number' ? response.total : response.resumes.length;
    }

    // Flatten all versions across resumes
    const allVersions = [];
    const normalizedResumes = [];

    for (const resume of rawResumes) {
      const resumeId = resume.resume_id || resume.id;

      // Extract versions from resume.versions array if provided
      if (Array.isArray(resume.versions) && resume.versions.length > 0) {
        for (const ver of resume.versions) {
          const normVer = normalizeVersion(ver, resumeId);
          if (normVer) allVersions.push(normVer);
        }
      } else if (resume.current_version && typeof resume.current_version === 'object') {
        const normVer = normalizeVersion(resume.current_version, resumeId);
        if (normVer) allVersions.push(normVer);
      } else if (resume.original_filename || resume.filename) {
        // Flat resume version object fallback
        const normVer = normalizeVersion(resume, resumeId);
        if (normVer) allVersions.push(normVer);
      }

      normalizedResumes.push({
        resume_id: resumeId,
        created_at: resume.created_at || new Date().toISOString(),
        updated_at: resume.updated_at || new Date().toISOString(),
        version_count: resume.version_count || (resume.versions ? resume.versions.length : 1),
        current_version_id: resume.current_version_id || resume.current_version?.version_id || null,
        original_filename: resume.original_filename || resume.current_version?.original_filename || 'Resume',
        skills_summary: Array.isArray(resume.skills_summary) ? resume.skills_summary : [],
      });
    }

    // Sort versions by version_number descending (latest first)
    allVersions.sort((a, b) => (b.version_number || 0) - (a.version_number || 0));

    // Update active resume cache if active version exists and cache is empty
    const currentActive = allVersions.find((v) => v.is_active) || allVersions[0];
    if (currentActive && !this.getActiveResume()) {
      this.setActiveResume({
        resume_id: currentActive.resume_id,
        version_id: currentActive.version_id,
        version_number: currentActive.version_number,
        filename: currentActive.original_filename,
        parsed_skills: currentActive.extracted_skills.map((s) => s.skill_name),
        uploaded_at: currentActive.uploaded_at,
        label: currentActive.label,
        extraction_status: currentActive.extraction_status,
      });
    }

    return {
      count: totalCount,
      resumes: normalizedResumes,
      versions: allVersions,
    };
  },

  /**
   * Alias for listResumes
   */
  async getResumes(params = {}) {
    return this.listResumes(params);
  },

  /**
   * Get detailed metadata and extracted skills for a specific resume version.
   * Endpoint: GET /api/v1/resumes/{resume_id}/versions/{version_id}
   * 
   * @param {string} resumeId - Resume UUID
   * @param {string} versionId - Version UUID
   * @returns {Promise<Object>} Normalized version details with extracted_skills
   */
  async getVersionDetail(resumeId, versionId) {
    if (!resumeId || !versionId) {
      throw new ApiError('Resume ID and Version ID are required.', 400);
    }

    try {
      const response = await api.get(`/resumes/${resumeId}/versions/${versionId}`);
      return normalizeVersion(response, resumeId);
    } catch (err) {
      // If version detail endpoint is not yet mounted (404/501), return safe fallback
      if (err?.status === 404 || err?.status === 501 || err?.status === 0) {
        return {
          version_id: versionId,
          resume_id: resumeId,
          version_number: 1,
          original_filename: 'Resume',
          mime_type: 'application/pdf',
          file_size_bytes: 0,
          sha256_hash: '',
          uploaded_at: new Date().toISOString(),
          label: null,
          is_active: true,
          extraction_status: 'pending',
          extracted_skills: [],
          detail_unavailable: true,
          metadata: {},
        };
      }
      throw err;
    }
  },

  /** Parse the selected resume and persist its extracted skills. */
  async parseResume(resumeId) {
    if (!resumeId) {
      throw new ApiError('Resume ID is required to parse the uploaded document.', 400);
    }
    return api.post(`/resumes/${resumeId}/parse`, {});
  },

  /**
   * Fetch ATS match score for a resume against a target job.
   * Preserved for Milestone 2 backward compatibility.
   * 
   * @param {string} resumeId
   * @param {string|number} [jobId]
   */
  async getAtsScore(resumeId, jobId = 1) {
    try {
      const res = await api.post('/ats/score', {
        resume_id: String(resumeId),
        job_id: String(jobId),
      });

      return {
        match_score: typeof res?.final_ats_score === 'number'
          ? res.final_ats_score
          : typeof res?.match_score === 'number' ? res.match_score : null,
        matched_skills: Array.isArray(res?.matched_skills) ? res.matched_skills : [],
        missing_skills: Array.isArray(res?.missing_skills) ? res.missing_skills : [],
        missing_keywords: Array.isArray(res?.missing_keywords) ? res.missing_keywords : [],
        keyword_score: typeof res?.keyword_score === 'number' ? res.keyword_score : null,
        semantic_similarity: typeof res?.semantic_score === 'number'
          ? res.semantic_score
          : typeof res?.semantic_similarity === 'number'
          ? (res.semantic_similarity <= 1 ? res.semantic_similarity * 100 : res.semantic_similarity)
          : null,
        suggestions: Array.isArray(res?.suggestions) ? res.suggestions : [],
        generated_by: res?.generated_by || 'blended-keyword-semantic-v1',
      };
    } catch {
      return null;
    }
  },
};

export default resumeService;
