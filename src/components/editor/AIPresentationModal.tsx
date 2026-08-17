import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIEngine } from '@/engines/AIEngine';
import { Slide } from '@/engines/types';
import {
  Sparkles, Presentation, Sliders, Check, Wand2,
  FileSpreadsheet, Layers
} from 'lucide-react';

interface AIPresentationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (slides: Slide[]) => void;
}

const PRESENTATION_PROMPTS = [
  'Artificial Intelligence in Healthcare & Diagnostics',
  'Quarterly Business Review & Financial Metrics Q3',
  'Next-Gen Cloud Architecture & Microservices',
  'Startup Pitch Deck: AI-Powered Creative Suite',
  'Cybersecurity & Zero-Trust Architecture Roadmap',
];

export function AIPresentationModal({
  open,
  onOpenChange,
  onGenerate,
}: AIPresentationModalProps) {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const generatedSlides = AIEngine.generatePresentation(topic, slideCount);
      onGenerate(generatedSlides);
      setIsGenerating(false);
      onOpenChange(false);
      setTopic('');
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Presentation className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Create Presentation with AI</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Generate complete slide decks with titles, metrics, speaker notes, and gradient themes.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 my-2">
          {/* Topic Input */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Presentation Topic or Goal
            </label>
            <Input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="E.g., AI in Healthcare & Medical Diagnostics..."
              className="h-9 text-xs"
            />
          </div>

          {/* Quick Idea Presets */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Popular Examples
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESENTATION_PROMPTS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTopic(p)}
                  className="px-2.5 py-1 rounded-full border border-border/70 hover:border-primary text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Slide Count Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Number of Slides
              </label>
              <span className="font-mono font-semibold text-xs text-primary">{slideCount} Slides</span>
            </div>
            <div className="flex items-center gap-2">
              {[4, 5, 6, 8, 10].map(count => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSlideCount(count)}
                  className={`h-7 px-3 rounded-md text-xs font-mono border transition-all ${
                    slideCount === count
                      ? 'bg-primary text-white border-primary font-semibold'
                      : 'border-border hover:bg-accent text-muted-foreground'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={!topic.trim() || isGenerating}
            className="gap-1 bg-primary font-semibold"
          >
            {isGenerating ? (
              <>Generating Deck...</>
            ) : (
              <>
                <Wand2 className="h-3.5 w-3.5" /> Generate Deck
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
