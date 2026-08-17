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
  it('should provide ready-made flowchart templates', () => {
    const templates = DiagramEngine.getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(6);
  });

  it('should parse natural structured text into nodes, decision branches, and retry loops', () => {
    const text = `
      Start: User Enters App
      Enter Email & Password
      Validate Credentials
      If Valid -> Generate JWT Session
      If Invalid -> Show Error Alert
      Show Error Alert -> Enter Email & Password
      Generate JWT Session -> Redirect to Dashboard
      Redirect to Dashboard -> End: User Active
    `;

    const diagram = DiagramEngine.parseStructuredText(text);
    expect(diagram.nodes.length).toBeGreaterThanOrEqual(6);
    expect(diagram.connectors.length).toBeGreaterThanOrEqual(6);

    const decisionNode = diagram.nodes.find(n => n.type === 'decision');
    expect(decisionNode).toBeDefined();

    const analysis = DiagramEngine.analyzeFlow(diagram);
    expect(analysis.hasStart).toBe(true);
    expect(analysis.hasEnd).toBe(true);
    expect(analysis.decisionCount).toBeGreaterThanOrEqual(1);
    expect(analysis.loopCount).toBeGreaterThanOrEqual(1);
  });

  it('should parse sequential step cards into ordered flow', () => {
    const steps = ['START', 'Step 1: Init', 'Step 2: Execute', 'END'];
    const diagram = DiagramEngine.parseSteps(steps);
    expect(diagram.nodes.length).toBe(4);
    expect(diagram.connectors.length).toBe(3);
  });

  it('should generate valid SVG markup for flowcharts', () => {
    const data = DiagramEngine.createDefaultFlowchart();
    const svg = DiagramEngine.renderToSvg(data);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).toContain('marker-end');
  });

  it('should apply hierarchical auto-layout to nodes', () => {
    const data = DiagramEngine.createDefaultFlowchart();
    const arranged = DiagramEngine.computeAutoLayout(data, 'vertical');
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

  it('should apply theme to all slides cleanly in a single operation', () => {
    const s1 = PresentationEngine.createSlide('title');
    const s2 = PresentationEngine.createSlide('title-content');
    const theme = {
      id: 'dark-pro',
      name: 'Dark Pro',
      backgroundColor: '#090d16',
      textColor: '#e2e8f0',
      headingFont: 'Playfair Display',
      bodyFont: 'JetBrains Mono',
      primaryColor: '#6366f1',
      accentColor: '#38bdf8',
    };

    const updated = PresentationEngine.applyThemeToAllSlides([s1, s2], theme);
    expect(updated.length).toBe(2);
    expect(updated[0].background).toBe('#090d16');
    expect(updated[1].background).toBe('#090d16');
    expect(updated[0].elements[0].style?.fontFamily).toBe('JetBrains Mono');
  });

  it('should apply background and gradient to all slides', () => {
    const s1 = PresentationEngine.createSlide('title');
    const s2 = PresentationEngine.createSlide('title-content');

    const withGrad = PresentationEngine.applyBackgroundToAllSlides([s1, s2], undefined, 'linear-gradient(135deg, #000, #333)');
    expect(withGrad[0].gradient).toBe('linear-gradient(135deg, #000, #333)');
    expect(withGrad[1].gradient).toBe('linear-gradient(135deg, #000, #333)');
  });

  it('should apply font to all slides', () => {
    const s1 = PresentationEngine.createSlide('title');
    const s2 = PresentationEngine.createSlide('title-content');

    const withFont = PresentationEngine.applyFontToAllSlides([s1, s2], 'Merriweather');
    expect(withFont[0].elements.every(el => el.type !== 'text' || el.style?.fontFamily === 'Merriweather')).toBe(true);
    expect(withFont[1].elements.every(el => el.type !== 'text' || el.style?.fontFamily === 'Merriweather')).toBe(true);
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
  });

  it('should create instant assets without blocking', () => {
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const instant = ImageAssetEngine.createInstantAsset(sampleDataUrl, 'Instant Test');

    expect(instant.assetId).toBeDefined();
    expect(instant.previewUrl).toBe(sampleDataUrl);
    expect(instant.name).toBe('Instant Test');
  });
});

import { ElementEngine } from '../ElementEngine';
import { TemplateEngine } from '../TemplateEngine';

describe('ElementEngine', () => {
  it('should create valid text, shape, image, and table elements', () => {
    const textEl = ElementEngine.createElement('text', { content: 'Sample text' });
    expect(textEl.type).toBe('text');
    expect(textEl.content).toBe('Sample text');
    expect(textEl.transform.width).toBeGreaterThan(0);

    const shapeEl = ElementEngine.createElement('shape', { shapeType: 'circle' });
    expect(shapeEl.type).toBe('shape');
    expect(shapeEl.shapeType).toBe('circle');

    const tableEl = ElementEngine.createElement('table', { content: '<table></table>' });
    expect(tableEl.type).toBe('table');
  });
});

describe('TemplateEngine', () => {
  it('should provide academic and industry templates', () => {
    const templates = TemplateEngine.getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(10);

    const academicTmpl = templates.find(t => t.category === 'academic' || t.id.includes('academic') || t.id.includes('report') || t.id.includes('thesis'));
    expect(academicTmpl).toBeDefined();
  });
});

describe('DiagramEngine Flow Analysis', () => {
  it('should detect missing start and missing end nodes and dead ends', () => {
    const brokenDiagram = {
      type: 'flowchart' as const,
      nodes: [
        { id: 'n1', type: 'process' as const, text: 'Orphan Process', x: 100, y: 100, width: 140, height: 60 },
      ],
      connectors: [],
    };

    const analysis = DiagramEngine.analyzeFlow(brokenDiagram);
    expect(analysis.hasStart).toBe(false);
    expect(analysis.hasEnd).toBe(false);
    expect(analysis.warnings.length).toBeGreaterThan(0);
    expect(analysis.warnings.some(w => w.includes('Start') || w.includes('End') || w.includes('outgoing') || w.includes('incoming'))).toBe(true);
  });
});

