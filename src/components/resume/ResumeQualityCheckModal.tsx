import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/engines/ResumeEngine';
import { ResumeValidator, ResumeAuditReport } from '@/utils/resumeValidator';
import {
  CheckCircle2, AlertTriangle, Info, Sparkles, ShieldCheck,
  FileCheck, Globe, Briefcase, FileSearch, Target, Check, HelpCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeQualityCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
}

export function ResumeQualityCheckModal({
  open,
  onOpenChange,
  resumeData,
}: ResumeQualityCheckModalProps) {
  const [activeTab, setActiveTab] = useState<'audit' | 'jd'>('audit');
  const [jobDescription, setJobDescription] = useState<string>('');

  const auditReport: ResumeAuditReport = useMemo(() => {
    return ResumeValidator.auditResume(resumeData);
  }, [resumeData]);

  const jdMatch = useMemo(() => {
    return ResumeValidator.matchJobDescription(resumeData, jobDescription);
  }, [resumeData, jobDescription]);

  const scoreColor =
    auditReport.score >= 85
      ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30'
      : auditReport.score >= 70
      ? 'text-amber-600 bg-amber-500/10 border-amber-500/30'
      : 'text-rose-600 bg-rose-500/10 border-rose-500/30';

  const warnings = auditReport.items.filter(i => i.level === 'warning');
  const successes = auditReport.items.filter(i => i.level === 'success');
  const infos = auditReport.items.filter(i => i.level === 'info');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-5 max-h-[88vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">ATS Audit &amp; Keyword Matcher</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  ATS formatting guidance, section completeness, and job description alignment.
                </DialogDescription>
              </div>
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1',
                  activeTab === 'audit' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ShieldCheck className="h-3 w-3" /> ATS Audit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('jd')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1',
                  activeTab === 'jd' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Target className="h-3 w-3" /> Job Match
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* ── TAB 1: ATS Audit ────────────────────────────────────────────── */}
        {activeTab === 'audit' && (
          <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1 text-xs">
            {/* Health Score Summary Card */}
            <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                  ATS Readiness Score
                </span>
                <h3 className="text-sm font-bold text-foreground">
                  {auditReport.score >= 85
                    ? 'Strong & Application Ready'
                    : auditReport.score >= 70
                    ? 'Good — A few enhancements recommended'
                    : 'Needs Attention'}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {auditReport.lengthRecommendation}
                </p>
              </div>

              <div
                className={cn(
                  'h-16 w-16 rounded-2xl border flex flex-col items-center justify-center shrink-0 font-extrabold shadow-2xs',
                  scoreColor
                )}
              >
                <span className="text-xl leading-none">{auditReport.score}</span>
                <span className="text-[9px] opacity-75 font-semibold">/ 100</span>
              </div>
            </div>

            {/* Warnings List */}
            {warnings.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Actionable Improvements ({warnings.length})
                </span>
                <div className="space-y-1.5">
                  {warnings.map(w => (
                    <div
                      key={w.id}
                      className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-950 dark:text-amber-200 text-xs flex items-start gap-2"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block text-[11px]">{w.title}</strong>
                        <span className="text-[10.5px] opacity-90 leading-relaxed block mt-0.5">
                          {w.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passed Checks */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Passed Checks ({successes.length})
              </span>
              <div className="space-y-1.5">
                {successes.map(s => (
                  <div
                    key={s.id}
                    className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block text-[11px] text-foreground">{s.title}</strong>
                      <span className="text-[10.5px] text-muted-foreground leading-relaxed block mt-0.5">
                        {s.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal / Guidance Disclaimer */}
            <p className="text-[10px] text-muted-foreground/80 italic pt-1 border-t border-border/40">
              * ATS score is guidance based on standard corporate ATS parser patterns. It does not guarantee passing company-specific screening filters.
            </p>
          </div>
        )}

        {/* ── TAB 2: Job Description Match ────────────────────────────────── */}
        {activeTab === 'jd' && (
          <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 text-xs">
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">
                Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the target job posting / requirements here to compare technical keywords and qualifications..."
                rows={4}
                className="w-full text-xs p-2.5 rounded-xl bg-background border border-border resize-none focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            {jobDescription.trim().length >= 20 ? (
              <div className="space-y-3">
                {/* Score & Alignment Badge */}
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">JD Keyword Match</span>
                    <span className="text-sm font-bold text-foreground">
                      {jdMatch.matchedKeywords.length} Matched / {jdMatch.matchedKeywords.length + jdMatch.missingKeywords.length} Detected Terms
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-extrabold text-sm rounded-xl">
                    {jdMatch.matchScore}% Match
                  </div>
                </div>

                {/* Matched Keywords (Green) */}
                {jdMatch.matchedKeywords.length > 0 && (
                  <div>
                    <label className="text-[10.5px] font-bold text-emerald-600 block mb-1">
                      ✓ Matched Keywords in Your Resume ({jdMatch.matchedKeywords.length})
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {jdMatch.matchedKeywords.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] border border-emerald-500/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Keywords (Amber) */}
                {jdMatch.missingKeywords.length > 0 && (
                  <div>
                    <label className="text-[10.5px] font-bold text-amber-600 block mb-1">
                      ⚠ Keywords Found in Job Description (Missing in Resume)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {jdMatch.missingKeywords.map((k, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-800 dark:text-amber-300 font-mono text-[10px] border border-amber-500/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="p-2.5 bg-muted/30 rounded-xl border border-border text-[11px] space-y-1">
                  <strong className="block text-foreground text-[10.5px]">Recommendations:</strong>
                  {jdMatch.suggestedAreas.map((s, i) => (
                    <p key={i} className="text-muted-foreground leading-relaxed">• {s}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/80">
                <FileSearch className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium text-foreground">Paste a Job Posting to See Keyword Alignment</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Compares required technologies, frameworks, and job terminology with your resume content.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-bold bg-primary text-primary-foreground shadow-2xs cursor-pointer w-full"
          >
            Close Check
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
