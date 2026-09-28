import React from 'react';
import { Award, Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function AtsScoreGauge({
  score = 0,
  keywordScore = null,
  semanticScore = null,
  engineVersion = 'semantic-v1',
  targetThreshold = 80,
}) {
  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circular gauge geometry
  const radius = 68;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Thresholds: ≥ 80% (Emerald), 60–79% (Amber), < 60% (Rose)
  let statusColor = '#34d399'; // Emerald
  let badgeColor = 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
  let statusText = 'Target Met • Strong Fit';
  let StatusIcon = CheckCircle2;

  if (normalizedScore < 60) {
    statusColor = '#f87171'; // Rose
    badgeColor = 'bg-rose-950/40 text-rose-400 border-rose-800/40';
    statusText = 'Low Compatibility • High Gap';
    StatusIcon = AlertCircle;
  } else if (normalizedScore < targetThreshold) {
    statusColor = '#fbbf24'; // Amber
    badgeColor = 'bg-amber-950/40 text-amber-300 border-amber-800/40';
    statusText = 'Moderate Fit • Below 80% Benchmark';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="surface-card p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant">
      {/* Left: Summary and Insights */}
      <div className="space-y-3 text-center md:text-left flex-1 min-w-0">
        <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusText}</span>
          </span>

          <span className="text-[11px] font-mono text-content-subtle bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.08]">
            Engine: {engineVersion}
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-content tracking-tight">
            {normalizedScore}% ATS Compatibility Score
          </h2>
          <p className="text-xs text-content-muted mt-1 max-w-md leading-relaxed">
            {normalizedScore >= targetThreshold
              ? 'Your resume demonstrates high keyword density and strong semantic alignment with this position.'
              : `Your score is currently below the ${targetThreshold}% threshold. Addressing the missing skills and keywords below can significantly increase your match rate.`}
          </p>
        </div>

        {/* Breakdown pills */}
        {(keywordScore != null || semanticScore != null) && (
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-1 text-xs">
            {keywordScore != null && (
              <span className="px-2.5 py-1 rounded-lg bg-surface-elevated text-content-muted border border-outline-variant text-[11px]">
                Keyword Overlap: <strong className="text-content font-bold">{Math.round(keywordScore)}%</strong> (40% wt)
              </span>
            )}
            {semanticScore != null && (
              <span className="px-2.5 py-1 rounded-lg bg-surface-elevated text-content-muted border border-outline-variant text-[11px]">
                Semantic Meaning: <strong className="text-content font-bold">{Math.round(semanticScore)}%</strong> (60% wt)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right: SVG Circular Gauge */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width="168"
          height="168"
          viewBox="0 0 168 168"
          className="transform -rotate-90"
        >
          {/* Track Circle */}
          <circle
            cx="84"
            cy="84"
            r={radius}
            stroke="#262833"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="84"
            cy="84"
            r={radius}
            stroke={statusColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.4s ease',
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-content tracking-tight">
            {normalizedScore}%
          </span>
          <span className="text-[10px] font-semibold text-content-subtle uppercase tracking-wider">
            Match Index
          </span>
        </div>
      </div>
    </div>
  );
}
