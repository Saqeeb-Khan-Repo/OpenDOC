import { describe, it, expect } from 'vitest';
import { PageEngine } from '../PageEngine';
import { ResumeEngine, RESUME_TEMPLATES_METADATA } from '../ResumeEngine';
import { DiagramEngine } from '../DiagramEngine';
import { PresentationEngine, PRESENTATION_GRADIENTS } from '../PresentationEngine';
import { OCREngine } from '../OCREngine';

describe('PageEngine', () => {
  it('should initialize default page settings with A4 format and margins', () => {
    const settings = PageEngine.createDefaultSettings();
    expect(settings.size).toBe('A4');
    expect(settings.orientation).toBe('portrait');
    expect(settings.margins.top).toBe(25.4);
    expect(settings.margins.left).toBe(25.4);
    expect(settings.border).toBeDefined();
    expect(settings.border?.style).toBe('solid');
  });

  it('should calculate page pixel dimensions accurately', () => {
    const settings = PageEngine.createDefaultSettings();
    const dimensions = PageEngine.getPagePixelDimensions(settings.size, settings.orientation, 100);
    expect(dimensions.width).toBe(794);
    expect(dimensions.height).toBe(1123);
  });
});

describe('ResumeEngine', () => {
  it('should provide 5 distinct professional templates', () => {
    const templates = ResumeEngine.getTemplates();
    expect(templates.length).toBe(5);
    expect(templates.map(t => t.id)).toEqual([
      'tmpl_modern_pro',
      'tmpl_two_column',
      'tmpl_software_eng',
      'tmpl_graduate_fresher',
      'tmpl_executive_corp',
    ]);
  });

  it('should render all 5 resume templates with user data without throwing', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const templateIds = ResumeEngine.getTemplates().map(t => t.id);

    templateIds.forEach(id => {
      const html = ResumeEngine.renderTemplate(data, id);
      expect(html).toContain(data.personalInfo.name);
      expect(html).toContain(data.personalInfo.email);
      expect(html.length).toBeGreaterThan(100);
    });
  });
});

describe('DiagramEngine', () => {
  it('should provide 8 ready-made flowchart templates', () => {
    const templates = DiagramEngine.getTemplates();
    expect(templates.length).toBe(8);
  });

  it('should generate valid SVG markup for flowcharts', () => {
    const data = DiagramEngine.createDefaultFlowchart();
    const svg = DiagramEngine.renderToSvg(data);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('marker-end');
  });

  it('should apply auto-layout to nodes', () => {
    const data = DiagramEngine.createDefaultFlowchart();
    const arranged = DiagramEngine.applyAutoLayout(data, 'vertical');
    expect(arranged.nodes.length).toBe(data.nodes.length);
    expect(arranged.nodes[0].y).toBeLessThan(arranged.nodes[arranged.nodes.length - 1].y);
  });
});

describe('PresentationEngine', () => {
  it('should provide professional slide gradient presets', () => {
    expect(PRESENTATION_GRADIENTS.length).toBeGreaterThanOrEqual(10);
    PRESENTATION_GRADIENTS.forEach(g => {
      expect(g.name).toBeDefined();
      expect(g.gradient).toContain('linear-gradient');
    });
  });

  it('should create valid slide with selected layout', () => {
    const slide = PresentationEngine.createSlide('title', undefined, 'Custom Title');
    expect(slide.id).toBeDefined();
    expect(slide.layout).toBe('title');
    expect(slide.elements.length).toBeGreaterThan(0);
  });
});

import { PDFEngine } from '../PDFEngine';

describe('PDFEngine', () => {
  it('should format bytes accurately', () => {
    expect(PDFEngine.formatBytes(0)).toBe('0 B');
    expect(PDFEngine.formatBytes(1024)).toBe('1 KB');
    expect(PDFEngine.formatBytes(1024 * 1024 * 3.5)).toBe('3.5 MB');
  });

  it('should merge multiple PDF array buffers', async () => {
    // Generate two sample PDFs
    const doc1 = await (await import('pdf-lib')).PDFDocument.create();
    const bytes1 = await doc1.save();
    const buf1 = bytes1.buffer.slice(bytes1.byteOffset, bytes1.byteOffset + bytes1.byteLength) as ArrayBuffer;

    const doc2 = await (await import('pdf-lib')).PDFDocument.create();
    doc2.addPage([595, 842]);
    doc2.addPage([595, 842]);
    const bytes2 = await doc2.save();
    const buf2 = bytes2.buffer.slice(bytes2.byteOffset, bytes2.byteOffset + bytes2.byteLength) as ArrayBuffer;

    const merged = await PDFEngine.mergePDFs([
      { name: 'doc1.pdf', buffer: buf1 },
      { name: 'doc2.pdf', buffer: buf2 },
    ]);

    expect(merged).toBeDefined();
    expect(merged.length).toBeGreaterThan(0);

    const mergedDoc = await (await import('pdf-lib')).PDFDocument.load(merged);
    expect(mergedDoc.getPageCount()).toBe(3);
  });
});

import { ImageAssetEngine } from '../ImageAssetEngine';

describe('ImageAssetEngine', () => {
  it('should sanitize SVG to prevent malicious script injection', () => {
    const dirtySvg = '<svg><script>alert("xss")</script><rect width="100" height="100" onload="alert(1)" /></svg>';
    const cleanSvg = ImageAssetEngine.sanitizeSvg(dirtySvg);
    expect(cleanSvg).not.toContain('<script');
    expect(cleanSvg).not.toContain('onload');
    expect(cleanSvg).toContain('<rect');
  });

  it('should calculate proportional fit dimensions', () => {
    const fit = ImageAssetEngine.calculateFitDimensions(1920, 1080, 720, 500);
    expect(fit.width).toBeLessThanOrEqual(720);
    expect(fit.height).toBeLessThanOrEqual(500);
    expect(fit.width / fit.height).toBeCloseTo(1920 / 1080, 1);
  });

  it('should store and resolve image assets', async () => {
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const asset = await ImageAssetEngine.storeImage(sampleDataUrl, 'Test Pixel');

    expect(asset.id).toBeDefined();
    expect(asset.name).toBe('Test Pixel');
    expect(asset.dataUrl).toContain('data:image/png');

    const htmlWithAsset = `<p>Test <img src="asset://${asset.id}" alt="Test" /></p>`;
    const resolved = await ImageAssetEngine.resolveHtmlImages(htmlWithAsset);
    expect(resolved).toContain(sampleDataUrl);
  });
});
