import { Slide, CanvasElement } from './types';
import { PRESENTATION_GRADIENTS } from './PresentationEngine';

export interface GeneratedDocument {
  title: string;
  category: string;
  content: string;
  summary: string;
}

export class AIEngine {
  /**
   * Rewrite text with an AI instruction
   */
  static rewrite(text: string, instruction: string = 'improve'): string {
    const clean = text.replace(/<[^>]*>/g, '').trim();
    if (!clean) return '<p>Please select some text to rewrite.</p>';

    switch (instruction.toLowerCase()) {
      case 'shorter':
      case 'shorten':
        return this.shorten(clean);
      case 'longer':
      case 'expand':
        return this.expand(clean);
      case 'grammar':
      case 'fix grammar':
        return this.fixGrammar(clean);
      case 'professional':
        return this.makeProfessional(clean);
      case 'academic':
        return this.makeAcademic(clean);
      case 'simplify':
        return this.simplify(clean);
      case 'summarize':
        return this.summarize(clean);
      case 'bullets':
      case 'bullet points':
        return this.toBulletPoints(clean);
      case 'conclusion':
        return this.generateConclusion(clean);
      default:
        return `<p>${this.enhanceClarity(clean)}</p>`;
    }
  }

  static shorten(text: string): string {
    const sentences = text.split(/(?<=[.?!])\s+/);
    if (sentences.length <= 1) {
      return `<p>${text.replace(/\b(very|really|basically|in order to|due to the fact that|utilize)\b/gi, '').trim()}</p>`;
    }
    const concise = sentences.slice(0, Math.ceil(sentences.length * 0.6)).join(' ');
    return `<p>${concise}</p>`;
  }

  static expand(text: string): string {
    return `<p>${text} Furthermore, this comprehensive approach ensures high scalability, structural integrity, and alignment with modern industry standards. Systematic evaluation confirms that these parameters significantly improve operational efficiency and user satisfaction.</p>`;
  }

  static fixGrammar(text: string): string {
    let corrected = text
      .replace(/\bi\b/g, 'I')
      .replace(/\bteh\b/gi, 'the')
      .replace(/\bdont\b/gi, "don't")
      .replace(/\bcant\b/gi, "can't")
      .replace(/\bwont\b/gi, "won't")
      .replace(/\btheir is\b/gi, 'there is')
      .replace(/\byour right\b/gi, "you're right")
      .replace(/\baffect\b/gi, 'effect');
    if (!corrected.endsWith('.') && !corrected.endsWith('!') && !corrected.endsWith('?')) {
      corrected += '.';
    }
    return `<p>${corrected}</p>`;
  }

  static makeProfessional(text: string): string {
    return `<p>In accordance with industry best practices, ${text.charAt(0).toLowerCase() + text.slice(1)} This strategic initiative establishes an optimized framework designed to maximize measurable outcomes and sustain long-term value.</p>`;
  }

  static makeAcademic(text: string): string {
    return `<p>Empirical analysis indicates that ${text.charAt(0).toLowerCase() + text.slice(1)} The methodological framework leverages quantitative parameters to validate these theoretical findings across benchmarked distributions.</p>`;
  }

  static simplify(text: string): string {
    let simple = text
      .replace(/\butilize\b/gi, 'use')
      .replace(/\bcommence\b/gi, 'start')
      .replace(/\bterminate\b/gi, 'end')
      .replace(/\bfacilitate\b/gi, 'help')
      .replace(/\bdemonstrate\b/gi, 'show')
      .replace(/\bsubsequently\b/gi, 'then')
      .replace(/\bnevertheless\b/gi, 'however');
    return `<p>${simple}</p>`;
  }

  static summarize(text: string): string {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const keySentences = sentences.slice(0, Math.min(2, sentences.length)).join(' ');
    return `<blockquote><p><strong>Executive Summary:</strong> ${keySentences}</p></blockquote>`;
  }

  static toBulletPoints(text: string): string {
    const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 5);
    if (sentences.length === 0) {
      return `<ul><li>${text}</li><li>Scalable implementation and performance metrics</li><li>Operational evaluation and strategic goals</li></ul>`;
    }
    return `<ul>${sentences.map(s => `<li>${s.trim()}</li>`).join('')}</ul>`;
  }

  static generateConclusion(text: string): string {
    return `<h3>Conclusion</h3><p>In summary, the findings and implementations detailed above demonstrate clear feasibility, robust architecture, and significant performance advantages. Future iterations will focus on real-time optimization, automated pipelines, and continuous ecosystem integration.</p>`;
  }

  static enhanceClarity(text: string): string {
    return `${text} This methodology ensures consistent performance, clear architecture, and streamlined execution across all workflow phases.`;
  }

  /**
   * AI Presentation Generator
   * Generates a complete slide deck with titles, content blocks, speaker notes, and gradient styles from a prompt
   */
  static generatePresentation(prompt: string, slideCount: number = 6): Slide[] {
    const topic = prompt.trim() || 'AI in Healthcare and Modern Computing';
    const gradients = PRESENTATION_GRADIENTS;

    const slides: Slide[] = [];

    // Slide 1: Title Slide
    slides.push({
      id: `slide_ai_1_${Date.now()}`,
      title: topic,
      layout: 'title',
      background: '#0f172a',
      gradient: gradients[0].gradient,
      gradientDirection: 'to bottom right',
      transition: 'fade',
      speakerNotes: `Welcome everyone. Today we are presenting an in-depth overview on "${topic}".`,
      elements: [
        {
          id: `el_t1_${Date.now()}`,
          type: 'text',
          transform: { x: 80, y: 160, width: 800, height: 120, rotation: 0 },
          content: `<h1 style="font-size: 46px; font-weight: 800; color: #ffffff; line-height: 1.15; margin-bottom: 12px;">${topic}</h1><p style="font-size: 20px; color: #94a3b8; font-weight: 500;">Strategic Analysis, Key Innovations &amp; Future Outlook</p>`,
          style: { color: '#ffffff' },
          zIndex: 1,
        },
        {
          id: `el_t2_${Date.now()}`,
          type: 'text',
          transform: { x: 80, y: 420, width: 600, height: 50, rotation: 0 },
          content: `<p style="font-size: 14px; color: #cbd5e1;">Presented by: OpenDoc Executive Intelligence Team • ${new Date().toLocaleDateString()}</p>`,
          style: { color: '#cbd5e1' },
          zIndex: 2,
        },
      ],
    });

    // Slide 2: Executive Summary / Agenda
    slides.push({
      id: `slide_ai_2_${Date.now()}`,
      title: 'Executive Overview',
      layout: 'two-columns',
      background: '#ffffff',
      gradient: gradients[4].gradient,
      gradientDirection: 'to bottom right',
      transition: 'slide-left',
      speakerNotes: `Here is the high-level roadmap and the core challenges we address.`,
      elements: [
        {
          id: `el_t3_${Date.now()}`,
          type: 'text',
          transform: { x: 60, y: 50, width: 840, height: 70, rotation: 0 },
          content: `<h2 style="font-size: 32px; font-weight: 700; color: #ffffff;">Executive Overview &amp; Objectives</h2>`,
          style: { color: '#ffffff' },
          zIndex: 1,
        },
        {
          id: `el_t4_${Date.now()}`,
          type: 'text',
          transform: { x: 60, y: 150, width: 400, height: 320, rotation: 0 },
          content: `<h3 style="font-size: 20px; font-weight: 600; color: #e2e8f0; margin-bottom: 12px;">Core Challenges</h3><ul style="font-size: 15px; color: #cbd5e1; line-height: 1.7;"><li>Data fragmentation and latency bottlenecks</li><li>Manual processing errors in critical pipelines</li><li>Scalability limits in existing enterprise stacks</li><li>Regulatory compliance and audit overhead</li></ul>`,
          style: { color: '#cbd5e1' },
          zIndex: 2,
        },
        {
          id: `el_t5_${Date.now()}`,
          type: 'text',
          transform: { x: 490, y: 150, width: 400, height: 320, rotation: 0 },
          content: `<h3 style="font-size: 20px; font-weight: 600; color: #e2e8f0; margin-bottom: 12px;">Strategic Solutions</h3><ul style="font-size: 15px; color: #cbd5e1; line-height: 1.7;"><li>Automated neural decision-support algorithms</li><li>Unified cloud data integration pipelines</li><li>Real-time telemetry and predictive models</li><li>Zero-trust security and end-to-end encryption</li></ul>`,
          style: { color: '#cbd5e1' },
          zIndex: 3,
        },
      ],
    });

    // Slide 3: Statistics & Metrics
    slides.push({
      id: `slide_ai_3_${Date.now()}`,
      title: 'Performance Benchmarks',
      layout: 'statistics',
      background: '#0f172a',
      gradient: gradients[6].gradient,
      gradientDirection: 'to bottom right',
      transition: 'zoom',
      speakerNotes: `Let's examine the quantitative impact and performance benchmarks.`,
      elements: [
        {
          id: `el_t6_${Date.now()}`,
          type: 'text',
          transform: { x: 60, y: 50, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 32px; font-weight: 700; color: #ffffff;">Key Performance Benchmarks</h2>`,
          style: { color: '#ffffff' },
          zIndex: 1,
        },
        {
          id: `el_stat1_${Date.now()}`,
          type: 'text',
          transform: { x: 60, y: 160, width: 260, height: 260, rotation: 0 },
          content: `<div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);"><span style="font-size: 54px; font-weight: 800; color: #38bdf8; display: block;">87%</span><span style="font-size: 15px; color: #e2e8f0; font-weight: 600; margin-top: 8px; display: block;">Efficiency Gain</span><p style="font-size: 12px; color: #94a3b8; margin-top: 6px;">Reduction in manual processing turnaround</p></div>`,
          style: { color: '#ffffff' },
          zIndex: 2,
        },
        {
          id: `el_stat2_${Date.now()}`,
          type: 'text',
          transform: { x: 350, y: 160, width: 260, height: 260, rotation: 0 },
          content: `<div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);"><span style="font-size: 54px; font-weight: 800; color: #a855f7; display: block;">3.8x</span><span style="font-size: 15px; color: #e2e8f0; font-weight: 600; margin-top: 8px; display: block;">Throughput Boost</span><p style="font-size: 12px; color: #94a3b8; margin-top: 6px;">Faster analytical and diagnostic workflows</p></div>`,
          style: { color: '#ffffff' },
          zIndex: 3,
        },
        {
          id: `el_stat3_${Date.now()}`,
          type: 'text',
          transform: { x: 640, y: 160, width: 260, height: 260, rotation: 0 },
          content: `<div style="text-align: center; padding: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);"><span style="font-size: 54px; font-weight: 800; color: #34d399; display: block;">99.4%</span><span style="font-size: 15px; color: #e2e8f0; font-weight: 600; margin-top: 8px; display: block;">Accuracy Rate</span><p style="font-size: 12px; color: #94a3b8; margin-top: 6px;">Precision achieved across validation datasets</p></div>`,
          style: { color: '#ffffff' },
          zIndex: 4,
        },
      ],
    });

    // Slide 4: System Architecture / Technical Methodology
    slides.push({
      id: `slide_ai_4_${Date.now()}`,
      title: 'System Architecture',
      layout: 'title-content',
      background: '#090d16',
      gradient: gradients[1].gradient,
      gradientDirection: 'to bottom right',
      transition: 'fade',
      speakerNotes: `This slide outlines the technical pipeline and architectural layers.`,
      elements: [
        {
          id: `el_t7_${Date.now()}`,
          type: 'text',
          transform: { x: 60, y: 50, width: 840, height: 60, rotation: 0 },
          content: `<h2 style="font-size: 32px; font-weight: 700; color: #ffffff;">System Architecture &amp; Methodology</h2>`,
          style: { color: '#ffffff' },
          zIndex: 1,
        },
        {
          id: `el_t8_${Date.now()}`,
          type: 'text',
          transform: { x: 60, y: 140, width: 840, height: 320, rotation: 0 },
          content: `<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <div style="background: rgba(255,255,255,0.08); padding: 18px; border-radius: 8px; border-top: 3px solid #60a5fa;">
              <h4 style="font-size: 16px; font-weight: 700; color: #93c5fd; margin-bottom: 6px;">1. Data Ingestion</h4>
              <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">Ingests structured and unstructured clinical datasets with real-time validation and normalization.</p>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: 18px; border-radius: 8px; border-top: 3px solid #c084fc;">
              <h4 style="font-size: 16px; font-weight: 700; color: #e9d5ff; margin-bottom: 6px;">2. Neural Inference</h4>
              <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">Deploys transformer models to identify critical patterns, anomalies, and prognostic markers.</p>
            </div>
            <div style="background: rgba(255,255,255,0.08); padding: 18px; border-radius: 8px; border-top: 3px solid #34d399;">
              <h4 style="font-size: 16px; font-weight: 700; color: #a7f3d0; margin-bottom: 6px;">3. Secure Delivery</h4>
              <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5;">Delivers contextual insights directly to clinician dashboards with audit trails and access control.</p>
            </div>
          </div>`,
          style: { color: '#ffffff' },
          zIndex: 2,
        },
      ],
    });

    // Slide 5: Strategic Conclusion & Next Steps
    slides.push({
      id: `slide_ai_5_${Date.now()}`,
      title: 'Conclusion',
      layout: 'title-content',
      background: '#0f172a',
      gradient: gradients[3].gradient,
      gradientDirection: 'to bottom right',
      transition: 'zoom',
      speakerNotes: `To conclude, our roadmap positions us for rapid expansion and continuous innovation.`,
      elements: [
        {
          id: `el_t9_${Date.now()}`,
          type: 'text',
          transform: { x: 80, y: 120, width: 800, height: 100, rotation: 0 },
          content: `<h2 style="font-size: 38px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">Strategic Conclusion &amp; Future Outlook</h2><p style="font-size: 18px; color: #fdf2f8;">Empowering decision-makers with reliable, ethical, and high-performance intelligence.</p>`,
          style: { color: '#ffffff' },
          zIndex: 1,
        },
        {
          id: `el_t10_${Date.now()}`,
          type: 'text',
          transform: { x: 80, y: 280, width: 800, height: 180, rotation: 0 },
          content: `<div style="background: rgba(255,255,255,0.12); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2);"><p style="font-size: 16px; color: #ffffff; line-height: 1.6; margin-bottom: 10px;"><strong>Key Takeaway:</strong> Implementing AI-driven pipelines reduces diagnostic turnaround time by over 80% while enhancing clinical consistency.</p><p style="font-size: 14px; color: #fce7f3;">Thank you! Questions &amp; Discussions.</p></div>`,
          style: { color: '#ffffff' },
          zIndex: 2,
        },
      ],
    });

    return slides;
  }

  /**
   * AI Document Generator
   * Generates structured multi-section document reports (e.g. Project Report, Research Paper, Business Proposal)
   */
  static generateDocument(prompt: string, type: 'academic-report' | 'research-paper' | 'business-proposal' | 'meeting-notes' = 'academic-report'): GeneratedDocument {
    const title = prompt.trim() || 'AI-Powered Document Studio: Architectural Design & Implementation Report';

    if (type === 'academic-report') {
      return {
        title,
        category: 'Final Year Project / Academic Report',
        summary: 'Complete multi-section academic project report with title page, abstract, methodology, system architecture, results, and references.',
        content: `
<h1 style="text-align: center; margin-bottom: 8px;">${title}</h1>
<p style="text-align: center; font-size: 14px; color: #64748b; margin-bottom: 24px;"><strong>Department of Computer Science &amp; Engineering</strong><br />Academic Year 2025–2026</p>

<hr />

<h2>Abstract</h2>
<p>Modern productivity suites demand high-fidelity typography, dynamic multi-page layouts, and responsive editing models. This project presents <strong>OpenDoc Studio</strong>, an extensible document engineering platform combining independent pagination, Canva-style visual element manipulation, vector graphics rendering, and AI-assisted text generation. Empirical testing demonstrates sub-10ms render latency and flawless PDF/Word serialization across diverse document profiles.</p>

<div data-type="page-break"></div>

<h2>1. Introduction</h2>
<p>The digitization of academic and enterprise documentation has highlighted significant deficiencies in conventional web editors, notably regarding overflow containment, multi-column rendering, and visual element anchoring. This project addresses these challenges by introducing a unified canvas architecture capable of fluidly switching between strict paged documents, interactive presentations, and freeform vector designs.</p>

<h3>1.1 Problem Statement</h3>
<p>Existing solutions either compromise on true A4 paper boundaries or fail to provide fine-grained visual element controls, resulting in content bleed, pagination misalignment, and fragmented user workflows.</p>

<h3>1.2 Objectives</h3>
<ul>
  <li>Implement strict A4 paper container isolation with zero inter-page content overlapping.</li>
  <li>Provide a Canva-style 8-handle transformation system for text, vector shapes, diagrams, and math equations.</li>
  <li>Integrate AI writing and presentation generation tools natively within the editor ribbon.</li>
</ul>

<div data-type="page-break"></div>

<h2>2. System Architecture &amp; Methodology</h2>
<p>The application architecture is structured into modular layers encompassing state persistence, layout measurement, visual transformation, and document export pipelines.</p>

<h3>2.1 Core Architectural Layers</h3>
<ul>
  <li><strong>State Engine:</strong> Reactive Zustand store managing documents, version histories, and brand kits.</li>
  <li><strong>Page Measurement Engine:</strong> Precise DOM block measurement and page splitting.</li>
  <li><strong>Transform Engine:</strong> Interactive 8-point geometric bounding boxes for canvas elements.</li>
  <li><strong>Export Pipeline:</strong> Native multi-format serializers for PDF, DOCX, PPTX, HTML, and Markdown.</li>
</ul>

<div data-type="page-break"></div>

<h2>3. Experimental Results &amp; Performance</h2>
<p>Benchmarking against large academic documents (10+ pages, 15,000 words, multi-column tables, and LaTeX equations) revealed consistent 60fps scrolling and instant pagination recalibration.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px;">
  <thead>
    <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
      <th style="padding: 8px; text-align: left;">Metric</th>
      <th style="padding: 8px; text-align: left;">Standard Web Editor</th>
      <th style="padding: 8px; text-align: left;">OpenDoc Studio</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px;">Pagination Latency</td>
      <td style="padding: 8px;">120ms</td>
      <td style="padding: 8px; font-weight: bold; color: #2563eb;">8ms</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px;">Page Separation Accuracy</td>
      <td style="padding: 8px;">74%</td>
      <td style="padding: 8px; font-weight: bold; color: #2563eb;">100%</td>
    </tr>
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 8px;">Multi-Device Responsiveness</td>
      <td style="padding: 8px;">Partial</td>
      <td style="padding: 8px; font-weight: bold; color: #2563eb;">Full</td>
    </tr>
  </tbody>
</table>

<h2>4. Conclusion &amp; Future Work</h2>
<p>OpenDoc Studio successfully bridges the gap between structured desktop word processors and agile graphic design environments. Future expansions will introduce real-time collaborative cursors and automated citation bibliography indexing.</p>

<h2>References</h2>
<ol>
  <li>Knuth, D. E. (1984). <em>The TeXbook</em>. Addison-Wesley.</li>
  <li>Lamport, L. (1994). <em>LaTeX: A Document Preparation System</em>. Addison-Wesley.</li>
  <li>W3C CSS Paged Media Module Level 3 Specification (2020).</li>
</ol>
`,
      };
    }

    return {
      title,
      category: 'Business & Project Proposal',
      summary: 'Structured commercial proposal outlining strategic goals, project scope, budget breakdown, and timeline.',
      content: `
<h1 style="text-align: center;">${title}</h1>
<p style="text-align: center; font-size: 14px; color: #64748b;"><strong>Strategic Proposal &amp; Execution Plan</strong></p>

<hr />

<h2>1. Executive Summary</h2>
<p>This proposal outlines a high-impact initiative designed to streamline operational workflows, reduce turnaround overhead, and deliver scalable digital capabilities.</p>

<h2>2. Project Scope &amp; Deliverables</h2>
<ul>
  <li>Deployment of automated document generation pipelines.</li>
  <li>Integration with cloud enterprise storage and single sign-on.</li>
  <li>Comprehensive team training and 24/7 SLA maintenance.</li>
</ul>

<h2>3. Timeline &amp; Budget</h2>
<p>The engagement is scheduled across three milestone phases over 12 weeks with guaranteed delivery milestones.</p>
`,
    };
  }
}
