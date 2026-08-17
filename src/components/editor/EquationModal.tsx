import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EQUATION_PRESETS, MATH_SYMBOLS, EquationEngine } from '@/engines/EquationEngine';
import { Calculator, Plus, Sparkles } from 'lucide-react';

interface EquationModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (latex: string, html: string) => void;
}

export function EquationModal({ open, onClose, onInsert }: EquationModalProps) {
  const [latex, setLatex] = useState('E = mc^2');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleSymbolClick = (symLatex: string) => {
    setLatex(prev => `${prev} ${symLatex} `);
  };

  const handlePresetSelect = (presetLatex: string) => {
    setLatex(presetLatex);
  };

  const handleInsert = () => {
    if (!latex.trim()) return;
    const html = EquationEngine.renderLatexToHtml(latex.trim(), true);
    onInsert(latex.trim(), html);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Equation & Math Formula Editor
          </DialogTitle>
          <DialogDescription>
            Insert mathematical expressions using LaTeX notation or choose from standard presets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Live Preview Box */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 min-h-[80px] flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-wider">Formula Preview</span>
            <div
              className="text-lg font-serif"
              dangerouslySetInnerHTML={{ __html: EquationEngine.renderLatexToHtml(latex || '...', true) }}
            />
          </div>

          {/* LaTeX Input */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              LaTeX Code
            </label>
            <Input
              value={latex}
              onChange={e => setLatex(e.target.value)}
              placeholder="e.g. \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
              className="font-mono text-sm"
            />
          </div>

          {/* Quick Symbol Toolbar */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1.5">Mathematical Symbols & Operators</span>
            <div className="flex flex-wrap gap-1 p-2 rounded-lg border border-border bg-muted/30 max-h-24 overflow-y-auto">
              {MATH_SYMBOLS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSymbolClick(item.latex)}
                  title={`${item.label} (${item.latex})`}
                  className="h-7 w-7 rounded bg-background hover:bg-primary hover:text-primary-foreground text-sm font-medium border border-border/50 flex items-center justify-center transition-colors"
                >
                  {item.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Presets */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground block mb-1.5">Standard Academic Presets</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
              {EQUATION_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.latex)}
                  className="p-2 text-left rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-muted/50 transition-all text-xs flex flex-col justify-between"
                >
                  <span className="font-semibold text-foreground truncate">{preset.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate mt-1">{preset.previewText}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInsert} className="gap-1.5">
            <Plus className="h-4 w-4" /> Insert Equation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
