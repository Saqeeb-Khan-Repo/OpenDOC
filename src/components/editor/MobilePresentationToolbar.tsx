import React, { useState } from 'react';
import {
  Slide, SlideLayout, SlideTheme, PresentationSettings,
  CanvasElement, ShapeType
} from '@/engines/types';
import {
  PRESENTATION_THEMES, PRESENTATION_GRADIENTS, GradientPreset
} from '@/engines/PresentationEngine';
import { MobileBottomSheet } from './MobileBottomSheet';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import {
  Play, Plus, Copy, Trash2, Undo2, Redo2, Type, Image as ImageIcon,
  Square, Circle, Triangle, Star, ArrowRight, Layout, Palette,
  Sparkles, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  ArrowUpSquare, ArrowDownSquare, RotateCw, Check, FileText, Layers,
  ChevronDown, RefreshCw, Crop, Table as TableIcon, BarChart3, GitFork,
  QrCode, Presentation, GraduationCap, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface MobilePresentationToolbarProps {
  slides: Slide[];
  activeSlideIndex: number;
  activeSlide: Slide;
  selectedElement: CanvasElement | null;
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

const PRESET_FONT_SIZES = [14, 18, 24, 32, 40, 48, 64];
const RECENT_COLORS = ['#000000', '#ffffff', '#2563eb', '#1e3a8a', '#7c3aed', '#db2777', '#dc2626', '#16a34a'];

export function MobilePresentationToolbar({
  slides,
  activeSlideIndex,
  activeSlide,
  selectedElement,
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
  onBringForward,
  onSendBackward,
  onDeleteSelectedElement,
  onChangeSpeakerNotes,
  onPresent,
}: MobilePresentationToolbarProps) {
  const responsive = useResponsiveEditor();
  const [activeSheet, setActiveSheet] = useState<
    'slides' | 'text' | 'insert' | 'style' | 'notes' | 'element' | null
  >(null);

  const isTextElement = selectedElement?.type === 'text';
  const isImageElement = selectedElement?.type === 'image';
  const isShapeElement = selectedElement?.type === 'shape';

  return (
    <div
      className="fixed left-0 right-0 z-40 md:hidden flex flex-col bg-background/95 backdrop-blur-md border-t border-border shadow-2xl transition-all duration-150 select-none"
      style={{
        bottom: `${responsive.keyboardHeight}px`,
        paddingBottom: responsive.isKeyboardOpen ? '4px' : 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {/* ── Contextual Quick Actions Row (Scrollable) ─────────────────────────── */}
      <div className="h-10 px-2 border-b border-border/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap bg-muted/30 shrink-0">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="h-4 w-px bg-border mx-0.5" />

        {isTextElement ? (
          <>
            <button
              type="button"
              onClick={() => onFormatText('bold')}
              className="h-8 w-8 rounded-lg font-bold text-xs bg-background border flex items-center justify-center"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => onFormatText('italic')}
              className="h-8 w-8 rounded-lg italic text-xs bg-background border flex items-center justify-center"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => setActiveSheet('text')}
              className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary font-semibold text-xs flex items-center gap-1"
            >
              <Palette className="h-3.5 w-3.5" /> Typography &amp; Color
            </button>
          </>
        ) : isImageElement ? (
          <>
            <button
              type="button"
              onClick={onAddImage}
              className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary font-semibold text-xs flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replace
            </button>
            <button
              type="button"
              onClick={() => {
                const rot = ((selectedElement?.transform.rotation || 0) + 90) % 360;
                onUpdateSelectedElement({ transform: { ...selectedElement!.transform, rotation: rot } });
              }}
              className="h-8 px-2.5 rounded-lg bg-background border text-xs flex items-center gap-1"
            >
              <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
            </button>
            <button
              type="button"
              onClick={onDeleteSelectedElement}
              className="h-8 w-8 rounded-lg text-destructive flex items-center justify-center"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <span className="text-[11px] font-medium text-muted-foreground px-2">
            Slide {activeSlideIndex + 1} of {slides.length}
          </span>
        )}
      </div>

      {/* ── Main 5-Button Touch Navigation Bar ───────────────────────────────── */}
      <div className="h-12 px-2 flex items-center justify-around shrink-0">
        <button
          type="button"
          onClick={() => setActiveSheet('slides')}
          className="flex flex-col items-center justify-center min-w-[56px] h-11 text-xs text-muted-foreground hover:text-foreground active:scale-95"
        >
          <Presentation className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-semibold mt-0.5">Slides</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('insert')}
          className="flex flex-col items-center justify-center min-w-[56px] h-11 text-xs text-muted-foreground hover:text-foreground active:scale-95"
        >
          <Plus className="h-4 w-4 text-emerald-500" />
          <span className="text-[10px] font-semibold mt-0.5">Insert</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('style')}
          className="flex flex-col items-center justify-center min-w-[56px] h-11 text-xs text-muted-foreground hover:text-foreground active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="text-[10px] font-semibold mt-0.5">Theme</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('notes')}
          className="flex flex-col items-center justify-center min-w-[56px] h-11 text-xs text-muted-foreground hover:text-foreground active:scale-95"
        >
          <FileText className="h-4 w-4 text-blue-500" />
          <span className="text-[10px] font-semibold mt-0.5">Notes</span>
        </button>

        <button
          type="button"
          onClick={onPresent}
          className="flex flex-col items-center justify-center min-w-[56px] h-11 text-xs text-emerald-600 font-bold active:scale-95"
        >
          <Play className="h-4 w-4 fill-current" />
          <span className="text-[10px] font-bold mt-0.5">Present</span>
        </button>
      </div>

      {/* ── 1. SLIDES NAVIGATOR BOTTOM SHEET ─────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'slides'}
        onClose={() => setActiveSheet(null)}
        title={`Slide Deck (${slides.length} Slides)`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => { onAddSlide('title-content'); setActiveSheet(null); }}
              className="flex-1 text-xs font-semibold h-9 gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Blank Slide
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => { onLoadProjectDeck(); setActiveSheet(null); }}
              className="flex-1 text-xs font-semibold h-9 gap-1 text-primary"
            >
              <GraduationCap className="h-3.5 w-3.5" /> 10-Slide Project Deck
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1">
            {slides.map((s, idx) => (
              <div
                key={s.id || idx}
                onClick={() => { onChangeActiveSlideIndex(idx); setActiveSheet(null); }}
                className={cn(
                  'p-2 rounded-xl border text-xs cursor-pointer flex flex-col justify-between transition-all',
                  activeSlideIndex === idx ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border bg-card'
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold font-mono text-[11px]">Slide {idx + 1}</span>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDeleteSlide(idx); }}
                      className="text-destructive p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate">{s.title || `Slide ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      </MobileBottomSheet>

      {/* ── 2. INSERT OBJECTS BOTTOM SHEET ───────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'insert'}
        onClose={() => setActiveSheet(null)}
        title="Insert onto Slide"
      >
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onAddText(); setActiveSheet(null); }}>
            <Type className="h-4 w-4 text-primary" /> Text Box
          </Button>
          <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onAddImage(); setActiveSheet(null); }}>
            <ImageIcon className="h-4 w-4 text-emerald-500" /> Photo / Image
          </Button>
          <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onAddShape('rounded-rectangle'); setActiveSheet(null); }}>
            <Square className="h-4 w-4 text-amber-500" /> Shape (Rounded)
          </Button>
          <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onAddTable(3, 3); setActiveSheet(null); }}>
            <TableIcon className="h-4 w-4 text-purple-500" /> Table (3x3)
          </Button>
          <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onOpenChartModal(); setActiveSheet(null); }}>
            <BarChart3 className="h-4 w-4 text-cyan-500" /> Chart
          </Button>
          <Button variant="outline" className="h-10 justify-start gap-2" onClick={() => { onOpenDiagramModal(); setActiveSheet(null); }}>
            <GitFork className="h-4 w-4 text-indigo-500" /> Flowchart / Diagram
          </Button>
        </div>
      </MobileBottomSheet>

      {/* ── 3. STYLE & THEME BOTTOM SHEET (WITH APPLY TO ALL) ───────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'style'}
        onClose={() => setActiveSheet(null)}
        title="Slide Design &amp; Themes"
      >
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-muted-foreground">THEMES</span>
              <span className="text-[10px] text-primary font-semibold">Applies to all slides</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESENTATION_THEMES.map(th => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => onChangeTheme(th, true)}
                  className={cn(
                    'p-2 rounded-lg border text-xs font-semibold transition-all text-center truncate',
                    settings.theme?.id === th.id ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  )}
                >
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-muted-foreground">GRADIENTS</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PRESENTATION_GRADIENTS.slice(0, 6).map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onApplyGradient(g, false)}
                  style={{ background: g.gradient }}
                  className="h-9 rounded-lg border text-[10px] font-bold text-white p-1 text-left truncate shadow-xs"
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const currentG = PRESENTATION_GRADIENTS.find(g => g.gradient === activeSlide.gradient) || PRESENTATION_GRADIENTS[0];
              onApplyGradient(currentG, true);
              setActiveSheet(null);
            }}
            className="w-full text-xs h-9 gap-1.5 text-primary border-primary/30"
          >
            <Globe className="h-3.5 w-3.5" /> Apply Current Gradient to All Slides
          </Button>
        </div>
      </MobileBottomSheet>

      {/* ── 4. SPEAKER NOTES BOTTOM SHEET ────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'notes'}
        onClose={() => setActiveSheet(null)}
        title="Speaker Notes"
      >
        <div className="space-y-2">
          <textarea
            value={activeSlide.speakerNotes || ''}
            onChange={e => onChangeSpeakerNotes(e.target.value)}
            placeholder="Type presentation talking points and speaker notes here..."
            className="w-full h-36 text-xs p-3 rounded-xl border border-border bg-background outline-none resize-none focus:border-primary"
          />
          <Button size="sm" onClick={() => setActiveSheet(null)} className="w-full text-xs h-9">
            Save Notes
          </Button>
        </div>
      </MobileBottomSheet>

      {/* ── 5. TYPOGRAPHY & COLOR SHEET (WITH APPLY TO ALL) ─────────────────── */}
      <MobileBottomSheet
        open={activeSheet === 'text'}
        onClose={() => setActiveSheet(null)}
        title="Text Formatting"
      >
        <div className="space-y-3">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">TEXT COLOR</span>
            <div className="grid grid-cols-4 gap-1.5">
              {RECENT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onFormatText('foreColor', c)}
                  style={{ backgroundColor: c }}
                  className="h-8 rounded-lg border hover:scale-105"
                />
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-muted-foreground block mb-1.5">ALIGNMENT</span>
            <div className="grid grid-cols-3 gap-1.5">
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyLeft')} className="h-8 text-xs gap-1">
                <AlignLeft className="h-3.5 w-3.5" /> Left
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyCenter')} className="h-8 text-xs gap-1">
                <AlignCenter className="h-3.5 w-3.5" /> Center
              </Button>
              <Button variant="outline" size="sm" onClick={() => onFormatText('justifyRight')} className="h-8 text-xs gap-1">
                <AlignRight className="h-3.5 w-3.5" /> Right
              </Button>
            </div>
          </div>

          {onApplyFontToAll && (
            <div className="pt-2 border-t border-border flex flex-col gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onApplyFontToAll(settings.theme?.bodyFont || 'Inter');
                  setActiveSheet(null);
                }}
                className="w-full text-xs h-8 gap-1.5 text-primary border-primary/30"
              >
                <Globe className="h-3.5 w-3.5" /> Apply Font ({settings.theme?.bodyFont || 'Inter'}) to All Slides
              </Button>
            </div>
          )}
        </div>
      </MobileBottomSheet>
    </div>
  );
}
