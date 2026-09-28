import React from 'react';
import { Search, Plus, Info } from 'lucide-react';

export default function KeywordGapList({ keywords = [] }) {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="surface-card p-4 sm:p-5 space-y-3 border border-outline-variant">
      <div className="flex items-center justify-between border-b border-outline-variant pb-2.5">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-content">
            Recommended Keyword Additions ({keywords.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-content-subtle">
          ATS Semantic Density
        </span>
      </div>

      <p className="text-xs text-content-muted leading-relaxed">
        Adding these terms naturally into your work history bullets can increase keyword resonance and ATS discovery:
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {keywords.map((kw, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium bg-[#1e202b] text-content border border-[#343644] hover:border-primary/40 transition-colors"
          >
            <Plus className="w-3 h-3 text-primary" />
            <span>{kw}</span>
          </span>
        ))}
      </div>

      <div className="flex items-start gap-2 pt-2 text-[11px] text-content-subtle border-t border-outline-variant/60">
        <Info className="w-3.5 h-3.5 text-content-subtle shrink-0 mt-0.5" />
        <p>
          Ethical guideline: Only add keywords that accurately represent your authentic engineering accomplishments.
        </p>
      </div>
    </div>
  );
}
