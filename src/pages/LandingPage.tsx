import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { TemplateEngine } from '@/engines/TemplateEngine';
import { EditorMode } from '@/engines/types';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileText, Presentation, Palette, Sparkles, ArrowRight,
  ShieldCheck, Download, Code2, Calculator, GitFork, Check,
  Zap, Database, Printer, Layers, Globe, Star, FileCheck,
  CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';

const HOMEPAGE_FAQS = [
  {
    question: 'What is DocFlow?',
    answer: 'DocFlow is an all-in-one browser-based document and design workspace that lets you create, edit, convert, and share paginated documents, slide presentations, interactive flowcharts, ATS resumes, and PDFs in one unified interface.',
  },
  {
    question: 'Is DocFlow free to use?',
    answer: 'Yes! DocFlow provides core document editing, presentation creation, flowchart diagramming, resume building, and PDF tools free without watermarks or mandatory account creation.',
  },
  {
    question: 'Does DocFlow store my confidential documents on cloud servers?',
    answer: 'By default, DocFlow processes documents, presentations, flowcharts, and resumes client-side in your browser with private IndexedDB local autosave. Your private content remains under your control.',
  },
  {
    question: 'Can I export my work to PDF, DOCX, and SVG?',
    answer: 'Yes! You can export paginated documents to PDF and DOCX, presentations to PDF and slide formats, flowcharts to vector SVG and high-resolution PNG, and resumes to ATS-ready PDFs.',
  },
  {
    question: 'Does DocFlow work on mobile devices?',
    answer: 'Yes. DocFlow is designed with touch-friendly responsive interfaces, including proportional slide scaling for presentations and dedicated touch navigation for flowchart editing.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();
  const [activePreviewTab, setActivePreviewTab] = useState<'document' | 'presentation' | 'flowchart' | 'resume'>('document');

  const handleStartMode = (mode: EditorMode = 'document') => {
    const doc = createDocument({
      title: mode === 'presentation' ? 'Untitled Presentation' : mode === 'design' ? 'Untitled Visual Design' : 'Untitled Document',
      mode,
    });
    toast.success(`Started new ${mode} project`);
    navigate(`/editor/${doc.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      <SEOHead
        title="DocFlow | All-in-One Document & Design Workspace"
        description="Create and edit documents, presentations, flowcharts, resumes, and PDFs in one fast online workspace. Import, customize, convert, export, and share your work with DocFlow."
        canonicalPath="/"
        h1="Create, Edit, Convert, and Share Your Work in One Workspace"
        faqs={HOMEPAGE_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* ── 1. HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>DocFlow • All-in-One Document &amp; Design Workspace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Create, Edit, Convert, and Share Your Work in One Workspace
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            DocFlow brings documents, presentations, flowcharts, resumes, and PDF tools together in one simple, fast online workspace. No bloated software, zero telemetry tracking, and 100% private autosave.
          </p>

          {/* Primary Hero CTAs */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto h-12 px-8 text-sm font-bold gap-2 shadow-lg shadow-primary/25"
            >
              <Sparkles className="h-4 w-4" /> Start Creating Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/templates')}
              className="w-full sm:w-auto h-12 px-6 text-sm font-semibold gap-2 border-border"
            >
              Explore Templates <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Interactive Mode Preview Switcher */}
          <div className="pt-10">
            <div className="inline-flex items-center gap-1.5 bg-card border border-border p-1.5 rounded-2xl shadow-sm overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActivePreviewTab('document')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activePreviewTab === 'document' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <FileText className="h-4 w-4" /> Document Editor
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('presentation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activePreviewTab === 'presentation' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Presentation className="h-4 w-4" /> Presentation Maker
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('flowchart')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activePreviewTab === 'flowchart' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <GitFork className="h-4 w-4" /> Flowchart Studio
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('resume')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activePreviewTab === 'resume' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <FileCheck className="h-4 w-4" /> Resume Builder
              </button>
            </div>

            {/* Interactive Preview Container */}
            <div className="mt-4 max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-2xl p-6 relative overflow-hidden text-left">
              {activePreviewTab === 'document' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-primary">A4 Paginated Document Mode</span>
                    <span className="text-xs text-muted-foreground">Times New Roman / Inter • KaTeX Math • TOC</span>
                  </div>
                  <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-border space-y-3 font-serif shadow-xs">
                    <h2 className="text-lg font-bold text-blue-900 dark:text-blue-400">1. EXECUTIVE SUMMARY &amp; SYSTEM DESIGN</h2>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      DocFlow eliminates fragmented productivity tools by housing paginated reports, real-time math equations, citations, and diagram figures within one fast browser session.
                    </p>
                    <div className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200">
                      {'\\oint_{\\partial \\Omega} \\mathbf{E} \\cdot d\\mathbf{l} = -\\frac{\\partial}{\\partial t} \\iint_{\\Omega} \\mathbf{B} \\cdot d\\mathbf{A}'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link to="/document-editor" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                      Learn more about Document Editor <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Button size="sm" onClick={() => handleStartMode('document')} className="gap-1.5 text-xs font-bold">
                      Open Document Editor <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {activePreviewTab === 'presentation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-amber-500">16:9 Slide Presentation Mode</span>
                    <span className="text-xs text-muted-foreground">Proportional Canvas Scaling • Corporate Navy Theme</span>
                  </div>
                  <div className="aspect-video max-h-56 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-xs">
                    <div>
                      <span className="text-xs text-blue-400 font-mono">SLIDE 01 / 10</span>
                      <h3 className="text-xl font-bold mt-1 text-white">Engineering Project Architecture</h3>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Modular client-side canvas rendering</li>
                      <li>• Automated theme propagation across all slides</li>
                      <li>• Fullscreen presenter mode with private talking points</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link to="/presentation-maker" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                      Learn more about Presentation Maker <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Button size="sm" onClick={() => handleStartMode('presentation')} className="gap-1.5 text-xs font-bold">
                      Open Presentation Maker <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {activePreviewTab === 'flowchart' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-indigo-500">Interactive Flowchart Studio</span>
                    <span className="text-xs text-muted-foreground">Smart 4-Directional Routing • Auto-Layout</span>
                  </div>
                  <div className="p-6 bg-slate-100 dark:bg-zinc-900/80 rounded-xl border border-border flex items-center justify-center gap-4 py-8 shadow-xs">
                    <div className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-sm">Start: Request</div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-sm">Process Data</div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                    <div className="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold shadow-sm">Database Sync</div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link to="/flowchart-maker" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                      Learn more about Flowchart Maker <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Button size="sm" onClick={() => navigate('/flowchart')} className="gap-1.5 text-xs font-bold">
                      Open Flowchart Studio <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {activePreviewTab === 'resume' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-emerald-500">ATS Resume Builder</span>
                    <span className="text-xs text-muted-foreground">Single &amp; Two Column • Clean PDF Export</span>
                  </div>
                  <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-border space-y-2 text-xs text-slate-700 dark:text-slate-300 shadow-xs">
                    <div className="border-b pb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Alex Morgan — Senior Software Engineer</h3>
                      <p className="text-[11px] text-muted-foreground">San Francisco, CA • alex@example.com • github.com/alex</p>
                    </div>
                    <p className="font-semibold text-slate-900 dark:text-white pt-1">EXPERIENCE</p>
                    <p className="text-[11px]">Staff Engineer at CloudScale — Built distributed indexing pipeline serving 40M daily active requests.</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Link to="/resume-builder" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                      Learn more about Resume Builder <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    <Button size="sm" onClick={() => navigate('/resume')} className="gap-1.5 text-xs font-bold">
                      Open Resume Builder <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. EVERYTHING YOU NEED TO CREATE BETTER DOCUMENTS ────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Everything You Need to Create Better Documents
          </h2>
          <p className="text-sm text-muted-foreground">
            Six dedicated production tools designed to work seamlessly together in one fast browser workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Document Editor */}
          <Link
            to="/document-editor"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
              Online Document Editor
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Create and format professional documents with true A4 page constraints, auto Table of Contents, KaTeX math formulas, and instant PDF/DOCX export.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore Document Editor <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Card 2: Presentation Maker */}
          <Link
            to="/presentation-maker"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Presentation className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
              Presentation Maker
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Build high-impact 16:9 slide decks with rich curated themes, apply-to-all formatting, interactive presenter mode, and speaker notes.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore Presentation Maker <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Card 3: Flowchart Maker */}
          <Link
            to="/flowchart-maker"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitFork className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
              Flowchart Studio
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Map out workflows, decision trees, and software architecture with smart 4-directional flexible connectors and instant auto-layout.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore Flowchart Maker <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Card 4: Resume Builder */}
          <Link
            to="/resume-builder"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
              ATS Resume Builder
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Craft recruiter-ready, ATS-compliant CVs with structured sections, skills chips, and clean vector typography PDF downloads.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore Resume Builder <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Card 5: PDF Tools */}
          <Link
            to="/pdf-editor"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
              PDF Editor &amp; Annotator
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Annotate, sign, rearrange pages, and export PDF files directly in your web browser with 100% privacy and zero server uploads.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore PDF Tools <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Card 6: File Converter */}
          <Link
            to="/file-converter"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold group-hover:text-primary transition-colors">
              File Converter
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Convert DOCX to PDF, HTML to Markdown, JSON to CSV, and diagrams to SVG/PNG instantly without third-party converters.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore File Converter <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── 3. WHY DOCFLOW? ──────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Professionals &amp; Students Choose DocFlow
            </h2>
            <p className="text-sm text-muted-foreground">
              Engineered for maximum speed, clean typography, and browser-first reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-sm">Instant Load Time</h3>
              <p className="text-xs text-muted-foreground">Zero bloat. Starts up instantly in any modern browser without install.</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-sm">100% Private Autosave</h3>
              <p className="text-xs text-muted-foreground">Data is saved locally in browser IndexedDB. No tracking or telemetry.</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <Download className="h-5 w-5 text-blue-500" />
              <h3 className="font-bold text-sm">Multi-Format Exports</h3>
              <p className="text-xs text-muted-foreground">Export clean PDF, DOCX, SVG, PNG, and JSON files without watermarks.</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card space-y-2">
              <Globe className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-sm">Mobile &amp; Desktop</h3>
              <p className="text-xs text-muted-foreground">Fluidly responsive across phones, tablets, laptops, and ultra-wide screens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. FREQUENTLY ASKED QUESTIONS ────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Clear answers about DocFlow, privacy, exports, and supported workflows.
          </p>
        </div>

        <div className="space-y-4">
          {HOMEPAGE_FAQS.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-border bg-card space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. FINAL CALL TO ACTION ─────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gradient-to-t from-primary/10 via-background to-background border-t border-border text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Start Creating Better Documents Today
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Join thousands of students, researchers, engineers, and creators who build with DocFlow.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="h-12 px-8 text-sm font-bold shadow-xl shadow-primary/25"
          >
            <Sparkles className="h-4 w-4 mr-2" /> Start Creating Free
          </Button>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
