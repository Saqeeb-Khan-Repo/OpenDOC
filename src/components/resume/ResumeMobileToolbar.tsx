import React from 'react';
import {
  FileText, Palette, Layers, Layout, Download, Eye, Sparkles
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeMobileToolbarProps {
  activeSheet: 'none' | 'content' | 'design' | 'sections' | 'templates';
  onSelectSheet: (sheet: 'none' | 'content' | 'design' | 'sections' | 'templates') => void;
  onExportPdf: () => void;
}

export function ResumeMobileToolbar({
  activeSheet,
  onSelectSheet,
  onExportPdf,
}: ResumeMobileToolbarProps) {
  const toggleSheet = (target: 'content' | 'design' | 'sections' | 'templates') => {
    onSelectSheet(activeSheet === target ? 'none' : target);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border px-3 py-1.5 flex items-center justify-around md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] select-none">
      <button
        type="button"
        onClick={() => toggleSheet('content')}
        className={cn(
          'flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer',
          activeSheet === 'content'
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <FileText className="h-4 w-4" />
        <span>Content</span>
      </button>

      <button
        type="button"
        onClick={() => toggleSheet('sections')}
        className={cn(
          'flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer',
          activeSheet === 'sections'
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Layers className="h-4 w-4" />
        <span>Sections</span>
      </button>

      <button
        type="button"
        onClick={() => toggleSheet('design')}
        className={cn(
          'flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer',
          activeSheet === 'design'
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Palette className="h-4 w-4" />
        <span>Design</span>
      </button>

      <button
        type="button"
        onClick={() => toggleSheet('templates')}
        className={cn(
          'flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer',
          activeSheet === 'templates'
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Layout className="h-4 w-4" />
        <span>Templates</span>
      </button>

      <button
        type="button"
        onClick={onExportPdf}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-bold text-primary transition-all hover:bg-primary/10 cursor-pointer"
      >
        <Download className="h-4 w-4" />
        <span>PDF</span>
      </button>
    </div>
  );
}
