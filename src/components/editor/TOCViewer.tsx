import React from 'react';
import { PageEngine } from '@/engines/PageEngine';
import { List, Image as ImageIcon, Table as TableIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TOCViewerProps {
  content: string;
  onInsertTOC: (tocHtml: string) => void;
  onInsertFiguresList: (figHtml: string) => void;
}

export function TOCViewer({ content, onInsertTOC, onInsertFiguresList }: TOCViewerProps) {
  const headings = PageEngine.extractHeadingsFromHtml(content);
  const figures = PageEngine.extractFiguresFromHtml(content);

  const generateTOCHtml = () => {
    let html = `
      <div class="table-of-contents-block my-8 p-6 rounded-xl border border-border bg-card">
        <h2 style="text-align: center; color: #1e3a8a; font-size: 16pt; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
          TABLE OF CONTENTS
        </h2>
        <div style="font-family: inherit; font-size: 11pt; line-height: 2;">
    `;

    headings.forEach(h => {
      const indent = (h.level - 1) * 24;
      const isBold = h.level === 1;
      html += `
        <div style="display: flex; align-items: baseline; margin-left: ${indent}px; font-weight: ${isBold ? 'bold' : 'normal'}; color: ${isBold ? '#0f172a' : '#334155'};">
          <span style="white-space: nowrap;">${h.text}</span>
          <span style="flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 8px; min-width: 20px;"></span>
          <span style="font-family: monospace;">${h.pageNumber}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  };

  const generateFiguresHtml = () => {
    let html = `
      <div class="list-of-figures-block my-8 p-6 rounded-xl border border-border bg-card">
        <h2 style="text-align: center; color: #1e3a8a; font-size: 16pt; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 20px;">
          LIST OF FIGURES & TABLES
        </h2>
        <div style="font-family: inherit; font-size: 11pt; line-height: 2;">
    `;

    figures.forEach(f => {
      const prefix = f.type === 'figure' ? `Figure ${f.number}:` : `Table ${f.number}:`;
      html += `
        <div style="display: flex; align-items: baseline; color: #334155;">
          <strong style="margin-right: 6px; color: #1e3a8a;">${prefix}</strong>
          <span style="white-space: nowrap;">${f.caption}</span>
          <span style="flex: 1; border-bottom: 1px dotted #94a3b8; margin: 0 8px; min-width: 20px;"></span>
          <span style="font-family: monospace;">${f.pageNumber}</span>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  };

  return (
    <div className="space-y-6">
      {/* Table of Contents Box */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Table of Contents</h3>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onInsertTOC(generateTOCHtml())}>
            <Plus className="h-3 w-3" /> Insert into Doc
          </Button>
        </div>

        {headings.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Add Heading 1, 2, or 3 tags in your document to auto-generate a Table of Contents.</p>
        ) : (
          <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
            {headings.map(h => (
              <div key={h.id} className="flex items-baseline justify-between" style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                <span className={`truncate mr-2 ${h.level === 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {h.text}
                </span>
                <span className="font-mono text-muted-foreground text-[11px] shrink-0">pg {h.pageNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Figures & Tables Box */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">List of Figures & Tables</h3>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onInsertFiguresList(generateFiguresHtml())}>
            <Plus className="h-3 w-3" /> Insert into Doc
          </Button>
        </div>

        {figures.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Images with alt text and tables will automatically populate here.</p>
        ) : (
          <div className="space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
            {figures.map(f => (
              <div key={f.id} className="flex items-baseline justify-between">
                <span className="truncate mr-2 text-foreground">
                  <strong className="text-primary">{f.type === 'figure' ? 'Fig' : 'Tab'} {f.number}:</strong> {f.caption}
                </span>
                <span className="font-mono text-muted-foreground text-[11px] shrink-0">pg {f.pageNumber}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
