/**
 * Development Mock Company Service Adapter for Milestone 2 - Day 4
 * 
 * Provides mock company catalog and company detail responses aligned with
 * the backend database schema and dataset.
 */

import { MOCK_JOBS } from '../data/mockJobs.js';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const MOCK_COMPANIES = [
  {
    id: 1,
    name: 'Tata Consultancy Services',
    company_type: 'MNC',
    industry: 'IT Services & Consulting',
    headquarters: 'Mumbai, India',
    founded_year: 1968,
    website: 'https://www.tcs.com',
    description: 'A purpose-led organization that is building a meaningful future through innovation, technology, and collective knowledge across global enterprises.',
    employee_count: '600,000+',
    rating: 4.1,
  },
  {
    id: 2,
    name: 'Razorpay',
    company_type: 'Startup',
    industry: 'FinTech & Payments',
    headquarters: 'Bengaluru, India',
    founded_year: 2014,
    website: 'https://razorpay.com',
    description: 'India’s leading full-stack financial solutions company powering frictionless payments, banking, and credit lines for over 10 million businesses.',
    employee_count: '3,000+',
    rating: 4.4,
  },
  {
    id: 3,
    name: 'Zepto',
    company_type: 'Newly Founded',
    industry: 'Quick Commerce & Logistics',
    headquarters: 'Mumbai, India',
    founded_year: 2021,
    website: 'https://www.zeptonow.com',
    description: 'Hyperlocal 10-minute grocery delivery platform transforming quick-commerce supply chain logistics across Indian metropolitans.',
    employee_count: '2,500+',
    rating: 4.3,
  },
  {
    id: 4,
    name: 'Microsoft',
    company_type: 'MNC',
    industry: 'Technology & Cloud',
    headquarters: 'Hyderabad / Redmond',
    founded_year: 1975,
    website: 'https://www.microsoft.com',
    description: 'Global leader in software, cloud computing (Azure), personal hardware, and artificial intelligence powering enterprise transformation worldwide.',
    employee_count: '220,000+',
    rating: 4.5,
  },
  {
    id: 5,
    name: 'Postman',
    company_type: 'Startup',
    industry: 'Developer Tools & API Platform',
    headquarters: 'Bengaluru / San Francisco',
    founded_year: 2014,
    website: 'https://www.postman.com',
    description: 'The world’s leading API platform used by over 30 million developers to build, test, and iterate on modern API ecosystems.',
    employee_count: '1,200+',
    rating: 4.6,
  },
  {
    id: 6,
    name: 'Sarvam AI',
    company_type: 'Newly Founded',
    industry: 'Artificial Intelligence & Generative AI',
    headquarters: 'Bengaluru, India',
    founded_year: 2023,
    website: 'https://www.sarvam.ai',
    description: 'Frontier AI research company developing sovereign foundation language and speech models tailored specifically for Indian languages and context.',
    employee_count: '50-100',
    rating: 4.8,
  },
  {
    id: 7,
    name: 'NovaTech Labs',
    company_type: 'MNC',
    industry: 'Cloud Software & AI',
    headquarters: 'Bengaluru, India',
    founded_year: 2018,
    website: 'https://novatechlabs.example.com',
    description: 'Engineering intelligent distributed systems and real-time enterprise AI platforms for Fortune 500 customers.',
    employee_count: '5,000+',
    rating: 4.3,
  },
  {
    id: 8,
    name: 'AeroStack Systems',
    company_type: 'Startup',
    industry: 'Developer Tools',
    headquarters: 'Hyderabad, India',
    founded_year: 2020,
    website: 'https://aerostack.example.com',
    description: 'Building developer infrastructure and micro-frontend toolchains to accelerate cloud-native web engineering.',
    employee_count: '250+',
    rating: 4.5,
  },
  {
    id: 9,
    name: 'PixelCraft Technologies',
    company_type: 'Newly Founded',
    industry: 'Design Tech & Generative Media',
    headquarters: 'Pune, India',
    founded_year: 2024,
    website: 'https://pixelcraft.example.com',
    description: 'Next-generation visual creative suite empowering designers and engineers with AI-assisted interface scaffolding.',
    employee_count: '35+',
    rating: 4.7,
  },
];

export const mockCompanyService = {
  /**
   * List and filter companies by type or search keywords
   */
  async listCompanies(filters = {}) {
    await delay(100);

    const { company_type, type, search, q } = filters;
    const targetType = company_type || type;
    const query = (search || q || '').toLowerCase().trim();

    return MOCK_COMPANIES.filter((company) => {
      // Filter by Company Type
      if (targetType && targetType !== 'All') {
        const cType = company.company_type.toLowerCase();
        const reqType = targetType.toLowerCase();
        if (reqType === 'mnc' && cType !== 'mnc') return false;
        if (reqType === 'startup' && cType !== 'startup') return false;
        if ((reqType === 'newly founded' || reqType === 'new startup') && cType !== 'newly founded' && cType !== 'new startup') return false;
      }

      // Filter by Search Query
      if (query) {
        const matchesName = company.name.toLowerCase().includes(query);
        const matchesIndustry = company.industry.toLowerCase().includes(query);
        const matchesHq = company.headquarters.toLowerCase().includes(query);
        const matchesDesc = (company.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesIndustry && !matchesHq && !matchesDesc) return false;
      }

      return true;
    }).map((company) => {
      // Attach related open job count from mock jobs
      const openJobs = MOCK_JOBS.filter(
        (j) => j.company.toLowerCase() === company.name.toLowerCase() || j.company_id === company.id
      );
      return {
        ...company,
        open_jobs_count: openJobs.length,
      };
    });
  },

  /**
   * Fetch company details along with active job openings
   */
  async getCompanyDetail(companyId) {
    await delay(100);

    const company = MOCK_COMPANIES.find(
      (c) => String(c.id) === String(companyId) || c.name.toLowerCase() === String(companyId).toLowerCase()
    );

    if (!company) return null;

    const relatedJobs = MOCK_JOBS.filter(
      (j) => j.company.toLowerCase() === company.name.toLowerCase() || j.company_id === company.id
    );

    return {
      ...company,
      jobs: relatedJobs,
      open_jobs_count: relatedJobs.length,
    };
  },
};

export default mockCompanyService;
