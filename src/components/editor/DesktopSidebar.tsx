import React, { useState, useMemo } from 'react';
import { Editor } from '@tiptap/react';
import {
  FileText, ListTree, Plus, Trash2, Copy, Layers,
  ChevronLeft, ChevronRight, Hash, Type, Table as TableIcon,
  Image as ImageIcon, Calculator, GitFork, BarChart3, QrCode,
  PenTool, GraduationCap, SplitSquareVertical, Minus, Quote,
  Code2, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageSettings, PageSize, PageOrientation } from '@/engines/types';
import { cn } from '@/utils/cn';

interface DesktopSidebarProps {
  editor: Editor | null;
  content: string;
  pages: string[];
  pageSettings: PageSettings;
  activePageIndex?: number;
  onSelectPage?: (pageIndex: number) => void;
  onAddPage: () => void;
  onDuplicatePage?: (pageIndex: number) => void;
  onDeletePage: (pageIndex: number) => void;
  onOpenImageUploadModal?: () => void;
  onOpenEquationModal?: () => void;
  onOpenDiagramModal?: () => void;
  onOpenChartModal?: () => void;
  onOpenQRCodeModal?: () => void;
  onOpenSignatureModal?: () => void;
  onOpenAcademicCoverModal?: () => void;
  onInsertTable?: (rows: number, cols: number) => void;
}

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  index: number;
}

export function DesktopSidebar({
  editor,
  content,
  pages,
  pageSettings,
  activePageIndex = 0,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onOpenImageUploadModal,
  onOpenEquationModal,
  onOpenDiagramModal,
  onOpenChartModal,
  onOpenQRCodeModal,
  onOpenSignatureModal,
  onOpenAcademicCoverModal,
  onInsertTable,
}: DesktopSidebarProps) {
  const [activeTab, setActiveTab] = useState<'pages' | 'outline' | 'elements'>('pages');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Extract Outline (H1-H4) from unified document HTML
  const outlineHeadings = useMemo<HeadingItem[]>(() => {
    if (!content) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingEls = doc.querySelectorAll('h1, h2, h3, h4');
    const items: HeadingItem[] = [];

    headingEls.forEach((el, idx) => {
      const text = el.textContent?.trim();
      if (text) {
        const level = parseInt(el.tagName.replace('H', ''), 10) || 1;
        items.push({
          id: `heading_${idx}`,
          level,
          text,
          index: idx,
        });
      }
    });

    return items;
  }, [content]);

  // Jump to heading in editor
  const handleScrollToHeading = (text: string) => {
    if (typeof window === 'undefined') return;
    const elements = window.document.querySelectorAll('h1, h2, h3, h4');
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].textContent?.trim() === text) {
        elements[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  };

  // Quick element insertions into editor
  const handleInsertCallout = () => {
    if (editor) {
      editor.chain().focus().insertContent(
        `<div style="background-color: rgba(59, 130, 246, 0.08); border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; margin: 12px 0;">
          <p><strong>Note:</strong> Type your important highlight or callout information here...</p>
        </div>`
      ).run();
    }
  };

  const handleInsertBlockquote = () => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  const handleInsertCodeBlock = () => {
    if (editor) {
      editor.chain().focus().toggleCodeBlock().run();
    }
  };

  const handleInsertTablePreset = (rows = 3, cols = 3) => {
    if (editor) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }
  };

  if (isCollapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center py-3 px-1 border-r border-border bg-card/60 w-11 shrink-0 select-none z-10">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-4"
          title="Expand Sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => { setIsCollapsed(false); setActiveTab('pages'); }}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
              activeTab === 'pages' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Pages"
          >
            <FileText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setIsCollapsed(false); setActiveTab('outline'); }}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
              activeTab === 'outline' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Document Outline"
          >
            <ListTree className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setIsCollapsed(false); setActiveTab('elements'); }}
            className={cn(
              'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
              activeTab === 'elements' ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
            title="Insert Elements"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col border-r border-border bg-card/80 backdrop-blur-xs w-64 shrink-0 select-none z-10 text-xs overflow-hidden">
      {/* ── Sidebar Top Tabs Header ────────────────────────────────────────── */}
      <div className="h-10 px-2 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('pages')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors',
              activeTab === 'pages' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pages ({pages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors',
              activeTab === 'outline' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Outline ({outlineHeadings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('elements')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors',
              activeTab === 'elements' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Elements
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Tab Content: Pages Thumbnails ──────────────────────────────────── */}
      {activeTab === 'pages' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold px-1">
            <span>PAGE THUMBNAILS</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddPage}
              className="h-6 px-1.5 text-[11px] text-primary gap-1 font-semibold hover:bg-primary/10"
            >
              <Plus className="h-3 w-3" /> Add Page
            </Button>
          </div>

          <div className="space-y-2.5">
            {pages.map((pageHtml, idx) => {
              const isSelected = activePageIndex === idx;
              // Clean snippet for thumbnail preview
              const textSnippet = pageHtml.replace(/<[^>]*>/g, ' ').trim().slice(0, 140) || 'Blank Page';

              return (
                <div
                  key={idx}
                  onClick={() => onSelectPage?.(idx)}
                  className={cn(
                    'group relative rounded-xl border p-2.5 cursor-pointer transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-background hover:border-border hover:bg-muted/40'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-[11px] text-foreground flex items-center gap-1">
                      <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                        {idx + 1}
                      </span>
                      Page {idx + 1}
                    </span>

                    {/* Page Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(idx);
                          }}
                          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete Page"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visual Miniature Page Sheet */}
                  <div className="h-20 w-full rounded border border-border/60 bg-white dark:bg-zinc-900 p-2 overflow-hidden shadow-2xs pointer-events-none">
                    <p className="text-[9px] text-muted-foreground font-serif line-clamp-4 leading-relaxed opacity-70">
                      {textSnippet}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Content: Document Outline (H1-H4) ──────────────────────────── */}
      {activeTab === 'outline' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-[11px] text-muted-foreground font-semibold px-1 mb-2">
            DOCUMENT HEADINGS
          </div>

          {outlineHeadings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListTree className="h-8 w-8 mx-auto mb-2 opacity-40 text-primary" />
              <p className="font-semibold text-xs text-foreground">No Headings Found</p>
              <p className="text-[11px] mt-1 max-w-[180px] mx-auto">
                Add Headings (H1, H2, H3) to automatically generate your document outline.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {outlineHeadings.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleScrollToHeading(h.text)}
                  style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                  className="w-full text-left py-1.5 pr-2 rounded-lg text-xs hover:bg-accent hover:text-primary transition-colors flex items-center gap-1.5 group"
                >
                  <span className="font-mono text-[10px] text-muted-foreground font-bold shrink-0">
                    H{h.level}
                  </span>
                  <span className="truncate text-foreground group-hover:text-primary">{h.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Elements / Insert Library ─────────────────────────── */}
      {activeTab === 'elements' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Typography Blocks */}
          <div>
            <div className="text-[11px] font-bold text-muted-foreground mb-2 px-1">TYPOGRAPHY BLOCKS</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <Type className="h-4 w-4 text-primary" />
                <span className="font-bold text-xs">Heading 1</span>
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <Type className="h-4 w-4 text-primary/80" />
                <span className="font-semibold text-xs">Heading 2</span>
              </button>
              <button
                type="button"
                onClick={handleInsertCallout}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-xs">Callout Box</span>
              </button>
              <button
                type="button"
                onClick={handleInsertBlockquote}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <Quote className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-xs">Quote Block</span>
              </button>
            </div>
          </div>

          {/* Media & Interactive */}
          <div>
            <div className="text-[11px] font-bold text-muted-foreground mb-2 px-1">MEDIA &amp; DATA</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onOpenImageUploadModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <ImageIcon className="h-4 w-4 text-emerald-500" />
                <span className="font-semibold text-xs">Upload Image</span>
              </button>
              <button
                type="button"
                onClick={() => handleInsertTablePreset(3, 3)}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <TableIcon className="h-4 w-4 text-purple-500" />
                <span className="font-semibold text-xs">Table (3×3)</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenEquationModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <Calculator className="h-4 w-4 text-rose-500" />
                <span className="font-semibold text-xs">Math KaTeX</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenDiagramModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <GitFork className="h-4 w-4 text-indigo-500" />
                <span className="font-semibold text-xs">Diagrams</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenChartModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <BarChart3 className="h-4 w-4 text-cyan-500" />
                <span className="font-semibold text-xs">Visual Charts</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenQRCodeModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <QrCode className="h-4 w-4 text-teal-500" />
                <span className="font-semibold text-xs">QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenSignatureModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <PenTool className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-xs">Signature</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenAcademicCoverModal?.()}
                className="p-2 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-accent flex flex-col items-start gap-1 transition-all text-left"
              >
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="font-semibold text-xs">Cover Page</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
