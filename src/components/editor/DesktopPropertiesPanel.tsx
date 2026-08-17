import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Sliders, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Palette, Highlighter, ChevronRight, ChevronLeft, Layout,
  RotateCw, Crop, RefreshCw, Trash2, Plus, Minus, Square,
  Frame, SplitSquareVertical, Sparkles, Check, FileText
} from 'lucide-react';
import { PageSettings, PageSize, PageOrientation, PageBorderSettings } from '@/engines/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/utils/cn';

interface DesktopPropertiesPanelProps {
  editor: Editor | null;
  pageSettings: PageSettings;
  onChangePageSettings: (settings: PageSettings) => void;
  onOpenImageUploadModal?: () => void;
}

const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { name: 'Comic Neue', value: '"Comic Neue", cursive' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
];

const PRESET_FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48];

const TEXT_COLORS = [
  '#000000', '#1f2937', '#4b5563', '#9ca3af',
  '#dc2626', '#ea580c', '#d97706', '#16a34a',
  '#2563eb', '#7c3aed', '#db2777', '#0891b2'
];

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bae6fd', '#fca5a5',
  '#ddd6fe', '#fbcfe8', '#fed7aa', '#d1fae5'
];

const PAGE_BORDER_PRESETS = [
  { name: 'Academic Double', style: 'double' as const, width: 4, color: '#1e3a8a', inset: 16, applyTo: 'all' as const },
  { name: 'Modern Box', style: 'solid' as const, width: 2, color: '#334155', inset: 14, applyTo: 'all' as const },
  { name: 'Certificate Gold', style: 'double' as const, width: 5, color: '#b45309', inset: 16, applyTo: 'first-page-only' as const },
  { name: 'Executive Ridge', style: 'ridge' as const, width: 4, color: '#0f172a', inset: 16, applyTo: 'all' as const },
  { name: 'Minimal Dashed', style: 'dashed' as const, width: 1.5, color: '#64748b', inset: 14, applyTo: 'all' as const },
];

export function DesktopPropertiesPanel({
  editor,
  pageSettings,
  onChangePageSettings,
  onOpenImageUploadModal,
}: DesktopPropertiesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Context Detection
  const isImageSelected = !!editor?.isActive('resizableImage');
  const isTableSelected = !!editor?.isActive('table');
  const isTextSelected = !!editor && !editor.state.selection.empty && !isImageSelected && !isTableSelected;

  // Font size helper
  const currentSizeAttr = editor?.getAttributes('textStyle').fontSize || '';
  const currentFontSize = parseInt(currentSizeAttr.replace('px', ''), 10) || 16;

  const handleStepFontSize = (delta: number) => {
    if (!editor) return;
    const next = Math.max(8, Math.min(144, currentFontSize + delta));
    editor.chain().focus().setMark('textStyle', { fontSize: `${next}px` }).run();
  };

  const handleSetFontSize = (size: number) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
  };

  const handleSetFontFamily = (family: string) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(family).run();
  };

  const handleSetTextColor = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
  };

  const handleSetHighlight = (color: string) => {
    if (!editor) return;
    editor.chain().focus().setHighlight({ color }).run();
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

  const handleApplyBorderPreset = (preset: typeof PAGE_BORDER_PRESETS[0]) => {
    onChangePageSettings({
      ...pageSettings,
      border: {
        enabled: true,
        ...preset,
      },
    });
  };

  if (isCollapsed) {
    return (
      <div className="hidden xl:flex flex-col items-center py-3 px-1 border-l border-border bg-card/60 w-11 shrink-0 select-none z-10">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-4"
          title="Expand Properties Inspector"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-primary font-bold bg-primary/10"
          title="Inspector"
        >
          <Sliders className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col border-l border-border bg-card/80 backdrop-blur-xs w-68 shrink-0 select-none z-10 text-xs overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="h-10 px-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
        <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-primary" />
          {isImageSelected ? 'Image Properties' : isTableSelected ? 'Table Properties' : isTextSelected ? 'Typography' : 'Page & Layout'}
        </span>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Collapse Panel"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* ── Context 1: Image Selected ────────────────────────────────────── */}
        {isImageSelected && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">WIDTH PRESETS</label>
              <div className="grid grid-cols-4 gap-1">
                {['25%', '50%', '75%', '100%'].map(w => (
                  <Button
                    key={w}
                    type="button"
                    variant={editor?.getAttributes('resizableImage').width === w ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs font-semibold"
                    onClick={() => editor?.chain().focus().updateAttributes('resizableImage', { width: w }).run()}
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">ALIGNMENT</label>
              <div className="grid grid-cols-3 gap-1">
                {(['left', 'center', 'right'] as const).map(a => (
                  <Button
                    key={a}
                    type="button"
                    variant={editor?.getAttributes('resizableImage').align === a ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs capitalize"
                    onClick={() => editor?.chain().focus().updateAttributes('resizableImage', { align: a }).run()}
                  >
                    {a}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">ACTIONS</label>
              <div className="flex flex-col gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenImageUploadModal?.()}
                  className="w-full justify-start gap-1.5 text-xs h-8"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-primary" /> Replace Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = Number(editor?.getAttributes('resizableImage').rotate) || 0;
                    editor?.chain().focus().updateAttributes('resizableImage', { rotate: (current + 90) % 360 }).run();
                  }}
                  className="w-full justify-start gap-1.5 text-xs h-8"
                >
                  <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().deleteSelection().run()}
                  className="w-full justify-start gap-1.5 text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Image
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Context 2: Table Selected ────────────────────────────────────── */}
        {isTableSelected && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">ROWS &amp; COLUMNS</label>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => editor?.chain().focus().addRowAfter().run()}
                >
                  <Plus className="h-3 w-3 text-primary" /> Add Row
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1"
                  onClick={() => editor?.chain().focus().addColumnAfter().run()}
                >
                  <Plus className="h-3 w-3 text-primary" /> Add Column
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground"
                  onClick={() => editor?.chain().focus().deleteRow().run()}
                >
                  <Minus className="h-3 w-3" /> Remove Row
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground"
                  onClick={() => editor?.chain().focus().deleteColumn().run()}
                >
                  <Minus className="h-3 w-3" /> Remove Column
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => editor?.chain().focus().deleteTable().run()}
              className="w-full text-destructive hover:bg-destructive/10 h-8 gap-1.5 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Entire Table
            </Button>
          </div>
        )}

        {/* ── Context 3: Text / Typography (Always active or fallback) ─────── */}
        <div className="space-y-4 pt-1">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">FONT FAMILY</label>
            <div className="grid grid-cols-2 gap-1">
              {FONT_FAMILIES.slice(0, 6).map(f => (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => handleSetFontFamily(f.value)}
                  className="px-2 py-1.5 rounded-md border border-border bg-background hover:bg-accent text-left text-xs font-semibold truncate transition-colors"
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">FONT SIZE</label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8"
                onClick={() => handleStepFontSize(-2)}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-mono font-bold text-xs w-10 text-center text-foreground">{currentFontSize}px</span>
              <Button
                variant="outline"
                size="icon-sm"
                className="h-8 w-8"
                onClick={() => handleStepFontSize(2)}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <div className="flex items-center gap-0.5 ml-auto">
                {[12, 14, 16, 20, 24].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSetFontSize(s)}
                    className={cn(
                      'h-7 w-7 rounded text-[11px] font-bold transition-colors',
                      currentFontSize === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">TEXT COLOR</label>
            <div className="grid grid-cols-6 gap-1">
              {TEXT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSetTextColor(c)}
                  style={{ backgroundColor: c }}
                  className="h-6 w-full rounded border border-black/10 dark:border-white/10 hover:scale-110 transition-transform"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">HIGHLIGHT COLOR</label>
            <div className="grid grid-cols-4 gap-1">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSetHighlight(c)}
                  style={{ backgroundColor: c }}
                  className="h-6 w-full rounded border border-black/10 hover:scale-110 transition-transform"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Context 4: Page Layout Settings ──────────────────────────────── */}
        <div className="border-t border-border pt-4 space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">PAGE SIZE &amp; ORIENTATION</label>
            <div className="grid grid-cols-2 gap-1.5 mb-1.5">
              {(['A4', 'Letter', 'A5', 'Legal'] as PageSize[]).map(s => (
                <Button
                  key={s}
                  type="button"
                  variant={pageSettings.size === s ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => onChangePageSettings({ ...pageSettings, size: s })}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant={pageSettings.orientation === 'portrait' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => onChangePageSettings({ ...pageSettings, orientation: 'portrait' })}
              >
                Portrait
              </Button>
              <Button
                type="button"
                variant={pageSettings.orientation === 'landscape' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => onChangePageSettings({ ...pageSettings, orientation: 'landscape' })}
              >
                Landscape
              </Button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">PAGE MARGINS</label>
            <div className="grid grid-cols-3 gap-1">
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleSetMargins('normal')}>
                Normal
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleSetMargins('narrow')}>
                Narrow
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleSetMargins('wide')}>
                Wide
              </Button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">PAGE BORDER FRAME</label>
            <div className="space-y-1">
              {PAGE_BORDER_PRESETS.slice(0, 3).map(p => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyBorderPreset(p)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-accent text-xs font-semibold flex items-center justify-between"
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] text-muted-foreground">{p.style}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
