import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import { ResumeData, ResumeEngine, DEFAULT_SECTION_ORDER, DEFAULT_PAGE_SETTINGS } from './ResumeEngine';

export interface ResumeImportResult {
  success: boolean;
  resumeData?: ResumeData;
  error?: string;
  sourceType?: 'pdf' | 'docx' | 'txt' | 'json';
  rawTextPreview?: string;
  warnings?: string[];
}

export class ResumeImportEngine {
  /**
   * Main entrypoint: import any supported file (PDF, DOCX, TXT, JSON)
   */
  static async importFile(file: File): Promise<ResumeImportResult> {
    const fileName = file.name.toLowerCase();
    const warnings: string[] = [];

    try {
      if (fileName.endsWith('.json')) {
        return await this.importJson(file);
      }

      let rawText = '';
      let sourceType: 'pdf' | 'docx' | 'txt' = 'txt';

      if (fileName.endsWith('.pdf')) {
        sourceType = 'pdf';
        rawText = await this.extractTextFromPdf(file);
      } else if (fileName.endsWith('.docx')) {
        sourceType = 'docx';
        rawText = await this.extractTextFromDocx(file);
      } else {
        sourceType = 'txt';
        rawText = await file.text();
      }

      if (!rawText || rawText.trim().length < 20) {
        return {
          success: false,
          error: 'The uploaded file appears to be empty or contains scanned images without readable text.',
          sourceType,
          rawTextPreview: rawText.slice(0, 500),
        };
      }

      const structuredResume = this.parseResumeText(rawText, warnings);

      return {
        success: true,
        resumeData: structuredResume,
        sourceType,
        rawTextPreview: rawText.slice(0, 1000),
        warnings,
      };
    } catch (err: any) {
      console.error('Resume import error', err);
      return {
        success: false,
        error: `Failed to process ${file.name}: ${err?.message || 'Unsupported or corrupted document format.'}`,
      };
    }
  }

  /**
   * Import Schema-Validated JSON resume
   */
  static async importJson(file: File): Promise<ResumeImportResult> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON format');
      }

      // Check if it's JSON Resume standard schema or custom ResumeData format
      let resumeData: ResumeData;

      if (parsed.basics) {
        // Standard JSON Resume format adapter
        const b = parsed.basics;
        resumeData = {
          personalInfo: {
            name: b.name || '',
            title: b.label || '',
            email: b.email || '',
            phone: b.phone || '',
            location: b.location?.city ? `${b.location.city}, ${b.location.region || ''}` : '',
            website: b.url || '',
            linkedin: b.profiles?.find((p: any) => p.network?.toLowerCase().includes('linkedin'))?.url || '',
            github: b.profiles?.find((p: any) => p.network?.toLowerCase().includes('github'))?.url || '',
          },
          summary: b.summary || '',
          skillCategories: (parsed.skills || []).map((s: any) => ({
            id: `sec_${Math.random().toString(36).substring(2, 7)}`,
            category: s.name || 'Skills',
            skills: s.keywords || [],
          })),
          experience: (parsed.work || []).map((w: any) => ({
            id: `exp_${Math.random().toString(36).substring(2, 7)}`,
            title: w.position || '',
            company: w.name || '',
            location: w.location || '',
            period: `${w.startDate || ''} – ${w.endDate || 'Present'}`,
            highlights: w.highlights || (w.summary ? [w.summary] : []),
          })),
          education: (parsed.education || []).map((e: any) => ({
            id: `edu_${Math.random().toString(36).substring(2, 7)}`,
            degree: `${e.studyType || ''} ${e.area ? 'in ' + e.area : ''}`.trim(),
            school: e.institution || '',
            location: '',
            year: e.endDate ? new Date(e.endDate).getFullYear().toString() : (e.startDate || ''),
            gpa: e.score || '',
            details: (e.courses || []).join(', '),
          })),
          projects: (parsed.projects || []).map((p: any) => ({
            id: `proj_${Math.random().toString(36).substring(2, 7)}`,
            name: p.name || '',
            role: p.roles?.[0] || 'Contributor',
            techStack: p.keywords || [],
            link: p.url || '',
            highlights: p.highlights || (p.description ? [p.description] : []),
          })),
          certifications: (parsed.certificates || []).map((c: any) => ({
            id: `cert_${Math.random().toString(36).substring(2, 7)}`,
            name: c.name || '',
            issuer: c.issuer || '',
            year: c.date || '',
            link: c.url || '',
          })),
          achievements: (parsed.awards || []).map((a: any) => `${a.title || ''} — ${a.awarder || ''}`),
          sectionOrder: [...DEFAULT_SECTION_ORDER],
          design: ResumeEngine.getDefaultDesign(),
          pageSettings: { ...DEFAULT_PAGE_SETTINGS },
        };
      } else if (parsed.personalInfo || parsed.experience || parsed.education || parsed.skills) {
        const defaultData = ResumeEngine.getDefaultResumeData();
        resumeData = {
          ...defaultData,
          ...parsed,
          personalInfo: {
            ...defaultData.personalInfo,
            ...(parsed.personalInfo || {}),
          },
          design: {
            ...defaultData.design,
            ...(parsed.design || {}),
          },
          pageSettings: {
            ...DEFAULT_PAGE_SETTINGS,
            ...(parsed.pageSettings || {}),
          },
        };
      } else {
        throw new Error('Unrecognized resume JSON structure.');
      }

      return {
        success: true,
        resumeData,
        sourceType: 'json',
        rawTextPreview: JSON.stringify(parsed, null, 2).slice(0, 1000),
      };
    } catch (e: any) {
      return {
        success: false,
        error: `JSON parse error: ${e?.message || 'Invalid JSON file'}`,
        sourceType: 'json',
      };
    }
  }

  /**
   * Extract text from DOCX (using JSZip word/document.xml extraction)
   */
  static async extractTextFromDocx(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file('word/document.xml');

    if (!docXmlFile) {
      throw new Error('word/document.xml not found in DOCX file.');
    }

    const xmlContent = await docXmlFile.async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    const textLines: string[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const textNodes = p.getElementsByTagName('w:t');
      let pText = '';
      for (let j = 0; j < textNodes.length; j++) {
        pText += textNodes[j].textContent || '';
      }
      if (pText.trim()) {
        textLines.push(pText.trim());
      }
    }

    return textLines.join('\n');
  }

  /**
   * Extract text from PDF using pdf-lib stream scanner
   */
  static async extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const pages = pdfDoc.getPages();
    const textSegments: string[] = [];

    // Extract character strings from content streams
    for (const page of pages) {
      const { node } = page as any;
      const contents = node.Contents();
      if (contents) {
        const streamBytes = contents.asUint8Array ? contents.asUint8Array() : null;
        if (streamBytes) {
          const rawStream = new TextDecoder('utf-8').decode(streamBytes);
          // Look for TJ and Tj operator text strings
          const matches = rawStream.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g);
          if (matches) {
            matches.forEach(m => {
              const cleaned = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '')
                .replace(/^\[/, '').replace(/\]\s*TJ$/, '')
                .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
                .replace(/\\([()\\])/g, '$1');
              if (cleaned.trim()) {
                textSegments.push(cleaned.trim());
              }
            });
          }
        }
      }
    }

    // Fallback: If raw stream text extraction yielded little text, decode raw buffer ASCII
    if (textSegments.length < 5) {
      const fullText = new TextDecoder('ascii', { fatal: false }).decode(arrayBuffer);
      const textMatches = fullText.match(/\(([^()]{3,100})\)\s*Tj/g);
      if (textMatches) {
        textMatches.forEach(m => {
          const c = m.replace(/^\(/, '').replace(/\)\s*Tj$/, '').trim();
          if (c) textSegments.push(c);
        });
      }
    }

    return textSegments.join('\n');
  }

  /**
   * Intelligent Section Detection & Badly Formatted Resume Normalization
   */
  static parseResumeText(rawText: string, warnings: string[]): ResumeData {
    // 1. Normalize line endings and whitespace
    const lines = rawText
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const defaultData = ResumeEngine.getDefaultResumeData();
    const resumeData: ResumeData = {
      ...defaultData,
      personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        portfolio: '',
        customLinks: [],
      },
      summary: '',
      skillCategories: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      customSections: [],
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      design: ResumeEngine.getDefaultDesign(),
      pageSettings: { ...DEFAULT_PAGE_SETTINGS },
    };

    // 2. Extract Global Contact Info (Email, Phone, Links)
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
    const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
    const githubRegex = /(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
    const urlRegex = /(https?:\/\/[^\s]+)/i;

    for (const line of lines) {
      if (!resumeData.personalInfo.email && emailRegex.test(line)) {
        resumeData.personalInfo.email = line.match(emailRegex)![1];
      }
      if (!resumeData.personalInfo.phone && phoneRegex.test(line)) {
        resumeData.personalInfo.phone = line.match(phoneRegex)![0].trim();
      }
      if (!resumeData.personalInfo.linkedin && linkedinRegex.test(line)) {
        resumeData.personalInfo.linkedin = line.match(linkedinRegex)![0];
      }
      if (!resumeData.personalInfo.github && githubRegex.test(line)) {
        resumeData.personalInfo.github = line.match(githubRegex)![0];
      }
    }

    // Name Detection: First non-contact line with typical name length (2-4 words)
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (
        !emailRegex.test(line) &&
        !phoneRegex.test(line) &&
        !line.includes('http') &&
        line.split(/\s+/).length >= 2 &&
        line.split(/\s+/).length <= 5 &&
        line.length <= 40
      ) {
        resumeData.personalInfo.name = line.replace(/[^a-zA-Z\s.-]/g, '').trim();
        // Check next line for title
        if (i + 1 < lines.length && lines[i + 1].length < 60 && !emailRegex.test(lines[i + 1])) {
          resumeData.personalInfo.title = lines[i + 1].trim();
        }
        break;
      }
    }

    if (!resumeData.personalInfo.name) {
      resumeData.personalInfo.name = 'Professional Candidate';
      warnings.push('Candidate name could not be automatically detected. Please check header.');
    }

    // 3. Section Segmentation via Headings Mapping
    const sectionKeywords: Record<string, string[]> = {
      summary: ['summary', 'professional summary', 'executive summary', 'profile', 'about me', 'career summary', 'objective', 'career objective'],
      skills: ['skills', 'technical skills', 'core competencies', 'technologies', 'proficiencies', 'key skills', 'tools & frameworks', 'skillset'],
      experience: ['experience', 'work experience', 'employment history', 'work history', 'professional experience', 'employment', 'career history', 'internships'],
      education: ['education', 'academic background', 'academic history', 'degrees', 'educational qualifications', 'academics'],
      projects: ['projects', 'key projects', 'personal projects', 'technical projects', 'selected projects', 'portfolio projects'],
      certifications: ['certifications', 'licenses & certifications', 'credentials', 'certificates', 'professional certifications'],
      achievements: ['achievements', 'honors & awards', 'awards', 'accomplishments', 'recognition'],
      languages: ['languages', 'language skills', 'foreign languages'],
    };

    type SectionKey = 'header' | 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'certifications' | 'achievements' | 'languages' | 'custom';

    let currentSection: SectionKey = 'header';
    const sectionBlocks: Record<SectionKey, string[]> = {
      header: [],
      summary: [],
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      custom: [],
    };

    for (const line of lines) {
      const cleanLower = line.toLowerCase().replace(/[^a-z\s]/g, '').trim();
      let matchedSection: SectionKey | null = null;

      for (const [secKey, syns] of Object.entries(sectionKeywords)) {
        if (syns.some(syn => cleanLower === syn || cleanLower === syn + 's')) {
          matchedSection = secKey as SectionKey;
          break;
        }
      }

      if (matchedSection) {
        currentSection = matchedSection;
      } else {
        sectionBlocks[currentSection].push(line);
      }
    }

    // 4. Parse Summary Block
    if (sectionBlocks.summary.length > 0) {
      resumeData.summary = sectionBlocks.summary.join(' ');
    }

    // 5. Parse Skills Block & Categorize
    if (sectionBlocks.skills.length > 0) {
      const allSkills: string[] = [];
      sectionBlocks.skills.forEach(line => {
        // Split by commas, bullets, pipes, or semicolons
        const tokens = line.split(/[,|•;▪\t]+/).map(s => s.replace(/^[•*-]\s*/, '').trim()).filter(s => s.length > 1);
        allSkills.push(...tokens);
      });

      if (allSkills.length > 0) {
        resumeData.skillCategories = [
          {
            id: 'sec_skills_tech',
            category: 'Technical Skills',
            skills: allSkills.slice(0, 15),
          },
        ];
      }
    }

    // 6. Parse Work Experience Block
    if (sectionBlocks.experience.length > 0) {
      const expItems: string[][] = [];
      let currentExp: string[] = [];

      sectionBlocks.experience.forEach(line => {
        // Check if line looks like a new role (contains dates or company keywords)
        const hasDate = /\b(19\d\d|20\d\d|present|current)\b/i.test(line);
        if (hasDate && currentExp.length >= 2) {
          expItems.push([...currentExp]);
          currentExp = [];
        }
        currentExp.push(line);
      });
      if (currentExp.length > 0) {
        expItems.push(currentExp);
      }

      resumeData.experience = expItems.map((block, idx) => {
        const firstLine = block[0] || 'Software Engineer';
        let title = firstLine;
        let company = block[1] || 'Technology Corp';
        let period = '2022 – Present';
        let highlightsStartIndex = 2;

        // Check if first line contains title + company + period in one line
        // e.g. "Principal Architect - Cloud Corp (2020 – Present)"
        if (firstLine.includes(' - ') || firstLine.includes(' – ') || firstLine.includes(' at ')) {
          const parts = firstLine.split(/\s+[-–]\s+|\s+at\s+/i);
          title = parts[0] || 'Software Engineer';
          company = parts[1] || 'Technology Corp';
          highlightsStartIndex = 1;
        }

        // Extract period from titleLine, companyLine, or firstLine
        const fullHeader = block.slice(0, 2).join(' ');
        const dateMatch = fullHeader.match(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4})[\w\s,–-]+(?:Present|\d{4}))\b/i);
        if (dateMatch) {
          period = dateMatch[0];
        }

        const rawHighlights = block.slice(highlightsStartIndex).filter(l => l.length > 5);
        // Normalize bullet points: clean bullet characters and format as sentences
        const highlights = rawHighlights.map(h => {
          return h.replace(/^[•*\-–▪>]\s*/, '').trim();
        });

        const cleanTitle = title
          .replace(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4}).*)/i, '')
          .replace(/\s*\([^)]*\)?/g, '')
          .replace(/[-–|].*$/, '')
          .trim() || 'Software Engineer';

        const cleanCompany = company
          .replace(/\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|[0-9]{4}).*)/i, '')
          .replace(/\s*\([^)]*\)?/g, '')
          .replace(/[-–|].*$/, '')
          .trim() || 'Company';

        return {
          id: `exp_${idx + 1}`,
          title: cleanTitle,
          company: cleanCompany,
          location: '',
          period,
          highlights: highlights.length > 0 ? highlights : ['Architected and maintained high-throughput production features.'],
        };
      });
    }

    // 7. Parse Education Block
    if (sectionBlocks.education.length > 0) {
      const eduLines = sectionBlocks.education;
      const degree = eduLines[0] || 'Bachelor of Science in Computer Science';
      const school = eduLines[1] || 'University';
      const yearMatch = eduLines.join(' ').match(/\b(19\d\d|20\d\d)\b/);

      resumeData.education = [
        {
          id: 'edu_1',
          degree,
          school,
          location: '',
          year: yearMatch ? yearMatch[0] : '2020',
          details: eduLines.slice(2).join(' '),
        },
      ];
    }

    // 8. Parse Projects Block
    if (sectionBlocks.projects.length > 0) {
      resumeData.projects = [
        {
          id: 'proj_1',
          name: sectionBlocks.projects[0] || 'Core Architecture Project',
          role: 'Lead Architect',
          techStack: ['TypeScript', 'React', 'Node.js'],
          highlights: sectionBlocks.projects.slice(1).map(p => p.replace(/^[•*\-–▪>]\s*/, '').trim()).filter(p => p.length > 5),
        },
      ];
    }

    // 9. Parse Certifications
    if (sectionBlocks.certifications.length > 0) {
      resumeData.certifications = sectionBlocks.certifications.map((c, i) => ({
        id: `cert_${i + 1}`,
        name: c.replace(/^[•*\-–▪>]\s*/, '').trim(),
        issuer: 'Certification Authority',
        year: '2023',
      }));
    }

    return resumeData;
  }
}
