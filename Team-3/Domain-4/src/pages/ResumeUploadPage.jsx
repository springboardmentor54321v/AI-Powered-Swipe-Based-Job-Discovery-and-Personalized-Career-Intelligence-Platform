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
  ArrowRight
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
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold text-content">Upload your resume</h1>
        <p className="text-xs text-content-muted">
          Add your resume to get matched with relevant job postings and calculate ATS scores
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
      <div className="surface-card space-y-6">
        <div 
          onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer select-none ${
            isDragging
              ? 'border-primary bg-primary/10 scale-[0.99]'
              : 'border-outline-variant hover:border-primary/60 bg-surface-elevated/30 hover:bg-surface-elevated/50'
          } ${status === 'uploading' ? 'pointer-events-none opacity-70' : ''}`}
        >
          <div className="inline-flex h-14 w-14 rounded-2xl bg-surface-elevated items-center justify-center text-primary mb-3 shadow-sm">
            {status === 'uploading' ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h2 className="text-base font-semibold text-content">
            {status === 'uploading'
              ? 'Parsing resume...'
              : selectedFile
              ? selectedFile.name
              : uploadedData
              ? uploadedData.filename || 'Resume Active'
              : 'Choose a file or drag and drop'}
          </h2>

          <p className="text-xs text-content-subtle mt-1">
            {selectedFile
              ? `${formatFileSize(selectedFile.size)} • Click to choose a different file`
              : 'PDF or DOCX up to 5MB'}
          </p>
        </div>

        {/* Action Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-outline-variant">
          <div className="flex items-center gap-2 text-xs text-content-muted w-full sm:w-auto">
            <FileText className="w-4 h-4 text-content-subtle shrink-0" />
            <span className="truncate">
              {selectedFile
                ? `${selectedFile.name} (${formatFileSize(selectedFile.size)})`
                : uploadedData
                ? `Active: ${uploadedData.filename || 'Uploaded Resume'}`
                : 'No file selected'}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {selectedFile && status !== 'uploading' && (
              <Button
                type="button"
                variant="tonal"
                size="md"
                onClick={handleReset}
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
              className="w-full sm:w-auto"
            >
              {status === 'uploading' ? 'Uploading...' : 'Upload resume'}
            </Button>
          </div>
        </div>
      </div>

      {/* Parsed Skills Results Section */}
      <div className="surface-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-content font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Parsed skills and keywords</span>
          </div>
          {uploadedData && (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
              Heuristic Stub Verified
            </span>
          )}
        </div>

        <p className="text-xs text-content-muted leading-relaxed">
          {uploadedData
            ? 'The following skill keywords were extracted from your resume by the career intelligence service:'
            : 'Upload your resume to see automated skill extraction and unlock personalized job matching.'}
        </p>

        {uploadedData && uploadedData.parsed_skills?.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {uploadedData.parsed_skills.map((skill, index) => (
              <Chip key={index} variant="primary">{skill}</Chip>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-surface-elevated/40 border border-outline-variant/60 text-center text-xs text-content-subtle">
            No parsed skills available yet. Select and upload your resume above.
          </div>
        )}

        {uploadedData && (
          <div className="pt-3 border-t border-outline-variant flex justify-end">
            <Button
              variant="filled"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate('/dashboard')}
            >
              View Dashboard & ATS Score
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
