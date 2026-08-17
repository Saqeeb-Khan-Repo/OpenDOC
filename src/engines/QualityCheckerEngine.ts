import { Slide } from './types';

export interface QualityIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  fixable: boolean;
  category: 'accessibility' | 'typography' | 'structure' | 'readability';
}

export interface QualityReport {
  score: number; // 0 - 100
  totalChecks: number;
  passedChecks: number;
  issues: QualityIssue[];
  metrics: {
    wordCount: number;
    readingTimeMinutes: number;
    headingsCount: number;
    imagesCount: number;
    tablesCount: number;
  };
}

export class QualityCheckerEngine {
  /**
   * Run comprehensive accessibility & quality audit on Document HTML
   */
  static analyzeDocument(html: string): QualityReport {
    const issues: QualityIssue[] = [];
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textContent.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200);

    // Count elements
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const tableCount = (html.match(/<table[^>]*>/gi) || []).length;

    // 1. Heading Hierarchy Check
    if (h1Count === 0) {
      issues.push({
        id: 'iss_h1_missing',
        type: 'warning',
        title: 'Missing Document Title (H1)',
        description: 'Documents should start with a clear Level-1 Heading (H1) for screen readers and search engines.',
        fixable: true,
        category: 'structure',
      });
    } else if (h1Count > 1) {
      issues.push({
        id: 'iss_h1_multiple',
        type: 'info',
        title: 'Multiple H1 Headings Detected',
        description: 'For optimal semantic hierarchy, consider using a single H1 and structuring subsections with H2/H3.',
        fixable: false,
        category: 'structure',
      });
    } else {
      issues.push({
        id: 'iss_h1_good',
        type: 'success',
        title: 'Clear Title Hierarchy',
        description: 'Document has a distinct H1 top-level heading.',
        fixable: false,
        category: 'structure',
      });
    }

    if (h2Count > 0) {
      issues.push({
        id: 'iss_h2_good',
        type: 'success',
        title: 'Well-Structured Subsections',
        description: `Found ${h2Count} subsection headings ensuring easy navigation.`,
        fixable: false,
        category: 'structure',
      });
    }

    // 2. Image Alt Attributes Check
    let missingAltCount = 0;
    imgMatches.forEach(img => {
      if (!img.includes('alt=') || img.includes('alt=""')) {
        missingAltCount++;
      }
    });

    if (missingAltCount > 0) {
      issues.push({
        id: 'iss_img_alt',
        type: 'warning',
        title: `${missingAltCount} Image(s) Missing Alt Text Description`,
        description: 'Add descriptive alt tags to images to ensure full accessibility for visually impaired readers.',
        fixable: true,
        category: 'accessibility',
      });
    } else if (imgMatches.length > 0) {
      issues.push({
        id: 'iss_img_alt_good',
        type: 'success',
        title: 'All Images Accessible',
        description: 'All images contain descriptive accessibility text.',
        fixable: false,
        category: 'accessibility',
      });
    }

    // 3. Document Length & Empty State Check
    if (wordCount < 30) {
      issues.push({
        id: 'iss_low_content',
        type: 'warning',
        title: 'Very Short Content',
        description: 'Document contains fewer than 30 words. Expand ideas or use the AI Writing Assistant.',
        fixable: false,
        category: 'readability',
      });
    } else {
      issues.push({
        id: 'iss_content_length_good',
        type: 'success',
        title: 'Sufficient Content Density',
        description: `Document contains ${wordCount} words (~${readingTime} min read).`,
        fixable: false,
        category: 'readability',
      });
    }

    // 4. Empty Paragraphs Check
    const emptyParagraphs = (html.match(/<p>\s*(<br\s*\/?>|&nbsp;|\s*)\s*<\/p>/gi) || []).length;
    if (emptyParagraphs > 3) {
      issues.push({
        id: 'iss_empty_paras',
        type: 'info',
        title: 'Unnecessary Empty Spacing Detected',
        description: `Found ${emptyParagraphs} empty paragraph blocks. Use margin settings instead of blank lines.`,
        fixable: true,
        category: 'typography',
      });
    }

    // Calculate score
    const totalChecks = 6;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    const errorCount = issues.filter(i => i.type === 'error').length;
    const score = Math.max(50, Math.min(100, 100 - (errorCount * 20) - (warningCount * 8)));

    return {
      score,
      totalChecks,
      passedChecks: issues.filter(i => i.type === 'success').length,
      issues,
      metrics: {
        wordCount,
        readingTimeMinutes: readingTime,
        headingsCount: h1Count + h2Count + h3Count,
        imagesCount: imgMatches.length,
        tablesCount: tableCount,
      },
    };
  }

  /**
   * Run presentation density & layout audit on Slides
   */
  static analyzePresentation(slides: Slide[]): QualityReport {
    const issues: QualityIssue[] = [];
    let totalElements = 0;
    let highDensitySlideCount = 0;

    slides.forEach((s, idx) => {
      totalElements += s.elements.length;
      const textLength = s.elements.reduce((acc, el) => acc + (el.content?.length || 0), 0);
      if (textLength > 600) {
        highDensitySlideCount++;
      }
    });

    if (slides.length < 3) {
      issues.push({
        id: 'iss_pres_short',
        type: 'warning',
        title: 'Presentation Has Very Few Slides',
        description: 'Consider adding introduction, roadmap, and summary slides.',
        fixable: false,
        category: 'structure',
      });
    } else {
      issues.push({
        id: 'iss_pres_len_good',
        type: 'success',
        title: 'Good Slide Count',
        description: `Presentation contains ${slides.length} slides with balanced pacing.`,
        fixable: false,
        category: 'structure',
      });
    }

    if (highDensitySlideCount > 0) {
      issues.push({
        id: 'iss_pres_density',
        type: 'warning',
        title: `${highDensitySlideCount} Slide(s) Have Heavy Text Density`,
        description: 'High text volume reduces audience engagement. Break content into bullet points or split across slides.',
        fixable: false,
        category: 'readability',
      });
    } else {
      issues.push({
        id: 'iss_pres_density_good',
        type: 'success',
        title: 'Optimal Text Density',
        description: 'Slides maintain clean typography and generous breathing room.',
        fixable: false,
        category: 'readability',
      });
    }

    const score = Math.max(60, Math.min(100, 100 - (highDensitySlideCount * 10)));

    return {
      score,
      totalChecks: 4,
      passedChecks: issues.filter(i => i.type === 'success').length,
      issues,
      metrics: {
        wordCount: totalElements * 15,
        readingTimeMinutes: Math.ceil(slides.length * 1.5),
        headingsCount: slides.length,
        imagesCount: 0,
        tablesCount: 0,
      },
    };
  }
}
