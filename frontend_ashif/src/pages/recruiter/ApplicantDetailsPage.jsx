import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  MessageSquare,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function ApplicantDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recruiterApplicants, updateApplicantStatus, addToast } = useApp();

  const applicant = recruiterApplicants.find((a) => a.id === id) || recruiterApplicants[0];

  const [notes, setNotes] = useState(applicant?.recruiterNotes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!applicant) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Candidate Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested applicant profile does not exist.</p>
        <Link
          to="/recruiter/applicants"
          className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Applicants</span>
        </Link>
      </div>
    );
  }

  const handleSaveNotes = () => {
    setIsSavingNotes(true);
    setTimeout(() => {
      updateApplicantStatus(applicant.id, applicant.status, notes);
      setIsSavingNotes(false);
      addToast("Internal recruiter notes saved", "success");
    }, 300);
  };

  const handleStatusChange = (newStatus) => {
    updateApplicantStatus(applicant.id, newStatus, notes);
  };

  const statusColors = {
    Applied: "bg-slate-100 text-slate-700 border-slate-200",
    "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
    Shortlisted: "bg-blue-50 text-blue-700 border-blue-200",
    Interview: "bg-purple-50 text-purple-700 border-purple-200",
    Rejected: "bg-rose-50 text-rose-700 border-rose-200"
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/recruiter/applicants"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Pipeline</span>
        </Link>

        {/* Current Stage Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Application Stage:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              statusColors[applicant.status] || "bg-slate-100 text-slate-700"
            }`}
          >
            {applicant.status}
          </span>
        </div>
      </div>

      {/* Main Grid: Left Candidate Dossier + Right Actions & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Candidate Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <img
                src={applicant.avatar}
                alt={applicant.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
              />

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {applicant.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      applicant.atsScore >= 85
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{applicant.atsScore}% ATS Match</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  Applied for: <span className="font-bold text-slate-900">{applicant.appliedJobTitle}</span>
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${applicant.email}`} className="hover:text-blue-600">
                      {applicant.email}
                    </a>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{applicant.phone}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{applicant.location}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Summary */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Executive Profile Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {applicant.summary}
              </p>
            </div>

            {/* Core Competencies & Skills */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Technical Stack & Qualifications
              </h3>
              <div className="flex flex-wrap gap-2">
                {applicant.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Experience History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Career History</span>
            </h3>

            <div className="space-y-4">
              {applicant.experience?.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{exp.role}</h4>
                    <span className="text-[11px] font-medium text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600">{exp.company}</p>
                  <p className="text-xs text-slate-600 pt-1 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education History */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-purple-600" />
              <span>Education</span>
            </h3>

            <div className="space-y-3">
              {applicant.education?.map((edu, idx) => (
                <div key={idx} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{edu.degree}</h4>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                    Class of {edu.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Stage Actions + Resume Download + Internal Notes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stage Progression Controls */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Pipeline Stage Decision
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStatusChange("Shortlisted")}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  applicant.status === "Shortlisted"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Shortlist Candidate</span>
                </div>
                {applicant.status === "Shortlisted" && <span>Selected</span>}
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("Interview")}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  applicant.status === "Interview"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Invite to Interview</span>
                </div>
                {applicant.status === "Interview" && <span>Scheduled</span>}
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("Under Review")}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  applicant.status === "Under Review"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Mark Under Review</span>
                </div>
                {applicant.status === "Under Review" && <span>Active</span>}
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("Rejected")}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                  applicant.status === "Rejected"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>Reject Application</span>
                </div>
                {applicant.status === "Rejected" && <span>Archived</span>}
              </button>
            </div>
          </div>

          {/* Resume Download Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Resume Document
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {applicant.resumeUrl || `${applicant.name.replace(/\s+/g, "_")}_Resume.pdf`}
                  </p>
                  <p className="text-[10px] text-slate-500">PDF • Verified ATS parsed</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => addToast(`Downloading resume for ${applicant.name}`, "info")}
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-colors shrink-0"
                title="Download Resume"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Internal Recruiter Notes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Internal Recruiter Notes</span>
            </h3>

            <textarea
              rows={4}
              placeholder="Add confidential observations, interview prep questions, or hiring manager feedback..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              {isSavingNotes ? "Saving..." : "Save Internal Notes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicantDetailsPage;
