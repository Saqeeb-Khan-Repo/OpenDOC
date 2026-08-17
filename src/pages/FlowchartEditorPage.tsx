import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DiagramEngine, DIAGRAM_THEMES, FlowchartTheme,
  FlowchartNodeType, FlowAnalysisResult
} from '@/engines/DiagramEngine';
import { DiagramData, DiagramNode, DiagramConnector } from '@/engines/types';
import { useDocumentsStore } from '@/store/documentsStore';
import {
  GitFork, ArrowLeft, Download, Plus, Trash2, Edit3, Check,
  Sparkles, Palette, Type, Printer, ChevronDown, ChevronRight,
  ZoomIn, ZoomOut, Maximize, RotateCcw, Play, RefreshCw,
  Search, ShieldAlert, CheckCircle2, Copy, Move, Layers,
  Square, Diamond, Circle, Database, FileText, ArrowRight,
  Sliders, Link2, X, FilePlus, HelpCircle, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MobileBottomSheet } from '@/components/editor/MobileBottomSheet';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import { cn } from '@/utils/cn';
import { SEOHead } from '@/components/seo/SEOHead';

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

const NODE_PALETTE: { type: FlowchartNodeType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'start', label: 'Start / End', icon: Circle },
  { type: 'process', label: 'Process', icon: Square },
  { type: 'decision', label: 'Decision', icon: Diamond },
  { type: 'input-output', label: 'Input / Output', icon: Move },
  { type: 'database', label: 'Database', icon: Database },
  { type: 'document', label: 'Document', icon: FileText },
  { type: 'subprocess', label: 'Subprocess', icon: Layers },
];

export function FlowchartEditorPage() {
  const navigate = useNavigate();
  const responsive = useResponsiveEditor();
  const { createDocument } = useDocumentsStore();

  // ── Diagram State ──────────────────────────────────────────────────────────
  const [diagramName, setDiagramName] = useState('System Architecture Flowchart');
  const [isEditingName, setIsEditingName] = useState(false);
  const [diagram, setDiagram] = useState<DiagramData>(() => DiagramEngine.createDefaultFlowchart());
  const [selectedTheme, setSelectedTheme] = useState<FlowchartTheme>(DIAGRAM_THEMES[0]);

  // History Stack for 1-step Undo / Redo
  const [history, setHistory] = useState<DiagramData[]>([diagram]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback((nextDiagram: DiagramData) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, nextDiagram];
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setDiagram(target);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setDiagram(target);
    }
  }, [history, historyIndex]);

  // ── Viewport & Canvas Container Sizing ──────────────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState<Viewport>({ x: 40, y: 40, zoom: 1 });

  // Measure container dimensions reactively
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const updateContainerSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    const observer = new ResizeObserver(updateContainerSize);
    observer.observe(el);
    window.addEventListener('resize', updateContainerSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  // ── Fit Diagram to Viewport ────────────────────────────────────────────────
  const handleFitDiagram = useCallback(() => {
    if (diagram.nodes.length === 0) return;

    const minX = Math.min(...diagram.nodes.map(n => n.x));
    const minY = Math.min(...diagram.nodes.map(n => n.y));
    const maxX = Math.max(...diagram.nodes.map(n => n.x + n.width));
    const maxY = Math.max(...diagram.nodes.map(n => n.y + n.height));

    const diagramW = Math.max(100, maxX - minX + 64);
    const diagramH = Math.max(100, maxY - minY + 64);

    const availW = Math.max(120, canvasSize.width - (responsive.isMobile ? 24 : 48));
    const availH = Math.max(120, canvasSize.height - (responsive.isMobile ? 24 : 48));

    const scaleX = availW / diagramW;
    const scaleY = availH / diagramH;
    const fitZoom = Math.min(1.2, Math.max(0.35, Math.min(scaleX, scaleY)));

    const centeredX = Math.round((canvasSize.width - (maxX - minX) * fitZoom) / 2 - minX * fitZoom);
    const centeredY = Math.round((canvasSize.height - (maxY - minY) * fitZoom) / 2 - minY * fitZoom);

    setViewport({
      x: centeredX,
      y: centeredY,
      zoom: fitZoom,
    });
  }, [diagram.nodes, canvasSize, responsive.isMobile]);

  // Fit diagram when canvas size initializes or changes orientation
  const hasInitializedFit = useRef(false);
  useEffect(() => {
    if (canvasSize.width > 100 && canvasSize.height > 100 && !hasInitializedFit.current) {
      hasInitializedFit.current = true;
      handleFitDiagram();
    }
  }, [canvasSize, handleFitDiagram]);

  // Screen to World Coordinates conversion
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.x) / viewport.zoom,
      y: (screenY - viewport.y) / viewport.zoom,
    };
  }, [viewport]);

  // ── Canvas Interaction State ───────────────────────────────────────────────
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingNodeText, setEditingNodeText] = useState('');
  const [connectModeActive, setConnectModeActive] = useState(false);
  const [connectSourceNodeId, setConnectSourceNodeId] = useState<string | null>(null);
  const [connectFeedback, setConnectFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);

  // Modals & Mobile Sheets
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [activeMobileSheet, setActiveMobileSheet] = useState<'add' | 'style' | 'layout' | 'more' | null>(null);
  const [mobileNodeEditModalOpen, setMobileNodeEditModalOpen] = useState(false);

  // Natural text generator input
  const [naturalText, setNaturalText] = useState(`Start: Customer Orders Online
Enter Shipping & Payment
Process Payment
If Payment Approved -> Send Order to Warehouse
If Payment Declined -> Show Failure & Retry Loop
Send Order to Warehouse -> Update Inventory DB
Update Inventory DB -> End: Delivery Tracking Active`);

  // Dragging Nodes & Canvas Panning
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, nodeX: 0, nodeY: 0 });
  const isCanvasPanning = useRef(false);
  const panStart = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 });
  const touchDistanceStart = useRef<number | null>(null);
  const initialZoom = useRef(1);

  // ── Global Mouse & Touch Listeners ─────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNodeId) {
        const dx = (e.clientX - dragStart.current.mouseX) / viewport.zoom;
        const dy = (e.clientY - dragStart.current.mouseY) / viewport.zoom;
        setDiagram(prev => ({
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === draggingNodeId
              ? {
                  ...n,
                  x: Math.max(10, Math.round(dragStart.current.nodeX + dx)),
                  y: Math.max(10, Math.round(dragStart.current.nodeY + dy)),
                }
              : n
          ),
        }));
      } else if (isCanvasPanning.current) {
        const dx = e.clientX - panStart.current.mouseX;
        const dy = e.clientY - panStart.current.mouseY;
        setViewport(v => ({
          ...v,
          x: Math.round(panStart.current.panX + dx),
          y: Math.round(panStart.current.panY + dy),
        }));
      }
    };

    const handleMouseUp = () => {
      if (draggingNodeId) {
        setDraggingNodeId(null);
        pushHistory(diagram);
      }
      isCanvasPanning.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two finger pinch zoom & pan
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);

        if (touchDistanceStart.current !== null) {
          const factor = dist / touchDistanceStart.current;
          const nextZoom = Math.min(2.0, Math.max(0.35, initialZoom.current * factor));
          setViewport(v => ({ ...v, zoom: nextZoom }));
        }
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (draggingNodeId) {
          e.preventDefault();
          const dx = (touch.clientX - dragStart.current.mouseX) / viewport.zoom;
          const dy = (touch.clientY - dragStart.current.mouseY) / viewport.zoom;
          setDiagram(prev => ({
            ...prev,
            nodes: prev.nodes.map(n =>
              n.id === draggingNodeId
                ? {
                    ...n,
                    x: Math.max(10, Math.round(dragStart.current.nodeX + dx)),
                    y: Math.max(10, Math.round(dragStart.current.nodeY + dy)),
                  }
                : n
            ),
          }));
        } else if (isCanvasPanning.current) {
          e.preventDefault();
          const dx = touch.clientX - panStart.current.mouseX;
          const dy = touch.clientY - panStart.current.mouseY;
          setViewport(v => ({
            ...v,
            x: Math.round(panStart.current.panX + dx),
            y: Math.round(panStart.current.panY + dy),
          }));
        }
      }
    };

    const handleTouchEnd = () => {
      if (draggingNodeId) {
        setDraggingNodeId(null);
        pushHistory(diagram);
      }
      isCanvasPanning.current = false;
      touchDistanceStart.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingNodeId, viewport.zoom, diagram, pushHistory]);

  // ── Keyboard Shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !editingNodeId) {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          handleDeleteSelectedNodes();
        } else if (selectedConnectorId) {
          e.preventDefault();
          handleDeleteConnector(selectedConnectorId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedNodeIds, selectedConnectorId, editingNodeId]);

  // ── Node Actions ───────────────────────────────────────────────────────────
  const handleAddNode = (type: FlowchartNodeType = 'process') => {
    // Spawn node at the center of the currently visible canvas viewport in world coordinates
    const worldCenter = screenToWorld(canvasSize.width / 2, canvasSize.height / 2);
    const nodeW = type === 'decision' ? 140 : 150;
    const nodeH = type === 'decision' ? 70 : 54;

    const newNode: DiagramNode = {
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      text: type === 'start' ? 'Start' : type === 'end' ? 'End' : type === 'decision' ? 'Condition?' : 'Process Step',
      x: Math.max(20, Math.round(worldCenter.x - nodeW / 2)),
      y: Math.max(20, Math.round(worldCenter.y - nodeH / 2)),
      width: nodeW,
      height: nodeH,
      fill: DiagramEngine.getNodeColor(type, selectedTheme),
    };

    const next = { ...diagram, nodes: [...diagram.nodes, newNode] };
    setDiagram(next);
    pushHistory(next);
    setSelectedNodeIds([newNode.id]);
    setActiveMobileSheet(null);
  };

  const handleDeleteSelectedNodes = () => {
    if (selectedNodeIds.length === 0) return;
    const next = {
      ...diagram,
      nodes: diagram.nodes.filter(n => !selectedNodeIds.includes(n.id)),
      connectors: diagram.connectors.filter(c => !selectedNodeIds.includes(c.fromNodeId) && !selectedNodeIds.includes(c.toNodeId)),
    };
    setDiagram(next);
    pushHistory(next);
    setSelectedNodeIds([]);
    setEditingNodeId(null);
  };

  const handleUpdateNode = (id: string, patch: Partial<DiagramNode>) => {
    const next = {
      ...diagram,
      nodes: diagram.nodes.map(n => n.id === id ? { ...n, ...patch } : n),
    };
    setDiagram(next);
    pushHistory(next);
  };

  const handleCommitNodeText = () => {
    if (editingNodeId) {
      handleUpdateNode(editingNodeId, { text: editingNodeText.trim() || 'Step' });
      setEditingNodeId(null);
    }
  };

  // ── Connecting Nodes ───────────────────────────────────────────────────────
  const handleStartConnectMode = (initialSourceId?: string) => {
    setConnectModeActive(true);
    setConnectSourceNodeId(initialSourceId || selectedNodeIds[0] || null);
    setConnectFeedback(initialSourceId || selectedNodeIds[0] ? 'Source selected. Tap destination node.' : 'Tap source node.');
  };

  const handleCancelConnectMode = () => {
    setConnectModeActive(false);
    setConnectSourceNodeId(null);
    setConnectFeedback(null);
  };

  const handleNodeClick = (nodeId: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (connectModeActive || connectSourceNodeId) {
      if (!connectSourceNodeId) {
        setConnectSourceNodeId(nodeId);
        setConnectFeedback('Source selected. Tap destination node.');
        return;
      }

      if (connectSourceNodeId === nodeId) {
        setConnectFeedback('Cannot connect node to itself. Tap another destination.');
        return;
      }

      const exists = diagram.connectors.some(
        c => c.fromNodeId === connectSourceNodeId && c.toNodeId === nodeId
      );

      if (exists) {
        setConnectFeedback('Connection already exists.');
        setTimeout(() => handleCancelConnectMode(), 1200);
        return;
      }

      const newConn: DiagramConnector = {
        id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        fromNodeId: connectSourceNodeId,
        toNodeId: nodeId,
      };

      const next = { ...diagram, connectors: [...diagram.connectors, newConn] };
      setDiagram(next);
      pushHistory(next);
      setConnectFeedback('✓ Connection created!');
      setTimeout(() => handleCancelConnectMode(), 800);
      return;
    }

    if (e && 'shiftKey' in e && (e.shiftKey || e.metaKey || e.ctrlKey)) {
      setSelectedNodeIds(prev => prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]);
    } else {
      setSelectedNodeIds([nodeId]);
    }
    setSelectedConnectorId(null);
  };

  const handleDeleteConnector = (connId: string) => {
    const next = {
      ...diagram,
      connectors: diagram.connectors.filter(c => c.id !== connId),
    };
    setDiagram(next);
    pushHistory(next);
    setSelectedConnectorId(null);
  };

  const handleUpdateConnectorLabel = (connId: string, label: string) => {
    const next = {
      ...diagram,
      connectors: diagram.connectors.map(c => c.id === connId ? { ...c, label: label || undefined } : c),
    };
    setDiagram(next);
    pushHistory(next);
  };

  const selectedConnector = diagram.connectors.find(c => c.id === selectedConnectorId) || null;
  const selectedConnectorRoute = useMemo(() => {
    if (!selectedConnector) return null;
    const from = diagram.nodes.find(n => n.id === selectedConnector.fromNodeId);
    const to = diagram.nodes.find(n => n.id === selectedConnector.toNodeId);
    if (!from || !to) return null;
    return DiagramEngine.calculateConnectorRoute(from, to, 'elbow');
  }, [diagram.connectors, diagram.nodes, selectedConnector]);

  // ── Auto-Layout ────────────────────────────────────────────────────────────
  const handleAutoLayout = (direction: 'vertical' | 'horizontal' = 'vertical') => {
    const arranged = DiagramEngine.computeAutoLayout(diagram, direction);
    setDiagram(arranged);
    pushHistory(arranged);
    handleFitDiagram();
    setActiveMobileSheet(null);
  };

  // ── Data Generation ────────────────────────────────────────────────────────
  const handleGenerateFromData = () => {
    const generated = DiagramEngine.parseStructuredText(naturalText, selectedTheme);
    const arranged = DiagramEngine.computeAutoLayout(generated, 'vertical');
    setDiagram(arranged);
    pushHistory(arranged);
    setDataModalOpen(false);
    handleFitDiagram();
  };

  // ── Flow Analysis ──────────────────────────────────────────────────────────
  const flowAnalysis: FlowAnalysisResult = useMemo(() => {
    return DiagramEngine.analyzeFlow(diagram);
  }, [diagram]);

  // ── Search Nodes ───────────────────────────────────────────────────────────
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const found = diagram.nodes.find(n => n.text.toLowerCase().includes(searchQuery.toLowerCase()));
    if (found) {
      setSelectedNodeIds([found.id]);
      setHighlightedNodeId(found.id);
      setViewport(v => ({
        ...v,
        x: Math.round(canvasSize.width / 2 - (found.x + found.width / 2) * v.zoom),
        y: Math.round(canvasSize.height / 2 - (found.y + found.height / 2) * v.zoom),
      }));
      setActiveMobileSheet(null);
    }
  };

  // ── Export Formats ─────────────────────────────────────────────────────────
  const handleDownloadSvg = () => {
    const svg = DiagramEngine.renderToSvg(diagram, selectedTheme);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
  };

  const handleDownloadPng = () => {
    const svg = DiagramEngine.renderToSvg(diagram, selectedTheme);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(200, image.width * 2);
        canvas.height = Math.max(200, image.height * 2);
        const context = canvas.getContext('2d');
        if (context) {
          context.scale(2, 2);
          context.drawImage(image, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = `${diagramName.replace(/\s+/g, '_')}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } finally {
        URLObject.revokeObjectURL(blobURL);
      }
    };
    image.onerror = () => {
      URLObject.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const handleAddToDocument = () => {
    const svgMarkup = DiagramEngine.renderToSvg(diagram, selectedTheme);
    const content = `
      <div style="margin: 24px 0; text-align: center; page-break-inside: avoid;">
        <div style="display: inline-block; max-width: 100%; overflow: auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; background: ${selectedTheme.background};">
          ${svgMarkup}
        </div>
        <p style="font-size: 13px; font-weight: 600; color: #475569; margin-top: 8px; font-style: italic;">Figure: ${diagramName}</p>
      </div>
    `;
    const doc = createDocument({
      title: diagramName,
      content,
      mode: 'document',
    });
    navigate(`/editor/${doc.id}`);
  };

  const primarySelectedNode = diagram.nodes.find(n => n.id === selectedNodeIds[0]) || null;

  return (
    <div className="h-screen h-[100dvh] flex flex-col bg-background text-foreground overflow-hidden select-none">
      <SEOHead
        title={`${diagramName || 'Flowchart Studio'} | DocFlow`}
        description="DocFlow Interactive Flowchart Studio"
        canonicalPath="/flowchart"
        noindex={true}
      />
      {/* ── 1. COMPACT TOP HEADER (HOME LINK + INLINE RENAME + EXPORT) ──────── */}
      <header className="h-11 sm:h-12 bg-background/95 backdrop-blur border-b border-border px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors cursor-pointer group shrink-0"
            title="Go to DocFlow Home / Dashboard"
          >
            <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
            <span className="font-extrabold tracking-tight hidden xs:inline">DocFlow</span>
          </button>

          <span className="text-muted-foreground/40 text-xs font-mono select-none">/</span>

          <div className="flex items-center gap-1 min-w-0">
            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <GitFork className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </div>
            {isEditingName ? (
              <Input
                value={diagramName}
                onChange={e => setDiagramName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                className="h-6 sm:h-7 text-xs font-semibold max-w-[140px] sm:max-w-[180px]"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-xs font-semibold truncate hover:text-primary transition-colors flex items-center gap-1 group max-w-[110px] xs:max-w-[150px] sm:max-w-xs text-left"
                title="Click to rename"
              >
                <span className="truncate">{diagramName}</span>
                <Edit3 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 shrink-0 hidden sm:inline" />
              </button>
            )}
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddToDocument}
            className="h-7 sm:h-8 text-xs gap-1.5 hidden md:flex font-medium"
          >
            <FilePlus className="h-3.5 w-3.5 text-blue-500" /> Add to Document
          </Button>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-7 sm:h-8 text-xs gap-1 bg-primary text-primary-foreground font-semibold px-2 sm:px-3">
                <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Export</span> <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuItem onClick={handleDownloadSvg}>Export Vector SVG (.svg)</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPng}>Export High-Res Image (.png)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>Print / Save as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile More Button (Top-Right) */}
          <button
            type="button"
            onClick={() => setActiveMobileSheet('more')}
            className="h-8 w-8 rounded-lg flex md:hidden items-center justify-center text-muted-foreground hover:text-foreground active:scale-95"
            title="More Options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ── 2. DESKTOP MAIN TOOLBAR ─────────────────────────────────────────── */}
      <div className="h-10 bg-background/95 backdrop-blur border-b border-border px-3 hidden md:flex items-center justify-between shrink-0 z-20 overflow-x-auto gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={handleUndo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="h-7 w-7" onClick={handleRedo} disabled={historyIndex >= history.length - 1} title="Redo (Ctrl+Y)">
            <RotateCcw className="h-3.5 w-3.5 transform -scale-x-100" />
          </Button>

          <div className="h-4 w-px bg-border mx-0.5" />

          {/* Add Node Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-border font-medium">
                <Plus className="h-3.5 w-3.5 text-primary" /> Add Node <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 text-xs">
              {NODE_PALETTE.map(item => (
                <DropdownMenuItem key={item.type} onClick={() => handleAddNode(item.type)} className="gap-2">
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Connect Mode Toggle */}
          <Button
            variant={connectModeActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => connectModeActive ? handleCancelConnectMode() : handleStartConnectMode()}
            className={cn('h-7 text-xs gap-1.5 font-medium', connectModeActive && 'bg-primary text-primary-foreground animate-pulse')}
          >
            <Link2 className="h-3.5 w-3.5" />
            <span>{connectModeActive ? (connectSourceNodeId ? 'Select Dest Node' : 'Select Source Node') : 'Connect'}</span>
          </Button>

          {/* Auto Layout */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 font-medium">
                <Layers className="h-3.5 w-3.5 text-indigo-500" /> Layout <ChevronDown className="h-2.5 w-2.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 text-xs">
              <DropdownMenuItem onClick={() => handleAutoLayout('vertical')}>Vertical Hierarchy</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAutoLayout('horizontal')}>Horizontal Workflow</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleFitDiagram}>Fit Diagram</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Generate from Data */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDataModalOpen(true)}
            className="h-7 text-xs gap-1 text-primary font-medium"
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate from Data
          </Button>

          {/* Flow Analysis */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAnalysisModalOpen(true)}
            className={cn(
              'h-7 text-xs gap-1 font-medium',
              flowAnalysis.warnings.length > 0 ? 'text-amber-600' : 'text-emerald-600'
            )}
          >
            {flowAnalysis.warnings.length > 0 ? <ShieldAlert className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span>Analyze ({diagram.nodes.length} Nodes)</span>
          </Button>
        </div>

        {/* Right Toolbar: Search, Theme, Zoom */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-muted/60 rounded-md px-1.5 py-0.5 border border-border">
            <Search className="h-3 w-3 text-muted-foreground mr-1" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search node..."
              className="bg-transparent text-xs outline-none w-24 sm:w-32"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Palette className="h-3 w-3 text-primary" />
                <span className="hidden lg:inline">{selectedTheme.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 text-xs">
              {DIAGRAM_THEMES.map(th => (
                <DropdownMenuItem key={th.id} onClick={() => setSelectedTheme(th)}>
                  <span>{th.name}</span>
                  {selectedTheme.id === th.id && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 bg-muted/40 p-0.5 rounded border border-border">
            <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => setViewport(v => ({ ...v, zoom: Math.max(0.35, v.zoom - 0.1) }))} title="Zoom Out">
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-mono px-1 font-semibold">{Math.round(viewport.zoom * 100)}%</span>
            <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={() => setViewport(v => ({ ...v, zoom: Math.min(2.0, v.zoom + 0.1) }))} title="Zoom In">
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="h-6 w-6" onClick={handleFitDiagram} title="Fit Diagram">
              <Maximize className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── 3. CONNECTION MODE INSTRUCTION BANNER (TOUCH / DESKTOP) ─────────── */}
      {connectModeActive && (
        <div className="bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold flex items-center justify-between shrink-0 shadow-sm z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 animate-spin" />
            <span>{connectFeedback || 'Select source node, then destination node.'}</span>
          </div>
          <button
            type="button"
            onClick={handleCancelConnectMode}
            className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── 4. MAIN WORKSPACE: PALETTE + RESPONSIVE CANVAS CONTAINER ─────────── */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* Left Quick Palette (Desktop) */}
        <div className="w-14 lg:w-44 border-r border-border bg-card/60 flex flex-col p-2 gap-1.5 shrink-0 hidden md:flex select-none">
          <span className="text-[10px] font-bold text-muted-foreground uppercase px-2 mb-1 hidden lg:block">Add Elements</span>
          {NODE_PALETTE.map(item => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleAddNode(item.type)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium hover:bg-muted/80 text-foreground transition-colors text-left"
              title={`Add ${item.label}`}
            >
              <item.icon className="h-4 w-4 text-primary shrink-0" />
              <span className="hidden lg:inline truncate">{item.label}</span>
            </button>
          ))}

          <div className="mt-auto pt-2 border-t border-border/80">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplatesModalOpen(true)}
              className="w-full text-xs gap-1.5 h-8 font-medium"
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="hidden lg:inline">Templates</span>
            </Button>
          </div>
        </div>

        {/* Center Interactive SVG / HTML Canvas (Observed by ResizeObserver) */}
        <div
          ref={canvasContainerRef}
          className="flex-1 bg-[#f8fafc] dark:bg-[#050811] overflow-hidden relative cursor-crosshair touch-none select-none w-full h-full"
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).tagName === 'INPUT') return;
            isCanvasPanning.current = true;
            panStart.current = { mouseX: e.clientX, mouseY: e.clientY, panX: viewport.x, panY: viewport.y };
            setSelectedNodeIds([]);
            setSelectedConnectorId(null);
            setEditingNodeId(null);
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              const t1 = e.touches[0];
              const t2 = e.touches[1];
              touchDistanceStart.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
              initialZoom.current = viewport.zoom;
            } else if (e.touches.length === 1) {
              isCanvasPanning.current = true;
              panStart.current = {
                mouseX: e.touches[0].clientX,
                mouseY: e.touches[0].clientY,
                panX: viewport.x,
                panY: viewport.y,
              };
            }
          }}
        >
          {/* Transformed Stage with World Coordinates */}
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            }}
          >
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '6000px', height: '6000px' }}
            >
              <defs>
                <marker
                  id="canvas-arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={selectedTheme.connectorColor} />
                </marker>
              </defs>

              {/* Dynamic Flexible 4-Directional Connectors */}
              {diagram.connectors.map(c => {
                const from = diagram.nodes.find(n => n.id === c.fromNodeId);
                const to = diagram.nodes.find(n => n.id === c.toNodeId);
                if (!from || !to) return null;

                const isSelected = selectedConnectorId === c.id;
                const route = DiagramEngine.calculateConnectorRoute(from, to, 'elbow');

                return (
                  <g key={c.id} className="pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedConnectorId(c.id); setSelectedNodeIds([]); }}>
                    <path
                      d={route.pathD}
                      fill="none"
                      stroke={isSelected ? '#3b82f6' : selectedTheme.connectorColor}
                      strokeWidth={isSelected ? 3 : 2}
                      markerEnd="url(#canvas-arrow)"
                    />
                    {c.label && (
                      <g>
                        <rect
                          x={route.labelX - 28}
                          y={route.labelY - 10}
                          width={56}
                          height={18}
                          rx={4}
                          fill={selectedTheme.connectorLabelBg}
                          stroke={selectedTheme.connectorColor}
                          strokeWidth={0.8}
                        />
                        <text
                          x={route.labelX}
                          y={route.labelY + 2}
                          fontSize="11"
                          fontWeight="bold"
                          fill={selectedTheme.connectorColor}
                          textAnchor="middle"
                        >
                          {c.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Floating Action Bar for Selected Connector */}
            {selectedConnector && selectedConnectorRoute && (
              <div
                style={{
                  left: `${selectedConnectorRoute.labelX}px`,
                  top: `${selectedConnectorRoute.labelY - 36}px`,
                }}
                className="absolute transform -translate-x-1/2 bg-background/95 backdrop-blur border border-border shadow-xl rounded-lg px-2 py-1 flex items-center gap-1.5 z-40 select-none pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <span className="text-[10px] font-bold text-muted-foreground uppercase mr-0.5">Edge</span>
                {['Yes', 'No', 'Success', 'Failure'].map(lbl => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => handleUpdateConnectorLabel(selectedConnector.id, selectedConnector.label === lbl ? '' : lbl)}
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors',
                      selectedConnector.label === lbl
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    )}
                  >
                    {lbl}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleDeleteConnector(selectedConnector.id)}
                  className="p-1 text-destructive hover:bg-destructive/10 rounded ml-0.5"
                  title="Delete Connection"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Render Flowchart Nodes */}
            {diagram.nodes.map(n => {
              const isSelected = selectedNodeIds.includes(n.id);
              const isHighlight = highlightedNodeId === n.id || connectSourceNodeId === n.id;
              const isDecision = n.type === 'decision';
              const isStartEnd = n.type === 'start' || n.type === 'end';
              const isDb = n.type === 'database';

              return (
                <div
                  key={n.id}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(n.id, e); }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (responsive.isMobile) {
                      setEditingNodeId(n.id);
                      setEditingNodeText(n.text);
                      setMobileNodeEditModalOpen(true);
                    } else {
                      setEditingNodeId(n.id);
                      setEditingNodeText(n.text);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    if (editingNodeId) return;
                    setDraggingNodeId(n.id);
                    dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, nodeX: n.x, nodeY: n.y };
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (connectModeActive) {
                      handleNodeClick(n.id, e);
                      return;
                    }
                    const touch = e.touches[0];
                    if (touch && !editingNodeId) {
                      setDraggingNodeId(n.id);
                      dragStart.current = { mouseX: touch.clientX, mouseY: touch.clientY, nodeX: n.x, nodeY: n.y };
                      setSelectedNodeIds([n.id]);
                    }
                  }}
                  style={{
                    left: `${n.x}px`,
                    top: `${n.y}px`,
                    width: `${n.width}px`,
                    height: `${n.height}px`,
                    backgroundColor: isDecision ? 'transparent' : n.fill,
                  }}
                  className={cn(
                    'absolute flex items-center justify-center p-2 transition-shadow cursor-move select-none shadow-sm',
                    isStartEnd && 'rounded-full',
                    !isStartEnd && !isDecision && n.type !== 'input-output' && 'rounded-xl',
                    n.type === 'input-output' && 'transform -skew-x-12 rounded-md',
                    isDb && 'rounded-t-2xl rounded-b-2xl border-t-4 border-b-4 border-black/20',
                    n.type === 'subprocess' && 'border-l-4 border-r-4 border-white/50 rounded-lg',
                    isSelected && !isDecision && 'ring-2 ring-primary ring-offset-2 shadow-lg',
                    isHighlight && !isDecision && 'ring-4 ring-amber-400 animate-pulse'
                  )}
                >
                  {isDecision && (
                    <div
                      className={cn(
                        'absolute inset-1.5 transform rotate-45 rounded-lg shadow-sm border transition-all',
                        isSelected && 'ring-2 ring-primary ring-offset-2 shadow-lg',
                        isHighlight && 'ring-4 ring-amber-400 animate-pulse'
                      )}
                      style={{ backgroundColor: n.fill }}
                    />
                  )}

                  {/* Node Content / Text */}
                  <div className={cn(
                    'relative z-10 text-center w-full px-2 pointer-events-none',
                    n.type === 'input-output' && 'transform skew-x-12'
                  )}>
                    {editingNodeId === n.id && !responsive.isMobile ? (
                      <input
                        value={editingNodeText}
                        onChange={e => setEditingNodeText(e.target.value)}
                        onBlur={handleCommitNodeText}
                        onKeyDown={e => e.key === 'Enter' && handleCommitNodeText()}
                        autoFocus
                        className="w-full text-xs font-bold text-center bg-white text-slate-900 rounded px-1 py-0.5 outline-none pointer-events-auto"
                      />
                    ) : (
                      <span className="text-xs font-bold text-white drop-shadow-xs line-clamp-2">
                        {n.text}
                      </span>
                    )}
                  </div>

                  {/* Mobile Contextual Floating Action Bar when Node Selected */}
                  {isSelected && responsive.isMobile && (
                    <div
                      className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-background/95 backdrop-blur border border-border shadow-lg rounded-lg px-1.5 py-0.5 flex items-center gap-1 z-30 select-none pointer-events-auto whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNodeId(n.id);
                          setEditingNodeText(n.text);
                          setMobileNodeEditModalOpen(true);
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-muted hover:bg-muted/80 rounded text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartConnectMode(n.id)}
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded"
                      >
                        Connect
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMobileSheet('style')}
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-muted hover:bg-muted/80 rounded text-foreground"
                      >
                        Style
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteSelectedNodes}
                        className="px-1 py-0.5 text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded"
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

        {/* Right Node Inspector (Desktop Contextual) */}
        {primarySelectedNode && (
          <div className="w-64 border-l border-border bg-card/80 backdrop-blur p-4 space-y-4 shrink-0 hidden xl:block select-none text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Node Properties</span>
              <button type="button" onClick={handleDeleteSelectedNodes} className="text-destructive p-1 hover:bg-destructive/10 rounded">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Text Label</label>
              <Input
                value={primarySelectedNode.text}
                onChange={e => handleUpdateNode(primarySelectedNode.id, { text: e.target.value })}
                className="h-8 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Node Type</label>
              <select
                value={primarySelectedNode.type}
                onChange={e => {
                  const t = e.target.value as FlowchartNodeType;
                  handleUpdateNode(primarySelectedNode.id, {
                    type: t,
                    fill: DiagramEngine.getNodeColor(t, selectedTheme),
                  });
                }}
                className="w-full h-8 text-xs rounded-lg border border-border bg-background px-2 font-medium"
              >
                {NODE_PALETTE.map(p => (
                  <option key={p.type} value={p.type}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1.5">Fill Color</label>
              <div className="grid grid-cols-5 gap-1.5">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#0f172a', '#475569'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdateNode(primarySelectedNode.id, { fill: c })}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'h-6 rounded-md border border-black/10 transition-transform hover:scale-110',
                      primarySelectedNode.fill === c && 'ring-2 ring-primary'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. MOBILE 4-BUTTON BOTTOM TOOLBAR (RESERVES CANVAS SPACE) ───────── */}
      <div
        className="h-12 border-t border-border bg-background/95 backdrop-blur flex md:hidden items-center justify-around shrink-0 z-30 select-none"
        style={{ paddingBottom: 'max(4px, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => setActiveMobileSheet('add')}
          className="flex flex-col items-center justify-center min-w-[60px] h-11 text-xs text-primary font-semibold active:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Add</span>
        </button>

        <button
          type="button"
          onClick={() => connectModeActive ? handleCancelConnectMode() : handleStartConnectMode()}
          className={cn(
            'flex flex-col items-center justify-center min-w-[60px] h-11 text-xs font-semibold active:scale-95 transition-transform',
            connectModeActive ? 'text-primary animate-pulse' : 'text-muted-foreground'
          )}
        >
          <Link2 className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">{connectModeActive ? 'Connecting' : 'Connect'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileSheet('layout')}
          className="flex flex-col items-center justify-center min-w-[60px] h-11 text-xs text-muted-foreground active:scale-95 transition-transform"
        >
          <Layers className="h-4 w-4 text-indigo-500" />
          <span className="text-[10px] mt-0.5">Layout</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMobileSheet('more')}
          className="flex flex-col items-center justify-center min-w-[60px] h-11 text-xs text-muted-foreground active:scale-95 transition-transform"
        >
          <Sliders className="h-4 w-4 text-amber-500" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>

      {/* ── MOBILE SHEET 1: ADD NODE ─────────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeMobileSheet === 'add'}
        onClose={() => setActiveMobileSheet(null)}
        title="Add Flowchart Node"
      >
        <div className="grid grid-cols-2 gap-2 text-xs">
          {NODE_PALETTE.map(item => (
            <Button
              key={item.type}
              variant="outline"
              className="h-12 justify-start gap-2 text-xs font-semibold"
              onClick={() => handleAddNode(item.type)}
            >
              <item.icon className="h-4 w-4 text-primary" /> {item.label}
            </Button>
          ))}
        </div>
      </MobileBottomSheet>

      {/* ── MOBILE SHEET 2: NODE STYLING ─────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeMobileSheet === 'style' && !!primarySelectedNode}
        onClose={() => setActiveMobileSheet(null)}
        title="Style Selected Node"
      >
        {primarySelectedNode && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Fill Color</label>
              <div className="grid grid-cols-4 gap-2">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#0f172a', '#475569'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleUpdateNode(primarySelectedNode.id, { fill: c })}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'h-9 rounded-lg border border-black/10 transition-transform active:scale-95',
                      primarySelectedNode.fill === c && 'ring-2 ring-primary ring-offset-1'
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground block mb-1">Node Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {NODE_PALETTE.map(p => (
                  <Button
                    key={p.type}
                    variant={primarySelectedNode.type === p.type ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs justify-start gap-1.5"
                    onClick={() => handleUpdateNode(primarySelectedNode.id, {
                      type: p.type,
                      fill: DiagramEngine.getNodeColor(p.type, selectedTheme),
                    })}
                  >
                    <p.icon className="h-3 w-3" /> {p.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </MobileBottomSheet>

      {/* ── MOBILE SHEET 3: AUTO LAYOUT & FIT ─────────────────────────────────── */}
      <MobileBottomSheet
        open={activeMobileSheet === 'layout'}
        onClose={() => setActiveMobileSheet(null)}
        title="Diagram Layout & Alignment"
      >
        <div className="space-y-2 text-xs">
          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={() => handleAutoLayout('vertical')}
          >
            <Layers className="h-4 w-4 text-primary" /> Vertical Hierarchy
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={() => handleAutoLayout('horizontal')}
          >
            <ArrowRight className="h-4 w-4 text-indigo-500" /> Horizontal Workflow
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={() => { handleFitDiagram(); setActiveMobileSheet(null); }}
          >
            <Maximize className="h-4 w-4 text-emerald-500" /> Fit Diagram to Screen
          </Button>
        </div>
      </MobileBottomSheet>

      {/* ── MOBILE SHEET 4: MORE OPTIONS ─────────────────────────────────────── */}
      <MobileBottomSheet
        open={activeMobileSheet === 'more'}
        onClose={() => setActiveMobileSheet(null)}
        title="More Flowchart Tools"
      >
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 text-xs font-semibold gap-1.5"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Undo
            </Button>
            <Button
              variant="outline"
              className="h-10 text-xs font-semibold gap-1.5"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <RotateCcw className="h-3.5 w-3.5 transform -scale-x-100" /> Redo
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={() => { setActiveMobileSheet(null); setAnalysisModalOpen(true); }}
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Flow Analysis ({flowAnalysis.nodeCount} nodes)
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={() => { setActiveMobileSheet(null); setDataModalOpen(true); }}
          >
            <Sparkles className="h-4 w-4 text-amber-500" /> Generate from Text / Steps
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={() => { setActiveMobileSheet(null); setTemplatesModalOpen(true); }}
          >
            <Layers className="h-4 w-4 text-blue-500" /> Templates Library
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={handleDownloadSvg}
          >
            <Download className="h-4 w-4 text-primary" /> Download SVG (.svg)
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold"
            onClick={handleDownloadPng}
          >
            <Download className="h-4 w-4 text-primary" /> Download PNG (.png)
          </Button>
        </div>
      </MobileBottomSheet>

      {/* ── MOBILE DIALOG: DOUBLE-TAP EDIT NODE TEXT ─────────────────────────── */}
      <Dialog open={mobileNodeEditModalOpen} onOpenChange={setMobileNodeEditModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <Edit3 className="h-4 w-4 text-primary" /> Edit Node Label
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            <Input
              value={editingNodeText}
              onChange={e => setEditingNodeText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleCommitNodeText();
                  setMobileNodeEditModalOpen(false);
                }
              }}
              autoFocus
              className="h-9 text-xs font-semibold"
            />

            <Button
              className="w-full h-9 text-xs font-bold bg-primary text-primary-foreground"
              onClick={() => {
                handleCommitNodeText();
                setMobileNodeEditModalOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DESKTOP MODALS (DATA GENERATION, ANALYSIS, TEMPLATES) ───────────── */}
      <Dialog open={dataModalOpen} onOpenChange={setDataModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Generate Flowchart from Text
            </DialogTitle>
            <DialogDescription className="text-xs">
              Type or paste sequential steps with conditionals. The engine automatically lays out nodes and connectors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <textarea
              value={naturalText}
              onChange={e => setNaturalText(e.target.value)}
              rows={8}
              className="w-full text-xs font-mono p-3 rounded-xl border border-border bg-background outline-none resize-none focus:border-primary"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDataModalOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleGenerateFromData} className="text-xs gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Generate &amp; Auto-Layout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={analysisModalOpen} onOpenChange={setAnalysisModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Flowchart Structural Analysis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg border bg-muted/30 text-center">
                <span className="font-bold text-sm block">{flowAnalysis.nodeCount}</span>
                <span className="text-[10px] text-muted-foreground">Nodes</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30 text-center">
                <span className="font-bold text-sm block">{flowAnalysis.connectorCount}</span>
                <span className="text-[10px] text-muted-foreground">Links</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30 text-center">
                <span className="font-bold text-sm block">{flowAnalysis.decisionCount}</span>
                <span className="text-[10px] text-muted-foreground">Decisions</span>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30 text-center">
                <span className="font-bold text-sm block">{flowAnalysis.loopCount}</span>
                <span className="text-[10px] text-muted-foreground">Loops</span>
              </div>
            </div>

            {flowAnalysis.warnings.length > 0 ? (
              <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1.5">
                <span className="font-bold text-[11px] text-amber-700 dark:text-amber-400 block">Warnings &amp; Dead Ends</span>
                {flowAnalysis.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="h-3 w-3 text-amber-500 shrink-0" /> {w}
                  </p>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Structure valid with clear entry and exit points!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Flowchart Templates
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto p-1 text-xs">
            {DiagramEngine.getTemplates().map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setDiagram(t.data);
                  pushHistory(t.data);
                  setTemplatesModalOpen(false);
                  handleFitDiagram();
                }}
                className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 text-left transition-all space-y-1"
              >
                <span className="font-bold text-xs block">{t.name}</span>
                <span className="text-[10px] text-muted-foreground line-clamp-2">{t.description}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
