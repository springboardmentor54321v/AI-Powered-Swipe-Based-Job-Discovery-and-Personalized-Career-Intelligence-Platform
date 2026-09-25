import React, { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Edit2,
  Save,
  CheckCircle2,
  Briefcase,
  Sparkles
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export function RecruiterProfilePage() {
  const { recruiterProfile, updateRecruiterProfile } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: recruiterProfile.name || "",
    role: recruiterProfile.role || "",
    companyName: recruiterProfile.companyName || "",
    email: recruiterProfile.email || "",
    phone: recruiterProfile.phone || "",
    location: recruiterProfile.location || "",
    website: recruiterProfile.website || "",
    industry: recruiterProfile.industry || "",
    teamSize: recruiterProfile.teamSize || "",
    description: recruiterProfile.description || ""
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateRecruiterProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employer & Recruiter Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your organization's presence seen by thousands of candidates in the Swipe deck.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              setFormData({
                name: recruiterProfile.name || "",
                role: recruiterProfile.role || "",
                companyName: recruiterProfile.companyName || "",
                email: recruiterProfile.email || "",
                phone: recruiterProfile.phone || "",
                location: recruiterProfile.location || "",
                website: recruiterProfile.website || "",
                industry: recruiterProfile.industry || "",
                teamSize: recruiterProfile.teamSize || "",
                description: recruiterProfile.description || ""
              });
            }
            setIsEditing(!isEditing);
          }}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isEditing
              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
        </button>
      </div>

      {/* Main Profile Presentation / Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner / Branding Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={recruiterProfile.logo}
              alt={recruiterProfile.companyName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 bg-white shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {recruiterProfile.companyName}
                </h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
                  Verified Employer
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Managed by <span className="font-bold text-slate-900">{recruiterProfile.name}</span> ({recruiterProfile.role})
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{recruiterProfile.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <a
                    href={recruiterProfile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-600"
                  >
                    {recruiterProfile.website}
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Fields Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Organization Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Recruiter Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Primary Contact Name
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isEditing
                    ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-50 border border-transparent text-slate-700"
                }`}
              />
            </div>

            {/* Recruiter Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Designation / Position
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isEditing
                    ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-50 border border-transparent text-slate-700"
                }`}
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isEditing
                    ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-50 border border-transparent text-slate-700"
                }`}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isEditing
                    ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-50 border border-transparent text-slate-700"
                }`}
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Industry Sector
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isEditing
                    ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-50 border border-transparent text-slate-700"
                }`}
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Company Headcount
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.teamSize}
                onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isEditing
                    ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    : "bg-slate-50 border border-transparent text-slate-700"
                }`}
              />
            </div>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Company Description & Mission
            </label>
            <textarea
              rows={4}
              disabled={!isEditing}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full p-3.5 rounded-xl text-xs font-medium transition-all leading-relaxed ${
                isEditing
                  ? "bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  : "bg-slate-50 border border-transparent text-slate-700"
              }`}
            />
          </div>

          {isEditing && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Updates</span>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default RecruiterProfilePage;
