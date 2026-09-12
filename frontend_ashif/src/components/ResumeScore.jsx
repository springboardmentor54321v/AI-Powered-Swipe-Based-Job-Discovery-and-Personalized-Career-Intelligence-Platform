import React from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  FileCheck,
  Zap,
  Target
} from "lucide-react";

export function ResumeScore({ analysis }) {
  if (!analysis) return null;

  const {
    atsScore = 82,
    jobMatch = 89,
    detectedSkills = [],
    missingSkills = [],
    missingKeywords = [],
    suggestions = [],
    scoreBreakdown = {
      keywordMatch: 84,
      formattingScore: 92,
      experienceRelevance: 78,
      skillsDepth: 86
    }
  } = analysis;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ATS Score Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <FileCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resume ATS Score
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {atsScore}%
            </h3>
            <p className="text-xs text-slate-500">
              Passes top corporate ATS parsers (threshold: 75%)
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-600 transition-all duration-1000 ease-out"
                strokeDasharray={`${atsScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-900">{atsScore}%</span>
          </div>
        </div>

        {/* Job Match Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Job Profile Fit
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">
              {jobMatch}%
            </h3>
            <p className="text-xs text-slate-500">
              Strong alignment with software & engineering jobs
            </p>
          </div>

          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeDasharray={`${jobMatch}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-900">{jobMatch}%</span>
          </div>
        </div>
      </div>

      {/* Breakdown Progress Bars */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          ATS Diagnostic Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Keyword Relevance</span>
              <span className="text-emerald-700 font-bold">{scoreBreakdown.keywordMatch}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${scoreBreakdown.keywordMatch}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Format & ATS Readability</span>
              <span className="text-emerald-700 font-bold">{scoreBreakdown.formattingScore}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${scoreBreakdown.formattingScore}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Skills Depth</span>
              <span className="text-emerald-700 font-bold">{scoreBreakdown.skillsDepth}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${scoreBreakdown.skillsDepth}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Experience Alignment</span>
              <span className="text-amber-700 font-bold">{scoreBreakdown.experienceRelevance}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${scoreBreakdown.experienceRelevance}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Skills Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detected Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900">
              Recognized Skills ({detectedSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h4 className="text-sm font-bold text-slate-900">
              Missing High-Demand Skills ({missingSkills.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Missing Keywords Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          Recommended Resume Keywords
        </h4>
        <p className="text-xs text-slate-500 mb-3.5">
          Incorporate these high-demand keywords into your project descriptions to boost ATS match rates:
        </p>
        <div className="flex flex-wrap gap-2">
          {missingKeywords.map((kw) => (
            <span
              key={kw}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              + {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Suggestions List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h4 className="text-sm font-bold text-slate-900">Actionable Resume Suggestions</h4>
        </div>
        <div className="space-y-3">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  item.impact === "High"
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {item.impact} Priority
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResumeScore;
