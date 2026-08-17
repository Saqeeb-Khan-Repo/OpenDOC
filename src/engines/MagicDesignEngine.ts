import { PageSettings, Slide } from './types';

export interface DesignPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  primaryColor: string;
  headingFont: string;
  bodyFont: string;
  borderStyle?: 'solid' | 'double' | 'dashed' | 'ridge';
  borderWidth?: number;
  borderColor?: string;
  backgroundGradient?: string;
  accentBg?: string;
}

export const MAGIC_DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'md_professional',
    name: 'Executive Professional',
    category: 'Corporate',
    description: 'Crisp typography with deep navy accents, double borders, and structured hierarchy.',
    primaryColor: '#1e3a8a',
    headingFont: 'Georgia, serif',
    bodyFont: 'Inter, sans-serif',
    borderStyle: 'double',
    borderWidth: 4,
    borderColor: '#1e3a8a',
    backgroundGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
    accentBg: '#f8fafc',
  },
  {
    id: 'md_modern_saas',
    name: 'Modern Tech & SaaS',
    category: 'Technology',
    description: 'Clean sans-serif fonts, vibrant blue highlights, and minimal card framing.',
    primaryColor: '#2563eb',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundGradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    accentBg: '#eff6ff',
  },
  {
    id: 'md_academic',
    name: 'Academic Research IEEE',
    category: 'Academic',
    description: 'Formal serif typography, two-column layouts, and understated framing.',
    primaryColor: '#334155',
    headingFont: 'Times New Roman, serif',
    bodyFont: 'Times New Roman, serif',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#94a3b8',
    backgroundGradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    accentBg: '#ffffff',
  },
  {
    id: 'md_creative_bold',
    name: 'Creative Studio Bold',
    category: 'Creative',
    description: 'High-contrast emerald, warm amber, and expressive serif headings.',
    primaryColor: '#059669',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Inter, sans-serif',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: '#059669',
    backgroundGradient: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
    accentBg: '#ecfdf5',
  },
  {
    id: 'md_minimal_mono',
    name: 'Minimal Nordic Mono',
    category: 'Minimal',
    description: 'Generous whitespace, refined mono accents, and subtle borders.',
    primaryColor: '#09090b',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#71717a',
    backgroundGradient: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
    accentBg: '#fafafa',
  },
  {
    id: 'md_midnight_dark',
    name: 'Midnight Premium Dark',
    category: 'Dark',
    description: 'Sleek dark theme with violet illumination and modern borders.',
    primaryColor: '#a855f7',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    borderStyle: 'ridge',
    borderWidth: 3,
    borderColor: '#7c3aed',
    backgroundGradient: 'linear-gradient(135deg, #4c1d95 0%, #0f172a 100%)',
    accentBg: '#090d16',
  },
];

export class MagicDesignEngine {
  static getPresets(): DesignPreset[] {
    return MAGIC_DESIGN_PRESETS;
  }

  static applyToDocumentSettings(current: PageSettings, preset: DesignPreset): PageSettings {
    return {
      ...current,
      border: preset.borderStyle ? {
        enabled: true,
        style: preset.borderStyle,
        width: preset.borderWidth || 2,
        color: preset.borderColor || preset.primaryColor,
        inset: 16,
        applyTo: 'all',
      } : current.border,
    };
  }

  static applyToPresentation(slides: Slide[], preset: DesignPreset): Slide[] {
    return slides.map((slide, idx) => ({
      ...slide,
      gradient: preset.backgroundGradient,
      gradientDirection: 'to bottom right',
    }));
  }
}
