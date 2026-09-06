import { describe, it, expect } from 'vitest';
import { FlowchartTextParser } from '../FlowchartTextParser';
import { DiagramEngine, DIAGRAM_THEMES } from '../DiagramEngine';
import { DiagramData } from '../types';

describe('FlowchartTextParser & Architecture Studio Comprehensive Test Suite', () => {
  // ── 1. MULTI-HOP ARROW CHAIN PARSING ──────────────────────────────────────
  describe('Multi-hop Arrow Chain Parsing', () => {
    it('should parse simple multi-hop arrow chains with unicode arrows', () => {
      const input = 'Client → API Gateway → Order Service → Database';
      const result = FlowchartTextParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.format).toBe('arrow-chain');
      expect(result.entities.length).toBe(4);
      expect(result.relations.length).toBe(3);

      const labels = result.entities.map(e => e.label);
      expect(labels).toContain('Client');
      expect(labels).toContain('API Gateway');
      expect(labels).toContain('Order Service');
      expect(labels).toContain('Database');

      // Verify connection order
      const client = result.entities.find(e => e.label === 'Client')!;
      const api = result.entities.find(e => e.label === 'API Gateway')!;
      const service = result.entities.find(e => e.label === 'Order Service')!;
      const db = result.entities.find(e => e.label === 'Database')!;

      expect(result.relations.some(r => r.fromId === client.id && r.toId === api.id)).toBe(true);
      expect(result.relations.some(r => r.fromId === api.id && r.toId === service.id)).toBe(true);
      expect(result.relations.some(r => r.fromId === service.id && r.toId === db.id)).toBe(true);
    });

    it('should parse ascii arrows (-> and -->) with labeled edges', () => {
      const input = `User -> [HTTPS] -> Load Balancer
Load Balancer -> Web Server
Web Server -> Database`;
      const result = FlowchartTextParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.entities.length).toBe(4);
      expect(result.relations.length).toBe(3);

      const httpsRelation = result.relations.find(r => r.label === 'HTTPS');
      expect(httpsRelation).toBeDefined();
    });
  });

  // ── 2. FANOUT & DEDUPLICATION ─────────────────────────────────────────────
  describe('Fanout, Fan-in & Entity Deduplication', () => {
    it('should deduplicate recurring entities across multiple lines', () => {
      const input = `API Gateway -> Auth Service
API Gateway -> Payment Service
API Gateway -> Inventory Service
Payment Service -> Stripe API
Payment Service -> PostgreSQL DB
Inventory Service -> PostgreSQL DB`;
      const result = FlowchartTextParser.parse(input);

      expect(result.success).toBe(true);
      // Unique entities: API Gateway, Auth Service, Payment Service, Inventory Service, Stripe API, PostgreSQL DB = 6
      expect(result.entities.length).toBe(6);
      expect(result.relations.length).toBe(6);

      // Verify fanout from API Gateway
      const apiGateway = result.entities.find(e => e.label === 'API Gateway')!;
      const outgoingFromApi = result.relations.filter(r => r.fromId === apiGateway.id);
      expect(outgoingFromApi.length).toBe(3);

      // Verify fan-in to PostgreSQL DB
      const db = result.entities.find(e => e.label === 'PostgreSQL DB')!;
      const incomingToDb = result.relations.filter(r => r.toId === db.id);
      expect(incomingToDb.length).toBe(2);
    });
  });

  // ── 3. TREE & DECISION BRANCH PARSING ─────────────────────────────────────
  describe('Decision Tree & Branch Parsing', () => {
    it('should parse tree branches with unicode branch glyphs (├──, └──)', () => {
      const input = `Is User Authenticated?
├── [Yes] → User Dashboard
└── [No] → Login Screen → Enter Password`;
      const result = FlowchartTextParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.entities.length).toBe(4);

      const decision = result.entities.find(e => e.label.includes('Is User Authenticated'))!;
      expect(decision.type).toBe('decision');
      expect(decision.category).toBe('logic');

      // Find yes/no connections
      const yesRel = result.relations.find(r => r.label?.toLowerCase() === 'yes');
      const noRel = result.relations.find(r => r.label?.toLowerCase() === 'no');

      expect(yesRel).toBeDefined();
      expect(noRel).toBeDefined();
      expect(yesRel?.fromId).toBe(decision.id);
      expect(noRel?.fromId).toBe(decision.id);
    });
  });

  // ── 4. MERMAID SYNTAX PARSING ─────────────────────────────────────────────
  describe('Mermaid Syntax Parsing', () => {
    it('should parse Mermaid flowchart syntax with shape delimiters', () => {
      const mermaidCode = `graph TD
A[Client Browser] --> B(API Gateway)
B --> C{Authenticated?}
C -- Yes --> D[(PostgreSQL DB)]
C -- No --> E([Reject 401])`;
      const result = FlowchartTextParser.parse(mermaidCode);

      expect(result.success).toBe(true);
      expect(result.format).toBe('mermaid');
      expect(result.entities.length).toBe(5);

      const client = result.entities.find(e => e.label === 'Client Browser')!;
      const decision = result.entities.find(e => e.label === 'Authenticated?')!;
      const db = result.entities.find(e => e.label === 'PostgreSQL DB')!;

      expect(client.category).toBe('client');
      expect(decision.type).toBe('decision');
      expect(db.type).toBe('database');
      expect(db.category).toBe('data');

      // Verify edge label
      const yesEdge = result.relations.find(r => r.label === 'Yes');
      expect(yesEdge).toBeDefined();
      expect(yesEdge?.fromId).toBe(decision.id);
      expect(yesEdge?.toId).toBe(db.id);
    });

    it('should parse Mermaid flowchart LR direction', () => {
      const mermaidCode = `flowchart LR
Frontend --> Backend --> Database`;
      const result = FlowchartTextParser.parse(mermaidCode);
      expect(result.success).toBe(true);
      expect(result.entities.length).toBe(3);
    });
  });

  // ── 5. NUMBERED STEPS & BULLET LISTS ──────────────────────────────────────
  describe('Numbered Steps & Bullet Lists Parsing', () => {
    it('should parse sequential numbered steps into an ordered workflow', () => {
      const steps = `1. Customer submits order
2. Payment Gateway validates credit card
3. Inventory Service reserves stock
4. Warehouse prepares shipment`;
      const result = FlowchartTextParser.parse(steps);

      expect(result.success).toBe(true);
      expect(result.format).toBe('steps');
      expect(result.entities.length).toBe(4);
      expect(result.relations.length).toBe(3);

      // Verify sequence chaining: 1 -> 2 -> 3 -> 4
      const orderNode = result.entities.find(e => e.label.includes('submits order'))!;
      const paymentNode = result.entities.find(e => e.label.includes('validates credit card'))!;
      const inventoryNode = result.entities.find(e => e.label.includes('reserves stock'))!;
      const warehouseNode = result.entities.find(e => e.label.includes('prepares shipment'))!;

      expect(result.relations.some(r => r.fromId === orderNode.id && r.toId === paymentNode.id)).toBe(true);
      expect(result.relations.some(r => r.fromId === paymentNode.id && r.toId === inventoryNode.id)).toBe(true);
      expect(result.relations.some(r => r.fromId === inventoryNode.id && r.toId === warehouseNode.id)).toBe(true);
    });

    it('should parse bullet lists with conditional transitions', () => {
      const bullets = `- User fills registration form
- If email already exists, show duplicate error
- Send email verification link
- User confirms account`;
      const result = FlowchartTextParser.parse(bullets);

      expect(result.success).toBe(true);
      expect(result.entities.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ── 6. NATURAL LANGUAGE PARSING ───────────────────────────────────────────
  describe('Natural Language Flow Parsing', () => {
    it('should parse natural prose describing a microservice pipeline', () => {
      const prose = `First, the client sends a request to the load balancer.
Next, the load balancer distributes traffic to the node service.
Then, the node service queries the redis cache.
Finally, the data is saved into the postgresql database.`;
      const result = FlowchartTextParser.parse(prose);

      expect(result.success).toBe(true);
      expect(result.entities.length).toBeGreaterThanOrEqual(4);
      expect(result.relations.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ── 7. NODE CLASSIFICATION & CATEGORIES ───────────────────────────────────
  describe('Node Classification & Category Inference', () => {
    it('should categorize nodes accurately into client, compute, data, integration, and logic', () => {
      const sample = `Mobile App -> API Gateway -> Auth Microservice -> Redis Cache -> SQL Database -> If Valid -> Finish`;
      const result = FlowchartTextParser.parse(sample);

      const client = result.entities.find(e => e.label.toLowerCase().includes('mobile'))!;
      const gateway = result.entities.find(e => e.label.toLowerCase().includes('gateway'))!;
      const microservice = result.entities.find(e => e.label.toLowerCase().includes('microservice'))!;
      const cache = result.entities.find(e => e.label.toLowerCase().includes('cache'))!;
      const db = result.entities.find(e => e.label.toLowerCase().includes('sql'))!;
      const logic = result.entities.find(e => e.label.toLowerCase().includes('valid'))!;

      expect(client.category).toBe('client');
      expect(gateway.category).toBe('integration');
      expect(microservice.category).toBe('compute');
      expect(cache.category).toBe('data');
      expect(db.category).toBe('data');
      expect(logic.category).toBe('logic');
    });
  });

  // ── 8. DAG AUTO-LAYOUT & CENTERING ────────────────────────────────────────
  describe('Hierarchical DAG Auto-Layout', () => {
    it('should calculate valid non-overlapping coordinates in vertical orientation', () => {
      const sample = `A -> B -> C -> D`;
      const result = FlowchartTextParser.parse(sample, { direction: 'vertical' });

      expect(result.diagram.nodes.length).toBe(4);
      const [nodeA, nodeB, nodeC, nodeD] = result.diagram.nodes;

      // In vertical layout, y coordinates should increase monotonically
      expect(nodeB.y).toBeGreaterThan(nodeA.y);
      expect(nodeC.y).toBeGreaterThan(nodeB.y);
      expect(nodeD.y).toBeGreaterThan(nodeC.y);

      // Width and height should be properly set
      for (const node of result.diagram.nodes) {
        expect(node.width).toBeGreaterThan(50);
        expect(node.height).toBeGreaterThan(30);
      }
    });

    it('should calculate valid non-overlapping coordinates in horizontal orientation', () => {
      const sample = `A -> B -> C -> D`;
      const result = FlowchartTextParser.parse(sample, { direction: 'horizontal' });

      expect(result.diagram.nodes.length).toBe(4);
      const [nodeA, nodeB, nodeC, nodeD] = result.diagram.nodes;

      // In horizontal layout, x coordinates should increase monotonically
      expect(nodeB.x).toBeGreaterThan(nodeA.x);
      expect(nodeC.x).toBeGreaterThan(nodeB.x);
      expect(nodeD.x).toBeGreaterThan(nodeC.x);
    });

    it('should generate valid connectors with proper target references', () => {
      const sample = `Client -> Server`;
      const result = FlowchartTextParser.parse(sample);

      expect(result.diagram.connectors.length).toBe(1);
      const conn = result.diagram.connectors[0];
      expect(conn.fromNodeId).toBeDefined();
      expect(conn.toNodeId).toBeDefined();
      expect(conn.arrow).toBe('end');
      expect(conn.style).toBe('solid');
    });
  });

  // ── 9. ARCHITECTURE VALIDATION & SECURITY AUDIT ───────────────────────────
  describe('Architecture Validation & Security Checks', () => {
    it('should flag insecure direct client-to-database connections', () => {
      const diagram: DiagramData = {
        type: 'flowchart',
        nodes: [
          { id: 'client_1', type: 'input-output', text: 'Client Web Browser', x: 100, y: 100, width: 150, height: 60 },
          { id: 'db_1', type: 'database', text: 'Production Postgres DB', x: 100, y: 300, width: 150, height: 60 },
        ],
        connectors: [
          { id: 'c1', fromNodeId: 'client_1', toNodeId: 'db_1' },
        ],
      };

      const analysis = DiagramEngine.analyzeFlow(diagram);
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.warnings.some(w => w.toLowerCase().includes('security warning') || w.toLowerCase().includes('client'))).toBe(true);
    });

    it('should flag isolated nodes with no incoming or outgoing connections', () => {
      const diagram: DiagramData = {
        type: 'flowchart',
        nodes: [
          { id: 'node_a', type: 'start', text: 'Start', x: 100, y: 100, width: 120, height: 50 },
          { id: 'node_b', type: 'process', text: 'Process Step', x: 100, y: 200, width: 120, height: 50 },
          { id: 'orphan_node', type: 'process', text: 'Orphan Microservice', x: 400, y: 400, width: 120, height: 50 },
        ],
        connectors: [
          { id: 'c1', fromNodeId: 'node_a', toNodeId: 'node_b' },
        ],
      };

      const analysis = DiagramEngine.analyzeFlow(diagram);
      expect(analysis.isolatedNodeCount).toBe(1);
      expect(analysis.warnings.some(w => w.toLowerCase().includes('isolated') || w.toLowerCase().includes('no connection'))).toBe(true);
    });
  });

  // ── 10. MIDNIGHT NAVY THEME PRESET ────────────────────────────────────────
  describe('Midnight Navy Theme Preset', () => {
    it('should include midnight-navy as primary default theme in DIAGRAM_THEMES', () => {
      expect(DIAGRAM_THEMES.length).toBeGreaterThanOrEqual(1);
      const defaultTheme = DIAGRAM_THEMES[0];
      expect(defaultTheme.id).toBe('midnight-navy');
      expect(defaultTheme.background).toBe('#050A18');
      expect(defaultTheme.cardBackground).toBe('#070D1F');
      expect(defaultTheme.textColor.toLowerCase()).toBe('#ffffff');
    });
  });
});
