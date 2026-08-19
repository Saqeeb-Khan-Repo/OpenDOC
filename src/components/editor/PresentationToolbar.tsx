import React, { useState } from 'react';
import { Slide, SlideLayout, SlideTheme, PresentationSettings, CanvasElement, ShapeType } from '@/engines/types';
import { PRESENTATION_THEMES, PRESENTATION_GRADIENTS, GradientPreset } from '@/engines/PresentationEngine';
import { ElementEngine } from '@/engines/ElementEngine';
import {
  Play, Plus, Copy, Trash2, Undo2, Redo2, Type, Image as ImageIcon,
  Square, Circle, Triangle, Star, ArrowRight, Minus, MessageSquare,
  BarChart3, GitFork, QrCode, PenTool, Table as TableIcon, Palette,
  Sparkles, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  ArrowUpSquare, ArrowDownSquare, RotateCw, Check, Layout, Sliders,
  Crop, RefreshCw, Layers, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/cn';

interface PresentationToolbarProps {
  activeSlide: Slide;
  selectedElement: CanvasElement | null;
  selectedElements?: CanvasElement[];
  settings: PresentationSettings;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAddSlide: (layout: SlideLayout, gradient?: string) => void;
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (shape: ShapeType) => void;
  onAddTable: (rows?: number, cols?: number) => void;
  onOpenChartModal: () => void;
  onOpenDiagramModal: () => void;
  onOpenQRCodeModal: () => void;
  onOpenSignatureModal?: () => void;
  onOpenThemeModal?: () => void;
  onApplyGradient: (preset: GradientPreset, applyToAll: boolean) => void;
  onClearGradient: (applyToAll: boolean) => void;
  onChangeTheme: (theme: SlideTheme, applyToAll?: boolean) => void;
  onApplyFontToAll: (fontFamily: string) => void;
  onApplyTextColorToAll: (color: string) => void;
  onFormatText: (command: string, value?: string) => void;
  onUpdateSelectedElement: (patch: Partial<CanvasElement>) => void;
  onChangeFontSize?: (size: number) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onAlignElements: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  onPresent: () => void;
}

const FONT_FAMILIES = [
  'Inter', 'Roboto', 'Merriweather', 'Playfair Display',
  'JetBrains Mono', 'Georgia', 'Arial'
];

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

const RECENT_COLORS = ['#000000', '#ffffff', '#2563eb', '#1e3a8a', '#7c3aed', '#db2777', '#dc2626', '#16a34a'];

export function PresentationToolbar({
  activeSlide,
  selectedElement,
  selectedElements,
  settings,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAddSlide,
  onAddText,
  onAddImage,
  onAddShape,
  onAddTable,
  onOpenChartModal,
  onOpenDiagramModal,
  onOpenQRCodeModal,
  onOpenSignatureModal,
  onOpenThemeModal,
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
  onAlignElements,
  onPresent,
}: PresentationToolbarProps) {
  const selectedList = selectedElements && selectedElements.length > 0
    ? selectedElements
    : selectedElement ? [selectedElement] : [];

  const isTextElement = selectedList.some(el => el.type === 'text');
  const isImageElement = selectedList.some(el => el.type === 'image');
  const isShapeElement = selectedList.some(el => el.type === 'shape');

  // Compute effective font size across all selected text elements
  const textElements = selectedList.filter(el => el.type === 'text');
  const fontSizes = textElements.map(el => ElementEngine.getElementFontSize(el));
  const isMixed = fontSizes.length > 1 && !fontSizes.every(s => s === fontSizes[0]);
  const currentFontSize: number | 'Mixed' = isMixed ? 'Mixed' : (fontSizes[0] || (selectedElement ? ElementEngine.getElementFontSize(selectedElement) : 24));
  const [customSizeInput, setCustomSizeInput] = useState<string>('');

  const handleApplySize = (val: number) => {
    const valid = Math.min(144, Math.max(8, Math.round(val)));
    if (isNaN(valid)) return;
    if (onChangeFontSize) {
      onChangeFontSize(valid);
    } else {
      onUpdateSelectedElement({
        style: { ...selectedElement?.style, fontSize: valid },
      });
    }
  };

  return (
    <div className="h-10 bg-background/95 backdrop-blur border-b border-border px-3 hidden md:flex items-center justify-between shrink-0 z-20 select-none overflow-x-auto gap-2">
      {/* ── Left Tools ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* History */}
        <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <Redo2 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* ── CONTEXT 1: TEXT SELECTED ───────────────────────────────────────── */}
        {isTextElement ? (
          <div className="flex items-center gap-1">
            {/* Font Family Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 font-normal max-w-[110px] truncate">
                  <span>{selectedElement?.style?.fontFamily || settings.theme?.bodyFont || 'Inter'}</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 text-xs">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Font Family</DropdownMenuLabel>
                {FONT_FAMILIES.map(f => (
                  <DropdownMenuItem
                    key={f}
                    onClick={() => {
                      onUpdateSelectedElement({ style: { ...selectedElement?.style, fontFamily: f } });
                      onFormatText('fontName', f);
                    }}
                    className="flex justify-between items-center"
                  >
                    <span style={{ fontFamily: f }}>{f}</span>
                    {(selectedElement?.style?.fontFamily || settings.theme?.bodyFont) === f && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onApplyFontToAll(selectedElement?.style?.fontFamily || settings.theme?.bodyFont || 'Inter')}
                  className="text-primary font-semibold flex items-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Apply Font to All Slides</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Font Size Selector (Dropdown + Custom Input) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 font-mono font-semibold min-w-[52px]">
                  <span>{currentFontSize}</span>
                  <ChevronDown className="h-2.5 w-2.5 opacity-60 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-2 text-xs">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Font Size</DropdownMenuLabel>
                
                {/* Custom numeric input */}
                <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border">
                  <span className="text-[10px] text-muted-foreground font-semibold">Custom:</span>
                  <input
                    type="number"
                    min={8}
                    max={144}
                    placeholder={String(currentFontSize)}
                    value={customSizeInput}
                    onChange={e => setCustomSizeInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customSizeInput) {
                        handleApplySize(Number(customSizeInput));
                        setCustomSizeInput('');
                      }
                    }}
                    className="w-14 h-6 px-1.5 text-xs font-mono font-bold bg-background border border-border rounded outline-none focus:border-primary"
                  />
                  <Button
                    size="sm"
                    className="h-6 px-2 text-[10px] font-bold"
                    onClick={() => {
                      if (customSizeInput) {
                        handleApplySize(Number(customSizeInput));
                        setCustomSizeInput('');
                      }
                    }}
                  >
                    Set
                  </Button>
                </div>

                {/* Preset Font Sizes */}
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                  {FONT_SIZES.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleApplySize(sz)}
                      className={cn(
                        'h-7 rounded text-xs font-mono font-medium transition-colors flex items-center justify-center cursor-pointer',
                        currentFontSize === sz
                          ? 'bg-primary text-primary-foreground font-bold'
                          : 'hover:bg-accent text-foreground'
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Basic Text Formatting */}
            <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded border border-border">
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onFormatText('bold')} title="Bold"><Bold className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onFormatText('italic')} title="Italic"><Italic className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onFormatText('underline')} title="Underline"><Underline className="h-3 w-3" /></Button>
            </div>

            {/* Color */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-1 text-xs gap-0.5" title="Color">
                  <span className="font-bold underline" style={{ textDecorationColor: selectedElement?.style?.color || '#2563eb' }}>A</span>
                  <div className="h-2 w-2 rounded-xs" style={{ backgroundColor: selectedElement?.style?.color || '#2563eb' }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 p-2 text-xs">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Text Color</DropdownMenuLabel>
                <div className="grid grid-cols-4 gap-1 py-1">
                  {RECENT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onUpdateSelectedElement({ style: { ...selectedElement?.style, color: c } });
                        onFormatText('foreColor', c);
                      }}
                      style={{ backgroundColor: c }}
                      className="h-6 rounded border border-black/10 hover:scale-110"
                    />
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onApplyTextColorToAll(selectedElement?.style?.color || RECENT_COLORS[2])}
                  className="text-primary font-semibold flex items-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Apply Color to All Slides</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded border border-border">
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onFormatText('justifyLeft')} title="Align Left"><AlignLeft className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onFormatText('justifyCenter')} title="Align Center"><AlignCenter className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => onFormatText('justifyRight')} title="Align Right"><AlignRight className="h-3 w-3" /></Button>
            </div>
          </div>
        ) : isImageElement ? (
          /* ── CONTEXT 2: IMAGE SELECTED ────────────────────────────────────── */
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={onAddImage}>
              <RefreshCw className="h-3 w-3" /> Replace
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => {
                const rot = ((selectedElement?.transform.rotation || 0) + 90) % 360;
                onUpdateSelectedElement({ transform: { ...selectedElement!.transform, rotation: rot } });
              }}
            >
              <RotateCw className="h-3 w-3" /> Rotate 90°
            </Button>
          </div>
        ) : isShapeElement ? (
          /* ── CONTEXT 3: SHAPE SELECTED ────────────────────────────────────── */
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Palette className="h-3 w-3 text-primary" /> Fill
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-2 text-xs">
                <div className="grid grid-cols-4 gap-1">
                  {RECENT_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateSelectedElement({ style: { ...selectedElement?.style, fill: c } })}
                      style={{ backgroundColor: c }}
                      className="h-6 rounded border hover:scale-110"
                    />
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          /* ── CONTEXT 4: DEFAULT (NOTHING SELECTED) ────────────────────────── */
          <div className="flex items-center gap-1">
            {/* Add Slide Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-border font-medium">
                  <Plus className="h-3.5 w-3.5 text-primary" /> Slide <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 text-xs">
                <DropdownMenuItem onClick={() => onAddSlide('title')}>Title Slide</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSlide('title-content')}>Title &amp; Content</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSlide('two-columns')}>Two Columns</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSlide('project-architecture' as SlideLayout)}>Architecture Diagram</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSlide('statistics')}>Key Metrics &amp; Stats</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSlide('closing')}>Closing Slide</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSlide('blank')}>Blank Slide</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Insert Objects */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  <Plus className="h-3 w-3 text-primary" /> Insert <ChevronDown className="h-2.5 w-2.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 text-xs">
                <DropdownMenuItem onClick={onAddText}><Type className="h-3.5 w-3.5 mr-2 text-primary" /> Text Box</DropdownMenuItem>
                <DropdownMenuItem onClick={onAddImage}><ImageIcon className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddShape('rounded-rectangle')}><Square className="h-3.5 w-3.5 mr-2 text-amber-500" /> Rounded Shape</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddTable(3, 3)}><TableIcon className="h-3.5 w-3.5 mr-2 text-purple-500" /> Table</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onOpenChartModal}><BarChart3 className="h-3.5 w-3.5 mr-2 text-cyan-500" /> Chart</DropdownMenuItem>
                <DropdownMenuItem onClick={onOpenDiagramModal}><GitFork className="h-3.5 w-3.5 mr-2 text-indigo-500" /> Diagram</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* ── Right Tools: Theme & Fullscreen Present ──────────────────────────── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Layer / Arrange when element selected */}
        {selectedElement && (
          <div className="flex items-center gap-0.5 mr-1">
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={onBringForward} title="Bring Forward">
              <ArrowUpSquare className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={onSendBackward} title="Send Backward">
              <ArrowDownSquare className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Theme Picker with Apply to All */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Palette className="h-3 w-3 text-primary" />
              <span className="hidden sm:inline">{settings.theme?.name || 'Theme'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Presentation Themes</span>
              {onOpenThemeModal && (
                <button
                  type="button"
                  onClick={onOpenThemeModal}
                  className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> Visual Gallery
                </button>
              )}
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {PRESENTATION_THEMES.map(th => (
                <DropdownMenuItem
                  key={th.id}
                  onClick={() => onChangeTheme(th, true)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full border border-black/20"
                      style={{ backgroundColor: th.primaryColor }}
                    />
                    <span>{th.name}</span>
                  </div>
                  {settings.theme?.id === th.id && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </div>

            {onOpenThemeModal && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onOpenThemeModal}
                  className="text-primary font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Palette className="h-3.5 w-3.5" />
                  <span>Browse Themes with Previews...</span>
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const currentG = PRESENTATION_GRADIENTS.find(g => g.gradient === activeSlide.gradient) || PRESENTATION_GRADIENTS[0];
                onApplyGradient(currentG, true);
              }}
              className="text-primary font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Apply Gradient to All Slides</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Present Button */}
        <Button
          size="sm"
          onClick={onPresent}
          className="h-7 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
          title="Fullscreen Presentation"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Present</span>
        </Button>
      </div>
    </div>
  );
}
