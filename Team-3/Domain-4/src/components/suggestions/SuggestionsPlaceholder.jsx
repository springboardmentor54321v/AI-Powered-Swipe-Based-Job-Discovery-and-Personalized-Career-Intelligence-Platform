import React, { useState } from 'react';
import { Sparkles, Cpu, AlertCircle, RotateCcw, CheckCircle2, Tag } from 'lucide-react';
import Button from '../common/Button';

export default function SuggestionsPlaceholder({
  suggestions = [],
  source = 'rule_based',
  isLoading = false,
  error = null,
  onRetry = null,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const isAi = source === 'ai_generated';

  // Extract unique categories
  const categories = ['All', ...new Set(
    suggestions.map((s) => typeof s === 'object' && s.category ? s.category : 'General')
  )];

  const filteredSuggestions = selectedCategory === 'All'
    ? suggestions
    : suggestions.filter((s) => {
        const cat = typeof s === 'object' && s.category ? s.category : 'General';
        return cat.toLowerCase() === selectedCategory.toLowerCase();
      });

  return (
    <div className="surface-card p-5 sm:p-6 space-y-4 border border-outline-variant">
      {/* Header with Transparent Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-content">
              Resume Optimization Suggestions
            </h3>
          </div>
          <p className="text-[11px] text-content-subtle">
            Tailored adjustments derived from target employer requirements to maximize match rates.
          </p>
        </div>

        {/* Source indicator */}
        <div className="shrink-0">
          {isAi ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-purple-950/40 text-purple-300 border border-purple-800/40">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>AI Generated</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-surface-elevated text-content-muted border border-outline-variant">
              <Cpu className="w-3 h-3 text-primary" />
              <span>Rule-Based</span>
            </span>
          )}
        </div>
      </div>

      {/* Error state with Retry action */}
      {error ? (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 space-y-2.5 text-center">
          <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />
          <p className="text-xs text-red-300">{error}</p>
          {onRetry && (
            <Button
              type="button"
              variant="tonal"
              size="sm"
              icon={RotateCcw}
              onClick={onRetry}
              className="text-xs"
            >
              Retry Loading Suggestions
            </Button>
          )}
        </div>
      ) : isLoading ? (
        /* Loading skeleton */
        <div className="space-y-3 py-2">
          <div className="p-4 rounded-xl bg-surface-elevated/40 animate-pulse space-y-2 border border-outline-variant">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-4/5" />
          </div>
          <div className="p-4 rounded-xl bg-surface-elevated/40 animate-pulse space-y-2 border border-outline-variant">
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-3 bg-white/5 rounded w-full" />
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        /* Suggestions List */
        <div className="space-y-3">
          {/* Category Filter Pills (if multiple categories) */}
          {categories.length > 2 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-content-subtle uppercase tracking-wider font-semibold mr-1">
                Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-surface font-semibold'
                      : 'bg-surface-elevated text-content-muted hover:text-content border border-outline-variant'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2.5">
            {filteredSuggestions.map((item, idx) => {
              const title = typeof item === 'string' ? `Optimization Tip #${idx + 1}` : (item.title || `Recommendation #${idx + 1}`);
              const detail = typeof item === 'string' ? item : (item.detail || item.message || item.text || '');
              const category = typeof item === 'object' && item.category ? item.category : 'General';
              const priority = typeof item === 'object' && item.priority ? item.priority : (idx === 0 ? 'high' : 'medium');
              const relatedSkills = typeof item === 'object' && Array.isArray(item.related_skills) ? item.related_skills : null;

              const isHigh = priority === 'high';
              const isMed = priority === 'medium';

              const borderAccent = isHigh
                ? 'border-l-rose-500'
                : isMed
                ? 'border-l-amber-500'
                : 'border-l-primary';

              const priorityBadge = isHigh
                ? 'bg-rose-950/40 text-rose-300 border-rose-800/30'
                : isMed
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/30'
                : 'bg-primary-container/40 text-primary border-primary/30';

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl bg-[#15161e] border border-outline-variant border-l-4 ${borderAccent} space-y-2`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-content">
                      {title}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/[0.04] text-content-subtle border border-white/[0.06]">
                        {category}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                        {priority} Priority
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-content-muted leading-relaxed">
                    {detail}
                  </p>

                  {relatedSkills && relatedSkills.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                      <span className="text-[10px] text-content-subtle">Recommended keywords:</span>
                      {relatedSkills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-elevated text-primary border border-outline-variant"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="p-6 rounded-xl bg-surface-elevated/40 border border-dashed border-outline-variant text-center space-y-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
          <h4 className="text-xs font-semibold text-content">No Critical Optimization Gaps</h4>
          <p className="text-xs text-content-subtle max-w-sm mx-auto">
            Your resume shows solid alignment with the evaluated criteria. No urgent adjustments required.
          </p>
        </div>
      )}
    </div>
  );
}
