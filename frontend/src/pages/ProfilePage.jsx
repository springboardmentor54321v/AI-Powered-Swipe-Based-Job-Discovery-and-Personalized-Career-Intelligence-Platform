import React, {
  useEffect,
  useState,
} from "react";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  FileText,
  CheckCircle2,
  X,
  Save,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { resumeService } from "../services/resumeService";


export function ProfilePage() {

  const {
    user,
    updateProfile,
    addToast,
  } = useApp();


  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] = useState({

    name:
      user?.name || "",

    email:
      user?.email || "",

    phone:
      user?.phone || "",

    location:
      user?.location || "",

    role:
      user?.role ||
      user?.targetRole ||
      "",

    experience:
      user?.experience || "",

    preferredSalary:
      user?.preferredSalary || "",

    bio:
      user?.bio || "",

    skills:
      Array.isArray(user?.skills)
        ? user.skills
        : [],

  });


  const [newSkill, setNewSkill] =
    useState("");

  const [isSaved, setIsSaved] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);


  // ==========================================================
  // RESUME STATE
  // ==========================================================

  const [activeResume, setActiveResume] =
    useState(null);

  const [resumeAnalysis, setResumeAnalysis] =
    useState(null);

  const [isLoadingResume, setIsLoadingResume] =
    useState(true);


  // ==========================================================
  // LOAD RESUME
  // ==========================================================

  useEffect(() => {

    let mounted = true;


    const loadResume =
      async () => {

        setIsLoadingResume(true);

        try {

          const response =
            await resumeService.getAnalysis();


          if (!mounted) {
            return;
          }


          if (response?.resume) {

            setActiveResume(
              response.resume
            );

          } else {

            setActiveResume(null);

          }


          if (response?.analysis) {

            setResumeAnalysis(
              response.analysis
            );

          } else {

            setResumeAnalysis(null);

          }

        } catch (error) {

          console.error(
            "Failed to load profile resume:",
            error
          );

        } finally {

          if (mounted) {

            setIsLoadingResume(
              false
            );

          }

        }

      };


    loadResume();


    return () => {

      mounted = false;

    };

  }, []);


  // ==========================================================
  // SYNC FORM WHEN USER CHANGES
  // ==========================================================

  useEffect(() => {

    setFormData({

      name:
        user?.name || "",

      email:
        user?.email || "",

      phone:
        user?.phone || "",

      location:
        user?.location || "",

      role:
        user?.role ||
        user?.targetRole ||
        "",

      experience:
        user?.experience || "",

      preferredSalary:
        user?.preferredSalary || "",

      bio:
        user?.bio || "",

      skills:
        Array.isArray(user?.skills)
          ? user.skills
          : [],

    });

  }, [user]);


  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleInputChange =
    (event) => {

      const {
        name,
        value,
      } = event.target;


      setFormData(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

    };


  // ==========================================================
  // ADD SKILL
  // ==========================================================

  const handleAddSkill =
    (event) => {

      event.preventDefault();


      const skill =
        newSkill.trim();


      if (!skill) {
        return;
      }


      const exists =
        formData.skills.some(
          (existingSkill) =>
            existingSkill.toLowerCase() ===
            skill.toLowerCase()
        );


      if (exists) {

        addToast(
          "Skill already added",
          "info"
        );

        return;

      }


      setFormData(
        (previous) => ({

          ...previous,

          skills: [
            ...previous.skills,
            skill,
          ],

        })
      );


      setNewSkill("");

    };


  // ==========================================================
  // REMOVE SKILL
  // ==========================================================

  const handleRemoveSkill =
    (skillToRemove) => {

      setFormData(
        (previous) => ({

          ...previous,

          skills:
            previous.skills.filter(
              (skill) =>
                skill !== skillToRemove
            ),

        })
      );

    };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSubmit =
    async (event) => {

      event.preventDefault();


      if (isSaving) {
        return;
      }


      setIsSaving(true);

      setIsSaved(false);


      try {

        /*
         * updateProfile() is the function exposed by
         * AppContext and calls Auth Service.
         */

        await updateProfile({

          name:
            formData.name.trim(),

          email:
            formData.email.trim(),

          phone:
            formData.phone.trim(),

          location:
            formData.location.trim(),

          role:
            formData.role.trim(),

          experience:
            formData.experience,

          preferredSalary:
            formData.preferredSalary.trim(),

          bio:
            formData.bio.trim(),

          skills:
            formData.skills,

        });


        setIsSaved(true);


        setTimeout(() => {

          setIsSaved(false);

        }, 3000);

      } catch (error) {

        console.error(
          "Profile update failed:",
          error
        );

        addToast(
          error?.response?.data?.message ||
            "Could not update profile",
          "error"
        );

      } finally {

        setIsSaving(false);

      }

    };


  // ==========================================================
  // PROFILE COMPLETION
  // ==========================================================

  const calculateProfileCompletion =
    () => {

      const fields = [

        formData.name,

        formData.email,

        formData.phone,

        formData.location,

        formData.role,

        formData.experience,

        formData.preferredSalary,

        formData.bio,

      ];


      let completed =
        fields.filter(
          (field) =>
            String(field || "").trim()
        ).length;


      if (
        formData.skills.length > 0
      ) {

        completed += 1;

      }


      return Math.round(
        (
          completed / 9
        ) * 100
      );

    };


  const profileCompletion =
    Number.isFinite(
      Number(user?.profileCompletion)
    )
      ? Number(
          user.profileCompletion
        )
      : calculateProfileCompletion();


  // ==========================================================
  // RESUME VALUES
  // ==========================================================

  const resumeName =
    activeResume?.filename ||
    null;


  const atsScore =
    resumeAnalysis?.atsScore ??
    activeResume?.ats_score ??
    null;


  const hasResume =
    Boolean(
      activeResume
    );


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 space-y-8">


      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="flex items-center gap-2 mb-1">

            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">

              <User className="w-5 h-5 text-emerald-600" />

            </div>


            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">

              Candidate Profile

            </h1>

          </div>


          <p className="text-xs sm:text-sm text-slate-500">

            Manage your skills, target salary, experience, and contact information

          </p>

        </div>


        {/* PROFILE STRENGTH */}

        <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">

          <div className="text-right">

            <p className="text-xs font-bold text-slate-900">

              Profile Strength

            </p>


            <p className="text-[11px] text-emerald-700 font-semibold">

              {profileCompletion}% Complete

            </p>

          </div>


          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">

            {profileCompletion}%

          </div>

        </div>

      </div>


      {/* ====================================================
          FORM
      ==================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >


        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">

          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">

            <User className="w-4 h-4 text-emerald-600" />

            Personal & Contact Information

          </h2>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">


            {/* NAME */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Full Name

              </label>


              <div className="relative">

                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

              </div>

            </div>


            {/* EMAIL */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Email Address

              </label>


              <div className="relative">

                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

              </div>

            </div>


            {/* PHONE */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Phone Number

              </label>


              <div className="relative">

                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

              </div>

            </div>


            {/* LOCATION */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Current Location

              </label>


              <div className="relative">

                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Ranchi, India"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            CAREER
        ================================================== */}

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">

          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">

            <Briefcase className="w-4 h-4 text-emerald-600" />

            Career Focus & Expectations

          </h2>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">


            {/* JOB TITLE */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Desired Job Title

              </label>


              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                placeholder="e.g. Java Developer"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />

            </div>


            {/* EXPERIENCE */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Experience Level

              </label>


              <select
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >

                <option value="">

                  Select experience

                </option>

                <option value="Fresher">

                  Fresher (0 Years)

                </option>

                <option value="0-1 Year">

                  0-1 Year

                </option>

                <option value="1-3 Years">

                  1-3 Years

                </option>

                <option value="3-5 Years">

                  3-5 Years

                </option>

                <option value="5+ Years">

                  5+ Years

                </option>

              </select>

            </div>


            {/* SALARY */}

            <div>

              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

                Expected CTC / Salary

              </label>


              <div className="relative">

                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


                <input
                  type="text"
                  name="preferredSalary"
                  value={formData.preferredSalary}
                  onChange={handleInputChange}
                  placeholder="e.g. ₹12 - ₹18 LPA"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />

              </div>

            </div>

          </div>


          {/* BIO */}

          <div>

            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">

              Professional Summary

            </label>


            <textarea
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Briefly describe your background, strengths and career goals..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
            />

          </div>

        </div>


        {/* ==================================================
            SKILLS
        ================================================== */}

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">

          <div className="flex items-center justify-between">

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">

              <Sparkles className="w-4 h-4 text-emerald-600" />

              Technical Skills ({formData.skills.length})

            </h2>


            <span className="text-xs text-slate-400">

              Used for match scoring

            </span>

          </div>


          {/* SKILL TAGS */}

          {formData.skills.length > 0 ? (

            <div className="flex flex-wrap gap-2 pt-2">

              {formData.skills.map(
                (skill) => (

                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold"
                  >

                    <span>

                      {skill}

                    </span>


                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveSkill(
                          skill
                        )
                      }
                      className="hover:text-rose-600 p-0.5 rounded transition-colors"
                      aria-label={`Remove ${skill}`}
                    >

                      <X className="w-3.5 h-3.5" />

                    </button>

                  </span>

                )
              )}

            </div>

          ) : (

            <p className="text-xs text-slate-500">

              No skills added yet.

            </p>

          )}


          {/* ADD SKILL */}

          <div className="pt-3 flex gap-2 max-w-md">

            <input
              type="text"
              value={newSkill}
              onChange={(event) =>
                setNewSkill(
                  event.target.value
                )
              }
              onKeyDown={(event) => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  handleAddSkill(
                    event
                  );

                }

              }}
              placeholder="Add skill (e.g. Docker, Spring Boot)"
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />


            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >

              Add Skill

            </button>

          </div>

        </div>


        {/* ==================================================
            RESUME
        ================================================== */}

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">

          <div className="flex items-center justify-between">

            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">

              <FileText className="w-4 h-4 text-emerald-600" />

              Attached Resume

            </h2>


            {hasResume ? (

              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">

                Active

              </span>

            ) : (

              <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">

                Not uploaded

              </span>

            )}

          </div>


          {isLoadingResume ? (

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2">

              <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />

              <span className="text-xs text-slate-500 font-medium">

                Loading resume information...

              </span>

            </div>

          ) : hasResume ? (

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">

              <div className="flex items-center gap-3 min-w-0">

                <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl shrink-0">

                  <FileText className="w-5 h-5" />

                </div>


                <div className="min-w-0">

                  <p className="text-xs font-bold text-slate-900 truncate">

                    {resumeName}

                  </p>


                  <p className="text-[11px] text-slate-500">

                    {atsScore !== null
                      ? `ATS Score ${atsScore}%`
                      : "ATS analysis pending"}

                  </p>

                </div>

              </div>


              <a
                href="/resume-analysis"
                className="px-3 py-1.5 bg-white border border-slate-200 text-emerald-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors shrink-0"
              >

                Check ATS Score

              </a>

            </div>

          ) : (

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-white border border-slate-200 rounded-xl">

                  <FileText className="w-5 h-5 text-slate-400" />

                </div>


                <div>

                  <p className="text-xs font-bold text-slate-700">

                    No resume uploaded

                  </p>


                  <p className="text-[11px] text-slate-500">

                    Upload a resume to enable ATS analysis and personalized recommendations.

                  </p>

                </div>

              </div>


              <a
                href="/resume-analysis"
                className="inline-flex mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >

                Upload Resume

              </a>

            </div>

          )}

        </div>


        {/* ==================================================
            SAVE BAR
        ================================================== */}

        <div className="flex items-center justify-end gap-3 pt-4">

          {isSaved && (

            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">

              <CheckCircle2 className="w-4 h-4 text-emerald-600" />

              Profile updated successfully!

            </span>

          )}


          <button
            type="submit"
            id="btn-save-profile"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
          >

            {isSaving ? (

              <RefreshCw className="w-4 h-4 animate-spin" />

            ) : (

              <Save className="w-4 h-4" />

            )}


            <span>

              {isSaving
                ? "Saving..."
                : "Save Profile"}

            </span>

          </button>

        </div>

      </form>

    </div>

  );

}


export default ProfilePage;