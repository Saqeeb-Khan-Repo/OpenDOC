export interface ResumePersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface ResumeExperience {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

export interface ResumeEducation {
  degree: string;
  school: string;
  location: string;
  year: string;
  gpa?: string;
  details?: string;
}

export interface ResumeProject {
  name: string;
  role: string;
  techStack: string[];
  link?: string;
  highlights: string[];
}

export interface ResumeSkillCategory {
  category: string;
  skills: string[];
}

export interface ResumeData {
  personalInfo: ResumePersonalInfo;
  summary: string;
  skillCategories: ResumeSkillCategory[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: { name: string; issuer: string; year: string }[];
  achievements: string[];
}

export interface ResumeTemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnailColor: string;
  layout: 'single-column' | 'two-column' | 'technical' | 'academic' | 'executive';
}

export const RESUME_TEMPLATES_METADATA: ResumeTemplateMeta[] = [
  {
    id: 'tmpl_modern_pro',
    name: 'Modern Professional (ATS-Optimized)',
    category: 'General & ATS',
    description: 'Clean single-column layout with subtle dividing lines. Optimized for applicant tracking systems.',
    thumbnailColor: '#2563eb',
    layout: 'single-column',
  },
  {
    id: 'tmpl_two_column',
    name: 'Modern Two-Column Layout',
    category: 'Corporate',
    description: 'Compact sidebar for contact info, skills, and languages with expansive experience column.',
    thumbnailColor: '#0f172a',
    layout: 'two-column',
  },
  {
    id: 'tmpl_software_eng',
    name: 'Software Engineer & Full-Stack',
    category: 'Technology',
    description: 'Tailored for developers with tech stack badges, GitHub links, and high-impact engineering projects.',
    thumbnailColor: '#059669',
    layout: 'technical',
  },
  {
    id: 'tmpl_graduate_fresher',
    name: 'Graduate / Entry-Level Fresher',
    category: 'Academic',
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
];

export class ResumeEngine {
  static getTemplates(): ResumeTemplateMeta[] {
    return RESUME_TEMPLATES_METADATA;
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
      },
      summary:
        'Results-oriented Senior Software Engineer with 6+ years of experience architecting high-throughput distributed systems, scalable web applications, and real-time collaborative workspaces. Proven track record of improving latency by 45% and leading cross-functional engineering teams.',
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
      experience: [
        {
          title: 'Lead Software Engineer',
          company: 'ScaleTech Solutions',
          location: 'San Francisco, CA',
          period: '2022 – Present',
          highlights: [
            'Architected real-time collaboration engine using WebSockets and CRDTs, supporting 50K concurrent users with sub-20ms sync latency.',
            'Spearheaded migration of legacy monolith to Next.js and microservices, slashing initial page load times by 48%.',
            'Mentored 8 junior and mid-level engineers, instituted rigorous automated testing standards with 94% code coverage.',
          ],
        },
        {
          title: 'Full-Stack Software Engineer',
          company: 'Nexus Cloud Platforms',
          location: 'San Jose, CA',
          period: '2019 – 2022',
          highlights: [
            'Engineered REST and GraphQL data pipelines processing over 12M events daily with 99.99% uptime.',
            'Implemented automated billing and subscription infrastructure generating $4.2M in annual recurring revenue.',
            'Optimized complex PostgreSQL queries, reducing database CPU load by 35% during peak hours.',
          ],
        },
      ],
      education: [
        {
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
          name: 'DocFlow Canvas Engine',
          role: 'Creator & Lead Architect',
          techStack: ['React', 'TypeScript', 'TailwindCSS', 'Web Workers'],
          link: 'https://github.com/alexchen/docflow',
          highlights: [
            'Built a high-performance vector canvas and multi-page document pagination engine running at 60fps.',
            'Implemented custom LaTeX math parser and client-side PDF/DOCX multi-format serializers.',
          ],
        },
        {
          name: 'Neural OCR Scanner',
          role: 'Core Contributor',
          techStack: ['Python', 'FastAPI', 'OpenCV', 'PyTorch'],
          highlights: [
            'Developed optical document segmentation algorithm achieving 96% accuracy on complex invoice scans.',
          ],
        },
      ],
      certifications: [
        { name: 'AWS Certified Solutions Architect (Associate)', issuer: 'Amazon Web Services', year: '2023' },
        { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Cloud Native Computing Foundation', year: '2022' },
      ],
      achievements: [
        '1st Place Winner — Silicon Valley AI Hackathon (2024)',
        'Published author of technical engineering articles with 150K+ reads on Medium',
      ],
    };
  }

  /**
   * Render resume data into chosen template HTML
   */
  static renderTemplate(data: ResumeData, templateId: string): string {
    switch (templateId) {
      case 'tmpl_two_column':
        return this.renderTwoColumnTemplate(data);
      case 'tmpl_software_eng':
        return this.renderSoftwareEngTemplate(data);
      case 'tmpl_graduate_fresher':
        return this.renderGraduateTemplate(data);
      case 'tmpl_executive_corp':
        return this.renderExecutiveTemplate(data);
      case 'tmpl_modern_pro':
      default:
        return this.renderModernProTemplate(data);
    }
  }

  // ── Template 1: Modern Professional (Single Column, ATS-Friendly) ───────────
  private static renderModernProTemplate(d: ResumeData): string {
    const { personalInfo: p, summary, skillCategories, experience, education, projects, certifications, achievements } = d;

    return `
<div style="font-family: 'Inter', -apple-system, sans-serif; line-height: 1.5; color: #1e293b;">
  <!-- Header -->
  <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 14px; margin-bottom: 18px;">
    <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0; letter-spacing: -0.02em;">${p.name}</h1>
    <p style="font-size: 14px; font-weight: 600; color: #2563eb; margin: 0 0 8px 0;">${p.title}</p>
    <p style="font-size: 11px; color: #64748b; margin: 0;">
      ${p.location} • ${p.email} • ${p.phone} • <a href="${p.website}" style="color: #2563eb; text-decoration: none;">${p.website?.replace(/^https?:\/\//, '')}</a> • <a href="https://${p.github}" style="color: #2563eb; text-decoration: none;">${p.github}</a>
    </p>
  </div>

  <!-- Professional Summary -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 6px 0;">Professional Summary</h2>
    <p style="font-size: 11.5px; color: #334155; margin: 0; line-height: 1.6;">${summary}</p>
  </div>

  <!-- Technical Skills -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 6px 0;">Skills &amp; Competencies</h2>
    <div style="font-size: 11px; color: #334155;">
      ${skillCategories.map(sc => `<p style="margin: 0 0 3px 0;"><strong>${sc.category}:</strong> ${sc.skills.join(', ')}</p>`).join('')}
    </div>
  </div>

  <!-- Work Experience -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 8px 0;">Work Experience</h2>
    ${experience.map(exp => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${exp.title} — <span style="font-weight: 600; color: #2563eb;">${exp.company}</span></h3>
          <span style="font-size: 10.5px; color: #64748b; font-weight: 500;">${exp.period} | ${exp.location}</span>
        </div>
        <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155; line-height: 1.5;">
          ${exp.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>

  <!-- Key Projects -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 8px 0;">Key Projects</h2>
    ${projects.map(proj => `
      <div style="margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${proj.name} <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">(${proj.techStack.join(', ')})</span></h3>
          ${proj.link ? `<a href="${proj.link}" style="font-size: 10.5px; color: #2563eb; text-decoration: none;">View Project</a>` : ''}
        </div>
        <ul style="margin: 3px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${proj.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>

  <!-- Education -->
  <div style="margin-bottom: 14px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 6px 0;">Education</h2>
    ${education.map(edu => `
      <div style="display: flex; justify-content: space-between; align-items: baseline; font-size: 11px;">
        <div>
          <strong style="color: #0f172a;">${edu.degree}</strong> — ${edu.school}, ${edu.location}
          ${edu.details ? `<div style="color: #64748b; font-size: 10.5px; margin-top: 1px;">${edu.details}</div>` : ''}
        </div>
        <span style="color: #64748b; font-weight: 500;">${edu.year}</span>
      </div>
    `).join('')}
  </div>

  <!-- Certifications & Honors -->
  <div>
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin: 0 0 4px 0;">Certifications &amp; Honors</h2>
    <p style="font-size: 11px; color: #334155; margin: 0;">
      ${certifications.map(c => `${c.name} (${c.issuer}, ${c.year})`).join(' • ')}
    </p>
  </div>
</div>
`;
  }

  // ── Template 2: Modern Two-Column Layout ────────────────────────────────────
  private static renderTwoColumnTemplate(d: ResumeData): string {
    const { personalInfo: p, summary, skillCategories, experience, education, projects, certifications } = d;

    return `
<div style="font-family: 'Inter', sans-serif; display: grid; grid-template-columns: 240px 1fr; gap: 24px; color: #1e293b; line-height: 1.5;">
  <!-- Left Sidebar -->
  <div style="background: #f8fafc; padding: 20px 16px; border-radius: 6px; border: 1px solid #e2e8f0;">
    <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">${p.name}</h1>
    <p style="font-size: 12px; font-weight: 600; color: #2563eb; margin: 0 0 16px 0;">${p.title}</p>

    <!-- Contact Info -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Contact</h3>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">📍 ${p.location}</p>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">✉️ ${p.email}</p>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">📱 ${p.phone}</p>
      <p style="font-size: 10.5px; color: #334155; margin: 0 0 3px 0;">🌐 ${p.website?.replace(/^https?:\/\//, '')}</p>
    </div>

    <!-- Skills -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Skills</h3>
      ${skillCategories.map(sc => `
        <div style="margin-bottom: 8px;">
          <p style="font-size: 10px; font-weight: 700; color: #0f172a; margin: 0 0 2px 0;">${sc.category}</p>
          <p style="font-size: 10.5px; color: #475569; margin: 0;">${sc.skills.join(', ')}</p>
        </div>
      `).join('')}
    </div>

    <!-- Education in Sidebar -->
    <div style="margin-bottom: 18px;">
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Education</h3>
      ${education.map(edu => `
        <div style="margin-bottom: 6px;">
          <p style="font-size: 10.5px; font-weight: 700; color: #0f172a; margin: 0;">${edu.degree}</p>
          <p style="font-size: 10px; color: #64748b; margin: 0;">${edu.school} (${edu.year})</p>
        </div>
      `).join('')}
    </div>

    <!-- Certifications -->
    <div>
      <h3 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 6px 0;">Certifications</h3>
      ${certifications.map(c => `
        <p style="font-size: 10px; color: #334155; margin: 0 0 4px 0;">• ${c.name}</p>
      `).join('')}
    </div>
  </div>

  <!-- Right Main Column -->
  <div>
    <!-- Executive Summary -->
    <div style="margin-bottom: 18px;">
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 0 0 6px 0;">Executive Summary</h2>
      <p style="font-size: 11.5px; color: #334155; margin: 0; line-height: 1.6;">${summary}</p>
    </div>

    <!-- Experience -->
    <div style="margin-bottom: 18px;">
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 0 0 10px 0;">Professional Experience</h2>
      ${experience.map(exp => `
        <div style="margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${exp.title}</h3>
            <span style="font-size: 10.5px; color: #64748b;">${exp.period}</span>
          </div>
          <p style="font-size: 11px; color: #2563eb; font-weight: 600; margin: 0 0 4px 0;">${exp.company} • ${exp.location}</p>
          <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
            ${exp.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <!-- Featured Projects -->
    <div>
      <h2 style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin: 0 0 8px 0;">Featured Projects</h2>
      ${projects.map(proj => `
        <div style="margin-bottom: 8px;">
          <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${proj.name}</h3>
          <ul style="margin: 3px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
            ${proj.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  </div>
</div>
`;
  }

  // ── Template 3: Software Engineer & Developer ──────────────────────────────
  private static renderSoftwareEngTemplate(d: ResumeData): string {
    const { personalInfo: p, summary, skillCategories, experience, projects, education, certifications } = d;

    return `
<div style="font-family: 'JetBrains Mono', 'Courier New', monospace, sans-serif; line-height: 1.5; color: #0f172a;">
  <!-- Header with Terminal Vibe -->
  <div style="background: #0f172a; color: #f8fafc; padding: 18px 22px; border-radius: 8px; margin-bottom: 18px;">
    <h1 style="font-size: 24px; font-weight: 800; color: #38bdf8; margin: 0 0 2px 0;">${p.name}</h1>
    <p style="font-size: 13px; color: #a78bfa; margin: 0 0 8px 0; font-weight: 600;">$ role --title="${p.title}"</p>
    <p style="font-size: 10.5px; color: #94a3b8; margin: 0;">
      📍 ${p.location} | ✉️ ${p.email} | 📱 ${p.phone} | 🔗 <a href="https://${p.github}" style="color: #38bdf8; text-decoration: none;">${p.github}</a>
    </p>
  </div>

  <!-- Tech Stack Badges -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 6px 0;">// TECH STACK</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
      ${skillCategories.flatMap(sc => sc.skills).map(s => `
        <span style="font-size: 10px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 6px; border-radius: 4px;">${s}</span>
      `).join('')}
    </div>
  </div>

  <!-- Engineering Experience -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 8px 0;">// PRODUCTION EXPERIENCE</h2>
    ${experience.map(exp => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${exp.title} @ <span style="color: #059669;">${exp.company}</span></h3>
          <span style="font-size: 10.5px; color: #64748b;">${exp.period}</span>
        </div>
        <ul style="margin: 4px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${exp.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>

  <!-- Open-Source & Key Projects -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 8px 0;">// OPEN SOURCE &amp; ARCHITECTURE PROJECTS</h2>
    ${projects.map(proj => `
      <div style="margin-bottom: 8px;">
        <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${proj.name}</h3>
        <p style="font-size: 10px; color: #64748b; margin: 1px 0 3px 0;">Stack: ${proj.techStack.join(' • ')}</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${proj.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>

  <!-- Education & Certifications -->
  <div>
    <h2 style="font-size: 12px; font-weight: 800; color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #059669; padding-bottom: 2px; margin: 0 0 6px 0;">// EDUCATION &amp; CREDENTIALS</h2>
    ${education.map(edu => `
      <p style="font-size: 11px; color: #334155; margin: 0 0 2px 0;"><strong>${edu.degree}</strong> — ${edu.school} (${edu.year}) [GPA: ${edu.gpa}]</p>
    `).join('')}
    <p style="font-size: 10.5px; color: #64748b; margin: 4px 0 0 0;">
      Certifications: ${certifications.map(c => `${c.name}`).join(' • ')}
    </p>
  </div>
</div>
`;
  }

  // ── Template 4: Graduate / Fresher / Student ────────────────────────────────
  private static renderGraduateTemplate(d: ResumeData): string {
    const { personalInfo: p, summary, skillCategories, education, projects, achievements, certifications } = d;

    return `
<div style="font-family: 'Inter', sans-serif; line-height: 1.5; color: #1e293b;">
  <!-- Header -->
  <div style="text-align: center; margin-bottom: 16px;">
    <h1 style="font-size: 24px; font-weight: 800; color: #4338ca; margin: 0 0 4px 0;">${p.name}</h1>
    <p style="font-size: 12px; color: #64748b; margin: 0;">
      ${p.location} • ${p.email} • ${p.phone} • <a href="https://${p.github}" style="color: #4338ca; text-decoration: none;">GitHub</a> • <a href="https://${p.linkedin}" style="color: #4338ca; text-decoration: none;">LinkedIn</a>
    </p>
  </div>

  <!-- Academic Objective -->
  <div style="margin-bottom: 14px; background: #eef2ff; padding: 10px 14px; border-radius: 6px; border-left: 4px solid #4338ca;">
    <h2 style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #4338ca; margin: 0 0 3px 0;">Career Objective</h2>
    <p style="font-size: 11px; color: #312e81; margin: 0; line-height: 1.5;">${summary}</p>
  </div>

  <!-- Education (Prominent for Graduates) -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 6px 0;">Academic Background</h2>
    ${education.map(edu => `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #0f172a; margin: 0;">${edu.degree}</h3>
          <span style="font-size: 10.5px; color: #4338ca; font-weight: 600;">${edu.year}</span>
        </div>
        <p style="font-size: 11px; color: #475569; margin: 1px 0 2px 0;">${edu.school}, ${edu.location} • <strong>GPA: ${edu.gpa}</strong></p>
        <p style="font-size: 10.5px; color: #64748b; margin: 0;">${edu.details}</p>
      </div>
    `).join('')}
  </div>

  <!-- Technical Skills -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 6px 0;">Technical Competencies</h2>
    <div style="font-size: 11px; color: #334155;">
      ${skillCategories.map(sc => `<p style="margin: 0 0 2px 0;"><strong>${sc.category}:</strong> ${sc.skills.join(', ')}</p>`).join('')}
    </div>
  </div>

  <!-- Academic & Capstone Projects -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 8px 0;">Academic &amp; Capstone Projects</h2>
    ${projects.map(proj => `
      <div style="margin-bottom: 10px;">
        <h3 style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin: 0;">${proj.name} <span style="font-size: 10px; color: #64748b; font-weight: normal;">[${proj.techStack.join(', ')}]</span></h3>
        <ul style="margin: 3px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${proj.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>

  <!-- Achievements & Extracurriculars -->
  <div>
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1e1b4b; border-bottom: 1.5px solid #c7d2fe; padding-bottom: 2px; margin: 0 0 4px 0;">Achievements &amp; Activities</h2>
    <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #334155;">
      ${achievements.map(a => `<li style="margin-bottom: 2px;">${a}</li>`).join('')}
    </ul>
  </div>
</div>
`;
  }

  // ── Template 5: Executive & Corporate Leadership ────────────────────────────
  private static renderExecutiveTemplate(d: ResumeData): string {
    const { personalInfo: p, summary, skillCategories, experience, education, achievements } = d;

    return `
<div style="font-family: 'Georgia', serif; line-height: 1.6; color: #1c1917;">
  <!-- Header -->
  <div style="text-align: center; border-bottom: 3px double #78350f; padding-bottom: 14px; margin-bottom: 18px;">
    <h1 style="font-size: 26px; font-weight: 700; color: #451a03; margin: 0 0 4px 0; letter-spacing: 0.04em; text-transform: uppercase;">${p.name}</h1>
    <p style="font-size: 13px; font-weight: 600; color: #92400e; font-style: italic; margin: 0 0 6px 0;">${p.title}</p>
    <p style="font-family: 'Inter', sans-serif; font-size: 10.5px; color: #78716c; margin: 0;">
      ${p.location} • ${p.email} • ${p.phone} • ${p.linkedin}
    </p>
  </div>

  <!-- Executive Leadership Profile -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 6px 0;">Executive Profile</h2>
    <p style="font-size: 11.5px; color: #292524; margin: 0; text-align: justify;">${summary}</p>
  </div>

  <!-- Core Competencies Grid -->
  <div style="margin-bottom: 16px; font-family: 'Inter', sans-serif;">
    <h2 style="font-family: 'Georgia', serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 6px 0;">Core Competencies</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; color: #44403c;">
      <div>• Strategic P&amp;L &amp; Growth Execution</div>
      <div>• Engineering Leadership &amp; Mentorship</div>
      <div>• Enterprise Cloud Architecture</div>
      <div>• Cross-Functional Agile Management</div>
    </div>
  </div>

  <!-- Executive Experience -->
  <div style="margin-bottom: 16px;">
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 8px 0;">Executive &amp; Professional Experience</h2>
    ${experience.map(exp => `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline;">
          <h3 style="font-size: 12px; font-weight: 700; color: #1c1917; margin: 0;">${exp.title}</h3>
          <span style="font-family: 'Inter', sans-serif; font-size: 10px; color: #78716c;">${exp.period}</span>
        </div>
        <p style="font-size: 11px; font-style: italic; color: #92400e; margin: 1px 0 4px 0;">${exp.company} — ${exp.location}</p>
        <ul style="margin: 0; padding-left: 18px; font-size: 11px; color: #292524;">
          ${exp.highlights.map(h => `<li style="margin-bottom: 2px;">${h}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  </div>

  <!-- Education & Credentials -->
  <div>
    <h2 style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #451a03; border-bottom: 1px solid #d6d3d1; padding-bottom: 2px; margin: 0 0 4px 0;">Education &amp; Board Appointments</h2>
    ${education.map(edu => `
      <p style="font-size: 11px; color: #292524; margin: 0 0 2px 0;"><strong>${edu.degree}</strong> — ${edu.school} (${edu.year})</p>
    `).join('')}
  </div>
</div>
`;
  }
}
