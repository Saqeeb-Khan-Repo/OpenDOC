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
  // ── 1. PROFESSIONAL ────────────────────────────────────────────────────────
  {
    id: 'professional',
    name: 'Executive',
    category: 'professional',
    description: 'Crisp navy & slate palette with sharp typography for executive board decks',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#1E3A8A',
    secondaryColor: '#3B82F6',
    accentColor: '#0284C7',
    textColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    cardBackground: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    category: 'professional',
    description: 'Authoritative steel blue & charcoal enterprise finish with structured cards',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#0369A1',
    secondaryColor: '#0284C7',
    accentColor: '#38BDF8',
    textColor: '#1E293B',
    backgroundColor: '#F0F9FF',
    cardBackground: '#FFFFFF',
    borderColor: '#BAE6FD',
  },
  {
    id: 'boardroom',
    name: 'Boardroom',
    category: 'professional',
    description: 'Deep navy, slate and gold accents for high-stakes leadership presentations',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#0F172A',
    secondaryColor: '#334155',
    accentColor: '#D97706',
    textColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  {
    id: 'business-pro',
    name: 'Business Pro',
    category: 'professional',
    description: 'Classic royal blue with structured data layouts and crisp metrics presentation',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#2563EB',
    secondaryColor: '#4F46E5',
    accentColor: '#06B6D4',
    textColor: '#1E293B',
    backgroundColor: '#F8FAFC',
    cardBackground: '#FFFFFF',
    borderColor: '#DBEAFE',
  },
  {
    id: 'consulting',
    name: 'Consulting',
    category: 'professional',
    description: 'Refined charcoal and cyan accents designed for strategic analysis decks',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#334155',
    secondaryColor: '#0284C7',
    accentColor: '#0EA5E9',
    textColor: '#0F172A',
    backgroundColor: '#F8FAFC',
    cardBackground: '#FFFFFF',
    borderColor: '#E2E8F0',
  },

  // ── 2. MODERN ──────────────────────────────────────────────────────────────
  {
    id: 'minimal',
    name: 'Modern Minimal',
    category: 'modern',
    description: 'Monochrome aesthetic with spacious editorial layout and high contrast',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#18181B',
    secondaryColor: '#71717A',
    accentColor: '#27272A',
    textColor: '#09090B',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F4F4F5',
    borderColor: '#E4E4E7',
  },
  {
    id: 'clean-studio',
    name: 'Clean Studio',
    category: 'modern',
    description: 'Pure white canvas with subtle slate borders and ultra-clean typography',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#0F172A',
    secondaryColor: '#64748B',
    accentColor: '#3B82F6',
    textColor: '#1E293B',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  {
    id: 'modern',
    name: 'Neo Modern',
    category: 'modern',
    description: 'Vibrant indigo & sky accents with bold contemporary visual hierarchy',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#4F46E5',
    secondaryColor: '#06B6D4',
    accentColor: '#38BDF8',
    textColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F8FAFC',
    borderColor: '#E0E7FF',
  },
  {
    id: 'soft-modern',
    name: 'Soft Modern',
    category: 'modern',
    description: 'Gentle pastel undertones with rounded cards and relaxed modern typography',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#4338CA',
    secondaryColor: '#818CF8',
    accentColor: '#A5B4FC',
    textColor: '#1E1B4B',
    backgroundColor: '#EEF2FF',
    cardBackground: '#FFFFFF',
    borderColor: '#E0E7FF',
  },
  {
    id: 'contemporary',
    name: 'Contemporary',
    category: 'modern',
    description: 'Teal and graphite contemporary styling with sharp modern geometry',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#0D9488',
    secondaryColor: '#14B8A6',
    accentColor: '#2DD4BF',
    textColor: '#134E4A',
    backgroundColor: '#F0FDFA',
    cardBackground: '#FFFFFF',
    borderColor: '#CCFBF1',
  },

  // ── 3. CREATIVE ────────────────────────────────────────────────────────────
  {
    id: 'creative',
    name: 'Creative Studio',
    category: 'creative',
    description: 'Warm coral, crimson & amber for engaging storytelling and pitch decks',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#E11D48',
    secondaryColor: '#F59E0B',
    accentColor: '#FB7185',
    textColor: '#1C1917',
    backgroundColor: '#FFF1F2',
    cardBackground: '#FFFFFF',
    borderColor: '#FECDD3',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    category: 'creative',
    description: 'Magazine-quality serif headlines with stylish asymmetric card balancing',
    headingFont: 'Playfair Display',
    bodyFont: 'Georgia',
    primaryColor: '#881337',
    secondaryColor: '#BE123C',
    accentColor: '#FB7185',
    textColor: '#4C0519',
    backgroundColor: '#FFF1F2',
    cardBackground: '#FFFFFF',
    borderColor: '#FFE4E6',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    category: 'creative',
    description: 'Dynamic fuchsia and purple accents designed for creative showcases',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#C026D3',
    secondaryColor: '#9333EA',
    accentColor: '#F472B6',
    textColor: '#3B0764',
    backgroundColor: '#FAF5FF',
    cardBackground: '#FFFFFF',
    borderColor: '#F3E8FF',
  },
  {
    id: 'magazine',
    name: 'Magazine',
    category: 'creative',
    description: 'High-contrast typography inspired by leading fashion and design publications',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    primaryColor: '#18181B',
    secondaryColor: '#E11D48',
    accentColor: '#F43F5E',
    textColor: '#18181B',
    backgroundColor: '#FAFAFA',
    cardBackground: '#FFFFFF',
    borderColor: '#E4E4E7',
  },
  {
    id: 'artistic',
    name: 'Artistic',
    category: 'creative',
    description: 'Warm terracotta and amber tones for design showcases and storytelling',
    headingFont: 'Playfair Display',
    bodyFont: 'Georgia',
    primaryColor: '#C2410C',
    secondaryColor: '#EA580C',
    accentColor: '#FB923C',
    textColor: '#431407',
    backgroundColor: '#FFF7ED',
    cardBackground: '#FFFFFF',
    borderColor: '#FFEDD5',
  },

  // ── 4. TECHNOLOGY ──────────────────────────────────────────────────────────
  {
    id: 'technology',
    name: 'Tech Matrix',
    category: 'technology',
    description: 'High-tech monospace accents with cyan, teal & neon highlights for engineering',
    headingFont: 'JetBrains Mono',
    bodyFont: 'Inter',
    primaryColor: '#06B6D4',
    secondaryColor: '#10B981',
    accentColor: '#22D3EE',
    textColor: '#F0FDFA',
    backgroundColor: '#04121A',
    cardBackground: '#08202E',
    borderColor: '#155E75',
  },
  {
    id: 'ai-future',
    name: 'AI Future',
    category: 'technology',
    description: 'Electric violet & blue glow designed for AI, ML and future-tech presentations',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#8B5CF6',
    secondaryColor: '#6366F1',
    accentColor: '#A78BFA',
    textColor: '#F8FAFC',
    backgroundColor: '#0B0F19',
    cardBackground: '#131A2B',
    borderColor: '#2E3856',
  },
  {
    id: 'digital',
    name: 'Digital Core',
    category: 'technology',
    description: 'Emerald green terminal aesthetics for security and cloud infrastructure',
    headingFont: 'JetBrains Mono',
    bodyFont: 'Inter',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    accentColor: '#34D399',
    textColor: '#ECFDF5',
    backgroundColor: '#021A12',
    cardBackground: '#062B1E',
    borderColor: '#047857',
  },
  {
    id: 'cyber',
    name: 'Cyber Neon',
    category: 'technology',
    description: 'High-energy magenta and cyan cyber aesthetic for gaming and tech keynotes',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#06B6D4',
    secondaryColor: '#F43F5E',
    accentColor: '#38BDF8',
    textColor: '#F8FAFC',
    backgroundColor: '#050814',
    cardBackground: '#0D1326',
    borderColor: '#1E293B',
  },
  {
    id: 'startup',
    name: 'Startup Velocity',
    category: 'technology',
    description: 'Fast-paced purple and electric blue styling tailored for tech seed pitches',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#6366F1',
    secondaryColor: '#3B82F6',
    accentColor: '#818CF8',
    textColor: '#0F172A',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F8FAFC',
    borderColor: '#E0E7FF',
  },

  // ── 5. PREMIUM ─────────────────────────────────────────────────────────────
  {
    id: 'luxury',
    name: 'Luxury Gold',
    category: 'premium',
    description: 'Opulent obsidian and burnished gold for executive luxury presentations',
    headingFont: 'Playfair Display',
    bodyFont: 'Georgia',
    primaryColor: '#D97706',
    secondaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    textColor: '#FEF3C7',
    backgroundColor: '#0C0A09',
    cardBackground: '#1C1917',
    borderColor: '#44403C',
  },
  {
    id: 'elegant',
    name: 'Emerald Elegance',
    category: 'premium',
    description: 'Rich emerald, deep forest & warm gold luxury system with serif elegance',
    headingFont: 'Playfair Display',
    bodyFont: 'Georgia',
    primaryColor: '#064E3B',
    secondaryColor: '#059669',
    accentColor: '#D97706',
    textColor: '#064E3B',
    backgroundColor: '#F0FDF4',
    cardBackground: '#FFFFFF',
    borderColor: '#BBF7D0',
  },
  {
    id: 'black-gold',
    name: 'Black & Gold',
    category: 'premium',
    description: 'Ultra-refined black tie aesthetic with champagne metallic highlights',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    primaryColor: '#EAB308',
    secondaryColor: '#CA8A04',
    accentColor: '#FDE047',
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
    cardBackground: '#121212',
    borderColor: '#27272A',
  },
  {
    id: 'dark',
    name: 'Dark Obsidian',
    category: 'premium',
    description: 'Deep contrast zinc & obsidian with electric glow and illuminated elements',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#60A5FA',
    secondaryColor: '#818CF8',
    accentColor: '#A78BFA',
    textColor: '#F8FAFC',
    backgroundColor: '#090D16',
    cardBackground: '#131B2E',
    borderColor: '#1E293B',
  },
  {
    id: 'gradient',
    name: 'Cosmic Glass',
    category: 'premium',
    description: 'Dynamic cosmic gradient with luminous typography and glowing glass cards',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#A855F7',
    secondaryColor: '#EC4899',
    accentColor: '#38BDF8',
    textColor: '#F8FAFC',
    backgroundColor: '#0F172A',
    gradientBackground: 'linear-gradient(135deg, #1E1B4B 0%, #31104B 50%, #0F172A 100%)',
    cardBackground: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // ── 6. ACADEMIC ────────────────────────────────────────────────────────────
  {
    id: 'academic',
    name: 'Academic Research',
    category: 'academic',
    description: 'Classic serif typography with burgundy & parchment styling for papers',
    headingFont: 'Merriweather',
    bodyFont: 'Georgia',
    primaryColor: '#7C2D12',
    secondaryColor: '#B45309',
    accentColor: '#D97706',
    textColor: '#292524',
    backgroundColor: '#FFFBEB',
    cardBackground: '#FFFFFF',
    borderColor: '#FDE68A',
  },
  {
    id: 'thesis',
    name: 'Scientific Thesis',
    category: 'academic',
    description: 'Formal serif structure tailored for dissertation defense and scientific findings',
    headingFont: 'Merriweather',
    bodyFont: 'Georgia',
    primaryColor: '#1E3A8A',
    secondaryColor: '#1E40AF',
    accentColor: '#2563EB',
    textColor: '#1E293B',
    backgroundColor: '#FFFFFF',
    cardBackground: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  {
    id: 'education',
    name: 'Education Prime',
    category: 'academic',
    description: 'Inviting navy and emerald tones ideal for university and classroom lectures',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#065F46',
    secondaryColor: '#047857',
    accentColor: '#059669',
    textColor: '#064E3B',
    backgroundColor: '#F0FDF4',
    cardBackground: '#FFFFFF',
    borderColor: '#BBF7D0',
  },
  {
    id: 'clean-report',
    name: 'Clean Report',
    category: 'academic',
    description: 'Crisp grid typography designed for quantitative research and annual reports',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    primaryColor: '#1F2937',
    secondaryColor: '#4B5563',
    accentColor: '#2563EB',
    textColor: '#111827',
    backgroundColor: '#F9FAFB',
    cardBackground: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  {
    id: 'scholar',
    name: 'Scholar Heritage',
    category: 'academic',
    description: 'Distinguished oxford navy and crimson tones with classical serif typography',
    headingFont: 'Merriweather',
    bodyFont: 'Georgia',
    primaryColor: '#1E293B',
    secondaryColor: '#991B1B',
    accentColor: '#B91C1C',
    textColor: '#1E293B',
    backgroundColor: '#FFFDF9',
    cardBackground: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
];

export class PresentationEngine {
  /**
   * Look up a theme by ID or return default
   */
  static getThemeById(id: string): SlideTheme {
    return PRESENTATION_THEMES.find(t => t.id === id) || PRESENTATION_THEMES[0];
  }

  /**
   * Apply a theme across all slides non-destructively preserving all text, positions, shapes and images
   */
  static applyThemeToSlides(slides: Slide[], theme: SlideTheme): Slide[] {
    return slides.map(slide => {
      const isGradient = !!theme.gradientBackground;
      const updatedElements = slide.elements.map(el => {
        if (el.type === 'text') {
          const isHeading = el.content?.includes('<h1') || el.content?.includes('<h2') || el.content?.includes('<h3');
          const newFont = isHeading ? theme.headingFont : theme.bodyFont;
          return {
            ...el,
            style: {
              ...el.style,
              fontFamily: newFont,
              color: el.style?.color || theme.textColor,
            },
          };
        }
        if (el.type === 'shape' && el.style) {
          return {
            ...el,
            style: {
              ...el.style,
              stroke: el.style.stroke || theme.borderColor,
            },
          };
        }
        return el;
      });

      return {
        ...slide,
        background: isGradient ? undefined : theme.backgroundColor,
        gradient: isGradient ? theme.gradientBackground : undefined,
        elements: updatedElements,
      };
    });
  }

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
    layout: SlideLayout | string = 'title-content',
    theme: SlideTheme = PRESENTATION_THEMES[0],
    gradient?: string,
    customTitle?: string
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
    const accentColor = isDarkGradient ? '#38bdf8' : theme.accentColor;

    if (layout === 'title' || layout === 'project-cover') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 150, width: 800, height: 120, rotation: 0 },
          content: `<h1 style="font-size: 42px; font-weight: 800; color: ${headingColor}; text-align: center; line-height: 1.2;">${customTitle || 'Project Presentation Title'}</h1>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 120, y: 290, width: 720, height: 60, rotation: 0 },
          content: `<p style="font-size: 20px; color: ${bodyColor}; opacity: 0.9; text-align: center;">Team: Engineering &amp; Computer Science | Guide: Prof. Academic Mentor</p>`,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 440, y: 380, width: 80, height: 4, rotation: 0 },
          style: { fill: accentColor },
        })
      );
    } else if (layout === 'title-content' || layout === 'project-problem') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Problem Statement & Motivation'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 840, height: 360, rotation: 0 },
          content: `
            <ul style="font-size: 18px; line-height: 2.0; color: ${bodyColor};">
              <li><strong>Current Bottleneck:</strong> Inefficient legacy pipelines create high cognitive load and typing lag.</li>
              <li><strong>Critical Gap:</strong> Lack of unified mobile-responsive and offline-first document suites.</li>
              <li><strong>Proposed Solution:</strong> Modular vector rendering engine with instant asynchronous processing.</li>
              <li><strong>Target Impact:</strong> 10x throughput enhancement with zero backend database dependencies.</li>
            </ul>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'project-architecture' || layout === 'diagram') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'System Architecture Overview'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        // Tier 1: Frontend
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 80, y: 150, width: 220, height: 80, rotation: 0 },
          style: { fill: isDarkGradient ? 'rgba(56,189,248,0.15)' : '#eff6ff', stroke: '#3b82f6', strokeWidth: 2, cornerRadius: 8 },
          content: '<div style="text-align:center; padding:12px;"><strong style="color:#2563eb; font-size:16px;">Client Tier</strong><p style="font-size:12px; margin-top:2px;">React + TipTap + Canvas</p></div>'
        }),
        // Tier 2: Engines
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 370, y: 150, width: 220, height: 80, rotation: 0 },
          style: { fill: isDarkGradient ? 'rgba(16,185,129,0.15)' : '#f0fdf4', stroke: '#10b981', strokeWidth: 2, cornerRadius: 8 },
          content: '<div style="text-align:center; padding:12px;"><strong style="color:#059669; font-size:16px;">Processing Tier</strong><p style="font-size:12px; margin-top:2px;">Web Workers + Layout Engine</p></div>'
        }),
        // Tier 3: Storage
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 660, y: 150, width: 220, height: 80, rotation: 0 },
          style: { fill: isDarkGradient ? 'rgba(139,92,246,0.15)' : '#faf5ff', stroke: '#8b5cf6', strokeWidth: 2, cornerRadius: 8 },
          content: '<div style="text-align:center; padding:12px;"><strong style="color:#7c3aed; font-size:16px;">Storage Tier</strong><p style="font-size:12px; margin-top:2px;">IndexedDB + LocalStorage</p></div>'
        }),
        // Arrows
        ElementEngine.createElement('shape', {
          shapeType: 'arrow-right',
          transform: { x: 310, y: 175, width: 50, height: 30, rotation: 0 },
          style: { fill: accentColor }
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'arrow-right',
          transform: { x: 600, y: 175, width: 50, height: 30, rotation: 0 },
          style: { fill: accentColor }
        }),
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 280, width: 800, height: 180, rotation: 0 },
          content: `
            <p style="font-size: 16px; line-height: 1.8; color: ${bodyColor};">
              The architecture decouples UI interaction from heavy compute through off-thread Web Workers. All document data is persisted locally with zero database requirements.
            </p>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'two-columns' || layout === 'comparison') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Existing vs. Proposed System'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 400, height: 360, rotation: 0 },
          content: `
            <div style="background: ${isDarkGradient ? 'rgba(239,68,68,0.1)' : '#fef2f2'}; border: 1px solid #ef4444; border-radius: 8px; padding: 16px; height: 100%;">
              <h3 style="font-size: 20px; font-weight: 700; color: #dc2626; margin-bottom: 12px;">Existing System</h3>
              <ul style="font-size: 15px; line-height: 1.8; color: ${bodyColor};">
                <li>Mandatory server authentication</li>
                <li>Synchronous image compression lag</li>
                <li>Compressed desktop UI on mobile</li>
                <li>Lossy PDF export formatting</li>
              </ul>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 500, y: 120, width: 400, height: 360, rotation: 0 },
          content: `
            <div style="background: ${isDarkGradient ? 'rgba(16,185,129,0.1)' : '#f0fdf4'}; border: 1px solid #10b981; border-radius: 8px; padding: 16px; height: 100%;">
              <h3 style="font-size: 20px; font-weight: 700; color: #059669; margin-bottom: 12px;">Proposed System</h3>
              <ul style="font-size: 15px; line-height: 1.8; color: ${bodyColor};">
                <li>100% Local-first with IndexedDB</li>
                <li>Instant non-blocking Web Worker ingestion</li>
                <li>Canva-style touch responsive canvas</li>
                <li>Strict A4 vector multi-page export</li>
              </ul>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'project-techstack') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Technology Stack'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 840, height: 360, rotation: 0 },
          content: `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
              <div style="padding: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.05);">
                <strong style="color: ${accentColor}; font-size: 16px;">Frontend Core</strong>
                <p style="font-size: 14px; margin-top: 6px; color: ${bodyColor};">React 18, TypeScript, TailwindCSS, Lucide Icons</p>
              </div>
              <div style="padding: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.05);">
                <strong style="color: #10b981; font-size: 16px;">Rich Text &amp; Canvas</strong>
                <p style="font-size: 14px; margin-top: 6px; color: ${bodyColor};">TipTap ProseMirror, KaTeX, OffscreenCanvas</p>
              </div>
              <div style="padding: 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.05);">
                <strong style="color: #8b5cf6; font-size: 16px;">Export &amp; Storage</strong>
                <p style="font-size: 14px; margin-top: 6px; color: ${bodyColor};">PDF-Lib, HTML2PDF, IndexedDB, Web Workers</p>
              </div>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'project-screenshots') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Implementation & Screenshots'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 60, y: 120, width: 400, height: 260, rotation: 0 },
          style: { fill: 'rgba(255,255,255,0.08)', stroke: accentColor, strokeWidth: 1, cornerRadius: 8 },
          content: '<div style="text-align:center; padding-top:100px; color:#94a3b8; font-size:14px;">[ Screenshot 1: Desktop Workspace ]</div>'
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 500, y: 120, width: 400, height: 260, rotation: 0 },
          style: { fill: 'rgba(255,255,255,0.08)', stroke: accentColor, strokeWidth: 1, cornerRadius: 8 },
          content: '<div style="text-align:center; padding-top:100px; color:#94a3b8; font-size:14px;">[ Screenshot 2: Mobile Touch Editor ]</div>'
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 400, width: 840, height: 60, rotation: 0 },
          content: `<p style="font-size: 15px; color: ${bodyColor}; text-align: center;">Live demonstration showing dual workspace modes with instant document updates.</p>`,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'statistics' || layout === 'project-results') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Key Results & Performance Benchmarks'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 140, width: 260, height: 260, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="font-size: 48px; font-weight: 800; color: ${headingColor};">&lt; 2ms</h1>
              <p style="font-size: 15px; color: ${bodyColor}; margin-top: 8px;">Image Preview Ingestion</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 350, y: 140, width: 260, height: 260, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="font-size: 48px; font-weight: 800; color: ${accentColor};">60 FPS</h1>
              <p style="font-size: 15px; color: ${bodyColor}; margin-top: 8px;">Smooth Canvas Dragging</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 640, y: 140, width: 260, height: 260, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
              <h1 style="font-size: 48px; font-weight: 800; color: #10b981;">0 ms</h1>
              <p style="font-size: 15px; color: ${bodyColor}; margin-top: 8px;">Typing Lag Under Stress</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'split-screen') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 60, width: 400, height: 420, rotation: 0 },
          content: `
            <h2 style="font-size: 32px; font-weight: 800; color: ${headingColor}; line-height: 1.2; margin-bottom: 16px;">${customTitle || 'Strategic Impact & Direct Solutions'}</h2>
            <p style="font-size: 16px; line-height: 1.8; color: ${bodyColor}; opacity: 0.9; margin-bottom: 16px;">
              Deliver high precision workflows through modern vector rendering and zero-latency local computation.
            </p>
            <ul style="font-size: 15px; line-height: 2.0; color: ${bodyColor};">
              <li>Instant responsive canvas transformation</li>
              <li>Complete multi-device synchronization</li>
              <li>Pure local-first persistence guarantee</li>
            </ul>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 500, y: 60, width: 400, height: 420, rotation: 0 },
          style: { fill: theme.cardBackground || 'rgba(255,255,255,0.06)', stroke: theme.borderColor || accentColor, strokeWidth: 1, cornerRadius: 16 },
          content: `
            <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 24px;">
              <div style="height: 64px; width: 64px; border-radius: 50%; background: ${accentColor}20; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 28px; color: ${accentColor};">★</span>
              </div>
              <strong style="font-size: 22px; color: ${headingColor}; margin-bottom: 8px;">Key Metric Highlight</strong>
              <p style="font-size: 14px; color: ${bodyColor}; max-width: 280px; opacity: 0.85;">High visual impact balanced composition for presentations.</p>
            </div>
          `
        })
      );
    } else if (layout === 'title-image' || layout === 'image-text') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 50, width: 440, height: 440, rotation: 0 },
          content: `
            <h2 style="font-size: 32px; font-weight: bold; color: ${headingColor}; margin-bottom: 16px;">${customTitle || 'Visual Feature Spotlight'}</h2>
            <p style="font-size: 16px; line-height: 1.8; color: ${bodyColor};">
              Pair meaningful copy with visual assets. Replace this card with your uploaded diagram or high-resolution photo.
            </p>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 520, y: 50, width: 380, height: 440, rotation: 0 },
          style: { fill: 'rgba(255,255,255,0.08)', stroke: accentColor, strokeWidth: 1, cornerRadius: 12 },
          content: '<div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 14px;">[ Visual Image / Asset Area ]</div>'
        })
      );
    } else if (layout === 'three-cards') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 30, width: 840, height: 50, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor}; text-align: center;">${customTitle || 'Core Value Pillars'}</h2>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 100, width: 260, height: 380, rotation: 0 },
          content: `
            <div style="height: 100%; padding: 20px; border-radius: 12px; background: ${theme.cardBackground || 'rgba(255,255,255,0.06)'}; border: 1px solid ${theme.borderColor || 'rgba(255,255,255,0.1)'};">
              <span style="font-size: 28px; color: ${theme.primaryColor}; font-weight: bold; display: block; margin-bottom: 8px;">01</span>
              <h3 style="font-size: 18px; font-weight: 700; color: ${headingColor}; margin-bottom: 8px;">Performance</h3>
              <p style="font-size: 14px; line-height: 1.6; color: ${bodyColor};">Immediate client-side computation with sub-millisecond execution.</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 350, y: 100, width: 260, height: 380, rotation: 0 },
          content: `
            <div style="height: 100%; padding: 20px; border-radius: 12px; background: ${theme.cardBackground || 'rgba(255,255,255,0.06)'}; border: 1px solid ${theme.borderColor || 'rgba(255,255,255,0.1)'};">
              <span style="font-size: 28px; color: ${accentColor}; font-weight: bold; display: block; margin-bottom: 8px;">02</span>
              <h3 style="font-size: 18px; font-weight: 700; color: ${headingColor}; margin-bottom: 8px;">Simplicity</h3>
              <p style="font-size: 14px; line-height: 1.6; color: ${bodyColor};">Distraction-free interface designed for speed and rapid editing.</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 640, y: 100, width: 260, height: 380, rotation: 0 },
          content: `
            <div style="height: 100%; padding: 20px; border-radius: 12px; background: ${theme.cardBackground || 'rgba(255,255,255,0.06)'}; border: 1px solid ${theme.borderColor || 'rgba(255,255,255,0.1)'};">
              <span style="font-size: 28px; color: ${theme.secondaryColor || '#10b981'}; font-weight: bold; display: block; margin-bottom: 8px;">03</span>
              <h3 style="font-size: 18px; font-weight: 700; color: ${headingColor}; margin-bottom: 8px;">Privacy</h3>
              <p style="font-size: 14px; line-height: 1.6; color: ${bodyColor};">100% Local-first data architecture with zero tracking or telemetry.</p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'process' || layout === 'timeline') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 50, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Execution Process Flow'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        // Step 1
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 60, y: 150, width: 180, height: 180, rotation: 0 },
          style: { fill: theme.cardBackground || 'rgba(255,255,255,0.06)', stroke: theme.primaryColor, strokeWidth: 2, cornerRadius: 12 },
          content: `<div style="padding: 16px; text-align: center;"><strong style="color: ${theme.primaryColor}; font-size: 20px; display: block;">Step 1</strong><p style="font-size: 13px; color: ${bodyColor}; margin-top: 8px;">Discovery &amp; Research</p></div>`
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'arrow-right',
          transform: { x: 245, y: 225, width: 30, height: 24, rotation: 0 },
          style: { fill: accentColor }
        }),
        // Step 2
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 280, y: 150, width: 180, height: 180, rotation: 0 },
          style: { fill: theme.cardBackground || 'rgba(255,255,255,0.06)', stroke: accentColor, strokeWidth: 2, cornerRadius: 12 },
          content: `<div style="padding: 16px; text-align: center;"><strong style="color: ${accentColor}; font-size: 20px; display: block;">Step 2</strong><p style="font-size: 13px; color: ${bodyColor}; margin-top: 8px;">Architecture Design</p></div>`
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'arrow-right',
          transform: { x: 465, y: 225, width: 30, height: 24, rotation: 0 },
          style: { fill: accentColor }
        }),
        // Step 3
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 500, y: 150, width: 180, height: 180, rotation: 0 },
          style: { fill: theme.cardBackground || 'rgba(255,255,255,0.06)', stroke: theme.secondaryColor || '#10b981', strokeWidth: 2, cornerRadius: 12 },
          content: `<div style="padding: 16px; text-align: center;"><strong style="color: ${theme.secondaryColor || '#10b981'}; font-size: 20px; display: block;">Step 3</strong><p style="font-size: 13px; color: ${bodyColor}; margin-top: 8px;">Rapid Build</p></div>`
        }),
        ElementEngine.createElement('shape', {
          shapeType: 'arrow-right',
          transform: { x: 685, y: 225, width: 30, height: 24, rotation: 0 },
          style: { fill: accentColor }
        }),
        // Step 4
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 720, y: 150, width: 180, height: 180, rotation: 0 },
          style: { fill: theme.cardBackground || 'rgba(255,255,255,0.06)', stroke: '#10b981', strokeWidth: 2, cornerRadius: 12 },
          content: '<div style="padding: 16px; text-align: center;"><strong style="color: #10b981; font-size: 20px; display: block;">Step 4</strong><p style="font-size: 13px; color: #10b981; margin-top: 8px;">Launch &amp; Scale</p></div>'
        })
      );
    } else if (layout === 'quote') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 120, width: 800, height: 240, rotation: 0 },
          content: `
            <div style="text-align: center; padding: 24px;">
              <span style="font-size: 64px; line-height: 1; color: ${accentColor}; font-family: Georgia, serif; display: block;">“</span>
              <p style="font-size: 28px; font-weight: 600; line-height: 1.4; color: ${headingColor}; margin-top: -20px; font-style: italic;">
                ${customTitle || 'Simplicity is about subtracting the obvious and adding the meaningful.'}
              </p>
              <p style="font-size: 18px; color: ${bodyColor}; opacity: 0.8; margin-top: 20px; font-weight: bold;">
                — John Maeda, The Laws of Simplicity
              </p>
            </div>
          `,
          style: { fontFamily: theme.bodyFont, textAlign: 'center' },
        })
      );
    } else if (layout === 'conclusion' || layout === 'closing' || layout === 'project-conclusion') {
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 80, width: 800, height: 80, rotation: 0 },
          content: `<h1 style="font-size: 38px; font-weight: 800; color: ${headingColor}; text-align: center;">${customTitle || 'Summary & Key Takeaways'}</h1>`,
          style: { fontFamily: theme.headingFont, textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 100, y: 180, width: 760, height: 260, rotation: 0 },
          content: `
            <div style="padding: 24px; border-radius: 16px; background: ${theme.cardBackground || 'rgba(255,255,255,0.06)'}; border: 1px solid ${theme.borderColor || 'rgba(255,255,255,0.1)'};">
              <ul style="font-size: 18px; line-height: 2.2; color: ${bodyColor};">
                <li>✓ <strong>Engineered for Speed:</strong> 10x faster authoring without cloud friction.</li>
                <li>✓ <strong>Reliable Vector Quality:</strong> Sharp typography and Canva-grade visual layouts.</li>
                <li>✓ <strong>100% Ownership:</strong> All documents remain private and stored in your browser.</li>
              </ul>
            </div>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    } else if (layout === 'blank') {
      // Clean blank canvas
    } else {
      // Default Title + Content
      elements.push(
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 40, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 28px; font-weight: bold; color: ${headingColor};">${customTitle || 'Slide Heading'}</h2>`,
          style: { fontFamily: theme.headingFont },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 120, width: 840, height: 360, rotation: 0 },
          content: `
            <p style="font-size: 18px; line-height: 1.8; color: ${bodyColor};">
              Type your slide content here. Double-click any element to edit text directly or drag to reposition.
            </p>
          `,
          style: { fontFamily: theme.bodyFont },
        })
      );
    }

    return {
      id,
      title: customTitle || layout.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      layout: layout as SlideLayout,
      elements,
      speakerNotes: 'Speaker notes for presenter guidance.',
      background: gradient ? undefined : theme.backgroundColor,
      gradient: gradient,
      gradientDirection: '135deg',
      transition: 'fade',
      hidden: false,
    };
  }

  /**
   * Generate an entire Academic / Software Engineering Project Presentation Deck (12 Slides)
   */
  static createProjectDeck(
    projectTitle: string = 'Autonomous Intelligent Document Studio',
    teamName: string = 'Team DocProEditor',
    theme: SlideTheme = PRESENTATION_THEMES[0],
    gradient: string = PRESENTATION_GRADIENTS[0].gradient
  ): Slide[] {
    const slides: Slide[] = [];

    // 1. Cover
    slides.push(this.createSlide('project-cover', theme, gradient, projectTitle));
    // 2. Problem Statement
    slides.push(this.createSlide('project-problem', theme, gradient, 'Problem Statement & Motivation'));
    // 3. Objectives
    slides.push(this.createSlide('title-content', theme, gradient, 'Project Objectives'));
    // 4. Comparison
    slides.push(this.createSlide('comparison', theme, gradient, 'Existing vs. Proposed System'));
    // 5. System Architecture
    slides.push(this.createSlide('project-architecture', theme, gradient, 'System Architecture'));
    // 6. Technology Stack
    slides.push(this.createSlide('project-techstack', theme, gradient, 'Technology Stack & Tools'));
    // 7. Screenshots
    slides.push(this.createSlide('project-screenshots', theme, gradient, 'System Implementation & UI'));
    // 8. Results
    slides.push(this.createSlide('project-results', theme, gradient, 'Performance Results & Evaluation'));
    // 9. Advantages & Scope
    slides.push(this.createSlide('title-content', theme, gradient, 'Advantages & Future Scope'));
    // 10. Conclusion
    slides.push(this.createSlide('project-conclusion', theme, gradient, 'Conclusion & Q&A'));

    return slides;
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

  /**
   * Align multiple canvas elements
   */
  static alignElements(
    elements: CanvasElement[],
    selectedIds: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): CanvasElement[] {
    const targets = elements.filter(el => selectedIds.includes(el.id));
    if (targets.length < 2) return elements;

    let targetValue = 0;

    if (alignment === 'left') {
      targetValue = Math.min(...targets.map(el => el.transform.x));
      return elements.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, transform: { ...el.transform, x: targetValue } }
          : el
      );
    } else if (alignment === 'right') {
      targetValue = Math.max(...targets.map(el => el.transform.x + el.transform.width));
      return elements.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, transform: { ...el.transform, x: targetValue - el.transform.width } }
          : el
      );
    } else if (alignment === 'top') {
      targetValue = Math.min(...targets.map(el => el.transform.y));
      return elements.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, transform: { ...el.transform, y: targetValue } }
          : el
      );
    } else if (alignment === 'bottom') {
      targetValue = Math.max(...targets.map(el => el.transform.y + el.transform.height));
      return elements.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, transform: { ...el.transform, y: targetValue - el.transform.height } }
          : el
      );
    } else if (alignment === 'center') {
      const minX = Math.min(...targets.map(el => el.transform.x));
      const maxX = Math.max(...targets.map(el => el.transform.x + el.transform.width));
      const midX = (minX + maxX) / 2;
      return elements.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, transform: { ...el.transform, x: Math.round(midX - el.transform.width / 2) } }
          : el
      );
    } else if (alignment === 'middle') {
      const minY = Math.min(...targets.map(el => el.transform.y));
      const maxY = Math.max(...targets.map(el => el.transform.y + el.transform.height));
      const midY = (minY + maxY) / 2;
      return elements.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, transform: { ...el.transform, y: Math.round(midY - el.transform.height / 2) } }
          : el
      );
    }

    return elements;
  }

  /**
   * Apply Theme to all slides across the presentation
   */
  static applyThemeToAllSlides(slides: Slide[], theme: SlideTheme): Slide[] {
    return slides.map(slide => {
      const updatedElements = slide.elements.map(el => {
        if (el.type === 'text') {
          return {
            ...el,
            style: {
              ...el.style,
              fontFamily: theme.bodyFont,
              color: el.style?.color || theme.textColor,
            },
          };
        } else if (el.type === 'shape') {
          return {
            ...el,
            style: {
              ...el.style,
              fill: theme.primaryColor,
            },
          };
        }
        return el;
      });

      return {
        ...slide,
        background: theme.backgroundColor,
        gradient: undefined,
        elements: updatedElements,
      };
    });
  }

  /**
   * Apply Background or Gradient to all slides
   */
  static applyBackgroundToAllSlides(slides: Slide[], background?: string, gradient?: string): Slide[] {
    return slides.map(slide => ({
      ...slide,
      background: gradient ? undefined : (background || '#ffffff'),
      gradient: gradient || undefined,
    }));
  }

  /**
   * Apply Font to all slides (or specific roles: 'all' | 'headings' | 'body')
   */
  static applyFontToAllSlides(
    slides: Slide[],
    fontFamily: string,
    scope: 'all' | 'headings' | 'body' = 'all'
  ): Slide[] {
    return slides.map(slide => {
      const updatedElements = slide.elements.map(el => {
        if (el.type === 'text') {
          const isHeading = (el.content || '').includes('<h') || (el.transform.height > 60 && el.transform.y < 150);
          if (scope === 'headings' && !isHeading) return el;
          if (scope === 'body' && isHeading) return el;

          return {
            ...el,
            style: {
              ...el.style,
              fontFamily,
            },
          };
        }
        return el;
      });

      return {
        ...slide,
        elements: updatedElements,
      };
    });
  }

  /**
   * Apply Text Color to all slides
   */
  static applyTextColorToAllSlides(
    slides: Slide[],
    color: string,
    scope: 'all' | 'headings' | 'body' = 'all'
  ): Slide[] {
    return slides.map(slide => {
      const updatedElements = slide.elements.map(el => {
        if (el.type === 'text') {
          const isHeading = (el.content || '').includes('<h') || (el.transform.height > 60 && el.transform.y < 150);
          if (scope === 'headings' && !isHeading) return el;
          if (scope === 'body' && isHeading) return el;

          return {
            ...el,
            style: {
              ...el.style,
              color,
            },
          };
        }
        return el;
      });

      return {
        ...slide,
        elements: updatedElements,
      };
    });
  }
}
