import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { TemplateEngine } from '@/engines/TemplateEngine';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileText, Presentation, Palette, Sparkles, CheckCircle2,
  ArrowRight, ShieldCheck, Download, Code2, Calculator
} from 'lucide-react';

interface SeoToolConfig {
  title: string;
  subtitle: string;
  metaDesc: string;
  heroBadge: string;
  templateId: string;
  features: { title: string; desc: string }[];
  faqs: { q: string; a: string }[];
}

const SEO_TOOLS: Record<string, SeoToolConfig> = {
  'project-report-maker': {
    title: 'Free Online Project Report Maker for College & Engineering',
    subtitle: 'Generate standard academic project reports with automatic Cover Page, Certificate, Declaration, Table of Contents, List of Figures, and IEEE Citations.',
    metaDesc: 'Create professional university project reports, college assignments, and thesis documents online with DocProEditor. Paginated A4 canvas, equation editor, flowcharts, and instant PDF/DOCX export.',
    heroBadge: 'Academic Project Report Builder',
    templateId: 'academic-project-report',
    features: [
      { title: 'Standard Academic Presets', desc: 'Pre-formatted according to university guidelines: A4 size, Times New Roman, 1.5 line spacing, and justified margins.' },
      { title: 'Auto Table of Contents & Figures', desc: 'Dynamically track H1-H4 headings and generate clickable TOC with dotted leaders and page numbers.' },
      { title: 'KaTeX Math Equations & Flowcharts', desc: 'Insert complex mathematical formulas, matrices, and system architecture diagrams with zero configuration.' },
      { title: 'Multi-Format PDF & DOCX Export', desc: 'Export high-resolution printable PDFs or editable Word DOCX files directly from your browser.' },
    ],
    faqs: [
      { q: 'Is DocProEditor free for students and researchers?', a: 'Yes! DocProEditor provides core features 100% free without watermarks, page limits, or forced subscriptions.' },
      { q: 'Can I customize the university cover page?', a: 'Yes, our Academic Cover Page builder allows you to specify University Name, Department, Guide Name, Student USN, and Academic Year.' },
      { q: 'Does this save my work if I close the tab?', a: 'Yes, DocProEditor uses browser-native IndexedDB to automatically save every keystroke locally on your machine.' },
    ],
  },
  'resume-maker': {
    title: 'Professional ATS-Friendly Resume & CV Builder',
    subtitle: 'Craft modern, high-impact software engineer, business, and academic resumes with clean typography and instant PDF export.',
    metaDesc: 'Free online resume and CV maker with DocProEditor. Build ATS-compliant resumes with modular sections, skills matrices, and instant PDF downloads.',
    heroBadge: 'ATS Resume Builder',
    templateId: 'modern-tech-resume',
    features: [
      { title: 'ATS-Optimized Formatting', desc: 'Clean single and two-column layouts that parse accurately through Applicant Tracking Systems.' },
      { title: 'Modular Sections', desc: 'Easily organize Summary, Experience, Skills, Featured Projects, and Education.' },
      { title: 'High-Res PDF Export', desc: 'Download pixel-perfect, recruiter-ready PDFs with clean vector typography.' },
    ],
    faqs: [
      { q: 'Are resumes downloaded without watermarks?', a: 'Yes, all resumes export cleanly with zero watermarks or subscription prompts.' },
      { q: 'Is my personal information stored securely?', a: 'DocProEditor operates with local browser-first storage. Your personal information is not sold or sent to remote servers.' },
    ],
  },
  'presentation-maker': {
    title: 'Online Pitch Deck & Slide Presentation Maker',
    subtitle: 'Create 16:9 widescreen PowerPoint-style presentations with built-in themes, charts, diagrams, speaker notes, and fullscreen presenter mode.',
    metaDesc: 'Design pitch decks and presentations online with DocProEditor. Widescreen 16:9 slides, rich themes, live presenter mode, speaker notes, and PDF/PPTX export.',
    heroBadge: 'Slide Presentation Studio',
    templateId: 'startup-pitch-deck',
    features: [
      { title: 'Widescreen 16:9 & 4:3 Slides', desc: 'Modern aspect ratios with slide thumbnail management and drag reordering.' },
      { title: 'Curated Themes', desc: 'Switch between Corporate Navy, Modern Minimal, Emerald Tech, and Dark Slate themes.' },
      { title: 'Fullscreen Presenter Mode', desc: 'Present with live slide preview, timer, and private speaker notes.' },
    ],
    faqs: [
      { q: 'Can I present directly from my browser?', a: 'Yes, click the Present button to enter fullscreen presenter mode with private notes and timer.' },
    ],
  },
  'certificate-maker': {
    title: 'Free Online Certificate of Achievement & Completion Maker',
    subtitle: 'Design certificates with ornamental borders, official seals, customizable recipient names, and digital signature pads.',
    metaDesc: 'Create certificates of excellence, workshop completion, and awards online with customizable frames, signatures, and PDF export.',
    heroBadge: 'Certificate Designer',
    templateId: 'certificate-of-achievement',
    features: [
      { title: 'Ornamental Borders & Seals', desc: 'Gold and navy decorative frames with authentic award badges.' },
      { title: 'Digital Signature Tool', desc: 'Draw, type cursive calligraphy, or upload authorized signatory signatures.' },
      { title: 'High-Res Print Export', desc: 'Download print-ready landscape certificates for framing and distribution.' },
    ],
    faqs: [
      { q: 'Can I add our institution logo and signatures?', a: 'Yes, you can upload logos, images, and draw or type custom signatures.' },
    ],
  },
};

export function SeoToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();

  const toolKey = toolId || 'project-report-maker';
  const tool = SEO_TOOLS[toolKey] || SEO_TOOLS['project-report-maker'];

  const handleStartNow = () => {
    const tmpl = TemplateEngine.getTemplateById(tool.templateId);
    if (tmpl) {
      const doc = createDocument({
        title: tmpl.initialDocument.title || tmpl.title,
        mode: tmpl.mode,
        initialData: tmpl.initialDocument as any,
      });
      toast.success(`Created project: ${tool.title}`);
      navigate(`/editor/${doc.id}`);
    } else {
      const doc = createDocument({ title: tool.title });
      navigate(`/editor/${doc.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${tool.title} | DocProEditor`}
        description={tool.metaDesc}
        canonicalPath={`/tools/${toolKey}`}
        h1={tool.title}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Tools', item: '/tools' },
          { name: tool.heroBadge, item: `/tools/${toolKey}` },
        ]}
        faqs={tool.faqs.map(f => ({ question: f.q, answer: f.a }))}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-16 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            {tool.heroBadge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {tool.title}
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {tool.subtitle}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 text-sm font-semibold shadow-lg" onClick={handleStartNow}>
              Start Creating Now — Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/templates')}>
              Browse All Templates
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-14 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Key Features &amp; Capabilities</h2>
          <p className="text-sm text-muted-foreground">Engineered for academic precision, design elegance, and maximum speed.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tool.features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <h3 className="font-semibold text-base">{f.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed pl-7">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {tool.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border bg-card space-y-1">
                <h4 className="font-semibold text-sm text-foreground">{faq.q}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-border bg-muted/30 py-12 px-6 mt-auto text-center">
        <div className="max-w-xl mx-auto space-y-3">
          <h3 className="text-xl font-bold">Ready to craft your document?</h3>
          <p className="text-xs text-muted-foreground">No account or credit card required. Everything runs locally in your browser.</p>
          <Button size="lg" className="mt-2 gap-2" onClick={handleStartNow}>
            Launch DocProEditor Workspace <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
