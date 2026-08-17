import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ListTree, Hash, ArrowRight } from 'lucide-react';

interface HeadingItem {
  id: string;
  level: number;
  text: string;
}

interface DocumentOutlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentHtml: string;
}

export function DocumentOutlineModal({
  open,
  onOpenChange,
  documentHtml,
}: DocumentOutlineModalProps) {
  // Extract all headings with regex
  const headings: HeadingItem[] = [];
  const regex = /<h([1-4])[^>]*>(.*?)<\/h\1>/gi;
  let match;
  let counter = 0;
  while ((match = regex.exec(documentHtml)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (text) {
      headings.push({
        id: `h_${counter++}`,
        level,
        text,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <ListTree className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Document Outline &amp; Navigation</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Automatic table of contents based on heading levels (H1, H2, H3).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-1 my-2 max-h-72 overflow-y-auto pr-1">
          {headings.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground italic">
              No headings found in the document. Add H1 or H2 headings to build an outline.
            </p>
          ) : (
            headings.map(h => (
              <div
                key={h.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors group cursor-pointer"
                style={{ paddingLeft: `${(h.level - 1) * 16 + 8}px` }}
                onClick={() => onOpenChange(false)}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded font-bold ${
                    h.level === 1 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    H{h.level}
                  </span>
                  <span className={`truncate text-xs ${h.level === 1 ? 'font-bold text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {h.text}
                  </span>
                </div>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
