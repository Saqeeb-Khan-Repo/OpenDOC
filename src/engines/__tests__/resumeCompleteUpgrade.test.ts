import { describe, it, expect } from 'vitest';
import {
  ResumeEngine, ResumeData, RESUME_TEMPLATES_METADATA, DEFAULT_PAGE_SETTINGS
} from '../ResumeEngine';
import { ResumeExportEngine } from '../ResumeExportEngine';
import { ResumeImportEngine } from '../ResumeImportEngine';
import { ResumeValidator } from '../../utils/resumeValidator';

describe('Resume System Complete Upgrade', () => {
  // ── 1. Page Range Parsing ──────────────────────────────────────────────────
  describe('Page Selection & Range Parser', () => {
    it('parses "all" to all page numbers up to total', () => {
      expect(ResumeExportEngine.parsePageRange('all', 3, 1)).toEqual([1, 2, 3]);
      expect(ResumeExportEngine.parsePageRange(undefined, 2, 1)).toEqual([1, 2]);
    });

    it('parses "current" to current page index', () => {
      expect(ResumeExportEngine.parsePageRange('current', 4, 2)).toEqual([2]);
    });

    it('parses range strings like "1-2" and "1,3-4"', () => {
      expect(ResumeExportEngine.parsePageRange('1-2', 4, 1)).toEqual([1, 2]);
      expect(ResumeExportEngine.parsePageRange('1,3-4', 5, 1)).toEqual([1, 3, 4]);
      expect(ResumeExportEngine.parsePageRange('2', 3, 1)).toEqual([2]);
    });

    it('clamps out of bounds page numbers safely', () => {
      expect(ResumeExportEngine.parsePageRange('1-10', 3, 1)).toEqual([1, 2, 3]);
      expect(ResumeExportEngine.parsePageRange('99', 2, 1)).toEqual([1]);
    });
  });

  // ── 2. Physical Page Dimensions & Custom Margins ───────────────────────────
  describe('Page Dimensions & Margins Engine', () => {
    it('returns exact A4 and Letter dimensions in mm', () => {
      const a4 = ResumeExportEngine.getPageDimensionsMm('A4');
      expect(a4.widthMm).toBe(210);
      expect(a4.heightMm).toBe(297);

      const letter = ResumeExportEngine.getPageDimensionsMm('Letter');
      expect(letter.widthMm).toBe(215.9);
      expect(letter.heightMm).toBe(279.4);
    });

    it('swaps dimensions correctly when orientation is landscape', () => {
      const a4Landscape = ResumeExportEngine.getPageDimensionsMm('A4', undefined, undefined, 'mm', 'landscape');
      expect(a4Landscape.widthMm).toBe(297);
      expect(a4Landscape.heightMm).toBe(210);
    });

    it('calculates custom dimensions with unit conversions (inches, cm)', () => {
      const customInches = ResumeExportEngine.getPageDimensionsMm('Custom', 8.5, 11, 'in', 'portrait');
      expect(Math.round(customInches.widthMm * 10) / 10).toBe(215.9);
      expect(Math.round(customInches.heightMm * 10) / 10).toBe(279.4);

      const customCm = ResumeExportEngine.getPageDimensionsMm('Custom', 20, 30, 'cm', 'portrait');
      expect(customCm.widthMm).toBe(200);
      expect(customCm.heightMm).toBe(300);
    });

    it('generates padding CSS respecting page settings margins in mm', () => {
      const design = ResumeEngine.getDefaultDesign();
      design.pageSettings = {
        ...DEFAULT_PAGE_SETTINGS,
        marginTop: 12,
        marginBottom: 14,
        marginLeft: 16,
        marginRight: 18,
      };
      const paddingCss = ResumeEngine.getPaddingCss(design);
      expect(paddingCss).toBe('12mm 18mm 14mm 16mm');
    });
  });

  // ── 3. Hard Export Isolation Test ───────────────────────────────────────────
  describe('Hard Export Isolation & Zero Website UI', () => {
    it('generates isolated markup containing ONLY the resume document and zero website chrome', () => {
      const resume = ResumeEngine.getDefaultResumeData();
      const renderedHtml = ResumeEngine.renderTemplate(resume, 'tmpl_modern_pro');

      const isolatedHtml = ResumeExportEngine.getIsolatedPrintHtml({
        html: renderedHtml,
        title: 'John_Doe_Resume',
        paperSize: 'A4',
        clickableLinks: true,
      });

      // Assert document content exists
      expect(isolatedHtml).toContain('resume-export-wrapper');
      expect(isolatedHtml).toContain('Alex Chen');
      expect(isolatedHtml).toContain('Senior Full-Stack Software Engineer');

      // Hard isolation: website UI keywords MUST NEVER appear in exported markup
      const forbiddenStrings = [
        'Dashboard',
        'Resume Builder',
        'Download PDF',
        'Export Resume',
        'Sidebar',
        'Navigation',
        'Templates panel',
        'Design controls',
        'breadcrumb',
        'Application header',
        'Application footer',
      ];

      forbiddenStrings.forEach(forbidden => {
        expect(isolatedHtml.toLowerCase()).not.toContain(forbidden.toLowerCase());
      });
    });
  });

  // ── 4. Resume Text Extraction & Normalization ──────────────────────────────
  describe('Resume Import Engine & Normalization', () => {
    it('parses messy raw text into structured resume sections', () => {
      const messyResumeText = `
        Jane Doe
        Senior .NET Cloud Architect
        jane.doe@example.com | +1 (555) 987-6543 | linkedin.com/in/janedoe | github.com/janedoe

        PROFESSIONAL SUMMARY
        Over 10 years of experience designing high-throughput distributed systems in C# and Azure.

        CORE COMPETENCIES
        • C# • .NET Core • ASP.NET • Azure • SQL Server • Docker • Kubernetes • Microservices

        WORK EXPERIENCE
        Principal Architect - Cloud Corp (2020 – Present)
        • Architected microservices platform handling 50M daily transactions.
        - Reduced database latency by 45% using Redis caching and optimized queries.
        * Mentored a team of 12 backend engineers.

        EDUCATION
        B.S. in Computer Engineering
        University of Washington (2014)

        KEY PROJECTS
        Distributed Payment Gateway
        - Built event-driven ledger using Kafka and .NET 8.
      `;

      const warnings: string[] = [];
      const parsed = ResumeImportEngine.parseResumeText(messyResumeText, warnings);

      // Contact info
      expect(parsed.personalInfo.name).toBe('Jane Doe');
      expect(parsed.personalInfo.title).toBe('Senior .NET Cloud Architect');
      expect(parsed.personalInfo.email).toBe('jane.doe@example.com');
      expect(parsed.personalInfo.phone).toContain('555');
      expect(parsed.personalInfo.linkedin).toContain('janedoe');
      expect(parsed.personalInfo.github).toContain('janedoe');

      // Summary
      expect(parsed.summary).toContain('Over 10 years of experience');

      // Skills
      expect(parsed.skillCategories.length).toBeGreaterThan(0);
      const allSkills = parsed.skillCategories.flatMap(sc => sc.skills);
      expect(allSkills).toContain('C#');

      // Experience & normalized bullets
      expect(parsed.experience.length).toBeGreaterThan(0);
      expect(parsed.experience[0].title).toBe('Principal Architect');
      expect(parsed.experience[0].company).toBe('Cloud Corp');
      // Bullets should have bullet glyphs (•, -, *) stripped clean
      expect(parsed.experience[0].highlights[0]).not.toMatch(/^[•*-]/);
      expect(parsed.experience[0].highlights[0]).toContain('Architected microservices');

      // Education
      expect(parsed.education.length).toBeGreaterThan(0);
      expect(parsed.education[0].degree).toContain('Computer Engineering');
    });

    it('imports structured JSON and standard JSON Resume formats', async () => {
      const standardJsonResume = {
        basics: {
          name: 'Sarah Connor',
          label: 'Security Engineer',
          email: 'sarah@cyberdyne.com',
          phone: '555-123-4567',
          summary: 'Specialized in defensive infrastructure.',
          location: { city: 'Los Angeles', region: 'CA' },
        },
        work: [
          {
            name: 'Cyberdyne Systems',
            position: 'Security Lead',
            startDate: '2021-01',
            endDate: '2023-12',
            highlights: ['Fortified security perimeters.'],
          },
        ],
        skills: [
          {
            name: 'Security',
            keywords: ['Threat Modeling', 'Penetration Testing'],
          },
        ],
      };

      const file = new File([JSON.stringify(standardJsonResume)], 'resume.json', { type: 'application/json' });
      const result = await ResumeImportEngine.importJson(file);

      expect(result.success).toBe(true);
      expect(result.resumeData?.personalInfo.name).toBe('Sarah Connor');
      expect(result.resumeData?.personalInfo.title).toBe('Security Engineer');
      expect(result.resumeData?.experience[0].company).toBe('Cyberdyne Systems');
      expect(result.resumeData?.skillCategories[0].skills).toContain('Threat Modeling');
    });
  });

  // ── 5. Template Switching Data Preservation ────────────────────────────────
  describe('Data Preservation Across Templates', () => {
    it('preserves all user resume data when changing templates', () => {
      const originalData = ResumeEngine.getDefaultResumeData();
      originalData.personalInfo.name = 'Unique Candidate Name 12345';
      originalData.summary = 'Unique custom summary text that must never be erased.';

      // Switch to multiple templates and verify HTML renders full data
      const templatesToTest = [
        'tmpl_ats_classic',
        'tmpl_dotnet_dev',
        'tmpl_backend_dev',
        'tmpl_frontend_dev',
        'tmpl_fullstack_dev',
        'tmpl_data_analyst',
        'tmpl_data_scientist',
        'tmpl_ai_ml',
        'tmpl_internship',
        'tmpl_professional_minimal',
      ];

      templatesToTest.forEach(tmplId => {
        const html = ResumeEngine.renderTemplate(originalData, tmplId);
        expect(html).toContain('Unique Candidate Name 12345');
        expect(html).toContain('Unique custom summary text');
      });
    });
  });

  // ── 6. Job Description Keyword Matching ─────────────────────────────────────
  describe('Job Description Keyword Matching & ATS Audit', () => {
    it('identifies matched and missing technical keywords accurately', () => {
      const resume = ResumeEngine.getDefaultResumeData();
      // Alex Chen has TypeScript, React, Node.js, GraphQL, Docker, Kubernetes, AWS, PostgreSQL

      const jobPosting = `
        We are looking for a Senior Full-Stack Engineer with strong experience in:
        - React, TypeScript, and Node.js
        - PostgreSQL database design
        - Docker and Kubernetes microservices
        - Apache Kafka and Rust distributed systems (Nice to have)
      `;

      const match = ResumeValidator.matchJobDescription(resume, jobPosting);

      expect(match.matchedKeywords).toContain('react');
      expect(match.matchedKeywords).toContain('typescript');
      expect(match.matchedKeywords).toContain('docker');
      expect(match.matchedKeywords).toContain('kubernetes');

      // Nice to have keywords in JD not in Alex Chen's default resume
      expect(match.missingKeywords).toContain('kafka');
      expect(match.matchScore).toBeGreaterThan(50);
      expect(match.suggestedAreas.length).toBeGreaterThan(0);
    });
  });
});
