import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Presentation, Palette, ArrowLeft, Download, Share2,
  Printer, CheckCircle2, Loader2, Edit3, MoreHorizontal,
  Copy, Trash2, Calculator, GitFork, BarChart3, QrCode, PenTool,
  Search, Hash, GraduationCap, ChevronDown, List, AlignLeft,
  AlignCenter, AlignRight, AlignJustify, ListOrdered, ListChecks,
  Quote, Code2, Sun, Moon, Monitor, Maximize2, Minimize2,
  Indent, Outdent, Heading1, Heading2, Heading3, Sparkles,
  Wand2, MessageSquare, History, ShieldCheck, ListTree, Command,
  Home, Menu, X, Image as ImageIcon
} from 'lucide-react';
import { EditorMode, StudioDocument } from '@/engines/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { useSettingsStore } from '@/store/settingsStore';

interface StudioHeaderProps {
  document: StudioDocument;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  onUpdateTitle: (title: string) => void;
  onSwitchMode: (mode: EditorMode) => void;
  onOpenEquationModal: () => void;
  onOpenDiagramModal: () => void;
  onOpenChartModal: () => void;
  onOpenQRCodeModal: () => void;
  onOpenSignatureModal: () => void;
  onOpenAcademicCoverModal: () => void;
  onOpenFindReplaceModal: () => void;
  onOpenWordCountModal: () => void;
  onOpenAIWritingModal: () => void;
  onOpenAIPresentationModal: () => void;
  onOpenAIDocumentModal: () => void;
  onOpenBrandKitModal: () => void;
  onOpenMagicDesignModal: () => void;
  onOpenResumeTemplateModal: () => void;
  onOpenQualityCheckerModal: () => void;
  onOpenVersionHistoryModal: () => void;
  onOpenDocumentOutlineModal: () => void;
  onOpenImageUploadModal?: () => void;
  onToggleComments: () => void;
  onOpenCommandPalette: () => void;
  onDownload: () => void;
  onShare: () => void;
  onPrint: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function StudioHeader({
  document,
  saveStatus,
  onUpdateTitle,
  onSwitchMode,
  onOpenEquationModal,
  onOpenDiagramModal,
  onOpenChartModal,
  onOpenQRCodeModal,
  onOpenSignatureModal,
  onOpenAcademicCoverModal,
  onOpenFindReplaceModal,
  onOpenWordCountModal,
  onOpenAIWritingModal,
  onOpenAIPresentationModal,
  onOpenAIDocumentModal,
  onOpenBrandKitModal,
  onOpenMagicDesignModal,
  onOpenResumeTemplateModal,
  onOpenQualityCheckerModal,
  onOpenVersionHistoryModal,
  onOpenDocumentOutlineModal,
  onOpenImageUploadModal,
  onToggleComments,
  onOpenCommandPalette,
  onDownload,
  onShare,
  onPrint,
  onDuplicate,
  onDelete,
}: StudioHeaderProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useSettingsStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(document.title);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  useEffect(() => {
    setTitleValue(document.title);
  }, [document.title]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!window.document.fullscreenElement);
    };
    window.document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTitleSubmit = () => {
    if (titleValue.trim()) {
      onUpdateTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleFullscreen = () => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().catch(err => {
        console.error('Failed to enter fullscreen:', err);
      });
    } else {
      if (window.document.exitFullscreen) {
        window.document.exitFullscreen();
      }
    }
  };

  // If in Fullscreen Mode
  if (isFullscreen) {
    return (
      <header className="h-10 bg-background/95 backdrop-blur border-b border-border px-3 flex items-center justify-between shrink-0 z-30 select-none transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate('/dashboard')}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Home / Dashboard"
          >
            <Home className="h-3.5 w-3.5" />
          </Button>

          <span className="text-xs font-bold text-foreground truncate max-w-[160px] sm:max-w-[200px]">
            {document.title}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {saveStatus === 'saving' ? (
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            )}
            <span className="hidden sm:inline text-[10px]">
              {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
            </span>
          </div>
        </div>

        {/* Center tools */}
        <div className="flex items-center gap-1 hidden sm:flex">
          <Button variant="ghost" size="sm" onClick={onOpenAIWritingModal} className="h-7 px-2 text-[11px] gap-1 text-primary">
            <Sparkles className="h-3.5 w-3.5" /> AI
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenEquationModal} className="h-7 px-2 text-[11px] gap-1">
            <Calculator className="h-3.5 w-3.5 text-primary" /> <span className="hidden md:inline">Equation</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenDiagramModal} className="h-7 px-2 text-[11px] gap-1">
            <GitFork className="h-3.5 w-3.5 text-primary" /> <span className="hidden md:inline">Diagram</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenChartModal} className="h-7 px-2 text-[11px] gap-1">
            <BarChart3 className="h-3.5 w-3.5 text-primary" /> <span className="hidden md:inline">Chart</span>
          </Button>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-amber-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 bg-primary/10 text-primary"
            onClick={toggleFullscreen}
            title="Exit Fullscreen (Esc)"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>

          <Button size="sm" onClick={onDownload} className="h-7 px-2.5 text-xs gap-1 bg-primary text-white font-semibold">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </header>
    );
  }

  // Standard Header Mode
  return (
    <>
      <header className="h-12 bg-background/95 backdrop-blur border-b border-border px-2.5 sm:px-3.5 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Left: Brand Home Link + Breadcrumb / Document Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors cursor-pointer group shrink-0 px-1 py-1 rounded-lg hover:bg-muted/60"
            title="Go to DocProEditor Home / Workspace"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold tracking-tight">DocProEditor</span>
          </button>

          <span className="text-muted-foreground/40 text-xs font-mono select-none">/</span>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-6 w-6 rounded-md bg-muted/60 flex items-center justify-center shrink-0 hidden sm:flex">
              {document.mode === 'presentation' ? (
                <Presentation className="h-3 w-3 text-primary" />
              ) : document.mode === 'design' ? (
                <Palette className="h-3 w-3 text-primary" />
              ) : (
                <FileText className="h-3 w-3 text-primary" />
              )}
            </div>

            <div className="min-w-0">
              {isEditingTitle ? (
                <Input
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="h-7 text-xs font-semibold max-w-[130px] sm:max-w-xs"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xs font-semibold truncate hover:text-primary transition-colors text-left flex items-center gap-1 max-w-[110px] sm:max-w-[180px] md:max-w-xs group"
                  title="Click to rename"
                >
                  <span className="truncate">{document.title}</span>
                  <Edit3 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                </button>
              )}

              {/* Desktop Clean Menu Dropdowns */}
              <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                {/* File */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                    File
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 text-xs">
                    <DropdownMenuItem onClick={onDuplicate}><Copy className="h-3.5 w-3.5 mr-2" /> Duplicate Document</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenVersionHistoryModal}><History className="h-3.5 w-3.5 mr-2" /> Version History</DropdownMenuItem>
                    <DropdownMenuItem onClick={onPrint}><Printer className="h-3.5 w-3.5 mr-2" /> Print / Save PDF</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDownload}><Download className="h-3.5 w-3.5 mr-2 text-primary" /> Export All Formats...</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" /> Move to Trash</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Edit */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                    Edit
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 text-xs">
                    <DropdownMenuItem onClick={onOpenFindReplaceModal}><Search className="h-3.5 w-3.5 mr-2" /> Find &amp; Replace (Ctrl+H)</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenCommandPalette}><Command className="h-3.5 w-3.5 mr-2" /> Command Palette (Ctrl+K)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                    View
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 text-xs">
                    <DropdownMenuItem onClick={onOpenDocumentOutlineModal}><ListTree className="h-3.5 w-3.5 mr-2 text-primary" /> Document Outline</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenWordCountModal}><Hash className="h-3.5 w-3.5 mr-2 text-primary" /> Word Count &amp; Stats</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenQualityCheckerModal}><ShieldCheck className="h-3.5 w-3.5 mr-2 text-primary" /> Accessibility Audit</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Insert */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50">
                    Insert
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 text-xs">
                    <DropdownMenuItem onClick={onOpenImageUploadModal}><ImageIcon className="h-3.5 w-3.5 mr-2 text-primary" /> Image (Upload / Camera)</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenDiagramModal}><GitFork className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Flowchart &amp; Diagram</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenChartModal}><BarChart3 className="h-3.5 w-3.5 mr-2 text-blue-500" /> Chart &amp; Visualizer</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onOpenAcademicCoverModal}><GraduationCap className="h-3.5 w-3.5 mr-2" /> Academic Cover Page</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenEquationModal}><Calculator className="h-3.5 w-3.5 mr-2" /> Math Equation (KaTeX)</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenQRCodeModal}><QrCode className="h-3.5 w-3.5 mr-2" /> Custom QR Code</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenSignatureModal}><PenTool className="h-3.5 w-3.5 mr-2" /> Digital Signature</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* More / Studio Tools */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="hover:text-foreground transition-colors cursor-pointer px-1 py-0.5 rounded hover:bg-muted/50 flex items-center gap-0.5">
                    More <ChevronDown className="h-2.5 w-2.5 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 text-xs">
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">AI &amp; Templates</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onOpenAIWritingModal}><Wand2 className="h-3.5 w-3.5 mr-2 text-primary" /> AI Writing Assistant</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenAIPresentationModal}><Presentation className="h-3.5 w-3.5 mr-2 text-primary" /> AI Slide Generator</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenResumeTemplateModal}><FileText className="h-3.5 w-3.5 mr-2 text-primary" /> Resume Template Switcher</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Design &amp; Brand</DropdownMenuLabel>
                    <DropdownMenuItem onClick={onOpenBrandKitModal}><Palette className="h-3.5 w-3.5 mr-2 text-primary" /> Brand Kit &amp; Palettes</DropdownMenuItem>
                    <DropdownMenuItem onClick={onOpenMagicDesignModal}><Sparkles className="h-3.5 w-3.5 mr-2 text-primary" /> Magic Design Themes</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Clean Segmented Mode Switcher (Desktop) */}
        <div className="hidden lg:flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => onSwitchMode('document')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${document.mode === 'document' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Doc</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('presentation')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${document.mode === 'presentation' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Presentation className="h-3.5 w-3.5" />
            <span>Slides</span>
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('design')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${document.mode === 'design' ? 'bg-background text-primary shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Design</span>
          </button>
        </div>

        {/* Right: Clean Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile Tools Sheet Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileToolsOpen(true)}
            className="md:hidden h-7 px-2 text-xs gap-1 text-primary border-primary/30"
          >
            <Menu className="h-3.5 w-3.5" />
            <span>Tools</span>
          </Button>

          {/* Comments Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleComments}
            className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground hidden sm:flex"
            title="Comments"
            aria-label="Toggle Document Comments"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch Theme (${theme})`}
            aria-label={`Switch Theme to ${theme === 'dark' ? 'Light' : 'Dark'}`}
          >
            {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-amber-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
          </Button>

          {/* Primary Export Button */}
          <Button
            size="sm"
            onClick={onDownload}
            className="h-7 sm:h-8 px-3 text-xs gap-1.5 bg-primary text-white shadow-xs font-semibold hover:bg-primary/90"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export</span>
          </Button>
        </div>
      </header>

      {/* ── Mobile Tools Bottom Sheet / Dialog ─────────────────────────── */}
      <Dialog open={mobileToolsOpen} onOpenChange={setMobileToolsOpen}>
        <DialogContent className="sm:max-w-md p-4 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Studio Quick Actions &amp; Tools</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select any creative tool, AI generator, or layout option.
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switcher inside mobile sheet */}
          <div className="my-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Editor Mode
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant={document.mode === 'document' ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => { onSwitchMode('document'); setMobileToolsOpen(false); }}
              >
                <FileText className="h-3.5 w-3.5" /> Doc
              </Button>
              <Button
                variant={document.mode === 'presentation' ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => { onSwitchMode('presentation'); setMobileToolsOpen(false); }}
              >
                <Presentation className="h-3.5 w-3.5" /> Slides
              </Button>
              <Button
                variant={document.mode === 'design' ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => { onSwitchMode('design'); setMobileToolsOpen(false); }}
              >
                <Palette className="h-3.5 w-3.5" /> Canvas
              </Button>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="space-y-3 my-2">
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                AI &amp; Smart Design
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenAIWritingModal(); setMobileToolsOpen(false); }}>
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Writer
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenResumeTemplateModal(); setMobileToolsOpen(false); }}>
                  <FileText className="h-3.5 w-3.5 text-primary" /> Resume Layouts
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenMagicDesignModal(); setMobileToolsOpen(false); }}>
                  <Palette className="h-3.5 w-3.5 text-primary" /> Magic Themes
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenBrandKitModal(); setMobileToolsOpen(false); }}>
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Brand Kit
                </Button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Insert Visuals &amp; Math
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { if (onOpenImageUploadModal) onOpenImageUploadModal(); setMobileToolsOpen(false); }}>
                  <ImageIcon className="h-3.5 w-3.5 text-primary" /> Add Image
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenDiagramModal(); setMobileToolsOpen(false); }}>
                  <GitFork className="h-3.5 w-3.5 text-primary" /> Flowcharts
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenEquationModal(); setMobileToolsOpen(false); }}>
                  <Calculator className="h-3.5 w-3.5 text-primary" /> Math Equations
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenAcademicCoverModal(); setMobileToolsOpen(false); }}>
                  <GraduationCap className="h-3.5 w-3.5 text-primary" /> Cover Page
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenQRCodeModal(); setMobileToolsOpen(false); }}>
                  <QrCode className="h-3.5 w-3.5 text-primary" /> QR Code
                </Button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Audit &amp; Tools
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenQualityCheckerModal(); setMobileToolsOpen(false); }}>
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Quality Audit
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenDocumentOutlineModal(); setMobileToolsOpen(false); }}>
                  <ListTree className="h-3.5 w-3.5 text-primary" /> Outline
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenFindReplaceModal(); setMobileToolsOpen(false); }}>
                  <Search className="h-3.5 w-3.5 text-primary" /> Find &amp; Replace
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs justify-start gap-2" onClick={() => { onOpenWordCountModal(); setMobileToolsOpen(false); }}>
                  <Hash className="h-3.5 w-3.5 text-primary" /> Word Count
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
