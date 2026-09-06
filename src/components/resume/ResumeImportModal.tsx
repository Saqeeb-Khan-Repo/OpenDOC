import React, { useState, useRef } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/engines/ResumeEngine';
import { ResumeImportEngine, ResumeImportResult } from '@/engines/ResumeImportEngine';
import {
  UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle,
  Briefcase, GraduationCap, Wrench, Sparkles, Loader2, ArrowRight, User, Plus
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: (importedData: ResumeData, mode?: 'replace' | 'merge') => void;
}

export function ResumeImportModal({
  open,
  onOpenChange,
  onImportSuccess,
}: ResumeImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'error'>('upload');
  const [importResult, setImportResult] = useState<ResumeImportResult | null>(null);
  const [reviewTab, setReviewTab] = useState<'contact' | 'experience' | 'skills' | 'education' | 'raw'>('contact');

  const handleReset = () => {
    setStep('upload');
    setImportResult(null);
    setReviewTab('contact');
  };

  const handleFileProcess = async (file: File) => {
    setStep('processing');
    try {
      const result = await ResumeImportEngine.importFile(file);
      if (result.success && result.resumeData) {
        setImportResult(result);
        setStep('review');
      } else {
        setImportResult(result);
        setStep('error');
      }
    } catch (err: any) {
      setImportResult({
        success: false,
        error: err?.message || 'Failed to parse resume document.',
      });
      setStep('error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleConfirmImport = () => {
    if (importResult?.resumeData) {
      onImportSuccess(importResult.resumeData, 'replace');
      onOpenChange(false);
      handleReset();
    }
  };

  const resume = importResult?.resumeData;

  return (
    <Dialog open={open} onOpenChange={isOpen => {
      onOpenChange(isOpen);
      if (!isOpen) handleReset();
    }}>
      <DialogContent className="sm:max-w-[620px] p-5 max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Import Existing Resume</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Extracts content from PDF, DOCX, TXT, or JSON and normalizes it into structured fields.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── STEP 1: Upload Dropzone ────────────────────────────────────────── */}
        {step === 'upload' && (
          <div className="space-y-4 my-2 flex-1">
            <div
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all',
                dragActive
                  ? 'border-primary bg-primary/5 scale-[0.99]'
                  : 'border-border/80 hover:border-primary/60 hover:bg-muted/30 bg-muted/10'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.json,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-foreground">Click to upload or drag &amp; drop</p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT, or JSON (Max 15MB)</p>

              <div className="flex items-center gap-2 mt-4">
                <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[10px] font-mono text-muted-foreground">PDF</span>
                <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[10px] font-mono text-muted-foreground">DOCX</span>
                <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[10px] font-mono text-muted-foreground">TXT</span>
                <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[10px] font-mono text-muted-foreground">JSON</span>
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground block mb-0.5">Formatting Normalization Guarantee</strong>
                Uploaded resumes with broken line breaks, bad spacing, or inconsistent bullets will be rebuilt into clean ATS-compatible structured sections.
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Processing ────────────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h4 className="text-sm font-bold text-foreground">Analyzing &amp; Normalizing Document...</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Detecting section headings, contact information, work history, and skills hierarchy.
            </p>
          </div>
        )}

        {/* ── STEP 3: Error ─────────────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 flex-1">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
              <XCircle className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Import Failed</h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {importResult?.error || 'Could not parse document text. The file may be password-protected or scanned.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs mt-2 cursor-pointer"
            >
              Try Another File
            </Button>
          </div>
        )}

        {/* ── STEP 4: Structured Review ─────────────────────────────────────── */}
        {step === 'review' && resume && (
          <div className="space-y-3 my-2 flex-1 overflow-hidden flex flex-col">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  Resume Extracted &amp; Normalized Successfully
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono bg-background/80 px-2 py-0.5 rounded text-muted-foreground">
                {importResult?.sourceType}
              </span>
            </div>

            {/* Confidence & Ambiguity Warnings */}
            {importResult?.warnings && importResult.warnings.length > 0 && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-[11px]">Field Confidence Notice</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-amber-700 dark:text-amber-400">
                    {importResult.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div className="flex gap-1 border-b border-border/80 pb-1 text-xs shrink-0">
              {[
                { id: 'contact', label: 'Contact', icon: User },
                { id: 'experience', label: `Experience (${resume.experience.length})`, icon: Briefcase },
                { id: 'skills', label: 'Skills', icon: Wrench },
                { id: 'education', label: `Education (${resume.education.length})`, icon: GraduationCap },
                { id: 'raw', label: 'Raw Extracted', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setReviewTab(tab.id as any)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer text-[11px]',
                    reviewTab === tab.id
                      ? 'bg-primary text-primary-foreground font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-3 w-3" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panes */}
            <div className="flex-1 overflow-y-auto p-3 bg-muted/20 border border-border/60 rounded-xl text-xs space-y-2 max-h-[300px]">
              {reviewTab === 'contact' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-bold text-foreground">{resume.personalInfo.name || 'Not detected'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-semibold text-primary">{resume.personalInfo.title || 'Not detected'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{resume.personalInfo.email || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{resume.personalInfo.phone || 'None'}</span>
                  </div>
                  {resume.summary && (
                    <div className="pt-2">
                      <span className="text-muted-foreground block mb-1">Professional Summary:</span>
                      <p className="p-2 bg-background rounded border text-[11px] leading-relaxed">{resume.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {reviewTab === 'experience' && (
                <div className="space-y-3">
                  {resume.experience.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No experience entries detected.</p>
                  ) : (
                    resume.experience.map((exp, idx) => (
                      <div key={idx} className="p-2.5 bg-background rounded-lg border space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-foreground">
                          <span>{exp.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">{exp.period}</span>
                        </div>
                        <div className="text-primary font-medium text-[11px]">{exp.company}</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-muted-foreground mt-1">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              )}

              {reviewTab === 'skills' && (
                <div className="space-y-2">
                  {resume.skillCategories.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No skills detected.</p>
                  ) : (
                    resume.skillCategories.map((cat, idx) => (
                      <div key={idx} className="p-2 bg-background rounded border">
                        <strong className="block text-[11px] text-foreground mb-1">{cat.category}</strong>
                        <div className="flex flex-wrap gap-1">
                          {cat.skills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-muted text-[10px] font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {reviewTab === 'education' && (
                <div className="space-y-2">
                  {resume.education.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No education entries detected.</p>
                  ) : (
                    resume.education.map((edu, idx) => (
                      <div key={idx} className="p-2.5 bg-background rounded border">
                        <div className="font-bold text-foreground">{edu.degree}</div>
                        <div className="text-primary text-[11px] font-medium">{edu.school} ({edu.year})</div>
                        {edu.details && <p className="text-[10px] text-muted-foreground mt-1">{edu.details}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {reviewTab === 'raw' && (
                <pre className="text-[10px] font-mono whitespace-pre-wrap text-muted-foreground bg-background p-2 rounded border">
                  {importResult?.rawTextPreview}
                </pre>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 shrink-0 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs cursor-pointer"
          >
            Cancel
          </Button>

          {step === 'review' && (
            <div className="flex items-center gap-2 flex-1 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (importResult?.resumeData) {
                    onImportSuccess(importResult.resumeData, 'merge');
                    onOpenChange(false);
                    handleReset();
                  }
                }}
                className="h-8 text-xs gap-1.5 font-semibold cursor-pointer border-primary/30 text-primary hover:bg-primary/10"
              >
                <Plus className="h-3.5 w-3.5" /> Add to Existing
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (importResult?.resumeData) {
                    onImportSuccess(importResult.resumeData, 'replace');
                    onOpenChange(false);
                    handleReset();
                  }
                }}
                className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-bold shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Import &amp; Replace
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
