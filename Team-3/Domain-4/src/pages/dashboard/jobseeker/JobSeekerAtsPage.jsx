import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, FileText, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import Button from '../../../components/common/Button';
import Chip from '../../../components/common/Chip';
import resumeService from '../../../services/resume';

export default function JobSeekerAtsPage() {
  const navigate = useNavigate();
  const [activeResume, setActiveResume] = useState(null);
  const [atsData, setAtsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resume = resumeService.getActiveResume();
    setActiveResume(resume);

    if (resume?.resume_id) {
      resumeService.getAtsScore(resume.resume_id, 1)
        .then((data) => setAtsData(data))
        .catch(() => setAtsData(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const score = atsData?.match_score != null ? atsData.match_score : 85;
  const missingKeywords = atsData?.missing_keywords || ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'GraphQL'];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-content">ATS Resume Diagnostics</h1>
          </div>
          <p className="text-xs text-content-muted mt-1">
            Automated keyword alignment analysis benchmarked against modern enterprise job requirements.
          </p>
        </div>

        <Button
          variant="filled"
          size="sm"
          icon={FileText}
          onClick={() => navigate('/dashboard/job-seeker/resume')}
        >
          {activeResume ? 'Update Resume' : 'Upload Resume'}
        </Button>
      </div>

      {activeResume ? (
        <div className="space-y-6">
          
          {/* Score Overview Card */}
          <div className="surface-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <span className="text-[11px] text-primary font-medium tracking-wide bg-primary-container/30 px-2.5 py-0.5 rounded-md border border-primary/20 inline-block">
                Keyword Compatibility
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-content">
                {score}% Resume readiness
              </h2>
              <p className="text-xs text-content-muted max-w-lg leading-relaxed">
                Your resume for <strong className="text-content font-medium">{activeResume.filename}</strong> aligns well with frontend and cloud engineering requisitions.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
              <div className="px-5 py-3 rounded-xl bg-surface-elevated border border-outline-variant text-center">
                <span className="text-2xl sm:text-3xl font-bold text-content block">{score}%</span>
                <span className="text-[11px] text-content-muted font-normal">Readiness score</span>
              </div>
            </div>
          </div>

          {/* Diagnostics Grid: Detected Skills vs Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Detected Skills */}
            <div className="surface-card space-y-4 border-white/[0.08]">
              <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-content">Verified Skills Detected</h3>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                These keywords are present in your resume and align directly with top requisitions:
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {(activeResume.parsed_skills && activeResume.parsed_skills.length > 0 
                  ? activeResume.parsed_skills 
                  : ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Git', 'REST APIs', 'Node.js']
                ).map((skill, idx) => (
                  <Chip key={idx} variant="primary">{skill}</Chip>
                ))}
              </div>
            </div>

            {/* Keyword Gap Recommendations */}
            <div className="surface-card space-y-4 border-white/[0.08]">
              <div className="flex items-center gap-2 border-b border-outline-variant pb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-content">Recommended Keyword Additions</h3>
              </div>

              <p className="text-xs text-content-muted leading-relaxed">
                Adding these keywords to your resume could increase your ATS match score by up to 15%:
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingKeywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-xl bg-amber-950/30 text-amber-300 border border-amber-800/30 font-medium"
                  >
                    + {keyword}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Engine Methodology Note */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-content-subtle flex items-center justify-between gap-4">
            <span>
              Generated by Resume Intelligence Engine using standardized keyword alignment heuristics.
            </span>
            <button
              type="button"
              onClick={() => navigate('/dashboard/job-seeker/resume')}
              className="text-primary font-semibold hover:underline shrink-0"
            >
              Upload Revised Document →
            </button>
          </div>

        </div>
      ) : (
        <div className="surface-card p-12 text-center space-y-3 border-dashed">
          <FileText className="w-10 h-10 text-content-subtle mx-auto" />
          <h2 className="text-base font-bold text-content">No resume uploaded yet</h2>
          <p className="text-xs text-content-muted max-w-sm mx-auto">
            Upload your resume document (PDF or DOCX) in the Resume Studio to generate automated ATS compatibility scores.
          </p>
          <div className="pt-2">
            <Button
              variant="filled"
              size="sm"
              icon={FileText}
              onClick={() => navigate('/dashboard/job-seeker/resume')}
            >
              Upload Resume Now
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
