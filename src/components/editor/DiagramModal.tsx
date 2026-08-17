import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DiagramEngine, FlowchartTemplate } from '@/engines/DiagramEngine';
import { DiagramData, DiagramNode, DiagramConnector } from '@/engines/types';
import {
  GitFork, Plus, Trash2, Copy, Move, Check, Sparkles,
  Layout, ArrowDown, ArrowRight, RefreshCw, Sliders
} from 'lucide-react';

interface DiagramModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (svgHtml: string) => void;
}

const SHAPE_TYPES = [
  { type: 'process', label: 'Process Box', color: '#3b82f6' },
  { type: 'decision', label: 'Decision Diamond', color: '#f59e0b' },
  { type: 'start', label: 'Start / End Pill', color: '#10b981' },
  { type: 'database', label: 'Database Node', color: '#8b5cf6' },
];

export function DiagramModal({ open, onClose, onInsert }: DiagramModalProps) {
  const templates = DiagramEngine.getTemplates();
  const [diagram, setDiagram] = useState<DiagramData>(() => DiagramEngine.createDefaultFlowchart());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Dragging state inside canvas
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const selectedNode = diagram.nodes.find(n => n.id === selectedNodeId) || null;

  const handleSelectTemplate = (template: FlowchartTemplate) => {
    setDiagram(JSON.parse(JSON.stringify(template.data)));
    setSelectedNodeId(null);
  };

  const handleAddNode = (type: string = 'process', color: string = '#3b82f6') => {
    const newId = `node_${Date.now()}`;
    const newNode: DiagramNode = {
      id: newId,
      type: type as any,
      text: type === 'decision' ? 'Condition Met?' : 'New Action Step',
      x: 200,
      y: 150,
      width: type === 'decision' ? 180 : 160,
      height: type === 'decision' ? 70 : 52,
      fill: color,
      stroke: color,
    };
    setDiagram(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id: string) => {
    setDiagram(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      connectors: prev.connectors.filter(c => c.fromNodeId !== id && c.toNodeId !== id),
    }));
    setSelectedNodeId(null);
  };

  const handleDuplicateNode = (node: DiagramNode) => {
    const dupId = `node_${Date.now()}`;
    const dup: DiagramNode = {
      ...node,
      id: dupId,
      x: node.x + 20,
      y: node.y + 20,
    };
    setDiagram(prev => ({
      ...prev,
      nodes: [...prev.nodes, dup],
    }));
    setSelectedNodeId(dupId);
  };

  const handleUpdateNode = (id: string, patch: Partial<DiagramNode>) => {
    setDiagram(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, ...patch } : n),
    }));
  };

  const handleApplyAutoLayout = (direction: 'vertical' | 'horizontal') => {
    const arranged = DiagramEngine.applyAutoLayout(diagram, direction);
    setDiagram(arranged);
  };

  // Node Dragging Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      nodeX: node.x,
      nodeY: node.y,
    };
  };

  const handleNodeTouchStart = (e: React.TouchEvent, node: DiagramNode) => {
    e.stopPropagation();
    if (e.touches.length === 1) {
      setSelectedNodeId(node.id);
      setDraggingNodeId(node.id);
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        nodeX: node.x,
        nodeY: node.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeId) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setDiagram(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNodeId
            ? { ...n, x: Math.max(10, Math.round(dragStart.current.nodeX + dx)), y: Math.max(10, Math.round(dragStart.current.nodeY + dy)) }
            : n
        ),
      }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!draggingNodeId || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      setDiagram(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNodeId
            ? { ...n, x: Math.max(10, Math.round(dragStart.current.nodeX + dx)), y: Math.max(10, Math.round(dragStart.current.nodeY + dy)) }
            : n
        ),
      }));
    };

    const handleMouseUp = () => {
      setDraggingNodeId(null);
    };

    if (draggingNodeId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [draggingNodeId]);

  const handleInsert = () => {
    const svgMarkup = DiagramEngine.renderToSvg(diagram);
    const htmlWrapper = `<div class="diagram-figure" style="text-align: center; margin: 24px auto; max-width: 720px;">
      ${svgMarkup}
    </div>\n<p></p>`;
    onInsert(htmlWrapper);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[840px] p-5 text-xs">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <GitFork className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold">Flowchart &amp; Diagram Studio</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Create interactive flowcharts, decision trees, and system architectures with auto-layout and vector export.
                </DialogDescription>
              </div>
            </div>

            {/* Template Selector Dropdown */}
            <select
              onChange={e => {
                const tmpl = templates.find(t => t.id === e.target.value);
                if (tmpl) handleSelectTemplate(tmpl);
              }}
              className="h-8 text-xs bg-background border border-border rounded-lg px-2 text-foreground font-medium"
            >
              <option value="">Load Flowchart Template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 py-1 border-b border-border text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground mr-1">Add:</span>
            {SHAPE_TYPES.map(st => (
              <Button
                key={st.type}
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => handleAddNode(st.type, st.color)}
              >
                <Plus className="h-3 w-3" /> {st.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleApplyAutoLayout('vertical')}
              title="Align flow vertically"
            >
              <ArrowDown className="h-3 w-3" /> Vertical Layout
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleApplyAutoLayout('horizontal')}
              title="Align flow horizontally"
            >
              <ArrowRight className="h-3 w-3" /> Horizontal
            </Button>
          </div>
        </div>

        {/* Main Stage & Properties Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-1">
          {/* Visual SVG Stage */}
          <div
            onClick={() => setSelectedNodeId(null)}
            className="md:col-span-3 h-[380px] bg-muted/30 border border-border rounded-xl overflow-auto relative select-none p-4"
          >
            {/* SVG Background Connectors */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ minWidth: '700px', minHeight: '500px' }}
            >
              <defs>
                <marker id="dialog-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
              </defs>
              {diagram.connectors.map(c => {
                const fromNode = diagram.nodes.find(n => n.id === c.fromNodeId);
                const toNode = diagram.nodes.find(n => n.id === c.toNodeId);
                if (!fromNode || !toNode) return null;

                const fx = fromNode.x + fromNode.width / 2;
                const fy = fromNode.y + fromNode.height / 2;
                const tx = toNode.x + toNode.width / 2;
                const ty = toNode.y + toNode.height / 2;

                const midY = (fy + ty) / 2;
                const d = `M ${fx} ${fy} C ${fx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`;

                return (
                  <g key={c.id}>
                    <path d={d} stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#dialog-arrow)" />
                    {c.label && (
                      <text x={(fx + tx) / 2} y={(fy + ty) / 2 - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#475569">
                        {c.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Draggable HTML Nodes Overlay */}
            {diagram.nodes.map(node => {
              const isSelected = selectedNodeId === node.id;
              const isDecision = node.type === 'decision';
              const isStartEnd = node.type === 'start' || node.type === 'end';

              return (
                <div
                  key={node.id}
                  onMouseDown={e => handleNodeMouseDown(e, node)}
                  onTouchStart={e => handleNodeTouchStart(e, node)}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                    backgroundColor: node.fill || '#3b82f6',
                    borderRadius: isStartEnd ? '9999px' : isDecision ? '4px' : '8px',
                    transform: isDecision ? 'rotate(0deg)' : 'none',
                    touchAction: 'none',
                  }}
                  className={`flex items-center justify-center p-2 text-white font-semibold text-xs shadow-md cursor-grab active:cursor-grabbing transition-shadow ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  <span className="text-center line-clamp-2 leading-tight drop-shadow-xs pointer-events-none">
                    {node.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Node Properties Sidebar */}
          <div className="p-3 rounded-xl border border-border bg-card space-y-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Node Properties
            </span>

            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-muted-foreground">Node Label Text</span>
                  <Input
                    value={selectedNode.text}
                    onChange={e => handleUpdateNode(selectedNode.id, { text: e.target.value })}
                    className="h-8 text-xs mt-0.5"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-muted-foreground">Fill Color</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleUpdateNode(selectedNode.id, { fill: c, stroke: c })}
                        className={`h-5 w-5 rounded-full border ${selectedNode.fill === c ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs flex-1 gap-1"
                    onClick={() => handleDuplicateNode(selectedNode)}
                  >
                    <Copy className="h-3 w-3" /> Duplicate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => handleDeleteNode(selectedNode.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic text-center py-8">
                Click any node on the canvas to edit its label, shape, or colors.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleInsert} className="gap-1 bg-primary font-semibold">
            <Check className="h-3.5 w-3.5" /> Insert into Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
