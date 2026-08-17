import { StudioDocument, StudioTemplate } from './types';
import { PageEngine } from './PageEngine';
import { PresentationEngine, PRESENTATION_THEMES } from './PresentationEngine';
import { ElementEngine } from './ElementEngine';
import { ResumeEngine } from './ResumeEngine';

export const STUDIO_TEMPLATES: StudioTemplate[] = [
  // ─── 1. Academic Project Report ──────────────────────────────────────────
  {
    id: 'academic-project-report',
    title: 'University Project Report (B.Tech / MCA / M.Tech)',
    category: 'project',
    mode: 'document',
    description: 'Complete academic project report with Cover Page, Certificate, Declaration, TOC, System Design, Implementation, and IEEE References.',
    emoji: '🎓',
    color: '#2563EB',
    badge: 'Standard Academic Presets',
    initialDocument: {
      title: 'Final Year Major Project Report',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        headerText: 'Department of Computer Science & Engineering',
        footerText: 'Final Year Project Report 2026',
        pageNumberFormat: 'arabic',
        differentFirstPage: true,
      },
      coverPageData: {
        universityName: 'VISVESVARAYA TECHNOLOGICAL UNIVERSITY, BELAGAVI',
        collegeName: 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
        departmentName: 'School of Computing & Information Technology',
        projectTitle: 'AI-POWERED COLLABORATIVE DOCUMENT & REPORT STUDIO',
        projectSubtitle: 'A Scalable Web Architecture for Multi-Format Engineering Documentation',
        studentName: 'Saqeeb Khan & Team',
        studentUSN: '1CR21CS101, 1CR21CS102',
        guideName: 'Dr. John Doe, Ph.D.',
        guideDesignation: 'Professor & Head of Department',
        academicYear: '2025 – 2026',
        submissionDate: 'August 2026',
      },
      content: `
        <div class="cover-page-section text-center my-8 p-6 border-2 border-primary/20 rounded-xl bg-card">
          <h2 style="text-align: center; color: #1e3a8a; font-size: 16pt; font-weight: bold; margin-bottom: 4px;">VISVESVARAYA TECHNOLOGICAL UNIVERSITY</h2>
          <p style="text-align: center; font-size: 11pt; color: #64748b; margin-bottom: 24px;">Jnana Sangama, Belagavi - 590018</p>
          <div style="margin: 20px 0; text-align: center;">
            <span style="font-size: 40px;">🏛️</span>
          </div>
          <h1 style="text-align: center; color: #0f172a; font-size: 20pt; font-weight: bold; margin: 24px 0 8px 0; text-transform: uppercase;">AI-POWERED COLLABORATIVE DOCUMENT & REPORT STUDIO</h1>
          <p style="text-align: center; font-size: 13pt; font-style: italic; color: #475569; margin-bottom: 30px;">A Scalable Web Architecture for Multi-Format Engineering Documentation</p>
          <p style="text-align: center; font-size: 11pt; margin-bottom: 20px;"><em>A Project Report submitted in partial fulfillment for the award of degree of</em></p>
          <p style="text-align: center; font-size: 13pt; font-weight: bold; color: #1e3a8a;">BACHELOR OF ENGINEERING IN COMPUTER SCIENCE & ENGINEERING</p>
          <div style="display: flex; justify-content: space-around; margin: 40px 0; text-align: left;">
            <div>
              <p style="font-size: 10pt; color: #64748b; font-weight: 600;">SUBMITTED BY:</p>
              <p style="font-size: 11pt; font-weight: bold;">Saqeeb Khan (1CR21CS101)</p>
              <p style="font-size: 11pt; font-weight: bold;">Alex Morgan (1CR21CS102)</p>
            </div>
            <div>
              <p style="font-size: 10pt; color: #64748b; font-weight: 600;">UNDER THE GUIDANCE OF:</p>
              <p style="font-size: 11pt; font-weight: bold;">Dr. John Doe, Ph.D.</p>
              <p style="font-size: 10pt; color: #475569;">Professor & HOD, Dept of CSE</p>
            </div>
          </div>
          <p style="text-align: center; font-size: 11pt; font-weight: 600; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 16px;">ACADEMIC YEAR: 2025 - 2026</p>
        </div>

        <div data-type="page-break"></div>

        <h1 style="text-align: center; color: #1e3a8a;">CERTIFICATE</h1>
        <p style="line-height: 1.8; text-align: justify; margin-top: 24px;">
          This is to certify that the project work entitled <strong>"AI-Powered Collaborative Document & Report Studio"</strong> is a bonafide work carried out by <strong>Saqeeb Khan (1CR21CS101)</strong> and <strong>Alex Morgan (1CR21CS102)</strong> in partial fulfillment for the award of Bachelor of Engineering in Computer Science & Engineering during the academic year 2025-2026. It is certified that all corrections/suggestions indicated during internal assessments have been incorporated.
        </p>
        <div style="display: flex; justify-content: space-between; margin-top: 60px;">
          <div><p>___________________<br/><strong>Project Guide</strong><br/>Dr. John Doe</p></div>
          <div><p>___________________<br/><strong>Head of Department</strong><br/>Dr. Jane Smith</p></div>
          <div><p>___________________<br/><strong>Principal</strong><br/>Dr. Robert Brown</p></div>
        </div>

        <div data-type="page-break"></div>

        <h1 style="text-align: center; color: #1e3a8a;">DECLARATION</h1>
        <p style="line-height: 1.8; text-align: justify;">
          We, <strong>Saqeeb Khan</strong> and <strong>Alex Morgan</strong>, students of VIII Semester B.E. in Computer Science & Engineering, hereby declare that the project work presented in this report has been authentically developed by us. We further declare that this report has not been submitted elsewhere for the award of any degree or diploma.
        </p>
        <div style="margin-top: 40px;">
          <p>Date: August 16, 2026<br/>Place: Bangalore</p>
        </div>

        <div data-type="page-break"></div>

        <h1 style="color: #1e3a8a;">ABSTRACT</h1>
        <p style="line-height: 1.8; text-align: justify;">
          Modern documentation platforms often segregate text document authoring, presentation slide generation, and graphic layout design into disconnected proprietary silos. This research presents <strong>OpenDoc Studio</strong>, a unified browser-based productivity suite engineered with modular computational engines. The system integrates paginated Word-style document generation, slide-based presentation creation, and freeform Canva-style visual canvas manipulation atop a shared zero-backend local-first persistence layer powered by IndexedDB.
        </p>

        <div data-type="page-break"></div>

        <h1 style="color: #1e3a8a;">1. INTRODUCTION</h1>
        <p style="line-height: 1.8; text-align: justify;">
          Documentation forms the cornerstone of academic research, technical engineering, and business communication. In conventional software ecosystems, users are required to toggle across disparate software tools to produce project reports, slide decks, and visual certificates.
        </p>
        <h2>1.1 Problem Statement</h2>
        <p style="line-height: 1.8; text-align: justify;">
          Engineering students and researchers frequently grapple with formatting inconsistencies when compiling multi-chapter reports requiring dynamic numbering, Table of Figures, mathematical equations, and flowcharts.
        </p>
        <h2>1.2 Objectives of the Project</h2>
        <ul>
          <li>Provide a unified architecture bridging paginated documents, slides, and freeform canvases.</li>
          <li>Implement automated Table of Contents (TOC), Table of Figures, and citation managers.</li>
          <li>Guarantee local-first persistence using browser-native IndexedDB without mandatory cloud authentication.</li>
          <li>Provide multi-format export capabilities for PDF, DOCX, Markdown, and presentation formats.</li>
        </ul>

        <div data-type="page-break"></div>

        <h1 style="color: #1e3a8a;">2. SYSTEM DESIGN & ARCHITECTURE</h1>
        <p style="line-height: 1.8; text-align: justify;">
          The system architecture follows a decoupled engine-driven model where the presentation layer, layout algorithms, and storage mechanisms operate independently.
        </p>
        <table>
          <thead>
            <tr>
              <th>Module Name</th>
              <th>Engine Component</th>
              <th>Primary Responsibility</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Document Engine</td>
              <td>PageEngine</td>
              <td>A4 pagination, margins, headers/footers, numbering, TOC</td>
            </tr>
            <tr>
              <td>Presentation Engine</td>
              <td>PresentationEngine</td>
              <td>Slide management, 16:9 canvas, themes, presenter mode</td>
            </tr>
            <tr>
              <td>Visual Canvas</td>
              <td>ElementEngine</td>
              <td>Drag/resize, rotation, snap-to-grid, layers, grouping</td>
            </tr>
            <tr>
              <td>Mathematical Parser</td>
              <td>EquationEngine</td>
              <td>KaTeX LaTeX rendering, matrices, calculus notation</td>
            </tr>
            <tr>
              <td>Export Pipeline</td>
              <td>ExportEngine</td>
              <td>PDF, DOCX, Markdown, HTML, RTF, JSON bundle</td>
            </tr>
          </tbody>
        </table>

        <div data-type="page-break"></div>

        <h1 style="color: #1e3a8a;">3. IMPLEMENTATION & RESULTS</h1>
        <p style="line-height: 1.8; text-align: justify;">
          The solution was benchmarked for DOM rendering speed, autosave latencies, and export fidelity. The modular architecture achieved a sub-50ms keystroke response rate and 100% offline data integrity.
        </p>

        <div data-type="page-break"></div>

        <h1 style="color: #1e3a8a;">4. CONCLUSION & FUTURE SCOPE</h1>
        <p style="line-height: 1.8; text-align: justify;">
          OpenDoc Studio successfully establishes a unified, accessible, and high-performance suite for engineering project reports and creative documentation. Future work includes WebRTC-based peer-to-peer real-time collaborative editing.
        </p>

        <div data-type="page-break"></div>

        <h1 style="color: #1e3a8a;">REFERENCES</h1>
        <p>[1] D. Rams, <em>Ten Principles for Good Design</em>, Prestel Publishing, 2017.</p>
        <p>[2] V. Bush, "As We May Think," <em>The Atlantic Monthly</em>, vol. 176, no. 1, pp. 101-108, 1945.</p>
        <p>[3] W. C. Wake, <em>Extreme Programming Explored</em>, Addison-Wesley, 2001.</p>
      `,
    },
  },

  // ─── 2. Academic Research Paper (IEEE 2-Column) ───────────────────────────
  {
    id: 'ieee-research-paper',
    title: 'Academic Research Paper (IEEE Style)',
    category: 'academic',
    mode: 'document',
    description: 'Two-column academic research paper format with abstract, methodology, equations, and IEEE citations.',
    emoji: '🔬',
    color: '#059669',
    initialDocument: {
      title: 'A Novel Architecture for Client-Side Document Processing',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        columns: 2,
        headerText: 'IEEE TRANSACTIONS ON COMPUTATIONAL PRODUCTIVITY, VOL. 14, 2026',
        footerText: 'OpenDoc Studio Open Research',
      },
      content: `
        <h1 style="text-align: center; color: #0f172a; font-size: 18pt; font-weight: bold;">A Novel Architecture for Client-Side Document Processing</h1>
        <p style="text-align: center; font-size: 11pt; color: #475569; margin-bottom: 20px;">
          <strong>Saqeeb Khan</strong><br/>
          Department of Computer Science & Engineering<br/>
          <em>saqeeb@example.com</em>
        </p>
        <hr/>
        <p><strong><em>Abstract</em>—In this paper, we propose a lightweight, zero-backend document engine architecture capable of rendering paginated rich-text documents alongside interactive slide presentations. By leveraging browser-native IndexedDB and modular engine abstractions, we achieve high throughput document manipulation without server latency.</strong></p>
        <p><strong><em>Keywords</em>—Client-side rendering, IndexedDB, document architecture, Canvas API.</strong></p>
        <h2>I. INTRODUCTION</h2>
        <p>Document processing systems historically depended on heavy server-side formatting engines. With the evolution of modern JavaScript runtimes and WebAssembly, full-scale authoring can execute completely within the client's local sandbox.</p>
        <h2>II. METHODOLOGY</h2>
        <p>We designed three interacting engine tiers: the PageEngine for pagination boundaries, the ElementEngine for spatial transforms, and the StorageEngine for transactional IndexedDB persistence.</p>
        <h2>III. MATHEMATICAL MODEL</h2>
        <p>The document rendering complexity is given by \( O(N) \) where \( N \) represents the active DOM block elements:</p>
        <p class="math-equation font-mono bg-muted/40 p-2 rounded">T_{render} = \\sum_{i=1}^{M} (T_{layout}(P_i) + T_{paint}(P_i))</p>
        <h2>IV. CONCLUSION</h2>
        <p>The experimental evaluation confirms that client-side document processing provides equal fidelity and superior privacy compared to centralized cloud editors.</p>
        <h2>REFERENCES</h2>
        <p>[1] J. Smith, "Modern Web Architectures," <em>IEEE Software</em>, vol. 38, pp. 45-52, 2024.</p>
      `,
    },
  },

  // ─── 3. Professional Resume / CV ──────────────────────────────────────────
  {
    id: 'modern-tech-resume',
    title: 'Modern Software Engineer Resume & CV',
    category: 'career',
    mode: 'document',
    description: 'ATS-friendly modern resume template with summary, skills matrix, experience, projects, and education.',
    emoji: '💼',
    color: '#0284C7',
    initialDocument: {
      title: 'Saqeeb Khan — Resume',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        margins: { top: 15, right: 15, bottom: 15, left: 15 },
        showPageNumbers: false,
      },
      content: `
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 16px;">
          <h1 style="margin: 0; color: #0f172a; font-size: 24pt; font-weight: bold;">SAQEEB KHAN</h1>
          <p style="margin: 4px 0 0 0; color: #0284c7; font-size: 13pt; font-weight: 600;">Full-Stack Software Engineer & Systems Architect</p>
          <p style="margin: 4px 0 0 0; font-size: 10pt; color: #475569;">
            Bangalore, India • saqeeb@example.com • +91 98765 43210 • github.com/saqeeb • linkedin.com/in/saqeeb
          </p>
        </div>

        <h2 style="color: #0284c7; font-size: 13pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">PROFESSIONAL SUMMARY</h2>
        <p style="font-size: 10.5pt; line-height: 1.5; color: #334155;">
          High-impact Software Engineer with deep expertise in React, TypeScript, Node.js, and client-side systems design. Proven track record of architecting high-performance web applications, collaborative editors, and scalable microservices used by thousands of daily users.
        </p>

        <h2 style="color: #0284c7; font-size: 13pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 16px;">TECHNICAL SKILLS</h2>
        <p style="font-size: 10.5pt; line-height: 1.6; color: #334155;">
          <strong>Languages:</strong> TypeScript, JavaScript, Python, Go, SQL, HTML5/CSS3<br/>
          <strong>Frameworks & Libraries:</strong> React, Next.js, Vite, Node.js, Express, Tailwind CSS, Tiptap, Zustand<br/>
          <strong>Databases & Storage:</strong> PostgreSQL, Redis, MongoDB, IndexedDB<br/>
          <strong>DevOps & Tools:</strong> Docker, AWS, Git, CI/CD, Jest, Playwright
        </p>

        <h2 style="color: #0284c7; font-size: 13pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 16px;">WORK EXPERIENCE</h2>
        
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <strong style="font-size: 11pt; color: #0f172a;">Senior Frontend Engineer — CloudTech Innovations</strong>
            <span style="font-size: 10pt; color: #64748b;">2024 – Present</span>
          </div>
          <p style="font-size: 10pt; color: #0284c7; margin: 2px 0 6px 0;">Bangalore, India</p>
          <ul style="font-size: 10pt; line-height: 1.5; color: #334155; margin: 0; padding-left: 20px;">
            <li>Spearheaded development of a real-time web editor, increasing rendering performance by 40%.</li>
            <li>Designed local-first offline synchronization using IndexedDB and optimistic UI updates.</li>
            <li>Mentored junior engineers and instituted automated end-to-end testing pipelines.</li>
          </ul>
        </div>

        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between;">
            <strong style="font-size: 11pt; color: #0f172a;">Full-Stack Developer — Innovate Labs</strong>
            <span style="font-size: 10pt; color: #64748b;">2022 – 2024</span>
          </div>
          <p style="font-size: 10pt; color: #0284c7; margin: 2px 0 6px 0;">Remote</p>
          <ul style="font-size: 10pt; line-height: 1.5; color: #334155; margin: 0; padding-left: 20px;">
            <li>Built responsive SaaS customer portals handling 1M+ monthly requests.</li>
            <li>Integrated payment gateways, automated PDF reporting, and Webhook notification engines.</li>
          </ul>
        </div>

        <h2 style="color: #0284c7; font-size: 13pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 16px;">FEATURED PROJECTS</h2>
        <div style="margin-bottom: 10px;">
          <strong style="font-size: 11pt; color: #0f172a;">OpenDoc Studio — All-In-One Document & Presentation Suite</strong>
          <ul style="font-size: 10pt; line-height: 1.5; color: #334155; margin: 4px 0 0 0; padding-left: 20px;">
            <li>Engineered an open-source productivity suite uniting Word-style documents, PowerPoint slides, and Canva graphics.</li>
            <li>Implemented KaTeX math equations, interactive flowcharts, and multi-format DOCX/PDF export.</li>
          </ul>
        </div>

        <h2 style="color: #0284c7; font-size: 13pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 16px;">EDUCATION</h2>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <strong style="font-size: 11pt; color: #0f172a;">Bachelor of Engineering in Computer Science</strong><br/>
            <span style="font-size: 10pt; color: #475569;">Visvesvaraya Technological University</span>
          </div>
          <span style="font-size: 10pt; color: #64748b;">2021 – 2025 • CGPA: 9.2/10</span>
        </div>
      `,
    },
  },

  // ─── 4. Presentation Pitch Deck (16:9 Slides) ────────────────────────────
  {
    id: 'startup-pitch-deck',
    title: 'Startup Pitch Deck (10 Slides)',
    category: 'presentation',
    mode: 'presentation',
    description: '10-slide PowerPoint-style presentation covering problem, solution, market size, business model, and product architecture.',
    emoji: '📊',
    color: '#8B5CF6',
    badge: '16:9 Presentation',
    initialDocument: {
      title: 'OpenDoc Studio — Seed Pitch Deck',
      mode: 'presentation',
      presentationSettings: PresentationEngine.createDefaultSettings(),
      slides: [
        PresentationEngine.createSlide('title', PRESENTATION_THEMES[1]),
        PresentationEngine.createSlide('title-content', PRESENTATION_THEMES[1]),
        PresentationEngine.createSlide('two-columns', PRESENTATION_THEMES[1]),
        PresentationEngine.createSlide('quote', PRESENTATION_THEMES[1]),
        PresentationEngine.createSlide('closing', PRESENTATION_THEMES[1]),
      ],
    },
  },

  // ─── 5. Certificate of Achievement / Completion ──────────────────────────
  {
    id: 'certificate-of-achievement',
    title: 'Certificate of Excellence & Completion',
    category: 'design',
    mode: 'design',
    description: 'Canva-style visual certificate with ornamental borders, recipient name, gold seal badge, and signature placeholders.',
    emoji: '🏆',
    color: '#D97706',
    badge: 'Visual Design Canvas',
    initialDocument: {
      title: 'Certificate of Excellence',
      mode: 'design',
      canvasWidth: 840,
      canvasHeight: 594, // A4 landscape
      canvasBackground: '#FDFBF7',
      designElements: [
        // Outer decorative border
        ElementEngine.createElement('shape', {
          shapeType: 'rectangle',
          transform: { x: 20, y: 20, width: 800, height: 554, rotation: 0 },
          style: { fill: 'transparent', stroke: '#D97706', strokeWidth: 3, strokeStyle: 'solid', cornerRadius: 4 },
        }),
        // Inner decorative border
        ElementEngine.createElement('shape', {
          shapeType: 'rectangle',
          transform: { x: 30, y: 30, width: 780, height: 534, rotation: 0 },
          style: { fill: 'transparent', stroke: '#F59E0B', strokeWidth: 1, strokeStyle: 'dashed', cornerRadius: 2 },
        }),
        // Title
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 60, width: 680, height: 70, rotation: 0 },
          content: `<h1 style="text-align: center; color: #78350F; font-size: 32px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">CERTIFICATE OF EXCELLENCE</h1>`,
          style: { fontFamily: 'Georgia', textAlign: 'center' },
        }),
        // Subtitle
        ElementEngine.createElement('text', {
          transform: { x: 120, y: 140, width: 600, height: 40, rotation: 0 },
          content: `<p style="text-align: center; color: #92400E; font-size: 16px; font-style: italic;">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>`,
          style: { fontFamily: 'Georgia', textAlign: 'center' },
        }),
        // Recipient Name
        ElementEngine.createElement('text', {
          transform: { x: 80, y: 190, width: 680, height: 60, rotation: 0 },
          content: `<h2 style="text-align: center; color: #1E3A8A; font-size: 36px; font-weight: bold; border-bottom: 2px solid #F59E0B; padding-bottom: 8px;">Saqeeb Khan</h2>`,
          style: { fontFamily: 'Georgia', textAlign: 'center' },
        }),
        // Description
        ElementEngine.createElement('text', {
          transform: { x: 100, y: 280, width: 640, height: 80, rotation: 0 },
          content: `<p style="text-align: center; color: #334155; font-size: 15px; line-height: 1.6;">For exceptional performance, innovation, and outstanding contributions in the engineering of OpenDoc Studio during the 2026 Academic Year.</p>`,
          style: { fontFamily: 'Inter', textAlign: 'center' },
        }),
        // Date & Signature lines
        ElementEngine.createElement('text', {
          transform: { x: 100, y: 440, width: 240, height: 70, rotation: 0 },
          content: `<p style="text-align: center; border-top: 1px solid #64748b; padding-top: 8px; font-size: 14px; font-weight: 600; color: #0f172a;">August 16, 2026<br/><span style="font-size: 12px; color: #64748b; font-weight: normal;">Date of Issuance</span></p>`,
          style: { textAlign: 'center' },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 500, y: 440, width: 240, height: 70, rotation: 0 },
          content: `<p style="text-align: center; border-top: 1px solid #64748b; padding-top: 8px; font-size: 14px; font-weight: 600; color: #0f172a;">Dr. John Doe, Ph.D.<br/><span style="font-size: 12px; color: #64748b; font-weight: normal;">Director & Program Head</span></p>`,
          style: { textAlign: 'center' },
        }),
      ],
    },
  },

  // ─── 6. Marketing Brochure / Flyer ───────────────────────────────────────
  {
    id: 'event-marketing-flyer',
    title: 'Event & Conference Marketing Flyer',
    category: 'design',
    mode: 'design',
    description: 'Freeform marketing flyer with bold headers, feature highlights, badge shapes, and integrated QR code.',
    emoji: '📢',
    color: '#EC4899',
    badge: 'Marketing Flyer',
    initialDocument: {
      title: 'Tech Conference 2026 Flyer',
      mode: 'design',
      canvasWidth: 600,
      canvasHeight: 800,
      canvasBackground: '#0F172A',
      designElements: [
        ElementEngine.createElement('shape', {
          shapeType: 'rounded-rectangle',
          transform: { x: 30, y: 30, width: 540, height: 740, rotation: 0 },
          style: { fill: '#1E293B', stroke: '#3B82F6', strokeWidth: 2, cornerRadius: 16 },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 50, y: 60, width: 500, height: 100, rotation: 0 },
          content: `<h1 style="color: #60A5FA; font-size: 32px; font-weight: bold; text-align: center; margin: 0;">GLOBAL TECH SUMMIT 2026</h1><p style="color: #94A3B8; font-size: 16px; text-align: center; margin-top: 8px;">The Future of Document Intelligence & Web AI</p>`,
          style: { textAlign: 'center' },
        }),
        ElementEngine.createElement('qrcode', {
          transform: { x: 220, y: 560, width: 160, height: 160, rotation: 0 },
          qrData: {
            text: 'https://opendoc-studio.example.com',
            fgColor: '#000000',
            bgColor: '#FFFFFF',
            margin: 2,
          },
        }),
        ElementEngine.createElement('text', {
          transform: { x: 60, y: 725, width: 480, height: 40, rotation: 0 },
          content: `<p style="color: #38BDF8; font-size: 13px; text-align: center; font-weight: 600;">Scan QR Code to Register Online • Limited Seats</p>`,
          style: { textAlign: 'center' },
        }),
      ],
    },
  },

  // ─── 7. Resume: Modern Professional (Single Column ATS) ──────────────────
  {
    id: 'resume-modern-pro',
    title: 'Modern Professional Resume (ATS-Friendly)',
    category: 'career',
    mode: 'document',
    description: 'Clean single-column layout with subtle dividing lines. Optimized for applicant tracking systems and corporate roles.',
    emoji: '📄',
    color: '#2563EB',
    badge: 'ATS-Friendly',
    initialDocument: {
      title: 'Alex Chen — Professional Resume',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        margins: { top: 18, right: 18, bottom: 18, left: 18 },
        headerText: '',
        footerText: '',
      },
      content: ResumeEngine.renderTemplate(ResumeEngine.getDefaultResumeData(), 'tmpl_modern_pro'),
    },
  },

  // ─── 8. Resume: Modern Two-Column Layout ──────────────────────────────────
  {
    id: 'resume-two-column',
    title: 'Modern Two-Column Layout Resume',
    category: 'career',
    mode: 'document',
    description: 'Compact sidebar for contact info, skills, and languages with expansive experience and project column.',
    emoji: '📑',
    color: '#0F172A',
    badge: 'Two-Column',
    initialDocument: {
      title: 'Alex Chen — Two-Column Resume',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        margins: { top: 16, right: 16, bottom: 16, left: 16 },
        headerText: '',
        footerText: '',
      },
      content: ResumeEngine.renderTemplate(ResumeEngine.getDefaultResumeData(), 'tmpl_two_column'),
    },
  },

  // ─── 9. Resume: Software Engineer & Full-Stack ───────────────────────────
  {
    id: 'resume-software-eng',
    title: 'Software Engineer & Full-Stack Developer',
    category: 'career',
    mode: 'document',
    description: 'Developer-tailored resume with tech stack tags, open-source projects, and quantified architectural achievements.',
    emoji: '💻',
    color: '#059669',
    badge: 'Tech & Engineering',
    initialDocument: {
      title: 'Alex Chen — Software Engineer CV',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        margins: { top: 18, right: 18, bottom: 18, left: 18 },
        headerText: '',
        footerText: '',
      },
      content: ResumeEngine.renderTemplate(ResumeEngine.getDefaultResumeData(), 'tmpl_software_eng'),
    },
  },

  // ─── 10. Resume: Graduate / Fresher / Student ────────────────────────────
  {
    id: 'resume-graduate-fresher',
    title: 'Graduate / Fresher Academic Resume',
    category: 'career',
    mode: 'document',
    description: 'Academic-focused template highlighting degree, GPA, capstone projects, internships, and hackathon honors.',
    emoji: '🎓',
    color: '#7C3AED',
    badge: 'Students & Grads',
    initialDocument: {
      title: 'Alex Chen — Graduate Resume',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        margins: { top: 18, right: 18, bottom: 18, left: 18 },
        headerText: '',
        footerText: '',
      },
      content: ResumeEngine.renderTemplate(ResumeEngine.getDefaultResumeData(), 'tmpl_graduate_fresher'),
    },
  },

  // ─── 11. Resume: Executive & Corporate Leader ────────────────────────────
  {
    id: 'resume-executive-corp',
    title: 'Executive & Corporate Leadership Resume',
    category: 'career',
    mode: 'document',
    description: 'Sophisticated serif typography emphasizing strategic management, board experience, and P&L achievements.',
    emoji: '👔',
    color: '#9F1239',
    badge: 'Executive',
    initialDocument: {
      title: 'Alex Chen — Executive Profile',
      mode: 'document',
      pageSettings: {
        ...PageEngine.createDefaultSettings(),
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        headerText: '',
        footerText: '',
      },
      content: ResumeEngine.renderTemplate(ResumeEngine.getDefaultResumeData(), 'tmpl_executive_corp'),
    },
  },
];

export class TemplateEngine {
  static getTemplates(): StudioTemplate[] {
    return STUDIO_TEMPLATES;
  }

  static getTemplateById(id: string): StudioTemplate | undefined {
    return STUDIO_TEMPLATES.find(t => t.id === id);
  }

  static getCategories(): string[] {
    return ['All', 'career', 'project', 'academic', 'presentation', 'design', 'business'];
  }
}
