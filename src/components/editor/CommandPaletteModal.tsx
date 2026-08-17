import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Search, Sparkles, Presentation, FileText, Palette,
  ShieldCheck, Download, Copy, Trash2, Plus, Type,
  Square, BarChart3, GitFork, QrCode, PenTool, Layout,
  Ruler, Frame
} from 'lucide-react';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
}

interface CommandPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
}

export function CommandPaletteModal({
  open,
  onOpenChange,
  commands,
}: CommandPaletteModalProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onOpenChange(false);
        setSearch('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 text-xs gap-0 overflow-hidden shadow-2xl">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3 border-b border-border gap-2.5">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search action (e.g. AI, Export, Slide, Border)..."
            className="border-0 shadow-none focus-visible:ring-0 px-0 h-7 text-xs bg-transparent"
            autoFocus
          />
          <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground border">
            ESC
          </kbd>
        </div>

        {/* Command Items List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="text-center py-6 text-xs text-muted-foreground italic">
              No matching commands found.
            </p>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.action();
                    onOpenChange(false);
                    setSearch('');
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left transition-colors ${
                    isSelected ? 'bg-primary text-white font-medium' : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? 'text-white' : 'text-primary'}`} />
                    <span className="text-xs truncate">{cmd.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {cmd.category}
                    </span>
                  </div>
                  {cmd.shortcut && (
                    <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
