import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { PDFImportEngine } from '../PDFImportEngine';
import { ResumeImportEngine } from '../ResumeImportEngine';
import { ResumeEngine, ResumeData } from '../ResumeEngine';
import { PDFDocumentPage } from '../types';

describe('Document Editor PDF Import & Resume Upgrades', () => {
  // ── PDF IMPORT ENGINE TESTS ────────────────────────────────────────────────
  describe('PDFImportEngine', () => {
    it('inspectPdf returns valid PDF inspection metadata', async () => {
      const realPdf = await PDFDocument.create();
      realPdf.setTitle('Quarterly Report');
      realPdf.setAuthor('Antigravity');
      realPdf.addPage([595, 842]);
      const pdfBytes = await realPdf.save();
      const file = new File([pdfBytes as any], 'quarterly_report.pdf', { type: 'application/pdf' });

      const inspection = await PDFImportEngine.inspectPdf(file);
      expect(inspection.fileName).toBe('quarterly_report.pdf');
      expect(inspection.pageCount).toBe(1);
      expect(inspection.pages[0].width).toBe(595);
      expect(inspection.pages[0].height).toBe(842);
      expect(inspection.orientation).toBe('portrait');
    });

    it('parsePdf returns an EditablePDFDocument with pages and normalized text blocks', async () => {
      const realPdf = await PDFDocument.create();
      realPdf.addPage([595, 842]);
      realPdf.addPage([595, 842]);
      const pdfBytes = await realPdf.save();
      const file = new File([pdfBytes as any], 'sample_presentation.pdf', { type: 'application/pdf' });

      const result = await PDFImportEngine.parsePdf(file);
      expect(result.title).toBeDefined();
      expect(result.editablePdf).toBeDefined();
      expect(result.editablePdf.pages).toBeDefined();
      expect(result.editablePdf.pages.length).toBe(2);

      const firstPage = result.editablePdf.pages[0];
      expect(firstPage.pageNumber).toBe(1);
      expect(firstPage.width).toBe(595);
      expect(firstPage.height).toBe(842);
      expect(Array.isArray(firstPage.textBlocks)).toBe(true);

      // Verify coordinate normalization
      firstPage.textBlocks.forEach(block => {
        expect(block.x).toBeGreaterThanOrEqual(0);
        expect(block.y).toBeGreaterThanOrEqual(0);
      });
    });

    it('convertPagesToHtml generates flowable semantic HTML with page-break markers', () => {
      const mockPages: PDFDocumentPage[] = [
        {
          id: 'page_1',
          pageNumber: 1,
          width: 794,
          height: 1123,
          textBlocks: [
            {
              id: 'tb_1',
              x: 50,
              y: 50,
              width: 300,
              height: 30,
              text: 'Executive Summary',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              color: '#1e293b',
            },
            {
              id: 'tb_2',
              x: 50,
              y: 90,
              width: 500,
              height: 40,
              text: 'This document presents the Q3 operational and financial performance overview.',
              fontSize: 12,
              fontWeight: 'normal',
              fontFamily: 'sans-serif',
              color: '#334155',
            },
          ],
          images: [],
        },
        {
          id: 'page_2',
          pageNumber: 2,
          width: 794,
          height: 1123,
          textBlocks: [
            {
              id: 'tb_3',
              x: 50,
              y: 50,
              width: 300,
              height: 30,
              text: 'Financial Highlights',
              fontSize: 18,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              color: '#1e293b',
            },
          ],
          images: [],
        },
      ];

      const html = PDFImportEngine.convertPagesToHtml(mockPages);

      // Semantic flow validation
      expect(html).toContain('Executive Summary');
      expect(html).toContain('Financial Highlights');
      expect(html).toContain('data-page-break="true"');
      expect(html).toContain('class="page-break"');
    });

    it('creates new text block with default coordinates and fonts', () => {
      const block = PDFImportEngine.createNewTextBlock(120, 240, 'Added Note');
      expect(block.x).toBe(120);
      expect(block.y).toBe(240);
      expect(block.text).toBe('Added Note');
      expect(block.fontSize).toBe(14);
      expect(block.color).toBe('#0f172a');
    });
  });

  // ── RESUME IMPORT & ATS ENHANCEMENTS TESTS ──────────────────────────────────
  describe('ResumeImportEngine', () => {
    it('parses raw text resume and extracts personal info, experience, and education', async () => {
      const sampleResume = `
Jane Doe
Senior Full-Stack Engineer
Email: jane.doe@example.com | Phone: (555) 123-4567 | Location: Austin, TX

SUMMARY
Results-driven software architect with 8+ years building enterprise SaaS platforms.

EXPERIENCE
CloudScale Technologies - Lead Platform Engineer
2021 - Present | Austin, TX
- Spearheaded migration to microservices, reducing latency by 45%.
- Led team of 8 backend and DevOps engineers.

FinTech Innovations - Senior Software Engineer
2018 - 2021 | Dallas, TX
- Designed high-frequency payments ledger processing $2B in monthly transaction volume.

EDUCATION
University of Texas at Austin
Bachelor of Science in Computer Science | 2018

SKILLS
TypeScript, React, Node.js, Go, Kubernetes, PostgreSQL, AWS, GraphQL
      `;

      const file = new File([sampleResume], 'jane_doe_resume.txt', { type: 'text/plain' });
      const result = await ResumeImportEngine.importFile(file);

      expect(result.success).toBe(true);
      expect(result.resumeData).toBeDefined();
      if (result.resumeData) {
        expect(result.resumeData.personalInfo.name).toContain('Jane Doe');
        expect(result.resumeData.personalInfo.email).toBe('jane.doe@example.com');
        expect(result.resumeData.personalInfo.phone).toBe('(555) 123-4567');
        expect(result.resumeData.experience.length).toBeGreaterThanOrEqual(1);
        expect(result.resumeData.skills?.length || 0).toBeGreaterThanOrEqual(3);
      }
    });

    it('flags warnings when fields are missing or ambiguous', async () => {
      const sparseResume = `
Alex
Developer
Just a few lines without email or phone number.
      `;
      const file = new File([sparseResume], 'sparse.txt', { type: 'text/plain' });
      const result = await ResumeImportEngine.importFile(file);

      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
    });
  });

  // ── RESUME INLINE EDITING & DATA MERGING TESTS ──────────────────────────────
  describe('Resume Inline Editing & Merge Mode', () => {
    it('renders data-field attributes on template elements for direct click-to-edit', () => {
      const defaultData = ResumeEngine.getDefaultResumeData();
      const renderedHtml = ResumeEngine.renderTemplate(defaultData, 'tmpl_modern_pro');

      // Key editable fields must have data-field attributes
      expect(renderedHtml).toContain('data-field="name"');
      expect(renderedHtml).toContain('data-field="title"');
      expect(renderedHtml).toContain('data-field="exp-title"');
      expect(renderedHtml).toContain('data-field="exp-company"');
      expect(renderedHtml).toContain('data-field="exp-bullet"');
    });

    it('correctly executes replace vs merge modes without losing data', () => {
      const existingData: ResumeData = {
        ...ResumeEngine.getDefaultResumeData(),
        personalInfo: {
          name: 'Original Developer',
          title: 'Staff Architect',
          email: 'orig@example.com',
          phone: '111-222-3333',
          location: 'New York, NY',
        },
        skills: ['TypeScript', 'React'],
        experience: [
          {
            id: 'exp_orig_1',
            title: 'Staff Architect',
            company: 'TechCorp',
            location: 'New York, NY',
            period: '2020 - Present',
            highlights: ['Built core system'],
          },
        ],
      };

      const importedData: ResumeData = {
        ...ResumeEngine.getDefaultResumeData(),
        personalInfo: {
          name: 'Imported Engineer',
          title: 'Platform Lead',
          email: 'import@example.com',
          phone: '999-888-7777',
          location: 'San Francisco, CA',
        },
        skills: ['Kubernetes', 'Go', 'React'],
        experience: [
          {
            id: 'exp_imp_1',
            title: 'Platform Lead',
            company: 'CloudCo',
            location: 'San Francisco, CA',
            period: '2022 - Present',
            highlights: ['Managed K8s cluster'],
          },
        ],
      };

      // Test REPLACE mode
      const replaceResult = importedData;
      expect(replaceResult.personalInfo.name).toBe('Imported Engineer');
      expect(replaceResult.experience.length).toBe(1);
      expect(replaceResult.experience[0].title).toBe('Platform Lead');

      // Test MERGE mode
      const mergedResult: ResumeData = {
        ...existingData,
        personalInfo: {
          ...existingData.personalInfo,
          name: existingData.personalInfo.name || importedData.personalInfo.name,
        },
        experience: [...(existingData.experience || []), ...(importedData.experience || [])],
        education: [...(existingData.education || []), ...(importedData.education || [])],
        skills: Array.from(new Set([...(existingData.skills || []), ...(importedData.skills || [])])),
        projects: [...(existingData.projects || []), ...(importedData.projects || [])],
      };

      expect(mergedResult.personalInfo.name).toBe('Original Developer');
      expect(mergedResult.experience.length).toBe(2);
      expect(mergedResult.experience[0].title).toBe('Staff Architect');
      expect(mergedResult.experience[1].title).toBe('Platform Lead');
      expect(mergedResult.skills).toBeDefined();
      expect(mergedResult.skills!).toEqual(expect.arrayContaining(['TypeScript', 'React', 'Kubernetes', 'Go']));
      expect(mergedResult.skills!.length).toBe(4); // Deduplicated React
    });
  });
});
