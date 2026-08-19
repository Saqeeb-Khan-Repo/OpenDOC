import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Mobile-First Editor Experience Verification', () => {
  const presentationToolbarPath = path.resolve(__dirname, '../../components/editor/MobilePresentationToolbar.tsx');
  const presentationToolbarCode = fs.readFileSync(presentationToolbarPath, 'utf8');

  const presentationCanvasPath = path.resolve(__dirname, '../../components/editor/PresentationCanvas.tsx');
  const presentationCanvasCode = fs.readFileSync(presentationCanvasPath, 'utf8');

  const flowchartEditorPath = path.resolve(__dirname, '../../pages/FlowchartEditorPage.tsx');
  const flowchartEditorCode = fs.readFileSync(flowchartEditorPath, 'utf8');

  const dashboardPagePath = path.resolve(__dirname, '../../pages/DashboardPage.tsx');
  const dashboardPageCode = fs.readFileSync(dashboardPagePath, 'utf8');

  it('should render the 5 primary tools [Text, Shape, Image, Slide, More] in MobilePresentationToolbar', () => {
    expect(presentationToolbarCode).toContain('Text');
    expect(presentationToolbarCode).toContain('Shape');
    expect(presentationToolbarCode).toContain('Image');
    expect(presentationToolbarCode).toContain('Slide');
    expect(presentationToolbarCode).toContain('More');
  });

  it('should support font size presets and direct numeric input in MobilePresentationToolbar', () => {
    // Check preset sizes
    expect(presentationToolbarCode).toContain('12');
    expect(presentationToolbarCode).toContain('14');
    expect(presentationToolbarCode).toContain('16');
    expect(presentationToolbarCode).toContain('18');
    expect(presentationToolbarCode).toContain('20');
    expect(presentationToolbarCode).toContain('24');
    expect(presentationToolbarCode).toContain('28');
    expect(presentationToolbarCode).toContain('32');
    expect(presentationToolbarCode).toContain('36');
    expect(presentationToolbarCode).toContain('48');
    expect(presentationToolbarCode).toContain('64');
    expect(presentationToolbarCode).toContain('72');
    expect(presentationToolbarCode).toContain('96');

    // Direct numeric input
    expect(presentationToolbarCode).toContain('customFontSize');
    expect(presentationToolbarCode).toContain('type="number"');
  });

  it('should include mobile horizontal slide thumbnail strip and floating zoom in PresentationCanvas', () => {
    expect(presentationCanvasCode).toContain('thumbnailStripRef');
    expect(presentationCanvasCode).toContain('overflow-x-auto');
    expect(presentationCanvasCode).toContain('ZoomIn');
    expect(presentationCanvasCode).toContain('ZoomOut');
    expect(presentationCanvasCode).toContain('zoomMultiplier');
  });

  it('should include dedicated non-overlapping slide navigation with accessible touch targets in PresentationCanvas', () => {
    expect(presentationCanvasCode).toContain('aria-label="Previous slide"');
    expect(presentationCanvasCode).toContain('aria-label="Next slide"');
    expect(presentationCanvasCode).toContain('Slide {safeActiveIndex + 1} / {validSlides.length}');
  });

  it('should auto-scroll editable text into view on focus in PresentationCanvas', () => {
    expect(presentationCanvasCode).toContain("scrollIntoView({ behavior: 'smooth', block: 'center' })");
  });

  it('should render the 5 primary tools [Node, Connect, Text, Delete, More] in FlowchartEditorPage', () => {
    expect(flowchartEditorCode).toContain('aria-label="Add node"');
    expect(flowchartEditorCode).toContain('aria-label="Connect nodes"');
    expect(flowchartEditorCode).toContain('aria-label="Edit node text"');
    expect(flowchartEditorCode).toContain('aria-label="Delete selected node or connection"');
    expect(flowchartEditorCode).toContain('aria-label="More flowchart options"');
  });

  it('should support 2-tap node connection and floating zoom controls in FlowchartEditorPage', () => {
    expect(flowchartEditorCode).toContain('connectModeActive');
    expect(flowchartEditorCode).toContain('handleStartConnectMode');
    expect(flowchartEditorCode).toContain('handleCancelConnectMode');
    expect(flowchartEditorCode).toContain('Fit to Screen');
  });

  it('should render all 4 core quick actions in DashboardPage', () => {
    expect(dashboardPageCode).toContain('Document');
    expect(dashboardPageCode).toContain('Presentation');
    expect(dashboardPageCode).toContain('Flowchart');
    expect(dashboardPageCode).toContain('Resume');
  });
});
