import React, { useState, useMemo } from 'react';
import { SlideTheme } from '@/engines/types';
import { PRESENTATION_THEMES } from '@/engines/PresentationEngine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles, Palette, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PresentationThemeModalProps {
  open: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (theme: SlideTheme) => void;
}

type ThemeCategory = 'all' | 'professional' | 'modern' | 'creative' | 'technology' | 'premium' | 'academic';

const CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'all', label: 'All Themes' },
  { id: 'professional', label: 'Professional' },
  { id: 'modern', label: 'Modern' },
  { id: 'creative', label: 'Creative' },
  { id: 'technology', label: 'Technology' },
  { id: 'premium', label: 'Premium' },
  { id: 'academic', label: 'Academic' },
];

export function PresentationThemeModal({
  open,
  onClose,
  currentThemeId,
  onSelectTheme,
}: PresentationThemeModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = useMemo(() => {
    return PRESENTATION_THEMES.filter(theme => {
      const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' ||
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (theme.description && theme.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        theme.headingFont.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-2">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
              <Palette className="h-5 w-5 text-primary" />
              <span>Premium Presentation Theme Gallery</span>
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Choose from 30 professionally designed themes. Applies instantly while preserving 100% of your text, images, shapes, and custom layouts.
          </DialogDescription>
        </DialogHeader>

        {/* ── Category Filters & Search ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 my-2 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search themes or fonts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* ── Themes Grid (Responsive 4-col desktop, 3-col tablet, 2-col mobile) ── */}
        <div className="flex-1 overflow-y-auto pr-1 py-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
            {filteredThemes.map(theme => {
              const isSelected = currentThemeId === theme.id;
              const isGradient = !!theme.gradientBackground;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    onSelectTheme(theme);
                    onClose();
                  }}
                  className={cn(
                    'group relative flex flex-col text-left rounded-xl border p-2.5 sm:p-3 transition-all duration-200 cursor-pointer overflow-hidden',
                    'hover:shadow-md hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:bg-card/80'
                  )}
                >
                  {/* Theme Header */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors truncate block">
                        {theme.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-mono truncate">
                        {theme.headingFont}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Visual Slide Mini Preview Mockup */}
                  <div
                    className="w-full h-24 sm:h-28 rounded-lg border flex flex-col justify-between p-2.5 relative overflow-hidden transition-transform group-hover:scale-[1.01]"
                    style={{
                      background: isGradient ? theme.gradientBackground : theme.backgroundColor,
                      borderColor: theme.borderColor || '#e2e8f0',
                      color: theme.textColor,
                    }}
                  >
                    <div>
                      <div
                        className="text-xs sm:text-sm font-extrabold truncate"
                        style={{
                          fontFamily: theme.headingFont,
                          color: isGradient ? '#ffffff' : theme.primaryColor,
                        }}
                      >
                        {theme.name}
                      </div>
                      <div
                        className="text-[9px] sm:text-[10px] line-clamp-2 mt-0.5 opacity-80 leading-tight"
                        style={{ fontFamily: theme.bodyFont, color: theme.textColor }}
                      >
                        {theme.description || 'PowerPoint & Canva level slide design.'}
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1 pt-1 border-t border-black/10 dark:border-white/10">
                      <div
                        className="h-3 w-3 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.primaryColor }}
                        title="Primary"
                      />
                      {theme.secondaryColor && (
                        <div
                          className="h-3 w-3 rounded-full border border-black/20"
                          style={{ backgroundColor: theme.secondaryColor }}
                          title="Secondary"
                        />
                      )}
                      <div
                        className="h-3 w-3 rounded-full border border-black/20"
                        style={{ backgroundColor: theme.accentColor }}
                        title="Accent"
                      />
                      <span className="text-[8px] sm:text-[9px] ml-auto font-mono opacity-60 uppercase truncate">
                        {theme.category || 'Theme'}
                      </span>
                    </div>
                  </div>

                  {/* Select Badge */}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground truncate max-w-[110px]">
                      {theme.bodyFont}
                    </span>
                    <span className={cn(
                      'text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded transition-colors shrink-0',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}>
                      {isSelected ? 'Active' : 'Apply'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredThemes.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-xs">
              No themes found matching "{searchQuery}". Try selecting "All Themes".
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
