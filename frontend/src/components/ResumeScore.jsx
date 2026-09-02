import React from "react";

import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  FileCheck,
  Zap,
  Target,
} from "lucide-react";


export function ResumeScore({ analysis }) {

  if (!analysis) {
    return null;
  }


  // ==========================================================
  // BACKEND VALUES
  // ==========================================================

  const atsScore =
    Number(analysis.atsScore ?? 0);

  const keywordRelevance =
    Number(
      analysis.keywordRelevance ?? 0
    );

  const formatReadability =
    Number(
      analysis.formatReadability ?? 0
    );

  const sectionCompleteness =
    Number(
      analysis.sectionCompleteness ?? 0
    );

  /*
   * Job Profile Fit is different from ATS score.
   *
   * It should only have a value when the resume has been
   * compared against a specific job.
   *
   * Therefore NULL means:
   * "Not evaluated yet"
   */
  const jobProfileFit =
    analysis.jobProfileFit ??
    null;


  // ==========================================================
  // ARRAYS
  // ==========================================================

  const detectedSkills =
    Array.isArray(analysis.skills)
      ? analysis.skills
      : Array.isArray(analysis.detectedSkills)
      ? analysis.detectedSkills
      : [];


  const missingSkills =
    Array.isArray(analysis.missingSkills)
      ? analysis.missingSkills
      : [];


  const missingKeywords =
    Array.isArray(analysis.missingKeywords)
      ? analysis.missingKeywords
      : [];


  /*
   * Backend currently returns suggestions as strings:
   *
   * [
   *   "Add a clear Experience section.",
   *   "Add more relevant technical keywords."
   * ]
   *
   * The old UI expected:
   *
   * {
   *   title,
   *   detail,
   *   impact
   * }
   *
   * So normalize both formats here.
   */

  const suggestions =
    Array.isArray(analysis.suggestions)
      ? analysis.suggestions.map(
          (item) => {

            if (
              typeof item === "string"
            ) {

              return {
                title:
                  "Resume Improvement",

                detail:
                  item,

                impact:
                  "Medium",
              };

            }

            return {
              title:
                item?.title ||
                "Resume Improvement",

              detail:
                item?.detail ||
                item?.description ||
                "",

              impact:
                item?.impact ||
                "Medium",
            };

          }
        )
      : [];


  // ==========================================================
  // DERIVED SKILL DEPTH
  // ==========================================================

  /*
   * Skill Depth is not directly stored by the backend.
   *
   * We derive a simple score from the number of detected
   * technical skills.
   *
   * 0 skills  -> 0%
   * 1-2       -> 30%
   * 3-4       -> 50%
   * 5-6       -> 70%
   * 7-8       -> 85%
   * 9+        -> 100%
   */

  const skillsDepth =
    detectedSkills.length === 0
      ? 0
      : detectedSkills.length <= 2
      ? 30
      : detectedSkills.length <= 4
      ? 50
      : detectedSkills.length <= 6
      ? 70
      : detectedSkills.length <= 8
      ? 85
      : 100;


  // ==========================================================
  // EXPERIENCE ALIGNMENT
  // ==========================================================

  /*
   * There is no job-specific experience score yet.
   *
   * We use section completeness as the current resume-level
   * indicator.
   *
   * Once job comparison is implemented, this should be replaced
   * by an actual job-specific experience match.
   */

  const experienceRelevance =
    sectionCompleteness;


  // ==========================================================
  // HELPERS
  // ==========================================================

  const getScoreLabel =
    (score) => {

      if (score >= 85) {
        return "Excellent";
      }

      if (score >= 75) {
        return "Good";
      }

      if (score >= 60) {
        return "Needs Improvement";
      }

      return "Needs Attention";
    };


  const getScoreClass =
    (score) => {

      if (score >= 85) {
        return "text-emerald-700";
      }

      if (score >= 75) {
        return "text-emerald-600";
      }

      if (score >= 60) {
        return "text-amber-600";
      }

      return "text-rose-600";
    };


  return (

    <div className="space-y-6 animate-in fade-in duration-300">

      {/* ====================================================
          TOP METRICS
      ==================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ==================================================
            ATS SCORE
        ================================================== */}

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


            <h3
              className={`text-3xl font-extrabold ${getScoreClass(
                atsScore
              )}`}
            >

              {atsScore}%

            </h3>


            <p className="text-xs text-slate-500">

              {getScoreLabel(atsScore)} ATS compatibility

            </p>

          </div>


          {/* Circular Score */}

          <div className="relative w-20 h-20 flex items-center justify-center">

            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 36 36"
            >

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


            <span className="absolute text-sm font-bold text-slate-900">

              {atsScore}%

            </span>

          </div>

        </div>


        {/* ==================================================
            JOB PROFILE FIT
        ================================================== */}

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


            {jobProfileFit === null ? (

              <>

                <h3 className="text-2xl font-extrabold text-slate-500">

                  Not evaluated

                </h3>

                <p className="text-xs text-slate-500">

                  Select a job to compare your resume with its requirements.

                </p>

              </>

            ) : (

              <>

                <h3
                  className={`text-3xl font-extrabold ${getScoreClass(
                    jobProfileFit
                  )}`}
                >

                  {jobProfileFit}%

                </h3>

                <p className="text-xs text-slate-500">

                  Resume match for the selected job

                </p>

              </>

            )}

          </div>


          {/* Circular Job Match Score */}

          {jobProfileFit !== null ? (

            <div className="relative w-20 h-20 flex items-center justify-center">

              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >

                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />


                <path
                  className="text-blue-600 transition-all duration-1000 ease-out"
                  strokeDasharray={`${jobProfileFit}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />

              </svg>


              <span className="absolute text-sm font-bold text-slate-900">

                {jobProfileFit}%

              </span>

            </div>

          ) : (

            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">

              <Target className="w-7 h-7 text-slate-300" />

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          ATS DIAGNOSTIC BREAKDOWN
      ==================================================== */}

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">

        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">

          <Zap className="w-4 h-4 text-emerald-600" />

          ATS Diagnostic Breakdown

        </h4>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


          {/* Keyword Relevance */}

          <ScoreBar
            label="Keyword Relevance"
            score={keywordRelevance}
          />


          {/* Format */}

          <ScoreBar
            label="Format & ATS Readability"
            score={formatReadability}
          />


          {/* Skills */}

          <ScoreBar
            label="Skills Depth"
            score={skillsDepth}
          />


          {/* Section Completeness */}

          <ScoreBar
            label="Section Completeness"
            score={sectionCompleteness}
          />

        </div>

      </div>


      {/* ====================================================
          SKILLS ANALYSIS
      ==================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


        {/* DETECTED SKILLS */}

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">

          <div className="flex items-center gap-2 mb-3.5">

            <CheckCircle2 className="w-5 h-5 text-emerald-600" />

            <h4 className="text-sm font-bold text-slate-900">

              Recognized Skills ({detectedSkills.length})

            </h4>

          </div>


          {detectedSkills.length === 0 ? (

            <p className="text-xs text-slate-500">

              No supported technical skills were detected in the resume.

            </p>

          ) : (

            <div className="flex flex-wrap gap-2">

              {detectedSkills.map(
                (skill) => (

                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold"
                  >

                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />

                    {skill}

                  </span>

                )
              )}

            </div>

          )}

        </div>


        {/* MISSING SKILLS */}

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">

          <div className="flex items-center gap-2 mb-3.5">

            <AlertTriangle className="w-5 h-5 text-amber-500" />

            <h4 className="text-sm font-bold text-slate-900">

              Missing High-Demand Skills ({missingSkills.length})

            </h4>

          </div>


          {missingSkills.length === 0 ? (

            <p className="text-xs text-slate-500">

              No missing skills have been identified yet.

            </p>

          ) : (

            <div className="flex flex-wrap gap-2">

              {missingSkills.map(
                (skill) => (

                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold"
                  >

                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />

                    {skill}

                  </span>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* ====================================================
          RECOMMENDED KEYWORDS
      ==================================================== */}

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">

        <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">

          <Sparkles className="w-4 h-4 text-emerald-600" />

          Recommended Resume Keywords

        </h4>


        <p className="text-xs text-slate-500 mb-3.5">

          Keywords identified as useful for improving ATS compatibility.

        </p>


        {missingKeywords.length === 0 ? (

          <p className="text-xs text-slate-500">

            No additional keywords have been identified yet.

          </p>

        ) : (

          <div className="flex flex-wrap gap-2">

            {missingKeywords.map(
              (keyword) => (

                <span
                  key={keyword}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold"
                >

                  + {keyword}

                </span>

              )
            )}

          </div>

        )}

      </div>


      {/* ====================================================
          SUGGESTIONS
      ==================================================== */}

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">

        <div className="flex items-center gap-2 mb-4">

          <Lightbulb className="w-5 h-5 text-amber-500" />

          <h4 className="text-sm font-bold text-slate-900">

            Actionable Resume Suggestions

          </h4>

        </div>


        {suggestions.length === 0 ? (

          <p className="text-xs text-slate-500">

            No additional suggestions at this time.

          </p>

        ) : (

          <div className="space-y-3">

            {suggestions.map(
              (item, index) => (

                <div
                  key={index}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                >

                  <div className="space-y-0.5">

                    <p className="text-xs font-bold text-slate-900">

                      {item.title}

                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed">

                      {item.detail}

                    </p>

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

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}


/* ============================================================
   SCORE BAR COMPONENT
============================================================ */

function ScoreBar({
  label,
  score,
}) {

  const safeScore =
    Math.max(
      0,
      Math.min(
        100,
        Number(score) || 0
      )
    );


  const scoreClass =
    safeScore >= 85
      ? "text-emerald-700"
      : safeScore >= 75
      ? "text-emerald-600"
      : safeScore >= 60
      ? "text-amber-700"
      : "text-rose-700";


  return (

    <div>

      <div className="flex justify-between text-xs font-semibold mb-1.5">

        <span className="text-slate-600">

          {label}

        </span>


        <span
          className={`font-bold ${scoreClass}`}
        >

          {safeScore}%

        </span>

      </div>


      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">

        <div
          className="h-full bg-emerald-600 rounded-full transition-all duration-700"
          style={{
            width:
              `${safeScore}%`,
          }}
        />

      </div>

    </div>

  );
}


export default ResumeScore;