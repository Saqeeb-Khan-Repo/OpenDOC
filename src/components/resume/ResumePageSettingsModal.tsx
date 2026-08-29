import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ResumePageSettings, ResumePageSize, ResumeOrientation, ResumeMarginPreset,
  DEFAULT_PAGE_SETTINGS
} from '@/engines/ResumeEngine';
import {
  Layout, Sliders, Check, Link2, Unlink2, Maximize2, RotateCw, AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumePageSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSettings?: ResumePageSettings;
  onChange: (settings: ResumePageSettings) => void;
}

export function ResumePageSettingsModal({
  open,
  onOpenChange,
  pageSettings = DEFAULT_PAGE_SETTINGS,
  onChange,
}: ResumePageSettingsModalProps) {
  const [settings, setSettings] = useState<ResumePageSettings>({ ...pageSettings });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleUpdate = (updates: Partial<ResumePageSettings>) => {
    const updated = { ...settings, ...updates };

    // Validation checks
    if (updated.marginTop < 0 || updated.marginBottom < 0 || updated.marginLeft < 0 || updated.marginRight < 0) {
      setValidationError('Margins cannot be negative.');
      return;
    }

    if (updated.marginLeft + updated.marginRight > 180) {
      setValidationError('Left + Right margins are too large for this page.');
      return;
    }

    if (updated.marginTop + updated.marginBottom > 260) {
      setValidationError('Top + Bottom margins are too large for this page.');
      return;
    }

    setValidationError(null);
    setSettings(updated);
    onChange(updated);
  };

  const handleMarginChange = (side: 'top' | 'bottom' | 'left' | 'right', val: number) => {
    const num = Math.max(0, Math.min(60, val));
    if (settings.linkedMargins) {
      if (side === 'top' || side === 'bottom') {
        handleUpdate({ marginTop: num, marginBottom: num, marginPreset: 'custom' });
      } else {
        handleUpdate({ marginLeft: num, marginRight: num, marginPreset: 'custom' });
      }
    } else {
      if (side === 'top') handleUpdate({ marginTop: num, marginPreset: 'custom' });
      if (side === 'bottom') handleUpdate({ marginBottom: num, marginPreset: 'custom' });
      if (side === 'left') handleUpdate({ marginLeft: num, marginPreset: 'custom' });
      if (side === 'right') handleUpdate({ marginRight: num, marginPreset: 'custom' });
    }
  };

  const applyPreset = (preset: ResumeMarginPreset) => {
    let top = 15;
    let bottom = 15;
    let left = 15;
    let right = 15;

    if (preset === 'narrow') {
      top = 8; bottom = 8; left = 8; right = 8;
    } else if (preset === 'normal') {
      top = 15; bottom = 15; left = 15; right = 15;
    } else if (preset === 'wide') {
      top = 25; bottom = 25; left = 25; right = 25;
    }

    handleUpdate({
      marginTop: top,
      marginBottom: bottom,
      marginLeft: left,
      marginRight: right,
      marginPreset: preset,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] p-5 max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-2xs">
              <Layout className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Page Setup &amp; Margins</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure exact document page dimensions, orientation, and print margins.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2 flex-1 overflow-y-auto pr-1 text-xs">
          {validationError && (
            <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* ── Page Size Selector ─────────────────────────────────────────── */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
              Page Dimensions
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'A4', label: 'A4 (210×297mm)' },
                { id: 'Letter', label: 'Letter (8.5×11in)' },
                { id: 'Legal', label: 'Legal (8.5×14in)' },
                { id: 'A3', label: 'A3 (297×420mm)' },
                { id: 'A5', label: 'A5 (148×210mm)' },
                { id: 'Custom', label: 'Custom Size' },
              ].map(fmt => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleUpdate({ pageSize: fmt.id as ResumePageSize })}
                  className={cn(
                    'py-2 px-2 rounded-lg text-xs font-semibold border text-center transition-all cursor-pointer',
                    settings.pageSize === fmt.id
                      ? 'border-primary bg-primary text-primary-foreground shadow-2xs font-bold'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Custom Dimensions Form */}
            {settings.pageSize === 'Custom' && (
              <div className="grid grid-cols-3 gap-2 mt-2 p-2.5 bg-muted/20 border border-border/80 rounded-xl">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Width</label>
                  <Input
                    type="number"
                    value={settings.customWidth || 210}
                    onChange={e => handleUpdate({ customWidth: parseFloat(e.target.value) || 210 })}
                    className="h-7 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Height</label>
                  <Input
                    type="number"
                    value={settings.customHeight || 297}
                    onChange={e => handleUpdate({ customHeight: parseFloat(e.target.value) || 297 })}
                    className="h-7 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1">Unit</label>
                  <select
                    value={settings.unit || 'mm'}
                    onChange={e => handleUpdate({ unit: e.target.value as any })}
                    className="h-7 w-full text-xs font-medium bg-background border border-border rounded-md px-2"
                  >
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                    <option value="px">px</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* ── Orientation Selector ───────────────────────────────────────── */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
              Orientation
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleUpdate({ orientation: 'portrait' })}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
                  settings.orientation === 'portrait'
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="w-3.5 h-4.5 border border-current rounded-[2px]" />
                <span>Portrait</span>
              </button>

              <button
                type="button"
                onClick={() => handleUpdate({ orientation: 'landscape' })}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer',
                  settings.orientation === 'landscape'
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                <div className="w-4.5 h-3.5 border border-current rounded-[2px]" />
                <span>Landscape</span>
              </button>
            </div>
          </div>

          {/* ── Margin Presets & Link Switch ───────────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Margins (mm)
              </label>

              <button
                type="button"
                onClick={() => handleUpdate({ linkedMargins: !settings.linkedMargins })}
                className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer font-medium"
              >
                {settings.linkedMargins ? (
                  <>
                    <Link2 className="h-3 w-3" /> Linked Margins
                  </>
                ) : (
                  <>
                    <Unlink2 className="h-3 w-3" /> Independent Margins
                  </>
                )}
              </button>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'narrow', label: 'Narrow (8mm)' },
                { id: 'normal', label: 'Normal (15mm)' },
                { id: 'wide', label: 'Wide (25mm)' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id as any)}
                  className={cn(
                    'py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer',
                    settings.marginPreset === p.id
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* ── Visual Margin Box & Inputs Grid ─────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-2">
              {/* Visual Page & Margin Diagram */}
              <div className="bg-muted/30 border border-border/80 rounded-xl p-3 flex flex-col items-center justify-center relative min-h-[160px]">
                <span className="text-[9px] font-mono text-muted-foreground absolute top-1">
                  TOP: {settings.marginTop}mm
                </span>
                <span className="text-[9px] font-mono text-muted-foreground absolute bottom-1">
                  BOTTOM: {settings.marginBottom}mm
                </span>
                <span className="text-[9px] font-mono text-muted-foreground absolute left-1">
                  {settings.marginLeft}mm
                </span>
                <span className="text-[9px] font-mono text-muted-foreground absolute right-1">
                  {settings.marginRight}mm
                </span>

                {/* Inner Sheet */}
                <div
                  className="border border-dashed border-primary bg-background shadow-xs rounded flex items-center justify-center transition-all"
                  style={{
                    width: `${Math.max(60, 120 - settings.marginLeft - settings.marginRight)}px`,
                    height: `${Math.max(60, 140 - settings.marginTop - settings.marginBottom)}px`,
                  }}
                >
                  <span className="text-[9px] font-bold text-primary select-none">
                    RESUME CONTENT
                  </span>
                </div>
              </div>

              {/* Number Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Top (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.marginTop}
                    onChange={e => handleMarginChange('top', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Bottom (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.marginBottom}
                    onChange={e => handleMarginChange('bottom', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Left (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.marginLeft}
                    onChange={e => handleMarginChange('left', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Right (mm)</label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.marginRight}
                    onChange={e => handleMarginChange('right', parseInt(e.target.value) || 0)}
                    className="h-7 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs font-bold bg-primary text-primary-foreground shadow-2xs cursor-pointer w-full"
          >
            <Check className="h-3.5 w-3.5 mr-1" /> Apply Page Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
