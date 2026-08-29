import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeData, ResumeEngine } from '@/engines/ResumeEngine';
import { ResumeExportEngine } from '@/engines/ResumeExportEngine';
import { ResumeExportRenderer } from './ResumeExportRenderer';
import {
  Printer, Download, FileText, Sparkles, Check,
  ShieldCheck, Globe, Sliders, ExternalLink, Loader2, Eye, Layout
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeData;
  selectedTemplateId: string;
}

export function ResumeExportModal({
  open,
  onOpenChange,
  resumeData,
  selectedTemplateId,
}: ResumeExportModalProps) {
  const candidateName = resumeData.personalInfo?.name?.trim();
  const defaultDocName = candidateName ? `${candidateName.replace(/\s+/g, '_')}_Resume` : 'Resume';

  const [activeTab, setActiveTab] = useState<'options' | 'preview'>('options');
  const [docName, setDocName] = useState<string>(defaultDocName);
  const [paperSize, setPaperSize] = useState<'A4' | 'Letter'>(
    resumeData.design?.paperSize || 'A4'
  );
  const [quality, setQuality] = useState<'high' | 'standard'>('high');
  const [clickableLinks, setClickableLinks] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(0.65);

  const handleExportStandard = async () => {
    setIsExporting(true);
    try {
      const renderedHtml = ResumeEngine.renderTemplate(
        resumeData,
        selectedTemplateId,
        { paperSize }
      );

      await ResumeExportEngine.exportToPdf({
        html: renderedHtml,
        title: `${docName || 'Resume'}.pdf`,
        paperSize,
        quality,
        clickableLinks,
      });
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAts = async () => {
    setIsExporting(true);
    try {
      const atsDesign = {
        headerLayout: 'minimal' as const,
        fontFamily: 'Arial',
        typographyPreset: 'normal' as const,
        nameSize: 24,
        headingSize: 12,
        bodySize: 10.5,
        metadataSize: 9.5,
        lineHeight: 1.4,
        letterSpacing: 'normal',
        textAlign: 'left' as const,
        palette: 'minimal-black',
        colors: {
          primary: '#000000',
          accent: '#111111',
          heading: '#000000',
          body: '#222222',
          muted: '#555555',
          link: '#000000',
          border: '#cccccc',
          background: '#ffffff',
        },
        spacingPreset: 'balanced' as const,
        spacing: {
          pageMargin: 24,
          sectionGap: 14,
          entryGap: 10,
          paragraphGap: 3,
          lineHeight: 1.4,
        },
        paperSize,
        skillsStyle: 'categories' as const,
        bulletStyle: 'dot' as const,
        headingStyle: 'underline' as const,
        projectStyle: 'standard' as const,
        educationStyle: 'classic' as const,
      };

      const atsRenderedHtml = ResumeEngine.renderTemplate(
        resumeData,
        'tmpl_ats_classic',
        atsDesign
      );

      await ResumeExportEngine.exportToPdf({
        html: atsRenderedHtml,
        title: `${docName || 'Resume'}_ATS.pdf`,
        paperSize,
        quality,
        clickableLinks,
      });
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'p-5 max-h-[90vh] flex flex-col transition-all',
        activeTab === 'preview' ? 'sm:max-w-[780px]' : 'sm:max-w-[520px]'
      )}>
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Download Resume PDF</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Direct client-side A4 PDF download with zero browser print dialogs.
                </DialogDescription>
              </div>
            </div>

            {/* Tab switch between Options and Preview */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('options')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer',
                  activeTab === 'options' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={cn(
                  'px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer',
                  activeTab === 'preview' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Eye className="h-3 w-3" /> Preview
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* ── Tab 1: Export Options ────────────────────────────────────────── */}
        {activeTab === 'options' && (
          <div className="space-y-4 my-2 text-xs flex-1 overflow-y-auto pr-1">
            {/* File Name */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                File Name
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="John_Doe_Resume"
                  className="h-8 text-xs font-medium"
                />
                <span className="text-xs font-mono text-muted-foreground">.pdf</span>
              </div>
            </div>

            {/* Paper Format & Quality Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Paper Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Paper Size
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['A4', 'Letter'] as const).map(fmt => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setPaperSize(fmt)}
                      className={cn(
                        'py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                        paperSize === fmt
                          ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {fmt} {fmt === 'A4' ? '(210×297mm)' : '(8.5×11in)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Level */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground">
                  Rendering Mode
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['high', 'standard'] as const).map(q => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={cn(
                        'py-1.5 rounded-lg text-xs font-bold border capitalize transition-all text-center cursor-pointer',
                        quality === q
                          ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {q === 'high' ? 'Vector High' : 'Standard'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clickable Links Toggle */}
            <div className="p-3 border border-border/80 rounded-xl bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <div>
                  <span className="font-semibold text-[11px] block">Preserve Clickable Hyperlinks</span>
                  <span className="text-[10px] text-muted-foreground">
                    Email, phone, LinkedIn, GitHub, and portfolio links remain clickable in PDF
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={clickableLinks}
                onChange={e => setClickableLinks(e.target.checked)}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {/* Guarantee Badges */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" /> Isolated A4 Page Guarantee
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald-600" /> Zero Editor UI Leakage
              </span>
            </div>
          </div>
        )}

        {/* ── Tab 2: Live A4 PDF Print Preview ─────────────────────────────── */}
        {activeTab === 'preview' && (
          <div className="my-2 flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center bg-muted/30 dark:bg-background/80 p-4 rounded-xl border border-border/60 min-h-[380px]">
            <div className="w-full flex items-center justify-between mb-2 text-xs text-muted-foreground px-1">
              <span className="font-semibold text-foreground">Exact Output Preview (Page 1)</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPreviewScale(s => Math.max(0.45, s - 0.1))}
                  className="px-2 py-0.5 rounded bg-background border border-border hover:bg-muted text-[11px]"
                >
                  -
                </button>
                <span className="text-[10px] font-mono w-10 text-center">{Math.round(previewScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewScale(s => Math.min(1.0, s + 0.1))}
                  className="px-2 py-0.5 rounded bg-background border border-border hover:bg-muted text-[11px]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="overflow-auto max-h-[460px] w-full flex justify-center py-2">
              <ResumeExportRenderer
                resumeData={resumeData}
                selectedTemplateId={selectedTemplateId}
                paperSize={paperSize}
                scale={previewScale}
                showPageNumbers={true}
                className="shadow-xl"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 shrink-0">
          {/* Export ATS PDF */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExporting}
            onClick={handleExportAts}
            className="h-8.5 text-xs gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Export ATS PDF
          </Button>

          {/* Download Visual PDF */}
          <Button
            type="button"
            size="sm"
            disabled={isExporting}
            onClick={handleExportStandard}
            className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold shadow-2xs cursor-pointer flex-1"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing PDF...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" /> Download PDF (A4)
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
