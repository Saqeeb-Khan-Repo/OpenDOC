import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ResumeEngine, ResumeData, RESUME_TEMPLATES_METADATA } from '@/engines/ResumeEngine';
import { FileText, Sparkles, Check, RefreshCw, Layout, ArrowRight } from 'lucide-react';

interface ResumeTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (htmlContent: string) => void;
}

export function ResumeTemplateModal({ open, onOpenChange, onApplyTemplate }: ResumeTemplateModalProps) {
  const templates = RESUME_TEMPLATES_METADATA;
  const [selectedId, setSelectedId] = useState<string>('tmpl_modern_pro');
  const [resumeData, setResumeData] = useState<ResumeData>(() => ResumeEngine.getDefaultResumeData());

  const selectedMeta = templates.find(t => t.id === selectedId) || templates[0];
  const renderedPreview = ResumeEngine.renderTemplate(resumeData, selectedId);

  const handleApply = () => {
    onApplyTemplate(renderedPreview);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[920px] p-5">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Resume Template Library &amp; Switcher</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Switch seamlessly between 5 ATS-optimized resume layouts without losing any content or section details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
          {/* Template Selection List */}
          <div className="md:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Select Template Layout
            </span>
            {templates.map(tmpl => {
              const isSelected = selectedId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-xs'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: tmpl.thumbnailColor }}
                      />
                      <h4 className="font-semibold text-xs text-foreground">{tmpl.name}</h4>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {tmpl.description}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {tmpl.category}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      {tmpl.layout}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Rendered Preview Pane */}
          <div className="md:col-span-7 flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Live Layout Preview ({selectedMeta.name})
            </span>
            <div className="flex-1 h-[420px] overflow-auto p-5 rounded-xl border border-border bg-white text-black shadow-xs">
              <div
                dangerouslySetInnerHTML={{ __html: renderedPreview }}
                className="prose prose-sm max-w-none text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Changes your document layout instantly while preserving structured section data.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleApply} className="gap-1.5 bg-primary font-semibold">
              <Check className="h-3.5 w-3.5" /> Apply Template Layout
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
