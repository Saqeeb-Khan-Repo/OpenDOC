import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MagicDesignEngine, DesignPreset, MAGIC_DESIGN_PRESETS } from '@/engines/MagicDesignEngine';
import {
  Sparkles, Check, Wand2, Layout, Eye, Palette
} from 'lucide-react';

interface MagicDesignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyPreset: (preset: DesignPreset) => void;
}

export function MagicDesignModal({
  open,
  onOpenChange,
  onApplyPreset,
}: MagicDesignModalProps) {
  const presets = MAGIC_DESIGN_PRESETS;
  const [selectedId, setSelectedId] = useState(presets[0].id);

  const selectedPreset = presets.find(p => p.id === selectedId) || presets[0];

  const handleApply = () => {
    onApplyPreset(selectedPreset);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Magic Design &amp; Smart Styling</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Instantly restyle your document or presentation with harmonized typography, framing, and color accents.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 my-2">
          {/* Preset Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {presets.map(preset => {
              const isSelected = preset.id === selectedId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedId(preset.id)}
                  className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/5 scale-[1.02]'
                      : 'border-border/70 hover:border-primary/40 hover:bg-accent/40'
                  }`}
                  style={{
                    borderTop: `4px solid ${preset.primaryColor}`,
                  }}
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      {preset.category}
                    </span>
                    <h4 className="font-semibold text-xs text-foreground truncate">{preset.name}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2">
                    <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[80px]">
                      {preset.headingFont.split(',')[0]}
                    </span>
                    {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Selected Style Preview
              </span>
              <p className="text-sm font-bold text-foreground mt-0.5" style={{ color: selectedPreset.primaryColor }}>
                {selectedPreset.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Heading Font: <strong>{selectedPreset.headingFont}</strong> • Body Font: <strong>{selectedPreset.bodyFont}</strong>
              </p>
            </div>
            <div
              className="h-10 w-24 rounded-md shadow-xs border flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: selectedPreset.backgroundGradient || selectedPreset.primaryColor }}
            >
              Style Sample
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply} className="gap-1 bg-primary font-semibold">
            <Wand2 className="h-3.5 w-3.5" /> Apply Magic Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
