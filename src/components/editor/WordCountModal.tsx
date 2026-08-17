import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Clock, AlignLeft, Hash } from 'lucide-react';
import { EditorCore } from '@/engines/EditorCore';

interface WordCountModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
}

export function WordCountModal({ open, onClose, content }: WordCountModalProps) {
  const stats = EditorCore.calculateStats(content);

  const temp = document.createElement('div');
  temp.innerHTML = content || '';
  const text = temp.innerText || temp.textContent || '';
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const speakingTimeMin = Math.max(1, Math.ceil(stats.words / 130)); // 130 WPM average speech

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Statistics
          </DialogTitle>
          <DialogDescription>
            Live word count, character metrics, paragraph breakdown, and time estimates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-primary" /> Words
            </span>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.words.toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-primary" /> Characters
            </span>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.chars.toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium">Chars (No Spaces)</span>
            <p className="text-xl font-semibold text-foreground mt-1">{charsNoSpaces.toLocaleString()}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-primary" /> Paragraphs
            </span>
            <p className="text-xl font-semibold text-foreground mt-1">{stats.paragraphs}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Reading Time
            </span>
            <p className="text-lg font-semibold text-foreground mt-1">~{stats.readTimeMin} min</p>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Speaking Time
            </span>
            <p className="text-lg font-semibold text-foreground mt-1">~{speakingTimeMin} min</p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full">Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
