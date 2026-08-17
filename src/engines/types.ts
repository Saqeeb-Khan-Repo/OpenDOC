export type EditorMode = 'document' | 'presentation' | 'design';

export type PageSize = 'A4' | 'A5' | 'Letter' | 'Legal' | 'Executive' | 'Custom';
export type PageOrientation = 'portrait' | 'landscape';
export type PageNumberFormat = 'arabic' | 'roman' | 'roman-lower' | 'alpha' | 'alpha-lower' | 'page-x-of-y';
export type NumberPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface PageMargin {
  top: number; // in mm
  right: number;
  bottom: number;
  left: number;
}

export interface PageBorderSettings {
  enabled: boolean;
  style: 'solid' | 'double' | 'dashed' | 'dotted' | 'groove' | 'ridge' | 'ornate';
  width: number; // in px
  color: string;
  inset: number; // in px from page edge
  applyTo: 'all' | 'first-page-only' | 'except-first-page';
}

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargin;
  columns: 1 | 2 | 3;
  headerText: string;
  footerText: string;
  differentFirstPage: boolean;
  differentOddEven: boolean;
  showPageNumbers: boolean;
  pageNumberFormat: PageNumberFormat;
  pageNumberPosition: NumberPosition;
  startPageNumberAt: number;
  hideNumberOnCover: boolean;
  backgroundColor: string;
  showRulers: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number; // percentage (e.g. 100)
  pageAlignment?: 'center' | 'left' | 'right';
  textDirection?: 'ltr' | 'rtl';
  showMarginGuides?: boolean;
  border?: PageBorderSettings;
}

// ─── Visual Canvas Elements (Canva / PPT / Visual Design) ────────────────────────
export type ElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'drawing'
  | 'chart'
  | 'diagram'
  | 'qrcode'
  | 'signature'
  | 'table'
  | 'equation';

export type ShapeType =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'star'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-up'
  | 'arrow-down'
  | 'line'
  | 'speech-bubble'
  | 'callout'
  | 'badge'
  | 'frame';

export interface ElementTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
}

export interface ElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  opacity?: number;
  shadow?: {
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  padding?: number;
  backgroundColor?: string;
  border?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area' | 'scatter';
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
  }[];
}

export interface DiagramNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'input-output' | 'end' | 'custom';
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
}

export interface DiagramConnector {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  style?: 'solid' | 'dashed';
  arrow?: 'end' | 'both' | 'none';
}

export interface DiagramData {
  type: 'flowchart' | 'mindmap' | 'architecture' | 'process';
  nodes: DiagramNode[];
  connectors: DiagramConnector[];
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  transform: ElementTransform;
  style: ElementStyle;
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  groupId?: string;
  content?: string; // Text HTML, Image URL, SVG string, KaTeX LaTeX
  shapeType?: ShapeType;
  chartData?: ChartData;
  diagramData?: DiagramData;
  qrData?: {
    text: string;
    fgColor: string;
    bgColor: string;
    margin: number;
  };
  signatureData?: {
    type: 'drawn' | 'typed' | 'uploaded';
    signatureUrl?: string;
    text?: string;
    fontFamily?: string;
  };
}

// ─── Slide Presentation Model ──────────────────────────────────────────────────
export type SlideLayout =
  | 'blank'
  | 'title'
  | 'title-content'
  | 'two-columns'
  | 'image-text'
  | 'section-header'
  | 'comparison'
  | 'timeline'
  | 'statistics'
  | 'full-image'
  | 'quote'
  | 'diagram'
  | 'closing';

export type SlideTransition = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'zoom';

export interface SlideTheme {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  gradientBackground?: string;
}

export interface Slide {
  id: string;
  title: string;
  layout: SlideLayout;
  elements: CanvasElement[];
  speakerNotes: string;
  background?: string;
  gradient?: string;
  gradientDirection?: string;
  transition?: SlideTransition;
  hidden?: boolean;
}

export interface PresentationSettings {
  aspectRatio: '16:9' | '4:3' | 'custom';
  width: number;
  height: number;
  theme: SlideTheme;
  defaultTransition: SlideTransition;
}

// ─── Academic & Report Presets ──────────────────────────────────────────────────
export interface CoverPageData {
  universityName: string;
  collegeName: string;
  departmentName: string;
  projectTitle: string;
  projectSubtitle?: string;
  studentName: string;
  studentUSN: string;
  guideName: string;
  guideDesignation: string;
  academicYear: string;
  submissionDate: string;
  logoUrl?: string;
}

export interface ReferenceItem {
  id: string;
  index: number;
  authors: string;
  title: string;
  source: string;
  year: string;
  url?: string;
  format: 'APA' | 'MLA' | 'IEEE' | 'Chicago';
}

export interface FigureItem {
  id: string;
  number: number;
  caption: string;
  pageNumber: number;
  type: 'figure' | 'table';
}

export interface TOCItem {
  id: string;
  level: 1 | 2 | 3 | 4;
  text: string;
  pageNumber: number;
}

// ─── Unified Document Model ────────────────────────────────────────────────────
export interface StudioDocument {
  id: string;
  title: string;
  mode: EditorMode;
  folderId: string | null;
  isStarred: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  thumbnail?: string;

  // Mode 1: Document content (Rich Text HTML + Page Settings)
  content: string; // Paginated HTML
  pageSettings: PageSettings;
  coverPageData?: CoverPageData;
  references: ReferenceItem[];
  figures: FigureItem[];

  // Mode 2: Presentation slides
  slides: Slide[];
  activeSlideIndex: number;
  presentationSettings: PresentationSettings;

  // Mode 3: Visual Design elements (freeform canvas)
  designElements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  canvasBackground: string;

  // Word statistics
  wordCount: number;
  charCount: number;
  paragraphCount: number;
  pageCount: number;
}

// ─── Filter & Storage Types ───────────────────────────────────────────────────
export type TemplateCategory =
  | 'project'
  | 'academic'
  | 'career'
  | 'presentation'
  | 'design'
  | 'business'
  | 'personal';

export interface StudioTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  mode: EditorMode;
  description: string;
  emoji: string;
  color: string;
  badge?: string;
  initialDocument: Partial<StudioDocument>;
}
