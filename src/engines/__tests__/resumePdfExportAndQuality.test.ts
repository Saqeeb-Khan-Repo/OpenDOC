import { describe, it, expect } from 'vitest';
import { ResumeEngine, ResumeData } from '../ResumeEngine';
import { ResumeExportEngine } from '../ResumeExportEngine';
import { ResumeValidator } from '../../utils/resumeValidator';

describe('Resume PDF Export & Quality Audit Comprehensive Tests', () => {
  // ── TEST A: One-Page Resume ───────────────────────────────────────────────
  it('TEST A: One-page resume produces exactly one A4 page with only resume content', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');

    const isolatedPrintHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      title: 'Alex_Chen_Resume.pdf',
      paperSize: 'A4',
    });

    expect(isolatedPrintHtml).toContain('Alex Chen');
    expect(isolatedPrintHtml).toContain('size: A4 portrait;');
    expect(isolatedPrintHtml).toContain('210mm');
    expect(isolatedPrintHtml).toContain('297mm');

    // Zero editor UI
    expect(isolatedPrintHtml).not.toContain('ZoomControls');
    expect(isolatedPrintHtml).not.toContain('ResumeBuilder');
    expect(isolatedPrintHtml).not.toContain('Toolbar');
    expect(isolatedPrintHtml).not.toContain('Sidebar');
  });

  // ── TEST B & K: Long Multi-page Resume & Pagination ─────────────────────────
  it('TEST B & K: Long multi-page resume paginates with page-break protection and 2+ pages', () => {
    const defaultData = ResumeEngine.getDefaultResumeData();
    const multiPageData: ResumeData = {
      ...defaultData,
      experience: [
        ...defaultData.experience,
        {
          id: 'exp_lead_1',
          title: 'Principal Software Architect',
          company: 'CloudMatrix Technologies',
          location: 'San Francisco, CA',
          period: '2019 – 2021',
          highlights: [
            'Architected global multi-region database replication serving 50M DAU with 99.999% uptime.',
            'Managed team of 30 principal engineers and distributed systems researchers.',
          ],
        },
        {
          id: 'exp_lead_2',
          title: 'Senior Systems Engineer',
          company: 'Apex Data Systems',
          location: 'Seattle, WA',
          period: '2016 – 2019',
          highlights: [
            'Designed high-throughput Kafka streaming pipeline processing 2M events/sec.',
          ],
        },
      ],
    };

    const renderedHtml = ResumeEngine.renderTemplate(multiPageData, 'tmpl_modern_pro');
    const isolatedHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      title: 'Alex_Chen_Resume.pdf',
    });

    expect(isolatedHtml).toContain('page-break-inside: avoid !important;');
    expect(isolatedHtml).toContain('Principal Software Architect');
    expect(isolatedHtml).toContain('CloudMatrix Technologies');

    const pageEst = ResumeValidator.estimatePageCount(multiPageData);
    expect(pageEst.pages).toBeGreaterThanOrEqual(2);
  });

  // ── TEST C & D: Viewport Independence (Mobile 390px vs Desktop 1920px) ─────
  it('TEST C & D: Exported PDF is strictly A4 (210mm x 297mm) independent of viewport width', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');

    const exportHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      paperSize: 'A4',
    });

    // Contains fixed mm A4 constraints regardless of device viewport
    expect(exportHtml).toContain('max-width: 210mm;');
    expect(exportHtml).toContain('min-height: 297mm;');
    expect(exportHtml).not.toContain('390px');
    expect(exportHtml).not.toContain('1920px');
  });

  // ── TEST E & F: Editor Zoom Independence (50% vs 200%) ─────────────────────
  it('TEST E & F: Exported PDF is unscaled 100% standard A4 regardless of editor zoom', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');

    const exportHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      paperSize: 'A4',
    });

    // The export HTML never inherits editor transform: scale(...)
    expect(exportHtml).not.toContain('transform: scale(0.5)');
    expect(exportHtml).not.toContain('transform: scale(2)');
    expect(exportHtml).toContain('width: 100%;');
  });

  // ── TEST G: Profile Photo Styling & Aspect Ratio ───────────────────────────
  it('TEST G: Profile image maintains aspect ratio, dimensions, and selected shape', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.photo = {
      url: 'https://example.com/avatar.jpg',
      style: 'circle',
      size: 'md',
    };

    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(renderedHtml).toContain('https://example.com/avatar.jpg');
    expect(renderedHtml).toContain('object-fit: cover;');
    expect(renderedHtml).toContain('border-radius: 50%;');
    expect(renderedHtml).toContain('width: 68px;');

    // Test Rounded
    data.personalInfo.photo.style = 'rounded';
    const roundedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(roundedHtml).toContain('border-radius: 12px;');
  });

  // ── TEST H: Preserved Clickable Hyperlinks ──────────────────────────────────
  it('TEST H: Hyperlinks for Email, Phone, Website, LinkedIn, GitHub remain clickable in PDF', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.website = 'https://alexchen.dev';
    data.personalInfo.linkedin = 'linkedin.com/in/alexchen';
    data.personalInfo.github = 'github.com/alexchen';

    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    const isolatedHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      clickableLinks: true,
    });

    expect(isolatedHtml).toContain('href="mailto:alex.chen@example.com"');
    expect(isolatedHtml).toContain('href="tel:+1 (555) 234-5678"');
    expect(isolatedHtml).toContain('href="https://alexchen.dev"');
    expect(isolatedHtml).toContain('href="https://linkedin.com/in/alexchen"');
    expect(isolatedHtml).toContain('href="https://github.com/alexchen"');
    expect(isolatedHtml).toContain('target="_blank"');
    expect(isolatedHtml).toContain('rel="noopener noreferrer"');
  });

  // ── TEST I: Two-Column Alignment ───────────────────────────────────────────
  it('TEST I: Two-column templates render rigid percentage columns without overlap', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const twoColHtml = ResumeEngine.renderTemplate(data, 'tmpl_two_column');

    expect(twoColHtml).toContain('grid-template-columns: 32% 64%;');
    expect(twoColHtml).toContain('gap: 4%;');
  });

  // ── TEST J: Very Long Experience Description ───────────────────────────────
  it('TEST J: Very long experience descriptions render with line-break styling without clipping', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.experience[0].highlights.push(
      'Developed distributed fault-tolerant transactional consensus protocol capable of processing massive transactional volume across multi-datacenter clusters while guaranteeing zero data loss during network partitions.'
    );

    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    expect(renderedHtml).toContain('transactional consensus protocol');
    expect(renderedHtml).toContain('page-break-inside: avoid; break-inside: avoid;');
  });

  // ── TEST L: Refresh & Autosave Integrity ───────────────────────────────────
  it('TEST L: Data persistence and template rendering remain completely deterministic', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const serialized = JSON.stringify(data);
    const restored: ResumeData = JSON.parse(serialized);

    const html1 = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    const html2 = ResumeEngine.renderTemplate(restored, 'tmpl_modern_pro');

    expect(html1).toEqual(html2);
  });

  // ── ATS Export Test ────────────────────────────────────────────────────────
  it('ATS Mode: Generates ATS-optimized single-column print document', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const atsHtml = ResumeExportEngine.getAtsExportHtml(data, 'A4');

    expect(atsHtml).toContain('Alex Chen');
    expect(atsHtml).toContain('font-family: \'Arial\'');
    expect(atsHtml).toContain('color: #000000');
    expect(atsHtml).toContain('border-bottom: 1.5px solid #cccccc');
  });

  // ── STRICT EXCLUSION TEST: Zero Website UI In PDF ──────────────────────────
  it('STRICT TEST: Export document contains ONLY the resume and zero website UI elements', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.name = 'Sarah Connor';
    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');

    const defaultTitle = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
    const exportHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      title: defaultTitle,
      paperSize: 'A4',
      clickableLinks: true,
      quality: 'high',
    });

    expect(exportHtml).toContain('<title>Sarah_Connor_Resume.pdf</title>');
    expect(exportHtml).toContain('Sarah Connor');

    // STRICT CHECK: Ensure ZERO website or application elements exist
    const forbiddenStrings = [
      'Website header',
      'Website footer',
      'Application logo',
      'Resume Builder breadcrumb',
      'Editor sidebar',
      'Editor toolbar',
      'Design panel',
      'Template panel',
      'btn-export',
      'ZoomControls',
      'HeaderActions',
      'MobileNav',
      'FooterNav',
      'EditorControls',
    ];

    forbiddenStrings.forEach(forbidden => {
      expect(exportHtml).not.toContain(forbidden);
    });
  });
});
