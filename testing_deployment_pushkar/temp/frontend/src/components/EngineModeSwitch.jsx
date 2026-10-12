import React from "react";

const OPTIONS = [
  { value: "heuristic", label: "Rules", hint: "Transparent skill and profile matching" },
  { value: "ml", label: "ML model", hint: "TF-IDF model that learns from your swipes" },
  { value: "hybrid", label: "Hybrid", hint: "Average of both (recommended)" },
];

export function EngineModeSwitch({ mode, onChange, disabled = false, className = "" }) {
  return (
    <div
      role="radiogroup"
      aria-label="Matching engine"
      className={`inline-flex rounded-xl border border-slate-200 bg-white p-0.5 ${className}`}
    >
      {OPTIONS.map((option) => {
        const active = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={option.hint}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-colors disabled:opacity-50 ${
              active
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default EngineModeSwitch;
