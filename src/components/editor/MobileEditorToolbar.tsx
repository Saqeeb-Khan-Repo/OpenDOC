import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, ListChecks, Type, Image as ImageIcon,
  Table as TableIcon, Layout, MoreHorizontal, Plus, Trash2,
  Minus, Rows, Columns, RotateCw, Crop, RefreshCw,
  Palette, Highlighter, ChevronRight, Check, Sparkles,
  Calculator, GitFork, QrCode, PenTool, GraduationCap,
  Search, Hash, ShieldCheck, ListTree, History, Download,
  Printer, Square, Frame, SplitSquareVertical, ArrowUp, ArrowDown
} from 'lucide-react';
import { MobileBottomSheet } from './MobileBottomSheet';
import { PageSettings, PageSize, PageOrientation, PageBorderSettings } from '@/engines/types';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import { cn } from '@/utils/cn';

const FONT_FAMILIES = [
  { name: 'Inter (Default)', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { name: 'Comic Neue', value: '"Comic Neue", cursive' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
];

const PRESET_FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64];

const TEXT_COLORS = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#EF4444', '#F97316',
  '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4',
];

const HIGHLIGHT_COLORS = [
  '#FEF08A', '#BBF7D0', '#BAE6FD', '#FCA5A5', '#DDD6FE', '#FBCFE8',
  '#FED7AA', '#D1FAE5', '#CFFAFE', '#FCE7F3',
];

interface MobileEditorToolbarProps {
  editor: Editor | null;
  pageSettings?: PageSettings;
  onChangePageSettings?: (settings: PageSettings) => void;
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
  onAddPage?: () => void;
}

export function MobileEditorToolbar({
  editor,
  pageSettings,
  onChangePageSettings,
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
  onAddPage,
}: MobileEditorToolbarProps) {
  const responsive = useResponsiveEditor();
  // Bottom Sheet Navigation State
  const [activeSheet, setActiveSheet] = useState<
    'text' | 'media' | 'insert' | 'layout' | 'more' | 'image-context' | 'table-context' | null
  >(null);

  if (!editor) return null;

  // Context Detection
  const isImageSelected = editor.isActive('resizableImage');
  const isTableSelected = editor.isActive('table');
  const isTextSelection = !editor.state.selection.empty && !isImageSelected && !isTableSelected;

  // Font size helper
  const currentSizeAttr = editor.getAttributes('textStyle').fontSize || '';
  const currentFontSize = parseInt(currentSizeAttr.replace('px', ''), 10) || 16;

  const handleStepFontSize = (delta: number) => {
    const next = Math.max(8, Math.min(144, currentFontSize + delta));
    editor.chain().focus().setMark('textStyle', { fontSize: `${next}px` }).run();
  };

  const handleSetFontSize = (size: number) => {
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
  };

  const handleSetFontFamily = (family: string) => {
    editor.chain().focus().setFontFamily(family).run();
  };

  const handleSetTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const handleSetHighlight = (color: string) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  return (
    <div
      className="fixed left-0 right-0 z-40 md:hidden flex flex-col bg-background/95 backdrop-blur-md border-t border-border shadow-2xl transition-all duration-150"
      style={{
        bottom: `${responsive.keyboardHeight}px`,
        paddingBottom: responsive.isKeyboardOpen ? '4px' : 'max(8px, env(safe-area-inset-bottom))',
      }}
    >
      {/* ── Contextual Quick Chips Row (Scrollable) ─────────────────────────── */}
      <div className="h-11 px-2 border-b border-border/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar whitespace-nowrap bg-muted/40 shrink-0">
        {/* If Image Selected: Image Quick Actions */}
        {isImageSelected ? (
          <>
            <button
              type="button"
              onClick={() => onOpenImageUploadModal?.()}
              className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Replace
            </button>
            <div className="flex items-center gap-1 bg-background/80 p-0.5 rounded-lg border border-border shrink-0">
              {['25%', '50%', '75%', '100%'].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => editor.chain().focus().updateAttributes('resizableImage', { width: w }).run()}
                  className="h-7 px-2 text-[11px] font-semibold rounded hover:bg-muted text-foreground"
                >
                  {w}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const current = Number(editor.getAttributes('resizableImage').rotate) || 0;
                editor.chain().focus().updateAttributes('resizableImage', { rotate: (current + 90) % 360 }).run();
              }}
              className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center text-foreground shrink-0"
              title="Rotate 90°"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteSelection().run()}
              className="h-8 px-2.5 rounded-lg bg-destructive/10 text-destructive font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </>
        ) : isTableSelected ? (
          /* If Table Selected: Table Quick Actions */
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="h-8 px-2.5 rounded-lg bg-background border border-border text-foreground font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3 w-3 text-primary" /> Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="h-8 px-2.5 rounded-lg bg-background border border-border text-foreground font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <Plus className="h-3 w-3 text-primary" /> Column
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="h-8 px-2.5 rounded-lg bg-background border border-border text-muted-foreground text-xs flex items-center gap-1 shrink-0"
            >
              <Minus className="h-3 w-3" /> Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="h-8 px-2.5 rounded-lg bg-background border border-border text-muted-foreground text-xs flex items-center gap-1 shrink-0"
            >
              <Minus className="h-3 w-3" /> Column
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="h-8 px-2.5 rounded-lg bg-destructive/10 text-destructive font-semibold text-xs flex items-center gap-1 shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Table
            </button>
          </>
        ) : isTextSelection ? (
          /* ── Dedicated Text Selection Formatting Row ────────────────── */
          <>
            <div className="flex items-center gap-0.5 bg-primary/10 p-0.5 rounded-lg border border-primary/30 shrink-0">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('bold') ? 'bg-primary text-primary-foreground font-bold' : 'text-primary hover:bg-primary/20'
                )}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/20'
                )}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/20'
                )}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('strike') ? 'bg-primary text-primary-foreground' : 'text-primary hover:bg-primary/20'
                )}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Color Palette Trigger */}
            <button
              type="button"
              onClick={() => setActiveSheet('text')}
              className="h-8 px-2.5 rounded-lg bg-background border border-border flex items-center gap-1 text-foreground font-semibold text-xs shrink-0"
              title="Text Color & Highlights"
            >
              <Palette className="h-3.5 w-3.5 text-primary" /> Color
            </button>

            {/* Quick Font Size */}
            <div className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded-lg border border-border shrink-0">
              <button
                type="button"
                onClick={() => handleStepFontSize(-2)}
                className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono font-bold text-xs w-6 text-center text-foreground">{currentFontSize}</span>
              <button
                type="button"
                onClick={() => handleStepFontSize(2)}
                className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Alignment */}
            <div className="flex items-center gap-0.5 bg-background p-0.5 rounded-lg border border-border shrink-0">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign(align).run()}
                  className={cn(
                    'h-8 w-8 rounded flex items-center justify-center transition-colors',
                    editor.isActive({ textAlign: align }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {align === 'left' && <AlignLeft className="h-4 w-4" />}
                  {align === 'center' && <AlignCenter className="h-4 w-4" />}
                  {align === 'right' && <AlignRight className="h-4 w-4" />}
                </button>
              ))}
            </div>

            {/* More Text Formatting */}
            <button
              type="button"
              onClick={() => setActiveSheet('text')}
              className="h-8 px-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1 shrink-0 shadow-xs"
            >
              <MoreHorizontal className="h-3.5 w-3.5" /> More
            </button>
          </>
        ) : (
          /* Default / Text Quick Actions */
          <>
            {/* Quick Bold, Italic, Underline, Strike */}
            <div className="flex items-center gap-0.5 bg-background p-0.5 rounded-lg border border-border shrink-0">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('bold') ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('underline') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Font Size Step */}
            <div className="flex items-center gap-1 bg-background px-1.5 py-0.5 rounded-lg border border-border shrink-0">
              <button
                type="button"
                onClick={() => handleStepFontSize(-2)}
                className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono font-bold text-xs w-6 text-center text-foreground">{currentFontSize}</span>
              <button
                type="button"
                onClick={() => handleStepFontSize(2)}
                className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Alignment */}
            <div className="flex items-center gap-0.5 bg-background p-0.5 rounded-lg border border-border shrink-0">
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  type="button"
                  onClick={() => editor.chain().focus().setTextAlign(align).run()}
                  className={cn(
                    'h-8 w-8 rounded flex items-center justify-center transition-colors',
                    editor.isActive({ textAlign: align }) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {align === 'left' && <AlignLeft className="h-4 w-4" />}
                  {align === 'center' && <AlignCenter className="h-4 w-4" />}
                  {align === 'right' && <AlignRight className="h-4 w-4" />}
                </button>
              ))}
            </div>

            {/* Quick Lists */}
            <div className="flex items-center gap-0.5 bg-background p-0.5 rounded-lg border border-border shrink-0">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  'h-8 w-8 rounded flex items-center justify-center transition-colors',
                  editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Add Page Button on Mobile Toolbar */}
            {onAddPage && (
              <button
                type="button"
                onClick={onAddPage}
                className="h-8 px-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                title="Add New Document Page (+ Page)"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Page</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Primary Bottom Navigation Bar (5 Categories) ───────────────────── */}
      <div className="h-14 px-2 grid grid-cols-5 items-center gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveSheet('text')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all active:scale-95',
            activeSheet === 'text' ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Type className="h-5 w-5" />
          <span className="text-[10px]">Text</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('insert')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all active:scale-95',
            activeSheet === 'insert' ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Plus className="h-5 w-5 text-primary" />
          <span className="text-[10px]">Elements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('media')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all active:scale-95',
            activeSheet === 'media' ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-[10px]">Image</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('layout')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all active:scale-95',
            activeSheet === 'layout' ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Layout className="h-5 w-5" />
          <span className="text-[10px]">Page</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSheet('more')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 h-12 rounded-xl transition-all active:scale-95',
            activeSheet === 'more' ? 'text-primary font-bold bg-primary/10' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px]">More</span>
        </button>
      </div>

      {/* ── Mobile Bottom Sheets ────────────────────────────────────────────── */}

      {/* 1. TEXT BOTTOM SHEET */}
      <MobileBottomSheet
        open={activeSheet === 'text'}
        onClose={() => setActiveSheet(null)}
        title="Text Formatting & Styles"
      >
        <div className="space-y-4">
          {/* Heading Levels */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Paragraph Style
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => { editor.chain().focus().setParagraph().run(); }}
                className={cn(
                  'h-11 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all',
                  editor.isActive('paragraph') ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                )}
              >
                Body
              </button>
              <button
                type="button"
                onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
                className={cn(
                  'h-11 rounded-xl border text-xs font-bold flex items-center justify-center transition-all',
                  editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                )}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                className={cn(
                  'h-11 rounded-xl border text-xs font-bold flex items-center justify-center transition-all',
                  editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                )}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); }}
                className={cn(
                  'h-11 rounded-xl border text-xs font-bold flex items-center justify-center transition-all',
                  editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                )}
              >
                H3
              </button>
            </div>
          </div>

          {/* Font Family Picker */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Font Family
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_FAMILIES.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleSetFontFamily(f.value)}
                  style={{ fontFamily: f.value }}
                  className="h-11 px-3 rounded-xl border border-border bg-card text-left text-xs font-medium hover:border-primary flex items-center justify-between"
                >
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Selector Presets */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Font Size ({currentFontSize}px)
            </label>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {PRESET_FONT_SIZES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSetFontSize(s)}
                  className={cn(
                    'h-10 min-w-10 px-2 rounded-xl font-mono text-xs font-bold shrink-0 border transition-all',
                    currentFontSize === s ? 'bg-primary text-primary-foreground border-primary shadow-xs' : 'bg-card border-border hover:bg-accent text-foreground'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color Palette */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Text Color
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {TEXT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSetTextColor(c)}
                  style={{ backgroundColor: c }}
                  className="h-9 w-9 rounded-full shrink-0 border-2 border-background shadow-xs ring-1 ring-border active:scale-95 transition-transform"
                />
              ))}
            </div>
          </div>

          {/* Background Highlight Palette */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Highlight Color
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSetHighlight(c)}
                  style={{ backgroundColor: c }}
                  className="h-9 w-9 rounded-full shrink-0 border-2 border-background shadow-xs ring-1 ring-border active:scale-95 transition-transform"
                />
              ))}
            </div>
          </div>
        </div>
      </MobileBottomSheet>

      {/* 2. MEDIA BOTTOM SHEET */}
      <MobileBottomSheet
        open={activeSheet === 'media'}
        onClose={() => setActiveSheet(null)}
        title="Add Images & Media"
      >
        <div className="grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenImageUploadModal?.();
            }}
            className="h-14 px-4 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-xs text-foreground">Upload Image / Photo</p>
                <p className="text-[11px] text-muted-foreground">Select from device, take camera photo, or web URL</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </MobileBottomSheet>

      {/* 3. INSERT BOTTOM SHEET */}
      <MobileBottomSheet
        open={activeSheet === 'insert'}
        onClose={() => setActiveSheet(null)}
        title="Insert Elements"
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Add New Page Sheet */}
          {onAddPage && (
            <button
              type="button"
              onClick={() => {
                setActiveSheet(null);
                onAddPage();
              }}
              className="h-14 px-3 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/10 hover:border-primary flex items-center gap-2.5 text-left active:scale-98 transition-all col-span-2"
            >
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-primary">+ Add New Blank Page</p>
                <p className="text-[10px] text-muted-foreground">Appends a fresh editable page to this document</p>
              </div>
            </button>
          )}

          {/* Table */}
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              setActiveSheet(null);
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
              <TableIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Table</p>
              <p className="text-[10px] text-muted-foreground">3 × 3 Grid</p>
            </div>
          </button>

          {/* Border Box / Callout */}
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().insertContent('<div data-border-box="true" style="border: 2px solid #3b82f6; border-radius: 8px; padding: 12px; margin: 12px 0; background: rgba(59, 130, 246, 0.05);"><p>Callout block...</p></div>').run();
              setActiveSheet(null);
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
              <Square className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Callout Box</p>
              <p className="text-[10px] text-muted-foreground">Bordered</p>
            </div>
          </button>

          {/* Divider */}
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run();
              setActiveSheet(null);
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Minus className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Divider Line</p>
              <p className="text-[10px] text-muted-foreground">Horizontal rule</p>
            </div>
          </button>

          {/* Page Break */}
          <button
            type="button"
            onClick={() => {
              editor.chain().focus().insertContent('<div data-type="page-break"></div>').run();
              setActiveSheet(null);
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <SplitSquareVertical className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Page Break</p>
              <p className="text-[10px] text-muted-foreground">Split sheet</p>
            </div>
          </button>

          {/* Math Equation */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenEquationModal?.();
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Math Formula</p>
              <p className="text-[10px] text-muted-foreground">KaTeX / LaTeX</p>
            </div>
          </button>

          {/* Diagram / Flowchart */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenDiagramModal?.();
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 shrink-0">
              <GitFork className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Flowchart</p>
              <p className="text-[10px] text-muted-foreground">Diagrams</p>
            </div>
          </button>

          {/* QR Code */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenQRCodeModal?.();
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">QR Code</p>
              <p className="text-[10px] text-muted-foreground">Custom Link</p>
            </div>
          </button>

          {/* Signature */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenSignatureModal?.();
            }}
            className="h-14 px-3 rounded-2xl border border-border bg-card hover:border-primary/50 flex items-center gap-2.5 text-left active:scale-98 transition-all"
          >
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0">
              <PenTool className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">Signature</p>
              <p className="text-[10px] text-muted-foreground">Digital Sign</p>
            </div>
          </button>
        </div>
      </MobileBottomSheet>

      {/* 4. LAYOUT / PAGE BOTTOM SHEET */}
      <MobileBottomSheet
        open={activeSheet === 'layout'}
        onClose={() => setActiveSheet(null)}
        title="Page Settings & Layout"
      >
        <div className="space-y-4">
          {/* Quick Add Page Action */}
          {onAddPage && (
            <button
              type="button"
              onClick={() => {
                setActiveSheet(null);
                onAddPage();
              }}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
            >
              <Plus className="h-4 w-4" /> Add New Page Sheet
            </button>
          )}

          {/* Orientation */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['portrait', 'landscape'] as PageOrientation[]).map(ori => (
                <button
                  key={ori}
                  type="button"
                  onClick={() => onChangePageSettings?.({ ...pageSettings!, orientation: ori })}
                  className={cn(
                    'h-11 rounded-xl border text-xs font-semibold capitalize flex items-center justify-center gap-1.5 transition-all',
                    pageSettings?.orientation === ori ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                  )}
                >
                  {ori}
                </button>
              ))}
            </div>
          </div>

          {/* Page Size */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Page Size
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['A4', 'Letter', 'A5', 'Legal', 'Executive'] as PageSize[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangePageSettings?.({ ...pageSettings!, size: s })}
                  className={cn(
                    'h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all',
                    pageSettings?.size === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-accent'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Margins Preset */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Margins
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => onChangePageSettings?.({ ...pageSettings!, margins: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 } })}
                className="h-10 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => onChangePageSettings?.({ ...pageSettings!, margins: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 } })}
                className="h-10 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                Narrow
              </button>
              <button
                type="button"
                onClick={() => onChangePageSettings?.({ ...pageSettings!, margins: { top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 } })}
                className="h-10 rounded-xl border border-border bg-card text-xs font-semibold hover:bg-accent"
              >
                Wide
              </button>
            </div>
          </div>
        </div>
      </MobileBottomSheet>

      {/* 5. MORE TOOLS BOTTOM SHEET */}
      <MobileBottomSheet
        open={activeSheet === 'more'}
        onClose={() => setActiveSheet(null)}
        title="Document Tools & More"
      >
        <div className="space-y-2">
          {/* AI Assistant */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenAIWritingModal?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-primary font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>AI Writing Assistant</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Quality Audit */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenQualityCheckerModal?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-foreground font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Quality &amp; Accessibility Audit</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Document Outline */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenDocumentOutlineModal?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-foreground font-semibold">
              <ListTree className="h-4 w-4 text-blue-500" />
              <span>Document Outline</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Find & Replace */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenFindReplaceModal?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-foreground font-semibold">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span>Find &amp; Replace</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Word Count */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenWordCountModal?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-foreground font-semibold">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span>Word Count &amp; Stats</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Version History */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onOpenVersionHistoryModal?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-foreground font-semibold">
              <History className="h-4 w-4 text-muted-foreground" />
              <span>Version History</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onPrint?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-border bg-card flex items-center justify-between active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2.5 text-foreground font-semibold">
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>Print / Save as PDF</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Export Formats */}
          <button
            type="button"
            onClick={() => {
              setActiveSheet(null);
              onDownload?.();
            }}
            className="w-full h-12 px-3.5 rounded-xl border border-primary/40 bg-primary/5 text-primary flex items-center justify-between active:scale-98 transition-all font-semibold"
          >
            <div className="flex items-center gap-2.5">
              <Download className="h-4 w-4" />
              <span>Export (PDF, DOCX, HTML, TXT, MD)</span>
            </div>
            <ChevronRight className="h-4 w-4 opacity-70" />
          </button>
        </div>
      </MobileBottomSheet>
    </div>
  );
}
