import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AIEngine } from '@/engines/AIEngine';
import {
  Sparkles, Wand2, ArrowRight, Check, RefreshCw,
  Minimize2, Maximize2, CheckCheck, FileText, List, Sliders
} from 'lucide-react';

interface AIWritingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedText?: string;
  onApply: (generatedHtml: string) => void;
}

const AI_ACTIONS = [
  { id: 'improve', label: 'Improve Writing & Clarity', icon: Wand2, desc: 'Enhance structure and readability' },
  { id: 'professional', label: 'Make Professional Tone', icon: Sliders, desc: 'Formal executive phrasing' },
  { id: 'academic', label: 'Make Academic & Formal', icon: FileText, desc: 'Scholarly vocabulary' },
  { id: 'shorter', label: 'Make Shorter & Concise', icon: Minimize2, desc: 'Trim fluff and redundancy' },
  { id: 'longer', label: 'Expand & Add Detail', icon: Maximize2, desc: 'Elaborate core ideas' },
  { id: 'bullets', label: 'Convert to Bullet Points', icon: List, desc: 'Structured scannable list' },
  { id: 'grammar', label: 'Fix Grammar & Spelling', icon: CheckCheck, desc: 'Zero punctuation/spelling errors' },
  { id: 'conclusion', label: 'Generate Conclusion', icon: Sparkles, desc: 'Executive wrap-up summary' },
];

export function AIWritingModal({
  open,
  onOpenChange,
  selectedText = '',
  onApply,
}: AIWritingModalProps) {
  const [prompt, setPrompt] = useState('');
  const [activeAction, setActiveAction] = useState('improve');
  const [resultHtml, setResultHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const inputText = selectedText.trim() || prompt;

  const handleGenerate = (actionId: string = activeAction) => {
    setIsGenerating(true);
    setActiveAction(actionId);
    setTimeout(() => {
      const generated = AIEngine.rewrite(inputText || 'OpenDoc Studio provides professional document editing and modern typography.', actionId);
      setResultHtml(generated);
      setIsGenerating(false);
    }, 300);
  };

  const handleInsert = () => {
    if (resultHtml) {
      onApply(resultHtml);
      onOpenChange(false);
      setResultHtml('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">AI Writing Assistant</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Rewrite, summarize, polish grammar, or expand ideas with intelligent writing tools.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Input / Context */}
        <div className="space-y-3 my-1">
          {selectedText ? (
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Selected Text
              </label>
              <div className="p-2.5 rounded-md bg-muted/50 border border-border text-xs max-h-24 overflow-y-auto italic">
                "{selectedText}"
              </div>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Custom Topic or Prompt
              </label>
              <Input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="E.g., Write an introduction for a cloud computing whitepaper..."
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Quick Action Pills */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              AI Action
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {AI_ACTIONS.map(act => {
                const Icon = act.icon;
                const isSelected = activeAction === act.id;
                return (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => handleGenerate(act.id)}
                    className={`flex items-start gap-2 p-2 rounded-md border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border/60 hover:border-primary/40 hover:bg-accent/50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-semibold truncate">{act.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{act.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Output Preview */}
          {resultHtml && (
            <div className="pt-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                AI Suggestion Preview
              </label>
              <div
                className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-xs text-foreground max-h-36 overflow-y-auto leading-relaxed"
                dangerouslySetInnerHTML={{ __html: resultHtml }}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {resultHtml ? (
            <Button size="sm" onClick={handleInsert} className="gap-1 bg-primary">
              <Check className="h-3.5 w-3.5" /> Apply to Document
            </Button>
          ) : (
            <Button size="sm" onClick={() => handleGenerate()} disabled={isGenerating} className="gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Generate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
