import React from 'react';
import {
  ResumeDesignConfig, ResumeHeaderLayout, RESUME_PALETTES
} from '@/engines/ResumeEngine';
import {
  Palette, Type, Sliders, Layout, Sparkles, Check,
  Columns, AlignLeft, AlignCenter, AlignJustify, FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeDesignPanelProps {
  design: ResumeDesignConfig;
  onChange: (updatedDesign: ResumeDesignConfig) => void;
}

const FONT_OPTIONS = [
  { name: 'Inter (Clean Sans)', value: 'Inter' },
  { name: 'Roboto (Modern Sans)', value: 'Roboto' },
  { name: 'Merriweather (Academic Serif)', value: 'Merriweather' },
  { name: 'Playfair Display (Executive Serif)', value: 'Playfair Display' },
  { name: 'Georgia (Editorial Serif)', value: 'Georgia' },
  { name: 'JetBrains Mono (Developer)', value: 'JetBrains Mono' },
  { name: 'Arial (Standard ATS)', value: 'Arial' },
];

const HEADER_LAYOUTS: { id: ResumeHeaderLayout; name: string; desc: string }[] = [
  { id: 'modern', name: 'Modern Left', desc: 'Standard left-aligned title with right photo' },
  { id: 'centered', name: 'Centered', desc: 'Centered name and contact cluster' },
  { id: 'split', name: 'Split Header', desc: 'Name on left, contact items stacked right' },
  { id: 'minimal', name: 'Minimal ATS', desc: 'Single-line compact contact divider' },
  { id: 'compact', name: 'Compact Line', desc: 'Single-row inline name and title' },
  { id: 'executive', name: 'Executive', desc: 'Prominent leadership typography' },
  { id: 'classic', name: 'Classic Pro', desc: 'Traditional corporate layout' },
];

export function ResumeDesignPanel({ design, onChange }: ResumeDesignPanelProps) {
  const updateDesign = (patch: Partial<ResumeDesignConfig>) => {
    onChange({ ...design, ...patch });
  };

  const applyPalette = (paletteId: string) => {
    const pal = RESUME_PALETTES.find(p => p.id === paletteId);
    if (!pal) return;
    updateDesign({
      palette: paletteId,
      colors: { ...pal.colors },
    });
  };

  const applyTypographyPreset = (preset: 'small' | 'normal' | 'large') => {
    if (preset === 'small') {
      updateDesign({
        typographyPreset: 'small',
        nameSize: 22,
        headingSize: 11.5,
        bodySize: 10,
        metadataSize: 9,
        lineHeight: 1.35,
      });
    } else if (preset === 'large') {
      updateDesign({
        typographyPreset: 'large',
        nameSize: 28,
        headingSize: 14,
        bodySize: 12,
        metadataSize: 10.5,
        lineHeight: 1.6,
      });
    } else {
      updateDesign({
        typographyPreset: 'normal',
        nameSize: 26,
        headingSize: 12.5,
        bodySize: 11,
        metadataSize: 10,
        lineHeight: 1.5,
      });
    }
  };

  const applySpacingPreset = (preset: 'compact' | 'balanced' | 'comfortable') => {
    if (preset === 'compact') {
      updateDesign({
        spacingPreset: 'compact',
        spacing: {
          pageMargin: 20,
          sectionGap: 10,
          entryGap: 8,
          paragraphGap: 2,
          lineHeight: 1.35,
        },
      });
    } else if (preset === 'comfortable') {
      updateDesign({
        spacingPreset: 'comfortable',
        spacing: {
          pageMargin: 40,
          sectionGap: 22,
          entryGap: 16,
          paragraphGap: 6,
          lineHeight: 1.65,
        },
      });
    } else {
      updateDesign({
        spacingPreset: 'balanced',
        spacing: {
          pageMargin: 32,
          sectionGap: 16,
          entryGap: 12,
          paragraphGap: 4,
          lineHeight: 1.5,
        },
      });
    }
  };

  return (
    <div className="space-y-5 text-xs">
      {/* ── 1. Header Layout ────────────────────────────────────────────── */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
          <Layout className="h-3.5 w-3.5 text-primary" /> Header Layout ({HEADER_LAYOUTS.length})
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {HEADER_LAYOUTS.map(hl => (
            <button
              key={hl.id}
              type="button"
              onClick={() => updateDesign({ headerLayout: hl.id })}
              className={cn(
                'p-2 rounded-lg border text-left transition-all cursor-pointer',
                design.headerLayout === hl.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary text-primary font-bold shadow-2xs'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px]">{hl.name}</span>
                {design.headerLayout === hl.id && <Check className="h-3 w-3" />}
              </div>
              <span className="text-[9px] font-normal text-muted-foreground line-clamp-1 block mt-0.5">
                {hl.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Typography Controls ──────────────────────────────────────── */}
      <div className="space-y-3 pt-3 border-t border-border/80">
        <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-primary" /> Typography &amp; Font Family
        </label>

        {/* Font Select */}
        <select
          value={design.fontFamily}
          onChange={e => updateDesign({ fontFamily: e.target.value })}
          className="w-full h-8 text-xs px-2.5 rounded-lg border border-border bg-background text-foreground font-medium outline-none focus:border-primary"
        >
          {FONT_OPTIONS.map(f => (
            <option key={f.value} value={f.value}>
              {f.name}
            </option>
          ))}
        </select>

        {/* Font Size Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground">Scale Preset</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['small', 'normal', 'large'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => applyTypographyPreset(p)}
                className={cn(
                  'py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all',
                  design.typographyPreset === p
                    ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Fine-tune Typography Inputs */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div>
            <label className="text-[10px] text-muted-foreground font-medium">Name Size: {design.nameSize}px</label>
            <input
              type="range"
              min={18}
              max={36}
              value={design.nameSize}
              onChange={e => updateDesign({ nameSize: Number(e.target.value), typographyPreset: 'custom' })}
              className="w-full accent-primary h-1.5"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium">Heading Size: {design.headingSize}px</label>
            <input
              type="range"
              min={10}
              max={18}
              step={0.5}
              value={design.headingSize}
              onChange={e => updateDesign({ headingSize: Number(e.target.value), typographyPreset: 'custom' })}
              className="w-full accent-primary h-1.5"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium">Body Size: {design.bodySize}px</label>
            <input
              type="range"
              min={9}
              max={14}
              step={0.5}
              value={design.bodySize}
              onChange={e => updateDesign({ bodySize: Number(e.target.value), typographyPreset: 'custom' })}
              className="w-full accent-primary h-1.5"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground font-medium">Line Spacing: {design.lineHeight}</label>
            <input
              type="range"
              min={1.2}
              max={1.8}
              step={0.05}
              value={design.lineHeight}
              onChange={e => updateDesign({ lineHeight: Number(e.target.value), typographyPreset: 'custom' })}
              className="w-full accent-primary h-1.5"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Color Palettes ───────────────────────────────────────────── */}
      <div className="space-y-3 pt-3 border-t border-border/80">
        <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-primary" /> Curated Color Palettes
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {RESUME_PALETTES.map(pal => (
            <button
              key={pal.id}
              type="button"
              onClick={() => applyPalette(pal.id)}
              className={cn(
                'p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer',
                design.palette === pal.id
                  ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-2xs font-semibold'
                  : 'border-border bg-background hover:bg-muted/30'
              )}
            >
              <div className="flex items-center gap-1">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.colors.primary }} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.colors.accent }} />
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.colors.heading }} />
              </div>
              <span className="text-[10px] text-foreground truncate w-full">{pal.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Custom Color Pickers */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="flex items-center justify-between p-1.5 border border-border rounded-md bg-background">
            <span className="text-[10px] text-muted-foreground font-medium">Primary</span>
            <input
              type="color"
              value={design.colors.primary}
              onChange={e =>
                updateDesign({
                  colors: { ...design.colors, primary: e.target.value },
                  palette: 'custom',
                })
              }
              className="h-5 w-7 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>

          <div className="flex items-center justify-between p-1.5 border border-border rounded-md bg-background">
            <span className="text-[10px] text-muted-foreground font-medium">Heading</span>
            <input
              type="color"
              value={design.colors.heading}
              onChange={e =>
                updateDesign({
                  colors: { ...design.colors, heading: e.target.value },
                  palette: 'custom',
                })
              }
              className="h-5 w-7 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* ── 4. Spacing & Margins ────────────────────────────────────────── */}
      <div className="space-y-3 pt-3 border-t border-border/80">
        <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-primary" /> Spacing &amp; Margins
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {(['compact', 'balanced', 'comfortable'] as const).map(sp => (
            <button
              key={sp}
              type="button"
              onClick={() => applySpacingPreset(sp)}
              className={cn(
                'py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all',
                design.spacingPreset === sp
                  ? 'border-primary bg-primary text-primary-foreground shadow-2xs'
                  : 'border-border bg-background text-muted-foreground hover:text-foreground'
              )}
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Paper Size */}
        <div className="flex items-center justify-between p-2 border border-border rounded-lg bg-background">
          <span className="text-[11px] font-semibold text-foreground">Paper Format:</span>
          <div className="flex items-center gap-1">
            {(['A4', 'Letter'] as const).map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => updateDesign({ paperSize: fmt })}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-semibold border transition-all',
                  design.paperSize === fmt
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-muted/40 text-muted-foreground'
                )}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Section & Bullet Styling ─────────────────────────────────── */}
      <div className="space-y-3 pt-3 border-t border-border/80">
        <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Section Heading Style
        </label>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'underline', name: 'Underline' },
            { id: 'left-border', name: 'Left Accent' },
            { id: 'banner', name: 'Banner Bar' },
            { id: 'minimal-uppercase', name: 'Minimal Plain' },
            { id: 'bold-divider', name: 'Bold Divider' },
          ].map(hs => (
            <button
              key={hs.id}
              type="button"
              onClick={() => updateDesign({ headingStyle: hs.id as any })}
              className={cn(
                'py-1.5 px-2 rounded-lg border text-xs font-medium transition-all text-left',
                design.headingStyle === hs.id
                  ? 'border-primary bg-primary/10 text-primary font-bold ring-1 ring-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/30'
              )}
            >
              {hs.name}
            </button>
          ))}
        </div>

        {/* Bullet style */}
        <div className="pt-1">
          <span className="text-[10px] font-semibold text-muted-foreground block mb-1">Bullet Style</span>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'dot', name: '• Circle' },
              { id: 'dash', name: '▪ Square' },
              { id: 'minimal', name: 'None' },
            ].map(bs => (
              <button
                key={bs.id}
                type="button"
                onClick={() => updateDesign({ bulletStyle: bs.id as any })}
                className={cn(
                  'py-1 rounded text-xs font-medium border transition-all text-center',
                  design.bulletStyle === bs.id
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                {bs.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
