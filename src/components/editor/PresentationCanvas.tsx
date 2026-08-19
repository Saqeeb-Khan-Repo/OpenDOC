import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Slide, SlideLayout, PresentationSettings, SlideTheme,
  CanvasElement, ShapeType, SlideTransition
} from '@/engines/types';
import {
  PresentationEngine, PRESENTATION_THEMES, PRESENTATION_GRADIENTS, GradientPreset
} from '@/engines/PresentationEngine';
import { ElementEngine } from '@/engines/ElementEngine';
import { PresentationSidebar } from './PresentationSidebar';
import { PresentationToolbar } from './PresentationToolbar';
import { PresentationPropertiesPanel } from './PresentationPropertiesPanel';
import { MobilePresentationToolbar } from './MobilePresentationToolbar';
import { PresentationThemeModal } from './PresentationThemeModal';
import { PresenterModal } from './PresenterModal';
import { ImageUploadModal } from './ImageUploadModal';
import { ImageCropModal } from './ImageCropModal';
import { ImageAssetEngine } from '@/engines/ImageAssetEngine';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import {
  Plus, Copy, Trash2, Play, Palette, Layout, Type, Square,
  Image as ImageIcon, BarChart3, GitFork, QrCode, FileText, ChevronDown,
  ArrowUp, ArrowDown, Sparkles, Undo2, Redo2, Layers, Check,
  Move, RotateCcw, Crop, RefreshCw, RotateCw, Sliders, ArrowUpSquare,
  ArrowDownSquare, ChevronUp, ChevronRight, ChevronLeft, Minus,
  ZoomIn, ZoomOut, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface PresentationCanvasProps {
  slides: Slide[];
  activeSlideIndex: number;
  settings: PresentationSettings;
  onChangeSlides: (slides: Slide[]) => void;
  onChangeActiveSlideIndex: (idx: number) => void;
  onChangeSettings: (settings: PresentationSettings) => void;
  onOpenChartModal: () => void;
  onOpenDiagramModal: () => void;
  onOpenQRCodeModal: () => void;
}

export function PresentationCanvas({
  slides,
  activeSlideIndex,
  settings,
  onChangeSlides,
  onChangeActiveSlideIndex,
  onChangeSettings,
  onOpenChartModal,
  onOpenDiagramModal,
  onOpenQRCodeModal,
}: PresentationCanvasProps) {
  const responsive = useResponsiveEditor();

  // Ensure valid slides
  const validSlides = slides && slides.length > 0
    ? slides
    : [PresentationEngine.createSlide('title', settings.theme || PRESENTATION_THEMES[0])];

  const safeActiveIndex = Math.min(Math.max(0, activeSlideIndex), validSlides.length - 1);
  const activeSlide = validSlides[safeActiveIndex] || validSlides[0];

  const [presenterOpen, setPresenterOpen] = useState(false);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const selectedElementId = selectedElementIds[0] || null;
  const setSelectedElementId = useCallback((id: string | null) => {
    setSelectedElementIds(id ? [id] : []);
  }, []);

  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<CanvasElement | null>(null);
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  // Undo / Redo History
  const [history, setHistory] = useState<Slide[][]>([validSlides]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((nextSlides: Slide[]) => {
    const truncated = history.slice(0, historyIndex + 1);
    setHistory([...truncated, nextSlides]);
    setHistoryIndex(truncated.length);
  }, [history, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      const prevSlides = history[nextIdx];
      setHistoryIndex(nextIdx);
      onChangeSlides(prevSlides);
      onChangeActiveSlideIndex(Math.min(safeActiveIndex, prevSlides.length - 1));
    }
  }, [history, historyIndex, onChangeSlides, onChangeActiveSlideIndex, safeActiveIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const nextSlides = history[nextIdx];
      setHistoryIndex(nextIdx);
      onChangeSlides(nextSlides);
      onChangeActiveSlideIndex(Math.min(safeActiveIndex, nextSlides.length - 1));
    }
  }, [history, historyIndex, onChangeSlides, onChangeActiveSlideIndex, safeActiveIndex]);

  const selectedElements = activeSlide.elements.filter(el => selectedElementIds.includes(el.id));
  const selectedElement = activeSlide.elements.find(el => el.id === selectedElementId) || null;

  // ── Responsive Viewport & Proportional Scale Observer ───────────────────────
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 960, height: 540 });

  useEffect(() => {
    const el = stageContainerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  const SLIDE_CANONICAL_WIDTH = 960;
  const SLIDE_CANONICAL_HEIGHT = 540;

  const stagePadding = responsive.isMobile ? 12 : 36;
  const navButtonsWidth = responsive.isMobile ? 0 : 120; // on mobile buttons are below canvas

  const availWidth = Math.max(120, containerSize.width - stagePadding * 2 - navButtonsWidth);
  const availHeight = Math.max(120, containerSize.height - stagePadding * 2 - (responsive.isMobile ? 60 : 0));
  const baseScale = Math.min(
    availWidth / SLIDE_CANONICAL_WIDTH,
    availHeight / SLIDE_CANONICAL_HEIGHT
  );
  const computedScale = Math.max(0.2, baseScale * zoomMultiplier);

  // ── Slide Navigation Boundaries & Handlers ──────────────────────────────────
  const hasPrev = safeActiveIndex > 0;
  const hasNext = safeActiveIndex < validSlides.length - 1;

  const handlePrevSlide = useCallback(() => {
    if (safeActiveIndex > 0) {
      setSelectedElementId(null);
      onChangeActiveSlideIndex(safeActiveIndex - 1);
    }
  }, [safeActiveIndex, onChangeActiveSlideIndex]);

  const handleNextSlide = useCallback(() => {
    if (safeActiveIndex < validSlides.length - 1) {
      setSelectedElementId(null);
      onChangeActiveSlideIndex(safeActiveIndex + 1);
    }
  }, [safeActiveIndex, validSlides.length, onChangeActiveSlideIndex]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailStripRef.current) {
      const activeEl = thumbnailStripRef.current.children[safeActiveIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [safeActiveIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.getAttribute('contenteditable') === 'true'
      );
      if (isTyping) return;

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (safeActiveIndex > 0) {
          e.preventDefault();
          handlePrevSlide();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (safeActiveIndex < validSlides.length - 1) {
          e.preventDefault();
          handleNextSlide();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeActiveIndex, validSlides.length, handlePrevSlide, handleNextSlide]);

  // ── Slide Mutators ─────────────────────────────────────────────────────────
  const updateActiveSlide = useCallback((updated: Slide) => {
    const next = [...validSlides];
    next[safeActiveIndex] = updated;
    pushHistory(next);
    onChangeSlides(next);
  }, [validSlides, safeActiveIndex, pushHistory, onChangeSlides]);

  const handleAddSlide = useCallback((layout: SlideLayout = 'title-content', gradient?: string) => {
    const newSlide = PresentationEngine.createSlide(
      layout,
      settings.theme || PRESENTATION_THEMES[0],
      gradient || activeSlide.gradient
    );
    const next = [...validSlides, newSlide];
    pushHistory(next);
    onChangeSlides(next);
    onChangeActiveSlideIndex(next.length - 1);
  }, [validSlides, settings.theme, activeSlide.gradient, pushHistory, onChangeSlides, onChangeActiveSlideIndex]);

  const handleDuplicateSlide = useCallback((idx: number) => {
    const original = validSlides[idx];
    const duplicated: Slide = {
      ...original,
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${original.title} (Copy)`,
      elements: original.elements.map(el => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      })),
    };
    const next = [...validSlides.slice(0, idx + 1), duplicated, ...validSlides.slice(idx + 1)];
    pushHistory(next);
    onChangeSlides(next);
    onChangeActiveSlideIndex(idx + 1);
  }, [validSlides, pushHistory, onChangeSlides, onChangeActiveSlideIndex]);

  const handleDeleteSlide = useCallback((idx: number) => {
    if (validSlides.length <= 1) return;
    const next = validSlides.filter((_, i) => i !== idx);
    pushHistory(next);
    onChangeSlides(next);
    onChangeActiveSlideIndex(Math.min(safeActiveIndex, next.length - 1));
  }, [validSlides, safeActiveIndex, pushHistory, onChangeSlides, onChangeActiveSlideIndex]);

  const handleLoadProjectDeck = useCallback(() => {
    const templateSlides = PresentationEngine.createProjectDeck(
      'Autonomous Document Studio',
      'Engineering Team',
      settings.theme || PRESENTATION_THEMES[0]
    );
    pushHistory(templateSlides);
    onChangeSlides(templateSlides);
    onChangeActiveSlideIndex(0);
  }, [settings.theme, pushHistory, onChangeSlides, onChangeActiveSlideIndex]);

  // ── Canvas Element Mutators ────────────────────────────────────────────────
  const handleUpdateSelectedElement = useCallback((patch: Partial<CanvasElement>) => {
    if (selectedElementIds.length === 0) return;
    let nextElements: CanvasElement[];

    if (patch.style?.fontSize) {
      const valid = Math.min(144, Math.max(8, Math.round(patch.style.fontSize)));
      nextElements = activeSlide.elements.map(el => {
        if (selectedElementIds.includes(el.id)) {
          const withPatch: CanvasElement = {
            ...el,
            ...patch,
            style: { ...el.style, ...patch.style },
            transform: patch.transform ? { ...el.transform, ...patch.transform } : el.transform,
          };
          return ElementEngine.updateElementFontSize(withPatch, valid);
        }
        return el;
      });
    } else {
      nextElements = activeSlide.elements.map(el =>
        selectedElementIds.includes(el.id)
          ? {
              ...el,
              ...patch,
              style: patch.style ? { ...el.style, ...patch.style } : el.style,
              transform: patch.transform ? { ...el.transform, ...patch.transform } : el.transform,
            }
          : el
      );
    }
    updateActiveSlide({ ...activeSlide, elements: nextElements });
  }, [selectedElementIds, activeSlide, updateActiveSlide]);

  const handleDeleteSelectedElement = useCallback(() => {
    if (selectedElementIds.length === 0) return;
    const nextElements = activeSlide.elements.filter(el => !selectedElementIds.includes(el.id));
    updateActiveSlide({ ...activeSlide, elements: nextElements });
    setSelectedElementIds([]);
  }, [selectedElementIds, activeSlide, updateActiveSlide]);

  const handleDuplicateSelectedElement = useCallback(() => {
    if (!selectedElement) return;
    const duplicated: CanvasElement = {
      ...selectedElement,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      transform: {
        ...selectedElement.transform,
        x: selectedElement.transform.x + 30,
        y: selectedElement.transform.y + 30,
      },
    };
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, duplicated] });
    setSelectedElementIds([duplicated.id]);
  }, [selectedElement, activeSlide, updateActiveSlide]);

  const handleAddTextElement = useCallback(() => {
    const newEl = ElementEngine.createElement('text', {
      transform: { x: 100, y: 160, width: 760, height: 120, rotation: 0 },
      content: '<h2 style="font-size:32px;font-weight:700;">Add Heading Text Here</h2><p style="font-size:18px;">Click to edit this body paragraph on the slide.</p>',
    });
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
    setSelectedElementIds([newEl.id]);
  }, [activeSlide, updateActiveSlide]);

  const handleAddShapeElement = useCallback((shape: ShapeType) => {
    const newEl = ElementEngine.createElement('shape', {
      shapeType: shape,
      transform: { x: 380, y: 170, width: 200, height: 200, rotation: 0 },
      style: { fill: '#3b82f6', cornerRadius: shape === 'rounded-rectangle' ? 16 : 0 },
    });
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
    setSelectedElementIds([newEl.id]);
  }, [activeSlide, updateActiveSlide]);

  const handleAddTableElement = useCallback((rows = 3, cols = 3) => {
    let tableHtml = '<table style="width:100%;border-collapse:collapse;font-size:16px;">';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="border:1px solid rgba(255,255,255,0.3);padding:8px 12px;">${r === 0 ? `Header ${c + 1}` : `Data ${r},${c + 1}`}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';

    const newEl = ElementEngine.createElement('table', {
      transform: { x: 120, y: 120, width: 720, height: 260, rotation: 0 },
      content: tableHtml,
      style: { backgroundColor: 'rgba(0,0,0,0.2)', cornerRadius: 8 },
    });
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
    setSelectedElementIds([newEl.id]);
  }, [activeSlide, updateActiveSlide]);

  // Gradient & Theme Mutators
  const handleApplyGradient = useCallback((preset: GradientPreset, applyToAll = false) => {
    if (applyToAll) {
      const next = validSlides.map(s => ({ ...s, gradient: preset.gradient }));
      pushHistory(next);
      onChangeSlides(next);
    } else {
      updateActiveSlide({ ...activeSlide, gradient: preset.gradient });
    }
  }, [validSlides, activeSlide, pushHistory, onChangeSlides, updateActiveSlide]);

  const handleClearGradient = useCallback((applyToAll = false) => {
    if (applyToAll) {
      const next = validSlides.map(s => ({ ...s, gradient: undefined }));
      pushHistory(next);
      onChangeSlides(next);
    } else {
      updateActiveSlide({ ...activeSlide, gradient: undefined });
    }
  }, [validSlides, activeSlide, pushHistory, onChangeSlides, updateActiveSlide]);

  const handleChangeTheme = useCallback((theme: SlideTheme, applyToAll = true) => {
    onChangeSettings({ ...settings, theme });
    if (applyToAll) {
      const next = PresentationEngine.applyThemeToSlides(validSlides, theme);
      pushHistory(next);
      onChangeSlides(next);
    } else {
      const updated = PresentationEngine.applyThemeToSlides([activeSlide], theme)[0];
      updateActiveSlide(updated);
    }
  }, [settings, onChangeSettings, validSlides, activeSlide, pushHistory, onChangeSlides, updateActiveSlide]);

  const handleChangeFontSize = useCallback((fontSize: number) => {
    const targetIds = selectedElementIds.length > 0
      ? selectedElementIds
      : (selectedElementId ? [selectedElementId] : []);
    if (targetIds.length === 0) return;

    const valid = Math.min(144, Math.max(8, Math.round(fontSize)));
    if (isNaN(valid)) return;

    const nextElements = ElementEngine.updateElementsFontSize(activeSlide.elements, targetIds, valid);
    const updatedSlide = { ...activeSlide, elements: nextElements };
    const nextSlides = validSlides.map((s, idx) => idx === safeActiveIndex ? updatedSlide : s);
    pushHistory(nextSlides);
    onChangeSlides(nextSlides);
  }, [selectedElementIds, selectedElementId, activeSlide, validSlides, safeActiveIndex, pushHistory, onChangeSlides]);

  const handleApplyFontToAll = useCallback((fontFamily: string) => {
    const next = validSlides.map(s => ({
      ...s,
      elements: s.elements.map(el =>
        el.type === 'text'
          ? { ...el, style: { ...el.style, fontFamily } }
          : el
      ),
    }));
    pushHistory(next);
    onChangeSlides(next);
  }, [validSlides, pushHistory, onChangeSlides]);

  const handleApplyTextColorToAll = useCallback((color: string) => {
    const next = validSlides.map(s => ({
      ...s,
      elements: s.elements.map(el =>
        el.type === 'text'
          ? { ...el, style: { ...el.style, color } }
          : el
      ),
    }));
    pushHistory(next);
    onChangeSlides(next);
  }, [validSlides, pushHistory, onChangeSlides]);

  // Current Slide background
  const currentSlideBackground = activeSlide.gradient
    ? activeSlide.gradient
    : activeSlide.background || settings.theme?.backgroundColor || '#0F172A';

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background select-none">
      {/* ── Hidden File Inputs ───────────────────────────────────────────────── */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && selectedElement) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                handleUpdateSelectedElement({ content: event.target.result as string });
              }
            };
            reader.readAsDataURL(file);
          }
          e.target.value = '';
        }}
      />

      {/* ── Desktop Presentation Toolbar (Visible md+) ──────────────────────── */}
      <PresentationToolbar
        activeSlide={activeSlide}
        selectedElement={selectedElement}
        selectedElements={selectedElements}
        settings={settings}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onAddSlide={handleAddSlide}
        onAddText={handleAddTextElement}
        onAddImage={() => setImageUploadOpen(true)}
        onAddShape={handleAddShapeElement}
        onAddTable={handleAddTableElement}
        onOpenChartModal={onOpenChartModal}
        onOpenDiagramModal={onOpenDiagramModal}
        onOpenQRCodeModal={onOpenQRCodeModal}
        onOpenSignatureModal={() => {}}
        onOpenThemeModal={() => setThemeModalOpen(true)}
        onApplyGradient={handleApplyGradient}
        onClearGradient={handleClearGradient}
        onChangeTheme={handleChangeTheme}
        onApplyFontToAll={handleApplyFontToAll}
        onApplyTextColorToAll={handleApplyTextColorToAll}
        onFormatText={(cmd, val) => {
          document.execCommand(cmd, false, val);
        }}
        onUpdateSelectedElement={handleUpdateSelectedElement}
        onChangeFontSize={handleChangeFontSize}
        onBringForward={() => {
          if (selectedElementId) {
            const reordered = ElementEngine.bringForward(activeSlide.elements, selectedElementId);
            updateActiveSlide({ ...activeSlide, elements: reordered });
          }
        }}
        onSendBackward={() => {
          if (selectedElementId) {
            const reordered = ElementEngine.sendBackward(activeSlide.elements, selectedElementId);
            updateActiveSlide({ ...activeSlide, elements: reordered });
          }
        }}
        onAlignElements={(alignment) => {
          if (selectedElementId) {
            const aligned = PresentationEngine.alignElements(activeSlide.elements, [selectedElementId], alignment);
            updateActiveSlide({ ...activeSlide, elements: aligned });
          }
        }}
        onPresent={() => setPresenterOpen(true)}
      />

      {/* ── Mobile Presentation 5-Tool Bottom Toolbar ───────────────────────── */}
      <MobilePresentationToolbar
        slides={validSlides}
        activeSlideIndex={safeActiveIndex}
        activeSlide={activeSlide}
        selectedElement={selectedElement}
        selectedElements={selectedElements}
        settings={settings}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onChangeActiveSlideIndex={onChangeActiveSlideIndex}
        onAddSlide={handleAddSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onDeleteSlide={handleDeleteSlide}
        onLoadProjectDeck={handleLoadProjectDeck}
        onAddText={handleAddTextElement}
        onAddImage={() => setImageUploadOpen(true)}
        onAddShape={handleAddShapeElement}
        onAddTable={handleAddTableElement}
        onOpenChartModal={onOpenChartModal}
        onOpenDiagramModal={onOpenDiagramModal}
        onOpenQRCodeModal={onOpenQRCodeModal}
        onApplyGradient={handleApplyGradient}
        onClearGradient={handleClearGradient}
        onChangeTheme={handleChangeTheme}
        onApplyFontToAll={handleApplyFontToAll}
        onApplyTextColorToAll={handleApplyTextColorToAll}
        onFormatText={(cmd, val) => {
          document.execCommand(cmd, false, val);
        }}
        onUpdateSelectedElement={handleUpdateSelectedElement}
        onBringForward={() => {
          if (selectedElementId) {
            const reordered = ElementEngine.bringForward(activeSlide.elements, selectedElementId);
            updateActiveSlide({ ...activeSlide, elements: reordered });
          }
        }}
        onSendBackward={() => {
          if (selectedElementId) {
            const reordered = ElementEngine.sendBackward(activeSlide.elements, selectedElementId);
            updateActiveSlide({ ...activeSlide, elements: reordered });
          }
        }}
        onDeleteSelectedElement={handleDeleteSelectedElement}
        onChangeSpeakerNotes={(notes) => updateActiveSlide({ ...activeSlide, speakerNotes: notes })}
        onPresent={() => setPresenterOpen(true)}
      />

      {/* ── Main Workspace Body: Left Sidebar + Center Stage + Right Inspector ─ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative w-full">
        {/* Desktop Slide Navigator Sidebar */}
        <PresentationSidebar
          slides={validSlides}
          activeSlideIndex={safeActiveIndex}
          settings={settings}
          onChangeSlides={(s: Slide[]) => {
            pushHistory(s);
            onChangeSlides(s);
          }}
          onChangeActiveSlideIndex={onChangeActiveSlideIndex}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onLoadProjectDeck={handleLoadProjectDeck}
        />

        {/* ── Mobile Horizontal Slide Thumbnail Strip (md:hidden) ───────────── */}
        <div className="flex md:hidden items-center gap-1.5 px-3 py-1.5 bg-muted/40 border-b border-border/80 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
          <div ref={thumbnailStripRef} className="flex items-center gap-1.5">
            {validSlides.map((s, idx) => (
              <button
                key={s.id || idx}
                type="button"
                onClick={() => onChangeActiveSlideIndex(idx)}
                className={cn(
                  'h-8 px-2.5 rounded-lg border text-xs font-bold font-mono shrink-0 transition-all flex items-center gap-1 cursor-pointer',
                  safeActiveIndex === idx
                    ? 'bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground'
                )}
                aria-label={`Go to Slide ${idx + 1}`}
              >
                <span>{idx + 1}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleAddSlide('title-content')}
              className="h-8 w-8 rounded-lg border border-dashed border-border bg-card/60 flex items-center justify-center text-primary hover:bg-primary/10 shrink-0 cursor-pointer"
              title="Add Slide"
              aria-label="Add slide"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center Stage & Speaker Notes */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-muted/20">
          {/* Main Slide Canvas Viewport with Canonical Proportional Scaling */}
          <div
            ref={stageContainerRef}
            className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-y-auto overflow-x-hidden relative touch-pan-y overscroll-y-contain pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={() => setSelectedElementIds([])}
          >
            {/* ── Floating Zoom Controls (Safely positioned above bottom toolbar) ── */}
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30 flex items-center gap-1 bg-background/90 backdrop-blur-md border border-border rounded-xl p-1 shadow-md select-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomMultiplier(z => Math.max(0.4, Number((z - 0.1).toFixed(1))));
                }}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
                title="Zoom Out"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono font-semibold px-1 min-w-[36px] text-center text-muted-foreground">
                {Math.round(zoomMultiplier * 100)}%
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomMultiplier(z => Math.min(2.5, Number((z + 0.1).toFixed(1))));
                }}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
                title="Zoom In"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomMultiplier(1);
                }}
                className="h-7 px-2 rounded-lg text-[10px] font-semibold text-primary hover:bg-primary/10 active:scale-95 transition-all border-l border-border ml-0.5"
                title="Fit to Screen"
                aria-label="Fit to screen"
              >
                Fit
              </button>
            </div>

            {/* ── Slide Stage Row with Navigation Buttons ────────────────────── */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-full relative select-none">
              {/* Desktop Left: Previous Slide Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevSlide();
                }}
                disabled={!hasPrev}
                aria-label="Previous slide"
                title={hasPrev ? `Previous Slide (Slide ${safeActiveIndex} of ${validSlides.length})` : 'First Slide'}
                className={cn(
                  "hidden md:flex h-12 w-12 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-md items-center justify-center transition-all z-20 shrink-0 select-none",
                  hasPrev
                    ? "text-foreground hover:bg-primary hover:text-white hover:border-primary active:scale-95 cursor-pointer hover:shadow-lg"
                    : "text-muted-foreground/30 border-border/40 bg-background/40 cursor-not-allowed opacity-30 pointer-events-none"
                )}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

            {/* Canonical 960x540 Slide Canvas with Uniform Transform Scale */}
            <div
              style={{
                width: '960px',
                height: '540px',
                transform: `scale(${computedScale})`,
                transformOrigin: 'center center',
                background: currentSlideBackground,
              }}
              className="rounded-xl shadow-2xl border border-black/10 dark:border-white/10 relative shrink-0 transition-transform duration-75 group/stage select-text"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElementIds([]);
              }}
            >
              {activeSlide.elements.map(el => {
                const isSelected = selectedElementIds.includes(el.id) || selectedElementId === el.id;
                const elFontSize = ElementEngine.getElementFontSize(el);

                return (
                  <div
                    key={el.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (e.shiftKey || e.metaKey || e.ctrlKey) {
                        setSelectedElementIds(prev =>
                          prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]
                        );
                      } else {
                        setSelectedElementIds([el.id]);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      left: `${el.transform.x}px`,
                      top: `${el.transform.y}px`,
                      width: `${el.transform.width}px`,
                      height: `${el.transform.height}px`,
                      transform: el.transform.rotation ? `rotate(${el.transform.rotation}deg)` : undefined,
                      border: isSelected ? '2px solid #2563EB' : '1px solid transparent',
                      touchAction: 'none',
                      fontSize: `${elFontSize}px`,
                      fontFamily: el.style?.fontFamily || settings.theme?.bodyFont,
                      color: el.style?.color || settings.theme?.textColor,
                      ...el.style,
                    }}
                    className={`group/el relative ${isSelected ? 'shadow-lg ring-2 ring-primary/40' : ''}`}
                  >
                    {/* Element Type Rendering */}
                    {el.type === 'image' ? (
                      <div className="w-full h-full overflow-hidden flex items-center justify-center pointer-events-none">
                        <img
                          src={el.content || ''}
                          alt="Slide Image"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: el.style?.cornerRadius || 8,
                            opacity: el.style?.opacity ?? 1,
                          }}
                        />
                      </div>
                    ) : el.type === 'shape' ? (
                      <div
                        className="w-full h-full flex items-center justify-center p-2 text-center"
                        style={{
                          backgroundColor: el.style?.fill || '#2563eb',
                          borderRadius: el.style?.cornerRadius || 8,
                          border: el.style?.stroke ? `${el.style.strokeWidth || 1}px solid ${el.style.stroke}` : undefined,
                          opacity: el.style?.opacity ?? 1,
                        }}
                      >
                        {el.content ? (
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            style={{
                              fontSize: `${elFontSize}px`,
                              lineHeight: el.style?.lineHeight || 1.3,
                            }}
                            onFocus={(e) => {
                              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            onBlur={e => {
                              const nextEls = activeSlide.elements.map(item =>
                                item.id === el.id ? { ...item, content: e.currentTarget.innerHTML } : item
                              );
                              updateActiveSlide({ ...activeSlide, elements: nextEls });
                            }}
                            dangerouslySetInnerHTML={{ __html: el.content }}
                            className="w-full h-full outline-none select-text"
                          />
                        ) : null}
                      </div>
                    ) : (
                      /* Rich Text Box / Table / KaTeX */
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        style={{
                          fontSize: `${elFontSize}px`,
                          lineHeight: el.style?.lineHeight || 1.3,
                          fontFamily: el.style?.fontFamily || settings.theme?.bodyFont,
                          color: el.style?.color || settings.theme?.textColor,
                          textAlign: el.style?.textAlign,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        onBlur={e => {
                          const nextEls = activeSlide.elements.map(item =>
                            item.id === el.id ? { ...item, content: e.currentTarget.innerHTML } : item
                          );
                          updateActiveSlide({ ...activeSlide, elements: nextEls });
                        }}
                        dangerouslySetInnerHTML={{ __html: el.content || '' }}
                        className="w-full h-full outline-none select-text"
                      />
                    )}

                      {/* Transform Handles when selected */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-2 -left-2 h-4 w-4 rounded-full bg-primary border-2 border-white pointer-events-none shadow-md" />
                          <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary border-2 border-white pointer-events-none shadow-md" />
                          <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-primary border-2 border-white pointer-events-none shadow-md" />
                          <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full bg-primary border-2 border-white pointer-events-none shadow-md" />

                          {/* Contextual Action Bar Floating Above Element */}
                          <div
                            className="absolute -top-10 left-0 bg-background/98 backdrop-blur border border-border shadow-xl rounded-lg px-2 py-1 flex items-center gap-1.5 z-30 select-none"
                            onClick={e => e.stopPropagation()}
                          >
                            {el.type === 'image' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setCropTarget(el)}
                                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                                  title="Crop Image"
                                >
                                  <Crop className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => replaceFileInputRef.current?.click()}
                                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                                  title="Replace Image"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const nextRot = ((el.transform.rotation || 0) + 90) % 360;
                                handleUpdateSelectedElement({ transform: { ...el.transform, rotation: nextRot } });
                              }}
                              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                              title="Rotate 90°"
                            >
                              <RotateCw className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleDuplicateSelectedElement}
                              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteSelectedElement}
                              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive text-xs"
                              title="Delete Element"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Right: Next Slide Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextSlide();
                }}
                disabled={!hasNext}
                aria-label="Next slide"
                title={hasNext ? `Next Slide (Slide ${safeActiveIndex + 2} of ${validSlides.length})` : 'Last Slide'}
                className={cn(
                  "hidden md:flex h-12 w-12 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-md items-center justify-center transition-all z-20 shrink-0 select-none",
                  hasNext
                    ? "text-foreground hover:bg-primary hover:text-white hover:border-primary active:scale-95 cursor-pointer hover:shadow-lg"
                    : "text-muted-foreground/30 border-border/40 bg-background/40 cursor-not-allowed opacity-30 pointer-events-none"
                )}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* ── Mobile Dedicated Slide Navigation Bar (Below Canvas, md:hidden) ── */}
          <div className="flex md:hidden items-center justify-between gap-3 px-4 py-2 bg-background/95 backdrop-blur border-t border-border/80 shrink-0 select-none z-20">
            <button
              type="button"
              onClick={handlePrevSlide}
              disabled={!hasPrev}
              className={cn(
                "h-11 px-4 rounded-xl border border-border font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs",
                hasPrev
                  ? "bg-card text-foreground hover:bg-muted active:scale-95 cursor-pointer"
                  : "bg-muted/30 text-muted-foreground/40 border-border/30 opacity-40 cursor-not-allowed"
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            <span className="text-xs font-mono font-bold text-foreground">
              Slide {safeActiveIndex + 1} / {validSlides.length}
            </span>

            <button
              type="button"
              onClick={handleNextSlide}
              disabled={!hasNext}
              className={cn(
                "h-11 px-4 rounded-xl border border-border font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs",
                hasNext
                  ? "bg-card text-foreground hover:bg-muted active:scale-95 cursor-pointer"
                  : "bg-muted/30 text-muted-foreground/40 border-border/30 opacity-40 cursor-not-allowed"
              )}
              aria-label="Next slide"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── Expandable Speaker Notes Drawer (Desktop md+) ───────────────── */}
          <div className="hidden md:block border-t border-border bg-card/90 backdrop-blur shrink-0 transition-all select-none">
            <div
              className="h-8 px-4 flex items-center justify-between cursor-pointer hover:bg-muted/40"
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span>Speaker Notes</span>
                <span className="text-[10px] text-muted-foreground/80 font-mono">
                  ({(activeSlide.speakerNotes || '').trim().split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>
              <button type="button" className="text-muted-foreground hover:text-foreground">
                {showNotesDrawer ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>

            {showNotesDrawer && (
              <div className="p-3 pt-0">
                <textarea
                  value={activeSlide.speakerNotes || ''}
                  onChange={e => updateActiveSlide({ ...activeSlide, speakerNotes: e.target.value })}
                  placeholder="Type notes and key presentation talking points here..."
                  className="w-full h-20 text-xs p-2.5 rounded-lg border border-border bg-background text-foreground resize-none focus:border-primary outline-none transition-all leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Properties & Layers Panel */}
        <PresentationPropertiesPanel
          activeSlide={activeSlide}
          selectedElement={selectedElement}
          settings={settings}
          onChangeSlide={updateActiveSlide}
          onChangeSettings={onChangeSettings}
          onUpdateSelectedElement={handleUpdateSelectedElement}
          onOpenImageUploadModal={() => setImageUploadOpen(true)}
          onOpenCropModal={() => selectedElement && setCropTarget(selectedElement)}
          onBringForward={() => {
            if (selectedElementId) {
              const reordered = ElementEngine.bringForward(activeSlide.elements, selectedElementId);
              updateActiveSlide({ ...activeSlide, elements: reordered });
            }
          }}
          onSendBackward={() => {
            if (selectedElementId) {
              const reordered = ElementEngine.sendBackward(activeSlide.elements, selectedElementId);
              updateActiveSlide({ ...activeSlide, elements: reordered });
            }
          }}
          onDeleteElement={handleDeleteSelectedElement}
        />
      </div>

      {/* ── Modals & Uploaders ──────────────────────────────────────────────── */}
      <ImageUploadModal
        open={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        onInsertImage={({ src }) => {
          const newEl = ElementEngine.createElement('image', {
            transform: { x: 180, y: 100, width: 440, height: 300, rotation: 0 },
            content: src,
            style: { cornerRadius: 8 },
          });
          updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
          setSelectedElementId(newEl.id);
        }}
      />

      {cropTarget && (
        <ImageCropModal
          open={!!cropTarget}
          onClose={() => setCropTarget(null)}
          imageSrc={cropTarget.content || ''}
          onApplyCrop={(croppedUrl: string) => {
            handleUpdateSelectedElement({ content: croppedUrl });
            setCropTarget(null);
          }}
        />
      )}

      {/* Fullscreen Presenter Mode Modal */}
      <PresenterModal
        open={presenterOpen}
        slides={validSlides}
        initialSlideIndex={safeActiveIndex}
        settings={settings}
        onClose={() => setPresenterOpen(false)}
      />

      {/* Visual Theme Selection Modal */}
      <PresentationThemeModal
        open={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        currentThemeId={settings.theme?.id || 'professional'}
        onSelectTheme={(th) => handleChangeTheme(th, true)}
      />
    </div>
  );
}
