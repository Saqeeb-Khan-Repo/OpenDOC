import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeCustomSection } from '@/engines/ResumeEngine';
import { FolderPlus, Plus, Sparkles } from 'lucide-react';

interface ResumeCustomSectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSection: (section: ResumeCustomSection) => void;
}

const SECTION_SUGGESTIONS = [
  'Open Source Contributions',
  'Patents & Inventions',
  'Speaking & Keynotes',
  'Leadership & Mentorship',
  'Conferences & Workshops',
  'Industry Recognition',
  'Military Service',
  'Selected Case Studies',
];

export function ResumeCustomSectionModal({
  open,
  onOpenChange,
  onAddSection,
}: ResumeCustomSectionModalProps) {
  const [title, setTitle] = useState('');
  const [firstItemTitle, setFirstItemTitle] = useState('');
  const [firstItemDesc, setFirstItemDesc] = useState('');
  const [firstItemLink, setFirstItemLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newSection: ResumeCustomSection = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      style: 'standard',
      items: firstItemTitle.trim()
        ? [
            {
              id: `item_${Date.now()}`,
              title: firstItemTitle.trim(),
              description: firstItemDesc.trim() || undefined,
              link: firstItemLink.trim() || undefined,
              bullets: [],
            },
          ]
        : [],
    };

    onAddSection(newSection);
    setTitle('');
    setFirstItemTitle('');
    setFirstItemDesc('');
    setFirstItemLink('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-5">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Create Custom Section</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Add any tailored section to your resume (e.g. Open Source, Patents, Speaking).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div>
            <label className="text-[11px] font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              Section Title *
            </label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Open Source Projects"
              className="h-8 text-xs font-medium"
              autoFocus
            />

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SECTION_SUGGESTIONS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTitle(s)}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground border border-border/40 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border border-border/80 rounded-lg bg-muted/20 space-y-2">
            <span className="text-[11px] font-bold text-foreground block">
              First Entry (Optional)
            </span>
            <Input
              value={firstItemTitle}
              onChange={e => setFirstItemTitle(e.target.value)}
              placeholder="Item Title (e.g. Linux Kernel Contributor)"
              className="h-7 text-xs"
            />
            <Input
              value={firstItemLink}
              onChange={e => setFirstItemLink(e.target.value)}
              placeholder="Link / URL (e.g. https://github.com/...)"
              className="h-7 text-xs"
            />
            <textarea
              value={firstItemDesc}
              onChange={e => setFirstItemDesc(e.target.value)}
              placeholder="Description or summary..."
              rows={2}
              className="w-full text-xs p-2 rounded border border-border bg-background outline-none resize-none focus:border-primary"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim()}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Add Section
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
