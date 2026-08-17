import React from 'react';
import { PageMargin } from '@/engines/types';

interface HorizontalRulerProps {
  widthPx: number;
  margins: PageMargin;
  onChangeMargins?: (margins: PageMargin) => void;
}

export function HorizontalRuler({ widthPx, margins }: HorizontalRulerProps) {
  // Render ticks every 50px with major numbers
  const tickCount = Math.floor(widthPx / 20);
  const ticks = Array.from({ length: tickCount }, (_, i) => i * 20);

  return (
    <div
      className="h-6 bg-muted/60 border-b border-border text-[9px] font-mono text-muted-foreground select-none relative flex items-end mx-auto shadow-sm"
      style={{ width: `${widthPx}px` }}
    >
      {/* Left Margin Shadow Zone */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-primary/10 border-r border-primary/30"
        style={{ width: `${margins.left * 3.78}px` }}
        title={`Left Margin: ${margins.left}mm`}
      />

      {/* Right Margin Shadow Zone */}
      <div
        className="absolute top-0 bottom-0 right-0 bg-primary/10 border-l border-primary/30"
        style={{ width: `${margins.right * 3.78}px` }}
        title={`Right Margin: ${margins.right}mm`}
      />

      {/* Ticks */}
      {ticks.map(pos => {
        const isMajor = pos % 100 === 0;
        const isMedium = pos % 50 === 0;
        const height = isMajor ? 'h-3.5' : isMedium ? 'h-2.5' : 'h-1.5';
        const cm = Math.round(pos / 37.8);

        return (
          <div
            key={pos}
            className={`absolute bottom-0 border-l border-muted-foreground/40 ${height}`}
            style={{ left: `${pos}px` }}
          >
            {isMajor && pos > 0 && (
              <span className="absolute -top-3.5 -left-2 text-[8px] font-semibold text-muted-foreground">
                {cm}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
