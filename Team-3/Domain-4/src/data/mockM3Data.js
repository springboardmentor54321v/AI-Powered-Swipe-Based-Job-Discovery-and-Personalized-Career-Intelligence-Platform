/**
 * SwipeX Milestone 3 — Local Mock Data Fixtures
 * 
 * Aligned with the Milestone 3 OpenAPI Contract (milestone-3-api-contract.yaml)
 * and Intern 2 / Intern 4 schema handoff notes.
 * Used for Day 2 UI scaffolding and standalone frontend testing.
 */

export const mockResumeVersions = [
  {
    version_id: 'v-9a8b-11ee',
    resume_id: 'res-a1b2-c3d4',
    version_number: 2,
    original_filename: 'alex_chen_senior_fullstack_2026.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 245760,
    sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploaded_at: '2026-09-22T10:30:00Z',
    label: 'Full Stack & Cloud Lead — Target TechCorp',
    is_active: true,
    extraction_status: 'completed',
    extracted_skills: [
      { skill_name: 'Python', normalized_name: 'python', source: 'pdf_parser', confidence: 98.5 },
      { skill_name: 'Django', normalized_name: 'django', source: 'pdf_parser', confidence: 96.0 },
      { skill_name: 'React.js', normalized_name: 'react', source: 'nlp_ner', confidence: 95.0 },
      { skill_name: 'PostgreSQL', normalized_name: 'postgresql', source: 'pdf_parser', confidence: 92.0 },
      { skill_name: 'REST API', normalized_name: 'rest-api', source: 'nlp_ner', confidence: 94.0 },
      { skill_name: 'Docker', normalized_name: 'docker', source: 'nlp_ner', confidence: 89.5 },
      { skill_name: 'Git', normalized_name: 'git', source: 'pdf_parser', confidence: 99.0 },
      { skill_name: 'Tailwind CSS', normalized_name: 'tailwind-css', source: 'nlp_ner', confidence: 91.0 },
      { skill_name: 'TypeScript', normalized_name: 'typescript', source: 'pdf_parser', confidence: 87.0 },
      { skill_name: 'Redis', normalized_name: 'redis', source: 'nlp_ner', confidence: 84.0 },
    ],
    metadata: {
      page_count: 2,
      language: 'en',
    },
  },
  {
    version_id: 'v-3c4d-22ff',
    resume_id: 'res-a1b2-c3d4',
    version_number: 1,
    original_filename: 'alex_chen_general_swe.pdf',
    mime_type: 'application/pdf',
    file_size_bytes: 184320,
    sha256_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    uploaded_at: '2026-09-14T14:15:00Z',
    label: 'General Software Engineering Baseline',
    is_active: false,
    extraction_status: 'completed',
    extracted_skills: [
      { skill_name: 'Python', normalized_name: 'python', source: 'pdf_parser', confidence: 95.0 },
      { skill_name: 'Flask', normalized_name: 'flask', source: 'pdf_parser', confidence: 90.0 },
      { skill_name: 'JavaScript', normalized_name: 'javascript', source: 'nlp_ner', confidence: 88.0 },
      { skill_name: 'SQLite', normalized_name: 'sqlite', source: 'pdf_parser', confidence: 85.0 },
      { skill_name: 'HTML/CSS', normalized_name: 'html-css', source: 'pdf_parser', confidence: 92.0 },
      { skill_name: 'Git', normalized_name: 'git', source: 'pdf_parser', confidence: 96.0 },
    ],
    metadata: {
      page_count: 1,
      language: 'en',
    },
  },
];

export const mockJobCatalog = [
  {
    job_id: 'job-101',
    title: 'Senior Python / Full Stack Engineer',
    company: 'TechCorp India',
    location: 'Hyderabad / Hybrid',
    salary: '₹24L - ₹32L LPA',
    required_skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS Cloud'],
    keywords: ['Microservices', 'CI/CD Pipelines', 'REST APIs', 'PyTest', 'Distributed Systems'],
  },
  {
    job_id: 'job-102',
    title: 'Frontend UI/UX Architect',
    company: 'AeroStack Systems',
    location: 'Bangalore / Remote',
    salary: '₹22L - ₹30L LPA',
    required_skills: ['React.js', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL'],
    keywords: ['Design Systems', 'Web Performance', 'State Management', 'Jest', 'Accessibility'],
  },
  {
    job_id: 'job-103',
    title: 'Cloud DevOps & Platform Specialist',
    company: 'NovaTech Labs',
    location: 'Pune / Remote',
    salary: '₹26L - ₹35L LPA',
    required_skills: ['Docker', 'Kubernetes', 'AWS Cloud', 'Terraform', 'CI/CD Pipelines'],
    keywords: ['Prometheus', 'Grafana', 'Infrastructure as Code', 'Linux', 'Security Compliance'],
  },
];

export const mockAtsEvaluations = {
  'v-9a8b-11ee_job-101': {
    resume_id: 'res-a1b2-c3d4',
    version_id: 'v-9a8b-11ee',
    job_id: 'job-101',
    match_score: 84.5,
    keyword_score: 80.0,
    semantic_similarity: 87.5,
    matched_skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API'],
    missing_skills: ['Kubernetes', 'AWS Cloud'],
    missing_keywords: ['Microservices', 'CI/CD Pipelines', 'PyTest', 'Distributed Systems'],
    suggestions: [
      'Highlight any hands-on Kubernetes container orchestration in your project bullet points.',
      'Mention AWS cloud experience (EC2, S3, RDS) to cross the 90% benchmark.',
      'Quantify your backend API performance optimizations (e.g. reduced response times).',
    ],
    generated_by: 'semantic-v1',
    scored_at: '2026-09-23T11:20:00Z',
  },
  'v-9a8b-11ee_job-102': {
    resume_id: 'res-a1b2-c3d4',
    version_id: 'v-9a8b-11ee',
    job_id: 'job-102',
    match_score: 72.0,
    keyword_score: 68.0,
    semantic_similarity: 74.7,
    matched_skills: ['React.js', 'TypeScript', 'Tailwind CSS'],
    missing_skills: ['Next.js', 'GraphQL'],
    missing_keywords: ['Design Systems', 'Web Performance', 'Accessibility', 'Jest'],
    suggestions: [
      'Incorporate Next.js server-side rendering or static generation projects.',
      'Add experience with GraphQL schemas or queries to improve frontend alignment.',
    ],
    generated_by: 'semantic-v1',
    scored_at: '2026-09-23T11:22:00Z',
  },
  'v-9a8b-11ee_job-103': {
    resume_id: 'res-a1b2-c3d4',
    version_id: 'v-9a8b-11ee',
    job_id: 'job-103',
    match_score: 54.0,
    keyword_score: 45.0,
    semantic_similarity: 60.0,
    matched_skills: ['Docker'],
    missing_skills: ['Kubernetes', 'AWS Cloud', 'Terraform', 'CI/CD Pipelines'],
    missing_keywords: ['Prometheus', 'Grafana', 'Infrastructure as Code', 'Linux'],
    suggestions: [
      'This role requires strong infrastructure engineering. Emphasize cloud provisioning and automation tools.',
    ],
    generated_by: 'semantic-v1',
    scored_at: '2026-09-23T11:25:00Z',
  },
  'v-3c4d-22ff_job-101': {
    resume_id: 'res-a1b2-c3d4',
    version_id: 'v-3c4d-22ff',
    job_id: 'job-101',
    match_score: 48.5,
    keyword_score: 35.0,
    semantic_similarity: 57.5,
    matched_skills: ['Python'],
    missing_skills: ['Django', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS Cloud'],
    missing_keywords: ['Microservices', 'CI/CD Pipelines', 'REST APIs', 'PyTest'],
    suggestions: [
      'Resume Version 1 lacks modern enterprise framework and container keywords. Switch to Version 2 for higher score.',
    ],
    generated_by: 'semantic-v1',
    scored_at: '2026-09-23T11:28:00Z',
  },
};

export const mockOptimizationSuggestions = [
  {
    category: 'skills',
    priority: 'high',
    title: 'Add Cloud Infrastructure Experience',
    detail: 'Your resume shows strong backend Python and Django skills, but omits AWS or cloud deployments. 78% of matched openings require demonstrable cloud experience.',
    related_skills: ['AWS EC2', 'AWS RDS', 'Docker Compose', 'Kubernetes'],
  },
  {
    category: 'experience',
    priority: 'medium',
    title: 'Quantify Engineering Impact in Bullet Points',
    detail: 'Several experience points describe tasks rather than business outcomes. Reframe with metrics such as "Reduced database query latency by 35% using indexing and Redis caching".',
    related_skills: ['Redis', 'Query Optimization'],
  },
  {
    category: 'formatting',
    priority: 'low',
    title: 'Standardize Technical Skills Section Heading',
    detail: 'Using conventional headers like "Core Technical Competencies" or "Technical Skills" maximizes parsing accuracy across enterprise ATS scanners.',
    related_skills: null,
  },
];
