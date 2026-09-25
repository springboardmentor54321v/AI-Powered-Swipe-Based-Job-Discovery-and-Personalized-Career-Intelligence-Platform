import React, { useState, useRef } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  FileCheck
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ResumeScore } from "../components/ResumeScore";
import { uploadResume } from "../services/api";

export function ResumeAnalysisPage() {
  const { resumeAnalysis, setResumeAnalysis, user, addToast } = useApp();
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [hasAnalyzed, setHasAnalyzed] = useState(true);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile) => {
    if (!selectedFile.name.match(/\.(pdf|docx|doc)$/i)) {
      addToast("Please upload a PDF or DOCX file.", "error");
      return;
    }
    setFile(selectedFile);
    addToast(`Loaded ${selectedFile.name}`, "info");
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      const res = await uploadResume(file);
      setTimeout(() => {
        clearInterval(interval);
        setAnalysisProgress(100);
        setResumeAnalysis(res.analysis);
        setIsAnalyzing(false);
        setHasAnalyzed(true);
        addToast("Resume analyzed successfully", "success");
      }, 900);
    } catch {
      clearInterval(interval);
      setIsAnalyzing(false);
      addToast("Failed to analyze resume. Please retry.", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      {/* Header */}
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
          Check your resume against ATS screening algorithms, discover keyword gaps, and boost interview call rates.
        </p>
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload-input"
        />

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                : "border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100/70"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Drag & drop your resume here, or{" "}
              <span className="text-emerald-700 underline underline-offset-4">browse files</span>
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Supported formats: PDF, DOCX, DOC (up to 10MB)
            </p>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all pointer-events-none"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select Resume</span>
            </button>
          </div>
        ) : (
          /* File Selected Card */
          <div className="space-y-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{file.name}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove file"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress Bar during analysis */}
            {isAnalyzing && (
              <div className="space-y-2 animate-in fade-in duration-200">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    Parsing resume & checking ATS keyword relevance...
                  </span>
                  <span>{analysisProgress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
              >
                Choose Another File
              </button>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                id="btn-analyze-resume"
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? "Analyzing Resume..." : "Run ATS Scan"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Active Resume Info Footer */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Active Resume on Profile: {user?.resumeName || "Candidate_Resume_2025.pdf"}</span>
          </div>
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="text-emerald-700 hover:text-emerald-800 font-semibold"
          >
            Re-evaluate Active Resume
          </button>
        </div>
      </div>

      {/* Analysis Results Display */}
      {hasAnalyzed && resumeAnalysis && <ResumeScore analysis={resumeAnalysis} />}
    </div>
  );
}

export default ResumeAnalysisPage;
