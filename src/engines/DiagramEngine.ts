import { DiagramData, DiagramNode, DiagramConnector } from './types';

export type FlowchartNodeType =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'input-output'
  | 'database'
  | 'document'
  | 'subprocess'
  | 'cloud';

export interface FlowchartTheme {
  id: string;
  name: string;
  background: string;
  canvasBorder: string;
  startColor: string;
  processColor: string;
  decisionColor: string;
  ioColor: string;
  databaseColor: string;
  textColor: string;
  connectorColor: string;
  connectorLabelBg: string;
}

export const DIAGRAM_THEMES: FlowchartTheme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    background: '#ffffff',
    canvasBorder: '#e2e8f0',
    startColor: '#10b981',
    processColor: '#3b82f6',
    decisionColor: '#f59e0b',
    ioColor: '#06b6d4',
    databaseColor: '#8b5cf6',
    textColor: '#ffffff',
    connectorColor: '#475569',
    connectorLabelBg: '#f8fafc',
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    background: '#f8fafc',
    canvasBorder: '#cbd5e1',
    startColor: '#047857',
    processColor: '#1e3a8a',
    decisionColor: '#d97706',
    ioColor: '#0284c7',
    databaseColor: '#6d28d9',
    textColor: '#ffffff',
    connectorColor: '#1e293b',
    connectorLabelBg: '#ffffff',
  },
  {
    id: 'dark-neon',
    name: 'Dark Studio',
    background: '#090d16',
    canvasBorder: '#1e293b',
    startColor: '#10b981',
    processColor: '#2563eb',
    decisionColor: '#f59e0b',
    ioColor: '#00bcd4',
    databaseColor: '#a855f7',
    textColor: '#ffffff',
    connectorColor: '#94a3b8',
    connectorLabelBg: '#1e293b',
  },
  {
    id: 'academic-clean',
    name: 'Academic Clean',
    background: '#ffffff',
    canvasBorder: '#000000',
    startColor: '#334155',
    processColor: '#475569',
    decisionColor: '#64748b',
    ioColor: '#475569',
    databaseColor: '#334155',
    textColor: '#ffffff',
    connectorColor: '#0f172a',
    connectorLabelBg: '#ffffff',
  },
  {
    id: 'emerald-mint',
    name: 'Emerald Mint',
    background: '#f0fdf4',
    canvasBorder: '#bbf7d0',
    startColor: '#059669',
    processColor: '#0d9488',
    decisionColor: '#ea580c',
    ioColor: '#0284c7',
    databaseColor: '#047857',
    textColor: '#ffffff',
    connectorColor: '#065f46',
    connectorLabelBg: '#ffffff',
  },
];

export interface FlowAnalysisResult {
  nodeCount: number;
  processCount: number;
  decisionCount: number;
  ioCount: number;
  databaseCount: number;
  connectorCount: number;
  branchCount: number;
  loopCount: number;
  hasStart: boolean;
  hasEnd: boolean;
  warnings: string[];
  flowSummary: string;
}

export class DiagramEngine {
  /**
   * Auto-detect node type from text keywords
   */
  static inferNodeType(text: string): FlowchartNodeType {
    const lower = text.trim().toLowerCase();

    if (/^(start|begin|init|launch|entry)\b/i.test(lower)) return 'start';
    if (/^(end|stop|exit|terminate|finish|logout)\b/i.test(lower)) return 'end';
    if (/\?$/i.test(lower) || /^(if|is|check|validate|verify|condition|choice|decision)\b/i.test(lower)) return 'decision';
    if (/^(input|enter|read|scan|upload|provide|receive)\b/i.test(lower)) return 'input-output';
    if (/^(output|display|show|render|print|respond|return)\b/i.test(lower)) return 'input-output';
    if (/(database|db|sql|store|table|repository|cache|save to db)\b/i.test(lower)) return 'database';
    if (/(document|file|report|pdf|docx|export document)\b/i.test(lower)) return 'document';
    if (/(service|api|server|cloud|microservice|endpoint)\b/i.test(lower)) return 'cloud';

    return 'process';
  }

  /**
   * Parse simple sequential steps into DiagramData
   */
  static parseSteps(steps: string[], theme: FlowchartTheme = DIAGRAM_THEMES[0]): DiagramData {
    const nodes: DiagramNode[] = [];
    const connectors: DiagramConnector[] = [];

    steps.filter(s => s.trim()).forEach((stepText, idx) => {
      const type = this.inferNodeType(stepText);
      const id = `node_${idx + 1}`;
      const color = this.getNodeColor(type, theme);

      nodes.push({
        id,
        type: type as any,
        text: stepText.trim(),
        x: 250,
        y: 30 + idx * 100,
        width: type === 'decision' ? 180 : 160,
        height: type === 'decision' ? 70 : 52,
        fill: color,
        stroke: color,
      });

      if (idx > 0) {
        connectors.push({
          id: `c_${idx}`,
          fromNodeId: `node_${idx}`,
          toNodeId: id,
          arrow: 'end',
        });
      }
    });

    return this.computeAutoLayout({ type: 'flowchart', nodes, connectors }, 'vertical');
  }

  /**
   * Natural Text Parser (understands "If valid -> Dashboard", "If invalid -> Show error", loops, etc.)
   */
  static parseStructuredText(rawText: string, theme: FlowchartTheme = DIAGRAM_THEMES[0]): DiagramData {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return this.createDefaultFlowchart();
    }

    const nodeMap = new Map<string, DiagramNode>();
    const connectors: DiagramConnector[] = [];
    let previousNodeId: string | null = null;
    let nodeIndex = 1;

    const getOrCreateNode = (text: string): DiagramNode => {
      const clean = text.trim();
      const key = clean.toLowerCase();

      for (const [_, node] of nodeMap) {
        if (node.text.toLowerCase() === key) {
          return node;
        }
      }

      const type = this.inferNodeType(clean);
      const id = `node_${nodeIndex++}`;
      const color = this.getNodeColor(type, theme);

      const newNode: DiagramNode = {
        id,
        type: type as any,
        text: clean,
        x: 250,
        y: 50 * nodeIndex,
        width: type === 'decision' ? 180 : 160,
        height: type === 'decision' ? 70 : 52,
        fill: color,
        stroke: color,
      };

      nodeMap.set(id, newNode);
      return newNode;
    };

    lines.forEach(line => {
      // 1. Check for branch statement: "If valid -> Dashboard" or "valid: Dashboard"
      const branchMatch = line.match(/^(?:if\s+)?([^->:]+)(?:->|:)\s*(.+)$/i);
      // 2. Check for simple transition: "A -> B"
      const transitionMatch = line.match(/^(.+?)\s*(?:->|-->|=>)\s*(.+)$/i);

      if (branchMatch && (line.toLowerCase().startsWith('if') || previousNodeId)) {
        const label = branchMatch[1].replace(/^if\s+/i, '').trim();
        const targetText = branchMatch[2].trim();

        if (previousNodeId) {
          const targetNode = getOrCreateNode(targetText);
          connectors.push({
            id: `c_${connectors.length + 1}`,
            fromNodeId: previousNodeId,
            toNodeId: targetNode.id,
            label,
            arrow: 'end',
          });
        } else {
          const targetNode = getOrCreateNode(targetText);
          previousNodeId = targetNode.id;
        }
      } else if (transitionMatch) {
        const sourceNode = getOrCreateNode(transitionMatch[1]);
        const targetNode = getOrCreateNode(transitionMatch[2]);
        connectors.push({
          id: `c_${connectors.length + 1}`,
          fromNodeId: sourceNode.id,
          toNodeId: targetNode.id,
          arrow: 'end',
        });
        previousNodeId = targetNode.id;
      } else {
        // Sequential line
        const node = getOrCreateNode(line);
        if (previousNodeId && previousNodeId !== node.id) {
          // If previous node wasn't a branching line, connect them
          connectors.push({
            id: `c_${connectors.length + 1}`,
            fromNodeId: previousNodeId,
            toNodeId: node.id,
            arrow: 'end',
          });
        }
        previousNodeId = node.id;
      }
    });

    const nodes = Array.from(nodeMap.values());
    const initialData: DiagramData = { type: 'flowchart', nodes, connectors };
    return this.computeAutoLayout(initialData, 'vertical');
  }

  /**
   * Flow Analysis & Logic Validation
   */
  static analyzeFlow(diagram: DiagramData): FlowAnalysisResult {
    const { nodes, connectors } = diagram;
    const nodeCount = nodes.length;
    let processCount = 0;
    let decisionCount = 0;
    let ioCount = 0;
    let databaseCount = 0;
    let hasStart = false;
    let hasEnd = false;
    const warnings: string[] = [];

    const outgoingCount = new Map<string, number>();
    const incomingCount = new Map<string, number>();

    nodes.forEach(n => {
      outgoingCount.set(n.id, 0);
      incomingCount.set(n.id, 0);

      if (n.type === 'start') hasStart = true;
      else if (n.type === 'end') hasEnd = true;
      else if (n.type === 'decision') decisionCount++;
      else if (n.type === 'input-output') ioCount++;
      else if (n.type === 'database') databaseCount++;
      else processCount++;
    });

    let loopCount = 0;
    connectors.forEach(c => {
      outgoingCount.set(c.fromNodeId, (outgoingCount.get(c.fromNodeId) || 0) + 1);
      incomingCount.set(c.toNodeId, (incomingCount.get(c.toNodeId) || 0) + 1);

      // Simple loop detection: target node appears above or at source node in Y space
      const fromNode = nodes.find(n => n.id === c.fromNodeId);
      const toNode = nodes.find(n => n.id === c.toNodeId);
      if (fromNode && toNode && toNode.y <= fromNode.y && fromNode.id !== toNode.id) {
        loopCount++;
      }
    });

    // Check for validation issues
    nodes.forEach(n => {
      const out = outgoingCount.get(n.id) || 0;
      const inc = incomingCount.get(n.id) || 0;

      if (n.type === 'decision' && out < 2) {
        warnings.push(`Decision "${n.text}" has only ${out} outgoing path (recommend 2: Yes/No).`);
      }
      if (n.type !== 'start' && inc === 0) {
        warnings.push(`Node "${n.text}" has no incoming connection.`);
      }
      if (n.type !== 'end' && out === 0) {
        warnings.push(`Node "${n.text}" is a dead end with no outgoing connection.`);
      }
    });

    if (!hasStart) warnings.push('No explicit "START" terminator node detected.');
    if (!hasEnd) warnings.push('No explicit "END" terminator node detected.');

    // Compute Flow Summary
    const flowPath = nodes.slice(0, 5).map(n => n.text).join(' → ') + (nodes.length > 5 ? ' → ...' : '');

    return {
      nodeCount,
      processCount,
      decisionCount,
      ioCount,
      databaseCount,
      connectorCount: connectors.length,
      branchCount: Math.max(0, connectors.length - (nodeCount - 1)),
      loopCount,
      hasStart,
      hasEnd,
      warnings,
      flowSummary: flowPath,
    };
  }

  /**
   * Graph Auto Layout Engine (Vertical, Horizontal, Tree, Decision Flow)
   */
  static computeAutoLayout(
    diagram: DiagramData,
    direction: 'vertical' | 'horizontal' = 'vertical'
  ): DiagramData {
    const { nodes, connectors } = diagram;
    if (nodes.length === 0) return diagram;

    const nodeWidth = 170;
    const nodeHeight = 54;
    const decisionHeight = 70;
    const verticalGap = 50;
    const horizontalGap = 60;

    // Build Adjacency List
    const adj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    nodes.forEach(n => {
      adj.set(n.id, []);
      inDegree.set(n.id, 0);
    });

    connectors.forEach(c => {
      adj.get(c.fromNodeId)?.push(c.toNodeId);
      inDegree.set(c.toNodeId, (inDegree.get(c.toNodeId) || 0) + 1);
    });

    // Topological Rank Assignment (BFS Levels)
    const levels = new Map<string, number>();
    const queue: string[] = [];

    // Find roots
    nodes.forEach(n => {
      if ((inDegree.get(n.id) || 0) === 0 || n.type === 'start') {
        queue.push(n.id);
        levels.set(n.id, 0);
      }
    });

    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0].id);
      levels.set(nodes[0].id, 0);
    }

    const visited = new Set<string>();
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      visited.add(currentId);
      const currentLevel = levels.get(currentId) || 0;

      const neighbors = adj.get(currentId) || [];
      neighbors.forEach(nextId => {
        if (!visited.has(nextId)) {
          const existingLevel = levels.get(nextId) ?? -1;
          levels.set(nextId, Math.max(existingLevel, currentLevel + 1));
          queue.push(nextId);
        }
      });
    }

    // Assign remaining unvisited nodes
    nodes.forEach((n, idx) => {
      if (!levels.has(n.id)) {
        levels.set(n.id, idx);
      }
    });

    // Group nodes by level
    const levelGroups = new Map<number, DiagramNode[]>();
    nodes.forEach(node => {
      const lvl = levels.get(node.id) || 0;
      if (!levelGroups.has(lvl)) levelGroups.set(lvl, []);
      levelGroups.get(lvl)!.push(node);
    });

    // Calculate Coordinates
    const positionedNodes: DiagramNode[] = [];
    const sortedLevels = Array.from(levelGroups.keys()).sort((a, b) => a - b);

    if (direction === 'vertical') {
      let currentY = 40;

      sortedLevels.forEach(lvl => {
        const group = levelGroups.get(lvl)!;
        const totalGroupWidth = group.length * nodeWidth + (group.length - 1) * horizontalGap;
        const startX = Math.max(40, 480 - totalGroupWidth / 2);

        let maxH = nodeHeight;
        group.forEach((node, colIdx) => {
          const isDecision = node.type === 'decision';
          const h = isDecision ? decisionHeight : nodeHeight;
          const w = isDecision ? 180 : nodeWidth;
          maxH = Math.max(maxH, h);

          positionedNodes.push({
            ...node,
            x: Math.round(startX + colIdx * (nodeWidth + horizontalGap)),
            y: Math.round(currentY),
            width: w,
            height: h,
          });
        });

        currentY += maxH + verticalGap;
      });
    } else {
      // Horizontal Layout
      let currentX = 40;

      sortedLevels.forEach(lvl => {
        const group = levelGroups.get(lvl)!;
        const totalGroupHeight = group.length * nodeHeight + (group.length - 1) * verticalGap;
        const startY = Math.max(40, 270 - totalGroupHeight / 2);

        let maxW = nodeWidth;
        group.forEach((node, rowIdx) => {
          const isDecision = node.type === 'decision';
          const w = isDecision ? 180 : nodeWidth;
          const h = isDecision ? decisionHeight : nodeHeight;
          maxW = Math.max(maxW, w);

          positionedNodes.push({
            ...node,
            x: Math.round(currentX),
            y: Math.round(startY + rowIdx * (nodeHeight + verticalGap)),
            width: w,
            height: h,
          });
        });

        currentX += maxW + horizontalGap;
      });
    }

    return {
      ...diagram,
      nodes: positionedNodes,
    };
  }

  /**
   * Helper to get standard node color
   */
  static getNodeColor(type: string, theme: FlowchartTheme = DIAGRAM_THEMES[0]): string {
    switch (type) {
      case 'start':
      case 'end':
        return theme.startColor;
      case 'decision':
        return theme.decisionColor;
      case 'input-output':
        return theme.ioColor;
      case 'database':
        return theme.databaseColor;
      default:
        return theme.processColor;
    }
  }

  /**
   * Calculate smart, flexible 4-directional connection paths (elbow, curved, straight)
   */
  static calculateConnectorRoute(
    from: DiagramNode,
    to: DiagramNode,
    routing: 'elbow' | 'curved' | 'straight' = 'elbow'
  ): { pathD: string; labelX: number; labelY: number } {
    const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
    const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };

    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;

    let x1 = fromCenter.x;
    let y1 = fromCenter.y;
    let x2 = toCenter.x;
    let y2 = toCenter.y;
    let fromSide: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    let toSide: 'top' | 'bottom' | 'left' | 'right' = 'top';

    // Determine optimal port directions based on relative angle
    if (Math.abs(dx) > Math.abs(dy) * 1.1) {
      if (dx > 0) {
        fromSide = 'right';
        toSide = 'left';
        x1 = from.x + from.width;
        y1 = from.y + from.height / 2;
        x2 = to.x;
        y2 = to.y + to.height / 2;
      } else {
        fromSide = 'left';
        toSide = 'right';
        x1 = from.x;
        y1 = from.y + from.height / 2;
        x2 = to.x + to.width;
        y2 = to.y + to.height / 2;
      }
    } else {
      if (dy > 0) {
        fromSide = 'bottom';
        toSide = 'top';
        x1 = from.x + from.width / 2;
        y1 = from.y + from.height;
        x2 = to.x + to.width / 2;
        y2 = to.y;
      } else {
        fromSide = 'top';
        toSide = 'bottom';
        x1 = from.x + from.width / 2;
        y1 = from.y;
        x2 = to.x + to.width / 2;
        y2 = to.y + to.height;
      }
    }

    if (routing === 'straight') {
      return {
        pathD: `M ${x1} ${y1} L ${x2} ${y2}`,
        labelX: (x1 + x2) / 2,
        labelY: (y1 + y2) / 2 - 4,
      };
    }

    if (routing === 'curved') {
      const cx1 = fromSide === 'right' ? x1 + Math.abs(dx) / 2 : fromSide === 'left' ? x1 - Math.abs(dx) / 2 : x1;
      const cy1 = fromSide === 'bottom' ? y1 + Math.abs(dy) / 2 : fromSide === 'top' ? y1 - Math.abs(dy) / 2 : y1;
      const cx2 = toSide === 'left' ? x2 - Math.abs(dx) / 2 : toSide === 'right' ? x2 + Math.abs(dx) / 2 : x2;
      const cy2 = toSide === 'top' ? y2 - Math.abs(dy) / 2 : toSide === 'bottom' ? y2 + Math.abs(dy) / 2 : y2;

      return {
        pathD: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
        labelX: (x1 + x2) / 2,
        labelY: (y1 + y2) / 2 - 6,
      };
    }

    // Default Elbow Orthogonal routing with smart loops
    if (fromSide === 'bottom' && toSide === 'top') {
      const isLoop = to.y <= from.y;
      if (isLoop) {
        const loopX = Math.max(from.x + from.width, to.x + to.width) + 36;
        return {
          pathD: `M ${x1} ${y1} L ${x1} ${y1 + 16} L ${loopX} ${y1 + 16} L ${loopX} ${to.y + to.height / 2} L ${to.x + to.width} ${to.y + to.height / 2}`,
          labelX: loopX,
          labelY: (y1 + to.y) / 2,
        };
      }
      const midY = (y1 + y2) / 2;
      return {
        pathD: `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`,
        labelX: (x1 + x2) / 2,
        labelY: midY - 6,
      };
    }

    if (fromSide === 'right' && toSide === 'left') {
      const isLoop = to.x <= from.x;
      if (isLoop) {
        const loopY = Math.max(from.y + from.height, to.y + to.height) + 36;
        return {
          pathD: `M ${x1} ${y1} L ${x1 + 16} ${y1} L ${x1 + 16} ${loopY} L ${to.x + to.width / 2} ${loopY} L ${to.x + to.width / 2} ${to.y + to.height}`,
          labelX: (x1 + to.x) / 2,
          labelY: loopY,
        };
      }
      const midX = (x1 + x2) / 2;
      return {
        pathD: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
        labelX: midX,
        labelY: (y1 + y2) / 2 - 6,
      };
    }

    if (fromSide === 'left' && toSide === 'right') {
      const midX = (x1 + x2) / 2;
      return {
        pathD: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
        labelX: midX,
        labelY: (y1 + y2) / 2 - 6,
      };
    }

    const midY = (y1 + y2) / 2;
    return {
      pathD: `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`,
      labelX: (x1 + x2) / 2,
      labelY: midY - 6,
    };
  }

  /**
   * Render high-resolution standalone SVG markup for export or document insertion
   */
  static renderToSvg(diagram: DiagramData, theme: FlowchartTheme = DIAGRAM_THEMES[0]): string {
    const minX = Math.min(...diagram.nodes.map(n => n.x), 20);
    const minY = Math.min(...diagram.nodes.map(n => n.y), 20);
    const maxX = Math.max(...diagram.nodes.map(n => n.x + n.width), 800);
    const maxY = Math.max(...diagram.nodes.map(n => n.y + n.height), 500);

    const width = maxX - minX + 80;
    const height = maxY - minY + 80;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - 40} ${minY - 40} ${width} ${height}" width="${width}" height="${height}" style="background:${theme.background}; font-family: Inter, sans-serif;">\n`;

    // Defs & Arrow Marker
    svg += `  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${theme.connectorColor}"/>
    </marker>
    <filter id="node-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.12"/>
    </filter>
  </defs>\n`;

    // Connectors with Flexible 4-Directional Smart Routing
    diagram.connectors.forEach(c => {
      const from = diagram.nodes.find(n => n.id === c.fromNodeId);
      const to = diagram.nodes.find(n => n.id === c.toNodeId);
      if (!from || !to) return;

      const route = DiagramEngine.calculateConnectorRoute(from, to, 'elbow');
      svg += `  <path d="${route.pathD}" fill="none" stroke="${theme.connectorColor}" stroke-width="2" marker-end="url(#arrow)"/>\n`;

      if (c.label) {
        svg += `  <rect x="${route.labelX - 28}" y="${route.labelY - 10}" width="56" height="18" rx="4" fill="${theme.connectorLabelBg}" stroke="${theme.connectorColor}" stroke-width="0.8"/>\n`;
        svg += `  <text x="${route.labelX}" y="${route.labelY + 2}" font-size="11" font-weight="600" fill="${theme.connectorColor}" text-anchor="middle">${c.label}</text>\n`;
      }
    });

    // Nodes
    diagram.nodes.forEach(n => {
      const isDecision = n.type === 'decision';
      const isStartEnd = n.type === 'start' || n.type === 'end';
      const isDatabase = n.type === 'database';

      if (isStartEnd) {
        svg += `  <rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="26" fill="${n.fill}" filter="url(#node-shadow)"/>\n`;
      } else if (isDecision) {
        const pts = `${n.x + n.width / 2},${n.y} ${n.x + n.width},${n.y + n.height / 2} ${n.x + n.width / 2},${n.y + n.height} ${n.x},${n.y + n.height / 2}`;
        svg += `  <polygon points="${pts}" fill="${n.fill}" filter="url(#node-shadow)"/>\n`;
      } else if (isDatabase) {
        svg += `  <rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="6" fill="${n.fill}" filter="url(#node-shadow)"/>\n`;
      } else {
        svg += `  <rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="8" fill="${n.fill}" filter="url(#node-shadow)"/>\n`;
      }

      // Label text
      svg += `  <text x="${n.x + n.width / 2}" y="${n.y + n.height / 2 + 4}" font-size="12" font-weight="bold" fill="${theme.textColor}" text-anchor="middle">${n.text}</text>\n`;
    });

    svg += '</svg>';
    return svg;
  }

  /**
   * Ready-to-use Flowchart Templates
   */
  static getTemplates(): { id: string; name: string; category: string; description: string; data: DiagramData }[] {
    return [
      {
        id: 'tmpl_login_auth',
        name: 'User Authentication Flow',
        category: 'Security',
        description: 'Login input, credential validation, failure retry loop, and session token generation.',
        data: this.createLoginAuthFlow(),
      },
      {
        id: 'tmpl_basic_process',
        name: 'Basic Linear Process',
        category: 'Standard',
        description: 'Linear workflow with start, processing steps, verification, and end.',
        data: this.createBasicProcessFlow(),
      },
      {
        id: 'tmpl_system_arch',
        name: 'System Architecture (3-Tier)',
        category: 'Architecture',
        description: 'Client frontend, API Gateway, Microservice worker, and Database.',
        data: this.createArchitectureDiagram(),
      },
      {
        id: 'tmpl_ecommerce',
        name: 'E-Commerce Purchase Flow',
        category: 'Business',
        description: 'Cart, stock validation, payment processing, invoice generation, order complete.',
        data: this.createEcommerceFlow(),
      },
      {
        id: 'tmpl_software_dev',
        name: 'SDLC Pipeline',
        category: 'Engineering',
        description: 'Requirements, Sprint Planning, Code, QA Testing, CI/CD Deployment.',
        data: this.createSoftwareDevFlow(),
      },
      {
        id: 'tmpl_ml_pipeline',
        name: 'Machine Learning Pipeline',
        category: 'AI / Data',
        description: 'Raw dataset, preprocessing, model training, evaluation, threshold check, deployment.',
        data: this.createMLPipelineFlow(),
      },
    ];
  }

  static createDefaultFlowchart(): DiagramData {
    return this.createLoginAuthFlow();
  }

  static createBasicProcessFlow(): DiagramData {
    return this.parseSteps([
      'START',
      'Initialize Application Environment',
      'Execute Core Calculation Pipeline',
      'Generate Summary Report',
      'END'
    ]);
  }

  static createLoginAuthFlow(): DiagramData {
    return this.parseStructuredText(`
      Start: User Enters App
      Enter Email & Password
      Validate Credentials
      If Valid -> Generate Session Token
      If Invalid -> Show Error Notification
      Show Error Notification -> Enter Email & Password
      Generate Session Token -> Redirect to Dashboard
      Redirect to Dashboard -> End: User Active
    `);
  }

  static createArchitectureDiagram(): DiagramData {
    return {
      type: 'architecture',
      nodes: [
        { id: 'n1', type: 'cloud', text: 'Client Browser (React + TipTap)', x: 100, y: 40, width: 220, height: 55, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n2', type: 'process', text: 'API Gateway / Web Worker', x: 100, y: 140, width: 220, height: 55, fill: '#10b981', stroke: '#059669' },
        { id: 'n3', type: 'process', text: 'Document Vector Engine', x: 100, y: 240, width: 220, height: 55, fill: '#8b5cf6', stroke: '#7c3aed' },
        { id: 'n4', type: 'database', text: 'IndexedDB Local Storage', x: 100, y: 340, width: 220, height: 55, fill: '#f59e0b', stroke: '#d97706' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', label: 'HTTP / PostMessage', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', label: 'Off-Thread Jobs', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', label: 'Persist State', arrow: 'end' },
      ],
    };
  }

  static createEcommerceFlow(): DiagramData {
    return this.parseStructuredText(`
      Start: Browse Products
      Add Items to Cart
      Proceed to Checkout
      Is Stock Available?
      If Yes -> Process Payment
      If No -> Display Out of Stock Alert
      Display Out of Stock Alert -> Browse Products
      Process Payment -> Send Order Confirmation
      Send Order Confirmation -> End: Order Complete
    `);
  }

  static createSoftwareDevFlow(): DiagramData {
    return this.parseSteps([
      'Requirements Gathering',
      'System & UI Design',
      'Feature Implementation',
      'QA & Automated Testing',
      'CI/CD Production Deployment'
    ]);
  }

  static createMLPipelineFlow(): DiagramData {
    return this.parseStructuredText(`
      Start: Raw Data Ingestion
      Data Preprocessing & Normalization
      Model Training
      Is Accuracy >= 95%?
      If Yes -> Save Weights & Deploy
      If No -> Hyperparameter Tuning
      Hyperparameter Tuning -> Model Training
      Save Weights & Deploy -> End: Inference API
    `);
  }
}
