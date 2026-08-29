export interface ResumeCustomLink {
  label: string;
  url: string;
}

export interface ResumePhoto {
  url: string;
  style?: 'circle' | 'square' | 'rounded' | 'none';
  size?: 'sm' | 'md' | 'lg';
}

export interface ResumePersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  customLinks?: ResumeCustomLink[];
  photo?: ResumePhoto;
}

export interface ResumeExperience {
  id?: string;
  title: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  website?: string;
  highlights: string[];
}

export interface ResumeEducation {
  id?: string;
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa?: string;
  details?: string;
}

export interface ResumeProject {
  id?: string;
  name: string;
  role: string;
  techStack: string[];
  link?: string;
  projectUrl?: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  highlights: string[];
}

export interface ResumeSkillCategory {
  id?: string;
  category: string;
  skills: string[];
}

export interface ResumeCertification {
  id?: string;
  name: string;
  issuer: string;
  year: string;
  link?: string;
}

export interface ResumeAward {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

export interface ResumePublication {
  id?: string;
  title: string;
  publisher: string;
  date: string;
  link?: string;
  description?: string;
}

export interface ResumeLanguage {
  id?: string;
  language: string;
  proficiency: string;
}

export interface ResumeVolunteer {
  id?: string;
  role: string;
  organization: string;
  period: string;
  highlights: string[];
}

export interface ResumeOrganization {
  id?: string;
  role: string;
  name: string;
  period: string;
}

export interface ResumeReference {
  id?: string;
  name: string;
  title: string;
  company: string;
  contact: string;
}

export interface ResumeCustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  link?: string;
  bullets?: string[];
}

export interface ResumeCustomSection {
  id: string;
  title: string;
  style?: 'standard' | 'cards' | 'bullets' | 'compact';
  items: ResumeCustomSectionItem[];
}

export type ResumeSectionType =
  | 'personal'
  | 'summary'
  | 'objective'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'awards'
  | 'publications'
  | 'languages'
  | 'interests'
  | 'volunteer'
  | 'organizations'
  | 'references'
  | 'custom';

export interface ResumeSectionConfig {
  id: string;
  type: ResumeSectionType;
  title: string;
  visible: boolean;
  customSectionId?: string;
}

export type ResumeHeaderLayout =
  | 'classic'
  | 'modern'
  | 'minimal'
  | 'centered'
  | 'split'
  | 'compact'
  | 'executive';

export interface ResumeColors {
  primary: string;
  accent: string;
  heading: string;
  body: string;
  muted: string;
  link: string;
  border: string;
  background: string;
}

export interface ResumeSpacing {
  pageMargin: number;
  sectionGap: number;
  entryGap: number;
  paragraphGap: number;
  lineHeight: number;
}

export interface ResumeDesignConfig {
  headerLayout: ResumeHeaderLayout;
  fontFamily: string;
  typographyPreset: 'small' | 'normal' | 'large' | 'custom';
  nameSize: number;
  headingSize: number;
  bodySize: number;
  metadataSize: number;
  lineHeight: number;
  letterSpacing: string;
  textAlign: 'left' | 'center' | 'justify';
  palette: string;
  colors: ResumeColors;
  spacingPreset: 'compact' | 'balanced' | 'comfortable' | 'custom';
  spacing: ResumeSpacing;
  paperSize: 'A4' | 'Letter';
  skillsStyle: 'grid' | 'list' | 'tags' | 'columns' | 'categories' | 'compact-rows';
  bulletStyle: 'dot' | 'dash' | 'arrow' | 'check' | 'minimal';
  headingStyle: 'underline' | 'left-border' | 'banner' | 'minimal-uppercase' | 'bold-divider' | 'centered';
  projectStyle: 'standard' | 'cards' | 'compact';
  educationStyle: 'classic' | 'compact' | 'timeline';
}

export interface ResumeData {
  personalInfo: ResumePersonalInfo;
  summary: string;
  objective?: string;
  skillCategories: ResumeSkillCategory[];
  skills?: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  achievements: string[];
  awards?: ResumeAward[];
  publications?: ResumePublication[];
  languages?: ResumeLanguage[];
  interests?: string[];
  volunteer?: ResumeVolunteer[];
  organizations?: ResumeOrganization[];
  references?: ResumeReference[];
  customSections?: ResumeCustomSection[];
  sectionOrder?: ResumeSectionConfig[];
  design?: ResumeDesignConfig;
}

export interface ResumeTemplateMeta {
  id: string;
  name: string;
  category: 'All' | 'ATS' | 'Professional' | 'Modern' | 'Creative' | 'Executive' | 'Developer' | 'Student' | 'Academic' | string;
  description: string;
  thumbnailColor: string;
  layout: 'single-column' | 'two-column' | 'technical' | 'academic' | 'executive' | 'compact' | 'creative';
  defaultDesign?: Partial<ResumeDesignConfig>;
}

// ── COLOR PALETTES ───────────────────────────────────────────────────────────
export const RESUME_PALETTES: { id: string; name: string; colors: ResumeColors }[] = [
  {
    id: 'professional',
    name: 'Professional Blue',
    colors: {
      primary: '#2563eb',
      accent: '#3b82f6',
      heading: '#0f172a',
      body: '#334155',
      muted: '#64748b',
      link: '#2563eb',
      border: '#e2e8f0',
      background: '#ffffff',
    },
  },
  {
    id: 'navy',
    name: 'Executive Navy',
    colors: {
      primary: '#0f2942',
      accent: '#1e40af',
      heading: '#0a192f',
      body: '#1e293b',
      muted: '#5c7080',
      link: '#1d4ed8',
      border: '#cbd5e1',
      background: '#ffffff',
    },
  },
  {
    id: 'slate',
    name: 'Modern Slate',
    colors: {
      primary: '#334155',
      accent: '#475569',
      heading: '#0f172a',
      body: '#334155',
      muted: '#64748b',
      link: '#2563eb',
      border: '#e2e8f0',
      background: '#ffffff',
    },
  },
  {
    id: 'modern-blue',
    name: 'Clean Cyan',
    colors: {
      primary: '#0284c7',
      accent: '#0369a1',
      heading: '#0f172a',
      body: '#334155',
      muted: '#64748b',
      link: '#0284c7',
      border: '#e0f2fe',
      background: '#ffffff',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    colors: {
      primary: '#059669',
      accent: '#047857',
      heading: '#064e3b',
      body: '#1e293b',
      muted: '#64748b',
      link: '#059669',
      border: '#d1fae5',
      background: '#ffffff',
    },
  },
  {
    id: 'burgundy',
    name: 'Deep Burgundy',
    colors: {
      primary: '#9f1239',
      accent: '#881337',
      heading: '#4c0519',
      body: '#1e293b',
      muted: '#64748b',
      link: '#be123c',
      border: '#ffe4e6',
      background: '#ffffff',
    },
  },
  {
    id: 'minimal-black',
    name: 'Minimal Black & White (ATS)',
    colors: {
      primary: '#18181b',
      accent: '#27272a',
      heading: '#09090b',
      body: '#27272a',
      muted: '#52525b',
      link: '#18181b',
      border: '#e4e4e7',
      background: '#ffffff',
    },
  },
  {
    id: 'warm-gray',
    name: 'Warm Charcoal',
    colors: {
      primary: '#44403c',
      accent: '#78716c',
      heading: '#1c1917',
      body: '#292524',
      muted: '#78716c',
      link: '#b45309',
      border: '#e7e5e4',
      background: '#ffffff',
    },
  },
  {
    id: 'dark-pro',
    name: 'Dark Studio',
    colors: {
      primary: '#38bdf8',
      accent: '#818cf8',
      heading: '#ffffff',
      body: '#e2e8f0',
      muted: '#94a3b8',
      link: '#38bdf8',
      border: '#334155',
      background: '#0f172a',
    },
  },
];

// ── 20+ CURATED RESUME TEMPLATES ─────────────────────────────────────────────
export const RESUME_TEMPLATES_METADATA: ResumeTemplateMeta[] = [
  // 1. Backwards compatible templates
  {
    id: 'tmpl_modern_pro',
    name: 'Modern Professional (ATS-Optimized)',
    category: 'ATS',
    description: 'Clean single-column layout with subtle dividing lines. Optimized for applicant tracking systems.',
    thumbnailColor: '#2563eb',
    layout: 'single-column',
  },
  {
    id: 'tmpl_two_column',
    name: 'Modern Two-Column Layout',
    category: 'Professional',
    description: 'Compact sidebar for contact info, skills, and languages with expansive experience column.',
    thumbnailColor: '#0f172a',
    layout: 'two-column',
  },
  {
    id: 'tmpl_software_eng',
    name: 'Software Engineer & Full-Stack',
    category: 'Developer',
    description: 'Tailored for developers with tech stack badges, GitHub links, and high-impact engineering projects.',
    thumbnailColor: '#059669',
    layout: 'technical',
  },
  {
    id: 'tmpl_graduate_fresher',
    name: 'Graduate / Entry-Level Fresher',
    category: 'Student',
    description: 'Clean layout emphasizing academic degree, capstone projects, internships, and hackathons.',
    thumbnailColor: '#7c3aed',
    layout: 'academic',
  },
  {
    id: 'tmpl_executive_corp',
    name: 'Executive & Corporate Leadership',
    category: 'Executive',
    description: 'Sophisticated typography emphasizing strategic leadership, board experience, and revenue metrics.',
    thumbnailColor: '#9f1239',
    layout: 'executive',
  },

  // 2. Dedicated ATS Templates
  {
    id: 'tmpl_ats_classic',
    name: 'ATS Classic Standard',
    category: 'ATS',
    description: 'High-parsability standard formatting with zero complex tables or floating graphics.',
    thumbnailColor: '#1e293b',
    layout: 'single-column',
  },
  {
    id: 'tmpl_ats_pro',
    name: 'ATS Professional Clean',
    category: 'ATS',
    description: 'Minimalist hierarchy with clear uppercase section headers and robust text extraction.',
    thumbnailColor: '#3b82f6',
    layout: 'single-column',
  },
  {
    id: 'tmpl_ats_modern',
    name: 'ATS Modern Minimal',
    category: 'ATS',
    description: 'Crisp sans-serif typography with compact metadata line items designed for quick automated scans.',
    thumbnailColor: '#0f766e',
    layout: 'single-column',
  },
  {
    id: 'tmpl_ats_developer',
    name: 'ATS Developer Tech',
    category: 'ATS',
    description: 'Categorized technical skill blocks and clean project bullet points for engineering scanners.',
    thumbnailColor: '#0284c7',
    layout: 'single-column',
  },
  {
    id: 'tmpl_ats_executive',
    name: 'ATS Executive Streamlined',
    category: 'ATS',
    description: 'Designed for senior leaders with executive summaries and quantified achievement bullets.',
    thumbnailColor: '#475569',
    layout: 'single-column',
  },
  {
    id: 'tmpl_compact_ats',
    name: 'Compact ATS Single-Page',
    category: 'ATS',
    description: 'High-density single page layout designed to fit extensive career histories without spilling over.',
    thumbnailColor: '#334155',
    layout: 'compact',
  },

  // 3. Premium Modern & Creative Templates
  {
    id: 'tmpl_minimalist_clean',
    name: 'Minimalist Clean Studio',
    category: 'Modern',
    description: 'Generous whitespace with lightweight typography and understated border accents.',
    thumbnailColor: '#18181b',
    layout: 'single-column',
  },
  {
    id: 'tmpl_clean_corporate',
    name: 'Clean Corporate White',
    category: 'Professional',
    description: 'Corporate aesthetic with bold role titles, dual-color headers, and clear timeline dividers.',
    thumbnailColor: '#1e40af',
    layout: 'single-column',
  },
  {
    id: 'tmpl_developer_pro',
    name: 'Developer Pro Terminal',
    category: 'Developer',
    description: 'Modern developer layout with monospace metadata accents, GitHub metrics, and live demo links.',
    thumbnailColor: '#10b981',
    layout: 'technical',
  },
  {
    id: 'tmpl_creative_portfolio',
    name: 'Creative Portfolio Accent',
    category: 'Creative',
    description: 'Visual header layout with photo support, skill tag bubbles, and highlighted portfolio links.',
    thumbnailColor: '#ec4899',
    layout: 'creative',
  },
  {
    id: 'tmpl_academic_research',
    name: 'Academic & Research Thesis',
    category: 'Academic',
    description: 'Classic serif typography tailored for universities, grant applications, and published research.',
    thumbnailColor: '#6366f1',
    layout: 'academic',
  },
  {
    id: 'tmpl_consulting_strategy',
    name: 'Consulting & Strategy Matrix',
    category: 'Executive',
    description: 'Two-column strategic layout highlighting core advisory domains, client engagements, and certifications.',
    thumbnailColor: '#0369a1',
    layout: 'two-column',
  },
  {
    id: 'tmpl_elegant_serif',
    name: 'Elegant Serif Classic',
    category: 'Creative',
    description: 'Editorial aesthetic with Playfair Display headings and refined timeless styling.',
    thumbnailColor: '#b45309',
    layout: 'single-column',
  },
  {
    id: 'tmpl_soft_modern',
    name: 'Soft Modern Slate',
    category: 'Modern',
    description: 'Contemporary rounded badges, soft muted palette, and modern card-style project blocks.',
    thumbnailColor: '#64748b',
    layout: 'single-column',
  },
  {
    id: 'tmpl_split_sidebar',
    name: 'Split Two-Tone Sidebar',
    category: 'Modern',
    description: 'High-contrast tinted sidebar for contact, education, and skills with clean main experience column.',
    thumbnailColor: '#0f172a',
    layout: 'two-column',
  },
];

export const DEFAULT_SECTION_ORDER: ResumeSectionConfig[] = [
  { id: 'sec_personal', type: 'personal', title: 'Header & Contact', visible: true },
  { id: 'sec_summary', type: 'summary', title: 'Professional Summary', visible: true },
  { id: 'sec_skills', type: 'skills', title: 'Skills & Competencies', visible: true },
  { id: 'sec_experience', type: 'experience', title: 'Work Experience', visible: true },
  { id: 'sec_projects', type: 'projects', title: 'Key Projects', visible: true },
  { id: 'sec_education', type: 'education', title: 'Education', visible: true },
  { id: 'sec_certifications', type: 'certifications', title: 'Certifications', visible: true },
  { id: 'sec_achievements', type: 'achievements', title: 'Achievements', visible: true },
  { id: 'sec_awards', type: 'awards', title: 'Honors & Awards', visible: false },
  { id: 'sec_publications', type: 'publications', title: 'Publications', visible: false },
  { id: 'sec_languages', type: 'languages', title: 'Languages', visible: false },
  { id: 'sec_volunteer', type: 'volunteer', title: 'Volunteer Experience', visible: false },
  { id: 'sec_organizations', type: 'organizations', title: 'Organizations', visible: false },
  { id: 'sec_references', type: 'references', title: 'References', visible: false },
];

export class ResumeEngine {
  static getTemplates(): ResumeTemplateMeta[] {
    return RESUME_TEMPLATES_METADATA;
  }

  static getDefaultDesign(): ResumeDesignConfig {
    return {
      headerLayout: 'modern',
      fontFamily: 'Inter',
      typographyPreset: 'normal',
      nameSize: 26,
      headingSize: 12.5,
      bodySize: 11,
      metadataSize: 10,
      lineHeight: 1.5,
      letterSpacing: 'normal',
      textAlign: 'left',
      palette: 'professional',
      colors: { ...RESUME_PALETTES[0].colors },
      spacingPreset: 'balanced',
      spacing: {
        pageMargin: 32,
        sectionGap: 16,
        entryGap: 12,
        paragraphGap: 4,
        lineHeight: 1.5,
      },
      paperSize: 'A4',
      skillsStyle: 'categories',
      bulletStyle: 'dot',
      headingStyle: 'underline',
      projectStyle: 'standard',
      educationStyle: 'classic',
    };
  }

  static getDefaultResumeData(): ResumeData {
    return {
      personalInfo: {
        name: 'Alex Chen',
        title: 'Senior Full-Stack Software Engineer',
        email: 'alex.chen@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        website: 'https://alexchen.dev',
        github: 'github.com/alexchen',
        linkedin: 'linkedin.com/in/alexchen',
        portfolio: 'https://alexchen.dev/portfolio',
        customLinks: [
          { label: 'Blog', url: 'https://alexchen.dev/blog' }
        ],
        photo: {
          url: '',
          style: 'none',
          size: 'md',
        },
      },
      summary:
        'Results-oriented Senior Software Engineer with 6+ years of experience architecting high-throughput distributed systems, scalable web applications, and real-time collaborative workspaces. Proven track record of improving latency by 45% and leading cross-functional engineering teams.',
      objective: '',
      skillCategories: [
        {
          category: 'Languages & Frameworks',
          skills: ['TypeScript', 'JavaScript (ESNext)', 'React', 'Next.js', 'Node.js', 'Python', 'Go', 'GraphQL'],
        },
        {
          category: 'Cloud & DevOps',
          skills: ['AWS (Lambda, S3, ECS)', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'PostgreSQL', 'Redis'],
        },
        {
          category: 'Methodologies',
          skills: ['System Architecture', 'Microservices', 'RESTful APIs', 'Agile / Scrum', 'TDD'],
        },
      ],
      skills: [
        'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'Go', 'GraphQL',
        'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'CI/CD', 'Microservices'
      ],
      experience: [
        {
          id: 'exp_1',
          title: 'Lead Software Engineer',
          company: 'ScaleTech Solutions',
          location: 'San Francisco, CA',
          period: '2022 – Present',
          current: true,
          website: 'https://scaletech.example.com',
          highlights: [
            'Architected real-time collaboration engine using WebSockets and CRDTs, supporting 50K concurrent users with sub-20ms sync latency.',
            'Spearheaded migration of legacy monolith to Next.js and microservices, slashing initial page load times by 48%.',
            'Mentored 8 junior and mid-level engineers, instituted rigorous automated testing standards with 94% code coverage.',
          ],
        },
        {
          id: 'exp_2',
          title: 'Full-Stack Software Engineer',
          company: 'Nexus Cloud Platforms',
          location: 'San Jose, CA',
          period: '2019 – 2022',
          current: false,
          website: 'https://nexuscloud.example.com',
          highlights: [
            'Engineered REST and GraphQL data pipelines processing over 12M events daily with 99.99% uptime.',
            'Implemented automated billing and subscription infrastructure generating $4.2M in annual recurring revenue.',
            'Optimized complex PostgreSQL queries, reducing database CPU load by 35% during peak hours.',
          ],
        },
      ],
      education: [
        {
          id: 'edu_1',
          degree: 'B.S. in Computer Science',
          school: 'University of California, Berkeley',
          location: 'Berkeley, CA',
          year: '2015 – 2019',
          gpa: '3.85 / 4.00',
          details: 'Dean’s Honor List • Coursework: Distributed Systems, Operating Systems, Algorithms, Machine Learning',
        },
      ],
      projects: [
        {
          id: 'proj_1',
          name: 'DocProEditor Canvas Engine',
          role: 'Creator & Lead Architect',
          techStack: ['React', 'TypeScript', 'TailwindCSS', 'Web Workers'],
          link: 'https://github.com/alexchen/docproeditor',
          projectUrl: 'https://docproeditor.example.com',
          githubUrl: 'https://github.com/alexchen/docproeditor',
          liveDemoUrl: 'https://docproeditor.example.com/demo',
          highlights: [
            'Built a high-performance vector canvas and multi-page document pagination engine running at 60fps.',
            'Implemented custom LaTeX math parser and client-side PDF/DOCX multi-format serializers.',
          ],
        },
        {
          id: 'proj_2',
          name: 'Neural OCR Scanner',
          role: 'Core Contributor',
          techStack: ['Python', 'FastAPI', 'OpenCV', 'PyTorch'],
          link: 'https://github.com/alexchen/neural-ocr',
          projectUrl: 'https://ocr.example.com',
          githubUrl: 'https://github.com/alexchen/neural-ocr',
          highlights: [
            'Developed optical document segmentation algorithm achieving 96% accuracy on complex invoice scans.',
          ],
        },
      ],
      certifications: [
        { id: 'cert_1', name: 'AWS Certified Solutions Architect (Associate)', issuer: 'Amazon Web Services', year: '2023', link: 'https://aws.amazon.com' },
        { id: 'cert_2', name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation', year: '2022', link: 'https://cncf.io' },
      ],
      achievements: [
        '1st Place Winner — Silicon Valley AI Hackathon (2024)',
        'Published author of technical engineering articles with 150K+ reads on Medium',
      ],
      awards: [
        { id: 'award_1', title: 'Outstanding Engineering Impact Award', issuer: 'ScaleTech Solutions', date: '2023', description: 'Awarded for architecting sub-20ms collaboration protocol.' }
      ],
      publications: [
        { id: 'pub_1', title: 'High-Throughput Offline-First Web Applications with CRDTs', publisher: 'ACM Digital Library', date: '2023', link: 'https://doi.org/10.1145/example' }
      ],
      languages: [
        { id: 'lang_1', language: 'English', proficiency: 'Native / Bilingual' },
        { id: 'lang_2', language: 'Mandarin Chinese', proficiency: 'Professional Working' }
      ],
      interests: ['Distributed Computing', 'Open Source Tooling', 'Rock Climbing', 'Triathlons'],
      volunteer: [
        { id: 'vol_1', role: 'Mentor & Code Instructor', organization: 'Code for Youth Initiative', period: '2021 – Present', highlights: ['Taught foundational web development to 40+ high school students.'] }
      ],
      organizations: [
        { id: 'org_1', role: 'Active Contributor', name: 'Open Source Software Collective', period: '2020 – Present' }
      ],
      references: [
        { id: 'ref_1', name: 'Available Upon Request', title: '', company: '', contact: '' }
      ],
      customSections: [
        {
          id: 'custom_opensource',
          title: 'Open Source Contributions',
          style: 'standard',
          items: [
            {
              id: 'item_1',
              title: 'React Core & Ecosystem',
              subtitle: 'Contributor',
              date: '2021 – Present',
              description: 'Contributed performance fixes and TypeScript definitions to open source developer tools with over 2M monthly downloads.',
              link: 'https://github.com/facebook/react',
              bullets: ['Resolved critical hydration edge cases.', 'Improved memory consumption by 15%.']
            }
          ]
        }
      ],
      sectionOrder: [...DEFAULT_SECTION_ORDER],
      design: ResumeEngine.getDefaultDesign(),
    };
  }

  /**
   * Render resume data into chosen template HTML with full design customizations
   */
  static renderTemplate(
    data: ResumeData,
    templateId: string = 'tmpl_modern_pro',
    designOverrides?: Partial<ResumeDesignConfig>
  ): string {
    const design: ResumeDesignConfig = {
      ...this.getDefaultDesign(),
      ...(data.design || {}),
      ...(designOverrides || {}),
    };

    // Determine layout family from template
    const templateMeta = RESUME_TEMPLATES_METADATA.find(t => t.id === templateId);
    const layout = templateMeta?.layout || 'single-column';

    if (layout === 'two-column') {
      return this.renderTwoColumnTemplate(data, design, templateId);
    } else if (layout === 'technical') {
      return this.renderTechnicalTemplate(data, design, templateId);
    } else if (layout === 'academic') {
      return this.renderAcademicTemplate(data, design, templateId);
    } else if (layout === 'executive') {
      return this.renderExecutiveTemplate(data, design, templateId);
    } else if (layout === 'compact') {
      return this.renderCompactTemplate(data, design, templateId);
    } else if (layout === 'creative') {
      return this.renderCreativeTemplate(data, design, templateId);
    }

    // Default: Single Column Modern & ATS
    return this.renderSingleColumnTemplate(data, design, templateId);
  }

  // ── Helper: Format Clickable Link ──────────────────────────────────────────
  private static formatLink(url?: string, label?: string): string {
    if (!url) return '';
    const cleanUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')
      ? url
      : `https://${url}`;
    const display = label || url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline; text-underline-offset: 2px;">${display}</a>`;
  }

  // ── Helper: Render Header by Layout ─────────────────────────────────────────
  private static renderHeader(p: ResumePersonalInfo, design: ResumeDesignConfig): string {
    const { colors, headerLayout, nameSize, bodySize, metadataSize } = design;
    const photo = p.photo;
    const hasPhoto = photo && photo.url && photo.style !== 'none';

    let photoBorderRadius = '0';
    if (photo?.style === 'circle') photoBorderRadius = '50%';
    if (photo?.style === 'rounded') photoBorderRadius = '12px';

    const photoSizePx = photo?.size === 'lg' ? 84 : photo?.size === 'sm' ? 52 : 68;

    const photoHtml = hasPhoto
      ? `<img src="${photo.url}" alt="${p.name}" style="width: ${photoSizePx}px; height: ${photoSizePx}px; border-radius: ${photoBorderRadius}; object-fit: cover; border: 2px solid ${colors.border}; shrink: 0;" />`
      : '';

    // Contact Links
    const contactParts: string[] = [];
    if (p.location) contactParts.push(`<span>📍 ${p.location}</span>`);
    if (p.email) contactParts.push(`<span>✉️ ${this.formatLink(`mailto:${p.email}`, p.email)}</span>`);
    if (p.phone) contactParts.push(`<span>📞 ${this.formatLink(`tel:${p.phone}`, p.phone)}</span>`);
    if (p.website) contactParts.push(`<span>🌐 ${this.formatLink(p.website)}</span>`);
    if (p.linkedin) contactParts.push(`<span>💼 ${this.formatLink(p.linkedin, p.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, 'linkedin/'))}</span>`);
    if (p.github) contactParts.push(`<span>🐙 ${this.formatLink(p.github, p.github.replace(/^https?:\/\/(www\.)?github\.com\//, 'github/'))}</span>`);
    if (p.portfolio) contactParts.push(`<span>✨ ${this.formatLink(p.portfolio, 'Portfolio')}</span>`);

    if (p.customLinks && p.customLinks.length > 0) {
      p.customLinks.forEach(cl => {
        if (cl.url) contactParts.push(`<span>🔗 ${this.formatLink(cl.url, cl.label || cl.url)}</span>`);
      });
    }

    const contactRow = `<div style="font-size: ${metadataSize}px; color: ${colors.muted}; display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 6px; line-height: 1.4;">${contactParts.join(' • ')}</div>`;

    if (headerLayout === 'centered') {
      return `
        <div style="text-align: center; border-bottom: 2px solid ${colors.primary}; padding-bottom: 14px; margin-bottom: ${design.spacing.sectionGap}px;">
          ${hasPhoto ? `<div style="display: flex; justify-content: center; margin-bottom: 8px;">${photoHtml}</div>` : ''}
          <h1 style="font-size: ${nameSize}px; font-weight: 800; color: ${colors.heading}; margin: 0 0 4px 0; letter-spacing: -0.02em;">${p.name}</h1>
          <p style="font-size: ${bodySize * 1.15}px; font-weight: 600; color: ${colors.primary}; margin: 0 0 6px 0;">${p.title}</p>
          <div style="font-size: ${metadataSize}px; color: ${colors.muted}; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 12px; line-height: 1.4;">
            ${contactParts.join(' • ')}
          </div>
        </div>
      `;
    }

    if (headerLayout === 'split' || headerLayout === 'executive') {
      return `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${colors.primary}; padding-bottom: 14px; margin-bottom: ${design.spacing.sectionGap}px; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            ${photoHtml}
            <div>
              <h1 style="font-size: ${nameSize}px; font-weight: 800; color: ${colors.heading}; margin: 0 0 4px 0; letter-spacing: -0.02em;">${p.name}</h1>
              <p style="font-size: ${bodySize * 1.15}px; font-weight: 600; color: ${colors.primary}; margin: 0;">${p.title}</p>
            </div>
          </div>
          <div style="text-align: right; font-size: ${metadataSize}px; color: ${colors.muted}; line-height: 1.5; max-width: 45%;">
            ${contactParts.join('<br />')}
          </div>
        </div>
      `;
    }

    if (headerLayout === 'minimal') {
      return `
        <div style="border-bottom: 1px solid ${colors.border}; padding-bottom: 10px; margin-bottom: ${design.spacing.sectionGap}px;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <h1 style="font-size: ${nameSize * 0.9}px; font-weight: 700; color: ${colors.heading}; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">${p.name}</h1>
            <span style="font-size: ${bodySize}px; font-weight: 500; color: ${colors.primary};">${p.title}</span>
          </div>
          <div style="font-size: ${metadataSize}px; color: ${colors.muted}; margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px 10px;">
            ${contactParts.join(' | ')}
          </div>
        </div>
      `;
    }

    if (headerLayout === 'compact') {
      return `
        <div style="border-bottom: 1.5px solid ${colors.primary}; padding-bottom: 8px; margin-bottom: ${design.spacing.sectionGap * 0.75}px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h1 style="font-size: ${nameSize * 0.85}px; font-weight: 800; color: ${colors.heading}; margin: 0;">${p.name} — <span style="font-size: ${bodySize}px; font-weight: 600; color: ${colors.primary};">${p.title}</span></h1>
            <div style="font-size: ${metadataSize * 0.95}px; color: ${colors.muted}; margin-top: 2px;">
              ${contactParts.join(' • ')}
            </div>
          </div>
          ${photoHtml}
        </div>
      `;
    }

    // Default: Modern Layout
    return `
      <div style="border-bottom: 2px solid ${colors.primary}; padding-bottom: 12px; margin-bottom: ${design.spacing.sectionGap}px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: ${nameSize}px; font-weight: 800; color: ${colors.heading}; margin: 0 0 4px 0; letter-spacing: -0.02em;">${p.name}</h1>
          <p style="font-size: ${bodySize * 1.15}px; font-weight: 600; color: ${colors.primary}; margin: 0;">${p.title}</p>
          ${contactRow}
        </div>
        ${photoHtml}
      </div>
    `;
  }

  // ── Helper: Render Section Heading ──────────────────────────────────────────
  private static renderSectionHeading(title: string, design: ResumeDesignConfig): string {
    const { colors, headingSize, headingStyle } = design;

    if (headingStyle === 'banner') {
      return `
        <h2 style="font-size: ${headingSize}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; background-color: ${colors.primary}; color: #ffffff; padding: 4px 8px; border-radius: 4px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
          ${title}
        </h2>
      `;
    }

    if (headingStyle === 'left-border') {
      return `
        <h2 style="font-size: ${headingSize}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${colors.heading}; border-left: 3.5px solid ${colors.primary}; padding-left: 8px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
          ${title}
        </h2>
      `;
    }

    if (headingStyle === 'minimal-uppercase') {
      return `
        <h2 style="font-size: ${headingSize}px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: ${colors.primary}; margin: 0 0 6px 0; page-break-after: avoid; break-after: avoid;">
          ${title}
        </h2>
      `;
    }

    if (headingStyle === 'bold-divider') {
      return `
        <div style="display: flex; align-items: center; gap: 8px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
          <h2 style="font-size: ${headingSize}px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${colors.heading}; margin: 0; shrink: 0;">${title}</h2>
          <div style="flex: 1; height: 1.5px; background-color: ${colors.primary};"></div>
        </div>
      `;
    }

    // Default: Underline
    return `
      <h2 style="font-size: ${headingSize}px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${colors.heading}; border-bottom: 1.5px solid ${colors.border}; padding-bottom: 3px; margin: 0 0 8px 0; page-break-after: avoid; break-after: avoid;">
        ${title}
      </h2>
    `;
  }

  // ── Helper: Render Bullet Points ────────────────────────────────────────────
  private static renderBullets(bullets: string[], design: ResumeDesignConfig): string {
    if (!bullets || bullets.length === 0) return '';
    const { colors, bodySize, bulletStyle } = design;

    let listStyleType = 'disc';
    if (bulletStyle === 'dash') listStyleType = 'square';
    if (bulletStyle === 'minimal') listStyleType = 'none';

    return `
      <ul style="margin: 4px 0 0 0; padding-left: ${bulletStyle === 'minimal' ? '0' : '16px'}; font-size: ${bodySize}px; color: ${colors.body}; line-height: ${design.spacing.lineHeight}; list-style-type: ${listStyleType};">
        ${bullets.map(b => `<li style="margin-bottom: ${design.spacing.paragraphGap}px;">${b}</li>`).join('')}
      </ul>
    `;
  }

  // ── Section 1: Template Renderer (Single Column / ATS Standard) ─────────────
  private static renderSingleColumnTemplate(
    d: ResumeData,
    design: ResumeDesignConfig,
    _templateId: string
  ): string {
    const { colors, fontFamily } = design;
    const p = d.personalInfo;
    const sections = d.sectionOrder || DEFAULT_SECTION_ORDER;

    let html = `
<div class="resume-document" style="font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: ${design.spacing.lineHeight}; color: ${colors.body}; background-color: ${colors.background}; padding: ${design.spacing.pageMargin}px; max-width: 100%; box-sizing: border-box;">
  ${this.renderHeader(p, design)}
`;

    sections.forEach(sec => {
      if (!sec.visible) return;

      if (sec.type === 'summary' && d.summary) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Professional Summary', design)}
            <p style="font-size: ${design.bodySize}px; color: ${colors.body}; margin: 0; line-height: ${design.spacing.lineHeight};">${d.summary}</p>
          </div>
        `;
      } else if (sec.type === 'objective' && d.objective) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Career Objective', design)}
            <p style="font-size: ${design.bodySize}px; color: ${colors.body}; margin: 0; line-height: ${design.spacing.lineHeight};">${d.objective}</p>
          </div>
        `;
      } else if (sec.type === 'skills' && d.skillCategories && d.skillCategories.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Skills & Competencies', design)}
            <div style="font-size: ${design.bodySize}px; color: ${colors.body};">
              ${d.skillCategories.map(sc => `
                <div style="margin-bottom: ${design.spacing.paragraphGap}px;">
                  <strong style="color: ${colors.heading};">${sc.category}:</strong> ${sc.skills.join(', ')}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (sec.type === 'experience' && d.experience && d.experience.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px;">
            ${this.renderSectionHeading(sec.title || 'Work Experience', design)}
            ${d.experience.map(exp => `
              <div style="margin-bottom: ${design.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                  <h3 style="font-size: ${design.bodySize * 1.05}px; font-weight: 700; color: ${colors.heading}; margin: 0;">
                    ${exp.title} — <span style="font-weight: 600; color: ${colors.primary};">${exp.company}</span>
                  </h3>
                  <span style="font-size: ${design.metadataSize}px; color: ${colors.muted}; font-weight: 500;">
                    ${exp.period} ${exp.location ? `| ${exp.location}` : ''}
                  </span>
                </div>
                ${this.renderBullets(exp.highlights, design)}
              </div>
            `).join('')}
          </div>
        `;
      } else if (sec.type === 'projects' && d.projects && d.projects.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px;">
            ${this.renderSectionHeading(sec.title || 'Key Projects', design)}
            ${d.projects.map(proj => `
              <div style="margin-bottom: ${design.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap;">
                  <h3 style="font-size: ${design.bodySize * 1.02}px; font-weight: 700; color: ${colors.heading}; margin: 0;">
                    ${proj.name} ${proj.techStack && proj.techStack.length > 0 ? `<span style="font-size: ${design.metadataSize}px; font-weight: normal; color: ${colors.muted};">(${proj.techStack.join(', ')})</span>` : ''}
                  </h3>
                  <div style="font-size: ${design.metadataSize}px; color: ${colors.primary};">
                    ${proj.liveDemoUrl ? this.formatLink(proj.liveDemoUrl, 'Live Demo') : proj.link ? this.formatLink(proj.link, 'View Project') : ''}
                  </div>
                </div>
                ${proj.role ? `<div style="font-size: ${design.metadataSize}px; color: ${colors.muted}; margin-top: 1px;">Role: ${proj.role}</div>` : ''}
                ${this.renderBullets(proj.highlights, design)}
              </div>
            `).join('')}
          </div>
        `;
      } else if (sec.type === 'education' && d.education && d.education.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Education', design)}
            ${d.education.map(edu => `
              <div style="margin-bottom: ${design.spacing.entryGap * 0.75}px; page-break-inside: avoid; break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: ${design.bodySize}px;">
                  <div>
                    <strong style="color: ${colors.heading};">${edu.degree}</strong> — ${edu.school}${edu.location ? `, ${edu.location}` : ''}
                    ${edu.details ? `<div style="color: ${colors.muted}; font-size: ${design.metadataSize}px; margin-top: 2px;">${edu.details}</div>` : ''}
                  </div>
                  <span style="color: ${colors.muted}; font-size: ${design.metadataSize}px; font-weight: 500;">${edu.year}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (sec.type === 'certifications' && d.certifications && d.certifications.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Certifications & Credentials', design)}
            <div style="font-size: ${design.bodySize}px; color: ${colors.body};">
              ${d.certifications.map(c => `
                <div style="margin-bottom: 4px; display: flex; justify-content: space-between;">
                  <span><strong>${c.name}</strong> — ${c.issuer}</span>
                  <span style="color: ${colors.muted}; font-size: ${design.metadataSize}px;">${c.year}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (sec.type === 'achievements' && d.achievements && d.achievements.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Key Achievements & Honors', design)}
            ${this.renderBullets(d.achievements, design)}
          </div>
        `;
      } else if (sec.type === 'awards' && d.awards && d.awards.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Honors & Awards', design)}
            ${d.awards.map(a => `
              <div style="margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; font-size: ${design.bodySize}px;">
                  <strong>${a.title}</strong> — <span style="color: ${colors.muted};">${a.issuer}</span>
                  <span style="color: ${colors.muted}; font-size: ${design.metadataSize}px;">${a.date}</span>
                </div>
                ${a.description ? `<p style="font-size: ${design.metadataSize}px; color: ${colors.muted}; margin: 2px 0 0 0;">${a.description}</p>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      } else if (sec.type === 'publications' && d.publications && d.publications.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Publications', design)}
            ${d.publications.map(pub => `
              <div style="margin-bottom: 6px; font-size: ${design.bodySize}px;">
                <strong>${pub.link ? this.formatLink(pub.link, pub.title) : pub.title}</strong> — <span style="color: ${colors.muted};">${pub.publisher} (${pub.date})</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if (sec.type === 'languages' && d.languages && d.languages.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Languages', design)}
            <div style="font-size: ${design.bodySize}px; display: flex; flex-wrap: wrap; gap: 8px 16px;">
              ${d.languages.map(l => `<span><strong>${l.language}:</strong> <span style="color: ${colors.muted};">${l.proficiency}</span></span>`).join('')}
            </div>
          </div>
        `;
      } else if (sec.type === 'volunteer' && d.volunteer && d.volunteer.length > 0) {
        html += `
          <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
            ${this.renderSectionHeading(sec.title || 'Volunteer Experience', design)}
            ${d.volunteer.map(v => `
              <div style="margin-bottom: ${design.spacing.entryGap * 0.75}px;">
                <div style="display: flex; justify-content: space-between; font-size: ${design.bodySize}px;">
                  <strong>${v.role}</strong> — <span style="color: ${colors.primary};">${v.organization}</span>
                  <span style="color: ${colors.muted}; font-size: ${design.metadataSize}px;">${v.period}</span>
                </div>
                ${this.renderBullets(v.highlights, design)}
              </div>
            `).join('')}
          </div>
        `;
      } else if (sec.type === 'custom' && d.customSections) {
        const customSec = d.customSections.find(cs => cs.id === sec.customSectionId || cs.title === sec.title);
        if (customSec && customSec.items && customSec.items.length > 0) {
          html += `
            <div style="margin-bottom: ${design.spacing.sectionGap}px; page-break-inside: avoid; break-inside: avoid;">
              ${this.renderSectionHeading(customSec.title, design)}
              ${customSec.items.map(item => `
                <div style="margin-bottom: ${design.spacing.entryGap * 0.75}px; page-break-inside: avoid; break-inside: avoid;">
                  <div style="display: flex; justify-content: space-between; font-size: ${design.bodySize}px;">
                    <strong>${item.link ? this.formatLink(item.link, item.title) : item.title}</strong>
                    ${item.date ? `<span style="color: ${colors.muted}; font-size: ${design.metadataSize}px;">${item.date}</span>` : ''}
                  </div>
                  ${item.subtitle ? `<div style="font-size: ${design.metadataSize}px; color: ${colors.primary}; font-weight: 500;">${item.subtitle}</div>` : ''}
                  ${item.description ? `<p style="font-size: ${design.bodySize * 0.95}px; color: ${colors.body}; margin: 2px 0 0 0;">${item.description}</p>` : ''}
                  ${item.bullets && item.bullets.length > 0 ? this.renderBullets(item.bullets, design) : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
      }
    });

    html += `</div>`;
    return html;
  }

  // ── Section 2: Two Column Template ──────────────────────────────────────────
  private static renderTwoColumnTemplate(d: ResumeData, design: ResumeDesignConfig, _templateId: string): string {
    const { colors, fontFamily } = design;
    const p = d.personalInfo;

    return `
<div class="resume-document" style="font-family: '${fontFamily}', -apple-system, sans-serif; line-height: ${design.spacing.lineHeight}; color: ${colors.body}; background-color: ${colors.background}; padding: ${design.spacing.pageMargin}px; box-sizing: border-box;">
  ${this.renderHeader(p, design)}
  <div style="display: grid; grid-template-columns: 32% 64%; gap: 4%;">
    <!-- Left Column: Contact, Skills, Education, Certifications -->
    <div>
      ${d.summary ? `
        <div style="margin-bottom: ${design.spacing.sectionGap}px;">
          ${this.renderSectionHeading('About Me', design)}
          <p style="font-size: ${design.bodySize * 0.95}px; line-height: 1.5; color: ${colors.body}; margin: 0;">${d.summary}</p>
        </div>
      ` : ''}

      ${d.skillCategories && d.skillCategories.length > 0 ? `
        <div style="margin-bottom: ${design.spacing.sectionGap}px;">
          ${this.renderSectionHeading('Skills', design)}
          ${d.skillCategories.map(sc => `
            <div style="margin-bottom: 8px;">
              <strong style="font-size: ${design.bodySize * 0.9}px; color: ${colors.heading}; display: block; margin-bottom: 2px;">${sc.category}</strong>
              <div style="font-size: ${design.metadataSize}px; color: ${colors.muted};">${sc.skills.join(', ')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${d.education && d.education.length > 0 ? `
        <div style="margin-bottom: ${design.spacing.sectionGap}px;">
          ${this.renderSectionHeading('Education', design)}
          ${d.education.map(edu => `
            <div style="margin-bottom: 8px;">
              <strong style="font-size: ${design.bodySize * 0.95}px; color: ${colors.heading}; display: block;">${edu.degree}</strong>
              <span style="font-size: ${design.metadataSize}px; color: ${colors.primary}; font-weight: 500;">${edu.school}</span>
              <div style="font-size: ${design.metadataSize * 0.9}px; color: ${colors.muted};">${edu.year}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${d.languages && d.languages.length > 0 ? `
        <div style="margin-bottom: ${design.spacing.sectionGap}px;">
          ${this.renderSectionHeading('Languages', design)}
          ${d.languages.map(l => `<div style="font-size: ${design.metadataSize}px; margin-bottom: 2px;"><strong>${l.language}:</strong> ${l.proficiency}</div>`).join('')}
        </div>
      ` : ''}
    </div>

    <!-- Right Column: Experience, Projects, Custom Sections -->
    <div>
      ${d.experience && d.experience.length > 0 ? `
        <div style="margin-bottom: ${design.spacing.sectionGap}px;">
          ${this.renderSectionHeading('Experience', design)}
          ${d.experience.map(exp => `
            <div style="margin-bottom: ${design.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: ${design.bodySize * 1.05}px; font-weight: 700; color: ${colors.heading}; margin: 0;">${exp.title}</h3>
                <span style="font-size: ${design.metadataSize}px; color: ${colors.muted};">${exp.period}</span>
              </div>
              <div style="font-size: ${design.metadataSize}px; color: ${colors.primary}; font-weight: 600; margin-bottom: 2px;">${exp.company} — ${exp.location}</div>
              ${this.renderBullets(exp.highlights, design)}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${d.projects && d.projects.length > 0 ? `
        <div style="margin-bottom: ${design.spacing.sectionGap}px;">
          ${this.renderSectionHeading('Projects', design)}
          ${d.projects.map(proj => `
            <div style="margin-bottom: ${design.spacing.entryGap}px; page-break-inside: avoid; break-inside: avoid;">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h3 style="font-size: ${design.bodySize}px; font-weight: 700; color: ${colors.heading}; margin: 0;">${proj.name}</h3>
                ${proj.link ? `<span style="font-size: ${design.metadataSize}px;">${this.formatLink(proj.link, 'Link')}</span>` : ''}
              </div>
              ${this.renderBullets(proj.highlights, design)}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </div>
</div>
`;
  }

  // ── Section 3: Technical Developer Template ─────────────────────────────────
  private static renderTechnicalTemplate(d: ResumeData, design: ResumeDesignConfig, templateId: string): string {
    return this.renderSingleColumnTemplate(d, {
      ...design,
      headingStyle: 'banner',
      bulletStyle: 'dot',
    }, templateId);
  }

  // ── Section 4: Academic Template ────────────────────────────────────────────
  private static renderAcademicTemplate(d: ResumeData, design: ResumeDesignConfig, templateId: string): string {
    return this.renderSingleColumnTemplate(d, {
      ...design,
      fontFamily: design.fontFamily || 'Merriweather',
      headingStyle: 'bold-divider',
    }, templateId);
  }

  // ── Section 5: Executive Template ───────────────────────────────────────────
  private static renderExecutiveTemplate(d: ResumeData, design: ResumeDesignConfig, templateId: string): string {
    return this.renderSingleColumnTemplate(d, {
      ...design,
      headerLayout: 'executive',
      headingStyle: 'left-border',
    }, templateId);
  }

  // ── Section 6: Compact Single-Page Template ─────────────────────────────────
  private static renderCompactTemplate(d: ResumeData, design: ResumeDesignConfig, templateId: string): string {
    return this.renderSingleColumnTemplate(d, {
      ...design,
      headerLayout: 'compact',
      spacing: {
        pageMargin: 20,
        sectionGap: 10,
        entryGap: 8,
        paragraphGap: 2,
        lineHeight: 1.35,
      },
      nameSize: 22,
      bodySize: 10,
      metadataSize: 9,
    }, templateId);
  }

  // ── Section 7: Creative Portfolio Template ──────────────────────────────────
  private static renderCreativeTemplate(d: ResumeData, design: ResumeDesignConfig, templateId: string): string {
    return this.renderSingleColumnTemplate(d, {
      ...design,
      headingStyle: 'banner',
      headerLayout: 'centered',
    }, templateId);
  }
}
