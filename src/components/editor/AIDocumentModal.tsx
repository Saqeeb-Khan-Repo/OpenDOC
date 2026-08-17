import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIEngine, GeneratedDocument } from '@/engines/AIEngine';
import {
  Sparkles, FileText, Wand2, Check, BookOpen,
  Briefcase, GraduationCap
} from 'lucide-react';

interface AIDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (doc: GeneratedDocument) => void;
}

const DOCUMENT_PRESETS = [
  {
    type: 'academic-report' as const,
    label: 'Final-Year Project / Academic Report',
    icon: GraduationCap,
    desc: 'Structured with Abstract, Methodology, Architecture, and References',
    defaultPrompt: 'Final-Year Project Report: AI-Powered Document Editor Architecture',
  },
  {
    type: 'research-paper' as const,
    label: 'Empirical Research Paper (IEEE)',
    icon: BookOpen,
    desc: 'Two-column academic template with benchmarks and hypothesis tests',
    defaultPrompt: 'Comparative Performance Analysis of Web-Based Pagination Algorithms',
  },
  {
    type: 'business-proposal' as const,
    label: 'Commercial Business Proposal',
    icon: Briefcase,
    desc: 'Executive summary, milestone roadmap, SLA, and budget tables',
    defaultPrompt: 'Enterprise Digital Transformation and Cloud Migration Proposal',
  },
];

export function AIDocumentModal({
  open,
  onOpenChange,
  onGenerate,
}: AIDocumentModalProps) {
  const [selectedType, setSelectedType] = useState<'academic-report' | 'research-paper' | 'business-proposal'>('academic-report');
  const [prompt, setPrompt] = useState(DOCUMENT_PRESETS[0].defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectPreset = (preset: typeof DOCUMENT_PRESETS[0]) => {
    setSelectedType(preset.type);
    setPrompt(preset.defaultPrompt);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const gen = AIEngine.generateDocument(prompt, selectedType as any);
      onGenerate(gen);
      setIsGenerating(false);
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Create Document with AI</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate structured multi-section reports, papers, and proposals.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 my-2">
          {/* Document Types */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Select Document Framework
            </label>
            <div className="grid grid-cols-1 gap-2">
              {DOCUMENT_PRESETS.map(preset => {
                const Icon = preset.icon;
                const isSelected = selectedType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/50 hover:bg-accent/40'
                    }`}
                  >
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold">{preset.label}</p>
                      <p className="text-[11px] text-muted-foreground">{preset.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Prompt */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Document Title or Subject
            </label>
            <Input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="E.g., Final-Year Project: Machine Learning Pipeline..."
              className="h-9 text-xs"
            />
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="gap-1 bg-primary font-semibold"
          >
            {isGenerating ? (
              <>Generating Document...</>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" /> Generate Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
