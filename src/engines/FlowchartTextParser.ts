import { DiagramData, DiagramNode, DiagramConnector } from './types';
import { FlowchartNodeType, FlowchartTheme, DIAGRAM_THEMES } from './DiagramEngine';

export type FlowCategory = 'client' | 'compute' | 'data' | 'integration' | 'logic';

export interface ParsedFlowEntity {
  id: string;
  rawName: string;
  label: string;
  type: FlowchartNodeType;
  category: FlowCategory;
  subtitle?: string;
}

export interface ParsedFlowRelation {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  style?: 'solid' | 'dashed';
  arrow?: 'end' | 'both' | 'none';
}

export interface FlowParseResult {
  success: boolean;
  format: 'mermaid' | 'arrow-chain' | 'fanout' | 'decision-tree' | 'natural-language' | 'steps' | 'bullets' | 'generic';
  entities: ParsedFlowEntity[];
  relations: ParsedFlowRelation[];
  diagram: DiagramData;
  stats: {
    totalNodes: number;
    totalEdges: number;
    decisionsCount: number;
    databasesCount: number;
    queuesCount: number;
    servicesCount: number;
    clientsCount: number;
  };
  warnings: string[];
}

export class FlowchartTextParser {
  /**
   * Main entry point: Parse raw text/AI prompt into structured flowchart
   */
  static parse(
    rawText: string,
    options?: {
      direction?: 'vertical' | 'horizontal';
      theme?: FlowchartTheme;
    }
  ): FlowParseResult {
    const direction = options?.direction || 'vertical';
    const theme = options?.theme || DIAGRAM_THEMES[0];
    const warnings: string[] = [];

    // 1. Normalize input
    const normalized = this.normalizeInput(rawText);
    if (!normalized.trim()) {
      return this.emptyResult();
    }

    // 2. Detect Format & Parse into Intermediate Model
    let entities: ParsedFlowEntity[] = [];
    let relations: ParsedFlowRelation[] = [];
    let detectedFormat: FlowParseResult['format'] = 'generic';

    if (this.isMermaidFormat(normalized)) {
      detectedFormat = 'mermaid';
      const res = this.parseMermaid(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    } else if (this.isDecisionTreeFormat(normalized)) {
      detectedFormat = 'decision-tree';
      const res = this.parseDecisionTree(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    } else if (this.isChainedArrowFormat(normalized)) {
      detectedFormat = 'arrow-chain';
      const res = this.parseArrowChains(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    } else if (this.isFanoutArrowFormat(normalized)) {
      detectedFormat = 'fanout';
      const res = this.parseFanout(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    } else if (this.isNumberedOrBulletFormat(normalized)) {
      detectedFormat = /^\s*\d+[.)]/m.test(normalized) ? 'steps' : 'bullets';
      const res = this.parseNumberedOrBullets(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    } else {
      detectedFormat = 'natural-language';
      const res = this.parseNaturalLanguage(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    }

    // Fallback if no entities extracted
    if (entities.length === 0) {
      warnings.push('Could not extract distinct entities from text. Generated sequential process flow.');
      const res = this.parseNumberedOrBullets(normalized, warnings);
      entities = res.entities;
      relations = res.relations;
    }

    // Deduplicate entities and relations
    const deduplicated = this.deduplicateEntitiesAndRelations(entities, relations);
    entities = deduplicated.entities;
    relations = deduplicated.relations;

    // 3. Convert to Native DiagramData with Hierarchical Auto-Layout
    const diagram = this.buildLayoutDiagram(entities, relations, direction, theme);

    // 4. Calculate Stats
    const decisionsCount = entities.filter(e => e.type === 'decision').length;
    const databasesCount = entities.filter(e => e.type === 'database' || e.category === 'data').length;
    const queuesCount = entities.filter(e => e.category === 'integration').length;
    const servicesCount = entities.filter(e => e.category === 'compute').length;
    const clientsCount = entities.filter(e => e.category === 'client').length;

    return {
      success: entities.length > 0,
      format: detectedFormat,
      entities,
      relations,
      diagram,
      stats: {
        totalNodes: entities.length,
        totalEdges: relations.length,
        decisionsCount,
        databasesCount,
        queuesCount,
        servicesCount,
        clientsCount,
      },
      warnings,
    };
  }

  // ── 1. Text Normalization ──────────────────────────────────────────────────
  private static normalizeInput(text: string): string {
    return text
      // Strip markdown code fences ```mermaid ... ``` or ``` ... ```
      .replace(/```(?:mermaid|flowchart|text)?([\s\S]*?)```/gi, '$1')
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove HTML tags for safety
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  // ── 2. Format Detection ────────────────────────────────────────────────────
  private static isMermaidFormat(text: string): boolean {
    const firstLines = text.slice(0, 150).toLowerCase();
    return (
      firstLines.includes('graph td') ||
      firstLines.includes('graph lr') ||
      firstLines.includes('graph tb') ||
      firstLines.includes('graph rl') ||
      firstLines.includes('flowchart td') ||
      firstLines.includes('flowchart lr') ||
      firstLines.includes('flowchart tb') ||
      firstLines.includes('flowchart rl') ||
      /^\s*subgraph\b/m.test(text)
    );
  }

  private static isDecisionTreeFormat(text: string): boolean {
    return /[├└│─]/.test(text) || /\b(?:yes|no|true|false)\s*[-→:]/i.test(text);
  }

  private static isChainedArrowFormat(text: string): boolean {
    // Looks for multiple arrows on a single line, e.g. "Client -> API -> Service -> Database"
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.some(line => {
      const arrowMatches = line.match(/[-=]>|→|-->|==>/g);
      return arrowMatches && arrowMatches.length >= 2;
    });
  }

  private static isFanoutArrowFormat(text: string): boolean {
    // Multiple lines with single arrows
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const arrowLines = lines.filter(l => /[-=]>|→|-->|==>|calls\b|sends to\b/i.test(l));
    return arrowLines.length >= 2;
  }

  private static isNumberedOrBulletFormat(text: string): boolean {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const bulletLines = lines.filter(l => /^(\d+[.)]|[-*•▪])\s+/.test(l));
    return bulletLines.length >= 2;
  }

  // ── 3. Node Type & Category Classifier ─────────────────────────────────────
  public static inferNodeTypeAndCategory(text: string): { type: FlowchartNodeType; category: FlowCategory } {
    const clean = text.trim();
    const lower = clean.toLowerCase();

    // 1. LOGIC: Decisions & Conditions
    if (
      clean.endsWith('?') ||
      /^(is|if|are|check|verify|has|validate|valid\?|condition|choice|decision)\b/i.test(lower) ||
      /\b(is valid|authenticated\?|authorized\?|success\?|approved\?|declined\?)\b/i.test(lower)
    ) {
      return { type: 'decision', category: 'logic' };
    }

    // 2. LOGIC: Start / End / Terminal
    if (/^(start|begin|init|launch|entry|source)\b/i.test(lower)) {
      return { type: 'start', category: 'logic' };
    }
    if (/^(end|stop|exit|terminate|finish|complete|done|logout)\b/i.test(lower)) {
      return { type: 'end', category: 'logic' };
    }

    // 3. CLIENT / ACTORS
    if (
      /^(user|client|customer|admin|developer|actor|guest|shopper|consumer|operator|visitor)\b/i.test(lower) ||
      /(web app|website|frontend|ui|browser|mobile app|ios|android|spa|dashboard|portal|react app)\b/i.test(lower)
    ) {
      return { type: 'input-output', category: 'client' };
    }

    // 4. DATA: Databases, Caches, Stores
    if (
      /(database|db|sql|postgres|postgresql|mysql|oracle|sqlite|mssql|sql server|aurora)\b/i.test(lower) ||
      /(nosql|mongodb|dynamodb|cassandra|couchdb|firestore|documentdb)\b/i.test(lower) ||
      /(redis|memcached|cache|storage|s3|blob|bucket|data warehouse|snowflake|bigquery)\b/i.test(lower)
    ) {
      return { type: 'database', category: 'data' };
    }

    // 5. INTEGRATION: Gateways, Proxies, Load Balancers, Queues, Brokers, External APIs
    if (
      /(api gateway|gateway|reverse proxy|nginx|kong|load balancer|alb|ingress|router)\b/i.test(lower) ||
      /(queue|message queue|sqs|kafka|rabbitmq|pubsub|event bus|broker|sns|kinesis|eventbridge)\b/i.test(lower) ||
      /(stripe|paypal|github|twilio|sendgrid|slack|external api|third-party|webhook)\b/i.test(lower)
    ) {
      return { type: 'cloud', category: 'integration' };
    }

    // 6. COMPUTE: Microservices, Services, Cloud Functions, Containers
    if (
      /(service|microservice|backend|api|server|lambda|cloud function|worker|pod|docker|container|cluster)\b/i.test(lower)
    ) {
      return { type: 'cloud', category: 'compute' };
    }

    // 7. INPUT / OUTPUT
    if (/^(input|enter|read|scan|upload|form submit|import)\b/i.test(lower)) {
      return { type: 'input-output', category: 'logic' };
    }
    if (/^(output|display|show|render|print|respond|return|report|document|pdf)\b/i.test(lower)) {
      return { type: 'document', category: 'logic' };
    }

    // Default: Process
    return { type: 'process', category: 'compute' };
  }

  // Helper to create or retrieve an entity ID
  private static makeEntityId(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    return slug || `node_${Math.random().toString(36).substring(2, 7)}`;
  }

  private static createEntity(rawName: string): ParsedFlowEntity {
    const cleanLabel = rawName
      .replace(/^[•*-]\s*/, '')
      .replace(/^\[|\]$/g, '')
      .replace(/^\(|\)$/g, '')
      .trim();

    const { type, category } = this.inferNodeTypeAndCategory(cleanLabel);
    const id = this.makeEntityId(cleanLabel);

    return {
      id,
      rawName: cleanLabel,
      label: cleanLabel,
      type,
      category,
    };
  }

  // ── 4. Specialized Parser: Mermaid ─────────────────────────────────────────
  private static parseMermaid(text: string, warnings: string[]): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const entitiesMap = new Map<string, ParsedFlowEntity>();
    const mermaidIdMap = new Map<string, ParsedFlowEntity>();
    const relations: ParsedFlowRelation[] = [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      // Ignore header directives
      if (/^(graph|flowchart|subgraph|end)\b/i.test(line)) return;

      // Regex to split line by any Mermaid arrow
      const arrowRegex = /\s*(?:--\s*\|([^|]+)\|\s*-->|-->\|([^|]+)\||--\s+([^-]+?)\s+-->|==\s+([^=]+?)\s+==>|==>\|([^|]+)\||-\.-\s*\|([^|]+)\|\s*\.->|(-{1,3}>?|={1,3}>?|-\.-+>?))\s*/g;

      let match;
      let lastIdx = 0;
      const segments: string[] = [];
      const edgeLabels: (string | undefined)[] = [];
      const edgeStyles: ('solid' | 'dashed')[] = [];

      while ((match = arrowRegex.exec(line)) !== null) {
        segments.push(line.substring(lastIdx, match.index).trim());
        const label = match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || undefined;
        edgeLabels.push(label ? label.trim().replace(/^["']|["']$/g, '') : undefined);
        edgeStyles.push(match[0].includes('.-') ? 'dashed' : 'solid');
        lastIdx = arrowRegex.lastIndex;
      }
      segments.push(line.substring(lastIdx).trim());

      if (segments.length >= 2) {
        for (let i = 0; i < segments.length - 1; i++) {
          const rawSrc = segments[i];
          const rawTgt = segments[i + 1];
          if (!rawSrc || !rawTgt) continue;

          const sourceEntity = this.parseMermaidNode(rawSrc, entitiesMap, mermaidIdMap);
          const targetEntity = this.parseMermaidNode(rawTgt, entitiesMap, mermaidIdMap);

          if (sourceEntity && targetEntity && sourceEntity.id !== targetEntity.id) {
            relations.push({
              id: `rel_${relations.length + 1}`,
              fromId: sourceEntity.id,
              toId: targetEntity.id,
              label: edgeLabels[i],
              style: edgeStyles[i] || 'solid',
            });
          }
        }
      } else if (line.includes('[') || line.includes('(') || line.includes('{')) {
        // Isolated node declaration
        this.parseMermaidNode(line, entitiesMap, mermaidIdMap);
      }
    });

    return {
      entities: Array.from(entitiesMap.values()),
      relations,
    };
  }

  private static parseMermaidNode(
    raw: string,
    entitiesMap: Map<string, ParsedFlowEntity>,
    mermaidIdMap: Map<string, ParsedFlowEntity>
  ): ParsedFlowEntity {
    let id = '';
    let label = '';
    let forcedType: FlowchartNodeType | null = null;

    const dbMatch = raw.match(/^([A-Za-z0-9_]+)\s*\[\((.*?)\)\]$/);
    const stadiumMatch = raw.match(/^([A-Za-z0-9_]+)\s*\(\[(.*?)\]\)$/);
    const circleMatch = raw.match(/^([A-Za-z0-9_]+)\s*\(\((.*?)\)\)$/);
    const decisionMatch = raw.match(/^([A-Za-z0-9_]+)\s*\{(.*?)\}$/);
    const roundMatch = raw.match(/^([A-Za-z0-9_]+)\s*\((.*?)\)$/);
    const rectMatch = raw.match(/^([A-Za-z0-9_]+)\s*\[(.*?)\]$/);

    if (dbMatch) {
      id = dbMatch[1].trim();
      label = dbMatch[2].trim() || id;
      forcedType = 'database';
    } else if (stadiumMatch) {
      id = stadiumMatch[1].trim();
      label = stadiumMatch[2].trim() || id;
      forcedType = 'process';
    } else if (circleMatch) {
      id = circleMatch[1].trim();
      label = circleMatch[2].trim() || id;
    } else if (decisionMatch) {
      id = decisionMatch[1].trim();
      label = decisionMatch[2].trim() || id;
      forcedType = 'decision';
    } else if (roundMatch) {
      id = roundMatch[1].trim();
      label = roundMatch[2].trim() || id;
    } else if (rectMatch) {
      id = rectMatch[1].trim();
      label = rectMatch[2].trim() || id;
    } else {
      id = raw.trim();
      label = raw.trim();
    }

    const idKey = id.toLowerCase();
    if (mermaidIdMap.has(idKey)) {
      const existing = mermaidIdMap.get(idKey)!;
      // If label was generic id before and now has a distinct shape label, update it
      if (label && label !== id && existing.label === id) {
        existing.label = label;
        existing.rawName = label;
        if (forcedType) {
          existing.type = forcedType;
          existing.category = forcedType === 'database' ? 'data' : forcedType === 'decision' ? 'logic' : existing.category;
        }
      }
      return existing;
    }

    // Check if matching label already exists in entitiesMap
    const labelKey = (label || id).toLowerCase();
    for (const [_, existing] of entitiesMap) {
      if (existing.label.toLowerCase() === labelKey) {
        mermaidIdMap.set(idKey, existing);
        return existing;
      }
    }

    const { type, category } = forcedType
      ? { type: forcedType, category: (forcedType === 'database' ? 'data' : forcedType === 'decision' ? 'logic' : 'compute') as FlowCategory }
      : this.inferNodeTypeAndCategory(label || id);

    const entity: ParsedFlowEntity = {
      id: this.makeEntityId(label || id),
      rawName: label || id,
      label: label || id,
      type,
      category,
    };

    entitiesMap.set(entity.id, entity);
    mermaidIdMap.set(idKey, entity);
    return entity;
  }

  // ── 5. Specialized Parser: Multi-Hop Arrow Chains ──────────────────────────
  private static parseArrowChains(text: string, _warnings: string[]): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const entitiesMap = new Map<string, ParsedFlowEntity>();
    const relations: ParsedFlowRelation[] = [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      // Split on any arrow delimiter: ->, -->, =>, ==>, →
      const tokens = line
        .split(/\s*(?:-->|==>|->|=>|→)\s*/)
        .map(t => t.trim())
        .filter(Boolean);

      if (tokens.length >= 2) {
        let prevEntity: ParsedFlowEntity | null = null;
        let pendingLabel: string | undefined = undefined;

        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          // If token is bracketed label like [HTTPS] between two nodes, treat as edge label
          const bracketLabelMatch = token.match(/^\[(.*?)\]$/) || token.match(/^\((.*?)\)$/);
          if (bracketLabelMatch && prevEntity && i < tokens.length - 1) {
            pendingLabel = bracketLabelMatch[1].trim();
            continue;
          }

          const entity = this.getOrAddEntity(token, entitiesMap);
          if (prevEntity && prevEntity.id !== entity.id) {
            relations.push({
              id: `rel_${relations.length + 1}`,
              fromId: prevEntity.id,
              toId: entity.id,
              label: pendingLabel,
            });
            pendingLabel = undefined;
          }
          prevEntity = entity;
        }
      }
    });

    return {
      entities: Array.from(entitiesMap.values()),
      relations,
    };
  }

  // ── 6. Specialized Parser: Decision Trees with Branch Syntax ────────────────
  private static parseDecisionTree(text: string, _warnings: string[]): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const entitiesMap = new Map<string, ParsedFlowEntity>();
    const relations: ParsedFlowRelation[] = [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let currentParent: ParsedFlowEntity | null = null;

    lines.forEach(line => {
      // Check for branch markers: ├── Yes → Save to DB or ├── [Yes] → ... or └── No → ...
      const branchMatch = line.match(/^[├└│─\s]*(?:\[([^\]]+)\]|([A-Za-z0-9_ ]+?))\s*(?:->|-->|→|:)\s*(.+)$/);

      if (branchMatch) {
        const branchLabel = (branchMatch[1] || branchMatch[2]).replace(/^[├└│─\s]+/, '').replace(/^\[|\]$/g, '').trim();
        const targetText = branchMatch[3].trim();

        // Split chained arrows in targetText if present, e.g. "Login Screen → Enter Password"
        const targetSteps = targetText
          .split(/\s*(?:->|-->|→)\s*/)
          .map(s => s.trim())
          .filter(Boolean);

        if (targetSteps.length > 0) {
          const firstTarget = this.getOrAddEntity(targetSteps[0], entitiesMap);
          if (currentParent) {
            if (currentParent.type !== 'decision') {
              currentParent.type = 'decision';
              currentParent.category = 'logic';
            }

            relations.push({
              id: `rel_${relations.length + 1}`,
              fromId: currentParent.id,
              toId: firstTarget.id,
              label: branchLabel,
            });
          }

          let prevStep = firstTarget;
          for (let s = 1; s < targetSteps.length; s++) {
            const nextStep = this.getOrAddEntity(targetSteps[s], entitiesMap);
            if (prevStep.id !== nextStep.id) {
              relations.push({
                id: `rel_${relations.length + 1}`,
                fromId: prevStep.id,
                toId: nextStep.id,
              });
            }
            prevStep = nextStep;
          }
        }
      } else {
        // Parent or sequential node
        const clean = line.replace(/^[↓├└│─\s]+/, '').replace(/[-=]>|→/, '').trim();
        if (clean.length > 0) {
          const entity = this.getOrAddEntity(clean, entitiesMap);
          if (currentParent && currentParent.id !== entity.id && !line.includes('?')) {
            relations.push({
              id: `rel_${relations.length + 1}`,
              fromId: currentParent.id,
              toId: entity.id,
            });
          }
          currentParent = entity;
        }
      }
    });

    return {
      entities: Array.from(entitiesMap.values()),
      relations,
    };
  }

  // ── 7. Specialized Parser: Fanout & Multi-Line Arrow Statements ────────────
  private static parseFanout(text: string, _warnings: string[]): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const entitiesMap = new Map<string, ParsedFlowEntity>();
    const relations: ParsedFlowRelation[] = [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    lines.forEach(line => {
      // Split on arrow or relationship verbs
      const match = line.match(/^(.+?)\s*(?:-->|==>|->|=>|→|calls\b|sends to\b|connects to\b|requests\b|reads from\b|writes to\b|publishes to\b|consumes from\b)\s*(.+)$/i);

      if (match) {
        const rawSource = match[1].trim();
        const rawTarget = match[2].trim();

        // Extract action verb as relationship label if present
        let relationLabel: string | undefined = undefined;
        const verbMatch = line.match(/\b(calls|sends to|connects to|requests|reads from|writes to|publishes to|consumes from)\b/i);
        if (verbMatch) {
          relationLabel = verbMatch[1].toLowerCase();
        }

        const sourceEntity = this.getOrAddEntity(rawSource, entitiesMap);
        const targetEntity = this.getOrAddEntity(rawTarget, entitiesMap);

        if (sourceEntity.id !== targetEntity.id) {
          relations.push({
            id: `rel_${relations.length + 1}`,
            fromId: sourceEntity.id,
            toId: targetEntity.id,
            label: relationLabel,
          });
        }
      }
    });

    return {
      entities: Array.from(entitiesMap.values()),
      relations,
    };
  }

  // ── 8. Specialized Parser: Natural Language ────────────────────────────────
  private static parseNaturalLanguage(text: string, _warnings: string[]): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const entitiesMap = new Map<string, ParsedFlowEntity>();
    const relations: ParsedFlowRelation[] = [];

    // Split into sentences
    const sentences = text
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    let previousEntity: ParsedFlowEntity | null = null;

    sentences.forEach(sentence => {
      // Search for patterns: "X [sends request to / calls / reads from / routes to] Y"
      const verbMatch = sentence.match(/(?:The\s+)?([A-Za-z0-9_\s]{2,30}?)\s+(?:sends(?: a)? request to|calls|connects to|routes to|validates with|reads(?: data)? from|writes to|publishes to|passes to|triggers)\s+(?:the\s+)?([A-Za-z0-9_\s]{2,30}?)(?:\.|$|,)/i);

      if (verbMatch) {
        const sourceName = verbMatch[1].trim();
        const targetName = verbMatch[2].trim();

        const sourceEntity = this.getOrAddEntity(sourceName, entitiesMap);
        const targetEntity = this.getOrAddEntity(targetName, entitiesMap);

        let label = 'Request';
        if (/reads/i.test(sentence)) label = 'Query';
        else if (/writes/i.test(sentence)) label = 'Write';
        else if (/validates/i.test(sentence)) label = 'Validate';
        else if (/publishes/i.test(sentence)) label = 'Publish';

        relations.push({
          id: `rel_${relations.length + 1}`,
          fromId: sourceEntity.id,
          toId: targetEntity.id,
          label,
        });

        previousEntity = targetEntity;
      } else {
        // Fallback: extract prominent entities from sentence
        const entityNames = sentence.match(/\b(?:User|Client|Browser|API Gateway|Auth Service|Database|PostgreSQL|Redis Cache|Server|Microservice|Queue|Worker|Payment Gateway)\b/gi);
        if (entityNames && entityNames.length >= 2) {
          const src = this.getOrAddEntity(entityNames[0], entitiesMap);
          const tgt = this.getOrAddEntity(entityNames[1], entitiesMap);
          relations.push({
            id: `rel_${relations.length + 1}`,
            fromId: src.id,
            toId: tgt.id,
          });
          previousEntity = tgt;
        } else if (entityNames && entityNames.length === 1 && previousEntity) {
          const tgt = this.getOrAddEntity(entityNames[0], entitiesMap);
          relations.push({
            id: `rel_${relations.length + 1}`,
            fromId: previousEntity.id,
            toId: tgt.id,
          });
          previousEntity = tgt;
        }
      }
    });

    return {
      entities: Array.from(entitiesMap.values()),
      relations,
    };
  }

  // ── 9. Specialized Parser: Numbered or Bullet Workflows ────────────────────
  private static parseNumberedOrBullets(text: string, _warnings: string[]): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const entitiesMap = new Map<string, ParsedFlowEntity>();
    const relations: ParsedFlowRelation[] = [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let prevEntity: ParsedFlowEntity | null = null;

    lines.forEach(line => {
      const clean = line.replace(/^(\d+[.)]|[-*•▪])\s+/, '').trim();
      if (clean) {
        const entity = this.getOrAddEntity(clean, entitiesMap);
        if (prevEntity && prevEntity.id !== entity.id) {
          relations.push({
            id: `rel_${relations.length + 1}`,
            fromId: prevEntity.id,
            toId: entity.id,
          });
        }
        prevEntity = entity;
      }
    });

    return {
      entities: Array.from(entitiesMap.values()),
      relations,
    };
  }

  // ── Helper: Deduplicate entities by case-insensitive name ───────────────────
  private static getOrAddEntity(name: string, entitiesMap: Map<string, ParsedFlowEntity>): ParsedFlowEntity {
    const clean = name
      .replace(/^[•*-]\s*/, '')
      .replace(/^\[|\]$/g, '')
      .replace(/^\(|\)$/g, '')
      .replace(/^(the|a)\s+/i, '')
      .trim();

    const lower = clean.toLowerCase();

    for (const [_, existing] of entitiesMap) {
      if (existing.label.toLowerCase() === lower || existing.rawName.toLowerCase() === lower) {
        return existing;
      }
    }

    const newEntity = this.createEntity(clean);
    entitiesMap.set(newEntity.id, newEntity);
    return newEntity;
  }

  private static deduplicateEntitiesAndRelations(
    entities: ParsedFlowEntity[],
    relations: ParsedFlowRelation[]
  ): { entities: ParsedFlowEntity[]; relations: ParsedFlowRelation[] } {
    const uniqueEntitiesMap = new Map<string, ParsedFlowEntity>();
    const idRemap = new Map<string, string>();

    entities.forEach(ent => {
      const key = ent.label.toLowerCase();
      if (!uniqueEntitiesMap.has(key)) {
        uniqueEntitiesMap.set(key, ent);
        idRemap.set(ent.id, ent.id);
      } else {
        const existing = uniqueEntitiesMap.get(key)!;
        idRemap.set(ent.id, existing.id);
      }
    });

    const uniqueRelations: ParsedFlowRelation[] = [];
    const relationKeys = new Set<string>();

    relations.forEach(rel => {
      const from = idRemap.get(rel.fromId) || rel.fromId;
      const to = idRemap.get(rel.toId) || rel.toId;

      // Ignore self-loops on identical node
      if (from === to) return;

      const key = `${from}->${to}:${rel.label || ''}`;
      if (!relationKeys.has(key)) {
        relationKeys.add(key);
        uniqueRelations.push({
          ...rel,
          fromId: from,
          toId: to,
        });
      }
    });

    return {
      entities: Array.from(uniqueEntitiesMap.values()),
      relations: uniqueRelations,
    };
  }

  // ── 10. Hierarchical Auto-Layout Engine ─────────────────────────────────────
  public static buildLayoutDiagram(
    entities: ParsedFlowEntity[],
    relations: ParsedFlowRelation[],
    direction: 'vertical' | 'horizontal' = 'vertical',
    theme: FlowchartTheme = DIAGRAM_THEMES[0]
  ): DiagramData {
    if (entities.length === 0) {
      return { type: 'flowchart', nodes: [], connectors: [] };
    }

    // 1. Calculate incoming / outgoing degrees for topological rank assignment
    const inDegree = new Map<string, number>();
    const outNeighbors = new Map<string, string[]>();

    entities.forEach(e => {
      inDegree.set(e.id, 0);
      outNeighbors.set(e.id, []);
    });

    relations.forEach(r => {
      inDegree.set(r.toId, (inDegree.get(r.toId) || 0) + 1);
      outNeighbors.get(r.fromId)?.push(r.toId);
    });

    // 2. Assign Hierarchical Ranks (BFS/DAG levels)
    const nodeRanks = new Map<string, number>();
    const queue: { id: string; rank: number }[] = [];

    // Find root nodes (inDegree === 0)
    entities.forEach(e => {
      if ((inDegree.get(e.id) || 0) === 0) {
        queue.push({ id: e.id, rank: 0 });
        nodeRanks.set(e.id, 0);
      }
    });

    // If cyclic with no zero-indegree roots, start with the first node
    if (queue.length === 0 && entities.length > 0) {
      queue.push({ id: entities[0].id, rank: 0 });
      nodeRanks.set(entities[0].id, 0);
    }

    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, rank } = queue.shift()!;
      visited.add(id);

      const targets = outNeighbors.get(id) || [];
      targets.forEach(tgtId => {
        const nextRank = rank + 1;
        const currentRank = nodeRanks.get(tgtId) || 0;
        if (nextRank > currentRank) {
          nodeRanks.set(tgtId, nextRank);
        }
        if (!visited.has(tgtId)) {
          queue.push({ id: tgtId, rank: nextRank });
        }
      });
    }

    // Handle any orphaned unreached nodes
    let maxRank = Math.max(0, ...Array.from(nodeRanks.values()));
    entities.forEach(e => {
      if (!nodeRanks.has(e.id)) {
        maxRank += 1;
        nodeRanks.set(e.id, maxRank);
      }
    });

    // 3. Group Nodes by Rank Level
    const ranksMap = new Map<number, ParsedFlowEntity[]>();
    entities.forEach(e => {
      const r = nodeRanks.get(e.id) || 0;
      if (!ranksMap.has(r)) {
        ranksMap.set(r, []);
      }
      ranksMap.get(r)!.push(e);
    });

    // 4. Calculate Coordinates (Top-to-Bottom or Left-to-Right)
    const nodes: DiagramNode[] = [];
    const isVertical = direction === 'vertical';

    const nodeWidth = 180;
    const nodeHeight = 64;
    const rankGap = isVertical ? 140 : 240;
    const siblingGap = isVertical ? 220 : 120;
    const startOffset = 60;

    const sortedRanks = Array.from(ranksMap.keys()).sort((a, b) => a - b);

    // Calculate maximum rank width to center narrower rows
    let maxRankSpan = 0;
    sortedRanks.forEach(r => {
      const row = ranksMap.get(r)!;
      const span = row.length * siblingGap;
      if (span > maxRankSpan) maxRankSpan = span;
    });

    sortedRanks.forEach(rankIndex => {
      const rowEntities = ranksMap.get(rankIndex)!;
      const rowSpan = (rowEntities.length - 1) * siblingGap;
      const centeringOffset = (maxRankSpan - rowSpan) / 2;

      rowEntities.forEach((ent, sibIndex) => {
        let x = 0;
        let y = 0;

        if (isVertical) {
          x = startOffset + centeringOffset + sibIndex * siblingGap;
          y = startOffset + rankIndex * rankGap;
        } else {
          x = startOffset + rankIndex * rankGap;
          y = startOffset + centeringOffset + sibIndex * siblingGap;
        }

        const color = this.getCategoryColor(ent.category, theme);

        nodes.push({
          id: ent.id,
          type: ent.type as any,
          text: ent.label,
          x: Math.round(x),
          y: Math.round(y),
          width: ent.type === 'decision' ? 180 : nodeWidth,
          height: ent.type === 'decision' ? 70 : nodeHeight,
          fill: color,
          stroke: color,
        });
      });
    });

    // 5. Build Native Connectors
    const connectors: DiagramConnector[] = relations.map((rel, idx) => ({
      id: `conn_${idx + 1}_${rel.fromId}_${rel.toId}`,
      fromNodeId: rel.fromId,
      toNodeId: rel.toId,
      label: rel.label,
      style: rel.style || 'solid',
      arrow: rel.arrow || 'end',
    }));

    return {
      type: 'architecture',
      nodes,
      connectors,
    };
  }

  // ── Helper: Category Colors ────────────────────────────────────────────────
  public static getCategoryColor(category: FlowCategory, theme: FlowchartTheme): string {
    switch (category) {
      case 'client':
        return '#06b6d4'; // Cyan
      case 'compute':
        return theme.processColor || '#3b82f6'; // Blue
      case 'data':
        return theme.databaseColor || '#8b5cf6'; // Purple
      case 'integration':
        return '#f59e0b'; // Amber / Orange
      case 'logic':
        return theme.decisionColor || '#10b981'; // Emerald
      default:
        return '#3b82f6';
    }
  }

  private static emptyResult(): FlowParseResult {
    return {
      success: false,
      format: 'generic',
      entities: [],
      relations: [],
      diagram: { type: 'flowchart', nodes: [], connectors: [] },
      stats: {
        totalNodes: 0,
        totalEdges: 0,
        decisionsCount: 0,
        databasesCount: 0,
        queuesCount: 0,
        servicesCount: 0,
        clientsCount: 0,
      },
      warnings: ['No content provided to parse.'],
    };
  }
}
