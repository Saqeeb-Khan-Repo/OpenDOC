import React, { useState, useEffect, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import { PageEngine, MM_TO_PX } from '@/engines/PageEngine';
import { PageSettings, PageSize, PageOrientation, PageBorderSettings } from '@/engines/types';
import { HorizontalRuler } from './Ruler';
import { TiptapEditor, TiptapToolbar } from './TiptapEditor';
import { MobileEditorToolbar } from './MobileEditorToolbar';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopPropertiesPanel } from './DesktopPropertiesPanel';
import { ImageAssetEngine } from '@/engines/ImageAssetEngine';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import {
  ZoomIn, ZoomOut, Layout,
  ChevronDown, Ruler, Check, AlignCenter,
  AlignLeft, AlignRight, Grid, SplitSquareVertical, Plus, Trash2,
  Square, Frame, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/cn';

interface DocumentCanvasProps {
  content: string;
  onChangeContent: (html: string) => void;
  pageSettings: PageSettings;
  onChangePageSettings: (settings: PageSettings) => void;
  editable?: boolean;
  onOpenImageUploadModal?: () => void;
  onOpenEquationModal?: () => void;
  onOpenDiagramModal?: () => void;
  onOpenChartModal?: () => void;
  onOpenQRCodeModal?: () => void;
  onOpenSignatureModal?: () => void;
  onOpenAcademicCoverModal?: () => void;
  onOpenFindReplaceModal?: () => void;
  onOpenWordCountModal?: () => void;
  onOpenAIWritingModal?: () => void;
  onOpenQualityCheckerModal?: () => void;
  onOpenDocumentOutlineModal?: () => void;
  onOpenVersionHistoryModal?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
}

const BORDER_PRESET_COLORS = [
  '#1e3a8a', '#0f172a', '#b45309', '#047857', '#881337', '#334155', '#000000', '#2563eb'
];

const PAGE_BORDER_PRESETS = [
  { name: 'Academic Double', style: 'double' as const, width: 4, color: '#1e3a8a', inset: 16, applyTo: 'all' as const },
  { name: 'Modern Box', style: 'solid' as const, width: 2, color: '#334155', inset: 14, applyTo: 'all' as const },
  { name: 'Certificate Gold', style: 'double' as const, width: 5, color: '#b45309', inset: 16, applyTo: 'first-page-only' as const },
  { name: 'Executive Ridge', style: 'ridge' as const, width: 4, color: '#0f172a', inset: 16, applyTo: 'all' as const },
  { name: 'Minimal Dashed', style: 'dashed' as const, width: 1.5, color: '#64748b', inset: 14, applyTo: 'all' as const },
  { name: 'Dotted Frame', style: 'dotted' as const, width: 2, color: '#475569', inset: 14, applyTo: 'all' as const },
];

export function DocumentCanvas({
  content,
  onChangeContent,
  pageSettings,
  onChangePageSettings,
  editable = true,
  onOpenImageUploadModal,
  onOpenEquationModal,
  onOpenDiagramModal,
  onOpenChartModal,
  onOpenQRCodeModal,
  onOpenSignatureModal,
  onOpenAcademicCoverModal,
  onOpenFindReplaceModal,
  onOpenWordCountModal,
  onOpenAIWritingModal,
  onOpenQualityCheckerModal,
  onOpenDocumentOutlineModal,
  onOpenVersionHistoryModal,
  onDownload,
  onPrint,
}: DocumentCanvasProps) {
  const responsive = useResponsiveEditor();
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const touchStartDist = React.useRef<number | null>(null);
  const initialZoomRef = React.useRef<number>(100);

  // Zoom Mode: 'fit-width' | 'fit-page' | 'custom'
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'fit-page' | 'custom'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return 'fit-width';
    return 'custom';
  });
  const [customZoom, setCustomZoom] = useState<number>(pageSettings.zoom || 100);

  // Standard Base Dimensions at 100% scale (e.g. A4 = 794px x 1123px)
  const baseDims = PageEngine.getPagePixelDimensions(
    pageSettings.size,
    pageSettings.orientation,
    100
  );

  // Container dimensions via ResizeObserver
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 600,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerDimensions({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Dynamically load KaTeX math styling only when Document Editor is active
  useEffect(() => {
    const linkId = 'katex-css-loader';
    if (typeof document !== 'undefined' && !document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(link);
    }
  }, []);

  // Compute calculated scale
  const scale = useMemo(() => {
    if (!responsive.isMobile && zoomMode === 'custom') {
      return (pageSettings.zoom || customZoom || 100) / 100;
    }

    const containerWidth = containerDimensions.width || responsive.viewportWidth;
    const containerHeight = containerDimensions.height || responsive.viewportHeight;

    if (zoomMode === 'fit-width' || (responsive.isMobile && zoomMode !== 'custom' && zoomMode !== 'fit-page')) {
      const horizontalPadding = responsive.isMobile ? 24 : 48;
      const availableWidth = Math.max(260, containerWidth - horizontalPadding);
      return Math.min(1.25, Math.max(0.25, availableWidth / baseDims.width));
    }

    if (zoomMode === 'fit-page') {
      const horizontalPadding = responsive.isMobile ? 24 : 48;
      const verticalPadding = responsive.isMobile ? (responsive.isKeyboardOpen ? 60 : 130) : 70;
      const availableWidth = Math.max(260, containerWidth - horizontalPadding);
      const availableHeight = Math.max(260, containerHeight - verticalPadding);
      return Math.min(1.0, Math.max(0.25, Math.min(availableWidth / baseDims.width, availableHeight / baseDims.height)));
    }

    return (customZoom || 100) / 100;
  }, [
    zoomMode,
    customZoom,
    pageSettings.zoom,
    responsive.isMobile,
    responsive.viewportWidth,
    responsive.viewportHeight,
    responsive.isKeyboardOpen,
    containerDimensions,
    baseDims.width,
    baseDims.height,
  ]);

  const zoomPercent = Math.round(scale * 100);

  // Auto-scroll active cursor/selection into view when keyboard appears
  useEffect(() => {
    if (responsive.isKeyboardOpen && containerRef.current) {
      const activeEl = document.activeElement;
      if (activeEl && containerRef.current.contains(activeEl)) {
        setTimeout(() => {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [responsive.isKeyboardOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      initialZoomRef.current = zoomPercent;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartDist.current;
      const nextZoom = Math.min(250, Math.max(30, Math.round(initialZoomRef.current * factor)));
      setZoomMode('custom');
      setCustomZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStartDist.current = null;
  };

  const baseMarginsPx = {
    top: Math.round(pageSettings.margins.top * MM_TO_PX),
    right: Math.round(pageSettings.margins.right * MM_TO_PX),
    bottom: Math.round(pageSettings.margins.bottom * MM_TO_PX),
    left: Math.round(pageSettings.margins.left * MM_TO_PX),
  };

  // Header and Footer Heights
  const headerHeightPx = 36;
  const footerHeightPx = 36;

  // Usable content height strictly calculated:
  // Page Height - Top Margin - Bottom Margin - Header Height - Footer Height
  const usableHeightPx = Math.max(
    300,
    baseDims.height - baseMarginsPx.top - baseMarginsPx.bottom - headerHeightPx - footerHeightPx
  );

  const printableWidthPx = Math.max(
    300,
    baseDims.width - baseMarginsPx.left - baseMarginsPx.right
  );

  // Split unified document content into discrete, non-overlapping page HTML segments
  const [pages, setPages] = useState<string[]>(() => {
    return PageEngine.splitIntoPages(content, usableHeightPx, printableWidthPx);
  });

  // Keep pages in sync if external template or content changes completely
  useEffect(() => {
    const split = PageEngine.splitIntoPages(content, usableHeightPx, printableWidthPx);
    const currentCombined = pages.join('');
    const newCombined = split.join('');
    if (split.length !== pages.length || Math.abs(newCombined.length - currentCombined.length) > 20) {
      setPages(split);
    }
  }, [content, usableHeightPx, printableWidthPx]);

  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const handlePageContentChange = (pageIdx: number, newHtml: string) => {
    const updatedPages = [...pages];
    updatedPages[pageIdx] = newHtml;
    setPages(updatedPages);
    onChangeContent(updatedPages.join('\n<div data-type="page-break"></div>\n'));
  };

  const handleAddNewPage = () => {
    const updated = [...pages, '<p></p>'];
    const newIdx = updated.length - 1;
    setPages(updated);
    setActivePageIndex(newIdx);
    onChangeContent(updated.join('\n<div data-type="page-break"></div>\n'));
    // Smooth scroll to the newly created blank page
    setTimeout(() => {
      const pageEls = containerRef.current?.querySelectorAll('[data-page-index]');
      if (pageEls && pageEls[newIdx]) {
        pageEls[newIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  const handleSelectPage = (pageIdx: number) => {
    setActivePageIndex(pageIdx);
    const pageEls = containerRef.current?.querySelectorAll('[data-page-index]');
    if (pageEls && pageEls[pageIdx]) {
      pageEls[pageIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDeletePage = (pageIdx: number) => {
    if (pages.length <= 1) return;
    const updated = pages.filter((_, idx) => idx !== pageIdx);
    const nextActive = Math.min(updated.length - 1, activePageIndex);
    setPages(updated);
    setActivePageIndex(nextActive);
    onChangeContent(updated.join('\n<div data-type="page-break"></div>\n'));
  };

  const handleZoomChange = (delta: number) => {
    setZoomMode('custom');
    const next = Math.min(250, Math.max(35, zoomPercent + delta));
    setCustomZoom(next);
    onChangePageSettings({ ...pageSettings, zoom: next });
  };

  const handleFitWidth = () => {
    setZoomMode('fit-width');
  };

  const handleFitPage = () => {
    setZoomMode('fit-page');
  };

  const handleSetSize = (size: PageSize) => {
    onChangePageSettings({ ...pageSettings, size });
  };

  const handleSetOrientation = (orientation: PageOrientation) => {
    onChangePageSettings({ ...pageSettings, orientation });
  };

  const handleSetMargins = (type: 'normal' | 'narrow' | 'wide') => {
    if (type === 'normal') {
      onChangePageSettings({ ...pageSettings, margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 } });
    } else if (type === 'narrow') {
      onChangePageSettings({ ...pageSettings, margins: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 } });
    } else if (type === 'wide') {
      onChangePageSettings({ ...pageSettings, margins: { top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 } });
    }
  };

  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDragOverCanvas(true);
    }
  };

  const handleCanvasDragLeave = () => {
    setIsDragOverCanvas(false);
  };

  const handleCanvasDrop = (e: React.DragEvent, pageIdx = 0) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.name.endsWith('.svg'))) {
      const instant = ImageAssetEngine.createInstantAsset(file);
      const imgTag = `<p><img src="${instant.previewUrl}" alt="${file.name}" data-image-id="${instant.assetId}" data-align="center" style="width: 100%; max-width: 100%; border-radius: 8px; margin: 12px 0;" /></p>`;
      const updated = [...pages];
      updated[pageIdx] = (updated[pageIdx] || '<p></p>') + `\n${imgTag}`;
      setPages(updated);
      onChangeContent(updated.join('\n<div data-type="page-break"></div>\n'));
    }
  };

  // Clipboard Paste Support (Ctrl+V / Cmd+V for images - instant preview)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            const instant = ImageAssetEngine.createInstantAsset(file, 'Pasted Image');
            const imgTag = `<p><img src="${instant.previewUrl}" alt="Pasted Image" data-image-id="${instant.assetId}" data-align="center" style="width: 100%; max-width: 100%; border-radius: 8px; margin: 12px 0;" /></p>`;
            const updated = [...pages];
            updated[0] = (updated[0] || '<p></p>') + `\n${imgTag}`;
            setPages(updated);
            onChangeContent(updated.join('\n<div data-type="page-break"></div>\n'));
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [pages, onChangeContent]);

  const handleUpdateBorder = (patch: Partial<PageBorderSettings>) => {
    const current = pageSettings.border || {
      enabled: true,
      style: 'solid',
      width: 2,
      color: '#1e3a8a',
      inset: 16,
      applyTo: 'all',
    };
    onChangePageSettings({
      ...pageSettings,
      border: { ...current, ...patch },
    });
  };

  const handleApplyBorderPreset = (preset: typeof PAGE_BORDER_PRESETS[0]) => {
    onChangePageSettings({
      ...pageSettings,
      border: {
        enabled: true,
        ...preset,
      },
    });
  };

  const pageAlignment = pageSettings.pageAlignment || 'center';
  const pageBorder = pageSettings.border;

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] dark:bg-[#090d16] overflow-hidden relative select-none">
      {/* ── Fixed Top Editing Ribbon Toolbar (Row 1 - Desktop Only) ──────────── */}
      <div className="hidden md:block">
        {editable && (
          <TiptapToolbar editor={activeEditor} onAddPage={handleAddNewPage} />
        )}
      </div>

      {/* ── Fixed Page Control & Alignment Bar (Row 2 - Desktop Only) ────────── */}
      <div className="hidden md:flex h-9 bg-background/90 backdrop-blur border-b border-border px-3 sm:px-4 items-center justify-between shrink-0 text-xs select-none z-10 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Page Size & Layout Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex items-center gap-1 h-6 px-2 rounded hover:bg-accent transition-colors text-xs font-semibold text-foreground">
                <Layout className="h-3.5 w-3.5 text-primary" />
                <span>{pageSettings.size} ({pageSettings.orientation})</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 text-xs">
              <DropdownMenuLabel>Page Size</DropdownMenuLabel>
              {(['A4', 'Letter', 'A5', 'Legal', 'Executive'] as PageSize[]).map(s => (
                <DropdownMenuItem key={s} onClick={() => handleSetSize(s)} className="flex justify-between">
                  <span>{s}</span>
                  {pageSettings.size === s && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Orientation</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleSetOrientation('portrait')} className="flex justify-between">
                <span>Portrait</span>
                {pageSettings.orientation === 'portrait' && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetOrientation('landscape')} className="flex justify-between">
                <span>Landscape</span>
                {pageSettings.orientation === 'landscape' && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Margins Preset</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleSetMargins('normal')}>Normal (25.4 mm / 1 in)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetMargins('narrow')}>Narrow (12.7 mm / 0.5 in)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSetMargins('wide')}>Wide (38.1 mm / 1.5 in)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-3.5 w-px bg-border mx-1" />

          {/* Page Border Controls Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-[11px] gap-1 ${pageBorder?.enabled ? 'bg-primary/10 text-primary font-semibold' : ''}`}
                title="Customize Page Border"
              >
                <Frame className="h-3.5 w-3.5 text-primary" /> Border
                <ChevronDown className="h-2.5 w-2.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-3 text-xs" align="start">
              <DropdownMenuLabel className="text-xs flex items-center justify-between">
                <span>Page Border Settings</span>
                {pageBorder?.enabled && (
                  <button
                    type="button"
                    onClick={() => handleUpdateBorder({ enabled: false })}
                    className="text-[10px] text-destructive hover:underline font-normal"
                  >
                    Remove Border
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <p className="text-[11px] text-muted-foreground mb-1.5 font-medium">Border Presets</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {PAGE_BORDER_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyBorderPreset(preset)}
                    className={`px-2 py-1.5 rounded-md border text-left flex flex-col gap-0.5 transition-all ${
                      pageBorder?.enabled && pageBorder?.style === preset.style && pageBorder?.color === preset.color
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border/70 hover:border-primary/40 hover:bg-accent'
                    }`}
                  >
                    <span className="text-[11px] truncate">{preset.name}</span>
                    <div
                      className="w-full h-1 rounded"
                      style={{
                        borderTop: `${Math.min(preset.width, 3)}px ${preset.style} ${preset.color}`,
                      }}
                    />
                  </button>
                ))}
              </div>

              <DropdownMenuSeparator />

              {/* Custom Controls */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Width</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 6].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleUpdateBorder({ width: w, enabled: true })}
                        className={`h-5 w-6 rounded text-[10px] font-mono border ${
                          pageBorder?.width === w && pageBorder?.enabled ? 'bg-primary text-white border-primary' : 'border-border hover:bg-accent'
                        }`}
                      >
                        {w}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Style</span>
                  <select
                    value={pageBorder?.style || 'solid'}
                    onChange={e => handleUpdateBorder({ style: e.target.value as any, enabled: true })}
                    className="h-6 text-[11px] bg-background border border-border rounded px-1 text-foreground"
                  >
                    <option value="solid">Solid</option>
                    <option value="double">Double Line</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="groove">Groove</option>
                    <option value="ridge">Ridge</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Color</span>
                  <div className="flex items-center gap-1">
                    {BORDER_PRESET_COLORS.slice(0, 5).map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleUpdateBorder({ color: c, enabled: true })}
                        className={`h-4 w-4 rounded-full border ${pageBorder?.color === c && pageBorder?.enabled ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={pageBorder?.color || '#1e3a8a'}
                      onChange={e => handleUpdateBorder({ color: e.target.value, enabled: true })}
                      className="h-5 w-5 rounded border cursor-pointer p-0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Apply To</span>
                  <select
                    value={pageBorder?.applyTo || 'all'}
                    onChange={e => handleUpdateBorder({ applyTo: e.target.value as any, enabled: true })}
                    className="h-6 text-[11px] bg-background border border-border rounded px-1 text-foreground"
                  >
                    <option value="all">All Pages</option>
                    <option value="first-page-only">First Page Only (Cover)</option>
                    <option value="except-first-page">All Except First Page</option>
                  </select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-3.5 w-px bg-border mx-1" />

          {/* Page Alignment Controls (Center / Left / Right) */}
          <div className="flex items-center gap-0.5 bg-muted/60 p-0.5 rounded-md border border-border/60">
            <button
              type="button"
              onClick={() => onChangePageSettings({ ...pageSettings, pageAlignment: 'left' })}
              className={`h-6 px-1.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${pageAlignment === 'left' ? 'bg-background shadow-xs text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              title="Align Page to Left"
            >
              <AlignLeft className="h-3 w-3" />
              <span className="hidden sm:inline">Left</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePageSettings({ ...pageSettings, pageAlignment: 'center' })}
              className={`h-6 px-1.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${pageAlignment === 'center' ? 'bg-background shadow-xs text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              title="Center Page on Screen"
            >
              <AlignCenter className="h-3 w-3" />
              <span className="hidden sm:inline">Center</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePageSettings({ ...pageSettings, pageAlignment: 'right' })}
              className={`h-6 px-1.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${pageAlignment === 'right' ? 'bg-background shadow-xs text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'}`}
              title="Align Page to Right"
            >
              <AlignRight className="h-3 w-3" />
              <span className="hidden sm:inline">Right</span>
            </button>
          </div>

          <div className="h-3.5 w-px bg-border mx-1" />

          {/* Columns */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-[11px] gap-1 ${pageSettings.columns === 1 ? 'bg-accent font-semibold' : ''}`}
              onClick={() => onChangePageSettings({ ...pageSettings, columns: 1 })}
            >
              1 Col
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-[11px] gap-1 ${pageSettings.columns === 2 ? 'bg-accent font-semibold' : ''}`}
              onClick={() => onChangePageSettings({ ...pageSettings, columns: 2 })}
              title="2 Columns (Academic IEEE Paper Style)"
            >
              2 Col
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 px-2 text-[11px] gap-1 ${pageSettings.columns === 3 ? 'bg-accent font-semibold' : ''}`}
              onClick={() => onChangePageSettings({ ...pageSettings, columns: 3 })}
              title="3 Columns (Brochure / Newsletter Style)"
            >
              3 Col
            </Button>
          </div>

          <div className="h-3.5 w-px bg-border mx-1" />

          {/* Ruler Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-[11px] gap-1 ${pageSettings.showRulers ? 'bg-primary/10 text-primary font-semibold' : ''}`}
            onClick={() => onChangePageSettings({ ...pageSettings, showRulers: !pageSettings.showRulers })}
            title="Toggle Rulers"
          >
            <Ruler className="h-3.5 w-3.5" /> Rulers
          </Button>

          {/* Margin Guides Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-2 text-[11px] gap-1 ${pageSettings.showMarginGuides !== false ? 'bg-primary/10 text-primary font-semibold' : ''}`}
            onClick={() => onChangePageSettings({ ...pageSettings, showMarginGuides: pageSettings.showMarginGuides === false ? true : false })}
            title="Toggle Printable Margin Guidelines"
          >
            <Grid className="h-3.5 w-3.5" /> Guides
          </Button>

          {/* Add New Page Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10 font-semibold"
            onClick={handleAddNewPage}
            title="Add a New Page Sheet"
          >
            <Plus className="h-3.5 w-3.5" /> Add Page
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => handleZoomChange(-15)} title="Zoom Out">
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="font-mono text-xs w-10 text-center text-foreground font-semibold">{zoomPercent}%</span>
          <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => handleZoomChange(15)} title="Zoom In">
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 px-2 text-[11px]", zoomMode === 'fit-width' ? "text-primary font-bold bg-primary/10" : "")}
            onClick={handleFitWidth}
          >
            Fit Width
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 px-2 text-[11px]", zoomMode === 'fit-page' ? "text-primary font-bold bg-primary/10" : "")}
            onClick={handleFitPage}
          >
            Fit Page
          </Button>
        </div>
      </div>

      {/* ── Fixed Horizontal Ruler (Row 3 - Desktop Only) ──────────────────── */}
      {pageSettings.showRulers && (
        <div className="hidden md:flex shrink-0 bg-background/50 border-b border-border/60 z-10 justify-center overflow-hidden">
          <div style={{ width: `${baseDims.width * scale}px` }}>
            <HorizontalRuler widthPx={baseDims.width * scale} margins={pageSettings.margins} />
          </div>
        </div>
      )}

      {/* ── Mobile Floating Canva Zoom Pill (Dynamic Keyboard Offset) ───────── */}
      <div
        className="md:hidden fixed z-30 flex items-center gap-1 bg-background/95 backdrop-blur-md border border-border px-2 py-1 rounded-full shadow-lg text-xs font-semibold transition-all duration-150"
        style={{
          bottom: `${responsive.isKeyboardOpen ? responsive.keyboardHeight + 58 : 68}px`,
          right: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => handleZoomChange(-10)}
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
          title="Zoom Out"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="font-mono text-[11px] font-bold w-8 text-center text-foreground">{zoomPercent}%</span>
        <button
          type="button"
          onClick={() => handleZoomChange(10)}
          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
          title="Zoom In"
        >
          <Plus className="h-3 w-3" />
        </button>
        <div className="h-3.5 w-px bg-border mx-0.5" />
        <button
          type="button"
          onClick={() => {
            if (zoomMode === 'fit-width') setZoomMode('fit-page');
            else if (zoomMode === 'fit-page') setZoomMode('fit-width');
            else setZoomMode('fit-width');
          }}
          className={cn(
            "h-5 px-2 rounded-full text-[10px] font-bold transition-colors",
            zoomMode === 'fit-width' || zoomMode === 'fit-page' ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent text-foreground"
          )}
          title="Toggle Auto Fit"
        >
          {zoomMode === 'fit-page' ? 'Fit Page' : 'Fit Width'}
        </button>
      </div>

      {/* ── Main Workspace Body: Left Sidebar + Paginated Canvas + Right Properties Panel ── */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Desktop Left Collapsible Sidebar */}
        <DesktopSidebar
          editor={activeEditor}
          content={content}
          pages={pages}
          pageSettings={pageSettings}
          activePageIndex={activePageIndex}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddNewPage}
          onDeletePage={handleDeletePage}
          onOpenImageUploadModal={onOpenImageUploadModal}
          onOpenEquationModal={onOpenEquationModal}
          onOpenDiagramModal={onOpenDiagramModal}
          onOpenChartModal={onOpenChartModal}
          onOpenQRCodeModal={onOpenQRCodeModal}
          onOpenSignatureModal={onOpenSignatureModal}
          onOpenAcademicCoverModal={onOpenAcademicCoverModal}
        />

        {/* Center Paginated Scrollable Canvas Viewport */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDragOver={handleCanvasDragOver}
          onDragLeave={handleCanvasDragLeave}
          onDrop={e => handleCanvasDrop(e, 0)}
          className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-10 flex flex-col items-center touch-pan-y overscroll-y-contain transition-colors select-text ${
            isDragOverCanvas ? 'bg-primary/5 ring-4 ring-primary/20 ring-inset' : ''
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
            paddingBottom: responsive.isMobile
              ? (responsive.isKeyboardOpen
                  ? `${responsive.keyboardHeight + 80}px`
                  : 'calc(130px + env(safe-area-inset-bottom, 0px))')
              : '40px',
          }}
        >
          {/* Outer Scaled Wrapper for Centered Document and Precise Scroll Bounds */}
          <div
            style={{
              width: `${Math.round(baseDims.width * scale)}px`,
              minHeight: `${Math.round(baseDims.height * scale)}px`,
              margin: '0 auto',
              display: 'flex',
              justifyContent: pageAlignment === 'left' ? 'flex-start' : pageAlignment === 'right' ? 'flex-end' : 'center',
            }}
          >
            {/* Multi-Page Stack with Optical Scale (Never causes text reflow) */}
            <div
              className="flex flex-col items-center pb-12 transition-transform duration-100 ease-out origin-top"
              style={{
                width: `${baseDims.width}px`,
                transform: `scale(${scale})`,
                transformOrigin: pageAlignment === 'left' ? 'top left' : pageAlignment === 'right' ? 'top right' : 'top center',
              }}
            >
              {/* Render Each Independent Page Sheet with Strict Boundaries and 32px Page Gap */}
              {pages.map((pageHtml, pageIndex) => {
                const pageNumber = pageIndex + 1;
                const isCover = pageIndex === 0 && pageSettings.hideNumberOnCover;

                const shouldRenderBorder = pageBorder?.enabled && (
                  pageBorder.applyTo === 'all' ||
                  (pageBorder.applyTo === 'first-page-only' && pageIndex === 0) ||
                  (pageBorder.applyTo === 'except-first-page' && pageIndex !== 0)
                );

                const isSelected = activePageIndex === pageIndex;

                return (
                  <div
                    key={pageIndex}
                    data-page-index={pageIndex}
                    className={cn(
                      "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 rounded-[2px] border transition-all duration-150 flex flex-col relative w-full overflow-hidden select-text group",
                      isSelected ? "border-primary/50 ring-2 ring-primary/20 shadow-xl" : "border-black/10 dark:border-white/10"
                    )}
                    style={{
                      width: `${baseDims.width}px`,
                      height: `${baseDims.height}px`, // Strict Fixed Height (e.g. 1123px for A4)
                      minHeight: `${baseDims.height}px`,
                      maxHeight: `${baseDims.height}px`,
                      marginBottom: '32px', // 32px CLEAR VISUAL PAGE GAP
                      boxShadow: isSelected
                        ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.08)',
                      direction: pageSettings.textDirection || 'ltr',
                    }}
                    onClick={() => {
                      setActivePageIndex(pageIndex);
                    }}
                  >
                    {/* Decorative Page Border Frame Overlay */}
                    {shouldRenderBorder && (
                      <div
                        className="absolute pointer-events-none z-10"
                        style={{
                          top: `${pageBorder?.inset || 16}px`,
                          right: `${pageBorder?.inset || 16}px`,
                          bottom: `${pageBorder?.inset || 16}px`,
                          left: `${pageBorder?.inset || 16}px`,
                          borderStyle: pageBorder?.style || 'solid',
                          borderWidth: `${pageBorder?.width || 2}px`,
                          borderColor: pageBorder?.color || '#1e3a8a',
                        }}
                      />
                    )}

                    {/* Visual Margin Guidelines Overlay */}
                    {pageSettings.showMarginGuides !== false && (
                      <div
                        className="absolute pointer-events-none border border-dashed border-blue-400/30 dark:border-blue-400/20 z-0"
                        style={{
                          top: `${baseMarginsPx.top}px`,
                          right: `${baseMarginsPx.right}px`,
                          bottom: `${baseMarginsPx.bottom}px`,
                          left: `${baseMarginsPx.left}px`,
                        }}
                      />
                    )}

                    {/* ── HEADER REGION (Fixed Height: 36px) ──────────────────── */}
                    <div
                      className="h-9 pt-2 pb-1 border-b border-dashed border-border/40 text-[11px] text-muted-foreground flex items-center justify-between select-none relative z-10 shrink-0"
                      style={{
                        paddingLeft: `${baseMarginsPx.left}px`,
                        paddingRight: `${baseMarginsPx.right}px`,
                      }}
                    >
                      <input
                        type="text"
                        value={pageSettings.headerText || ''}
                        onChange={(e) => onChangePageSettings({ ...pageSettings, headerText: e.target.value })}
                        placeholder="Type document header..."
                        className="font-serif italic text-muted-foreground hover:text-foreground bg-transparent border-b border-transparent hover:border-border/60 focus:border-primary focus:bg-accent/40 rounded px-1.5 py-0.5 text-[11px] outline-none max-w-sm transition-all"
                        title="Click to edit document header"
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {!isCover && pageSettings.showPageNumbers && PageEngine.formatPageNumber(pageNumber, pageSettings.pageNumberFormat, pages.length)}
                        </span>
                        {pages.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePage(pageIndex);
                            }}
                            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded hover:bg-destructive/10"
                            title="Delete this page sheet"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── USABLE PAGE CONTENT REGION (Tiptap Instance) ────────── */}
                    <div
                      className="flex-1 relative overflow-hidden"
                      style={{
                        paddingTop: `${baseMarginsPx.top}px`,
                        paddingRight: `${baseMarginsPx.right}px`,
                        paddingBottom: `${baseMarginsPx.bottom}px`,
                        paddingLeft: `${baseMarginsPx.left}px`,
                      }}
                    >
                      <TiptapEditor
                        content={pageHtml}
                        editable={editable}
                        onChange={(html) => handlePageContentChange(pageIndex, html)}
                        onEditorReady={(ed) => {
                          if (pageIndex === 0 && !activeEditor) {
                            setActiveEditor(ed);
                          }
                          ed.on('focus', () => {
                            setActiveEditor(ed);
                          });
                        }}
                      />
                    </div>

                    {/* ── FOOTER REGION (Fixed Height: 36px) ──────────────────── */}
                    <div
                      className="h-9 pb-2 pt-1 border-t border-dashed border-border/40 text-[11px] text-muted-foreground flex items-center justify-between select-none mt-auto relative z-10 shrink-0"
                      style={{
                        paddingLeft: `${baseMarginsPx.left}px`,
                        paddingRight: `${baseMarginsPx.right}px`,
                      }}
                    >
                      <input
                        type="text"
                        value={pageSettings.footerText || ''}
                        onChange={(e) => onChangePageSettings({ ...pageSettings, footerText: e.target.value })}
                        placeholder="Type confidentiality or footer tag..."
                        className="font-serif text-muted-foreground hover:text-foreground bg-transparent border-b border-transparent hover:border-border/60 focus:border-primary focus:bg-accent/40 rounded px-1.5 py-0.5 text-[11px] outline-none max-w-sm transition-all"
                        title="Click to edit document footer"
                      />
                      <span className="font-mono font-semibold text-xs text-foreground">
                        {!isCover && pageSettings.showPageNumbers && PageEngine.formatPageNumber(pageNumber, pageSettings.pageNumberFormat, pages.length)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Bottom "+ Add Page" document action card */}
              <div className="w-full flex items-center justify-center pt-2 pb-8">
                <button
                  type="button"
                  onClick={handleAddNewPage}
                  className="gap-2 px-6 py-2.5 text-xs font-bold border-2 border-dashed border-primary/40 bg-card hover:bg-primary/10 hover:border-primary text-primary rounded-2xl shadow-xs transition-all active:scale-98 flex items-center cursor-pointer select-none"
                  title="Add a fresh blank page to this document"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Page (Page {pages.length + 1})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Right Contextual Properties Panel */}
        <DesktopPropertiesPanel
          editor={activeEditor}
          pageSettings={pageSettings}
          onChangePageSettings={onChangePageSettings}
          onOpenImageUploadModal={onOpenImageUploadModal}
        />
      </div>

      {/* ── Bottom Page Stats & Status Bar (Desktop Only) ─────────────────── */}
      <div className="hidden md:flex h-7 bg-background/95 backdrop-blur border-t border-border px-4 items-center justify-between shrink-0 text-[11px] text-muted-foreground select-none z-10">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">Total: {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}</span>
          <span>•</span>
          <span>{content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length : 0} words</span>
          <span>•</span>
          <span>{pageSettings.size} ({pageSettings.orientation})</span>
          {pageBorder?.enabled && (
            <>
              <span>•</span>
              <span className="text-primary font-medium">Border: {pageBorder.style} ({pageBorder.width}px)</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddNewPage}
            className="hover:text-primary transition-colors flex items-center gap-1 font-semibold"
          >
            <Plus className="h-3 w-3" /> Add Page
          </button>
        </div>
      </div>

      {/* ── Dedicated Mobile Canva-Style Bottom Toolbar & Sheets (Mobile Only) ─ */}
      {editable && (
        <MobileEditorToolbar
          editor={activeEditor}
          pageSettings={pageSettings}
          onChangePageSettings={onChangePageSettings}
          onOpenImageUploadModal={onOpenImageUploadModal}
          onOpenEquationModal={onOpenEquationModal}
          onOpenDiagramModal={onOpenDiagramModal}
          onOpenChartModal={onOpenChartModal}
          onOpenQRCodeModal={onOpenQRCodeModal}
          onOpenSignatureModal={onOpenSignatureModal}
          onOpenAcademicCoverModal={onOpenAcademicCoverModal}
          onOpenFindReplaceModal={onOpenFindReplaceModal}
          onOpenWordCountModal={onOpenWordCountModal}
          onOpenAIWritingModal={onOpenAIWritingModal}
          onOpenQualityCheckerModal={onOpenQualityCheckerModal}
          onOpenDocumentOutlineModal={onOpenDocumentOutlineModal}
          onOpenVersionHistoryModal={onOpenVersionHistoryModal}
          onDownload={onDownload}
          onPrint={onPrint}
          onAddPage={handleAddNewPage}
        />
      )}
    </div>
  );
}
