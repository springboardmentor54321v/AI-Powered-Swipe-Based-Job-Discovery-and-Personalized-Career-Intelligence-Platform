import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FileText,
  Upload,
  Trash2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

import { useApp } from "../context/AppContext";
import { ResumeScore } from "../components/ResumeScore";
import { resumeService } from "../services/resumeService";


const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_EXTENSIONS =
  /\.(pdf|docx|doc)$/i;


export function ResumeAnalysisPage() {

  const {
    resumeAnalysis,
    setResumeAnalysis,
    user,
    addToast,
  } = useApp();


  const [file, setFile] =
    useState(null);

  const [activeResume, setActiveResume] =
    useState(null);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [isLoadingAnalysis, setIsLoadingAnalysis] =
    useState(true);

  const [analysisProgress, setAnalysisProgress] =
    useState(0);


  const fileInputRef =
    useRef(null);

  const progressIntervalRef =
    useRef(null);

  const progressTimeoutRef =
    useRef(null);


  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {

    return () => {

      if (
        progressIntervalRef.current
      ) {
        clearInterval(
          progressIntervalRef.current
        );
      }

      if (
        progressTimeoutRef.current
      ) {
        clearTimeout(
          progressTimeoutRef.current
        );
      }

    };

  }, []);


  // ==========================================================
  // LOAD EXISTING RESUME + ANALYSIS
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    const loadExistingResume =
      async () => {

        setIsLoadingAnalysis(true);

        try {

          const response =
            await resumeService.getAnalysis();

          if (!mounted) {
            return;
          }


          // -----------------------------------------------
          // Existing resume
          // -----------------------------------------------

          if (
            response?.resume
          ) {

            setActiveResume(
              response.resume
            );

          } else {

            setActiveResume(null);

          }


          // -----------------------------------------------
          // Existing analysis
          // -----------------------------------------------

          if (
            response?.analysis
          ) {

            setResumeAnalysis(
              response.analysis
            );

          } else {

            setResumeAnalysis(null);

          }

        } catch (error) {

          console.error(
            "Failed to load existing resume:",
            error
          );

        } finally {

          if (mounted) {

            setIsLoadingAnalysis(
              false
            );

          }

        }

      };


    loadExistingResume();


    return () => {

      mounted = false;

    };

  }, [setResumeAnalysis]);


  // ==========================================================
  // FILE VALIDATION
  // ==========================================================

  const processSelectedFile =
    useCallback(
      (selectedFile) => {

        if (!selectedFile) {
          return;
        }


        if (
          !ALLOWED_EXTENSIONS.test(
            selectedFile.name
          )
        ) {

          addToast(
            "Please upload a PDF, DOCX, or DOC file.",
            "error"
          );

          return;

        }


        if (
          selectedFile.size >
          MAX_FILE_SIZE
        ) {

          addToast(
            "Resume must be smaller than 10MB.",
            "error"
          );

          return;

        }


        if (
          selectedFile.size === 0
        ) {

          addToast(
            "The selected resume file is empty.",
            "error"
          );

          return;

        }


        setFile(
          selectedFile
        );

        // New file = new analysis will be generated.
        setResumeAnalysis(null);

        addToast(
          `Loaded ${selectedFile.name}`,
          "info"
        );

      },
      [
        addToast,
        setResumeAnalysis,
      ]
    );


  // ==========================================================
  // FILE INPUT
  // ==========================================================

  const handleFileChange =
    (event) => {

      const selectedFile =
        event.target.files?.[0];

      if (selectedFile) {

        processSelectedFile(
          selectedFile
        );

      }

    };


  // ==========================================================
  // DRAG & DROP
  // ==========================================================

  const handleDragOver =
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      if (!isAnalyzing) {

        setIsDragging(true);

      }

    };


  const handleDragLeave =
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      setIsDragging(false);

    };


  const handleDrop =
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      setIsDragging(false);

      if (isAnalyzing) {
        return;
      }

      const droppedFile =
        event.dataTransfer.files?.[0];

      if (droppedFile) {

        processSelectedFile(
          droppedFile
        );

      }

    };


  // ==========================================================
  // REMOVE SELECTED FILE
  // ==========================================================

  const handleRemoveFile =
    () => {

      if (isAnalyzing) {
        return;
      }

      setFile(null);

      setResumeAnalysis(
        null
      );

      setAnalysisProgress(
        0
      );


      if (fileInputRef.current) {

        fileInputRef.current.value =
          "";

      }

    };


  // ==========================================================
  // PROGRESS
  // ==========================================================

  const startProgress =
    () => {

      setAnalysisProgress(10);

      if (
        progressIntervalRef.current
      ) {

        clearInterval(
          progressIntervalRef.current
        );

      }


      progressIntervalRef.current =
        setInterval(() => {

          setAnalysisProgress(
            (previous) => {

              if (
                previous >= 90
              ) {

                return 90;

              }

              return Math.min(
                previous + 10,
                90
              );

            }
          );

        }, 350);

    };


  const stopProgress =
    () => {

      if (
        progressIntervalRef.current
      ) {

        clearInterval(
          progressIntervalRef.current
        );

        progressIntervalRef.current =
          null;

      }

    };


  // ==========================================================
  // ANALYZE
  // ==========================================================

  const handleAnalyze =
    async () => {

      if (!file) {

        addToast(
          "Please select a resume first.",
          "error"
        );

        fileInputRef.current?.click();

        return;

      }


      if (isAnalyzing) {
        return;
      }


      setIsAnalyzing(true);

      startProgress();


      try {

        const response =
          await resumeService.analyzeResume(
            file
          );


        stopProgress();

        setAnalysisProgress(
          100
        );


        const analysis =
          response?.analysis;


        if (!analysis) {

          throw new Error(
            "Resume analysis completed but no analysis data was returned."
          );

        }


        // Store analysis in AppContext
        setResumeAnalysis(
          analysis
        );


        // Store the newly-created backend resume
        if (
          response?.resume
        ) {

          setActiveResume(
            response.resume
          );

        }


        addToast(
          "Resume uploaded and analyzed successfully.",
          "success"
        );


        progressTimeoutRef.current =
          setTimeout(() => {

            setIsAnalyzing(false);

            setAnalysisProgress(
              0
            );

          }, 500);


      } catch (error) {

        stopProgress();

        console.error(
          "Resume analysis failed:",
          error
        );

        setAnalysisProgress(
          0
        );


        addToast(
          error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Failed to analyze resume. Please retry.",
          "error"
        );

        setIsAnalyzing(false);

      }

    };


  // ==========================================================
  // RE-EVALUATE
  // ==========================================================

  const handleReEvaluate =
    async () => {

      /*
       * A browser File object is required to re-upload/re-analyze.
       * If the page was refreshed, the backend resume exists but
       * the original File object is not available anymore.
       */

      if (!file) {

        addToast(
          "Please choose your resume file again to re-evaluate it.",
          "info"
        );

        fileInputRef.current?.click();

        return;

      }


      await handleAnalyze();

    };


  // ==========================================================
  // FILE SIZE
  // ==========================================================

  const formatFileSize =
    (bytes) => {

      if (!bytes) {
        return "0 KB";
      }

      if (
        bytes <
        1024 * 1024
      ) {

        return `${(
          bytes / 1024
        ).toFixed(0)} KB`;

      }

      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(2)} MB`;

    };


  // ==========================================================
  // DISPLAY NAME
  // ==========================================================

  const activeResumeName =
    activeResume?.filename ||
    user?.resumeName ||
    "No resume uploaded";


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">

      {/* ====================================================
          HEADER
      ==================================================== */}

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

          Check your resume against ATS screening algorithms,
          discover keyword gaps, and improve your interview
          chances.

        </p>

      </div>


      {/* ====================================================
          UPLOAD CARD
      ==================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 mb-8">

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleFileChange}
          className="hidden"
          disabled={isAnalyzing}
        />


        {/* ==================================================
            NO NEW FILE SELECTED
        ================================================== */}

        {!file ? (

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() =>
              !isAnalyzing &&
              fileInputRef.current?.click()
            }
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/50 scale-[0.99] cursor-pointer"
                : "border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100/70 cursor-pointer"
            }`}
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

              Supported formats: PDF, DOCX, DOC

              <br />

              Maximum file size: 10MB

            </p>


            <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs">

              <Upload className="w-3.5 h-3.5" />

              Select Resume

            </span>

          </div>

        ) : (

          /* =================================================
             NEW FILE SELECTED
          ================================================= */

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

                    {formatFileSize(file.size)}
                    {" • "}
                    Ready to analyze

                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={isAnalyzing}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50 shrink-0"
              >

                <Trash2 className="w-4 h-4" />

              </button>

            </div>


            {/* PROGRESS */}

            {isAnalyzing && (

              <div className="space-y-2">

                <div className="flex justify-between text-xs font-bold text-slate-800 gap-3">

                  <span className="flex items-center gap-1.5">

                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />

                    Parsing resume & checking ATS...

                  </span>


                  <span>

                    {analysisProgress}%

                  </span>

                </div>


                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{
                      width:
                        `${analysisProgress}%`,
                    }}
                  />

                </div>

              </div>

            )}


            {/* ACTIONS */}

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={isAnalyzing}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
              >

                Choose Another File

              </button>


              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
              >

                <Sparkles className="w-4 h-4" />

                {isAnalyzing
                  ? "Analyzing Resume..."
                  : "Run ATS Scan"}

              </button>

            </div>

          </div>

        )}


        {/* ==================================================
            ACTIVE RESUME
        ================================================== */}

        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">

          <div className="flex items-center gap-2 min-w-0">

            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />

            <span className="truncate">

              Active Resume on Profile:{" "}

              <strong className="text-slate-700">

                {activeResumeName}

              </strong>

            </span>

          </div>


          <button
            type="button"
            onClick={handleReEvaluate}
            disabled={isAnalyzing}
            className="text-emerald-700 hover:text-emerald-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >

            Re-evaluate Active Resume

          </button>

        </div>

      </div>


      {/* ====================================================
          LOADING
      ==================================================== */}

      {isLoadingAnalysis && (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center">

          <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto mb-3" />

          <p className="text-sm font-semibold text-slate-700">

            Loading your resume analysis...

          </p>

        </div>

      )}


      {/* ====================================================
          ANALYSIS
      ==================================================== */}

      {!isLoadingAnalysis &&
        resumeAnalysis && (

          <ResumeScore
            analysis={resumeAnalysis}
          />

        )}

    </div>

  );
}


export default ResumeAnalysisPage;