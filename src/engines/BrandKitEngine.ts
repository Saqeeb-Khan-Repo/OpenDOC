export interface BrandKit {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  logoUrl?: string;
  tagline?: string;
}

export const DEFAULT_BRAND_KITS: BrandKit[] = [
  {
    id: 'bk_modern_tech',
    name: 'Modern Tech & SaaS',
    primaryColor: '#2563eb',
    secondaryColor: '#0f172a',
    accentColor: '#38bdf8',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    tagline: 'Empowering Next-Gen Digital Products',
  },
  {
    id: 'bk_corporate_navy',
    name: 'Corporate Executive Navy',
    primaryColor: '#1e3a8a',
    secondaryColor: '#334155',
    accentColor: '#b45309',
    headingFont: 'Georgia, serif',
    bodyFont: 'Inter, sans-serif',
    tagline: 'Strategic Leadership & Enterprise Value',
  },
  {
    id: 'bk_academic_indigo',
    name: 'Academic & Research Indigo',
    primaryColor: '#4338ca',
    secondaryColor: '#1e1b4b',
    accentColor: '#06b6d4',
    headingFont: 'Merriweather, serif',
    bodyFont: 'Georgia, serif',
    tagline: 'Rigorous Empirical Discovery',
  },
  {
    id: 'bk_creative_emerald',
    name: 'Creative Studio Emerald',
    primaryColor: '#059669',
    secondaryColor: '#064e3b',
    accentColor: '#f59e0b',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Inter, sans-serif',
    tagline: 'Artistic Direction & Visual Excellence',
  },
  {
    id: 'bk_luxury_crimson',
    name: 'Midnight Luxury Crimson',
    primaryColor: '#9f1239',
    secondaryColor: '#18181b',
    accentColor: '#fbbf24',
    headingFont: 'Playfair Display, serif',
    bodyFont: 'Times New Roman, serif',
    tagline: 'Premium Aesthetics & Exclusive Quality',
  },
];

export class BrandKitEngine {
  private static STORAGE_KEY = 'opendoc_brand_kits_v1';
  private static ACTIVE_KEY = 'opendoc_active_brand_kit_v1';

  static getKits(): BrandKit[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return DEFAULT_BRAND_KITS;
  }

  static saveKit(kit: BrandKit) {
    const kits = this.getKits();
    const existingIdx = kits.findIndex(k => k.id === kit.id);
    let updated: BrandKit[];
    if (existingIdx >= 0) {
      updated = [...kits];
      updated[existingIdx] = kit;
    } else {
      updated = [...kits, kit];
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static getActiveKit(): BrandKit {
    try {
      const activeId = localStorage.getItem(this.ACTIVE_KEY);
      const kits = this.getKits();
      const match = kits.find(k => k.id === activeId);
      if (match) return match;
    } catch {}
    return DEFAULT_BRAND_KITS[0];
  }

  static setActiveKit(kitId: string) {
    localStorage.setItem(this.ACTIVE_KEY, kitId);
  }
}
