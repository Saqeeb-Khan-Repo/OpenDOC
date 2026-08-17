import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Replace, Check, ArrowRight } from 'lucide-react';

interface FindReplaceModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
  onReplaceAll: (newContent: string) => void;
}

export function FindReplaceModal({ open, onClose, content, onReplaceAll }: FindReplaceModalProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [replaceCount, setReplaceCount] = useState<number | null>(null);

  const getMatchCount = (): number => {
    if (!findText) return 0;
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
      const matches = content.match(regex);
      return matches ? matches.length : 0;
    } catch (e) {
      return 0;
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      const updated = content.replace(regex, replaceText);
      onReplaceAll(updated);
      setReplaceCount(count);
    } catch (e) {
      console.error('Replace error:', e);
    }
  };

  const matches = getMatchCount();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Find and Replace
          </DialogTitle>
          <DialogDescription>
            Search and substitute text throughout the entire document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">Find</label>
              {findText && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {matches} {matches === 1 ? 'match' : 'matches'} found
                </span>
              )}
            </div>
            <Input
              value={findText}
              onChange={e => { setFindText(e.target.value); setReplaceCount(null); }}
              placeholder="Text to search..."
              className="text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Replace with</label>
            <Input
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              placeholder="Replacement text..."
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="match-case"
              checked={matchCase}
              onChange={e => setMatchCase(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary cursor-pointer"
            />
            <label htmlFor="match-case" className="text-xs text-foreground cursor-pointer select-none">
              Match case (Case sensitive)
            </label>
          </div>

          {replaceCount !== null && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>Successfully replaced {replaceCount} occurrence{replaceCount !== 1 ? 's' : ''}!</span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleReplaceAll} disabled={!findText || matches === 0} className="gap-1.5">
            <Replace className="h-4 w-4" /> Replace All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
