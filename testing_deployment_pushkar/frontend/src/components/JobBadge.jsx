import React from "react";

export function JobBadge({ type, text, size = "md", icon: Icon }) {
  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs font-semibold";

  const getStyle = () => {
    switch (type) {
      case "match":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "remote":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "fresher":
        return "bg-teal-50 text-teal-700 border border-teal-200";
      case "low-competition":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "fulltime":
        return "bg-slate-100 text-slate-700 border border-slate-200";
      case "internship":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "mnc":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "startup":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "newly-founded":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${sizeClasses} ${getStyle()}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 opacity-85" />}
      <span>{text}</span>
    </span>
  );
}

export default JobBadge;
