import React, { useState, useEffect } from 'react';
import {
  Slide, SlideLayout, SlideTheme, PresentationSettings,
  CanvasElement, ShapeType
} from '@/engines/types';
import { ElementEngine } from '@/engines/ElementEngine';
import {
  PRESENTATION_THEMES, PRESENTATION_GRADIENTS, GradientPreset
} from '@/engines/PresentationEngine';
import { MobileBottomSheet } from './MobileBottomSheet';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import {
  Play, Plus, Copy, Trash2, Undo2, Redo2, Type, Image as ImageIcon,
  Square, Circle, Triangle, Star, ArrowRight, Layout, Palette,
  Sparkles, AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Italic, Underline,
  ArrowUpSquare, ArrowDownSquare, RotateCw, Check, FileText, Layers,
  ChevronDown, RefreshCw, Crop, Table as TableIcon, BarChart3, GitFork,
  QrCode, Presentation, GraduationCap, Globe, Sliders, Diamond
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface MobilePresentationToolbarProps {
  slides: Slide[];
  activeSlideIndex: number;
  activeSlide: Slide;
  selectedElement: CanvasElement | null;
  selectedElements?: CanvasElement[];
  settings: PresentationSettings;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onChangeActiveSlideIndex: (idx: number) => void;
  onAddSlide: (layout: SlideLayout, gradient?: string) => void;
  onDuplicateSlide: (idx: number) => void;
  onDeleteSlide: (idx: number) => void;
  onLoadProjectDeck: () => void;
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (shape: ShapeType) => void;
  onAddTable: (rows?: number, cols?: number) => void;
  onOpenChartModal: () => void;
  onOpenDiagramModal: () => void;
  onOpenQRCodeModal: () => void;
  onApplyGradient: (preset: GradientPreset, applyToAll: boolean) => void;
  onClearGradient: (applyToAll: boolean) => void;
  onChangeTheme: (theme: SlideTheme, applyToAll?: boolean) => void;
  onApplyFontToAll?: (fontFamily: string) => void;
  onApplyTextColorToAll?: (color: string) => void;
  onFormatText: (command: string, value?: string) => void;
  onUpdateSelectedElement: (patch: Partial<CanvasElement>) => void;
  onChangeFontSize?: (size: number) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDeleteSelectedElement: () => void;
  onChangeSpeakerNotes: (notes: string) => void;
  onPresent: () => void;
}

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Merriweather', 'Playfair Display',
  'JetBrains Mono', 'Georgia', 'Arial'
];

const PRESET_FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];
const RECENT_COLORS = [
  '#000000', '#ffffff', '#2563eb', '#1e3a8a',
  '#7c3aed', '#db2777', '#dc2626', '#16a34a',
  '#f59e0b', '#06b6d4', '#475569', '#334155'
];

export function MobilePresentationToolbar({
  slides,
  activeSlideIndex,
  activeSlide,
  selectedElement,
  selectedElements,
  settings,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onChangeActiveSlideIndex,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onLoadProjectDeck,
  onAddText,
  onAddImage,
  onAddShape,
  onAddTable,
  onOpenChartModal,
  onOpenDiagramModal,
  onOpenQRCodeModal,
  onApplyGradient,
  onClearGradient,
  onChangeTheme,
  onApplyFontToAll,
  onApplyTextColorToAll,
  onFormatText,
  onUpdateSelectedElement,
  onChangeFontSize,
  onBringForward,
  onSendBackward,
  onDeleteSelectedElement,
  onChangeSpeakerNotes,
  onPresent,
}: MobilePresentationToolbarProps) {
  const responsive = useResponsiveEditor();
  const [activeSheet, setActiveSheet] = useState<'text' | 'shape' | 'image' | 'slide' | 'more' | null>(null);

  // Direct Numeric Font Size Input State
  const [customFontSize, setCustomFontSize] = useState<string>(
    String(ElementEngine.getElementFontSize(selectedElement))
  );

  useEffect(() => {
    if (selectedElement) {
      setCustomFontSize(String(ElementEngine.getElementFontSize(selectedElement)));
    }
  }, [selectedElement]);

  const isTextElement = selectedElement?.type === 'text' || selectedElements?.some(e => e.type === 'text');
  const isImageElement = selectedElement?.type === 'image';
  const isShapeElement = selectedElement?.type === 'shape';

  const handleApplyFontSize = (sizeVal: number) => {
    const valid = Math.min(144, Math.max(8, Math.round(sizeVal)));
    if (isNaN(valid)) return;
    setCustomFontSize(String(valid));
    if (onChangeFontSize) {
      onChangeFontSize(valid);
    } else if (selectedElement) {
      onUpdateSelectedElement({
        style: { ...selectedElement.style, fontSize: valid }
      });
    }
  };

  return (
    <div
      className="fixed left-0 right-0 z-40 md:hidden flex flex-col bg-background/98 backdrop-blur-md border-t border-border shadow-2xl transition-all duration-150 select-none"
      style={{
        bottom: `${responsive.keyboardHeight}px`,
        paddingBottom: responsive.isKeyboardOpen ? '4px' : 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {/* ── Contextual Quick Actions Row (Scrollable) ─────────────────────────── */}
      <div className="h-11 px-2 border-b border-border/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap bg-muted/40 shrink-0">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo presentation change"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo presentation change"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 active:scale-95 transition-transform"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="h-5 w-px bg-border mx-0.5" />

        {isTextElement ? (
          <>
            <button
              type="button"
              onClick={() => onFormatText('bold')}
              aria-label="Bold text"
              className="h-9 w-9 rounded-lg font-bold text-xs bg-background border flex items-center justify-center shadow-2xs active:scale-95"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => onFormatText('italic')}
              aria-label="Italic text"
              className="h-9 w-9 rounded-lg italic text-xs bg-background border flex items-center justify-center shadow-2xs active:scale-95"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => onFormatText('underline')}
              aria-label="Underline text"
              className="h-9 w-9 rounded-lg underline text-xs bg-background border flex items-center justify-center shadow-2xs active:scale-95"
            >
              U
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('text')}
              className="h-9 px-3 rounded-lg bg-primary/10 text-primary font-semibold text-xs flex items-center gap-1.5 border border-primary/20 active:scale-95"
            >
              <Palette className="h-3.5 w-3.5" /> Font &amp; Size
            </button>
          </>
        ) : isImageElement ? (
          <>
            <button
              type="button"
              onClick={onAddImage}
              className="h-9 px-3 rounded-lg bg-primary/10 text-primary font-semibold text-xs flex items-center gap-1.5 border border-primary/20"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={() => {
                const rot = ((selectedElement?.transform.rotation || 0) + 90) % 360;
                onUpdateSelectedElement({ transform: { ...selectedElement!.transform, rotation: rot } });
              }}
              className="h-9 px-3 rounded-lg bg-background border text-xs flex items-center gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
            </button>
            <button
              type="button"
              onClick={onDeleteSelectedElement}
              aria-label="Delete image"
              className="h-9 w-9 rounded-lg text-destructive flex items-center justify-center hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : isShapeElement ? (
          <>
            <button
              type="button"
              onClick={() => setActiveSheet('shape')}
              className="h-9 px-3 rounded-lg bg-primary/10 text-primary font-semibold text-xs flex items-center gap-1.5 border border-primary/20"
            >
              <Palette className="h-3.5 w-3.5" /> Color &amp; Style
            </button>
            <button
              type="button"
              onClick={onDeleteSelectedElement}
              aria-label="Delete shape"
              className="h-9 w-9 rounded-lg text-destructive flex items-center justify-center hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground px-2">
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
        )}
      </div>

      {/* ── Main 5-Button Primary Mobile Toolbar: [ Text ] [ Shape ] [ Image ] [ Slide ] [ More ] ── */}
      <div className="h-13 px-2 flex items-center justify-around shrink-0 bg-background">
        <button
          type="button"
          onClick={() => {
            if (!isTextElement) onAddText();
            setActiveSheet('text');
          }}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] h-12 text-xs active:scale-95 transition-all cursor-pointer rounded-xl',
            activeSheet === 'text' || isTextElement ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Text tool"
        >
          <Type className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('shape')}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] h-12 text-xs active:scale-95 transition-all cursor-pointer rounded-xl',
            activeSheet === 'shape' || isShapeElement ? 'text-amber-500 font-bold bg-amber-500/10' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Shape tool"
        >
          <Square className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Shape</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isImageElement) onAddImage();
            setActiveSheet('image');
          }}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] h-12 text-xs active:scale-95 transition-all cursor-pointer rounded-xl',
            activeSheet === 'image' || isImageElement ? 'text-emerald-500 font-bold bg-emerald-500/10' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Image tool"
        >
          <ImageIcon className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('slide')}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] h-12 text-xs active:scale-95 transition-all cursor-pointer rounded-xl',
            activeSheet === 'slide' ? 'text-blue-500 font-bold bg-blue-500/10' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Slide management"
        >
          <Presentation className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Slide</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('more')}
          className={cn(
            'flex flex-col items-center justify-center min-w-[56px] h-12 text-xs active:scale-95 transition-all cursor-pointer rounded-xl',
            activeSheet === 'more' ? 'text-purple-500 font-bold bg-purple-500/10' : 'text-muted-foreground hover:text-foreground'
          )}
          aria-label="More options"
        >
          <Sliders className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>

      {/* ── 1. TEXT EDITING BOTTOM SHEET (FONT, SIZE, BOLD, COLOR, ALIGNMENT) ── */}
      <MobileBottomSheet
        open={activeSheet === 'text'}
        onClose={() => setActiveSheet(null)}
        title="Text &amp; Typography"
      >
        <div className="space-y-4">
          {/* Direct Numeric Font Size Input & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Font Size</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium">Custom:</span>
                <Input
                  type="number"
                  min="8"
                  max="144"
                  value={customFontSize}
                  onChange={e => {
                    setCustomFontSize(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      handleApplyFontSize(val);
                    }
                  }}
                  className="w-16 h-7 text-xs font-bold text-center px-1"
                />
                <span className="text-[10px] text-muted-foreground">px</span>
              </div>
            </div>

            {/* Presets Grid: 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96 */}
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5">
              {PRESET_FONT_SIZES.map(sz => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleApplyFontSize(sz)}
                  className={cn(
                    'h-8 rounded-lg border text-xs font-semibold flex items-center justify-center transition-all',
                    Number(customFontSize) === sz ? 'bg-primary text-white border-primary shadow-xs' : 'bg-card border-border hover:bg-muted'
                  )}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family Picker */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Font Family</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {FONT_FAMILIES.map(ff => (
                <button
                  key={ff}
                  type="button"
                  onClick={() => {
                    if (selectedElement) {
                      onUpdateSelectedElement({ style: { ...selectedElement.style, fontFamily: ff } });
                    } else {
                      onFormatText('fontName', ff);
                    }
                  }}
                  style={{ fontFamily: ff }}
                  className={cn(
                    'p-2 rounded-lg border text-xs text-left truncate transition-all',
                    selectedElement?.style?.fontFamily === ff ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-border bg-card'
                  )}
                >
                  {ff}
                </button>
              ))}
            </div>
          </div>

          {/* Formatting Controls: Bold, Italic, Underline */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Formatting</span>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFormatText('bold')}
                className="h-10 text-xs font-bold gap-1.5"
              >
                <Bold className="h-4 w-4" /> Bold
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFormatText('italic')}
                className="h-10 text-xs italic gap-1.5"
              >
                <Italic className="h-4 w-4" /> Italic
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFormatText('underline')}
                className="h-10 text-xs underline gap-1.5"
              >
                <Underline className="h-4 w-4" /> Underline
              </Button>
            </div>
          </div>

          {/* Alignment */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Alignment</span>
            <div className="grid grid-cols-4 gap-1.5">
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyLeft')} className="h-9 text-xs">
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyCenter')} className="h-9 text-xs">
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyRight')} className="h-9 text-xs">
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyFull')} className="h-9 text-xs">
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Text Colors */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Text Color</span>
            <div className="grid grid-cols-6 gap-1.5">
              {RECENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    if (selectedElement) {
                      onUpdateSelectedElement({ style: { ...selectedElement.style, color: c } });
                    } else {
                      onFormatText('foreColor', c);
                    }
                  }}
                  style={{ backgroundColor: c }}
                  className="h-8 rounded-lg border border-black/10 hover:scale-105 active:scale-95 transition-transform"
                />
              ))}
            </div>
          </div>

          {onApplyFontToAll && (
            <div className="pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onApplyFontToAll(selectedElement?.style?.fontFamily || 'Inter');
                  setActiveSheet(null);
                }}
                className="w-full text-xs h-9 gap-1.5 text-primary border-primary/30"
              >
                <Globe className="h-3.5 w-3.5" /> Apply Current Font to All Slides
              </Button>
            </div>
          )}
        </div>
      </MobileBottomSheet>

      {/* ── 2. SHAPE BOTTOM SHEET ────────────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'shape'}
        onClose={() => setActiveSheet(null)}
        title="Shapes &amp; Geometry"
      >
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Add Shape</span>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <Button variant="outline" className="h-11 flex-col gap-1 text-[11px]" onClick={() => { onAddShape('rectangle'); setActiveSheet(null); }}>
                <Square className="h-4 w-4 text-blue-500" /> Rectangle
              </Button>
              <Button variant="outline" className="h-11 flex-col gap-1 text-[11px]" onClick={() => { onAddShape('rounded-rectangle'); setActiveSheet(null); }}>
                <Square className="h-4 w-4 text-indigo-500 rounded-md" /> Rounded
              </Button>
              <Button variant="outline" className="h-11 flex-col gap-1 text-[11px]" onClick={() => { onAddShape('circle'); setActiveSheet(null); }}>
                <Circle className="h-4 w-4 text-emerald-500" /> Circle
              </Button>
              <Button variant="outline" className="h-11 flex-col gap-1 text-[11px]" onClick={() => { onAddShape('triangle'); setActiveSheet(null); }}>
                <Triangle className="h-4 w-4 text-amber-500" /> Triangle
              </Button>
              <Button variant="outline" className="h-11 flex-col gap-1 text-[11px]" onClick={() => { onAddShape('star'); setActiveSheet(null); }}>
                <Star className="h-4 w-4 text-purple-500" /> Star
              </Button>
              <Button variant="outline" className="h-11 flex-col gap-1 text-[11px]" onClick={() => { onAddShape('diamond'); setActiveSheet(null); }}>
                <Diamond className="h-4 w-4 text-rose-500" /> Diamond
              </Button>
            </div>
          </div>

          {isShapeElement && selectedElement && (
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Shape Fill Color</span>
              <div className="grid grid-cols-6 gap-1.5">
                {RECENT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateSelectedElement({ style: { ...selectedElement.style, fill: c } })}
                    style={{ backgroundColor: c }}
                    className="h-8 rounded-lg border border-black/10 hover:scale-105 active:scale-95 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </MobileBottomSheet>

      {/* ── 3. IMAGE BOTTOM SHEET ────────────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'image'}
        onClose={() => setActiveSheet(null)}
        title="Image &amp; Media"
      >
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 font-semibold text-xs"
            onClick={() => { onAddImage(); setActiveSheet(null); }}
          >
            <ImageIcon className="h-5 w-5 text-emerald-500" /> Upload Image / Camera
          </Button>

          {isImageElement && selectedElement && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                className="w-full h-10 justify-start gap-2 text-xs"
                onClick={() => {
                  const rot = ((selectedElement.transform.rotation || 0) + 90) % 360;
                  onUpdateSelectedElement({ transform: { ...selectedElement.transform, rotation: rot } });
                }}
              >
                <RotateCw className="h-4 w-4 text-primary" /> Rotate 90°
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 justify-start gap-2 text-xs text-destructive hover:bg-destructive/10"
                onClick={() => { onDeleteSelectedElement(); setActiveSheet(null); }}
              >
                <Trash2 className="h-4 w-4" /> Delete Image
              </Button>
            </div>
          )}
        </div>
      </MobileBottomSheet>

      {/* ── 4. SLIDE MANAGEMENT BOTTOM SHEET ─────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'slide'}
        onClose={() => setActiveSheet(null)}
        title={`Slide Deck (${slides.length} Slides)`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={() => { onAddSlide('title-content'); setActiveSheet(null); }}
              className="text-xs font-semibold h-10 gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Blank Slide
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { onLoadProjectDeck(); setActiveSheet(null); }}
              className="text-xs font-semibold h-10 gap-1.5 text-primary border-primary/30"
            >
              <GraduationCap className="h-4 w-4" /> 10-Slide Deck Preset
            </Button>
          </div>

          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">All Slides</span>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
              {slides.map((s, idx) => (
                <div
                  key={s.id || idx}
                  onClick={() => { onChangeActiveSlideIndex(idx); setActiveSheet(null); }}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all',
                    activeSlideIndex === idx ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold font-mono text-xs">Slide {idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDuplicateSlide(idx); }}
                        className="text-muted-foreground hover:text-foreground p-1"
                        title="Duplicate"
                        aria-label="Duplicate slide"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onDeleteSlide(idx); }}
                          className="text-destructive p-1"
                          title="Delete"
                          aria-label="Delete slide"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">{s.title || `Slide ${idx + 1}`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobileBottomSheet>

      {/* ── 5. MORE OPTIONS BOTTOM SHEET ─────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'more'}
        onClose={() => setActiveSheet(null)}
        title="More Presentation Tools"
      >
        <div className="space-y-4 text-xs">
          {/* Themes with Visual Previews (2-Column Mobile Grid) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Themes (All Slides)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESENTATION_THEMES.map(th => {
                const isSelected = settings.theme?.id === th.id;
                const isGrad = !!th.gradientBackground;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onChangeTheme(th, true)}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs text-left transition-all relative overflow-hidden flex flex-col justify-between h-24 cursor-pointer',
                      isSelected ? 'border-primary ring-2 ring-primary/40 bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                    )}
                    style={{
                      background: isGrad ? th.gradientBackground : th.backgroundColor,
                      color: th.textColor,
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs" style={{ fontFamily: th.headingFont, color: isGrad ? '#ffffff' : th.primaryColor }}>
                          {th.name}
                        </span>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] block opacity-70 font-mono mt-0.5" style={{ fontFamily: th.bodyFont }}>
                        {th.headingFont}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-auto pt-1 border-t border-black/10 dark:border-white/10">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: th.primaryColor }} />
                      {th.secondaryColor && <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: th.secondaryColor }} />}
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: th.accentColor }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gradients */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">Slide Gradients</span>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESENTATION_GRADIENTS.slice(0, 6).map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onApplyGradient(g, false)}
                  style={{ background: g.gradient }}
                  className="h-10 rounded-xl border text-[10px] font-bold text-white p-1 text-left truncate shadow-2xs"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Insert Visuals & Present */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
            <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onAddTable(3, 3); setActiveSheet(null); }}>
              <TableIcon className="h-4 w-4 text-purple-500" /> Insert Table
            </Button>
            <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onOpenChartModal(); setActiveSheet(null); }}>
              <BarChart3 className="h-4 w-4 text-cyan-500" /> Insert Chart
            </Button>
            <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onOpenDiagramModal(); setActiveSheet(null); }}>
              <GitFork className="h-4 w-4 text-indigo-500" /> Insert Flowchart
            </Button>
            <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onOpenQRCodeModal(); setActiveSheet(null); }}>
              <QrCode className="h-4 w-4 text-amber-500" /> QR Code
            </Button>
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              className="w-full h-11 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => { setActiveSheet(null); onPresent(); }}
            >
              <Play className="h-4 w-4 fill-current" /> Start Fullscreen Presentation
            </Button>
          </div>
        </div>
      </MobileBottomSheet>
    </div>
  );
}
