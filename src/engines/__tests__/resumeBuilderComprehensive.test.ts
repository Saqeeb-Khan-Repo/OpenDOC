import { describe, it, expect } from 'vitest';
import {
  ResumeEngine, ResumeData, RESUME_TEMPLATES_METADATA, RESUME_PALETTES,
  ResumeCustomSection, ResumeDesignConfig
} from '../ResumeEngine';

describe('Resume Builder Engine & Customization Verification', () => {
  it('should provide 20 distinct templates across 8 categories including ATS and Executive', () => {
    const templates = ResumeEngine.getTemplates();
    expect(templates.length).toBeGreaterThanOrEqual(20);

    const categories = new Set(templates.map(t => t.category));
    expect(categories.has('ATS')).toBe(true);
    expect(categories.has('Developer')).toBe(true);
    expect(categories.has('Executive')).toBe(true);
    expect(categories.has('Modern')).toBe(true);
    expect(categories.has('Academic')).toBe(true);

    const atsTemplates = templates.filter(t => t.category === 'ATS');
    expect(atsTemplates.length).toBeGreaterThanOrEqual(5);
  });

  it('should decouple content from design: changing templates preserves all resume data', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.name = 'Samantha Jordan';
    data.personalInfo.title = 'VP of Artificial Intelligence';
    data.summary = 'Visionary technology executive leading large-scale machine learning initiatives.';

    const templates = ResumeEngine.getTemplates();
    templates.forEach(t => {
      const html = ResumeEngine.renderTemplate(data, t.id);
      expect(html).toContain('Samantha Jordan');
      expect(html).toContain('VP of Artificial Intelligence');
      expect(html).toContain(data.personalInfo.email);
      expect(html).toContain('Visionary technology executive');
      expect(html).toContain('ScaleTech Solutions');
    });
  });

  it('should render all 7 header layouts seamlessly', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const layouts: ResumeDesignConfig['headerLayout'][] = [
      'classic', 'modern', 'minimal', 'centered', 'split', 'compact', 'executive'
    ];

    layouts.forEach(layout => {
      const html = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro', { headerLayout: layout });
      expect(html).toContain(data.personalInfo.name);
      expect(html).toContain(data.personalInfo.title);
      expect(html).toContain(data.personalInfo.email);
    });
  });

  it('should render profile photos with custom styles and sizes', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.photo = {
      url: 'https://example.com/photo.jpg',
      style: 'circle',
      size: 'lg',
    };

    const html = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(html).toContain('https://example.com/photo.jpg');
    expect(html).toContain('border-radius: 50%');
    expect(html).toContain('width: 84px');

    // Square photo
    const squareHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro', {
      headerLayout: 'centered',
    });
    expect(squareHtml).toContain('https://example.com/photo.jpg');
  });

  it('should format all URLs and contacts as safe, clickable hyperlinks', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.customLinks = [
      { label: 'Substack Newsletter', url: 'https://alexchen.substack.com' }
    ];

    const html = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(html).toContain(`href="mailto:${data.personalInfo.email}"`);
    expect(html).toContain(`href="tel:${data.personalInfo.phone}"`);
    expect(html).toContain(`href="${data.personalInfo.website}"`);
    expect(html).toContain(`href="https://${data.personalInfo.github}"`);
    expect(html).toContain(`href="https://alexchen.substack.com"`);
    expect(html).toContain('Substack Newsletter');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('should support dynamic custom sections with entries and bullet points', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const customSec: ResumeCustomSection = {
      id: 'custom_patents',
      title: 'Patents & Inventions',
      style: 'standard',
      items: [
        {
          id: 'patent_1',
          title: 'Method and System for Low-Latency CRDT Synchronization',
          subtitle: 'US Patent #11,234,567',
          date: 'Issued Dec 2023',
          description: 'Novel protocol for conflict-free state resolution in distributed web applications.',
          link: 'https://patents.google.com/patent/US11234567',
          bullets: ['Reduced conflict resolution overhead by 40%.'],
        }
      ]
    };

    data.customSections = [customSec];
    data.sectionOrder = [
      ...data.sectionOrder!,
      { id: 'sec_custom_patents', type: 'custom', title: 'Patents & Inventions', visible: true, customSectionId: 'custom_patents' }
    ];

    const html = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(html).toContain('Patents & Inventions');
    expect(html).toContain('Low-Latency CRDT Synchronization');
    expect(html).toContain('US Patent #11,234,567');
    expect(html).toContain('Reduced conflict resolution overhead by 40%.');
  });

  it('should respect section reordering and visibility flags', () => {
    const data = ResumeEngine.getDefaultResumeData();
    // Hide experience section
    data.sectionOrder = data.sectionOrder!.map(s =>
      s.type === 'experience' ? { ...s, visible: false } : s
    );

    const htmlHiddenExp = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(htmlHiddenExp).not.toContain('ScaleTech Solutions');
    expect(htmlHiddenExp).toContain('Skills & Competencies');

    // Reorder education before skills
    const reordered = data.sectionOrder!.map(s => {
      if (s.type === 'experience') return { ...s, visible: true };
      return s;
    });
    const eduIdx = reordered.findIndex(s => s.type === 'education');
    const skillsIdx = reordered.findIndex(s => s.type === 'skills');
    const temp = reordered[eduIdx];
    reordered[eduIdx] = reordered[skillsIdx];
    reordered[skillsIdx] = temp;

    data.sectionOrder = reordered;
    const htmlReordered = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    const eduPosition = htmlReordered.indexOf('Education');
    const skillsPosition = htmlReordered.indexOf('Skills & Competencies');
    expect(eduPosition).toBeLessThan(skillsPosition);
  });

  it('should apply color palettes, typography scales, and spacing presets', () => {
    const data = ResumeEngine.getDefaultResumeData();

    // Apply Emerald palette with Compact spacing and Large typography
    const emeraldPal = RESUME_PALETTES.find(p => p.id === 'emerald')!;
    const customDesign: Partial<ResumeDesignConfig> = {
      palette: 'emerald',
      colors: emeraldPal.colors,
      fontFamily: 'Roboto',
      nameSize: 28,
      headingSize: 14,
      bodySize: 12,
      spacing: {
        pageMargin: 20,
        sectionGap: 10,
        entryGap: 8,
        paragraphGap: 2,
        lineHeight: 1.35,
      },
      headingStyle: 'banner',
      bulletStyle: 'dash',
    };

    const html = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro', customDesign);
    expect(html).toContain('font-family: \'Roboto\'');
    expect(html).toContain(`color: ${emeraldPal.colors.body}`);
    expect(html).toContain('font-size: 28px');
    expect(html).toContain('list-style-type: square');
  });

  it('should embed print page-break protection rules for professional PDF export', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const html = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');

    expect(html).toContain('page-break-inside: avoid; break-inside: avoid;');
    expect(html).toContain('page-break-after: avoid; break-after: avoid;');
  });
});
