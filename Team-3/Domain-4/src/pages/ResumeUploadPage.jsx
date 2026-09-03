import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import Button from '../components/common/Button';
import Chip from '../components/common/Chip';
import resumeService from '../services/resume';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.txt'];

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States: 'idle' | 'selected' | 'uploading' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // On mount, check if there's an existing active resume
  useEffect(() => {
    const existing = resumeService.getActiveResume();
    if (existing) {
      setUploadedData(existing);
      setStatus('success');
    }
  }, []);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const validateAndSelectFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setErrorMessage(`Unsupported file format. Please upload a PDF or DOCX file.`);
      setStatus('error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File is too large (${formatFileSize(file.size)}). Maximum allowed size is 5MB.`);
      setStatus('error');
      return;
    }

    setSelectedFile(file);
    setStatus('selected');
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus('uploading');
    setErrorMessage('');

    try {
      const response = await resumeService.uploadResume(selectedFile);
      setUploadedData(response);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err?.message || 'Unable to upload your resume right now. Please verify your connection and try again.');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="space-y-1.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0070ad]/15 text-[#0070ad] text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>ATS Intelligence Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-content">
          Upload Your Resume
        </h1>
        <p className="text-xs sm:text-sm text-content-muted max-w-lg mx-auto">
          Extract verified skills, assess keyword readiness, and unlock tailored matchmaking with top enterprise openings.
        </p>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleFileInputChange}
        className="hidden"
        id="resume-file-input"
        aria-label="Upload resume file"
      />

      {/* Error Banner */}
      {status === 'error' && errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-xs text-red-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Upload failed</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Dropzone Container */}
      <div className="surface-card space-y-5">
        <div 
          onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-9 text-center transition-all cursor-pointer select-none ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-[#2e303d] hover:border-primary/60 bg-[#16171d] hover:bg-[#1a1b22]'
          } ${status === 'uploading' ? 'pointer-events-none opacity-70' : ''}`}
        >
          <div className="inline-flex h-14 w-14 rounded-2xl bg-surface-elevated items-center justify-center text-primary mb-3 shadow-sm border border-outline-variant">
            {status === 'uploading' ? (
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <UploadCloud className="w-7 h-7 text-primary" />
            )}
          </div>

          <h2 className="text-base sm:text-lg font-bold text-content max-w-md mx-auto truncate px-2">
            {status === 'uploading'
              ? 'Extracting verified skills...'
              : selectedFile
              ? selectedFile.name
              : uploadedData
              ? uploadedData.filename || 'Active Document Loaded'
              : 'Choose a resume file or drag & drop here'}
          </h2>

          <p className="text-xs text-content-subtle mt-1.5">
            {selectedFile
              ? `${formatFileSize(selectedFile.size)} • Click to choose a different document`
              : 'Supports PDF or DOCX up to 5MB • 256-Bit Encrypted'}
          </p>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant">
          <div className="flex items-center gap-2 text-xs text-content-muted min-w-0 flex-1">
            <FileText className="w-4 h-4 text-content-subtle shrink-0" />
            <span className="truncate max-w-[260px] sm:max-w-xs font-mono text-[11px] block">
              {selectedFile
                ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
                : uploadedData
                ? `Active Document: ${uploadedData.filename || 'Resume.pdf'}`
                : 'No document selected'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
            {selectedFile && status !== 'uploading' && (
              <Button
                type="button"
                variant="tonal"
                size="md"
                onClick={handleReset}
                className="flex-1 sm:flex-initial"
              >
                Clear
              </Button>
            )}

            <Button
              type="button"
              variant="filled"
              size="md"
              disabled={!selectedFile || status === 'uploading'}
              loading={status === 'uploading'}
              onClick={handleUpload}
              className="flex-1 sm:flex-initial font-semibold"
            >
              {status === 'uploading' ? 'Extracting Skills...' : 'Upload & Parse Document'}
            </Button>
          </div>
        </div>
      </div>

      {/* Extracted Skills & Keyword Results */}
      <div className="surface-card space-y-4 border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-content font-bold text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Extracted Skills & Capabilities</span>
          </div>
          {uploadedData && (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-0.5 rounded-full">
              Document Verified
            </span>
          )}
        </div>

        <p className="text-xs text-content-muted leading-relaxed">
          {uploadedData
            ? 'The following skill keywords were extracted from your resume. These capabilities will automatically benchmark your compatibility against live openings:'
            : 'Upload your resume to see automated skill extraction and unlock personalized job matching.'}
        </p>

        {uploadedData && uploadedData.parsed_skills?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {uploadedData.parsed_skills.map((skill, index) => (
              <Chip key={index} variant="primary">{skill}</Chip>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-surface-elevated/30 border border-dashed border-outline-variant text-center text-xs text-content-subtle">
            No extracted skills available yet. Select and upload your resume above.
          </div>
        )}

        {uploadedData && (
          <div className="pt-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-content-subtle">Skills synchronized with your career profile</span>
            <Button
              variant="filled"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard & ATS Score
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
