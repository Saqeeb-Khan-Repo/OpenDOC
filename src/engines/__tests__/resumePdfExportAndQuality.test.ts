import { describe, it, expect } from 'vitest';
import { ResumeEngine, ResumeData } from '../ResumeEngine';
import { ResumeExportEngine } from '../ResumeExportEngine';
import { ResumeValidator } from '../../utils/resumeValidator';

describe('Resume PDF Export & Quality Audit Verification', () => {
  it('TEST 1 & 2: Isolated export HTML contains ONLY the A4 resume without any editor UI', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');

    const isolatedPrintHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      title: 'Alex_Chen_Resume.pdf',
      paperSize: 'A4',
      clickableLinks: true,
      quality: 'high',
    });

    // Verify it contains the resume content
    expect(isolatedPrintHtml).toContain('Alex Chen');
    expect(isolatedPrintHtml).toContain('ScaleTech Solutions');
    expect(isolatedPrintHtml).toContain('resume-export-wrapper');
    expect(isolatedPrintHtml).toContain('@page {');
    expect(isolatedPrintHtml).toContain('size: A4 portrait;');

    // Verify it NEVER contains editor UI elements
    expect(isolatedPrintHtml).not.toContain('ZoomControls');
    expect(isolatedPrintHtml).not.toContain('ResumeBuilder');
    expect(isolatedPrintHtml).not.toContain('Toolbar');
    expect(isolatedPrintHtml).not.toContain('Sidebar');
    expect(isolatedPrintHtml).not.toContain('ResumeDesignPanel');
    expect(isolatedPrintHtml).not.toContain('ResumeSectionListEditor');
  });

  it('TEST 4 & 5: All hyperlinks remain clickable <a href="..."> in exported HTML', () => {
    const data = ResumeEngine.getDefaultResumeData();
    data.personalInfo.website = 'https://alexchen.dev';
    data.personalInfo.linkedin = 'linkedin.com/in/alexchen';
    data.personalInfo.github = 'github.com/alexchen';
    data.personalInfo.customLinks = [{ label: 'Substack Blog', url: 'https://substack.com/@alexchen' }];

    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro');
    const isolatedPrintHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      title: 'Alex_Chen_Resume.pdf',
      clickableLinks: true,
    });

    expect(isolatedPrintHtml).toContain('href="mailto:alex.chen@example.com"');
    expect(isolatedPrintHtml).toContain('href="tel:+1 (555) 234-5678"');
    expect(isolatedPrintHtml).toContain('href="https://alexchen.dev"');
    expect(isolatedPrintHtml).toContain('href="https://linkedin.com/in/alexchen"');
    expect(isolatedPrintHtml).toContain('href="https://github.com/alexchen"');
    expect(isolatedPrintHtml).toContain('href="https://substack.com/@alexchen"');
    expect(isolatedPrintHtml).toContain('target="_blank"');
  });

  it('TEST 6 & 10: Supports Letter and A4 page dimension configurations', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const renderedHtml = ResumeEngine.renderTemplate(data, 'tmpl_modern_pro', { paperSize: 'Letter' });

    const letterHtml = ResumeExportEngine.getIsolatedPrintHtml({
      html: renderedHtml,
      paperSize: 'Letter',
    });

    expect(letterHtml).toContain('size: letter portrait;');
    expect(letterHtml).toContain('8.5in');
  });

  it('TEST 9: Generates dedicated ATS-Optimized export HTML', () => {
    const data = ResumeEngine.getDefaultResumeData();
    const atsExportHtml = ResumeExportEngine.getAtsExportHtml(data, 'A4');

    expect(atsExportHtml).toContain('Alex Chen');
    expect(atsExportHtml).toContain('font-family: \'Arial\'');
    expect(atsExportHtml).toContain('color: #000000');
    expect(atsExportHtml).toContain('border-bottom: 1.5px solid #cccccc');
  });

  it('Quality Audit: Validates email, phone, URLs, and calculates health scores', () => {
    const validData = ResumeEngine.getDefaultResumeData();
    const validReport = ResumeValidator.auditResume(validData);

    expect(validReport.score).toBeGreaterThanOrEqual(80);
    expect(validReport.pageEstimate).toBeGreaterThanOrEqual(1);

    // Test incomplete data
    const incompleteData: ResumeData = {
      ...validData,
      personalInfo: {
        name: '',
        title: '',
        email: 'invalid-email',
        phone: '',
        location: '',
      },
      summary: '',
      experience: [],
      skillCategories: [],
    };

    const incompleteReport = ResumeValidator.auditResume(incompleteData);
    expect(incompleteReport.score).toBeLessThan(50);
    const warnings = incompleteReport.items.filter(i => i.level === 'warning');
    expect(warnings.some(w => w.id === 'contact_name')).toBe(true);
    expect(warnings.some(w => w.id === 'contact_email')).toBe(true);
    expect(warnings.some(w => w.id === 'exp_none')).toBe(true);
  });

  it('URL Validator: Correctly identifies valid and malformed URLs', () => {
    expect(ResumeValidator.isValidUrl('https://example.com')).toBe(true);
    expect(ResumeValidator.isValidUrl('http://sub.domain.io/path?query=1')).toBe(true);
    expect(ResumeValidator.isValidUrl('github.com/user/repo')).toBe(true);
    expect(ResumeValidator.isValidUrl('linkedin.com/in/username')).toBe(true);
    expect(ResumeValidator.isValidUrl('')).toBe(true); // empty allowed

    expect(ResumeValidator.isValidUrl('not a url at all')).toBe(false);
    expect(ResumeValidator.isValidEmail('user@domain.com')).toBe(true);
    expect(ResumeValidator.isValidEmail('invalid-email')).toBe(false);
    expect(ResumeValidator.isValidPhone('+1 (555) 123-4567')).toBe(true);
    expect(ResumeValidator.isValidPhone('abc')).toBe(false);
  });

  it('Page Estimator: Calculates multi-page thresholds accurately', () => {
    const defaultData = ResumeEngine.getDefaultResumeData();
    const est1 = ResumeValidator.estimatePageCount(defaultData);
    expect(est1.pages).toBe(1);

    // Add multiple extensive experience roles to trigger 2 pages
    const multiPageData: ResumeData = {
      ...defaultData,
      experience: [
        ...defaultData.experience,
        {
          id: 'exp_extra_1',
          title: 'Senior Engineering Manager',
          company: 'HyperGrowth Corp',
          location: 'New York, NY',
          period: '2019 – 2021',
          highlights: [
            'Scaled distributed cloud infrastructure across 12 regions with 99.99% SLA.',
            'Managed team of 25 distributed software and platform engineers.',
            'Reduced AWS annual compute costs by $450,000 through automated container rightsizing.',
          ],
        },
        {
          id: 'exp_extra_2',
          title: 'Systems Software Architect',
          company: 'CloudFlow Labs',
          location: 'Boston, MA',
          period: '2016 – 2019',
          highlights: [
            'Architected microservices streaming pipeline processing 10B events daily.',
            'Implemented custom Raft consensus protocol for low-latency node coordination.',
          ],
        },
        {
          id: 'exp_extra_3',
          title: 'Software Engineer II',
          company: 'DataTech Inc',
          location: 'Austin, TX',
          period: '2014 – 2016',
          highlights: [
            'Built real-time analytics dashboards using TypeScript and WebSocket streaming.',
          ],
        },
      ],
    };

    const est2 = ResumeValidator.estimatePageCount(multiPageData);
    expect(est2.pages).toBeGreaterThanOrEqual(2);
    expect(est2.recommendation).toContain('2 Pages');
  });
});
