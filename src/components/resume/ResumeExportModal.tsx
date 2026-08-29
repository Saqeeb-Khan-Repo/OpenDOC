import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResumeData, ResumeEngine, ResumePageSettings, ResumePageSize, ResumeOrientation,
  ResumeMarginPreset, DEFAULT_PAGE_SETTINGS
} from '@/engines/ResumeEngine';
import { ResumeExportEngine } from '@/engines/ResumeExportEngine';
import { ResumeExportRenderer } from './ResumeExportRenderer';
import {
  Download, FileText, Sparkles, Check, ShieldCheck, Globe,
  Sliders, Loader2, Eye, Layout, Link2, Unlink2, Lock
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

  // Page selection
  const [pagesMode, setPagesMode] = useState<'all' | 'current' | 'custom'>('all');
  const [customPages, setCustomPages] = useState<string>('1-2');

  // Page setup & margins
  const [pageSettings, setPageSettings] = useState<ResumePageSettings>({
    ...(resumeData.pageSettings || DEFAULT_PAGE_SETTINGS),
  });

  const [quality, setQuality] = useState<'high' | 'standard'>('high');
  const [clickableLinks, setClickableLinks] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(0.65);

  const getEffectivePageRange = (): string => {
    if (pagesMode === 'all') return 'all';
    if (pagesMode === 'current') return '1';
    return customPages.trim() || '1';
  };

  const handleExportStandard = async () => {
    setIsExporting(true);
    try {
      const renderedHtml = ResumeEngine.renderTemplate(
        resumeData,
        selectedTemplateId,
        {
          paperSize: pageSettings.pageSize === 'Letter' ? 'Letter' : 'A4',
          pageSettings,
        }
      );

      await ResumeExportEngine.exportToPdf({
        html: renderedHtml,
        title: `${docName || 'Resume'}.pdf`,
        paperSize: pageSettings.pageSize,
        orientation: pageSettings.orientation,
        pageSettings,
        pageRange: getEffectivePageRange(),
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
        paperSize: (pageSettings.pageSize === 'Letter' ? 'Letter' : 'A4') as 'A4' | 'Letter',
        pageSettings,
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
        paperSize: pageSettings.pageSize,
        orientation: pageSettings.orientation,
        pageSettings,
        pageRange: getEffectivePageRange(),
        quality,
        clickableLinks,
      });
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMarginChange = (side: 'top' | 'bottom' | 'left' | 'right', val: number) => {
    const num = Math.max(0, Math.min(60, val));
    if (pageSettings.linkedMargins) {
      if (side === 'top' || side === 'bottom') {
        setPageSettings(s => ({ ...s, marginTop: num, marginBottom: num, marginPreset: 'custom' }));
      } else {
        setPageSettings(s => ({ ...s, marginLeft: num, marginRight: num, marginPreset: 'custom' }));
      }
    } else {
      setPageSettings(s => ({
        ...s,
        [side === 'top' ? 'marginTop' : side === 'bottom' ? 'marginBottom' : side === 'left' ? 'marginLeft' : 'marginRight']: num,
        marginPreset: 'custom',
      }));
    }
  };

  const applyMarginPreset = (preset: ResumeMarginPreset) => {
    let top = 15; let bottom = 15; let left = 15; let right = 15;
    if (preset === 'narrow') { top = 8; bottom = 8; left = 8; right = 8; }
    else if (preset === 'normal') { top = 15; bottom = 15; left = 15; right = 15; }
    else if (preset === 'wide') { top = 25; bottom = 25; left = 25; right = 25; }

    setPageSettings(s => ({
      ...s,
      marginTop: top,
      marginBottom: bottom,
      marginLeft: left,
      marginRight: right,
      marginPreset: preset,
    }));
  };

  const summaryPagesText = pagesMode === 'all' ? 'All Pages' : pagesMode === 'current' ? 'Page 1' : `Pages: ${customPages || '1'}`;
  const summaryMarginsText = `${pageSettings.marginTop}/${pageSettings.marginBottom}/${pageSettings.marginLeft}/${pageSettings.marginRight} mm`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'p-5 max-h-[90vh] flex flex-col transition-all',
        activeTab === 'preview' ? 'sm:max-w-[780px]' : 'sm:max-w-[560px]'
      )}>
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Export Resume to PDF</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Direct client-side PDF download with page selection and custom margins.
                </DialogDescription>
              </div>
            </div>

            {/* Tab switch between Settings and Preview */}
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

        {/* ── Tab 1: Export Settings ────────────────────────────────────────── */}
        {activeTab === 'options' && (
          <div className="space-y-3.5 my-2 text-xs flex-1 overflow-y-auto pr-1">
            {/* File Name */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                File Name
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                  placeholder="Mohammed_Sirajuddin_Resume"
                  className="h-8 text-xs font-medium"
                />
                <span className="text-xs font-mono text-muted-foreground">.pdf</span>
              </div>
            </div>

            {/* ── Page Selection ───────────────────────────────────────────── */}
            <div className="p-3 border border-border/80 rounded-xl bg-muted/10 space-y-2">
              <label className="text-[11px] font-bold text-foreground block">
                Pages to Export
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'all', label: 'All Pages' },
                  { id: 'current', label: 'Current Page' },
                  { id: 'custom', label: 'Custom Pages' },
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPagesMode(p.id as any)}
                    className={cn(
                      'py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer',
                      pagesMode === p.id
                        ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                        : 'border-border bg-background text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {pagesMode === 'custom' && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground shrink-0">Range:</span>
                  <Input
                    value={customPages}
                    onChange={e => setCustomPages(e.target.value)}
                    placeholder="e.g. 1-2 or 1,3-5"
                    className="h-7 text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Format: 1-2, 1,3</span>
                </div>
              )}
            </div>

            {/* ── Dimensions & Orientation Grid ────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Paper Size */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground block">
                  Page Size
                </label>
                <select
                  value={pageSettings.pageSize}
                  onChange={e => setPageSettings(s => ({ ...s, pageSize: e.target.value as any }))}
                  className="h-8 w-full text-xs font-semibold bg-background border border-border rounded-lg px-2.5 cursor-pointer"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="Legal">Legal (8.5 × 14 in)</option>
                  <option value="A3">A3 (297 × 420 mm)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                  <option value="Custom">Custom Size</option>
                </select>
              </div>

              {/* Orientation */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground block">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['portrait', 'landscape'] as const).map(ori => (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => setPageSettings(s => ({ ...s, orientation: ori }))}
                      className={cn(
                        'h-8 rounded-lg text-xs font-bold border capitalize transition-all text-center cursor-pointer',
                        pageSettings.orientation === ori
                          ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Custom Margins Section ───────────────────────────────────── */}
            <div className="space-y-2 p-3 border border-border/80 rounded-xl bg-muted/10">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-foreground">
                  Page Margins (mm)
                </label>
                <div className="flex items-center gap-1.5">
                  {(['narrow', 'normal', 'wide'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => applyMarginPreset(p)}
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-medium border capitalize cursor-pointer',
                        pageSettings.marginPreset === p
                          ? 'border-primary bg-primary/10 text-primary font-bold'
                          : 'border-border bg-background text-muted-foreground'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Top</span>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={pageSettings.marginTop}
                    onChange={e => handleMarginChange('top', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Bottom</span>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={pageSettings.marginBottom}
                    onChange={e => handleMarginChange('bottom', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Left</span>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={pageSettings.marginLeft}
                    onChange={e => handleMarginChange('left', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block mb-0.5">Right</span>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={pageSettings.marginRight}
                    onChange={e => handleMarginChange('right', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Clickable Links & Watermark Info */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 border border-border/80 rounded-xl bg-background flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Clickable Links</span>
                <input
                  type="checkbox"
                  checked={clickableLinks}
                  onChange={e => setClickableLinks(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="p-2.5 border border-border/80 rounded-xl bg-background flex items-center justify-between">
                <span className="font-semibold text-muted-foreground">Watermark</span>
                <span className="font-mono text-emerald-600 font-bold">None</span>
              </div>
            </div>

            {/* Export Summary Badge */}
            <div className="p-2.5 bg-muted/30 border border-border/80 rounded-xl flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Configuration:</span>
              <span className="font-mono font-bold text-foreground">
                {pageSettings.pageSize} • {pageSettings.orientation} • Margins: {summaryMarginsText} • {summaryPagesText} • Watermark: None
              </span>
            </div>
          </div>
        )}

        {/* ── Tab 2: Live PDF Print Preview ───────────────────────────────── */}
        {activeTab === 'preview' && (
          <div className="my-2 flex-1 overflow-y-auto overflow-x-hidden flex flex-col items-center bg-muted/30 dark:bg-background/80 p-4 rounded-xl border border-border/60 min-h-[380px]">
            <div className="w-full flex items-center justify-between mb-2 text-xs text-muted-foreground px-1">
              <span className="font-semibold text-foreground">Standalone Document Preview</span>
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
                resumeData={{ ...resumeData, pageSettings }}
                selectedTemplateId={selectedTemplateId}
                paperSize={pageSettings.pageSize === 'Letter' ? 'Letter' : 'A4'}
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
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" /> Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
