import { Slide, SlideLayout, SlideTheme, PresentationSettings, CanvasElement } from './types';
import { ElementEngine } from './ElementEngine';

export interface GradientPreset {
  id: string;
  name: string;
  gradient: string;
  textColor: string;
  headingColor: string;
  dark: boolean;
}

export const PRESENTATION_GRADIENTS: GradientPreset[] = [
  {
    id: 'blue-purple',
    name: 'Blue → Purple',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #6d28d9 100%)',
    textColor: '#e2e8f0',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'purple-pink',
    name: 'Purple → Pink',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    textColor: '#fdf2f8',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'cyan-blue',
    name: 'Cyan → Blue',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    textColor: '#f0f9ff',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'orange-pink',
    name: 'Orange → Pink',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #e11d48 100%)',
    textColor: '#fff1f2',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'green-teal',
    name: 'Green → Teal',
    gradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    textColor: '#ecfdf5',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'indigo-violet',
    name: 'Indigo → Violet',
    gradient: 'linear-gradient(135deg, #3730a3 0%, #6b21a8 100%)',
    textColor: '#ede9fe',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'dark-navy-purple',
    name: 'Dark Navy → Purple',
    gradient: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 100%)',
    textColor: '#cbd5e1',
    headingColor: '#f8fafc',
    dark: true,
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    textColor: '#334155',
    headingColor: '#0f172a',
    dark: false,
  },
  {
    id: 'dark-pro',
    name: 'Dark Professional',
    gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    textColor: '#e4e4e7',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel Glow',
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #fdf2f8 100%)',
    textColor: '#1e293b',
    headingColor: '#0f172a',
    dark: false,
  },
  {
    id: 'emerald-glow',
    name: 'Deep Emerald',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
    textColor: '#d1fae5',
    headingColor: '#ffffff',
    dark: true,
  },
  {
    id: 'sunset-crimson',
    name: 'Sunset Crimson',
    gradient: 'linear-gradient(135deg, #881337 0%, #4c0519 100%)',
    textColor: '#ffe4e6',
    headingColor: '#ffffff',
    dark: true,
  },
];

export const PRESENTATION_THEMES: SlideTheme[] = [
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#2563EB',
    accentColor: '#38BDF8',
    textColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  {
    id: 'corporate-navy',
    name: 'Corporate Navy',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#1E3A8A',
    accentColor: '#3B82F6',
    textColor: '#1E293B',
    backgroundColor: '#F8FAFC',
  },
  {
    id: 'emerald-tech',
    name: 'Emerald Tech',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#059669',
    accentColor: '#10B981',
    textColor: '#064E3B',
    backgroundColor: '#F0FDF4',
  },
  {
    id: 'creative-coral',
    name: 'Creative Coral',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#E11D48',
    accentColor: '#FB7185',
    textColor: '#1C1917',
    backgroundColor: '#FFF1F2',
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#60A5FA',
    accentColor: '#A78BFA',
    textColor: '#F8FAFC',
    backgroundColor: '#0F172A',
  },
  {
    id: 'academic-serif',
    name: 'Academic Serif',
    headingFont: 'Merriweather',
    bodyFont: 'Times New Roman',
    primaryColor: '#7C2D12',
    accentColor: '#D97706',
    textColor: '#292524',
    backgroundColor: '#FFFBEB',
  },
];

export class PresentationEngine {
  /**
   * Creates a default presentation configuration
   */
  static createDefaultSettings(): PresentationSettings {
    return {
      aspectRatio: '16:9',
      width: 960,
      height: 540,
      theme: PRESENTATION_THEMES[0],
      defaultTransition: 'fade',
    };
  }

  /**
   * Generate a new slide based on layout preset
   */
  static createSlide(
    layout: SlideLayout = 'title-content',
    theme: SlideTheme = PRESENTATION_THEMES[0],
    gradient?: string
  ): Slide {
    const id = `slide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const elements: CanvasElement[] = [];

    const isDarkGradient = gradient && (
      gradient.includes('#1e3a8a') || gradient.includes('#7c3aed') ||
      gradient.includes('#0284c7') || gradient.includes('#ea580c') ||
      gradient.includes('#059669') || gradient.includes('#3730a3') ||
      gradient.includes('#090d16') || gradient.includes('#18181b') ||
      gradient.includes('#064e3b') || gradient.includes('#881337')
    );

    const headingColor = isDarkGradient ? '#ffffff' : theme.primaryColor;
    const bodyColor = isDarkGradient ? '#f1f5f9' : theme.textColor;

    if (layout === 'title') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 160, width: 800, height: 110, rotation: 0 },
          content: `<h1 style="font-size: 40px; font-weight: bold; color: ${headingColor}; text-align: center; line-height: 1.2;">Presentation Title</h1>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 120, y: 280, width: 720, height: 60, rotation: 0 },
          content: `<p style="font-size: 20px; color: ${bodyColor}; opacity: 0.9; text-align: center;">Subtitle / Presenter Name & Organization</p>`,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'title-content') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">Slide Topic Heading</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 840, height: 360, rotation: 0 },
          content: `
            <ul style="font-size: 18px; line-height: 1.9; color: ${bodyColor};">
              <li>Key point 1: Highlight key insights or core metrics</li>
              <li>Key point 2: Deep dive into technical architecture and design</li>
              <li>Key point 3: Project timeline, milestones, and deliverables</li>
              <li>Key point 4: Strategic takeaways and future vision</li>
            </ul>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'two-columns') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">Comparative Analysis</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 400, height: 360, rotation: 0 },
          content: `
            <h3 style="font-size: 20px; font-weight: 600; color: ${headingColor}; margin-bottom: 8px;">Methodology A</h3>
            <p style="font-size: 16px; line-height: 1.7; color: ${bodyColor};">
              Overview of approach A, benefits, performance metrics, and evaluation results.
            </p>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 500, y: 120, width: 400, height: 360, rotation: 0 },
          content: `
            <h3 style="font-size: 20px; font-weight: 600; color: ${isDarkGradient ? '#38bdf8' : theme.accentColor}; margin-bottom: 8px;">Methodology B</h3>
            <p style="font-size: 16px; line-height: 1.7; color: ${bodyColor};">
              Comparative benchmark, throughput scaling, and trade-off considerations.
            </p>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'section-header') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 180, width: 800, height: 120, rotation: 0 },
          content: `<h1 style="font-size: 44px; font-weight: bold; color: ${headingColor}; text-align: center;">Section 02: Core Architecture</h1>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 120, y: 310, width: 720, height: 50, rotation: 0 },
          content: `<p style="font-size: 20px; color: ${bodyColor}; opacity: 0.85; text-align: center;">Technical components, data structures & algorithms</p>`,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'image-text') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">Visual Architecture Overview</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 420, height: 360, rotation: 0 },
          content: `
            <p style="font-size: 17px; line-height: 1.8; color: ${bodyColor}; margin-bottom: 12px;">
              The system utilizes a modular decoupled architecture where computational engines manage document layouts, vector graphics, and presentations independently.
            </p>
            <ul style="font-size: 16px; line-height: 1.7; color: ${bodyColor};">
              <li>IndexedDB local-first persistence</li>
              <li>Vector-based multi-page renderer</li>
              <li>Zero-dependency offline operation</li>
            </ul>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 510, y: 120, width: 390, height: 340, rotation: 0 },
          style: { fill: isDarkGradient ? 'rgba(255,255,255,0.1)' : 'rgba(37,99,235,0.08)', stroke: isDarkGradient ? '#ffffff' : theme.primaryColor, strokeWidth: 1, cornerRadius: 12 },
        })
      );
    } else if (layout === 'quote') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 100, y: 140, width: 760, height: 180, rotation: 0 },
          content: `<p style="font-size: 32px; font-style: italic; text-align: center; color: ${headingColor}; line-height: 1.4;">"Good design makes a product understandable, innovative, and thorough."</p>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 200, y: 340, width: 560, height: 50, rotation: 0 },
          content: `<p style="font-size: 18px; font-weight: 600; text-align: center; color: ${bodyColor};">— Dieter Rams, Ten Principles for Good Design</p>`,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'timeline') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">Project Milestones & Roadmap</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 130, width: 260, height: 320, rotation: 0 },
          content: `
            <div style="border-left: 3px solid ${headingColor}; padding-left: 16px;">
              <h3 style="font-size: 20px; font-weight: bold; color: ${headingColor};">Phase 1: Q1</h3>
              <p style="font-size: 15px; color: ${bodyColor}; margin-top: 6px;">Research, engine prototyping, and architectural benchmarking.</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 350, y: 130, width: 260, height: 320, rotation: 0 },
          content: `
            <div style="border-left: 3px solid ${isDarkGradient ? '#38bdf8' : theme.accentColor}; padding-left: 16px;">
              <h3 style="font-size: 20px; font-weight: bold; color: ${headingColor};">Phase 2: Q2</h3>
              <p style="font-size: 15px; color: ${bodyColor}; margin-top: 6px;">Multi-format export pipeline and presentation presenter mode.</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 640, y: 130, width: 260, height: 320, rotation: 0 },
          content: `
            <div style="border-left: 3px solid #10b981; padding-left: 16px;">
              <h3 style="font-size: 20px; font-weight: bold; color: ${headingColor};">Phase 3: Q3</h3>
              <p style="font-size: 15px; color: ${bodyColor}; margin-top: 6px;">Collaborative workspaces and production release.</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'statistics') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">Key Performance Metrics</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 140, width: 260, height: 260, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="font-size: 52px; font-weight: 800; color: ${headingColor};">99.8%</h1>
              <p style="font-size: 16px; color: ${bodyColor}; margin-top: 8px;">Uptime & Reliability</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 350, y: 140, width: 260, height: 260, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="font-size: 52px; font-weight: 800; color: ${isDarkGradient ? '#38bdf8' : theme.accentColor};">&lt;50ms</h1>
              <p style="font-size: 16px; color: ${bodyColor}; margin-top: 8px;">Keystroke Latency</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 640, y: 140, width: 260, height: 260, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="font-size: 52px; font-weight: 800; color: #10b981;">10+</h1>
              <p style="font-size: 16px; color: ${bodyColor}; margin-top: 8px;">Export Formats</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'closing') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 100, y: 160, width: 760, height: 100, rotation: 0 },
          content: `<h1 style="font-size: 46px; font-weight: bold; color: ${headingColor}; text-align: center;">Thank You!</h1>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 100, y: 280, width: 760, height: 60, rotation: 0 },
          content: `<p style="font-size: 22px; text-align: center; color: ${bodyColor};">Questions & Open Discussion</p>`,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    }

    return {
      id,
      title: layout.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      layout,
      elements,
      speakerNotes: 'Slide notes for presenter guidance.',
      background: gradient ? undefined : theme.backgroundColor,
      gradient: gradient,
      gradientDirection: '135deg',
      transition: 'fade',
      hidden: false,
    };
  }

  /**
   * Reorder slides in presentation
   */
  static moveSlide(slides: Slide[], fromIndex: number, toIndex: number): Slide[] {
    if (fromIndex < 0 || fromIndex >= slides.length || toIndex < 0 || toIndex >= slides.length) {
      return slides;
    }
    const copy = [...slides];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    return copy;
  }
}
