import React from 'react';
import { CanvasElement } from '@/engines/types';
import { Layers, Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, Trash2, Group, Ungroup } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onBringToFront: (id: string) => void;
  onSendToBack: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleHide: (id: string) => void;
  onDelete: (id: string) => void;
}

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onToggleHide,
  onDelete,
}: LayersPanelProps) {
  // Elements ordered by zIndex descending (top layers first)
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border w-64 p-3 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-border mb-2">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          <span>Layers & Hierarchy</span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">{elements.length} items</span>
      </div>

      {/* Layer action buttons */}
      {selectedId && (
        <div className="flex items-center justify-between gap-1 p-1 mb-2 bg-muted rounded-lg">
          <Button variant="ghost" size="icon-sm" onClick={() => onBringToFront(selectedId)} title="Bring to Front">
            <ArrowUp className="h-3.5 w-3.5 text-primary" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onBringForward(selectedId)} title="Bring Forward">
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onSendBackward(selectedId)} title="Send Backward">
            <ArrowDown className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onSendToBack(selectedId)} title="Send to Back">
            <ArrowDown className="h-3.5 w-3.5 text-primary" />
          </Button>
        </div>
      )}

      {/* Layers list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground italic text-center py-6">No elements on canvas</p>
        ) : (
          sorted.map(el => {
            const isSelected = el.id === selectedId;
            return (
              <div
                key={el.id}
                onClick={() => onSelect(el.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all border ${isSelected ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-card hover:bg-muted border-border/60 text-foreground'}`}
              >
                <div className="flex items-center gap-2 truncate mr-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: el.style?.fill || '#3B82F6' }} />
                  <span className="capitalize truncate">
                    {el.shapeType || el.type} {el.groupId ? `(Group)` : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={e => { e.stopPropagation(); onToggleHide(el.id); }}
                    className="p-1 hover:text-primary text-muted-foreground"
                    title={el.hidden ? 'Show' : 'Hide'}
                  >
                    {el.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onToggleLock(el.id); }}
                    className="p-1 hover:text-primary text-muted-foreground"
                    title={el.locked ? 'Unlock' : 'Lock'}
                  >
                    {el.locked ? <Lock className="h-3 w-3 text-amber-500" /> : <Unlock className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(el.id); }}
                    className="p-1 hover:text-destructive text-muted-foreground"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
