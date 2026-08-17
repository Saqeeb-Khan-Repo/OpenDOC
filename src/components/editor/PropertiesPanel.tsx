import React from 'react';
import { CanvasElement } from '@/engines/types';
import { Input } from '@/components/ui/input';
import { Sliders, RotateCw, Sparkles, Type, Paintbrush } from 'lucide-react';

interface PropertiesPanelProps {
  element: CanvasElement | null;
  onChange: (updated: Partial<CanvasElement>) => void;
}

export function PropertiesPanel({ element, onChange }: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="w-64 border-l border-border bg-card p-4 text-xs text-muted-foreground italic select-none">
        <p className="text-center mt-8">Select an element to customize properties, colors, and layout.</p>
      </div>
    );
  }

  const { transform, style } = element;

  const updateTransform = (patch: Partial<typeof transform>) => {
    onChange({ transform: { ...transform, ...patch } });
  };

  const updateStyle = (patch: Partial<typeof style>) => {
    onChange({ style: { ...style, ...patch } });
  };

  return (
    <div className="w-64 border-l border-border bg-card p-3.5 space-y-4 overflow-y-auto text-xs select-none">
      <div className="flex items-center gap-1.5 font-semibold text-xs border-b border-border pb-2">
        <Sliders className="h-4 w-4 text-primary" />
        <span className="capitalize">{element.shapeType || element.type} Properties</span>
      </div>

      {/* Dimensions & Position */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Transform</span>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-muted-foreground">X (px)</span>
            <Input
              type="number"
              value={Math.round(transform.x)}
              onChange={e => updateTransform({ x: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Y (px)</span>
            <Input
              type="number"
              value={Math.round(transform.y)}
              onChange={e => updateTransform({ y: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Width</span>
            <Input
              type="number"
              value={Math.round(transform.width)}
              onChange={e => updateTransform({ width: Math.max(20, parseFloat(e.target.value) || 20) })}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Height</span>
            <Input
              type="number"
              value={Math.round(transform.height)}
              onChange={e => updateTransform({ height: Math.max(20, parseFloat(e.target.value) || 20) })}
              className="h-7 text-xs"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground">Rotation (deg)</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={Math.round(transform.rotation || 0)}
              onChange={e => updateTransform({ rotation: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs flex-1"
            />
            <RotateCw className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Colors & Appearance */}
      <div className="space-y-2 pt-2 border-t border-border">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Appearance</span>
        
        {/* Fill color */}
        <div>
          <span className="text-[10px] text-muted-foreground">Fill Color</span>
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="color"
              value={style?.fill || '#ffffff'}
              onChange={e => updateStyle({ fill: e.target.value })}
              className="h-6 w-8 p-0 rounded border cursor-pointer"
            />
            <Input
              value={style?.fill || '#ffffff'}
              onChange={e => updateStyle({ fill: e.target.value })}
              className="h-7 text-xs font-mono"
            />
          </div>
        </div>

        {/* Stroke / Border */}
        <div>
          <span className="text-[10px] text-muted-foreground">Border / Stroke</span>
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="color"
              value={style?.stroke || '#000000'}
              onChange={e => updateStyle({ stroke: e.target.value })}
              className="h-6 w-8 p-0 rounded border cursor-pointer"
            />
            <Input
              type="number"
              min={0}
              max={20}
              value={style?.strokeWidth ?? 1}
              onChange={e => updateStyle({ strokeWidth: parseFloat(e.target.value) || 0 })}
              className="h-7 text-xs w-16"
              title="Stroke Width (px)"
            />
          </div>
        </div>

        {/* Corner Radius */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Corner Radius</span>
            <span className="text-[10px] font-mono">{style?.cornerRadius || 0}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={style?.cornerRadius || 0}
            onChange={e => updateStyle({ cornerRadius: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>

        {/* Opacity */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Opacity</span>
            <span className="text-[10px] font-mono">{Math.round((style?.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={Math.round((style?.opacity ?? 1) * 100)}
            onChange={e => updateStyle({ opacity: parseInt(e.target.value) / 100 })}
            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer mt-1"
          />
        </div>
      </div>
    </div>
  );
}
