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
  ArrowDownSquare, ChevronUp, ChevronRight, ChevronLeft, Minus
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
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<CanvasElement | null>(null);
  const [clipboardElement, setClipboardElement] = useState<CanvasElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

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
  const stagePadding = responsive.isMobile ? 8 : 24;
  const navButtonsWidth = responsive.isMobile ? 64 : 110;
  const availWidth = Math.max(120, containerSize.width - stagePadding * 2 - navButtonsWidth);
  const availHeight = Math.max(120, containerSize.height - stagePadding * 2);
  const computedScale = Math.min(
    availWidth / SLIDE_CANONICAL_WIDTH,
    availHeight / SLIDE_CANONICAL_HEIGHT
  );

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

  // Keyboard navigation (ArrowLeft/ArrowRight/PageUp/PageDown)
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

  // ── Update Helper ───────────────────────────────────────────────────────────
  const updateActiveSlide = (newSlide: Slide) => {
    const nextSlides = validSlides.map((s, idx) => idx === safeActiveIndex ? newSlide : s);
    pushHistory(nextSlides);
    onChangeSlides(nextSlides);
  };

  // ── Slide Actions ───────────────────────────────────────────────────────────
  const handleAddSlide = (layout: SlideLayout = 'title-content', gradient?: string) => {
    const newSlide = PresentationEngine.createSlide(
      layout,
      settings.theme || PRESENTATION_THEMES[0],
      gradient || activeSlide.gradient
    );

    const nextSlides = [...validSlides];
    const insertIndex = safeActiveIndex + 1;
    nextSlides.splice(insertIndex, 0, newSlide);

    pushHistory(nextSlides);
    onChangeSlides(nextSlides);
    onChangeActiveSlideIndex(insertIndex);
  };

  const handleDuplicateSlide = (idx: number) => {
    const target = validSlides[idx];
    if (!target) return;

    const duplicatedElements = target.elements.map(el => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    }));

    const duplicatedSlide: Slide = {
      ...target,
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${target.title} (Copy)`,
      elements: duplicatedElements,
    };

    const nextSlides = [...validSlides];
    nextSlides.splice(idx + 1, 0, duplicatedSlide);

    pushHistory(nextSlides);
    onChangeSlides(nextSlides);
    onChangeActiveSlideIndex(idx + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (validSlides.length <= 1) return;
    const nextSlides = validSlides.filter((_, i) => i !== idx);
    pushHistory(nextSlides);
    onChangeSlides(nextSlides);
    onChangeActiveSlideIndex(Math.max(0, idx - 1));
  };

  const handleLoadProjectDeck = () => {
    const deck = PresentationEngine.createProjectDeck(
      'Autonomous Intelligent Document Studio',
      'Team DocFlow',
      settings.theme || PRESENTATION_THEMES[0],
      PRESENTATION_GRADIENTS[0].gradient
    );
    pushHistory(deck);
    onChangeSlides(deck);
    onChangeActiveSlideIndex(0);
  };

  // ── Element Actions ─────────────────────────────────────────────────────────
  const handleAddTextElement = () => {
    const newEl = ElementEngine.createElement('text', {
      transform: { x: 100, y: 150, width: 450, height: 80, rotation: 0 },
      content: '<p style="font-size: 24px; color: inherit;">Click to edit text...</p>',
      style: { fontFamily: settings.theme?.bodyFont || 'Inter' },
    });
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleAddShapeElement = (shapeType: ShapeType = 'rounded-rectangle') => {
    const newEl = ElementEngine.createElement('shape', {
      shapeType,
      transform: { x: 200, y: 180, width: 160, height: 120, rotation: 0 },
      style: {
        fill: settings.theme?.primaryColor || '#2563EB',
        stroke: '#ffffff',
        strokeWidth: 0,
        cornerRadius: shapeType === 'circle' ? 999 : 8,
        opacity: 0.95,
      },
    });
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleAddTableElement = (rows = 3, cols = 3) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">';
    for (let r = 0; r < rows; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        if (r === 0) {
          tableHtml += `<th style="border: 1px solid rgba(255,255,255,0.2); padding: 8px 12px; background: rgba(37,99,235,0.2); font-weight: bold;">Header ${c + 1}</th>`;
        } else {
          tableHtml += `<td style="border: 1px solid rgba(255,255,255,0.15); padding: 8px 12px;">Cell ${r},${c + 1}</td>`;
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';

    const newEl = ElementEngine.createElement('table', {
      transform: { x: 120, y: 140, width: 600, height: 200, rotation: 0 },
      content: tableHtml,
      style: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 8, cornerRadius: 6 },
    });
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, newEl] });
    setSelectedElementId(newEl.id);
  };

  const handleUpdateSelectedElement = (patch: Partial<CanvasElement>) => {
    if (!selectedElementId) return;
    const nextEls = activeSlide.elements.map(el => el.id === selectedElementId ? { ...el, ...patch } : el);
    updateActiveSlide({ ...activeSlide, elements: nextEls });
  };

  const handleDeleteSelectedElement = () => {
    if (!selectedElementId) return;
    const nextEls = activeSlide.elements.filter(el => el.id !== selectedElementId);
    updateActiveSlide({ ...activeSlide, elements: nextEls });
    setSelectedElementId(null);
  };

  const handleDuplicateSelectedElement = () => {
    if (!selectedElement) return;
    const dup: CanvasElement = {
      ...selectedElement,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transform: {
        ...selectedElement.transform,
        x: selectedElement.transform.x + 20,
        y: selectedElement.transform.y + 20,
      },
    };
    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, dup] });
    setSelectedElementId(dup.id);
  };

  // ── Rich Text Formatting on Selection ───────────────────────────────────────
  const handleFormatText = (command: string, value?: string) => {
    if (typeof window !== 'undefined') {
      document.execCommand(command, false, value);
    }
  };

  // ── Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+D, Ctrl+C, Ctrl+V, Delete) ────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedElement) {
        e.preventDefault();
        handleDuplicateSelectedElement();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c' && selectedElement) {
        setClipboardElement(selectedElement);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v' && clipboardElement) {
        e.preventDefault();
        const pasted: CanvasElement = {
          ...clipboardElement,
          id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          transform: {
            ...clipboardElement.transform,
            x: clipboardElement.transform.x + 24,
            y: clipboardElement.transform.y + 24,
          },
        };
        updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, pasted] });
        setSelectedElementId(pasted.id);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId && !(e.target as HTMLElement)?.isContentEditable) {
        e.preventDefault();
        handleDeleteSelectedElement();
      } else if (e.key === 'ArrowUp' && safeActiveIndex > 0) {
        onChangeActiveSlideIndex(safeActiveIndex - 1);
      } else if (e.key === 'ArrowDown' && safeActiveIndex < validSlides.length - 1) {
        onChangeActiveSlideIndex(safeActiveIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeActiveIndex, validSlides.length, selectedElement, selectedElementId, clipboardElement, handleUndo, handleRedo]);

  const currentSlideBackground = activeSlide.gradient || activeSlide.background || settings.theme?.backgroundColor || '#ffffff';

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] dark:bg-[#090d16] overflow-hidden relative select-none">
      {/* ── Top Ribbon Toolbar ──────────────────────────────────────────────── */}
      <PresentationToolbar
        activeSlide={activeSlide}
        selectedElement={selectedElement}
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
        onApplyGradient={(preset, applyToAll) => {
          if (applyToAll) {
            const next = validSlides.map(s => ({ ...s, gradient: preset.gradient, background: undefined }));
            pushHistory(next);
            onChangeSlides(next);
          } else {
            updateActiveSlide({ ...activeSlide, gradient: preset.gradient, background: undefined });
          }
        }}
        onClearGradient={(applyToAll) => {
          if (applyToAll) {
            const next = validSlides.map(s => ({ ...s, gradient: undefined, background: settings.theme.backgroundColor }));
            pushHistory(next);
            onChangeSlides(next);
          } else {
            updateActiveSlide({ ...activeSlide, gradient: undefined, background: settings.theme.backgroundColor });
          }
        }}
        onChangeTheme={(th, applyToAll = true) => {
          onChangeSettings({ ...settings, theme: th });
          if (applyToAll) {
            const updated = PresentationEngine.applyThemeToAllSlides(validSlides, th);
            pushHistory(updated);
            onChangeSlides(updated);
          }
        }}
        onApplyFontToAll={(fontFamily) => {
          const updated = PresentationEngine.applyFontToAllSlides(validSlides, fontFamily, 'all');
          pushHistory(updated);
          onChangeSlides(updated);
        }}
        onApplyTextColorToAll={(color) => {
          const updated = PresentationEngine.applyTextColorToAllSlides(validSlides, color, 'all');
          pushHistory(updated);
          onChangeSlides(updated);
        }}
        onFormatText={handleFormatText}
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
        onAlignElements={(alignment) => {
          if (selectedElementId) {
            const aligned = PresentationEngine.alignElements(activeSlide.elements, [selectedElementId], alignment);
            updateActiveSlide({ ...activeSlide, elements: aligned });
          }
        }}
        onPresent={() => setPresenterOpen(true)}
      />

      {/* ── Main Workspace Body: Left Sidebar + Center Stage + Right Inspector ─ */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Slide Navigator Sidebar */}
        <PresentationSidebar
          slides={validSlides}
          activeSlideIndex={safeActiveIndex}
          settings={settings}
          onChangeSlides={(s) => {
            pushHistory(s);
            onChangeSlides(s);
          }}
          onChangeActiveSlideIndex={onChangeActiveSlideIndex}
          onAddSlide={handleAddSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onLoadProjectDeck={handleLoadProjectDeck}
        />

        {/* Center Stage & Speaker Notes */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-muted/20">
          {/* Main Slide Canvas Viewport with Canonical Proportional Scaling */}
          <div
            ref={stageContainerRef}
            className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-y-auto overflow-x-hidden relative touch-pan-y overscroll-y-contain pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-6"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={() => setSelectedElementId(null)}
          >
            {/* ── Slide Stage Row with Left & Right Navigation Buttons ──────── */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-5 w-full max-w-full relative select-none">
              {/* ◀ Left: Previous Slide Button */}
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
                  "h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-md flex items-center justify-center transition-all z-20 shrink-0 select-none",
                  hasPrev
                    ? "text-foreground hover:bg-primary hover:text-white hover:border-primary active:scale-95 cursor-pointer hover:shadow-lg"
                    : "text-muted-foreground/30 border-border/40 bg-background/40 cursor-not-allowed opacity-30 pointer-events-none"
                )}
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
                  setSelectedElementId(null);
                }}
              >
                {activeSlide.elements.map(el => {
                  const isSelected = selectedElementId === el.id;

                  return (
                    <div
                      key={el.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElementId(el.id);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${el.transform.x}px`,
                        top: `${el.transform.y}px`,
                        width: `${el.transform.width}px`,
                        height: `${el.transform.height}px`,
                        transform: el.transform.rotation ? `rotate(${el.transform.rotation}deg)` : undefined,
                        border: isSelected ? '2px solid #2563EB' : '1px solid transparent',
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
                          <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />
                          <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />
                          <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />
                          <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />

                          {/* Contextual Action Bar Floating Above Element */}
                          <div
                            className="absolute -top-9 left-0 bg-background/95 backdrop-blur border border-border shadow-lg rounded-md px-1.5 py-0.5 flex items-center gap-1 z-30 select-none"
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
                                  <Crop className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => replaceFileInputRef.current?.click()}
                                  className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                                  title="Replace Image"
                                >
                                  <RefreshCw className="h-3 w-3" />
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
                              <RotateCw className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={handleDuplicateSelectedElement}
                              className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                              title="Duplicate (Ctrl+D)"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteSelectedElement}
                              className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive text-xs"
                              title="Delete Element"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ▶ Right: Next Slide Button */}
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
                  "h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-full border border-border bg-background/90 backdrop-blur-md shadow-md flex items-center justify-center transition-all z-20 shrink-0 select-none",
                  hasNext
                    ? "text-foreground hover:bg-primary hover:text-white hover:border-primary active:scale-95 cursor-pointer hover:shadow-lg"
                    : "text-muted-foreground/30 border-border/40 bg-background/40 cursor-not-allowed opacity-30 pointer-events-none"
                )}
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>

          {/* ── Expandable Speaker Notes Drawer ──────────────────────────────── */}
          <div className="border-t border-border bg-card/90 backdrop-blur shrink-0 transition-all select-none">
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
        onClose={() => setPresenterOpen(false)}
        slides={validSlides}
        initialSlideIndex={safeActiveIndex}
        settings={settings}
      />

      {/* ── Mobile Touch-First Presentation Bottom Toolbar & Sheets ───────── */}
      <MobilePresentationToolbar
        slides={validSlides}
        activeSlideIndex={safeActiveIndex}
        activeSlide={activeSlide}
        selectedElement={selectedElement}
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
        onApplyGradient={(preset, applyToAll) => {
          if (applyToAll) {
            const next = validSlides.map(s => ({ ...s, gradient: preset.gradient, background: undefined }));
            pushHistory(next);
            onChangeSlides(next);
          } else {
            updateActiveSlide({ ...activeSlide, gradient: preset.gradient, background: undefined });
          }
        }}
        onClearGradient={(applyToAll) => {
          if (applyToAll) {
            const next = validSlides.map(s => ({ ...s, gradient: undefined, background: settings.theme.backgroundColor }));
            pushHistory(next);
            onChangeSlides(next);
          } else {
            updateActiveSlide({ ...activeSlide, gradient: undefined, background: settings.theme.backgroundColor });
          }
        }}
        onChangeTheme={(th, applyToAll = true) => {
          onChangeSettings({ ...settings, theme: th });
          if (applyToAll) {
            const updated = PresentationEngine.applyThemeToAllSlides(validSlides, th);
            pushHistory(updated);
            onChangeSlides(updated);
          }
        }}
        onApplyFontToAll={(fontFamily) => {
          const updated = PresentationEngine.applyFontToAllSlides(validSlides, fontFamily, 'all');
          pushHistory(updated);
          onChangeSlides(updated);
        }}
        onApplyTextColorToAll={(color) => {
          const updated = PresentationEngine.applyTextColorToAllSlides(validSlides, color, 'all');
          pushHistory(updated);
          onChangeSlides(updated);
        }}
        onFormatText={handleFormatText}
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

      {/* Hidden File Input for Image Replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && selectedElementId) {
            const asset = await ImageAssetEngine.createInstantAsset(file);
            handleUpdateSelectedElement({ content: asset.previewUrl });
          }
        }}
      />
    </div>
  );
}
