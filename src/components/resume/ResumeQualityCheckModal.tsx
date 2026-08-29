import React, { useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResumeData } from '@/engines/ResumeEngine';
import { ResumeValidator, ResumeAuditReport } from '@/utils/resumeValidator';
import {
  CheckCircle2, AlertTriangle, Info, Sparkles, ShieldCheck,
  FileCheck, Globe, User, Briefcase, Award, X
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeQualityCheckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  onNavigateSection?: (sectionId: string) => void;
}

export function ResumeQualityCheckModal({
  open,
  onOpenChange,
  resumeData,
}: ResumeQualityCheckModalProps) {
  const auditReport: ResumeAuditReport = useMemo(() => {
    return ResumeValidator.auditResume(resumeData);
  }, [resumeData]);

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
      <DialogContent className="sm:max-w-[560px] p-5 max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Resume Quality &amp; ATS Audit</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Automated scan of keywords, contact completeness, metrics, and links.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 my-2 pr-1 text-xs">
          {/* ── Score & Page Summary Card ─────────────────────────────────── */}
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-0.5">
                Overall Resume Health
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

          {/* ── Warnings & Improvements List ──────────────────────────────── */}
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

          {/* ── Passed Checks List ────────────────────────────────────────── */}
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

          {/* ── Guidance & Tips ───────────────────────────────────────────── */}
          {infos.length > 0 && (
            <div className="space-y-1.5">
              {infos.map(inf => (
                <div
                  key={inf.id}
                  className="p-2 rounded-lg border border-border bg-card text-muted-foreground text-[10.5px] flex items-center gap-2"
                >
                  <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{inf.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="w-full h-8 text-xs font-semibold bg-primary text-primary-foreground"
          >
            Got It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
