import { DiagramData, DiagramNode, DiagramConnector } from './types';

export type FlowchartShape =
  | 'start-end'
  | 'process'
  | 'decision'
  | 'io'
  | 'document'
  | 'database'
  | 'subprocess';

export interface FlowchartTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  data: DiagramData;
}

export class DiagramEngine {
  /**
   * 8 Ready-to-use Flowchart Templates
   */
  static getTemplates(): FlowchartTemplate[] {
    return [
      {
        id: 'tmpl_basic_process',
        name: 'Basic Process Flow',
        category: 'Standard',
        description: 'Linear pipeline with start, input validation, execution, and termination.',
        data: this.createBasicProcessFlow(),
      },
      {
        id: 'tmpl_login_auth',
        name: 'Login Authentication Flow',
        category: 'Security',
        description: 'User credential validation, multi-factor check, and error retry paths.',
        data: this.createLoginAuthFlow(),
      },
      {
        id: 'tmpl_user_reg',
        name: 'User Registration Flow',
        category: 'Onboarding',
        description: 'Account signup, email verification, database creation, and welcome email.',
        data: this.createUserRegistrationFlow(),
      },
      {
        id: 'tmpl_ecommerce',
        name: 'E-Commerce Purchase Flow',
        category: 'Business',
        description: 'Cart checkout, inventory check, payment gateway, and order fulfillment.',
        data: this.createEcommerceFlow(),
      },
      {
        id: 'tmpl_software_dev',
        name: 'Software Development Lifecycle',
        category: 'Engineering',
        description: 'Requirements, Sprint Planning, Code, QA Testing, CI/CD Deployment.',
        data: this.createSoftwareDevFlow(),
      },
      {
        id: 'tmpl_decision_tree',
        name: 'Multi-Branch Decision Flow',
        category: 'Logic',
        description: 'Complex branching with multiple conditions and contingency outcomes.',
        data: this.createDecisionTreeFlow(),
      },
      {
        id: 'tmpl_system_arch',
        name: 'System Architecture Flow',
        category: 'Architecture',
        description: 'Client frontend, API Gateway, Microservices, and Distributed Database.',
        data: this.createArchitectureDiagram(),
      },
      {
        id: 'tmpl_project_workflow',
        name: 'Project Milestone Workflow',
        category: 'Management',
        description: 'Project Initiation, Phase Milestones, Stakeholder Approval, Final Handover.',
        data: this.createProjectWorkflow(),
      },
    ];
  }

  static createDefaultFlowchart(): DiagramData {
    return this.createLoginAuthFlow();
  }

  static createBasicProcessFlow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'START', x: 200, y: 30, width: 140, height: 50, fill: '#10b981', stroke: '#059669' },
        { id: 'n2', type: 'process', text: 'Initialize System', x: 190, y: 120, width: 160, height: 55, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n3', type: 'process', text: 'Execute Task Pipeline', x: 180, y: 215, width: 180, height: 55, fill: '#6366f1', stroke: '#4f46e5' },
        { id: 'n4', type: 'process', text: 'Generate Output Report', x: 180, y: 310, width: 180, height: 55, fill: '#0ea5e9', stroke: '#0284c7' },
        { id: 'n5', type: 'end', text: 'END', x: 200, y: 405, width: 140, height: 50, fill: '#64748b', stroke: '#475569' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n4', toNodeId: 'n5', arrow: 'end' },
      ],
    };
  }

  static createLoginAuthFlow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'Start: User Arrives', x: 240, y: 20, width: 160, height: 48, fill: '#10b981', stroke: '#059669' },
        { id: 'n2', type: 'process', text: 'Enter Email & Password', x: 230, y: 100, width: 180, height: 52, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n3', type: 'decision', text: 'Credentials Valid?', x: 230, y: 190, width: 180, height: 68, fill: '#f59e0b', stroke: '#d97706' },
        { id: 'n4', type: 'process', text: 'Generate JWT Session', x: 100, y: 300, width: 180, height: 52, fill: '#10b981', stroke: '#059669' },
        { id: 'n5', type: 'process', text: 'Show Error Notification', x: 370, y: 300, width: 180, height: 52, fill: '#ef4444', stroke: '#dc2626' },
        { id: 'n6', type: 'end', text: 'Redirect to Dashboard', x: 110, y: 395, width: 160, height: 48, fill: '#6366f1', stroke: '#4f46e5' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', label: 'Yes (Valid)', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n3', toNodeId: 'n5', label: 'No (Invalid)', arrow: 'end' },
        { id: 'c5', fromNodeId: 'n4', toNodeId: 'n6', arrow: 'end' },
        { id: 'c6', fromNodeId: 'n5', toNodeId: 'n2', label: 'Retry', arrow: 'end' },
      ],
    };
  }

  static createUserRegistrationFlow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'Start: Register', x: 220, y: 20, width: 150, height: 48, fill: '#10b981', stroke: '#059669' },
        { id: 'n2', type: 'process', text: 'Fill Signup Form', x: 210, y: 100, width: 170, height: 50, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n3', type: 'decision', text: 'Email Already Exists?', x: 205, y: 185, width: 180, height: 68, fill: '#f59e0b', stroke: '#d97706' },
        { id: 'n4', type: 'process', text: 'Save User in Database', x: 90, y: 290, width: 180, height: 50, fill: '#10b981', stroke: '#059669' },
        { id: 'n5', type: 'process', text: 'Send Verification Email', x: 90, y: 380, width: 180, height: 50, fill: '#6366f1', stroke: '#4f46e5' },
        { id: 'n6', type: 'process', text: 'Prompt Login Link', x: 340, y: 290, width: 170, height: 50, fill: '#ef4444', stroke: '#dc2626' },
        { id: 'n7', type: 'end', text: 'Account Activated', x: 105, y: 470, width: 150, height: 48, fill: '#059669', stroke: '#047857' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', label: 'No (New)', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n3', toNodeId: 'n6', label: 'Yes (Exists)', arrow: 'end' },
        { id: 'c5', fromNodeId: 'n4', toNodeId: 'n5', arrow: 'end' },
        { id: 'c6', fromNodeId: 'n5', toNodeId: 'n7', arrow: 'end' },
      ],
    };
  }

  static createEcommerceFlow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'Browse Products', x: 220, y: 20, width: 160, height: 48, fill: '#0ea5e9', stroke: '#0284c7' },
        { id: 'n2', type: 'process', text: 'Add Items to Cart', x: 220, y: 95, width: 160, height: 50, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n3', type: 'process', text: 'Proceed to Checkout', x: 210, y: 175, width: 180, height: 50, fill: '#6366f1', stroke: '#4f46e5' },
        { id: 'n4', type: 'decision', text: 'Payment Authorized?', x: 205, y: 260, width: 190, height: 68, fill: '#f59e0b', stroke: '#d97706' },
        { id: 'n5', type: 'process', text: 'Deduct Stock & Send Receipt', x: 90, y: 365, width: 190, height: 50, fill: '#10b981', stroke: '#059669' },
        { id: 'n6', type: 'process', text: 'Payment Failed: Retry Method', x: 330, y: 365, width: 190, height: 50, fill: '#ef4444', stroke: '#dc2626' },
        { id: 'n7', type: 'end', text: 'Order Shipped to Customer', x: 95, y: 450, width: 180, height: 48, fill: '#059669', stroke: '#047857' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n4', toNodeId: 'n5', label: 'Authorized', arrow: 'end' },
        { id: 'c5', fromNodeId: 'n4', toNodeId: 'n6', label: 'Declined', arrow: 'end' },
        { id: 'c6', fromNodeId: 'n5', toNodeId: 'n7', arrow: 'end' },
        { id: 'c7', fromNodeId: 'n6', toNodeId: 'n3', label: 'Try Again', arrow: 'end' },
      ],
    };
  }

  static createSoftwareDevFlow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'Requirements & Scope', x: 210, y: 20, width: 180, height: 48, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n2', type: 'process', text: 'Sprint Planning & Design', x: 205, y: 95, width: 190, height: 50, fill: '#6366f1', stroke: '#4f46e5' },
        { id: 'n3', type: 'process', text: 'Feature Implementation', x: 205, y: 175, width: 190, height: 50, fill: '#8b5cf6', stroke: '#7c3aed' },
        { id: 'n4', type: 'decision', text: 'Passes Unit & E2E Tests?', x: 200, y: 260, width: 200, height: 68, fill: '#f59e0b', stroke: '#d97706' },
        { id: 'n5', type: 'process', text: 'Automated CI/CD Deploy', x: 80, y: 365, width: 190, height: 50, fill: '#10b981', stroke: '#059669' },
        { id: 'n6', type: 'process', text: 'Bug Identified: Hotfix', x: 330, y: 365, width: 180, height: 50, fill: '#ef4444', stroke: '#dc2626' },
        { id: 'n7', type: 'end', text: 'Production Release Active', x: 85, y: 450, width: 180, height: 48, fill: '#059669', stroke: '#047857' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n4', toNodeId: 'n5', label: 'Pass (100%)', arrow: 'end' },
        { id: 'c5', fromNodeId: 'n4', toNodeId: 'n6', label: 'Fail (Bugs)', arrow: 'end' },
        { id: 'c6', fromNodeId: 'n5', toNodeId: 'n7', arrow: 'end' },
        { id: 'c7', fromNodeId: 'n6', toNodeId: 'n3', label: 'Refactor', arrow: 'end' },
      ],
    };
  }

  static createDecisionTreeFlow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'Incoming Client Request', x: 210, y: 20, width: 180, height: 48, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n2', type: 'decision', text: 'Is Priority Urgent?', x: 205, y: 95, width: 190, height: 68, fill: '#f59e0b', stroke: '#d97706' },
        { id: 'n3', type: 'process', text: 'Tier 1 Escalation Team', x: 80, y: 200, width: 180, height: 50, fill: '#ef4444', stroke: '#dc2626' },
        { id: 'n4', type: 'process', text: 'Standard Queue Dispatch', x: 330, y: 200, width: 180, height: 50, fill: '#10b981', stroke: '#059669' },
        { id: 'n5', type: 'end', text: 'Resolved & Closed', x: 210, y: 295, width: 180, height: 48, fill: '#64748b', stroke: '#475569' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', label: 'High Severity', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n2', toNodeId: 'n4', label: 'Standard', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n3', toNodeId: 'n5', arrow: 'end' },
        { id: 'c5', fromNodeId: 'n4', toNodeId: 'n5', arrow: 'end' },
      ],
    };
  }

  static createArchitectureDiagram(): DiagramData {
    return {
      type: 'architecture',
      nodes: [
        { id: 'n1', type: 'process', text: 'Client Web Application\n(React / Vite + Canvas)', x: 40, y: 120, width: 170, height: 70, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n2', type: 'process', text: 'API Gateway & Auth\n(Cloudflare Workers)', x: 260, y: 120, width: 180, height: 70, fill: '#6366f1', stroke: '#4f46e5' },
        { id: 'n3', type: 'process', text: 'Document Engine Service\n(PageEngine, OCR, AI)', x: 490, y: 60, width: 190, height: 70, fill: '#10b981', stroke: '#059669' },
        { id: 'n4', type: 'process', text: 'Distributed PostgreSQL\n(Autosave Store)', x: 490, y: 175, width: 190, height: 70, fill: '#f59e0b', stroke: '#d97706' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', label: 'HTTPS / WSS', arrow: 'both' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', label: 'RPC / REST', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n2', toNodeId: 'n4', label: 'SQL Connection', arrow: 'both' },
      ],
    };
  }

  static createProjectWorkflow(): DiagramData {
    return {
      type: 'flowchart',
      nodes: [
        { id: 'n1', type: 'start', text: 'Project Kickoff', x: 220, y: 20, width: 160, height: 48, fill: '#10b981', stroke: '#059669' },
        { id: 'n2', type: 'process', text: 'Milestone 1: Core Engine', x: 210, y: 100, width: 180, height: 50, fill: '#3b82f6', stroke: '#2563eb' },
        { id: 'n3', type: 'process', text: 'Milestone 2: Visual Suite', x: 210, y: 180, width: 180, height: 50, fill: '#6366f1', stroke: '#4f46e5' },
        { id: 'n4', type: 'process', text: 'Milestone 3: AI & Export', x: 210, y: 260, width: 180, height: 50, fill: '#8b5cf6', stroke: '#7c3aed' },
        { id: 'n5', type: 'end', text: 'Final Release Handover', x: 220, y: 345, width: 160, height: 48, fill: '#059669', stroke: '#047857' },
      ],
      connectors: [
        { id: 'c1', fromNodeId: 'n1', toNodeId: 'n2', arrow: 'end' },
        { id: 'c2', fromNodeId: 'n2', toNodeId: 'n3', arrow: 'end' },
        { id: 'c3', fromNodeId: 'n3', toNodeId: 'n4', arrow: 'end' },
        { id: 'c4', fromNodeId: 'n4', toNodeId: 'n5', arrow: 'end' },
      ],
    };
  }

  /**
   * Auto-Layout Algorithm
   */
  static applyAutoLayout(data: DiagramData, direction: 'vertical' | 'horizontal' = 'vertical'): DiagramData {
    const nodes = [...data.nodes];
    const spacing = direction === 'vertical' ? 90 : 200;

    nodes.forEach((node, idx) => {
      if (direction === 'vertical') {
        node.x = 220;
        node.y = 30 + idx * spacing;
      } else {
        node.x = 40 + idx * spacing;
        node.y = 150;
      }
    });

    return {
      ...data,
      nodes,
    };
  }

  /**
   * Render complete SVG markup from DiagramData for document embedding
   */
  static renderToSvg(data: DiagramData): string {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    data.nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    });

    const padding = 30;
    const width = Math.max(600, maxX - minX + padding * 2);
    const height = Math.max(400, maxY - minY + padding * 2);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: ${width}px; height: auto; font-family: Inter, system-ui, sans-serif; user-select: none;">
  <defs>
    <marker id="arrow-end" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
    </marker>
    <marker id="arrow-both" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
    </marker>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12" />
    </filter>
  </defs>\n`;

    // Render connectors
    data.connectors.forEach(c => {
      const fromNode = data.nodes.find(n => n.id === c.fromNodeId);
      const toNode = data.nodes.find(n => n.id === c.toNodeId);
      if (!fromNode || !toNode) return;

      const fromX = fromNode.x + fromNode.width / 2;
      const fromY = fromNode.y + fromNode.height / 2;
      const toX = toNode.x + toNode.width / 2;
      const toY = toNode.y + toNode.height / 2;

      // Smart orthogonal or direct bezier path
      const midY = (fromY + toY) / 2;
      const pathD = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

      svg += `  <path d="${pathD}" stroke="#64748b" stroke-width="2" fill="none" marker-end="url(#arrow-end)" />\n`;

      if (c.label) {
        const labelX = (fromX + toX) / 2;
        const labelY = (fromY + toY) / 2 - 8;
        svg += `  <rect x="${labelX - 30}" y="${labelY - 10}" width="60" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />\n`;
        svg += `  <text x="${labelX}" y="${labelY + 3}" text-anchor="middle" font-size="10" font-weight="600" fill="#475569">${c.label}</text>\n`;
      }
    });

    // Render nodes
    data.nodes.forEach(n => {
      const rx = n.type === 'start' || n.type === 'end' ? 24 : 8;
      const fill = n.fill || '#3b82f6';
      const stroke = n.stroke || '#2563eb';

      if (n.type === 'decision') {
        const cx = n.x + n.width / 2;
        const cy = n.y + n.height / 2;
        const points = `${cx},${n.y} ${n.x + n.width},${cy} ${cx},${n.y + n.height} ${n.x},${cy}`;
        svg += `  <polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)" />\n`;
      } else {
        svg += `  <rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)" />\n`;
      }

      // Render text inside node
      const lines = n.text.split('\n');
      const startY = n.y + n.height / 2 - (lines.length - 1) * 7 + 4;
      lines.forEach((line, lineIdx) => {
        svg += `  <text x="${n.x + n.width / 2}" y="${startY + lineIdx * 14}" text-anchor="middle" font-size="12" font-weight="600" fill="#ffffff">${line}</text>\n`;
      });
    });

    svg += '</svg>';
    return svg;
  }
}
