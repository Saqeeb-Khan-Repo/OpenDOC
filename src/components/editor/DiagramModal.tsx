import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DiagramEngine, DIAGRAM_THEMES, FlowchartTheme, FlowAnalysisResult
} from '@/engines/DiagramEngine';
import { DiagramData, DiagramNode, DiagramConnector } from '@/engines/types';
import {
  GitFork, Plus, Trash2, Copy, Move, Check, Sparkles,
  Layout, ArrowDown, ArrowRight, RefreshCw, Sliders, Play,
  ListTree, AlertCircle, FileText, Download, ZoomIn, ZoomOut,
  Maximize2, Database, Square, Circle, HelpCircle, FileCode,
  CheckCircle2, ArrowUpRight, Search, Palette
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface DiagramModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (svgHtml: string) => void;
}

const DEFAULT_NATURAL_TEXT = `Start: User Enters App
Enter Email & Password
Validate Credentials
If Valid -> Generate JWT Session
If Invalid -> Show Error Alert
Show Error Alert -> Enter Email & Password
Generate JWT Session -> Redirect to Dashboard
Redirect to Dashboard -> End: User Active`;

export function DiagramModal({ open, onClose, onInsert }: DiagramModalProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'data' | 'templates'>('visual');
  const [dataInputMode, setDataInputMode] = useState<'simple' | 'advanced'>('advanced');

  // Themes
  const [selectedTheme, setSelectedTheme] = useState<FlowchartTheme>(DIAGRAM_THEMES[0]);

  // Diagram state
  const [diagram, setDiagram] = useState<DiagramData>(() => DiagramEngine.createDefaultFlowchart());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);

  // Natural text / Step editor state
  const [rawText, setRawText] = useState(DEFAULT_NATURAL_TEXT);
  const [steps, setSteps] = useState<string[]>([
    'Start: User Login',
    'Enter Credentials',
    'Validate User',
    'Open Dashboard',
    'End: Logout'
  ]);
  const [newStepText, setNewStepText] = useState('');

  // Figure Caption for document insertion
  const [caption, setCaption] = useState('Figure: Process Flowchart');

  // Zoom & Pan
  const [zoom, setZoom] = useState(100);

  // Analysis result
  const [analysis, setAnalysis] = useState<FlowAnalysisResult>(() => DiagramEngine.analyzeFlow(diagram));

  useEffect(() => {
    setAnalysis(DiagramEngine.analyzeFlow(diagram));
  }, [diagram]);

  // Dragging state inside canvas
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const selectedNode = diagram.nodes.find(n => n.id === selectedNodeId) || null;

  // ── Handlers for Data-First Creation ────────────────────────────────────────
  const handleGenerateFromText = () => {
    const generated = DiagramEngine.parseStructuredText(rawText, selectedTheme);
    setDiagram(generated);
    setActiveTab('visual');
  };

  const handleGenerateFromSteps = () => {
    const generated = DiagramEngine.parseSteps(steps, selectedTheme);
    setDiagram(generated);
    setActiveTab('visual');
  };

  const handleAddStep = () => {
    if (newStepText.trim()) {
      setSteps([...steps, newStepText.trim()]);
      setNewStepText('');
    }
  };

  const handleDeleteStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  // ── Handlers for Visual Interactive Canvas ──────────────────────────────────
  const handleAddNode = (type: string = 'process') => {
    const newId = `node_${Date.now()}`;
    const color = DiagramEngine.getNodeColor(type, selectedTheme);

    const newNode: DiagramNode = {
      id: newId,
      type: type as any,
      text: type === 'decision' ? 'Condition Valid?' : type === 'start' ? 'START' : type === 'end' ? 'END' : 'New Process Step',
      x: 350,
      y: 180,
      width: type === 'decision' ? 180 : 160,
      height: type === 'decision' ? 70 : 54,
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
      x: node.x + 24,
      y: node.y + 24,
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

  const handleAutoLayout = (direction: 'vertical' | 'horizontal') => {
    const arranged = DiagramEngine.computeAutoLayout(diagram, direction);
    setDiagram(arranged);
  };

  // Tap-to-Connect Workflow
  const handleNodeClick = (nodeId: string) => {
    if (connectingSourceId) {
      if (connectingSourceId !== nodeId) {
        // Create new connector
        const newConn: DiagramConnector = {
          id: `c_${Date.now()}`,
          fromNodeId: connectingSourceId,
          toNodeId: nodeId,
          arrow: 'end',
        };
        setDiagram(prev => ({
          ...prev,
          connectors: [...prev.connectors, newConn],
        }));
      }
      setConnectingSourceId(null);
    } else {
      setSelectedNodeId(nodeId);
    }
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNodeId) return;
      const dx = (e.clientX - dragStart.current.x) / (zoom / 100);
      const dy = (e.clientY - dragStart.current.y) / (zoom / 100);
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
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNodeId, zoom]);

  // ── Insertion & Export ──────────────────────────────────────────────────────
  const handleInsertIntoDocument = () => {
    const svgMarkup = DiagramEngine.renderToSvg(diagram, selectedTheme);
    const wrappedContent = `
      <div style="margin: 24px 0; text-align: center; page-break-inside: avoid;">
        <div style="display: inline-block; max-width: 100%; overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: ${selectedTheme.background}; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          ${svgMarkup}
        </div>
        <p style="font-size: 13px; font-weight: 600; color: #475569; margin-top: 8px; font-style: italic;">${caption}</p>
      </div>
    `;
    onInsert(wrappedContent);
    onClose();
  };

  const handleDownloadSvg = () => {
    const svg = DiagramEngine.renderToSvg(diagram, selectedTheme);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl p-0 h-[88vh] max-h-[850px] flex flex-col overflow-hidden bg-background text-foreground">
        {/* ── Top Header ─────────────────────────────────────────────────────── */}
        <DialogHeader className="px-5 py-3 border-b border-border flex flex-row items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <GitFork className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold flex items-center gap-2">
                <span>Visual Flowchart &amp; Diagram Studio</span>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Auto-Layout &amp; Logic Engine
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Enter structured text or steps → automatically generate professional flowcharts &amp; system architecture.
              </DialogDescription>
            </div>
          </div>

          {/* Top Navigation Tabs */}
          <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('visual')}
              className={cn(
                'px-3 py-1 rounded-md transition-all',
                activeTab === 'visual' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Diagram Canvas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('data')}
              className={cn(
                'px-3 py-1 rounded-md transition-all flex items-center gap-1',
                activeTab === 'data' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="h-3 w-3 text-primary" /> Data / Text Generator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={cn(
                'px-3 py-1 rounded-md transition-all',
                activeTab === 'templates' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Templates ({DiagramEngine.getTemplates().length})
            </button>
          </div>
        </DialogHeader>

        {/* ── Main Workspace Body ────────────────────────────────────────────── */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* TAB 1: VISUAL CANVAS */}
          {activeTab === 'visual' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="h-10 border-b border-border px-4 flex items-center justify-between shrink-0 bg-muted/30 text-xs select-none">
                {/* Left Insert Nodes */}
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground mr-1">ADD:</span>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleAddNode('process')}>
                    <Square className="h-3 w-3 text-blue-500" /> Process
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleAddNode('decision')}>
                    <HelpCircle className="h-3 w-3 text-amber-500" /> Decision
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleAddNode('start')}>
                    <Circle className="h-3 w-3 text-emerald-500" /> Start / End
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleAddNode('database')}>
                    <Database className="h-3 w-3 text-purple-500" /> DB
                  </Button>

                  <div className="h-4 w-px bg-border mx-1" />

                  {/* Connect Mode Button */}
                  <Button
                    variant={connectingSourceId ? 'default' : 'outline'}
                    size="sm"
                    className={cn('h-7 text-[11px] gap-1', connectingSourceId ? 'bg-amber-600 text-white animate-pulse' : '')}
                    onClick={() => {
                      if (connectingSourceId) setConnectingSourceId(null);
                      else if (selectedNodeId) setConnectingSourceId(selectedNodeId);
                    }}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    {connectingSourceId ? 'Tap Target Node' : 'Connect Node'}
                  </Button>
                </div>

                {/* Right Actions: Auto-Layout & Themes */}
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleAutoLayout('vertical')}>
                    <ArrowDown className="h-3 w-3" /> Auto Layout (V)
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleAutoLayout('horizontal')}>
                    <ArrowRight className="h-3 w-3" /> Auto Layout (H)
                  </Button>

                  <div className="h-4 w-px bg-border mx-0.5" />

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-0.5 bg-background border border-border px-1.5 py-0.5 rounded-md">
                    <button type="button" onClick={() => setZoom(Math.max(50, zoom - 15))} className="p-1 hover:text-primary">
                      <ZoomOut className="h-3 w-3" />
                    </button>
                    <span className="font-mono text-[10px] w-8 text-center font-bold">{zoom}%</span>
                    <button type="button" onClick={() => setZoom(Math.min(200, zoom + 15))} className="p-1 hover:text-primary">
                      <ZoomIn className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main SVG / Interactive Canvas Area */}
              <div
                className="flex-1 overflow-auto p-8 relative flex items-center justify-center"
                style={{ background: selectedTheme.background }}
                onClick={() => {
                  setSelectedNodeId(null);
                  setConnectingSourceId(null);
                }}
              >
                <div
                  className="relative transition-transform duration-100 origin-center"
                  style={{
                    width: '900px',
                    height: '560px',
                    transform: `scale(${zoom / 100})`,
                  }}
                >
                  {/* SVG Connectors Layer */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                      <marker id="canvas-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={selectedTheme.connectorColor} />
                      </marker>
                    </defs>

                    {diagram.connectors.map(c => {
                      const from = diagram.nodes.find(n => n.id === c.fromNodeId);
                      const to = diagram.nodes.find(n => n.id === c.toNodeId);
                      if (!from || !to) return null;

                      const x1 = from.x + from.width / 2;
                      const y1 = from.y + from.height;
                      const x2 = to.x + to.width / 2;
                      const y2 = to.y;
                      const isLoop = to.y <= from.y;

                      let d = '';
                      if (isLoop) {
                        const loopX = Math.max(from.x + from.width, to.x + to.width) + 40;
                        d = `M ${x1} ${y1} L ${x1} ${y1 + 20} L ${loopX} ${y1 + 20} L ${loopX} ${to.y + to.height / 2} L ${to.x + to.width} ${to.y + to.height / 2}`;
                      } else {
                        const midY = (y1 + y2) / 2;
                        d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
                      }

                      return (
                        <g key={c.id}>
                          <path
                            d={d}
                            fill="none"
                            stroke={selectedTheme.connectorColor}
                            strokeWidth="2"
                            strokeDasharray={isLoop ? '4,4' : undefined}
                            markerEnd="url(#canvas-arrow)"
                          />
                          {c.label && (
                            <text
                              x={(x1 + x2) / 2}
                              y={(y1 + y2) / 2 - 4}
                              fontSize="11"
                              fontWeight="bold"
                              fill={selectedTheme.connectorColor}
                              textAnchor="middle"
                              className="bg-white"
                            >
                              {c.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Interactive Nodes Layer */}
                  {diagram.nodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isSource = connectingSourceId === node.id;

                    return (
                      <div
                        key={node.id}
                        onMouseDown={e => handleNodeMouseDown(e, node)}
                        onClick={e => {
                          e.stopPropagation();
                          handleNodeClick(node.id);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          width: `${node.width}px`,
                          height: `${node.height}px`,
                          backgroundColor: node.fill || selectedTheme.processColor,
                          color: selectedTheme.textColor,
                          borderRadius: node.type === 'start' || node.type === 'end' ? '28px' : node.type === 'decision' ? '4px' : '8px',
                          transform: node.type === 'decision' ? 'rotate(0deg)' : undefined,
                        }}
                        className={cn(
                          'flex items-center justify-center p-2 text-center text-xs font-bold shadow-md cursor-grab active:cursor-grabbing select-none transition-shadow group',
                          isSelected ? 'ring-3 ring-blue-500 ring-offset-2 shadow-xl' : 'hover:shadow-lg',
                          isSource ? 'ring-3 ring-amber-500 ring-offset-2 animate-pulse' : ''
                        )}
                      >
                        <input
                          type="text"
                          value={node.text}
                          onChange={e => handleUpdateNode(node.id, { text: e.target.value })}
                          onClick={e => e.stopPropagation()}
                          className="bg-transparent text-center font-bold text-xs outline-none w-full truncate cursor-text text-white"
                        />

                        {/* Node Quick Delete / Duplicate buttons */}
                        {isSelected && (
                          <div className="absolute -top-7 right-0 bg-background/95 border border-border shadow-md rounded px-1 py-0.5 flex items-center gap-1 z-30">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); handleDuplicateNode(node); }}
                              className="p-1 hover:text-primary text-muted-foreground"
                              title="Duplicate Node"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); handleDeleteNode(node.id); }}
                              className="p-1 hover:text-destructive text-muted-foreground"
                              title="Delete Node"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Logic & Validation Status Bar */}
              <div className="h-8 border-t border-border px-4 flex items-center justify-between shrink-0 bg-muted/40 text-[11px] text-muted-foreground select-none">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    Nodes: {diagram.nodes.length} • Connectors: {diagram.connectors.length}
                  </span>
                  <span>•</span>
                  <span>Branches: {analysis.branchCount} • Loops: {analysis.loopCount}</span>
                </div>

                <div className="flex items-center gap-2">
                  {analysis.warnings.length === 0 ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Flow Validated
                    </span>
                  ) : (
                    <span className="text-amber-600 font-semibold flex items-center gap-1 truncate max-w-sm">
                      <AlertCircle className="h-3.5 w-3.5" /> {analysis.warnings[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA-FIRST STRUCTURED GENERATOR */}
          {activeTab === 'data' && (
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden p-5 gap-5">
              {/* Left Input Pane */}
              <div className="flex-1 flex flex-col border border-border rounded-xl p-4 bg-card/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-primary" />
                    <span className="font-bold text-xs">Structured Text Flow</span>
                  </div>
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded text-[11px]">
                    <button
                      type="button"
                      onClick={() => setDataInputMode('advanced')}
                      className={cn('px-2 py-0.5 rounded', dataInputMode === 'advanced' ? 'bg-background text-primary font-bold' : 'text-muted-foreground')}
                    >
                      Natural Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setDataInputMode('simple')}
                      className={cn('px-2 py-0.5 rounded', dataInputMode === 'simple' ? 'bg-background text-primary font-bold' : 'text-muted-foreground')}
                    >
                      Step Cards
                    </button>
                  </div>
                </div>

                {dataInputMode === 'advanced' ? (
                  <textarea
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    placeholder="Enter flow lines:&#10;Start: User Login&#10;Enter Password&#10;Validate&#10;If Valid -> Dashboard&#10;If Invalid -> Error&#10;Error -> Enter Password"
                    className="flex-1 w-full text-xs font-mono p-3 rounded-lg border border-border bg-background resize-none focus:border-primary outline-none leading-relaxed"
                  />
                ) : (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-border bg-background text-xs">
                          <span className="font-mono font-bold text-primary mr-2">{idx + 1}.</span>
                          <span className="flex-1 truncate">{step}</span>
                          <button type="button" onClick={() => handleDeleteStep(idx)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Input
                        value={newStepText}
                        onChange={e => setNewStepText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddStep()}
                        placeholder="Add next step..."
                        className="h-8 text-xs"
                      />
                      <Button size="sm" onClick={handleAddStep} className="h-8 px-3 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={dataInputMode === 'advanced' ? handleGenerateFromText : handleGenerateFromSteps}
                  className="mt-3 w-full bg-primary text-primary-foreground font-bold text-xs gap-1.5 h-9"
                >
                  <Sparkles className="h-4 w-4" /> Generate &amp; Auto-Layout Flowchart
                </Button>
              </div>

              {/* Right Analysis & Pre-Check Pane */}
              <div className="w-full sm:w-80 border border-border rounded-xl p-4 bg-muted/20 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground block mb-2">Live Structure Analysis</span>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-border bg-background space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Total Nodes:</span>
                        <span className="font-mono text-primary">{analysis.nodeCount}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Processes / Steps:</span>
                        <span className="font-mono">{analysis.processCount}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Decision Points:</span>
                        <span className="font-mono text-amber-600">{analysis.decisionCount}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Branches &amp; Loops:</span>
                        <span className="font-mono text-emerald-600">{analysis.branchCount} branches, {analysis.loopCount} loops</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border bg-background">
                      <span className="text-[11px] font-bold text-muted-foreground block mb-1">FLOW PATH DETECTED:</span>
                      <p className="text-xs font-mono text-foreground line-clamp-3 leading-relaxed">
                        {analysis.flowSummary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <span className="text-[11px] font-bold text-muted-foreground block">COLOR THEME</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {DIAGRAM_THEMES.map(th => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setSelectedTheme(th)}
                        style={{ backgroundColor: th.processColor }}
                        className={cn(
                          'h-7 rounded border border-black/10 transition-transform',
                          selectedTheme.id === th.id ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
                        )}
                        title={th.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DiagramEngine.getTemplates().map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    setDiagram(JSON.parse(JSON.stringify(t.data)));
                    setActiveTab('visual');
                  }}
                  className="rounded-xl border border-border bg-card hover:border-primary hover:shadow-md p-4 cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                        {t.category}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {t.data.nodes.length} Nodes
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                      {t.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <Button size="sm" variant="outline" className="mt-3 w-full text-xs h-7 gap-1 group-hover:bg-primary group-hover:text-white">
                    <span>Load Template</span> <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <DialogFooter className="px-5 py-3 border-t border-border flex flex-row items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Caption:</span>
            <Input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Figure caption..."
              className="h-8 text-xs max-w-[220px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadSvg} className="h-8 text-xs gap-1">
              <Download className="h-3.5 w-3.5" /> SVG
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button size="sm" onClick={handleInsertIntoDocument} className="h-8 px-4 text-xs gap-1.5 bg-primary text-white font-bold">
              <Check className="h-4 w-4" /> Insert into Document
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
