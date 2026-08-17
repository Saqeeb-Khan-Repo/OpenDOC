import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QualityCheckerEngine, QualityReport, QualityIssue } from '@/engines/QualityCheckerEngine';
import { Slide } from '@/engines/types';
import {
  CheckCircle2, AlertTriangle, AlertCircle, Info,
  ShieldCheck, RefreshCw, Sparkles, Check
} from 'lucide-react';

interface QualityCheckerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentHtml?: string;
  slides?: Slide[];
  isPresentation?: boolean;
}

export function QualityCheckerModal({
  open,
  onOpenChange,
  documentHtml = '',
  slides = [],
  isPresentation = false,
}: QualityCheckerModalProps) {
  const report: QualityReport = isPresentation
    ? QualityCheckerEngine.analyzePresentation(slides)
    : QualityCheckerEngine.analyzeDocument(documentHtml);

  const getBadgeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 75) return 'text-amber-600 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-600 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Document &amp; Accessibility Audit</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Automated inspection for typography, structure, color contrast, and readability.
                </DialogDescription>
              </div>
            </div>

            {/* Score Ring / Pill */}
            <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getBadgeColor(report.score)}`}>
              Quality Score: {report.score}%
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-2">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-muted/50 border border-border text-center">
            <div>
              <span className="text-[10px] text-muted-foreground block">Word Count</span>
              <span className="text-xs font-bold text-foreground font-mono">{report.metrics.wordCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Read Time</span>
              <span className="text-xs font-bold text-foreground font-mono">~{report.metrics.readingTimeMinutes} min</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Headings</span>
              <span className="text-xs font-bold text-foreground font-mono">{report.metrics.headingsCount}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Passed Checks</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">{report.passedChecks} / {report.totalChecks}</span>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Audit Findings &amp; Suggestions
            </label>
            {report.issues.map(iss => {
              const isSuccess = iss.type === 'success';
              const isWarning = iss.type === 'warning';
              const isError = iss.type === 'error';

              return (
                <div
                  key={iss.id}
                  className={`p-2.5 rounded-lg border flex items-start gap-2.5 transition-all ${
                    isSuccess
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : isWarning
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : isError
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  {isSuccess && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                  {isWarning && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />}
                  {isError && <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />}
                  {!isSuccess && !isWarning && !isError && <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}

                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-semibold text-foreground">{iss.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{iss.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button size="sm" onClick={() => onOpenChange(false)} className="bg-primary font-semibold">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
