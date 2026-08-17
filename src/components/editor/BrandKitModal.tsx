import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandKitEngine, BrandKit, DEFAULT_BRAND_KITS } from '@/engines/BrandKitEngine';
import {
  Palette, Check, Plus, Sliders, Type, Image as ImageIcon,
  Sparkles, Layers
} from 'lucide-react';

interface BrandKitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyKit: (kit: BrandKit) => void;
}

export function BrandKitModal({
  open,
  onOpenChange,
  onApplyKit,
}: BrandKitModalProps) {
  const [kits, setKits] = useState<BrandKit[]>(() => BrandKitEngine.getKits());
  const [activeKitId, setActiveKitId] = useState<string>(() => BrandKitEngine.getActiveKit().id);
  const [isEditing, setIsEditing] = useState(false);

  const selectedKit = kits.find(k => k.id === activeKitId) || kits[0];

  const handleSelectKit = (kit: BrandKit) => {
    setActiveKitId(kit.id);
    BrandKitEngine.setActiveKit(kit.id);
  };

  const handleApply = () => {
    if (selectedKit) {
      onApplyKit(selectedKit);
      onOpenChange(false);
    }
  };

  const handleUpdateActiveKit = (patch: Partial<BrandKit>) => {
    const updated = { ...selectedKit, ...patch };
    BrandKitEngine.saveKit(updated);
    setKits(BrandKitEngine.getKits());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Brand Kit &amp; Design System</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Apply consistent brand palettes, typography, and logos across all documents and slides.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-2">
          {/* Left Column: Preset Kits */}
          <div className="space-y-1.5 sm:border-r sm:border-border sm:pr-3">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
              Brand Profiles
            </label>
            {kits.map(k => {
              const isSelected = k.id === activeKitId;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => handleSelectKit(k)}
                  className={`w-full p-2 rounded-md border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:border-primary/40 hover:bg-accent/40'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-[11px] truncate">{k.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.primaryColor }} />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.secondaryColor }} />
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: k.accentColor }} />
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Right Column: Customization Controls */}
          <div className="sm:col-span-2 space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Kit Name
              </label>
              <Input
                value={selectedKit.name}
                onChange={e => handleUpdateActiveKit({ name: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Color Palette
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">Primary</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="color"
                      value={selectedKit.primaryColor}
                      onChange={e => handleUpdateActiveKit({ primaryColor: e.target.value })}
                      className="h-6 w-6 rounded border cursor-pointer p-0 shrink-0"
                    />
                    <span className="font-mono text-[10px] truncate">{selectedKit.primaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground">Secondary</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="color"
                      value={selectedKit.secondaryColor}
                      onChange={e => handleUpdateActiveKit({ secondaryColor: e.target.value })}
                      className="h-6 w-6 rounded border cursor-pointer p-0 shrink-0"
                    />
                    <span className="font-mono text-[10px] truncate">{selectedKit.secondaryColor}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground">Accent</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <input
                      type="color"
                      value={selectedKit.accentColor}
                      onChange={e => handleUpdateActiveKit({ accentColor: e.target.value })}
                      className="h-6 w-6 rounded border cursor-pointer p-0 shrink-0"
                    />
                    <span className="font-mono text-[10px] truncate">{selectedKit.accentColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Typography Fonts
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-muted-foreground">Headings Font</span>
                  <select
                    value={selectedKit.headingFont}
                    onChange={e => handleUpdateActiveKit({ headingFont: e.target.value })}
                    className="h-7 w-full text-[11px] bg-background border border-border rounded px-1.5 mt-0.5"
                  >
                    <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                    <option value="Georgia, serif">Georgia (Classic Serif)</option>
                    <option value="Playfair Display, serif">Playfair Display (Editorial)</option>
                    <option value="Merriweather, serif">Merriweather (Academic)</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground">Body Font</span>
                  <select
                    value={selectedKit.bodyFont}
                    onChange={e => handleUpdateActiveKit({ bodyFont: e.target.value })}
                    className="h-7 w-full text-[11px] bg-background border border-border rounded px-1.5 mt-0.5"
                  >
                    <option value="Inter, sans-serif">Inter</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Times New Roman, serif">Times New Roman</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div>
              <span className="text-[10px] text-muted-foreground">Brand Motto / Tagline</span>
              <Input
                value={selectedKit.tagline || ''}
                onChange={e => handleUpdateActiveKit({ tagline: e.target.value })}
                placeholder="E.g., Empowering Next-Gen Intelligence..."
                className="h-7 text-xs mt-0.5"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply} className="gap-1 bg-primary font-semibold">
            <Check className="h-3.5 w-3.5" /> Apply Brand Kit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
