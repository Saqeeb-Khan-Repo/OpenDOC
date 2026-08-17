import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Slide, SlideLayout, PresentationSettings, SlideTheme,
  CanvasElement, ShapeType
} from '@/engines/types';
import {
  PresentationEngine, PRESENTATION_THEMES, PRESENTATION_GRADIENTS, GradientPreset
} from '@/engines/PresentationEngine';
import { ElementEngine } from '@/engines/ElementEngine';
import {
  Plus, Copy, Trash2, Play, Palette, Layout, Type, Square,
  Image as ImageIcon, BarChart3, GitFork, QrCode, FileText, ChevronDown,
  ArrowUp, ArrowDown, Sparkles, Undo2, Redo2, Layers, Check,
  Move, RotateCcw, Crop, RefreshCw, RotateCw, Sliders, ArrowUpSquare, ArrowDownSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { PresenterModal } from './PresenterModal';
import { ImageUploadModal } from './ImageUploadModal';
import { ImageCropModal } from './ImageCropModal';
import { ImageAssetEngine } from '@/engines/ImageAssetEngine';

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
  // Ensure we always have at least 1 valid slide
  const validSlides = slides && slides.length > 0
    ? slides
    : [PresentationEngine.createSlide('title', settings.theme || PRESENTATION_THEMES[0])];

  const safeActiveIndex = Math.min(Math.max(0, activeSlideIndex), validSlides.length - 1);
  const activeSlide = validSlides[safeActiveIndex] || validSlides[0];

  const [presenterOpen, setPresenterOpen] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showNotesDrawer, setShowNotesDrawer] = useState(true);
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<CanvasElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Undo / Redo History for Presentation
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

  // Keyboard Shortcuts (Ctrl+M for new slide, Ctrl+Z, Ctrl+Y, Arrow navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleAddSlide('title-content');
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'ArrowUp' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (safeActiveIndex > 0) onChangeActiveSlideIndex(safeActiveIndex - 1);
      } else if (e.key === 'ArrowDown' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        if (safeActiveIndex < validSlides.length - 1) onChangeActiveSlideIndex(safeActiveIndex + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [safeActiveIndex, validSlides.length, handleUndo, handleRedo]);

  // ── Slide Actions ───────────────────────────────────────────────────────────

  // Add Slide immediately after the currently active slide
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
      transform: { ...el.transform },
      style: { ...el.style },
    }));

    const copy: Slide = {
      ...target,
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Copy)`,
      elements: duplicatedElements,
    };

    const next = [...validSlides];
    next.splice(idx + 1, 0, copy);

    pushHistory(next);
    onChangeSlides(next);
    onChangeActiveSlideIndex(idx + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (validSlides.length <= 1) return;
    const next = validSlides.filter((_, i) => i !== idx);
    const nextActive = Math.max(0, Math.min(idx, next.length - 1));

    pushHistory(next);
    onChangeSlides(next);
    onChangeActiveSlideIndex(nextActive);
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= validSlides.length) return;
    const next = PresentationEngine.moveSlide(validSlides, fromIndex, toIndex);

    pushHistory(next);
    onChangeSlides(next);
    onChangeActiveSlideIndex(toIndex);
  };

  const updateActiveSlide = (updated: Slide) => {
    const next = [...validSlides];
    next[safeActiveIndex] = updated;
    onChangeSlides(next);
  };

  // ── Gradient & Theme Actions ────────────────────────────────────────────────
  const handleApplyGradient = (preset: GradientPreset, applyToAll = false) => {
    if (applyToAll) {
      const next = validSlides.map(s => ({
        ...s,
        gradient: preset.gradient,
        background: undefined,
      }));
      pushHistory(next);
      onChangeSlides(next);
    } else {
      const updated = {
        ...activeSlide,
        gradient: preset.gradient,
        background: undefined,
      };
      const next = [...validSlides];
      next[safeActiveIndex] = updated;
      pushHistory(next);
      onChangeSlides(next);
    }
  };

  const handleClearGradient = (applyToAll = false) => {
    if (applyToAll) {
      const next = validSlides.map(s => ({
        ...s,
        gradient: undefined,
        background: settings.theme.backgroundColor,
      }));
      pushHistory(next);
      onChangeSlides(next);
    } else {
      const updated = {
        ...activeSlide,
        gradient: undefined,
        background: settings.theme.backgroundColor,
      };
      const next = [...validSlides];
      next[safeActiveIndex] = updated;
      pushHistory(next);
      onChangeSlides(next);
    }
  };

  const handleThemeChange = (theme: SlideTheme) => {
    onChangeSettings({ ...settings, theme });
    const updated = validSlides.map(s => ({
      ...s,
      background: s.gradient ? undefined : theme.backgroundColor,
    }));
    pushHistory(updated);
    onChangeSlides(updated);
  };

  // ── Element Actions ─────────────────────────────────────────────────────────
  const handleAddTextElement = () => {
    const isDark = activeSlide.gradient?.includes('#1e3a8a') || activeSlide.gradient?.includes('#7c3aed') || activeSlide.gradient?.includes('#090d16') || activeSlide.gradient?.includes('#18181b');
    const color = isDark ? '#ffffff' : (settings.theme?.textColor || '#0f172a');

    const newEl = ElementEngine.createElement('text', {
      transform: { x: 100, y: 120, width: 420, height: 80, rotation: 0 },
      content: `<p style="font-size: 22px; font-weight: bold; color: ${color};">Editable text box</p>`,
    });
    const updatedSlide = {
      ...activeSlide,
      elements: [...activeSlide.elements, newEl],
    };
    updateActiveSlide(updatedSlide);
    setSelectedElementId(newEl.id);
  };

  const handleAddShapeElement = (shapeType: ShapeType = 'rounded-rectangle') => {
    const newEl = ElementEngine.createElement('shape', {
      shapeType,
      transform: { x: 160, y: 160, width: 140, height: 140, rotation: 0 },
      style: {
        fill: settings.theme.primaryColor || '#2563EB',
        stroke: '#ffffff',
        strokeWidth: 1,
        cornerRadius: 10,
      },
    });
    const updatedSlide = {
      ...activeSlide,
      elements: [...activeSlide.elements, newEl],
    };
    updateActiveSlide(updatedSlide);
    setSelectedElementId(newEl.id);
  };

  const handleElementContentChange = (elId: string, html: string) => {
    const nextElements = activeSlide.elements.map(el =>
      el.id === elId ? { ...el, content: html } : el
    );
    updateActiveSlide({ ...activeSlide, elements: nextElements });
  };

  const handleDeleteElement = (elId: string) => {
    const nextElements = activeSlide.elements.filter(el => el.id !== elId);
    updateActiveSlide({ ...activeSlide, elements: nextElements });
    setSelectedElementId(null);
  };

  const handleInsertImageToSlide = async (imageData: { src: string; imageId?: string; alt?: string }) => {
    const { width, height } = await ImageAssetEngine.getImageDimensions(imageData.src);
    const fit = ImageAssetEngine.calculateFitDimensions(width, height, 480, 320);

    const imgEl: CanvasElement = {
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      content: imageData.src,
      transform: {
        x: Math.round((960 - fit.width) / 2),
        y: Math.round((540 - fit.height) / 2),
        width: fit.width,
        height: fit.height,
        rotation: 0,
      },
      style: {
        opacity: 1,
        cornerRadius: 8,
      },
      zIndex: activeSlide.elements.length + 1,
    };

    updateActiveSlide({ ...activeSlide, elements: [...activeSlide.elements, imgEl] });
    setSelectedElementId(imgEl.id);
  };

  const handleReplaceSlideImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;

    const asset = await ImageAssetEngine.storeImage(file);
    const nextEls = activeSlide.elements.map(item =>
      item.id === selectedElementId ? { ...item, content: asset.dataUrl } : item
    );
    updateActiveSlide({ ...activeSlide, elements: nextEls });
    e.target.value = '';
  };

  const handleApplySlideCrop = async (croppedDataUrl: string) => {
    if (!cropTarget) return;
    const asset = await ImageAssetEngine.storeImage(croppedDataUrl, 'Cropped Slide Image');
    const nextEls = activeSlide.elements.map(item =>
      item.id === cropTarget.id ? { ...item, content: asset.dataUrl } : item
    );
    updateActiveSlide({ ...activeSlide, elements: nextEls });
    setCropTarget(null);
  };

  const currentSlideBackground = activeSlide.gradient || activeSlide.background || settings.theme.backgroundColor || '#ffffff';

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] dark:bg-[#090d16] overflow-hidden select-none">
      {/* ── Top Presentation Ribbon Toolbar ─────────────────────────── */}
      <div className="h-11 bg-background/95 backdrop-blur border-b border-border px-4 flex items-center justify-between shrink-0 text-xs z-20">
        {/* Formatting Actions */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap shrink-0">
          {/* Main "+ Add Slide" Button & Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-7 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs">
                <Plus className="h-3.5 w-3.5" /> Add Slide <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 text-xs" align="start">
              <DropdownMenuLabel className="text-xs">Slide Layout Presets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAddSlide('title')}>
                <span>Title Slide</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('title-content')}>
                <span>Title & Content</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('two-columns')}>
                <span>Two Columns</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('section-header')}>
                <span>Section Header</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('image-text')}>
                <span>Image & Text</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('timeline')}>
                <span>Timeline & Roadmap</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('statistics')}>
                <span>Key Metrics & Stats</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('quote')}>
                <span>Quote Slide</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('closing')}>
                <span>Closing / Thank You</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddSlide('blank')}>
                <span>Blank Slide</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border mx-1" />

          {/* History Undo / Redo */}
          <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={handleUndo} disabled={historyIndex === 0} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Insert Elements */}
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleAddTextElement}>
            <Type className="h-3.5 w-3.5" /> Text
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setImageUploadOpen(true)}>
            <ImageIcon className="h-3.5 w-3.5 text-primary" /> Image
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleAddShapeElement('rounded-rectangle')}>
            <Square className="h-3.5 w-3.5" /> Shape
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenChartModal}>
            <BarChart3 className="h-3.5 w-3.5" /> Chart
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenDiagramModal}>
            <GitFork className="h-3.5 w-3.5" /> Diagram
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenQRCodeModal}>
            <QrCode className="h-3.5 w-3.5" /> QR Code
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Modern Gradient Designs Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 border-primary/30 hover:border-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Gradients</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2 text-xs" align="start">
              <DropdownMenuLabel className="text-xs flex items-center justify-between">
                <span>Modern Gradient Styles</span>
                {activeSlide.gradient && (
                  <button
                    type="button"
                    onClick={() => handleClearGradient(false)}
                    className="text-[11px] text-muted-foreground hover:text-destructive transition-colors font-normal"
                  >
                    Remove
                  </button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="grid grid-cols-2 gap-1.5 py-1">
                {PRESENTATION_GRADIENTS.map(g => {
                  const isSelected = activeSlide.gradient === g.gradient;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleApplyGradient(g, false)}
                      className={`h-10 rounded-md p-1.5 flex flex-col justify-end text-left border transition-all relative overflow-hidden group ${isSelected ? 'ring-2 ring-primary border-primary scale-[1.02]' : 'border-border/60 hover:scale-[1.02]'}`}
                      style={{ background: g.gradient }}
                    >
                      <span className="text-[10px] font-semibold truncate z-10" style={{ color: g.headingColor }}>
                        {g.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-black/40 rounded-full p-0.5 z-10">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => activeSlide.gradient && handleApplyGradient(PRESENTATION_GRADIENTS.find(g => g.gradient === activeSlide.gradient) || PRESENTATION_GRADIENTS[0], true)}>
                <span>Apply Current Gradient to All Slides</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleClearGradient(true)}>
                <span>Reset All Slides to Theme Colors</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span>{settings.theme?.name || 'Theme'}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 text-xs">
              <DropdownMenuLabel className="text-xs">Slide Themes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRESENTATION_THEMES.map(th => (
                <DropdownMenuItem
                  key={th.id}
                  onClick={() => handleThemeChange(th)}
                  className="flex items-center justify-between text-xs"
                >
                  <span>{th.name}</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: th.primaryColor }} />
                    <div className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: th.backgroundColor }} />
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Presenter Mode Button */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => setPresenterOpen(true)}
            className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-semibold"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="hidden sm:inline">Present</span>
          </Button>
        </div>
      </div>

      {/* ── Main Presentation Workspace ───────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Desktop Left Thumbnails Rail */}
        <div className="w-60 bg-card border-r border-border hidden md:flex flex-col p-3 overflow-y-auto shrink-0 gap-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
            <span>SLIDES ({validSlides.length})</span>
            <button
              type="button"
              onClick={() => handleAddSlide('title-content')}
              className="text-primary hover:underline flex items-center gap-0.5 text-xs font-medium"
              title="Add New Slide (Ctrl+M)"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>

          {/* List of Slide Thumbnails */}
          {validSlides.map((s, idx) => {
            const isActive = idx === safeActiveIndex;
            const slideBg = s.gradient || s.background || settings.theme?.backgroundColor || '#ffffff';

            return (
              <div
                key={s.id}
                onClick={() => onChangeActiveSlideIndex(idx)}
                className={`group relative rounded-xl border-2 transition-all cursor-pointer p-2 flex flex-col gap-1.5 ${isActive ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-border/70 hover:border-primary/40 bg-card'}`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-muted-foreground">{idx + 1}</span>
                  <span className="truncate max-w-[120px] font-medium text-foreground">{s.title}</span>
                </div>

                {/* Mini Preview Box */}
                <div
                  className="w-full aspect-video rounded-md border border-border/50 overflow-hidden relative p-1.5 shadow-2xs"
                  style={{ background: slideBg }}
                >
                  <div className="text-[8px] font-bold truncate text-foreground/80 drop-shadow-xs">
                    {s.title}
                  </div>
                </div>

                {/* Quick Slide Actions */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 bg-background/90 backdrop-blur rounded-md p-0.5 border border-border transition-opacity shadow-xs">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleMoveSlide(idx, idx - 1); }}
                      className="p-1 hover:text-primary text-muted-foreground"
                      title="Move Up"
                    >
                      <ArrowUp className="h-2.5 w-2.5" />
                    </button>
                  )}
                  {idx < validSlides.length - 1 && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleMoveSlide(idx, idx + 1); }}
                      className="p-1 hover:text-primary text-muted-foreground"
                      title="Move Down"
                    >
                      <ArrowDown className="h-2.5 w-2.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleDuplicateSlide(idx); }}
                    className="p-1 hover:text-primary text-muted-foreground"
                    title="Duplicate Slide"
                  >
                    <Copy className="h-2.5 w-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); handleDeleteSlide(idx); }}
                    disabled={validSlides.length <= 1}
                    className="p-1 hover:text-destructive text-muted-foreground disabled:opacity-30"
                    title="Delete Slide"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Big Add Slide Card at Bottom of Rail */}
          <button
            type="button"
            onClick={() => handleAddSlide('title-content')}
            className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-3 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-all text-xs gap-1 hover:bg-primary/5 mt-1"
          >
            <Plus className="h-4 w-4" />
            <span className="font-semibold">Add New Slide</span>
          </button>
        </div>

        {/* Center Stage & Speaker Notes */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Main Slide Canvas */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div
              className="w-[840px] aspect-video rounded-xl shadow-2xl border border-border/80 relative overflow-hidden transition-all duration-150 group/stage select-text"
              style={{ background: currentSlideBackground }}
              onClick={() => setSelectedElementId(null)}
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
                      left: `${(el.transform.x / 960) * 100}%`,
                      top: `${(el.transform.y / 540) * 100}%`,
                      width: `${(el.transform.width / 960) * 100}%`,
                      height: `${(el.transform.height / 540) * 100}%`,
                      border: isSelected ? '2px solid #2563EB' : '1px solid transparent',
                      cursor: 'text',
                      ...el.style,
                    }}
                    className={`group/el relative ${isSelected ? 'shadow-sm ring-1 ring-primary/40' : ''}`}
                  >
                    {/* Element Content: Image or Editable Text/Shape */}
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
                            transform: el.transform.rotation ? `rotate(${el.transform.rotation}deg)` : undefined,
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleElementContentChange(el.id, e.currentTarget.innerHTML)}
                        dangerouslySetInnerHTML={{ __html: el.content || '' }}
                        className="w-full h-full outline-none"
                      />
                    )}

                    {/* Canva-Style Selection & Transform Handles */}
                    {isSelected && (
                      <>
                        <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />
                        <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />
                        <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />
                        <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white pointer-events-none shadow-xs" />

                        {/* Contextual Action Bar Floating Above Element */}
                        <div
                          className="absolute -top-10 left-0 bg-background/95 backdrop-blur border border-border shadow-lg rounded-md px-1.5 py-1 flex items-center gap-1 z-30 select-none whitespace-nowrap"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Image Specific Actions */}
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
                                onClick={() => {
                                  replaceFileInputRef.current?.click();
                                }}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                                title="Replace Image"
                              >
                                <RefreshCw className="h-3 w-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const nextRotation = ((el.transform.rotation || 0) + 90) % 360;
                                  const nextEls = activeSlide.elements.map(item =>
                                    item.id === el.id ? { ...item, transform: { ...item.transform, rotation: nextRotation } } : item
                                  );
                                  updateActiveSlide({ ...activeSlide, elements: nextEls });
                                }}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                                title="Rotate 90°"
                              >
                                <RotateCw className="h-3 w-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const currentOp = el.style?.opacity ?? 1;
                                  const nextOp = currentOp <= 0.4 ? 1 : currentOp - 0.2;
                                  const nextEls = activeSlide.elements.map(item =>
                                    item.id === el.id ? { ...item, style: { ...item.style, opacity: Number(nextOp.toFixed(1)) } } : item
                                  );
                                  updateActiveSlide({ ...activeSlide, elements: nextEls });
                                }}
                                className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                                title="Adjust Opacity"
                              >
                                <Sliders className="h-3 w-3" />
                              </button>
                            </>
                          )}

                          {/* Layer Order */}
                          <button
                            type="button"
                            onClick={() => {
                              const reordered = ElementEngine.bringForward(activeSlide.elements, el.id);
                              updateActiveSlide({ ...activeSlide, elements: reordered });
                            }}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                            title="Bring Forward"
                          >
                            <ArrowUpSquare className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const reordered = ElementEngine.sendBackward(activeSlide.elements, el.id);
                              updateActiveSlide({ ...activeSlide, elements: reordered });
                            }}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                            title="Send Backward"
                          >
                            <ArrowDownSquare className="h-3 w-3" />
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => {
                              const duplicateEl = {
                                ...el,
                                id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                                transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 },
                              };
                              updateActiveSlide({
                                ...activeSlide,
                                elements: [...activeSlide.elements, duplicateEl],
                              });
                              setSelectedElementId(duplicateEl.id);
                            }}
                            className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground text-xs"
                            title="Duplicate Element (Ctrl+D)"
                          >
                            <Copy className="h-3 w-3" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteElement(el.id)}
                            className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive text-xs"
                            title="Delete Element (Delete)"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Slide Number Badge */}
              <div className="absolute bottom-3 right-4 font-mono text-xs opacity-50 select-none text-foreground">
                {safeActiveIndex + 1} / {validSlides.length}
              </div>
            </div>
          </div>

          {/* Speaker Notes Drawer */}
          {showNotesDrawer && (
            <div className="h-24 sm:h-28 bg-card border-t border-border p-2 sm:p-3 flex flex-col shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                <span className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" /> Speaker Notes (Slide {safeActiveIndex + 1})
                </span>
                <span className="text-[10px] italic hidden sm:inline">Visible only in Presenter Mode</span>
              </div>
              <textarea
                value={activeSlide.speakerNotes || ''}
                onChange={e => updateActiveSlide({ ...activeSlide, speakerNotes: e.target.value })}
                placeholder="Type speaker notes to guide your talk during fullscreen presentation..."
                className="flex-1 bg-muted/40 border border-border rounded-lg p-1.5 sm:p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none font-sans"
              />
            </div>
          )}

          {/* Mobile Bottom Horizontal Carousel (< 768px) */}
          <div className="md:hidden h-20 bg-card border-t border-border flex items-center px-3 gap-2 overflow-x-auto shrink-0 select-none no-scrollbar">
            {validSlides.map((s, idx) => {
              const isActive = idx === safeActiveIndex;
              const slideBg = s.gradient || s.background || settings.theme?.backgroundColor || '#ffffff';
              return (
                <div
                  key={s.id}
                  onClick={() => onChangeActiveSlideIndex(idx)}
                  style={{ background: slideBg }}
                  className={`h-14 aspect-video rounded-lg border-2 shrink-0 p-1 flex flex-col justify-between cursor-pointer transition-all ${
                    isActive ? 'border-primary ring-2 ring-primary/30 scale-105 shadow-md' : 'border-border/70 opacity-70'
                  }`}
                >
                  <span className="text-[9px] font-bold font-mono text-foreground drop-shadow-xs">{idx + 1}</span>
                  <span className="text-[8px] truncate font-medium text-foreground drop-shadow-xs">{s.title}</span>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => handleAddSlide('title-content')}
              className="h-14 aspect-video rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 text-primary flex flex-col items-center justify-center gap-0.5 shrink-0 text-xs font-semibold hover:bg-primary/10 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[9px]">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Presenter Fullscreen Modal */}
      <PresenterModal
        open={presenterOpen}
        onClose={() => setPresenterOpen(false)}
        slides={validSlides}
        initialSlideIndex={safeActiveIndex}
        settings={settings}
      />

      {/* Hidden File Input for Image Replacement */}
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleReplaceSlideImage}
        className="hidden"
      />

      <ImageUploadModal
        open={imageUploadOpen}
        onClose={() => setImageUploadOpen(false)}
        onInsertImage={handleInsertImageToSlide}
      />

      {cropTarget && (
        <ImageCropModal
          open={Boolean(cropTarget)}
          onClose={() => setCropTarget(null)}
          imageSrc={cropTarget.content || ''}
          onApplyCrop={handleApplySlideCrop}
        />
      )}
    </div>
  );
}
