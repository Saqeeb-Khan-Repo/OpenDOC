import React, { useState, useRef } from 'react';
import { CanvasElement, ShapeType, ElementType } from '@/engines/types';
import { ElementEngine } from '@/engines/ElementEngine';
import { PropertiesPanel } from './PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { TransformBox } from './TransformBox';
import {
  Type, Square, Circle, Star, ArrowRight, Image as ImageIcon,
  QrCode, PenTool, Layers, Sliders, AlignLeft, AlignCenter,
  AlignRight, Grid, Magnet, Plus, Trash2, Shield, BarChart3,
  GitFork
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface DesignCanvasProps {
  elements: CanvasElement[];
  width: number;
  height: number;
  background: string;
  onChangeElements: (elements: CanvasElement[]) => void;
  onChangeWidth: (w: number) => void;
  onChangeHeight: (h: number) => void;
  onChangeBackground: (bg: string) => void;
  onOpenQRCodeModal: () => void;
  onOpenSignatureModal: () => void;
  onOpenChartModal: () => void;
  onOpenDiagramModal: () => void;
}

export function DesignCanvas({
  elements,
  width,
  height,
  background,
  onChangeElements,
  onChangeWidth,
  onChangeHeight,
  onChangeBackground,
  onOpenQRCodeModal,
  onOpenSignatureModal,
  onOpenChartModal,
  onOpenDiagramModal,
}: DesignCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
  const [snapToGrid, setSnapToGrid] = useState(true);

  const selectedElement = elements.find(e => e.id === selectedId) || null;

  const handleAddElement = (type: ElementType, shapeType?: ShapeType) => {
    const newEl = ElementEngine.createElement(type, {
      shapeType,
      transform: {
        x: Math.round(width / 2 - 120),
        y: Math.round(height / 2 - 40),
        width: type === 'text' ? 260 : 140,
        height: type === 'text' ? 70 : 140,
        rotation: 0,
      },
    });
    onChangeElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleUpdateElement = (id: string, patch: Partial<CanvasElement>) => {
    const next = elements.map(el => (el.id === id ? { ...el, ...patch } : el));
    onChangeElements(next);
  };

  const handleDeleteElement = (id: string) => {
    onChangeElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleDuplicateElement = (el: CanvasElement) => {
    const duplicateEl: CanvasElement = {
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transform: { ...el.transform, x: el.transform.x + 20, y: el.transform.y + 20 },
      style: { ...el.style },
    };
    onChangeElements([...elements, duplicateEl]);
    setSelectedId(duplicateEl.id);
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] dark:bg-[#090d16] overflow-hidden select-none">
      {/* ── Top Design Toolbar ────────────────────────────────────────── */}
      <div className="h-11 bg-background/95 backdrop-blur border-b border-border px-4 flex items-center justify-between shrink-0 text-xs z-20">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Add Text */}
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => handleAddElement('text')}>
            <Type className="h-3.5 w-3.5 text-primary" /> Add Text
          </Button>

          {/* Add Shapes Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Square className="h-3.5 w-3.5 text-primary" /> Shapes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44 text-xs">
              <DropdownMenuItem onClick={() => handleAddElement('shape', 'rectangle')}>Rectangle</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement('shape', 'rounded-rectangle')}>Rounded Rectangle</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement('shape', 'circle')}>Circle / Oval</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement('shape', 'star')}>Star Badge</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement('shape', 'arrow-right')}>Arrow</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddElement('shape', 'badge')}>Official Seal Badge</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Media tools */}
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenQRCodeModal}>
            <QrCode className="h-3.5 w-3.5 text-primary" /> QR Code
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenSignatureModal}>
            <PenTool className="h-3.5 w-3.5 text-primary" /> Signature
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenChartModal}>
            <BarChart3 className="h-3.5 w-3.5 text-primary" /> Chart
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onOpenDiagramModal}>
            <GitFork className="h-3.5 w-3.5 text-primary" /> Diagram
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          {/* Snap toggle */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2 text-xs gap-1 ${snapToGrid ? 'bg-primary/10 text-primary font-semibold' : ''}`}
            onClick={() => setSnapToGrid(!snapToGrid)}
            title="Snap elements to grid"
          >
            <Magnet className="h-3.5 w-3.5" /> Snap
          </Button>
        </div>

        {/* Right Tab Toggle (Properties vs Layers) */}
        <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 text-[11px] px-2.5 ${activeTab === 'properties' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('properties')}
          >
            <Sliders className="h-3 w-3 mr-1" /> Properties
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 text-[11px] px-2.5 ${activeTab === 'layers' ? 'bg-background shadow-xs text-foreground font-semibold' : 'text-muted-foreground'}`}
            onClick={() => setActiveTab('layers')}
          >
            <Layers className="h-3 w-3 mr-1" /> Layers
          </Button>
        </div>
      </div>

      {/* ── Main Canvas Stage & Sidebar ─────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Freeform Board */}
        <div
          onClick={() => setSelectedId(null)}
          className="flex-1 overflow-auto p-12 flex items-center justify-center relative bg-muted/30"
        >
          {/* Printable Canvas Box */}
          <div
            className="rounded-lg shadow-2xl relative border border-border/80 transition-all duration-100"
            style={{
              width: `${width}px`,
              height: `${height}px`,
              backgroundColor: background || '#ffffff',
            }}
          >
            {elements.map(el => {
              if (el.hidden) return null;
              const isSelected = el.id === selectedId;

              return (
                <TransformBox
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={() => setSelectedId(el.id)}
                  onChange={patch => handleUpdateElement(el.id, patch)}
                  onDelete={() => handleDeleteElement(el.id)}
                  onDuplicate={() => handleDuplicateElement(el)}
                  onBringForward={() => onChangeElements(ElementEngine.bringForward(elements, el.id))}
                  onSendBackward={() => onChangeElements(ElementEngine.sendBackward(elements, el.id))}
                  onOpenEditModal={(modalType) => {
                    if (modalType === 'chart') onOpenChartModal();
                    if (modalType === 'diagram') onOpenDiagramModal();
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right Sidebar: Properties or Layers */}
        <div className="w-64 bg-card border-l border-border flex flex-col shrink-0">
          {activeTab === 'properties' ? (
            <PropertiesPanel
              element={selectedElement}
              onChange={patch => selectedId && handleUpdateElement(selectedId, patch)}
            />
          ) : (
            <LayersPanel
              elements={elements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onBringForward={id => onChangeElements(ElementEngine.bringForward(elements, id))}
              onSendBackward={id => onChangeElements(ElementEngine.sendBackward(elements, id))}
              onBringToFront={id => onChangeElements(ElementEngine.bringToFront(elements, id))}
              onSendToBack={id => onChangeElements(ElementEngine.sendToBack(elements, id))}
              onToggleLock={id => onChangeElements(elements.map(e => e.id === id ? { ...e, locked: !e.locked } : e))}
              onToggleHide={id => onChangeElements(elements.map(e => e.id === id ? { ...e, hidden: !e.hidden } : e))}
              onDelete={id => handleDeleteElement(id)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
