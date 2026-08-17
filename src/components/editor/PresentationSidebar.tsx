import React, { useState } from 'react';
import { Slide, SlideLayout, SlideTheme, PresentationSettings } from '@/engines/types';
import { PresentationEngine, PRESENTATION_THEMES, PRESENTATION_GRADIENTS } from '@/engines/PresentationEngine';
import {
  Plus, Copy, Trash2, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Eye, EyeOff, Layout, Sparkles, GraduationCap, Layers, Check,
  ChevronDown, MoreVertical, Presentation, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/cn';

interface PresentationSidebarProps {
  slides: Slide[];
  activeSlideIndex: number;
  settings: PresentationSettings;
  onChangeSlides: (slides: Slide[]) => void;
  onChangeActiveSlideIndex: (idx: number) => void;
  onAddSlide: (layout: SlideLayout, gradient?: string) => void;
  onDuplicateSlide: (idx: number) => void;
  onDeleteSlide: (idx: number) => void;
  onLoadProjectDeck: () => void;
}

const LAYOUT_PRESETS: { layout: SlideLayout; label: string; desc: string }[] = [
  { layout: 'title', label: 'Title Slide', desc: 'Main title and subtitle' },
  { layout: 'title-content', label: 'Title & Content', desc: 'Topic with bullet points' },
  { layout: 'two-columns', label: 'Two Columns', desc: 'Side-by-side comparison' },
  { layout: 'project-architecture' as SlideLayout, label: 'System Architecture', desc: '3-tier visual architecture' },
  { layout: 'comparison', label: 'Comparison Matrix', desc: 'Existing vs Proposed' },
  { layout: 'project-techstack' as SlideLayout, label: 'Technology Stack', desc: 'Frontend, backend, storage' },
  { layout: 'project-screenshots' as SlideLayout, label: 'UI Screenshots', desc: 'Dual image frame mockup' },
  { layout: 'statistics', label: 'Key Metrics & Stats', desc: 'High-impact KPI numbers' },
  { layout: 'timeline', label: 'Timeline & Roadmap', desc: '3-phase milestones' },
  { layout: 'image-text', label: 'Image & Text', desc: 'Visual card with caption' },
  { layout: 'quote', label: 'Quote Slide', desc: 'Emphasized callout quote' },
  { layout: 'section-header', label: 'Section Header', desc: 'Major topic transition' },
  { layout: 'closing', label: 'Closing & Q&A', desc: 'Thank you and contact info' },
  { layout: 'blank', label: 'Blank Slide', desc: 'Empty canvas for custom design' },
];

export function PresentationSidebar({
  slides,
  activeSlideIndex,
  settings,
  onChangeSlides,
  onChangeActiveSlideIndex,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onLoadProjectDeck,
}: PresentationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleMoveSlide = (from: number, to: number) => {
    const reordered = PresentationEngine.moveSlide(slides, from, to);
    onChangeSlides(reordered);
    onChangeActiveSlideIndex(to);
  };

  const handleToggleHide = (idx: number) => {
    const next = slides.map((s, i) => i === idx ? { ...s, hidden: !s.hidden } : s);
    onChangeSlides(next);
  };

  if (isCollapsed) {
    return (
      <div className="hidden md:flex flex-col items-center py-3 px-1 border-r border-border bg-card/60 w-12 shrink-0 select-none z-10">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-3"
          title="Expand Slide Navigator"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onAddSlide('title-content')}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors mb-2"
          title="Add Slide"
        >
          <Plus className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-1.5 w-full items-center overflow-y-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeActiveSlideIndex(idx)}
              className={cn(
                'h-7 w-7 rounded font-mono font-bold text-xs flex items-center justify-center transition-colors',
                activeSlideIndex === idx ? 'bg-primary text-primary-foreground shadow-2xs' : 'text-muted-foreground hover:bg-muted'
              )}
              title={`Slide ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden md:flex flex-col border-r border-border bg-card/80 backdrop-blur-xs w-60 shrink-0 select-none z-10 text-xs overflow-hidden">
      {/* ── Top Action Header ────────────────────────────────────────────── */}
      <div className="h-11 px-3 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <Presentation className="h-4 w-4 text-primary shrink-0" />
          <span className="font-bold text-xs text-foreground truncate">
            Slides ({slides.length})
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Add Slide Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="default" className="h-7 px-2 text-[11px] gap-1 bg-primary text-primary-foreground font-semibold">
                <Plus className="h-3.5 w-3.5" /> Add <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 text-xs max-h-80 overflow-y-auto">
              <DropdownMenuLabel className="text-[11px]">Slide Layouts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LAYOUT_PRESETS.map(p => (
                <DropdownMenuItem
                  key={p.layout}
                  onClick={() => onAddSlide(p.layout)}
                  className="flex flex-col items-start gap-0.5 text-xs py-1.5"
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-[10px] text-muted-foreground">{p.desc}</span>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onLoadProjectDeck}
                className="text-primary font-semibold flex items-center gap-1.5"
              >
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                <span>Load 10-Slide Project Deck</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Collapse Panel"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Slide Thumbnails Rail ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {slides.map((slide, idx) => {
          const isSelected = activeSlideIndex === idx;
          const bg = slide.gradient || slide.background || settings.theme?.backgroundColor || '#ffffff';

          return (
            <div
              key={slide.id || idx}
              draggable
              onDragStart={() => setDraggedIdx(idx)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIdx !== null && draggedIdx !== idx) {
                  handleMoveSlide(draggedIdx, idx);
                  setDraggedIdx(null);
                }
              }}
              onClick={() => onChangeActiveSlideIndex(idx)}
              className={cn(
                'group relative rounded-xl border p-2 cursor-pointer transition-all duration-150',
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs'
                  : 'border-border/80 bg-background hover:border-border hover:bg-muted/40',
                slide.hidden ? 'opacity-50' : ''
              )}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <span className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-[110px]">{slide.title || `Slide ${idx + 1}`}</span>
                </span>

                {/* Slide Quick Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, idx - 1); }}
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                  )}
                  {idx < slides.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, idx + 1); }}
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDuplicateSlide(idx); }}
                    className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="Duplicate Slide"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDeleteSlide(idx); }}
                      className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete Slide"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Miniature Slide Sheet Visual Canvas */}
              <div
                className="w-full aspect-video rounded-lg border border-black/10 dark:border-white/10 overflow-hidden relative shadow-2xs pointer-events-none"
                style={{ background: bg }}
              >
                {slide.elements.map((el) => (
                  <div
                    key={el.id}
                    style={{
                      position: 'absolute',
                      left: `${(el.transform.x / 960) * 100}%`,
                      top: `${(el.transform.y / 540) * 100}%`,
                      width: `${(el.transform.width / 960) * 100}%`,
                      height: `${(el.transform.height / 540) * 100}%`,
                      transform: el.transform.rotation ? `rotate(${el.transform.rotation}deg)` : undefined,
                    }}
                    className="overflow-hidden"
                  >
                    {el.type === 'shape' ? (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: el.style?.fill || '#3b82f6',
                          borderRadius: el.style?.cornerRadius || 2,
                          border: el.style?.stroke ? `${el.style.strokeWidth || 1}px solid ${el.style.stroke}` : undefined,
                        }}
                      />
                    ) : el.type === 'image' ? (
                      <img src={el.content || ''} alt="" className="w-full h-full object-cover rounded-[2px]" />
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{ __html: el.content || '' }}
                        className="text-[6px] line-clamp-3 leading-tight opacity-75 font-sans"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Project Deck Template Quick Card */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onLoadProjectDeck}
            className="w-full p-2.5 rounded-xl border border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary transition-all text-left flex items-center gap-2 group"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs block truncate">Project Deck Template</span>
              <span className="text-[10px] text-muted-foreground block">10 Complete Slides</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
}
