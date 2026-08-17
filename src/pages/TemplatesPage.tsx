import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { TemplateEngine, STUDIO_TEMPLATES } from '@/engines/TemplateEngine';
import { StudioTemplate } from '@/engines/types';
import { Button } from '@/components/ui/button';
import {
  FileText, Presentation, Palette, Plus, Sparkles,
  GraduationCap, Briefcase, Award, ArrowRight
} from 'lucide-react';

import { SEOHead } from '@/components/seo/SEOHead';

export function TemplatesPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = TemplateEngine.getCategories();
  const templates = TemplateEngine.getTemplates();

  const filtered =
    activeCategory === 'All'
      ? templates
      : templates.filter(t => t.category.toLowerCase() === activeCategory.toLowerCase());

  const handleUseTemplate = (template: StudioTemplate) => {
    const doc = createDocument({
      title: template.initialDocument.title || template.title,
      mode: template.mode,
      initialData: template.initialDocument as any,
    });
    toast.success(`Created project from ${template.title}`);
    navigate(`/editor/${doc.id}`);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <SEOHead
        title="Document, Slide & Diagram Templates | DocProEditor"
        description="Browse free pre-formatted templates for academic project reports, startup pitch decks, ATS resumes, and engineering flowcharts."
        canonicalPath="/templates"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Templates', item: '/templates' },
        ]}
      />
      {/* Header */}
      <div className="px-3.5 sm:px-6 pt-4 sm:pt-6 pb-4 sm:pb-5 border-b border-border shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Template Library
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select an academic project report, pitch deck, resume, or visual design to start creating.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${activeCategory.toLowerCase() === cat.toLowerCase() ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y p-3.5 sm:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filtered.map(tmpl => {
            return (
              <div
                key={tmpl.id}
                className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Header Banner */}
                <div
                  className="h-32 flex flex-col items-center justify-center p-4 relative"
                  style={{ backgroundColor: tmpl.color + '12' }}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-200">
                    {tmpl.emoji}
                  </span>

                  {/* Mode Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-background/90 backdrop-blur px-2.5 py-1 rounded-full border border-border text-foreground flex items-center gap-1 shadow-sm">
                      {tmpl.mode === 'presentation' ? (
                        <Presentation className="h-3 w-3 text-primary" />
                      ) : tmpl.mode === 'design' ? (
                        <Palette className="h-3 w-3 text-primary" />
                      ) : (
                        <FileText className="h-3 w-3 text-primary" />
                      )}
                      {tmpl.mode}
                    </span>
                  </div>

                  {tmpl.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
                        {tmpl.badge}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    className="mt-4 w-full gap-2 text-xs font-semibold"
                    onClick={() => handleUseTemplate(tmpl)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Use Template
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
