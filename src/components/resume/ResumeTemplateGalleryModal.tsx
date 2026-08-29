import React, { useState, useMemo } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResumeEngine, ResumeData, RESUME_TEMPLATES_METADATA, ResumeTemplateMeta
} from '@/engines/ResumeEngine';
import {
  Layout, Search, Check, Sparkles, FileText, ChevronRight, X
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeTemplateGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  resumeData: ResumeData;
}

const TEMPLATE_CATEGORIES = [
  'All',
  'ATS',
  'Professional',
  'Modern',
  'Developer',
  'Executive',
  'Creative',
  'Student',
  'Academic',
];

export function ResumeTemplateGalleryModal({
  open,
  onOpenChange,
  selectedTemplateId,
  onSelectTemplate,
  resumeData,
}: ResumeTemplateGalleryModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const templates = RESUME_TEMPLATES_METADATA;

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory =
        activeCategory === 'All' ||
        t.category.toLowerCase().includes(activeCategory.toLowerCase());
      const matchesSearch =
        searchQuery.trim() === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [templates, activeCategory, searchQuery]);

  const handleApply = (id: string) => {
    onSelectTemplate(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[940px] p-5 max-h-[85vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Layout className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">
                  Resume Template Gallery ({templates.length} Designs)
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Switch layouts seamlessly. Your resume content is 100% preserved.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Filter Bar & Search ────────────────────────────────────────── */}
        <div className="space-y-2 pt-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search templates by name, style, or industry..."
                className="h-8 pl-8 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0',
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Templates Grid ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 min-h-[360px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredTemplates.map(t => {
              const isSelected = selectedTemplateId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => handleApply(t.id)}
                  className={cn(
                    'group rounded-xl border p-3.5 flex flex-col justify-between cursor-pointer transition-all hover:shadow-md relative overflow-hidden',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  {/* Mini Preview Graphic Box */}
                  <div className="h-28 rounded-lg bg-background border border-border/80 p-2.5 mb-2.5 overflow-hidden flex flex-col justify-between shadow-2xs group-hover:scale-[1.01] transition-transform">
                    {/* Simulated Mini Header */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div
                          className="h-2.5 w-20 rounded-full"
                          style={{ backgroundColor: t.thumbnailColor }}
                        />
                        <span className="text-[8px] font-mono text-muted-foreground uppercase px-1.5 py-0.2 rounded bg-muted/60">
                          {t.layout}
                        </span>
                      </div>
                      <div className="h-1.5 w-28 bg-muted-foreground/30 rounded-full" />
                    </div>

                    {/* Simulated Body Lines */}
                    <div className="space-y-1.5 my-1">
                      <div className="h-1.5 w-full bg-muted/80 rounded-full" />
                      <div className="h-1.5 w-4/5 bg-muted/60 rounded-full" />
                      <div className="h-1.5 w-3/4 bg-muted/50 rounded-full" />
                    </div>

                    {/* Footer Accent */}
                    <div className="flex items-center justify-between text-[8px] font-medium text-muted-foreground">
                      <span>ATS Score: 98%</span>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: t.thumbnailColor }}
                      />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {t.name}
                      </h4>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </div>
                    <p className="text-[10.5px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Badges & Apply button */}
                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md">
                      {t.category}
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Use Template <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4">
              <FileText className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-semibold text-foreground">No templates found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Try searching for another keyword or change the category filter.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
