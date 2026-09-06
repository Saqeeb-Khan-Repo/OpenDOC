import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DiagramEngine, DIAGRAM_THEMES, FlowchartTheme,
  FlowchartNodeType, FlowAnalysisResult
} from '@/engines/DiagramEngine';
import { FlowchartTextParser, FlowCategory } from '@/engines/FlowchartTextParser';
import { DiagramData, DiagramNode, DiagramConnector } from '@/engines/types';
import { useDocumentsStore } from '@/store/documentsStore';
import {
  GitFork, ArrowLeft, Download, Plus, Trash2, Edit3, Check,
  Sparkles, Palette, Type, Printer, ChevronDown, ChevronRight,
  ZoomIn, ZoomOut, Maximize, RotateCcw, Play, RefreshCw,
  Search, ShieldAlert, CheckCircle2, Copy, Move, Layers,
  Square, Diamond, Circle, Database, FileText, ArrowRight,
  Sliders, Link2, X, FilePlus, HelpCircle, MoreVertical,
  Cpu, Globe, HardDrive, Radio, ExternalLink, Smartphone,
  Inbox, Lock, AlertTriangle, ShieldCheck, CheckCheck, User
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
import { FlowchartImportModal } from '@/components/flowchart/FlowchartImportModal';
import { useToastStore } from '@/store/toastStore';

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export interface PaletteComponent {
  type: FlowchartNodeType;
  label: string;
  category: FlowCategory;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  defaultColor: string;
}

export const COMPONENT_PALETTE: { category: string; key: FlowCategory; items: PaletteComponent[] }[] = [
  {
    category: 'COMPUTE',
    key: 'compute',
    items: [
      { type: 'process', label: 'Service / Microservice', category: 'compute', icon: Cpu, defaultColor: '#2563eb' },
      { type: 'cloud', label: 'API Gateway', category: 'compute', icon: GitFork, defaultColor: '#3b82f6' },
      { type: 'process', label: 'Process / Worker', category: 'compute', icon: Square, defaultColor: '#1d4ed8' },
      { type: 'subprocess', label: 'Subprocess', category: 'compute', icon: Layers, defaultColor: '#4338ca' },
    ],
  },
  {
    category: 'DATA',
    key: 'data',
    items: [
      { type: 'database', label: 'SQL Database', category: 'data', icon: Database, defaultColor: '#8b5cf6' },
      { type: 'database', label: 'NoSQL Database', category: 'data', icon: Database, defaultColor: '#7c3aed' },
      { type: 'database', label: 'Redis / Cache', category: 'data', icon: HardDrive, defaultColor: '#6d28d9' },
    ],
  },
  {
    category: 'CLIENT',
    key: 'client',
    items: [
      { type: 'input-output', label: 'User / Actor', category: 'client', icon: User, defaultColor: '#06b6d4' },
      { type: 'input-output', label: 'Web Application', category: 'client', icon: Globe, defaultColor: '#0891b2' },
      { type: 'input-output', label: 'Mobile App', category: 'client', icon: Smartphone, defaultColor: '#0e7490' },
    ],
  },
  {
    category: 'INTEGRATION',
    key: 'integration',
    items: [
      { type: 'cloud', label: 'Message Queue / Kafka', category: 'integration', icon: Inbox, defaultColor: '#f59e0b' },
      { type: 'cloud', label: 'Event Bus / PubSub', category: 'integration', icon: Radio, defaultColor: '#d97706' },
      { type: 'cloud', label: 'External API / Webhook', category: 'integration', icon: ExternalLink, defaultColor: '#b45309' },
    ],
  },
  {
    category: 'LOGIC',
    key: 'logic',
    items: [
      { type: 'decision', label: 'Decision Branch', category: 'logic', icon: Diamond, defaultColor: '#f59e0b' },
      { type: 'start', label: 'Start State', category: 'logic', icon: Circle, defaultColor: '#10b981' },
      { type: 'end', label: 'End State', category: 'logic', icon: Circle, defaultColor: '#ef4444' },
      { type: 'document', label: 'Report / Document', category: 'logic', icon: FileText, defaultColor: '#64748b' },
    ],
  },
];

const FLOWCHART_STORAGE_KEY = 'docpro_flowchart_document_v2';

interface PersistedFlowchartState {
  id: string;
  title: string;
  diagram: DiagramData;
  selectedThemeId: string;
  viewport?: Viewport;
  history: DiagramData[];
  historyIndex: number;
  updatedAt: string;
}

export function FlowchartEditorPage() {
  const navigate = useNavigate();
  const responsive = useResponsiveEditor();
  const { createDocument } = useDocumentsStore();

  // ── Load Initial Persisted State or Fallback ──────────────────────────────
  const initialData = useMemo(() => {
    try {
      const raw = localStorage.getItem(FLOWCHART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.diagram && Array.isArray(parsed.diagram.nodes)) {
          const theme = DIAGRAM_THEMES.find(t => t.id === parsed.selectedThemeId) || DIAGRAM_THEMES[0];
          const historyArr = Array.isArray(parsed.history) && parsed.history.length > 0
            ? parsed.history
            : [parsed.diagram];
          const histIdx = typeof parsed.historyIndex === 'number' && parsed.historyIndex >= 0 && parsed.historyIndex < historyArr.length
            ? parsed.historyIndex
            : historyArr.length - 1;

          return {
            title: parsed.title || 'Architecture Flowchart',
            diagram: parsed.diagram,
            theme,
            history: historyArr,
            historyIndex: histIdx,
            viewport: parsed.viewport || { x: 40, y: 40, zoom: 1 },
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load flowchart state:', e);
    }
    const def = DiagramEngine.createDefaultFlowchart();
    return {
      title: 'Architecture Flowchart',
      diagram: def,
      theme: DIAGRAM_THEMES[0], // Midnight Studio
      history: [def],
      historyIndex: 0,
      viewport: { x: 40, y: 40, zoom: 1 },
    };
  }, []);

  // ── Diagram State ──────────────────────────────────────────────────────────
  const [diagramName, setDiagramName] = useState<string>(initialData.title);
  const [isEditingName, setIsEditingName] = useState(false);
  const [diagram, setDiagram] = useState<DiagramData>(initialData.diagram);
  const [selectedTheme, setSelectedTheme] = useState<FlowchartTheme>(initialData.theme);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Multi-Step History Stack
  const [history, setHistory] = useState<DiagramData[]>(initialData.history);
  const [historyIndex, setHistoryIndex] = useState<number>(initialData.historyIndex);

  const currentDiagramRef = useRef(diagram);
  currentDiagramRef.current = diagram;

  const pushHistory = useCallback((nextDiagram: DiagramData) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      const combined = [...upToCurrent, nextDiagram];
      return combined.length > 50 ? combined.slice(combined.length - 50) : combined;
    });
    setHistoryIndex(prev => {
      const upToCurrent = history.slice(0, prev + 1);
      const combinedLength = upToCurrent.length + 1;
      return combinedLength > 50 ? 49 : prev + 1;
    });
  }, [historyIndex, history]);

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

  // ── Viewport & Canvas Sizing ───────────────────────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState<Viewport>(initialData.viewport);

  // Debounced Autosave
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        const payload: PersistedFlowchartState = {
          id: 'flowchart-main',
          title: diagramName,
          diagram,
          selectedThemeId: selectedTheme.id,
          viewport,
          history,
          historyIndex,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(FLOWCHART_STORAGE_KEY, JSON.stringify(payload));
        setSaveStatus('saved');
      } catch (err) {
        console.warn('Flowchart save failed:', err);
        setSaveStatus('saved');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [diagramName, diagram, selectedTheme.id, viewport, history, historyIndex]);

  // Measure container dimensions
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

    const diagramW = Math.max(100, maxX - minX + 80);
    const diagramH = Math.max(100, maxY - minY + 80);

    const availW = Math.max(120, canvasSize.width - (responsive.isMobile ? 24 : 64));
    const availH = Math.max(120, canvasSize.height - (responsive.isMobile ? 24 : 64));

    const scaleX = availW / diagramW;
    const scaleY = availH / diagramH;
    const fitZoom = Math.min(1.15, Math.max(0.35, Math.min(scaleX, scaleY)));

    const centeredX = Math.round((canvasSize.width - (maxX - minX) * fitZoom) / 2 - minX * fitZoom);
    const centeredY = Math.round((canvasSize.height - (maxY - minY) * fitZoom) / 2 - minY * fitZoom);

    setViewport({
      x: centeredX,
      y: centeredY,
      zoom: fitZoom,
    });
  }, [diagram.nodes, canvasSize, responsive.isMobile]);

  // Initial fit
  const hasInitializedFit = useRef(false);
  useEffect(() => {
    if (canvasSize.width > 100 && canvasSize.height > 100 && !hasInitializedFit.current) {
      hasInitializedFit.current = true;
      handleFitDiagram();
    }
  }, [canvasSize, handleFitDiagram]);

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

  // Modals & Panels
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [activeMobileSheet, setActiveMobileSheet] = useState<'palette' | 'inspector' | 'layout' | 'more' | null>(null);
  const [mobileNodeEditModalOpen, setMobileNodeEditModalOpen] = useState(false);

  // Dragging & Panning
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
        pushHistory(currentDiagramRef.current);
      }
      isCanvasPanning.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
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
        pushHistory(currentDiagramRef.current);
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
  }, [draggingNodeId, viewport.zoom, pushHistory]);

  // ── Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Delete, Esc, F) ───────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setSelectedNodeIds(diagram.nodes.map(n => n.id));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          handleDeleteSelectedNodes();
        } else if (selectedConnectorId) {
          e.preventDefault();
          handleDeleteConnector(selectedConnectorId);
        }
      } else if (e.key === 'Escape') {
        setSelectedNodeIds([]);
        setSelectedConnectorId(null);
        setEditingNodeId(null);
        handleCancelConnectMode();
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleFitDiagram();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedNodeIds, selectedConnectorId, diagram.nodes, handleFitDiagram]);

  // ── Node & Connector Operations ────────────────────────────────────────────
  const handleAddNode = (type: FlowchartNodeType, labelOverride?: string, colorOverride?: string) => {
    const id = `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const color = colorOverride || DiagramEngine.getNodeColor(type, selectedTheme);

    const isDecision = type === 'decision';
    const isStartEnd = type === 'start' || type === 'end';
    const isDb = type === 'database';

    const defaultLabel = labelOverride || (
      isDecision ? 'Is Valid?' :
      type === 'start' ? 'Start' :
      type === 'end' ? 'End' :
      isDb ? 'Database' :
      type === 'cloud' ? 'API Gateway' :
      'Process Step'
    );

    const worldCenter = {
      x: Math.round((canvasSize.width / 2 - viewport.x) / viewport.zoom - 90),
      y: Math.round((canvasSize.height / 2 - viewport.y) / viewport.zoom - 32),
    };

    const newNode: DiagramNode = {
      id,
      type: type as any,
      text: defaultLabel,
      x: Math.max(40, worldCenter.x + (diagram.nodes.length % 5) * 24),
      y: Math.max(40, worldCenter.y + (diagram.nodes.length % 5) * 24),
      width: isDecision ? 180 : 180,
      height: isDecision ? 70 : 64,
      fill: color,
      stroke: color,
    };

    const next = {
      ...diagram,
      nodes: [...diagram.nodes, newNode],
    };

    setDiagram(next);
    pushHistory(next);
    setSelectedNodeIds([id]);
    setSelectedConnectorId(null);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<DiagramNode>) => {
    const next = {
      ...diagram,
      nodes: diagram.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
    };
    setDiagram(next);
    pushHistory(next);
  };

  const handleDeleteSelectedNodes = () => {
    if (selectedNodeIds.length === 0) return;
    const next = {
      ...diagram,
      nodes: diagram.nodes.filter(n => !selectedNodeIds.includes(n.id)),
      connectors: diagram.connectors.filter(
        c => !selectedNodeIds.includes(c.fromNodeId) && !selectedNodeIds.includes(c.toNodeId)
      ),
    };
    setDiagram(next);
    pushHistory(next);
    setSelectedNodeIds([]);
  };

  const handleDuplicateSelectedNode = () => {
    const node = diagram.nodes.find(n => n.id === selectedNodeIds[0]);
    if (!node) return;
    const duplicated: DiagramNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: node.x + 36,
      y: node.y + 36,
      text: `${node.text} (Copy)`,
    };
    const next = {
      ...diagram,
      nodes: [...diagram.nodes, duplicated],
    };
    setDiagram(next);
    pushHistory(next);
    setSelectedNodeIds([duplicated.id]);
  };

  const handleCommitNodeText = () => {
    if (editingNodeId) {
      handleUpdateNode(editingNodeId, { text: editingNodeText.trim() || 'Step' });
      setEditingNodeId(null);
    }
  };

  // ── Connection Logic ───────────────────────────────────────────────────────
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
        setConnectFeedback('Cannot connect node to itself.');
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
        arrow: 'end',
      };

      const next = { ...diagram, connectors: [...diagram.connectors, newConn] };
      setDiagram(next);
      pushHistory(next);
      setConnectFeedback('✓ Connection created!');
      setTimeout(() => handleCancelConnectMode(), 600);
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

  // ── Auto Layout ────────────────────────────────────────────────────────────
  const handleAutoLayout = (direction: 'vertical' | 'horizontal' = 'vertical') => {
    const arranged = DiagramEngine.computeAutoLayout(diagram, direction);
    setDiagram(arranged);
    pushHistory(arranged);
    handleFitDiagram();
    setActiveMobileSheet(null);
  };

  // ── Import from Text Handler ───────────────────────────────────────────────
  const handleImportDiagram = (importedDiagram: DiagramData, mode: 'replace' | 'add') => {
    if (mode === 'replace') {
      setDiagram(importedDiagram);
      pushHistory(importedDiagram);
    } else {
      // Add to current diagram with offset to prevent overlap
      const maxExistingX = Math.max(0, ...diagram.nodes.map(n => n.x + n.width));
      const shiftedNodes = importedDiagram.nodes.map(n => ({
        ...n,
        id: `imp_${n.id}_${Date.now()}`,
        x: n.x + maxExistingX + 80,
      }));

      const idMap = new Map<string, string>();
      importedDiagram.nodes.forEach((n, idx) => {
        idMap.set(n.id, shiftedNodes[idx].id);
      });

      const shiftedConnectors = importedDiagram.connectors.map((c, idx) => ({
        ...c,
        id: `imp_conn_${idx}_${Date.now()}`,
        fromNodeId: idMap.get(c.fromNodeId) || c.fromNodeId,
        toNodeId: idMap.get(c.toNodeId) || c.toNodeId,
      }));

      const merged: DiagramData = {
        type: 'architecture',
        nodes: [...diagram.nodes, ...shiftedNodes],
        connectors: [...diagram.connectors, ...shiftedConnectors],
      };

      setDiagram(merged);
      pushHistory(merged);
    }

    setTimeout(() => handleFitDiagram(), 80);
  };

  // ── Flow Analysis & Validation ─────────────────────────────────────────────
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

  // ── Export Handlers (Canvas Only, Zero Website Chrome) ─────────────────────
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

  const handleDownloadJson = () => {
    const payload = {
      version: 1,
      name: diagramName,
      diagram,
      selectedThemeId: selectedTheme.id,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${diagramName.replace(/\s+/g, '_')}.flowchart.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2500);
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
    <div className="h-screen h-[100dvh] flex flex-col bg-[#050A18] text-white overflow-hidden select-none font-sans">
      <SEOHead
        title={`${diagramName || 'Flowchart Studio'} | DocProEditor`}
        description="DocProEditor Professional Architecture & Flowchart Studio"
        canonicalPath="/flowchart"
        noindex={true}
      />

      {/* ── 1. TOP NAVIGATION BAR (DEEP NAVY IDE AESTHETIC) ─────────────────── */}
      <header className="h-12 bg-[#070D1F] border-b border-white/10 px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-200 hover:text-white transition-colors cursor-pointer group shrink-0"
            title="Go to DocProEditor Dashboard"
          >
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold tracking-tight hidden xs:inline">DocProEditor</span>
          </button>

          <span className="text-white/20 text-xs font-mono select-none">/</span>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="h-6 w-6 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <GitFork className="h-3.5 w-3.5" />
            </div>
            {isEditingName ? (
              <Input
                value={diagramName}
                onChange={e => setDiagramName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                className="h-7 text-xs font-semibold max-w-[180px] bg-[#0B1224] border-blue-500/50 text-white"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-xs font-semibold truncate hover:text-blue-400 transition-colors flex items-center gap-1.5 group max-w-[120px] xs:max-w-[180px] sm:max-w-xs text-left"
                title="Click to rename diagram"
              >
                <span className="truncate text-slate-200">{diagramName}</span>
                <Edit3 className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 shrink-0 hidden sm:inline" />
              </button>
            )}
          </div>

          {/* Autosave Status Badge */}
          <div className="hidden lg:flex items-center gap-1 text-[10.5px] font-mono text-slate-400 pl-1">
            {saveStatus === 'saving' ? (
              <span className="text-blue-400 flex items-center gap-1">
                <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Saving...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo / Redo */}
          <div className="hidden sm:flex items-center bg-[#0B1224] border border-white/10 rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 cursor-pointer"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <RotateCcw className="h-3.5 w-3.5 transform -scale-x-100" />
            </Button>
          </div>

          {/* ── IMPORT FROM TEXT / AI (PROMINENT CALL TO ACTION) ────────────── */}
          <Button
            size="sm"
            onClick={() => setImportModalOpen(true)}
            className="h-8 text-xs gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer border border-blue-400/30"
            title="Import from text, ChatGPT, Claude, Gemini, or Mermaid"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            <span className="hidden xs:inline">Import from Text</span>
          </Button>

          {/* Auto Layout / Tidy */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-white/10 bg-[#0B1224] text-slate-300 hover:text-white hover:bg-white/5 font-medium cursor-pointer"
              >
                <Layers className="h-3.5 w-3.5 text-blue-400" />
                <span className="hidden sm:inline">Auto Layout</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs bg-[#0B1224] border-white/10 text-white">
              <DropdownMenuItem onClick={() => handleAutoLayout('vertical')} className="cursor-pointer">
                Top-to-Bottom (Vertical)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAutoLayout('horizontal')} className="cursor-pointer">
                Left-to-Right (Horizontal)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleFitDiagram} className="cursor-pointer">
                Fit to Screen (F)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Audit & Check */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAnalysisModalOpen(true)}
            className={cn(
              'h-8 text-xs gap-1.5 font-medium cursor-pointer border-white/10 bg-[#0B1224] hidden sm:flex',
              flowAnalysis.warnings.length > 0
                ? 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
                : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
            )}
            title="Architecture rules check & pattern validation"
          >
            {flowAnalysis.warnings.length > 0 ? (
              <ShieldAlert className="h-3.5 w-3.5" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" />
            )}
            <span className="hidden md:inline">Audit</span>
            {flowAnalysis.warnings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px] font-mono font-bold">
                {flowAnalysis.warnings.length}
              </span>
            )}
          </Button>

          {/* Themes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-white/10 bg-[#0B1224] text-slate-300 hover:text-white hover:bg-white/5 font-medium cursor-pointer hidden md:flex"
              >
                <Palette className="h-3.5 w-3.5 text-purple-400" />
                <span className="hidden xl:inline">{selectedTheme.name}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs bg-[#0B1224] border-white/10 text-white">
              {DIAGRAM_THEMES.map(th => (
                <DropdownMenuItem
                  key={th.id}
                  onClick={() => setSelectedTheme(th)}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <span>{th.name}</span>
                  {selectedTheme.id === th.id && <Check className="h-3.5 w-3.5 text-blue-400" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-8 text-xs gap-1 bg-[#111A2E] hover:bg-[#151F35] text-white border border-white/10 font-bold px-2.5 sm:px-3 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-xs bg-[#0B1224] border-white/10 text-white">
              <DropdownMenuItem onClick={handleDownloadSvg} className="cursor-pointer">
                Export Vector SVG (.svg)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPng} className="cursor-pointer">
                Export High-Res PNG (.png)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadJson} className="cursor-pointer">
                Export Diagram JSON (.json)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleAddToDocument} className="cursor-pointer text-blue-400">
                Embed into DocProEditor Doc
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── 2. CONNECTION MODE INSTRUCTION BANNER ────────────────────────────── */}
      {connectModeActive && (
        <div className="bg-blue-600 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-between shrink-0 shadow-md z-30 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 animate-spin" />
            <span>{connectFeedback || 'Select source node, then destination node.'}</span>
          </div>
          <button
            type="button"
            onClick={handleCancelConnectMode}
            className="px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* ── 3. MAIN 3-PANEL WORKSPACE: COMPONENT PALETTE | CANVAS | INSPECTOR ── */}
      <div className="flex-1 flex overflow-hidden relative w-full">
        {/* ── LEFT PANEL: ARCHITECTURE COMPONENT PALETTE (DESKTOP) ─────────── */}
        <div className="w-56 border-r border-white/10 bg-[#070D1F] flex flex-col shrink-0 hidden md:flex select-none">
          <div className="p-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Components
            </span>
            <button
              type="button"
              onClick={() => handleStartConnectMode()}
              className="text-[11px] text-blue-400 hover:underline cursor-pointer flex items-center gap-1 font-medium"
            >
              <Link2 className="h-3 w-3" /> Connect
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {COMPONENT_PALETTE.map(group => (
              <div key={group.category} className="space-y-1.5">
                <div className="px-2 text-[10px] font-bold text-slate-500 tracking-wider">
                  {group.category}
                </div>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleAddNode(item.type, item.label, item.defaultColor)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#0B1224]/50 hover:bg-[#111A2E] border border-white/5 hover:border-white/10 transition-all text-left cursor-pointer group"
                    >
                      <div
                        className="h-6 w-6 rounded-md flex items-center justify-center shrink-0 shadow-2xs"
                        style={{ backgroundColor: `${item.defaultColor}20`, color: item.defaultColor }}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTemplatesModalOpen(true)}
              className="w-full text-xs gap-1.5 h-8 font-medium border-white/10 bg-[#0B1224] text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <Layers className="h-3.5 w-3.5 text-blue-400" />
              <span>Templates Library</span>
            </Button>
          </div>
        </div>

        {/* ── CENTER CANVAS: SUBTLE DARK NAVY WITH INTERACTIVE NODES ───────── */}
        <div
          ref={canvasContainerRef}
          className="flex-1 bg-[#050A18] overflow-hidden relative cursor-crosshair touch-none select-none w-full h-full"
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
          {/* Subtle Fine Grid Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: `${Math.round(24 * viewport.zoom)}px ${Math.round(24 * viewport.zoom)}px`,
              backgroundPosition: `${viewport.x % (24 * viewport.zoom)}px ${viewport.y % (24 * viewport.zoom)}px`,
            }}
          />

          {/* Floating Zoom & Fit Toolbar */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-[#070D1F]/90 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-xl select-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewport(v => ({ ...v, zoom: Math.max(0.35, Number((v.zoom - 0.1).toFixed(1))) }));
              }}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold px-1 min-w-[36px] text-center text-slate-300">
              {Math.round(viewport.zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setViewport(v => ({ ...v, zoom: Math.min(2.5, Number((v.zoom + 0.1).toFixed(1))) }));
              }}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFitDiagram();
              }}
              className="h-7 px-2.5 rounded-lg text-[10.5px] font-bold text-blue-400 hover:bg-blue-500/10 active:scale-95 transition-all border-l border-white/10 ml-0.5 cursor-pointer"
              title="Fit to Screen (F)"
            >
              Fit
            </button>
          </div>

          {/* ── EMPTY STATE ─────────────────────────────────────────────────── */}
          {diagram.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 pointer-events-none">
              <div className="bg-[#070D1F]/90 border border-white/10 rounded-2xl p-8 max-w-md shadow-2xl backdrop-blur-md pointer-events-auto space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Your Architecture Flowchart</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Paste an AI prompt, design manually, or start from an architecture pattern.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => setImportModalOpen(true)}
                    className="h-9 text-xs gap-1.5 font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer flex-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Import from Text / AI
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTemplatesModalOpen(true)}
                    className="h-9 text-xs gap-1.5 border-white/10 bg-[#0B1224] text-slate-300 hover:text-white cursor-pointer flex-1"
                  >
                    <Layers className="h-3.5 w-3.5 text-blue-400" /> Templates
                  </Button>
                </div>

                {/* Quick-Click Sample */}
                <div className="pt-2 border-t border-white/10 text-left">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">QUICK START:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = FlowchartTextParser.parse('Client → API Gateway → Application Service → PostgreSQL Database');
                      handleImportDiagram(sample.diagram, 'replace');
                    }}
                    className="text-[11px] font-mono text-blue-400 hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                  >
                    Try: Client → API → Service → Database
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TRANSFORMED STAGE (WORLD SPACE) ────────────────────────────── */}
          <div
            className="absolute inset-0 origin-top-left transition-transform duration-75"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            }}
          >
            {/* SVG Layer for Connectors */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: '8000px', height: '8000px' }}
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

              {/* Connectors */}
              {diagram.connectors.map(c => {
                const from = diagram.nodes.find(n => n.id === c.fromNodeId);
                const to = diagram.nodes.find(n => n.id === c.toNodeId);
                if (!from || !to) return null;

                const isSelected = selectedConnectorId === c.id;
                const route = DiagramEngine.calculateConnectorRoute(from, to, 'elbow');

                return (
                  <g
                    key={c.id}
                    className="pointer-events-auto cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConnectorId(c.id);
                      setSelectedNodeIds([]);
                    }}
                  >
                    <path
                      d={route.pathD}
                      fill="none"
                      stroke={isSelected ? '#3b82f6' : selectedTheme.connectorColor}
                      strokeWidth={isSelected ? 3 : 2}
                      strokeDasharray={c.style === 'dashed' ? '5,5' : undefined}
                      markerEnd="url(#canvas-arrow)"
                    />
                    {c.label && (
                      <g>
                        <rect
                          x={route.labelX - Math.max(30, c.label.length * 4)}
                          y={route.labelY - 11}
                          width={Math.max(60, c.label.length * 8)}
                          height={20}
                          rx={5}
                          fill="#070D1F"
                          stroke={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.15)'}
                          strokeWidth={1}
                        />
                        <text
                          x={route.labelX}
                          y={route.labelY + 3}
                          fontSize="10"
                          fontWeight="600"
                          fill="#e2e8f0"
                          textAnchor="middle"
                          className="font-mono"
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
                  top: `${selectedConnectorRoute.labelY - 40}px`,
                }}
                className="absolute transform -translate-x-1/2 bg-[#0B1224] border border-white/20 shadow-2xl rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 z-40 select-none pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Label</span>
                {['Yes', 'No', 'Request', 'Query', 'Publish'].map(lbl => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => handleUpdateConnectorLabel(selectedConnector.id, selectedConnector.label === lbl ? '' : lbl)}
                    className={cn(
                      'px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer',
                      selectedConnector.label === lbl
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    )}
                  >
                    {lbl}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleDeleteConnector(selectedConnector.id)}
                  className="p-1 text-red-400 hover:bg-red-500/20 rounded ml-1 cursor-pointer"
                  title="Delete Connection"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* ── ARCHITECTURE NODES ────────────────────────────────────────── */}
            {diagram.nodes.map(n => {
              const isSelected = selectedNodeIds.includes(n.id);
              const isHighlight = highlightedNodeId === n.id || connectSourceNodeId === n.id;
              const isDecision = n.type === 'decision';
              const isStartEnd = n.type === 'start' || n.type === 'end';
              const isDb = n.type === 'database';

              // Category classification
              const category =
                isDecision || isStartEnd ? 'logic' :
                isDb ? 'data' :
                /client|user|web app|mobile app/i.test(n.text) ? 'client' :
                /queue|kafka|bus|broker|api/i.test(n.text) ? 'integration' :
                'compute';

              const categoryBadge =
                category === 'client' ? 'CLIENT' :
                category === 'data' ? 'DATA' :
                category === 'integration' ? 'INTEGRATION' :
                category === 'logic' ? 'LOGIC' :
                'COMPUTE';

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
                  }}
                  className={cn(
                    'absolute flex flex-col justify-between p-2.5 transition-all cursor-move select-none rounded-xl border group shadow-lg',
                    'bg-[#0D1528] text-white',
                    isSelected ? 'ring-2 ring-blue-500 border-blue-400 shadow-blue-500/20' : 'border-white/10 hover:border-white/20',
                    isHighlight && 'ring-4 ring-amber-400 animate-pulse',
                    isStartEnd && 'rounded-full px-4 justify-center',
                    isDb && 'border-t-4 border-b-4 border-purple-500/60'
                  )}
                >
                  {/* Category Pill Tag & Anchor Connector Port (Top) */}
                  <div className="flex items-center justify-between pointer-events-none">
                    <span
                      className="text-[8.5px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded"
                      style={{
                        backgroundColor: `${n.fill || '#3b82f6'}25`,
                        color: n.fill || '#3b82f6',
                      }}
                    >
                      {categoryBadge}
                    </span>

                    {/* Quick Connect Anchor Port */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartConnectMode(n.id);
                      }}
                      className="h-4 w-4 rounded-full bg-white/10 hover:bg-blue-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-auto cursor-pointer"
                      title="Connect to another node"
                    >
                      <Link2 className="h-2.5 w-2.5" />
                    </button>
                  </div>

                  {/* Main Node Text / Inline Editor */}
                  <div className="relative z-10 my-auto text-left pointer-events-none">
                    {editingNodeId === n.id && !responsive.isMobile ? (
                      <input
                        value={editingNodeText}
                        onChange={e => setEditingNodeText(e.target.value)}
                        onBlur={handleCommitNodeText}
                        onKeyDown={e => e.key === 'Enter' && handleCommitNodeText()}
                        autoFocus
                        className="w-full text-xs font-bold bg-[#050A18] text-white border border-blue-500 rounded px-1.5 py-0.5 outline-none pointer-events-auto"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-100 line-clamp-2 block leading-snug">
                        {n.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL: ARCHITECTURE INSPECTOR / VALIDATION AUDIT ───────── */}
        <div className="w-72 border-l border-white/10 bg-[#070D1F] flex flex-col shrink-0 hidden xl:flex select-none text-xs">
          {primarySelectedNode ? (
            /* Selected Node Properties Mode */
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Node Inspector
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleDuplicateSelectedNode}
                    className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded cursor-pointer"
                    title="Duplicate Node"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteSelectedNodes}
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded cursor-pointer"
                    title="Delete Node"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Label / Title</label>
                <Input
                  value={primarySelectedNode.text}
                  onChange={e => handleUpdateNode(primarySelectedNode.id, { text: e.target.value })}
                  className="h-8 text-xs font-medium bg-[#0B1224] border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1">Type</label>
                <select
                  value={primarySelectedNode.type}
                  onChange={e => {
                    const t = e.target.value as FlowchartNodeType;
                    handleUpdateNode(primarySelectedNode.id, {
                      type: t,
                      fill: DiagramEngine.getNodeColor(t, selectedTheme),
                    });
                  }}
                  className="w-full h-8 text-xs rounded-lg border border-white/10 bg-[#0B1224] px-2 font-medium text-white cursor-pointer"
                >
                  <option value="process">Service / Process</option>
                  <option value="decision">Decision Branch</option>
                  <option value="database">Database</option>
                  <option value="input-output">Client / User</option>
                  <option value="cloud">Cloud / Gateway</option>
                  <option value="start">Start State</option>
                  <option value="end">End State</option>
                  <option value="subprocess">Subprocess</option>
                  <option value="document">Document</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">X Position</label>
                  <Input
                    type="number"
                    value={primarySelectedNode.x}
                    onChange={e => handleUpdateNode(primarySelectedNode.id, { x: parseInt(e.target.value) || 0 })}
                    className="h-7 text-xs font-mono bg-[#0B1224] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-0.5">Y Position</label>
                  <Input
                    type="number"
                    value={primarySelectedNode.y}
                    onChange={e => handleUpdateNode(primarySelectedNode.id, { y: parseInt(e.target.value) || 0 })}
                    className="h-7 text-xs font-mono bg-[#0B1224] border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-400 block mb-1.5">Color Accent</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#2563eb', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#475569', '#050A18'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdateNode(primarySelectedNode.id, { fill: c })}
                      style={{ backgroundColor: c }}
                      className={cn(
                        'h-7 rounded-lg border border-white/10 transition-transform hover:scale-105 cursor-pointer',
                        primarySelectedNode.fill === c && 'ring-2 ring-white shadow-md'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Architecture Audit & Rules Validation Mode */
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div className="border-b border-white/10 pb-2 flex items-center justify-between">
                <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Architecture Audit
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Live Engine
                </span>
              </div>

              {/* Status Banner */}
              <div className={cn(
                'p-3 rounded-xl border flex items-start gap-2.5',
                flowAnalysis.warnings.length > 0
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              )}>
                {flowAnalysis.warnings.length > 0 ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                ) : (
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                )}
                <div>
                  <strong className="block text-xs font-bold text-white">
                    {flowAnalysis.warnings.length > 0 ? 'Actionable Items Detected' : 'Architecture Model Valid'}
                  </strong>
                  <span className="text-[10.5px] opacity-80 leading-relaxed block mt-0.5">
                    {flowAnalysis.warnings.length > 0
                      ? `${flowAnalysis.warnings.length} structure warnings flagged for review.`
                      : 'All nodes have valid connections and entry points.'}
                  </span>
                </div>
              </div>

              {/* Warnings List */}
              {flowAnalysis.warnings.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Security &amp; Pattern Flags
                  </span>
                  <div className="space-y-1.5">
                    {flowAnalysis.warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-[#0B1224] border border-white/10 text-[11px] text-slate-300 flex items-start gap-2"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Architecture Statistics */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Model Statistics
                </span>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-[#0B1224] border border-white/10">
                    <span className="text-base font-bold text-white block">{diagram.nodes.length}</span>
                    <span className="text-[10px] text-slate-400">Total Nodes</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1224] border border-white/10">
                    <span className="text-base font-bold text-white block">{diagram.connectors.length}</span>
                    <span className="text-[10px] text-slate-400">Connections</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1224] border border-white/10">
                    <span className="text-base font-bold text-purple-400 block">{flowAnalysis.databaseCount}</span>
                    <span className="text-[10px] text-slate-400">Databases</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1224] border border-white/10">
                    <span className="text-base font-bold text-amber-400 block">{flowAnalysis.decisionCount}</span>
                    <span className="text-[10px] text-slate-400">Decisions</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. MOBILE BOTTOM NAVIGATION TOOLBAR ─────────────────────────────── */}
      <div
        className="h-13 border-t border-white/10 bg-[#070D1F] flex md:hidden items-center justify-around shrink-0 z-30 select-none px-1"
        style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
      >
        {/* 1. Add Node */}
        <button
          type="button"
          onClick={() => setActiveMobileSheet('palette')}
          aria-label="Add node"
          className="flex flex-col items-center justify-center min-w-[54px] h-12 text-xs text-blue-400 font-semibold active:scale-95 transition-all cursor-pointer rounded-xl hover:bg-white/5"
        >
          <Plus className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Node</span>
        </button>

        {/* 2. Connect (2-tap node connection) */}
        <button
          type="button"
          onClick={() => {
            if (connectModeActive) handleCancelConnectMode();
            else handleStartConnectMode();
          }}
          aria-label="Connect nodes"
          className={cn(
            'flex flex-col items-center justify-center min-w-[54px] h-12 text-xs font-semibold active:scale-95 transition-all cursor-pointer rounded-xl',
            connectModeActive ? 'text-blue-400 font-bold bg-blue-500/20 animate-pulse' : 'text-slate-400 hover:text-white'
          )}
        >
          <Link2 className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">{connectModeActive ? 'Linking' : 'Connect'}</span>
        </button>

        {/* 3. Text (Edit node label) */}
        <button
          type="button"
          onClick={() => {
            if (primarySelectedNode) {
              setEditingNodeId(primarySelectedNode.id);
              setEditingNodeText(primarySelectedNode.text);
              setMobileNodeEditModalOpen(true);
            } else {
              useToastStore.getState().info('Select a node first to edit its text');
            }
          }}
          aria-label="Edit node text"
          className={cn(
            'flex flex-col items-center justify-center min-w-[54px] h-12 text-xs font-semibold active:scale-95 transition-all cursor-pointer rounded-xl',
            primarySelectedNode ? 'text-blue-400 hover:bg-blue-500/10' : 'text-slate-500 hover:text-slate-400'
          )}
        >
          <Type className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Text</span>
        </button>

        {/* 4. Delete */}
        <button
          type="button"
          onClick={() => {
            if (selectedNodeIds.length > 0) {
              handleDeleteSelectedNodes();
            } else if (selectedConnectorId) {
              handleDeleteConnector(selectedConnectorId);
            }
          }}
          disabled={selectedNodeIds.length === 0 && !selectedConnectorId}
          aria-label="Delete selected node or connection"
          className={cn(
            'flex flex-col items-center justify-center min-w-[54px] h-12 text-xs font-semibold active:scale-95 transition-all cursor-pointer rounded-xl',
            selectedNodeIds.length > 0 || selectedConnectorId ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-600 cursor-not-allowed'
          )}
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Delete</span>
        </button>

        {/* 5. More */}
        <button
          type="button"
          onClick={() => setActiveMobileSheet('more')}
          aria-label="More flowchart options"
          className="flex flex-col items-center justify-center min-w-[54px] h-12 text-xs text-slate-400 hover:text-white active:scale-95 transition-all cursor-pointer rounded-xl"
        >
          <Sliders className="h-4 w-4 text-amber-400" />
          <span className="text-[10px] mt-0.5">More</span>
        </button>
      </div>

      {/* ── 5. MODALS & MOBILE SHEETS ──────────────────────────────────────── */}
      <FlowchartImportModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImportDiagram={handleImportDiagram}
        existingNodeCount={diagram.nodes.length}
        selectedTheme={selectedTheme}
      />

      {/* Mobile Palette Bottom Sheet */}
      <MobileBottomSheet
        open={activeMobileSheet === 'palette'}
        onClose={() => setActiveMobileSheet(null)}
        title="Add Architecture Component"
      >
        <div className="space-y-3 text-xs">
          {COMPONENT_PALETTE.map(group => (
            <div key={group.category} className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {group.category}
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map(item => (
                  <Button
                    key={item.label}
                    variant="outline"
                    onClick={() => {
                      handleAddNode(item.type, item.label, item.defaultColor);
                      setActiveMobileSheet(null);
                    }}
                    className="h-10 text-xs justify-start gap-2 bg-[#0B1224] border-white/10 text-white font-medium"
                  >
                    <item.icon className="h-3.5 w-3.5" style={{ color: item.defaultColor }} />
                    <span className="truncate">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </MobileBottomSheet>

      {/* Mobile Layout Bottom Sheet */}
      <MobileBottomSheet
        open={activeMobileSheet === 'layout'}
        onClose={() => setActiveMobileSheet(null)}
        title="Layout & Alignment"
      >
        <div className="space-y-2 text-xs">
          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={() => handleAutoLayout('vertical')}
          >
            <Layers className="h-4 w-4 text-blue-400" /> Vertical Hierarchy
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={() => handleAutoLayout('horizontal')}
          >
            <ArrowRight className="h-4 w-4 text-blue-400" /> Horizontal Workflow
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={() => { handleFitDiagram(); setActiveMobileSheet(null); }}
          >
            <Maximize className="h-4 w-4 text-emerald-400" /> Fit to Screen
          </Button>
        </div>
      </MobileBottomSheet>

      {/* Mobile More Options Sheet */}
      <MobileBottomSheet
        open={activeMobileSheet === 'more'}
        onClose={() => setActiveMobileSheet(null)}
        title="More Tools"
      >
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 text-xs font-semibold gap-1.5 bg-[#0B1224] border-white/10 text-white"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Undo
            </Button>
            <Button
              variant="outline"
              className="h-10 text-xs font-semibold gap-1.5 bg-[#0B1224] border-white/10 text-white"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <RotateCcw className="h-3.5 w-3.5 transform -scale-x-100" /> Redo
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={() => { setActiveMobileSheet(null); setImportModalOpen(true); }}
          >
            <Sparkles className="h-4 w-4 text-blue-400" /> Import from Text / AI
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={() => { setActiveMobileSheet(null); setAnalysisModalOpen(true); }}
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Architecture Audit
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={() => { setActiveMobileSheet(null); setTemplatesModalOpen(true); }}
          >
            <Layers className="h-4 w-4 text-purple-400" /> Templates Library
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={handleDownloadSvg}
          >
            <Download className="h-4 w-4 text-blue-400" /> Export Vector SVG
          </Button>

          <Button
            variant="outline"
            className="w-full h-11 justify-start gap-2 font-semibold bg-[#0B1224] border-white/10 text-white"
            onClick={handleDownloadPng}
          >
            <Download className="h-4 w-4 text-blue-400" /> Export Image PNG
          </Button>
        </div>
      </MobileBottomSheet>

      {/* Double-Tap Edit Mobile Modal */}
      <Dialog open={mobileNodeEditModalOpen} onOpenChange={setMobileNodeEditModalOpen}>
        <DialogContent className="sm:max-w-xs bg-[#070D1F] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5 text-white">
              <Edit3 className="h-4 w-4 text-blue-400" /> Edit Node Label
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
              className="h-9 text-xs font-semibold bg-[#0B1224] border-white/10 text-white"
            />

            <Button
              className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
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

      {/* Full Audit Analysis Dialog */}
      <Dialog open={analysisModalOpen} onOpenChange={setAnalysisModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#070D1F] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-white">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> Architecture Logic &amp; Pattern Audit
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl border border-white/10 bg-[#0B1224] text-center">
                <span className="font-bold text-sm block text-white">{flowAnalysis.nodeCount}</span>
                <span className="text-[10px] text-slate-400">Nodes</span>
              </div>
              <div className="p-2.5 rounded-xl border border-white/10 bg-[#0B1224] text-center">
                <span className="font-bold text-sm block text-white">{flowAnalysis.connectorCount}</span>
                <span className="text-[10px] text-slate-400">Links</span>
              </div>
              <div className="p-2.5 rounded-xl border border-white/10 bg-[#0B1224] text-center">
                <span className="font-bold text-sm block text-purple-400">{flowAnalysis.databaseCount}</span>
                <span className="text-[10px] text-slate-400">Databases</span>
              </div>
              <div className="p-2.5 rounded-xl border border-white/10 bg-[#0B1224] text-center">
                <span className="font-bold text-sm block text-amber-400">{flowAnalysis.decisionCount}</span>
                <span className="text-[10px] text-slate-400">Decisions</span>
              </div>
            </div>

            {flowAnalysis.warnings.length > 0 ? (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
                <span className="font-bold text-[11px] text-amber-300 block">
                  Actionable Architecture Flags ({flowAnalysis.warnings.length})
                </span>
                {flowAnalysis.warnings.map((w, i) => (
                  <p key={i} className="text-[11px] text-slate-200 flex items-start gap-1.5 leading-relaxed">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </p>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-2 text-emerald-300 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Structure valid with clear entry points and services!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Modal */}
      <Dialog open={templatesModalOpen} onOpenChange={setTemplatesModalOpen}>
        <DialogContent className="sm:max-w-lg bg-[#070D1F] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-white">
              <Layers className="h-4 w-4 text-blue-400" /> Architecture &amp; Flowchart Templates
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
                className="p-3 rounded-xl border border-white/10 bg-[#0B1224] hover:border-blue-500/40 text-left transition-all space-y-1 cursor-pointer"
              >
                <span className="font-bold text-xs block text-white">{t.name}</span>
                <span className="text-[10px] text-slate-400 line-clamp-2">{t.description}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
