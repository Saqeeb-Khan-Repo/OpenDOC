import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResumeEngine, ResumeData, ResumeDesignConfig, RESUME_TEMPLATES_METADATA,
  ResumeCustomSection
} from '@/engines/ResumeEngine';
import { ResumeExportEngine } from '@/engines/ResumeExportEngine';
import { ResumeValidator, ResumeAuditReport } from '@/utils/resumeValidator';
import { useDocumentsStore } from '@/store/documentsStore';
import {
  FileText, ArrowLeft, Download, Plus, Trash2, Edit3, Check,
  Sparkles, Palette, Type, Printer, Eye, ChevronDown, ChevronUp,
  Briefcase, GraduationCap, Code2, Award, CheckCircle2, User,
  Globe, Share2, Layers, Undo2, Redo2, Sliders, ZoomIn, ZoomOut,
  Maximize2, RefreshCw, Layout, Smartphone, ShieldCheck, FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';
import { SEOHead } from '@/components/seo/SEOHead';

// Modular Resume Components
import { ResumeHeaderEditor } from '@/components/resume/ResumeHeaderEditor';
import { ResumeSectionListEditor } from '@/components/resume/ResumeSectionListEditor';
import { ResumeDesignPanel } from '@/components/resume/ResumeDesignPanel';
import { ResumeTemplateGalleryModal } from '@/components/resume/ResumeTemplateGalleryModal';
import { ResumeCustomSectionModal } from '@/components/resume/ResumeCustomSectionModal';
import { ResumeExportModal } from '@/components/resume/ResumeExportModal';
import { ResumeQualityCheckModal } from '@/components/resume/ResumeQualityCheckModal';
import { ResumeMobileToolbar } from '@/components/resume/ResumeMobileToolbar';

const STORAGE_KEY = 'docpro_resume_draft_v2';

export function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();

  // ── Load Initial Resume Data ───────────────────────────────────────────────
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.personalInfo) {
          return {
            ...ResumeEngine.getDefaultResumeData(),
            ...parsed,
            design: {
              ...ResumeEngine.getDefaultDesign(),
              ...(parsed.design || {}),
            },
          };
        }
      }
    } catch (e) {
      console.warn('Could not load saved resume from localStorage', e);
    }
    return ResumeEngine.getDefaultResumeData();
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl_modern_pro');

  // ── UI View State ──────────────────────────────────────────────────────────
  const [leftTab, setLeftTab] = useState<'content' | 'sections'>('content');
  const [mobileSheet, setMobileSheet] = useState<'none' | 'content' | 'design' | 'sections' | 'templates'>('none');
  const [showTemplateModal, setShowTemplateModal] = useState<boolean>(false);
  const [showCustomSectionModal, setShowCustomSectionModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showQualityCheckModal, setShowQualityCheckModal] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(100);

  // ── Resume Audit & Validation ──────────────────────────────────────────────
  const auditReport: ResumeAuditReport = useMemo(() => {
    return ResumeValidator.auditResume(resumeData);
  }, [resumeData]);

  // ── Undo / Redo History Stack ──────────────────────────────────────────────
  const [history, setHistory] = useState<ResumeData[]>([resumeData]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isHistoryUpdate = useRef(false);

  // Push change to history stack with debounce
  const updateResumeData = (nextData: ResumeData | ((prev: ResumeData) => ResumeData)) => {
    setResumeData(prev => {
      const updated = typeof nextData === 'function' ? nextData(prev) : nextData;
      if (!isHistoryUpdate.current) {
        setHistory(hPrev => {
          const sliced = hPrev.slice(0, historyIndex + 1);
          return [...sliced, updated].slice(-30); // Keep max 30 steps
        });
        setHistoryIndex(prevIdx => Math.min(prevIdx + 1, 29));
      }
      return updated;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      isHistoryUpdate.current = true;
      const targetState = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setResumeData(targetState);
      setTimeout(() => {
        isHistoryUpdate.current = false;
      }, 50);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isHistoryUpdate.current = true;
      const targetState = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setResumeData(targetState);
      setTimeout(() => {
        isHistoryUpdate.current = false;
      }, 50);
    }
  };

  // ── LocalStorage Autosave ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      } catch (e) {
        console.warn('Failed to auto-save resume', e);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [resumeData]);

  // ── Rendered HTML Preview ──────────────────────────────────────────────────
  const resumeHtml = useMemo(() => {
    return ResumeEngine.renderTemplate(resumeData, selectedTemplateId, resumeData.design);
  }, [resumeData, selectedTemplateId]);

  // ── Custom Section Creation ────────────────────────────────────────────────
  const handleAddCustomSection = (newSection: ResumeCustomSection) => {
    const customSections = [...(resumeData.customSections || []), newSection];
    const newSectionConfig = {
      id: `sec_${newSection.id}`,
      type: 'custom' as const,
      title: newSection.title,
      visible: true,
      customSectionId: newSection.id,
    };
    const sectionOrder = [...(resumeData.sectionOrder || []), newSectionConfig];

    updateResumeData({
      ...resumeData,
      customSections,
      sectionOrder,
    });
  };

  // ── Open in Full Document Editor ───────────────────────────────────────────
  const handleOpenInEditor = () => {
    const doc = createDocument({
      title: `${resumeData.personalInfo.name || 'Professional'} Resume`,
      content: resumeHtml,
      mode: 'document',
    });
    navigate(`/editor/${doc.id}`);
  };

  // ── Isolated PDF Export Trigger ───────────────────────────────────────────
  const handleOpenExportModal = () => {
    setShowExportModal(true);
  };

  const selectedTemplateMeta = RESUME_TEMPLATES_METADATA.find(t => t.id === selectedTemplateId) || RESUME_TEMPLATES_METADATA[0];

  return (
    <div className="h-screen h-[100dvh] min-h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden">
      <SEOHead
        title="Resume Studio | DocProEditor"
        description="DocProEditor ATS & Professional Resume Studio"
        canonicalPath="/resume"
        noindex={true}
      />

      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="h-12 bg-background/95 backdrop-blur border-b border-border px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold tracking-tight">DocProEditor</span>
          </button>

          <span className="text-muted-foreground/40 text-xs font-mono select-none">/</span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">Resume Builder</span>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full hidden md:inline">
              ATS &amp; Canva Grade
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center border border-border rounded-lg bg-background p-0.5">
            <button
              type="button"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer rounded"
              title="Undo change (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer rounded"
              title="Redo change (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Quality Check Trigger Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQualityCheckModal(true)}
            className="h-8 text-xs gap-1.5 font-medium cursor-pointer border-emerald-500/30 hover:bg-emerald-500/10"
            title="Scan for ATS compliance and missing fields"
          >
            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Audit:</span>
            <span className="font-bold text-emerald-600">{auditReport.score}%</span>
          </Button>

          {/* Template Selector Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
            className="h-8 text-xs gap-1.5 font-medium cursor-pointer"
          >
            <Layout className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Template: </span>
            <span className="font-semibold">{selectedTemplateMeta.name.split(' ')[0]}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </Button>

          {/* Edit in DocProEditor */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInEditor}
            className="h-8 text-xs gap-1.5 hidden xl:flex font-medium cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-blue-500" /> Edit in DocProEditor
          </Button>

          {/* Download PDF / Export */}
          <Button
            size="sm"
            onClick={handleOpenExportModal}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-bold shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download PDF</span>
          </Button>
        </div>
      </header>

      {/* ── 3-Part Desktop Workspace Body / Responsive Split ─────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT PANEL: Content & Sections Editor (Desktop) ───────────────── */}
        <div className="hidden md:flex w-[380px] lg:w-[420px] xl:w-[460px] border-r border-border flex-col bg-card/30 shrink-0 select-none">
          {/* Top Sub-tabs (Content vs Sections) */}
          <div className="p-2 border-b border-border/80 bg-muted/20 flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setLeftTab('content')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                leftTab === 'content'
                  ? 'bg-background text-primary shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <User className="h-3.5 w-3.5" /> Header &amp; Info
            </button>
            <button
              type="button"
              onClick={() => setLeftTab('sections')}
              className={cn(
                'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                leftTab === 'sections'
                  ? 'bg-background text-primary shadow-2xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Layers className="h-3.5 w-3.5" /> Resume Sections
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y overscroll-y-contain">
            {leftTab === 'content' ? (
              <ResumeHeaderEditor
                personalInfo={resumeData.personalInfo}
                onChange={personalInfo => updateResumeData({ ...resumeData, personalInfo })}
              />
            ) : (
              <ResumeSectionListEditor
                resumeData={resumeData}
                onChange={updateResumeData}
                onOpenAddCustomSection={() => setShowCustomSectionModal(true)}
              />
            )}
          </div>
        </div>

        {/* ── CENTER PANEL: Live A4/Letter Multi-Page Canvas Stage ─────────── */}
        <div className="flex-1 bg-muted/30 dark:bg-background/60 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center justify-start touch-pan-y overscroll-y-contain pb-20 md:pb-8">
          {/* Stage Controls: Zoom & Paper Info */}
          <div className="w-full max-w-[820px] flex items-center justify-between mb-3 text-xs text-muted-foreground select-none px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-primary" /> Live Document Preview
              </span>
              <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-mono">
                {resumeData.design?.paperSize || 'A4'} Portrait
              </span>
              <button
                type="button"
                onClick={() => setShowQualityCheckModal(true)}
                className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 cursor-pointer transition-colors"
              >
                <FileCheck className="h-3 w-3" /> {auditReport.pageEstimate} Page{auditReport.pageEstimate > 1 ? 's' : ''}
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.max(50, z - 10))}
                className="p-1 hover:text-foreground cursor-pointer rounded"
                title="Zoom out"
              >
                <ZoomOut className="h-3 w-3" />
              </button>
              <span className="text-[10px] font-mono font-medium px-1 w-10 text-center">
                {zoomScale}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale(z => Math.min(200, z + 10))}
                className="p-1 hover:text-foreground cursor-pointer rounded"
                title="Zoom in"
              >
                <ZoomIn className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(100)}
                className="text-[10px] font-medium px-1.5 py-0.5 hover:text-primary cursor-pointer border-l border-border/80"
                title="Reset zoom"
              >
                100%
              </button>
            </div>
          </div>

          {/* ── Scaled Resume Paper Container ─────────────────────────────── */}
          <div
            style={{
              transform: `scale(${zoomScale / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center"
          >
            <div
              id="resume-print-area"
              className={cn(
                'w-full max-w-[794px] min-h-[1123px] bg-white text-[#0f172a] shadow-2xl rounded-sm transition-all relative border border-border/30',
                resumeData.design?.paperSize === 'Letter' ? 'max-w-[816px] min-h-[1056px]' : 'max-w-[794px] min-h-[1123px]'
              )}
              dangerouslySetInnerHTML={{ __html: resumeHtml }}
            />
          </div>
        </div>

        {/* ── RIGHT PANEL: Design, Typography, Colors & Spacing Inspector ───── */}
        <div className="hidden lg:flex w-[320px] xl:w-[360px] border-l border-border flex-col bg-card/40 shrink-0 select-none">
          <div className="p-3 border-b border-border/80 bg-muted/20 flex items-center justify-between shrink-0">
            <span className="font-bold text-xs flex items-center gap-1.5 text-foreground">
              <Palette className="h-3.5 w-3.5 text-primary" /> Design &amp; Styling
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
              Global Tokens
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y overscroll-y-contain">
            <ResumeDesignPanel
              design={resumeData.design || ResumeEngine.getDefaultDesign()}
              onChange={design => updateResumeData({ ...resumeData, design })}
            />
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM TOOLBAR (md:hidden) ───────────────────────────────── */}
      <ResumeMobileToolbar
        activeSheet={mobileSheet}
        onSelectSheet={setMobileSheet}
        onExportPdf={handleOpenExportModal}
      />

      {/* ── MOBILE BOTTOM SHEETS (Slide-up Overlays) ────────────────────────── */}
      {mobileSheet !== 'none' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-200">
          <div
            onClick={() => setMobileSheet('none')}
            className="flex-1"
          />
          <div className="bg-background border-t border-border rounded-t-2xl max-h-[80vh] flex flex-col p-4 shadow-2xl animate-in slide-in-from-bottom duration-250">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
              <div className="flex items-center gap-2 font-bold text-xs capitalize text-foreground">
                {mobileSheet === 'content' && <User className="h-4 w-4 text-primary" />}
                {mobileSheet === 'sections' && <Layers className="h-4 w-4 text-primary" />}
                {mobileSheet === 'design' && <Palette className="h-4 w-4 text-primary" />}
                {mobileSheet === 'templates' && <Layout className="h-4 w-4 text-primary" />}
                <span>
                  {mobileSheet === 'content' && 'Personal Information & Header'}
                  {mobileSheet === 'sections' && 'Resume Sections & Items'}
                  {mobileSheet === 'design' && 'Typography, Colors & Spacing'}
                  {mobileSheet === 'templates' && 'Switch Template Layout'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileSheet('none')}
                className="h-7 text-xs font-semibold"
              >
                Done
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-4">
              {mobileSheet === 'content' && (
                <ResumeHeaderEditor
                  personalInfo={resumeData.personalInfo}
                  onChange={personalInfo => updateResumeData({ ...resumeData, personalInfo })}
                />
              )}

              {mobileSheet === 'sections' && (
                <ResumeSectionListEditor
                  resumeData={resumeData}
                  onChange={updateResumeData}
                  onOpenAddCustomSection={() => {
                    setMobileSheet('none');
                    setShowCustomSectionModal(true);
                  }}
                />
              )}

              {mobileSheet === 'design' && (
                <ResumeDesignPanel
                  design={resumeData.design || ResumeEngine.getDefaultDesign()}
                  onChange={design => updateResumeData({ ...resumeData, design })}
                />
              )}

              {mobileSheet === 'templates' && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                    Select a Layout (Content Preserved)
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {RESUME_TEMPLATES_METADATA.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTemplateId(t.id);
                          setMobileSheet('none');
                        }}
                        className={cn(
                          'p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
                          selectedTemplateId === t.id
                            ? 'border-primary bg-primary/10 font-bold'
                            : 'border-border bg-card'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-3.5 w-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.thumbnailColor }}
                          />
                          <div>
                            <h4 className="text-xs font-semibold">{t.name}</h4>
                            <span className="text-[10px] text-muted-foreground">{t.category} • {t.layout}</span>
                          </div>
                        </div>
                        {selectedTemplateId === t.id && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <ResumeExportModal
        open={showExportModal}
        onOpenChange={setShowExportModal}
        resumeData={resumeData}
        selectedTemplateId={selectedTemplateId}
      />

      <ResumeQualityCheckModal
        open={showQualityCheckModal}
        onOpenChange={setShowQualityCheckModal}
        resumeData={resumeData}
      />

      <ResumeTemplateGalleryModal
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
        resumeData={resumeData}
      />

      <ResumeCustomSectionModal
        open={showCustomSectionModal}
        onOpenChange={setShowCustomSectionModal}
        onAddSection={handleAddCustomSection}
      />
    </div>
  );
}
