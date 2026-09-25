import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2, Sparkles, X } from 'lucide-react';
import Button from '../common/Button';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB per M3 spec
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

export default function ResumeDropzone({ onUpload, isUploading = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [label, setLabel] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const validateFile = (file) => {
    setErrorMessage('');
    if (!file) return false;

    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage('Unsupported file format. Please upload a PDF (.pdf) or DOCX (.docx) document.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File is too large (${formatFileSize(file.size)}). Maximum permitted size is 5MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      // Auto-suggest label from filename if empty
      if (!label) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setLabel(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
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

  const handleClear = () => {
    setSelectedFile(null);
    setLabel('');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerUpload = () => {
    if (!selectedFile || isUploading) return;
    if (onUpload) {
      onUpload(selectedFile, label.trim() || undefined);
    }
  };

  return (
    <div className="surface-card space-y-4 border border-outline-variant">
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        id="resume-file-picker"
        disabled={isUploading}
      />

      {/* Error state alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
          <div className="flex-1">
            <span className="font-semibold text-red-200">Invalid File: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-400 hover:text-red-200 p-0.5"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drop area */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[0.99]'
            : 'border-[#2e303d] hover:border-primary/60 bg-[#16171d] hover:bg-[#1a1b22]'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <div className="inline-flex h-14 w-14 rounded-2xl bg-surface-elevated items-center justify-center text-primary mb-3 shadow-sm border border-outline-variant">
          {isUploading ? (
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          ) : selectedFile ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          ) : (
            <UploadCloud className="w-7 h-7 text-primary" />
          )}
        </div>

        <h3 className="text-base font-bold text-content max-w-md mx-auto truncate px-2">
          {isUploading
            ? 'Uploading and parsing document skills...'
            : selectedFile
            ? selectedFile.name
            : 'Drag and drop your resume file here'}
        </h3>

        <p className="text-xs text-content-subtle mt-1.5">
          {selectedFile
            ? `${formatFileSize(selectedFile.size)} • Click to choose a different file`
            : 'Supports PDF (.pdf) or Word (.docx) up to 5MB'}
        </p>

        {!selectedFile && !isUploading && (
          <div className="pt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-elevated border border-outline-variant text-xs text-content font-medium hover:border-primary/50 transition-colors">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Browse Files</span>
            </span>
          </div>
        )}
      </div>

      {/* Selected file metadata and version label input */}
      {selectedFile && !isUploading && (
        <div className="space-y-3 pt-1">
          <div>
            <label htmlFor="version-label-input" className="block text-xs font-medium text-content-muted mb-1">
              Version Label (Optional)
            </label>
            <input
              id="version-label-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Full Stack & Cloud Lead 2026"
              className="w-full bg-surface-elevated/70 border border-outline/70 focus:border-primary rounded-xl px-3.5 py-2 text-xs text-content placeholder:text-content-subtle transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-outline-variant">
            <div className="flex items-center gap-2 text-xs text-content-muted min-w-0">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate font-mono text-[11px]">{selectedFile.name}</span>
              <span className="text-content-subtle text-[11px]">({formatFileSize(selectedFile.size)})</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="tonal"
                size="sm"
                onClick={handleClear}
                disabled={isUploading}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="filled"
                size="sm"
                icon={Sparkles}
                loading={isUploading}
                onClick={handleTriggerUpload}
              >
                Upload & Parse Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
