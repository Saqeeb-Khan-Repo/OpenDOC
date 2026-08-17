import React, { useState } from 'react';
import { Slide, SlideLayout, SlideTheme, PresentationSettings, CanvasElement, SlideTransition } from '@/engines/types';
import { PRESENTATION_GRADIENTS } from '@/engines/PresentationEngine';
import {
  Sliders, Type, Square, Image as ImageIcon, Palette, ChevronRight,
  ChevronLeft, RotateCw, Crop, RefreshCw, Trash2, ArrowUpSquare,
  ArrowDownSquare, Lock, Unlock, Eye, EyeOff, Layers, Sparkles,
  Layout, Play, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

interface PresentationPropertiesPanelProps {
  activeSlide: Slide;
  selectedElement: CanvasElement | null;
  settings: PresentationSettings;
  onChangeSlide: (slide: Slide) => void;
  onChangeSettings: (settings: PresentationSettings) => void;
  onUpdateSelectedElement: (patch: Partial<CanvasElement>) => void;
  onOpenImageUploadModal: () => void;
  onOpenCropModal: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDeleteElement: () => void;
}

const TRANSITIONS: { id: SlideTransition; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'fade', label: 'Fade' },
  { id: 'slide-left', label: 'Slide Left' },
  { id: 'slide-right', label: 'Slide Right' },
  { id: 'zoom', label: 'Zoom' },
];

export function PresentationPropertiesPanel({
  activeSlide,
  selectedElement,
  settings,
  onChangeSlide,
  onChangeSettings,
  onUpdateSelectedElement,
  onOpenImageUploadModal,
  onOpenCropModal,
  onBringForward,
  onSendBackward,
  onDeleteElement,
}: PresentationPropertiesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');

  const isImage = selectedElement?.type === 'image';
  const isShape = selectedElement?.type === 'shape';
  const isText = selectedElement?.type === 'text';

  if (isCollapsed) {
    return (
      <div className="hidden xl:flex flex-col items-center py-3 px-1 border-l border-border bg-card/60 w-11 shrink-0 select-none z-10">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-3"
          title="Expand Properties Inspector"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-primary font-bold bg-primary/10"
          title="Inspector"
        >
          <Sliders className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col border-l border-border bg-card/80 backdrop-blur-xs w-68 shrink-0 select-none z-10 text-xs overflow-hidden">
      {/* ── Header Tabs ────────────────────────────────────────────────────── */}
      <div className="h-10 px-2.5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('properties')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors',
              activeTab === 'properties' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Properties
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('layers')}
            className={cn(
              'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors',
              activeTab === 'layers' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Layers ({activeSlide.elements.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted"
          title="Collapse Panel"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === 'layers' ? (
          /* ── Layers Tab ─────────────────────────────────────────────────── */
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-muted-foreground px-1 mb-2">SLIDE ELEMENTS (Z-ORDER)</div>
            {activeSlide.elements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">No elements on slide</div>
            ) : (
              <div className="space-y-1.5">
                {[...activeSlide.elements].reverse().map((el, idx) => {
                  const isSelected = selectedElement?.id === el.id;
                  const label = el.type === 'text'
                    ? el.content?.replace(/<[^>]*>/g, ' ').trim().slice(0, 20) || 'Text Block'
                    : el.type === 'shape'
                    ? `${el.shapeType || 'Shape'}`
                    : el.type;

                  return (
                    <div
                      key={el.id}
                      onClick={() => onUpdateSelectedElement({})}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all',
                        isSelected ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border bg-background hover:bg-muted/50'
                      )}
                    >
                      <span className="truncate flex-1 capitalize">{label}</span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onBringForward();
                          }}
                          className="h-5 w-5 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
                          title="Bring Forward"
                        >
                          <ArrowUpSquare className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSendBackward();
                          }}
                          className="h-5 w-5 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
                          title="Send Backward"
                        >
                          <ArrowDownSquare className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ── Properties Tab ─────────────────────────────────────────────── */
          <>
            {/* 1. Image Element Selected */}
            {isImage && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">IMAGE ACTIONS</label>
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenImageUploadModal}
                      className="w-full justify-start gap-1.5 text-xs h-8"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-primary" /> Replace Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenCropModal}
                      className="w-full justify-start gap-1.5 text-xs h-8"
                    >
                      <Crop className="h-3.5 w-3.5" /> Crop Image
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentRot = selectedElement?.transform.rotation || 0;
                        onUpdateSelectedElement({
                          transform: { ...selectedElement!.transform, rotation: (currentRot + 90) % 360 }
                        });
                      }}
                      className="w-full justify-start gap-1.5 text-xs h-8"
                    >
                      <RotateCw className="h-3.5 w-3.5" /> Rotate 90°
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">OPACITY</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={selectedElement?.style?.opacity ?? 1}
                    onChange={(e) => {
                      onUpdateSelectedElement({
                        style: { ...selectedElement?.style, opacity: parseFloat(e.target.value) }
                      });
                    }}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>10%</span>
                    <span>{Math.round((selectedElement?.style?.opacity ?? 1) * 100)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">CORNER RADIUS</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 8, 16, 999].map(r => (
                      <Button
                        key={r}
                        type="button"
                        variant={selectedElement?.style?.cornerRadius === r ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onUpdateSelectedElement({ style: { ...selectedElement?.style, cornerRadius: r } })}
                      >
                        {r === 999 ? 'Round' : `${r}px`}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onDeleteElement}
                  className="w-full text-destructive hover:bg-destructive/10 h-8 gap-1.5 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Image
                </Button>
              </div>
            )}

            {/* 2. Shape Element Selected */}
            {isShape && (
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">SHAPE FILL COLOR</label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0f172a'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateSelectedElement({ style: { ...selectedElement?.style, fill: c } })}
                        style={{ backgroundColor: c }}
                        className="h-7 rounded border border-black/10 hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">BORDER STROKE</label>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 4].map(w => (
                      <Button
                        key={w}
                        type="button"
                        variant={selectedElement?.style?.strokeWidth === w ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 flex-1 text-xs"
                        onClick={() => onUpdateSelectedElement({
                          style: {
                            ...selectedElement?.style,
                            strokeWidth: w,
                            stroke: w > 0 ? (selectedElement?.style?.stroke || '#000000') : undefined
                          }
                        })}
                      >
                        {w === 0 ? 'None' : `${w}px`}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onDeleteElement}
                  className="w-full text-destructive hover:bg-destructive/10 h-8 gap-1.5 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Shape
                </Button>
              </div>
            )}

            {/* 3. Slide & Layout Settings (Always available) */}
            <div className="border-t border-border pt-4 space-y-4">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">SLIDE TRANSITION</label>
                <div className="grid grid-cols-3 gap-1">
                  {TRANSITIONS.map(t => (
                    <Button
                      key={t.id}
                      type="button"
                      variant={activeSlide.transition === t.id ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onChangeSlide({ ...activeSlide, transition: t.id })}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">SLIDE GRADIENTS</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESENTATION_GRADIENTS.slice(0, 6).map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => onChangeSlide({ ...activeSlide, gradient: g.gradient, background: undefined })}
                      className="h-8 rounded border p-1 text-[10px] font-semibold text-left truncate hover:scale-[1.02] transition-transform"
                      style={{ background: g.gradient, color: g.headingColor }}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
