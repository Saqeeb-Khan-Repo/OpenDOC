import { ResumeData } from '@/engines/ResumeEngine';

export interface ResumeAuditItem {
  id: string;
  category: 'contact' | 'summary' | 'experience' | 'skills' | 'projects' | 'links' | 'length';
  level: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

export interface ResumeAuditReport {
  score: number; // 0 - 100
  items: ResumeAuditItem[];
  pageEstimate: number;
  lengthRecommendation: string;
  validLinksCount: number;
  invalidLinksCount: number;
}

export class ResumeValidator {
  /**
   * Validate single URL string safely
   */
  static isValidUrl(url?: string): boolean {
    if (!url || !url.trim()) return true; // empty is handled separately
    const clean = url.trim();
    // Allow standard schemes or simple domains like github.com/username
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/i;
    const emailPattern = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i;
    const telPattern = /^tel:\+?[\d\s-().]+$/i;
    return urlPattern.test(clean) || emailPattern.test(clean) || telPattern.test(clean);
  }

  /**
   * Validate Email format
   */
  static isValidEmail(email?: string): boolean {
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /**
   * Validate Phone format
   */
  static isValidPhone(phone?: string): boolean {
    if (!phone) return false;
    return /^[+]?[\d\s-().]{7,25}$/.test(phone.trim());
  }

  /**
   * Estimate page count based on character and item density
   */
  static estimatePageCount(data: ResumeData): { pages: number; recommendation: string } {
    let totalScore = 0;

    // Header & summary weight
    totalScore += 120;
    if (data.summary) totalScore += data.summary.length * 0.4;
    if (data.objective) totalScore += data.objective.length * 0.4;

    // Experience weight
    (data.experience || []).forEach(exp => {
      totalScore += 70; // Title, company, dates
      (exp.highlights || []).forEach(h => {
        totalScore += Math.max(30, h.length * 0.5);
      });
    });

    // Education weight
    (data.education || []).forEach(edu => {
      totalScore += 50;
      if (edu.details) totalScore += edu.details.length * 0.3;
    });

    // Projects weight
    (data.projects || []).forEach(proj => {
      totalScore += 50;
      (proj.highlights || []).forEach(h => {
        totalScore += Math.max(25, h.length * 0.4);
      });
    });

    // Skills weight
    (data.skillCategories || []).forEach(sc => {
      totalScore += 35 + sc.skills.length * 5;
    });

    // Custom sections weight
    (data.customSections || []).forEach(cs => {
      totalScore += 40;
      (cs.items || []).forEach(it => {
        totalScore += 45;
        if (it.description) totalScore += it.description.length * 0.3;
        (it.bullets || []).forEach(b => {
          totalScore += 25;
        });
      });
    });

    // Baseline: ~1250 score units per standard A4 page with default margins
    const pageMargin = data.design?.spacing?.pageMargin || 32;
    const spacingFactor = (data.design?.spacing?.lineHeight || 1.5) / 1.5;
    const adjustedPageCapacity = 1250 * (32 / pageMargin) * (1 / spacingFactor);

    const pages = Math.max(1, Math.ceil(totalScore / adjustedPageCapacity));

    let recommendation = '1 Page — Perfect length for early-career & standard applications.';
    if (pages === 2) {
      recommendation = '2 Pages — Ideal for senior engineers, leaders, and 5+ years experience.';
    } else if (pages >= 3) {
      recommendation = '3+ Pages — Consider trimming older experience to fit within 2 pages unless academic/federal.';
    }

    return { pages, recommendation };
  }

  /**
   * Run full audit and calculate quality score (0-100)
   */
  static auditResume(data: ResumeData): ResumeAuditReport {
    const items: ResumeAuditItem[] = [];
    let score = 100;
    let validLinks = 0;
    let invalidLinks = 0;

    const p = data.personalInfo || {};

    // 1. Contact Information Checks
    if (!p.name || p.name.trim().length < 2) {
      items.push({
        id: 'contact_name',
        category: 'contact',
        level: 'warning',
        title: 'Missing Full Name',
        message: 'Add your full name at the top of your resume.',
      });
      score -= 15;
    } else {
      items.push({
        id: 'contact_name_ok',
        category: 'contact',
        level: 'success',
        title: 'Full Name Provided',
        message: `Name: ${p.name}`,
      });
    }

    if (!p.title || p.title.trim().length < 2) {
      items.push({
        id: 'contact_title',
        category: 'contact',
        level: 'warning',
        title: 'Missing Professional Title',
        message: 'Add a target job title (e.g. Senior Full-Stack Engineer) to help ATS keyword matching.',
      });
      score -= 10;
    }

    if (!p.email || !this.isValidEmail(p.email)) {
      items.push({
        id: 'contact_email',
        category: 'contact',
        level: 'warning',
        title: 'Missing or Invalid Email',
        message: 'Provide a valid professional email address.',
      });
      score -= 15;
      invalidLinks++;
    } else {
      validLinks++;
      items.push({
        id: 'contact_email_ok',
        category: 'contact',
        level: 'success',
        title: 'Professional Email Set',
        message: p.email,
      });
    }

    if (!p.phone) {
      items.push({
        id: 'contact_phone',
        category: 'contact',
        level: 'info',
        title: 'Phone Number Optional',
        message: 'Adding a phone number helps recruiters contact you directly.',
      });
      score -= 5;
    } else {
      validLinks++;
    }

    if (!p.location) {
      items.push({
        id: 'contact_location',
        category: 'contact',
        level: 'info',
        title: 'Location (City, State / Remote)',
        message: 'Adding your city/state or "Remote" helps matching local and remote jobs.',
      });
      score -= 3;
    }

    // 2. Summary Check
    if (!data.summary || data.summary.trim().length < 30) {
      items.push({
        id: 'summary_short',
        category: 'summary',
        level: 'warning',
        title: 'Professional Summary is Brief',
        message: 'A 2-4 sentence summary highlighting key technical domains and achievements boosts recruiter response rate.',
      });
      score -= 10;
    } else {
      items.push({
        id: 'summary_ok',
        category: 'summary',
        level: 'success',
        title: 'Professional Summary',
        message: `${data.summary.slice(0, 70)}...`,
      });
    }

    // 3. Work Experience & Metric Quantification
    const exps = data.experience || [];
    if (exps.length === 0) {
      items.push({
        id: 'exp_none',
        category: 'experience',
        level: 'warning',
        title: 'No Work Experience Listed',
        message: 'Add past employment, freelance roles, or internships.',
      });
      score -= 20;
    } else {
      let totalBullets = 0;
      let metricBullets = 0;
      const metricRegex = /(\d+%|\$\d+|\d+x|\b\d{2,}\b|slashed|improved|architected|led|built|scaled)/i;

      exps.forEach(exp => {
        (exp.highlights || []).forEach(h => {
          totalBullets++;
          if (metricRegex.test(h)) metricBullets++;
        });
      });

      if (totalBullets < 2) {
        items.push({
          id: 'exp_bullets_few',
          category: 'experience',
          level: 'warning',
          title: 'Add More Detail to Experience',
          message: 'Add 2-4 bullet points per role describing what you built and the impact.',
        });
        score -= 8;
      } else if (metricBullets > 0) {
        items.push({
          id: 'exp_metrics_ok',
          category: 'experience',
          level: 'success',
          title: 'Measurable Achievements Found',
          message: `${metricBullets} of ${totalBullets} bullets contain quantifiable impact and metrics.`,
        });
      } else {
        items.push({
          id: 'exp_metrics_suggest',
          category: 'experience',
          level: 'info',
          title: 'Quantify Your Results',
          message: 'Try adding numbers, percentages (e.g. "improved speed by 40%"), or scale metrics to your bullets.',
        });
        score -= 5;
      }
    }

    // 4. Skills & Competencies Check
    const skillCategories = data.skillCategories || [];
    const totalSkills = skillCategories.reduce((sum, sc) => sum + sc.skills.length, 0);
    if (totalSkills < 4) {
      items.push({
        id: 'skills_few',
        category: 'skills',
        level: 'warning',
        title: 'Add More Skills Keywords',
        message: 'Add relevant tools, frameworks, and programming languages for ATS keyword matching.',
      });
      score -= 10;
    } else {
      items.push({
        id: 'skills_ok',
        category: 'skills',
        level: 'success',
        title: 'Skills & Keywords',
        message: `${totalSkills} technical and core competencies defined.`,
      });
    }

    // 5. URL Link Format Verification
    const urlsToCheck: { name: string; url?: string }[] = [
      { name: 'Website', url: p.website },
      { name: 'LinkedIn', url: p.linkedin },
      { name: 'GitHub', url: p.github },
      { name: 'Portfolio', url: p.portfolio },
    ];
    (p.customLinks || []).forEach(cl => urlsToCheck.push({ name: cl.label || 'Custom Link', url: cl.url }));
    (data.projects || []).forEach(pr => {
      if (pr.link) urlsToCheck.push({ name: `Project (${pr.name})`, url: pr.link });
      if (pr.liveDemoUrl) urlsToCheck.push({ name: `Demo (${pr.name})`, url: pr.liveDemoUrl });
      if (pr.githubUrl) urlsToCheck.push({ name: `GitHub (${pr.name})`, url: pr.githubUrl });
    });

    urlsToCheck.forEach(item => {
      if (item.url && item.url.trim()) {
        if (this.isValidUrl(item.url)) {
          validLinks++;
        } else {
          invalidLinks++;
          items.push({
            id: `link_invalid_${item.name}`,
            category: 'links',
            level: 'warning',
            title: `Invalid Link URL: ${item.name}`,
            message: `"${item.url}" appears malformed. Use format https://example.com`,
          });
          score -= 4;
        }
      }
    });

    // 6. Page Estimate Calculation
    const { pages, recommendation } = this.estimatePageCount(data);
    items.push({
      id: 'page_length',
      category: 'length',
      level: 'info',
      title: `Resume Length: ${pages} Page${pages > 1 ? 's' : ''}`,
      message: recommendation,
    });

    const finalScore = Math.max(10, Math.min(100, Math.round(score)));

    return {
      score: finalScore,
      items,
      pageEstimate: pages,
      lengthRecommendation: recommendation,
      validLinksCount: validLinks,
      invalidLinksCount: invalidLinks,
    };
  }

  /**
   * Analyze Resume against Job Description
   */
  static matchJobDescription(data: ResumeData, jobDescription: string): {
    matchScore: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    suggestedAreas: string[];
  } {
    if (!jobDescription || jobDescription.trim().length < 20) {
      return {
        matchScore: 0,
        matchedKeywords: [],
        missingKeywords: [],
        suggestedAreas: ['Paste a complete job description to analyze keyword coverage and ATS alignment.'],
      };
    }

    // Common technical and professional keywords dictionary
    const knownTerms = [
      'c#', '.net', 'asp.net', 'react', 'typescript', 'javascript', 'python', 'java', 'c++', 'go', 'golang',
      'rust', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'kafka', 'docker', 'kubernetes', 'aws',
      'azure', 'gcp', 'rest api', 'graphql', 'ci/cd', 'microservices', 'git', 'linux', 'node.js', 'html',
      'css', 'tailwind', 'redux', 'next.js', 'vue', 'angular', 'django', 'fastapi', 'flask', 'spring boot',
      'agile', 'scrum', 'tdd', 'unit testing', 'system design', 'distributed systems', 'data structures',
      'algorithms', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'nlp', 'llm', 'etl',
      'spark', 'tableau', 'power bi', 'excel', 'security', 'oauth', 'jwt', 'devops', 'terraform', 'ansible'
    ];

    const jdLower = jobDescription.toLowerCase();

    // Extract terms present in Job Description
    const jdTerms = new Set<string>();
    knownTerms.forEach(term => {
      // Word boundary regex check
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(jdLower)) {
        jdTerms.add(term);
      }
    });

    // Also extract capitalized acronyms or nouns from JD (e.g. CKA, AWS, SaaS)
    const customWords = jobDescription.match(/\b[A-Z][a-zA-Z0-9_+#.]{2,15}\b/g) || [];
    customWords.forEach(w => {
      const clean = w.toLowerCase();
      if (clean.length >= 3 && !['the', 'and', 'for', 'with', 'you', 'will', 'our', 'are', 'this', 'that', 'from'].includes(clean)) {
        jdTerms.add(clean);
      }
    });

    // Build resume text corpus
    const resumeCorpusParts: string[] = [
      data.personalInfo.name || '',
      data.personalInfo.title || '',
      data.summary || '',
      data.objective || '',
    ];

    (data.skillCategories || []).forEach(sc => {
      resumeCorpusParts.push(sc.category);
      resumeCorpusParts.push(...sc.skills);
    });

    (data.experience || []).forEach(exp => {
      resumeCorpusParts.push(exp.title, exp.company, exp.location, ...exp.highlights);
    });

    (data.projects || []).forEach(pr => {
      resumeCorpusParts.push(pr.name, pr.role, ...(pr.techStack || []), ...pr.highlights);
    });

    (data.education || []).forEach(edu => {
      resumeCorpusParts.push(edu.degree, edu.school, edu.details || '');
    });

    (data.certifications || []).forEach(c => {
      resumeCorpusParts.push(c.name, c.issuer);
    });

    const resumeCorpus = resumeCorpusParts.join(' ').toLowerCase();

    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    Array.from(jdTerms).forEach(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(resumeCorpus)) {
        matchedKeywords.push(term);
      } else {
        missingKeywords.push(term);
      }
    });

    const total = jdTerms.size;
    const matchScore = total > 0 ? Math.min(100, Math.round((matchedKeywords.length / total) * 100)) : 70;

    const suggestedAreas: string[] = [];
    if (missingKeywords.length > 0) {
      suggestedAreas.push(`Consider highlighting relevant experience with: ${missingKeywords.slice(0, 5).join(', ')} (if you possess these skills).`);
    }
    if (matchedKeywords.length >= 5) {
      suggestedAreas.push(`Strong keyword alignment with core JD requirements (${matchedKeywords.length} matching terms detected).`);
    } else {
      suggestedAreas.push('Incorporate standard industry terminology from the job description in your project and experience highlights.');
    }

    return {
      matchScore,
      matchedKeywords,
      missingKeywords,
      suggestedAreas,
    };
  }
}

