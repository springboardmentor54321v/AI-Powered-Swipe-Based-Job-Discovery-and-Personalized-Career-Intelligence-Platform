import React, { useRef, useState } from "react";
import { EngineModeSwitch } from "../components/EngineModeSwitch";
import {
  FileText,
  Upload,
  Trash2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  FileCheck,
  AlertCircle,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { ResumeScore } from "../components/ResumeScore";
import { aiService } from "../services/aiService";

export function ResumeAnalysisPage() {
  const {
    user,
    resumeAnalysis,
    setResumeAnalysis,
    addToast,
  } = useApp();

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("hybrid");

  const fileInputRef = useRef(null);

  // ============================================================
  // FILE VALIDATION
  // ============================================================

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      return false;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      addToast(
        "Please upload a PDF resume. The current AI parser supports PDF.",
        "error"
      );

      return false;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      addToast(
        "Resume must be smaller than 10MB.",
        "error"
      );

      return false;
    }

    return true;
  };

  // ============================================================
  // SELECT FILE
  // ============================================================

  const processSelectedFile = (selectedFile) => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setError(null);
    setAnalysisProgress(0);

    addToast(
      `${selectedFile.name} selected`,
      "info"
    );
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const selectedFile = event.dataTransfer.files?.[0];

    if (selectedFile) {
      processSelectedFile(selectedFile);
    }
  };

  // ============================================================
  // REMOVE
  // ============================================================

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    setAnalysisProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // ANALYZE RESUME
  // ============================================================

  const handleAnalyze = async () => {
    if (!file) {
      addToast(
        "Please select a PDF resume first.",
        "error"
      );

      return;
    }

    if (isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(10);

    const progressTimer = setInterval(() => {
      setAnalysisProgress((previous) => {
        if (previous >= 85) {
          return previous;
        }

        return Math.min(previous + 10, 85);
      });
    }, 300);

    try {
      // Step 1: Upload the resume — backend parses skills and returns
      // { resume_id, parsed_skills }. It does NOT include any score yet.
      const userId = user?.id ?? user?.user_id;
      const uploadResponse = await aiService.uploadResume(file, userId);

      console.log(
        "AI resume upload response:",
        uploadResponse
      );

      if (!uploadResponse?.resume_id) {
        throw new Error("Resume upload did not return a resume_id.");
      }

      // Step 2: Fetch the job-agnostic heuristic analysis for that resume_id.
      // This is the new backend endpoint: GET /resume/{resume_id}/analysis
      const analysisResponse = await aiService.getResumeAnalysis(
        uploadResponse.resume_id,
        mode
      );

      console.log(
        "AI resume analysis response:",
        analysisResponse
      );

      clearInterval(progressTimer);
      setAnalysisProgress(100);

      setResumeAnalysis(analysisResponse);

      addToast(
        "Resume analyzed successfully.",
        "success"
      );
    } catch (err) {
      clearInterval(progressTimer);

      console.error(
        "Resume analysis failed:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to analyze resume. Please try again.";

      setError(message);

      addToast(
        message,
        "error"
      );
    } finally {
      setIsAnalyzing(false);

      setTimeout(() => {
        setAnalysisProgress(0);
      }, 500);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">

      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">

          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ATS Resume Checker & Analysis
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-slate-500">
          Upload your resume to extract skills, identify keyword gaps,
          and analyze your ATS compatibility.
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mb-8">

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload-input"
        />

        {!file ? (

          /* EMPTY UPLOAD */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
            className={`
              border-2 border-dashed rounded-2xl
              p-8 sm:p-12
              text-center
              cursor-pointer
              transition-all
              ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                  : "border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100/70"
              }
            `}
          >

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Drag & drop your resume here, or{" "}
              <span className="text-emerald-700 underline underline-offset-4">
                browse files
              </span>
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Supported format: PDF up to 10MB
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Select Resume
            </button>
          </div>

        ) : (

          /* SELECTED FILE */
          <div className="space-y-5">

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">

              <div className="flex items-center gap-3 min-w-0">

                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-bold text-slate-900 truncate">
                    {file.name}
                  </p>

                  <p className="text-xs text-slate-500 font-medium">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                    {" • "}
                    Ready to analyze
                  </p>

                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isAnalyzing}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-40"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            </div>

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">

                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />

                <div>
                  <p className="text-sm font-bold text-rose-800">
                    Resume analysis failed
                  </p>

                  <p className="text-xs text-rose-700 mt-1">
                    {error}
                  </p>
                </div>

              </div>
            )}

            {/* PROGRESS */}
            {isAnalyzing && (
              <div className="space-y-2">

                <div className="flex justify-between text-xs font-bold text-slate-800">

                  <span className="flex items-center gap-1.5">

                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />

                    Parsing resume & analyzing skills...

                  </span>

                  <span>
                    {analysisProgress}%
                  </span>

                </div>

                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{
                      width: `${analysisProgress}%`,
                    }}
                  />

                </div>

              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isAnalyzing}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                Choose Another File
              </button>

              <EngineModeSwitch mode={mode} onChange={setMode} disabled={isAnalyzing} />

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                id="btn-analyze-resume"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Sparkles className="w-4 h-4" />

                <span>
                  {isAnalyzing
                    ? "Analyzing Resume..."
                    : "Run ATS Scan"}
                </span>
              </button>

            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">

          <div className="flex items-center gap-2">

            <ShieldCheck className="w-4 h-4 text-emerald-600" />

            <span>
              Logged in as {user?.name || "Job Seeker"}
            </span>

          </div>

          {resumeAnalysis && (
            <span className="text-emerald-700 font-semibold">
              Resume analysis available
            </span>
          )}

        </div>
      </div>

      {/* RESULTS */}
      {resumeAnalysis && (
        <ResumeScore
          analysis={resumeAnalysis}
        />
      )}

    </div>
  );
}

export default ResumeAnalysisPage;