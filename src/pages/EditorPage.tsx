import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { useSettingsStore } from '@/store/settingsStore';
import { debounce } from '@/utils/cn';
import { EditorMode, StudioDocument, Slide } from '@/engines/types';
import { ExportEngine } from '@/engines/ExportEngine';
import { generateShareUrl, copyToClipboard } from '@/utils/share';
import { BrandKit } from '@/engines/BrandKitEngine';
import { DesignPreset, MagicDesignEngine } from '@/engines/MagicDesignEngine';
import { GeneratedDocument } from '@/engines/AIEngine';
import { SEOHead } from '@/components/seo/SEOHead';

// Editor components
import { StudioHeader } from '@/components/layout/StudioHeader';
import { DocumentCanvas } from '@/components/editor/DocumentCanvas';
import { PresentationCanvas } from '@/components/editor/PresentationCanvas';
import { DesignCanvas } from '@/components/editor/DesignCanvas';

// Modals
import { EquationModal } from '@/components/editor/EquationModal';
import { DiagramModal } from '@/components/editor/DiagramModal';
import { ChartModal } from '@/components/editor/ChartModal';
import { QRCodeModal } from '@/components/editor/QRCodeModal';
import { SignatureModal } from '@/components/editor/SignatureModal';
import { AcademicCoverModal } from '@/components/editor/AcademicCoverModal';
import { FindReplaceModal } from '@/components/editor/FindReplaceModal';
import { WordCountModal } from '@/components/editor/WordCountModal';
import { ExportModal } from '@/components/editor/ExportModal';

// Premium Feature Modals
import { AIWritingModal } from '@/components/editor/AIWritingModal';
import { AIPresentationModal } from '@/components/editor/AIPresentationModal';
import { AIDocumentModal } from '@/components/editor/AIDocumentModal';
import { BrandKitModal } from '@/components/editor/BrandKitModal';
import { MagicDesignModal } from '@/components/editor/MagicDesignModal';
import { QualityCheckerModal } from '@/components/editor/QualityCheckerModal';
import { VersionHistoryModal } from '@/components/editor/VersionHistoryModal';
import { DocumentOutlineModal } from '@/components/editor/DocumentOutlineModal';
import { CommentsSidebar } from '@/components/editor/CommentsSidebar';
import { CommandPaletteModal, CommandItem } from '@/components/editor/CommandPaletteModal';
import { ResumeTemplateModal } from '@/components/editor/ResumeTemplateModal';
import { ImageUploadModal } from '@/components/editor/ImageUploadModal';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Loader2, Share2, Link, Check, Copy, Eye, Sparkles, Presentation,
  FileText, Palette, ShieldCheck, History, ListTree, Calculator,
  GitFork, BarChart3, QrCode, PenTool, GraduationCap, Search,
  Hash, Download, Printer, Layout
} from 'lucide-react';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocument, updateDocument, deleteDocument, duplicateDocument } = useDocumentsStore();
  const toast = useToastStore();
  const { autosaveDelay } = useSettingsStore();

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Modals state
  const [equationOpen, setEquationOpen] = useState(false);
  const [diagramOpen, setDiagramOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [academicCoverOpen, setAcademicCoverOpen] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [wordCountOpen, setWordCountOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Premium feature modal states
  const [aiWritingOpen, setAiWritingOpen] = useState(false);
  const [aiPresentationOpen, setAiPresentationOpen] = useState(false);
  const [aiDocumentOpen, setAiDocumentOpen] = useState(false);
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const [magicDesignOpen, setMagicDesignOpen] = useState(false);
  const [resumeTemplateOpen, setResumeTemplateOpen] = useState(false);
  const [qualityCheckerOpen, setQualityCheckerOpen] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const doc = useDocumentsStore(
    useCallback(state => state.documents.find(d => d.id === id) as unknown as StudioDocument | undefined, [id])
  );

  useEffect(() => {
    if (!id) return;
    if (!doc) navigate('/documents', { replace: true });
  }, [id, doc, navigate]);

  // Global Keyboard Shortcuts (Ctrl+K for Command Palette, Ctrl+H for Find)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Immediate patch handler for structural updates (slides, settings, elements, mode)
  const handleImmediatePatch = useCallback((patch: Partial<StudioDocument>) => {
    if (!id) return;
    updateDocument(id, patch as any);
    setSaveStatus('saved');
  }, [id, updateDocument]);

  // Debounced auto-save handler for continuous typing
  const debouncedSave = useCallback(
    debounce((docId: string, patch: Partial<StudioDocument>) => {
      updateDocument(docId, patch as any);
      setSaveStatus('saved');
    }, autosaveDelay || 800),
    [autosaveDelay, updateDocument]
  );

  const handlePatch = (patch: Partial<StudioDocument>) => {
    if (!id) return;
    setSaveStatus('saving');
    debouncedSave(id, patch);
  };

  const handleTitleChange = (newTitle: string) => {
    if (!id) return;
    updateDocument(id, { title: newTitle });
    toast.success('Document title updated');
  };

  const handleSwitchMode = (mode: EditorMode) => {
    if (!id) return;
    updateDocument(id, { mode });
    toast.success(`Switched to ${mode.toUpperCase()} Mode`);
  };

  const handleDelete = () => {
    if (!id) return;
    deleteDocument(id);
    toast.success('Document moved to trash');
    navigate('/documents');
  };

  const handleDuplicate = () => {
    if (!id) return;
    const copy = duplicateDocument(id);
    if (copy) {
      toast.success('Document duplicated');
      navigate(`/editor/${copy.id}`);
    }
  };

  // AI Document handler
  const handleApplyAIDocument = (gen: GeneratedDocument) => {
    if (!id) return;
    handleImmediatePatch({
      title: gen.title,
      content: gen.content,
      mode: 'document',
    });
    toast.success('AI Document Generated Successfully!');
  };

  // AI Presentation handler
  const handleApplyAIPresentation = (slides: Slide[]) => {
    if (!id) return;
    handleImmediatePatch({
      slides,
      activeSlideIndex: 0,
      mode: 'presentation',
    });
    toast.success(`AI Presentation Generated (${slides.length} Slides)!`);
  };

  // Brand Kit application
  const handleApplyBrandKit = (kit: BrandKit) => {
    if (!id || !doc) return;
    if (doc.mode === 'presentation' && doc.slides) {
      const updatedSlides = doc.slides.map(s => ({
        ...s,
        gradient: `linear-gradient(135deg, ${kit.primaryColor} 0%, ${kit.secondaryColor} 100%)`,
      }));
      handleImmediatePatch({ slides: updatedSlides });
    } else {
      handleImmediatePatch({
        pageSettings: {
          ...(doc.pageSettings as any),
          border: {
            enabled: true,
            style: 'solid',
            width: 2,
            color: kit.primaryColor,
            inset: 16,
            applyTo: 'all',
          },
        },
      });
    }
    toast.success(`Applied Brand Kit: ${kit.name}`);
  };

  // Magic Design application
  const handleApplyMagicDesign = (preset: DesignPreset) => {
    if (!id || !doc) return;
    if (doc.mode === 'presentation' && doc.slides) {
      const updated = MagicDesignEngine.applyToPresentation(doc.slides, preset);
      handleImmediatePatch({ slides: updated });
    } else {
      const updatedSettings = MagicDesignEngine.applyToDocumentSettings(doc.pageSettings as any, preset);
      handleImmediatePatch({ pageSettings: updatedSettings });
    }
    toast.success(`Applied Magic Design: ${preset.name}`);
  };

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const shareUrl = generateShareUrl(doc.title, doc.content);

  const handleCopyShareUrl = async () => {
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopiedShare(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const handleInsertImageFromModal = (data: { src: string; imageId?: string; alt?: string; title?: string; width?: string; align?: string }) => {
    if (!doc) return;
    if (doc.mode === 'presentation') {
      const activeSlide = doc.slides?.[doc.activeSlideIndex || 0];
      if (activeSlide) {
        const nextElements = [
          ...activeSlide.elements,
          {
            id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            type: 'image' as const,
            content: data.src,
            transform: { x: 240, y: 120, width: 480, height: 320, rotation: 0 },
            style: { opacity: 1, cornerRadius: 8 },
            zIndex: activeSlide.elements.length + 1,
          },
        ];
        const nextSlides = [...(doc.slides || [])];
        nextSlides[doc.activeSlideIndex || 0] = { ...activeSlide, elements: nextElements };
        handleImmediatePatch({ slides: nextSlides });
      }
    } else {
      const imgTag = `<p><img src="${data.src}" alt="${data.alt || 'Image'}" data-image-id="${data.imageId || ''}" data-align="${data.align || 'center'}" style="width: ${data.width || '100%'}; max-width: 100%; border-radius: 8px; margin: 12px 0;" /></p>`;
      handlePatch({ content: (doc.content || '') + `\n${imgTag}` });
    }
    toast.success('Image Inserted');
  };

  // List of all Command Palette Actions
  const commandList: CommandItem[] = [
    {
      id: 'cmd_ai_writing',
      title: 'AI Writing Assistant',
      category: 'AI Studio',
      shortcut: 'AI',
      icon: Sparkles,
      action: () => setAiWritingOpen(true),
    },
    {
      id: 'cmd_ai_pres',
      title: 'Create Presentation with AI',
      category: 'AI Studio',
      icon: Presentation,
      action: () => setAiPresentationOpen(true),
    },
    {
      id: 'cmd_ai_doc',
      title: 'Create Document with AI',
      category: 'AI Studio',
      icon: FileText,
      action: () => setAiDocumentOpen(true),
    },
    {
      id: 'cmd_brand_kit',
      title: 'Brand Kit & Design System',
      category: 'Design',
      icon: Palette,
      action: () => setBrandKitOpen(true),
    },
    {
      id: 'cmd_magic_design',
      title: 'Magic Design Themes',
      category: 'Design',
      icon: Sparkles,
      action: () => setMagicDesignOpen(true),
    },
    {
      id: 'cmd_resume_templates',
      title: 'Resume Template Switcher',
      category: 'Design',
      icon: FileText,
      action: () => setResumeTemplateOpen(true),
    },
    {
      id: 'cmd_flowchart',
      title: 'Flowchart & Diagram Studio',
      category: 'Insert',
      icon: GitFork,
      action: () => setDiagramOpen(true),
    },
    {
      id: 'cmd_audit',
      title: 'Quality & Accessibility Audit',
      category: 'Review',
      icon: ShieldCheck,
      action: () => setQualityCheckerOpen(true),
    },
    {
      id: 'cmd_outline',
      title: 'Document Outline Navigation',
      category: 'Review',
      icon: ListTree,
      action: () => setOutlineOpen(true),
    },
    {
      id: 'cmd_version',
      title: 'Version History & Revisions',
      category: 'File',
      icon: History,
      action: () => setVersionHistoryOpen(true),
    },
    {
      id: 'cmd_export',
      title: 'Export Document (PDF, DOCX, PPTX, HTML)',
      category: 'Export',
      shortcut: 'Ctrl+E',
      icon: Download,
      action: () => setExportOpen(true),
    },
    {
      id: 'cmd_print',
      title: 'Print / Print Preview',
      category: 'File',
      shortcut: 'Ctrl+P',
      icon: Printer,
      action: () => ExportEngine.printDocument(doc),
    },
    {
      id: 'cmd_academic_cover',
      title: 'Insert Academic Cover Page',
      category: 'Insert',
      icon: GraduationCap,
      action: () => setAcademicCoverOpen(true),
    },
    {
      id: 'cmd_equation',
      title: 'Insert Math Equation (KaTeX)',
      category: 'Insert',
      icon: Calculator,
      action: () => setEquationOpen(true),
    },
    {
      id: 'cmd_diagram',
      title: 'Insert Flowchart / Diagram',
      category: 'Insert',
      icon: GitFork,
      action: () => setDiagramOpen(true),
    },
    {
      id: 'cmd_chart',
      title: 'Insert Chart & Data Visualizer',
      category: 'Insert',
      icon: BarChart3,
      action: () => setChartOpen(true),
    },
    {
      id: 'cmd_qr',
      title: 'Insert Custom QR Code',
      category: 'Insert',
      icon: QrCode,
      action: () => setQrOpen(true),
    },
    {
      id: 'cmd_sig',
      title: 'Insert Digital Signature',
      category: 'Insert',
      icon: PenTool,
      action: () => setSignatureOpen(true),
    },
    {
      id: 'cmd_find',
      title: 'Find & Replace',
      category: 'Tools',
      shortcut: 'Ctrl+H',
      icon: Search,
      action: () => setFindReplaceOpen(true),
    },
    {
      id: 'cmd_stats',
      title: 'Word Count & Document Statistics',
      category: 'Tools',
      icon: Hash,
      action: () => setWordCountOpen(true),
    },
    {
      id: 'cmd_mode_doc',
      title: 'Switch to Document Mode',
      category: 'Mode',
      icon: FileText,
      action: () => handleSwitchMode('document'),
    },
    {
      id: 'cmd_mode_pres',
      title: 'Switch to Presentation Mode',
      category: 'Mode',
      icon: Presentation,
      action: () => handleSwitchMode('presentation'),
    },
    {
      id: 'cmd_mode_design',
      title: 'Switch to Design Canvas Mode',
      category: 'Mode',
      icon: Palette,
      action: () => handleSwitchMode('design'),
    },
  ];

  return (
    <div className="flex flex-col h-[100dvh] min-h-[100dvh] bg-background overflow-hidden">
      <SEOHead
        title={`${doc.title || 'Untitled Document'} | DocProEditor`}
        description="DocProEditor Document Editor"
        canonicalPath={`/editor/${doc.id}`}
        noindex={true}
      />
      {/* Top Suite Navigation Header */}
      <StudioHeader
        document={doc}
        saveStatus={saveStatus}
        onUpdateTitle={handleTitleChange}
        onSwitchMode={handleSwitchMode}
        onOpenEquationModal={() => setEquationOpen(true)}
        onOpenDiagramModal={() => setDiagramOpen(true)}
        onOpenChartModal={() => setChartOpen(true)}
        onOpenQRCodeModal={() => setQrOpen(true)}
        onOpenSignatureModal={() => setSignatureOpen(true)}
        onOpenAcademicCoverModal={() => setAcademicCoverOpen(true)}
        onOpenFindReplaceModal={() => setFindReplaceOpen(true)}
        onOpenWordCountModal={() => setWordCountOpen(true)}
        onOpenAIWritingModal={() => setAiWritingOpen(true)}
        onOpenAIPresentationModal={() => setAiPresentationOpen(true)}
        onOpenAIDocumentModal={() => setAiDocumentOpen(true)}
        onOpenBrandKitModal={() => setBrandKitOpen(true)}
        onOpenMagicDesignModal={() => setMagicDesignOpen(true)}
        onOpenResumeTemplateModal={() => setResumeTemplateOpen(true)}
        onOpenQualityCheckerModal={() => setQualityCheckerOpen(true)}
        onOpenVersionHistoryModal={() => setVersionHistoryOpen(true)}
        onOpenDocumentOutlineModal={() => setOutlineOpen(true)}
        onOpenImageUploadModal={() => setImageUploadOpen(true)}
        onToggleComments={() => setCommentsOpen(!commentsOpen)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onDownload={() => setExportOpen(true)}
        onShare={() => setShareOpen(true)}
        onPrint={() => ExportEngine.printDocument(doc)}
        onDuplicate={handleDuplicate}
        onDelete={() => setDeleteDialogOpen(true)}
      />

      {/* Main Canvas Area by Mode + Optional Comments Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-hidden relative">
          {doc.mode === 'document' && (
            <DocumentCanvas
              content={doc.content || ''}
              onChangeContent={html => handlePatch({ content: html })}
              pageSettings={doc.pageSettings || {}}
              onChangePageSettings={ps => handlePatch({ pageSettings: ps })}
              onOpenImageUploadModal={() => setImageUploadOpen(true)}
              onOpenEquationModal={() => setEquationOpen(true)}
              onOpenDiagramModal={() => setDiagramOpen(true)}
              onOpenChartModal={() => setChartOpen(true)}
              onOpenQRCodeModal={() => setQrOpen(true)}
              onOpenSignatureModal={() => setSignatureOpen(true)}
              onOpenAcademicCoverModal={() => setAcademicCoverOpen(true)}
              onOpenFindReplaceModal={() => setFindReplaceOpen(true)}
              onOpenWordCountModal={() => setWordCountOpen(true)}
              onOpenAIWritingModal={() => setAiWritingOpen(true)}
              onOpenQualityCheckerModal={() => setQualityCheckerOpen(true)}
              onOpenDocumentOutlineModal={() => setOutlineOpen(true)}
              onOpenVersionHistoryModal={() => setVersionHistoryOpen(true)}
              onDownload={() => setExportOpen(true)}
              onPrint={() => ExportEngine.printDocument(doc)}
            />
          )}

          {doc.mode === 'presentation' && (
            <PresentationCanvas
              slides={doc.slides || []}
              activeSlideIndex={doc.activeSlideIndex || 0}
              settings={doc.presentationSettings || {}}
              onChangeSlides={slides => handleImmediatePatch({ slides })}
              onChangeActiveSlideIndex={idx => handleImmediatePatch({ activeSlideIndex: idx })}
              onChangeSettings={ps => handleImmediatePatch({ presentationSettings: ps })}
              onOpenChartModal={() => setChartOpen(true)}
              onOpenDiagramModal={() => setDiagramOpen(true)}
              onOpenQRCodeModal={() => setQrOpen(true)}
            />
          )}

          {doc.mode === 'design' && (
            <DesignCanvas
              elements={doc.designElements || []}
              width={doc.canvasWidth || 800}
              height={doc.canvasHeight || 600}
              background={doc.canvasBackground || '#ffffff'}
              onChangeElements={elements => handleImmediatePatch({ designElements: elements })}
              onChangeWidth={w => handleImmediatePatch({ canvasWidth: w })}
              onChangeHeight={h => handleImmediatePatch({ canvasHeight: h })}
              onChangeBackground={bg => handleImmediatePatch({ canvasBackground: bg })}
              onOpenQRCodeModal={() => setQrOpen(true)}
              onOpenSignatureModal={() => setSignatureOpen(true)}
              onOpenChartModal={() => setChartOpen(true)}
              onOpenDiagramModal={() => setDiagramOpen(true)}
            />
          )}
        </div>

        {/* Collapsible Comments & Review Sidebar */}
        <CommentsSidebar
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
          documentId={doc.id}
        />
      </div>

      {/* ── Dialog Modals ────────────────────────────────────────────── */}
      <EquationModal
        open={equationOpen}
        onClose={() => setEquationOpen(false)}
        onInsert={(_latex, html) => {
          if (doc.mode === 'document') {
            handlePatch({ content: (doc.content || '') + html });
          }
          toast.success('Math Equation Inserted');
        }}
      />

      <DiagramModal
        open={diagramOpen}
        onClose={() => setDiagramOpen(false)}
        onInsert={(svgHtml: string) => {
          if (doc.mode === 'document') {
            handlePatch({ content: (doc.content || '') + svgHtml });
          }
          toast.success('Diagram Inserted');
        }}
      />

      <ChartModal
        open={chartOpen}
        onClose={() => setChartOpen(false)}
        onInsert={(_config, html) => {
          if (doc.mode === 'document') {
            handlePatch({ content: (doc.content || '') + html });
          }
          toast.success('Chart Inserted');
        }}
      />

      <QRCodeModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onInsert={(_text, html) => {
          if (doc.mode === 'document') {
            handlePatch({ content: (doc.content || '') + html });
          }
          toast.success('QR Code Inserted');
        }}
      />

      <SignatureModal
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        onInsert={(_sigData, html) => {
          if (doc.mode === 'document') {
            handlePatch({ content: (doc.content || '') + html });
          }
          toast.success('Digital Signature Inserted');
        }}
      />

      <AcademicCoverModal
        open={academicCoverOpen}
        onClose={() => setAcademicCoverOpen(false)}
        onInsert={(_data, coverHtml) => {
          const current = doc.content || '';
          handlePatch({ content: coverHtml + '\n<div data-type="page-break"></div>\n' + current });
          toast.success('Academic Cover Page Created');
        }}
      />

      <FindReplaceModal
        open={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
        content={doc.content || ''}
        onReplaceAll={(newHtml: string) => {
          handlePatch({ content: newHtml });
          toast.success('Text replaced successfully');
        }}
      />

      <WordCountModal
        open={wordCountOpen}
        onClose={() => setWordCountOpen(false)}
        content={doc.content || ''}
      />

      {/* ── Premium Feature Modals ───────────────────────────────────── */}
      <AIWritingModal
        open={aiWritingOpen}
        onOpenChange={setAiWritingOpen}
        onApply={generatedHtml => {
          handlePatch({ content: (doc.content || '') + generatedHtml });
          toast.success('AI Content Inserted');
        }}
      />

      <AIPresentationModal
        open={aiPresentationOpen}
        onOpenChange={setAiPresentationOpen}
        onGenerate={handleApplyAIPresentation}
      />

      <AIDocumentModal
        open={aiDocumentOpen}
        onOpenChange={setAiDocumentOpen}
        onGenerate={handleApplyAIDocument}
      />

      <BrandKitModal
        open={brandKitOpen}
        onOpenChange={setBrandKitOpen}
        onApplyKit={handleApplyBrandKit}
      />

      <MagicDesignModal
        open={magicDesignOpen}
        onOpenChange={setMagicDesignOpen}
        onApplyPreset={handleApplyMagicDesign}
      />

      <ResumeTemplateModal
        open={resumeTemplateOpen}
        onOpenChange={setResumeTemplateOpen}
        onApplyTemplate={newHtml => {
          handleImmediatePatch({ content: newHtml });
          toast.success('Applied Resume Template Layout');
        }}
      />

      <QualityCheckerModal
        open={qualityCheckerOpen}
        onOpenChange={setQualityCheckerOpen}
        documentHtml={doc.content || ''}
        slides={doc.slides || []}
        isPresentation={doc.mode === 'presentation'}
      />

      <VersionHistoryModal
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        document={doc}
        onRestore={restoredContent => {
          handleImmediatePatch({ content: restoredContent });
          toast.success('Document Restored to Previous Version');
        }}
      />

      <DocumentOutlineModal
        open={outlineOpen}
        onOpenChange={setOutlineOpen}
        documentHtml={doc.content || ''}
      />

      <CommandPaletteModal
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        commands={commandList}
      />

      <ImageUploadModal
        open={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        onInsertImage={handleInsertImageFromModal}
      />

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        document={doc}
      />

      {/* Share Modal */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Share Document
            </DialogTitle>
            <DialogDescription>
              Anyone with this link can view or make a copy of this document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 h-9 rounded-md border border-input bg-muted px-3 text-xs text-muted-foreground font-mono focus:outline-none"
              />
              <Button size="sm" onClick={handleCopyShareUrl} className="shrink-0 gap-1.5">
                {copiedShare ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move document to trash?</AlertDialogTitle>
            <AlertDialogDescription>
              "{doc.title}" will be moved to trash. You can restore it later from the Trash folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
