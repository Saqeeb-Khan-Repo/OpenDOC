import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocalStorageEngine } from '../LocalStorageEngine';
import { ImportEngine } from '../ImportEngine';
import { DiagramEngine } from '../DiagramEngine';
import { PDFEngine } from '../PDFEngine';
import { encodeSharePayload, decodeSharePayload, copyToClipboard } from '../../utils/share';
import { StudioDocument } from '../types';

// In-memory Storage mock for Vitest Node environment
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.get(key) || null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  key(index: number) { return Array.from(this.store.keys())[index] || null; }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new MemoryStorage();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  (globalThis as any).sessionStorage = new MemoryStorage();
}
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { origin: 'http://localhost:5173', reload: () => {} },
    localStorage: globalThis.localStorage,
    sessionStorage: globalThis.sessionStorage,
  };
}

describe('Production Stability & Crash Prevention Tests', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  describe('LocalStorageEngine Resilience & Migration', () => {
    it('should safely fall back to localStorage when IndexedDB is unavailable', async () => {
      const mockDoc = {
        id: 'test-doc-1',
        title: 'Resilience Test Document',
        content: '<p>Testing crash prevention</p>',
        mode: 'document',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as StudioDocument;

      await LocalStorageEngine.saveDocument(mockDoc);
      const retrieved = await LocalStorageEngine.getDocument('test-doc-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-doc-1');
      expect(retrieved?.title).toBe('Resilience Test Document');
    });

    it('should safely handle corrupted JSON string in localStorage without throwing', async () => {
      globalThis.localStorage.setItem('docflow_corrupt-id', 'INVALID_JSON_{{{{');
      const doc = await LocalStorageEngine.getDocument('corrupt-id');
      expect(doc).toBeNull();
    });

    it('should ignore corrupt items and return valid documents in getAllDocuments', async () => {
      globalThis.localStorage.setItem('docflow_valid-1', JSON.stringify({ id: 'valid-1', title: 'Valid 1' }));
      globalThis.localStorage.setItem('docflow_corrupt-2', '{{NOT_JSON}}');
      globalThis.localStorage.setItem('opendoc_legacy-3', JSON.stringify({ id: 'legacy-3', title: 'Legacy 3' }));

      const all = await LocalStorageEngine.getAllDocuments();
      expect(all.length).toBeGreaterThanOrEqual(2);
      expect(all.some(d => d.id === 'valid-1')).toBe(true);
      expect(all.some(d => d.id === 'legacy-3')).toBe(true);
    });

    it('should gracefully delete document without crashing if not found', async () => {
      await expect(LocalStorageEngine.deleteDocument('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('ImportEngine Edge Cases & Defensive File Validation', () => {
    it('should handle 0-byte empty files gracefully without crashing', async () => {
      const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
      const result = await ImportEngine.parseFile(emptyFile);
      expect(result.title).toBe('empty');
      expect(result.content).toBe('<p></p>');
    });

    it('should reject files exceeding the 50MB safety limit with a clean error message', async () => {
      const hugeFile = {
        name: 'huge_file.docx',
        size: 55 * 1024 * 1024,
      } as File;

      await expect(ImportEngine.parseFile(hugeFile)).rejects.toThrow('Maximum supported file size is 50 MB');
    });

    it('should parse malformed or empty CSV gracefully', async () => {
      const csvFile = new File([''], 'data.csv', { type: 'text/csv' });
      const result = await ImportEngine.parseFile(csvFile);
      expect(result.title).toBe('data');
    });

    it('should parse single-column or unquoted CSV without throwing', async () => {
      const csvContent = 'Header1,Header2\nValue1,Value2\nValue3';
      const csvFile = new File([csvContent], 'table.csv', { type: 'text/csv' });
      const result = await ImportEngine.parseFile(csvFile);
      expect(result.content).toContain('<table');
      expect(result.content).toContain('Header1');
      expect(result.content).toContain('Value1');
    });
  });

  describe('DiagramEngine Extreme Stress & Circular Graph Resilience', () => {
    it('should handle empty graph layout without crashing', () => {
      const emptyDiagram = { type: 'flowchart' as const, nodes: [], connectors: [] };
      const layout = DiagramEngine.computeAutoLayout(emptyDiagram, 'vertical');
      expect(layout.nodes).toEqual([]);
      expect(layout.connectors).toEqual([]);
    });

    it('should handle single-node graph layout correctly', () => {
      const singleDiagram = {
        type: 'flowchart' as const,
        nodes: [{ id: 'n1', type: 'start' as const, text: 'Start', x: 0, y: 0, width: 140, height: 50, fill: '#10b981' }],
        connectors: [],
      };
      const layout = DiagramEngine.computeAutoLayout(singleDiagram, 'vertical');
      expect(layout.nodes.length).toBe(1);
      expect(layout.nodes[0].x).toBeGreaterThan(0);
      expect(layout.nodes[0].y).toBeGreaterThan(0);
    });

    it('should handle circular loops (A -> B -> A) without infinite recursion', () => {
      const circularDiagram = {
        type: 'flowchart' as const,
        nodes: [
          { id: 'nA', type: 'process' as const, text: 'A', x: 0, y: 0, width: 140, height: 50, fill: '#3b82f6' },
          { id: 'nB', type: 'process' as const, text: 'B', x: 0, y: 0, width: 140, height: 50, fill: '#3b82f6' },
        ],
        connectors: [
          { id: 'c1', fromNodeId: 'nA', toNodeId: 'nB', arrow: 'end' as const },
          { id: 'c2', fromNodeId: 'nB', toNodeId: 'nA', arrow: 'end' as const },
        ],
      };

      expect(() => DiagramEngine.computeAutoLayout(circularDiagram, 'vertical')).not.toThrow();
      const analysis = DiagramEngine.analyzeFlow(circularDiagram);
      expect(analysis.loopCount).toBeGreaterThanOrEqual(1);
    });

    it('should stress-test auto-layout with 200 nodes without performance collapse', () => {
      const nodes = Array.from({ length: 200 }, (_, i) => ({
        id: `node_${i}`,
        type: (i === 0 ? 'start' : i === 199 ? 'end' : i % 5 === 0 ? 'decision' : 'process') as any,
        text: `Step ${i}`,
        x: 0,
        y: 0,
        width: 150,
        height: 54,
        fill: '#3b82f6',
      }));

      const connectors = Array.from({ length: 199 }, (_, i) => ({
        id: `conn_${i}`,
        fromNodeId: `node_${i}`,
        toNodeId: `node_${i + 1}`,
        arrow: 'end' as const,
      }));

      const largeDiagram = { type: 'flowchart' as const, nodes, connectors };
      const start = performance.now();
      const result = DiagramEngine.computeAutoLayout(largeDiagram, 'vertical');
      const duration = performance.now() - start;

      expect(result.nodes.length).toBe(200);
      expect(duration).toBeLessThan(500); // Must complete within 500ms
    });
  });

  describe('PDFEngine Defensive Safety & Calculations', () => {
    it('should format bytes correctly across scales', () => {
      expect(PDFEngine.formatBytes(0)).toBe('0 B');
      expect(PDFEngine.formatBytes(1024)).toBe('1 KB');
      expect(PDFEngine.formatBytes(1024 * 1024 * 5.5)).toBe('5.5 MB');
    });
  });

  describe('Share Payload Encoding, Unicode & Corruption Safety', () => {
    it('should encode and decode arbitrary Unicode characters (emojis, accents, Asian characters)', () => {
      const payload = {
        title: 'Project 🚀 Report: 日本語 & Über Document 📝',
        content: '<p>Special characters: & < > " \' 👨‍💻 🎉 € £ ¥</p>',
      };

      const encoded = encodeSharePayload(payload);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = decodeSharePayload(encoded);
      expect(decoded).toEqual(payload);
    });

    it('should return null for malformed or tampered base64 share payload', () => {
      expect(decodeSharePayload('')).toBeNull();
      expect(decodeSharePayload('NOT_VALID_BASE64_!!!')).toBeNull();
      expect(decodeSharePayload(btoa('{"title": 123}'))).toBeNull(); // Missing valid string content
    });

    it('should execute copyToClipboard fallback without throwing', async () => {
      const result = await copyToClipboard('DocProEditor Copy Test');
      expect(typeof result).toBe('boolean');
    });
  });
});
