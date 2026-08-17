import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileText, Presentation, GitFork, UserCheck, Layers,
  Sparkles, ArrowRight, Check, Zap, Globe, Shield,
  Laptop, Plus, Star, Folder, CheckCircle2, ChevronRight,
  MoveRight, FileCheck, MousePointerClick
} from 'lucide-react';
import { cn } from '@/utils/cn';

const HOMEPAGE_FAQS = [
  {
    question: 'What is DocProEditor?',
    answer: 'DocProEditor is an all-in-one browser workspace that brings documents, presentations, flowcharts, resumes, and PDF tools together into one simple interface.',
  },
  {
    question: 'Is sign-up required to use DocProEditor?',
    answer: 'No sign-up is required. You can start creating documents, slide decks, flowcharts, resumes, and editing PDFs immediately for free.',
  },
  {
    question: 'How are my files saved?',
    answer: 'Your files are saved directly in your browser with private local autosave. You can also export your work anytime as PDF, DOCX, SVG, or images.',
  },
  {
    question: 'Can I export to PDF and DOCX?',
    answer: 'Yes! You can export paginated documents to PDF and DOCX, presentations to PDF, flowcharts to vector SVG and PNG, and resumes to ATS-ready PDFs.',
  },
  {
    question: 'Does DocProEditor work on mobile?',
    answer: 'Yes. DocProEditor features a dedicated mobile touch interface with fluid scrolling, safe-area support, and responsive canvas scaling.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const [activePreviewTab, setActivePreviewTab] = useState<'document' | 'presentation' | 'flowchart' | 'resume'>('document');

  const handleStartFree = () => {
    navigate('/dashboard');
  };

  const handleCreateDocument = () => {
    const doc = createDocument({ title: 'Untitled Document', mode: 'document' });
    navigate(`/editor/${doc.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20 antialiased">
      <SEOHead
        title="DocProEditor - Online Document Editor, PDF Tools, Presentations & More"
        description="DocProEditor is a simple online workspace for creating and editing documents, presentations, flowcharts, resumes, and PDF files."
        canonicalPath="/landing"
        h1="Create, Edit, Convert, and Share Your Work All in One Place"
        faqs={HOMEPAGE_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      <main className="flex-1">
        {/* ── 2. HERO SECTION ─────────────────────────────────────────────────── */}
        <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.04] via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background">
          {/* Subtle Ambient Radial Light */}
          <div
            className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none opacity-40 dark:opacity-20 blur-3xl -z-10"
            style={{
              background: 'radial-gradient(circle at 70% 20%, rgba(59,130,246,0.25), transparent 60%)',
            }}
          />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>All-in-One Workspace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Create, Edit, Convert, <br className="hidden sm:inline" />
                and Share Your Work <br className="hidden sm:inline" />
                <span className="text-primary bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  All in One Place
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                DocProEditor brings documents, presentations, flowcharts, resumes, and PDF tools together in one simple, fast, and secure workspace.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5">
                <Button
                  size="lg"
                  onClick={handleStartFree}
                  className="h-12 px-7 text-sm font-bold gap-2 shadow-lg shadow-primary/25 cursor-pointer"
                  aria-label="Start Creating Free"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Creating Free</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/templates')}
                  className="h-12 px-6 text-sm font-semibold gap-2 border-border hover:bg-muted/80 cursor-pointer"
                  aria-label="Explore Templates"
                >
                  <span>Explore Templates</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* 3 Simple Benefits */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>No Sign Up Required</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Fast &amp; Simple</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Works Anywhere</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Quality Lightweight Application Mockup */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border/80 bg-card/90 dark:bg-[#111A2B] shadow-2xl overflow-hidden transition-all duration-300 hover:border-primary/30">
                {/* Mockup Window Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/60 dark:bg-[#0D1422] border-b border-border/70 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span>DocProEditor Workspace • Project Report</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono bg-background/50 px-2 py-0.5 rounded border border-border/50">
                    Autosaved
                  </div>
                </div>

                {/* Mockup App Interface */}
                <div className="p-4 sm:p-5 space-y-4 text-left">
                  {/* Tool Tabs Switcher */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60">
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('document')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activePreviewTab === 'document'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Document</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('presentation')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activePreviewTab === 'presentation'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <Presentation className="h-3.5 w-3.5" />
                      <span>Presentation</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('flowchart')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activePreviewTab === 'flowchart'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <GitFork className="h-3.5 w-3.5" />
                      <span>Flowchart</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab('resume')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                        activePreviewTab === 'resume'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Resume</span>
                    </button>
                  </div>

                  {/* Active Preview Body */}
                  {activePreviewTab === 'document' && (
                    <div className="space-y-3 p-4 rounded-xl bg-background border border-border/70 shadow-inner">
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/50">
                        <span className="font-semibold text-primary">A4 Paginated Sheet • Page 1 of 1</span>
                        <span>100% Zoom</span>
                      </div>
                      <h3 className="text-base font-bold text-foreground">System Architecture &amp; Requirements</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        DocProEditor unifies rich text editing, LaTeX mathematical formulas, dynamic flowchart diagrams, and slide decks in a single browser-native workspace.
                      </p>
                      <div className="p-2.5 rounded-lg bg-muted/40 dark:bg-[#162238] border border-border/60 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-foreground">Formula: f(x) = \sigma(W \cdot x + b)</span>
                        <span className="text-primary font-semibold">KaTeX Rendered</span>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'presentation' && (
                    <div className="p-4 rounded-xl bg-background border border-border/70 space-y-3 aspect-[16/9] flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Slide 01 • Product Vision</span>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground">All-in-One Document Workspace</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                        Create, format, and present professional slide decks with customizable layouts and responsive navigation.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">16:9 Canvas</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">PDF Export</span>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'flowchart' && (
                    <div className="p-4 rounded-xl bg-background border border-border/70 space-y-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">Interactive Diagram Canvas</span>
                        <span>SVG Vector</span>
                      </div>
                      <div className="flex items-center justify-center gap-3 py-4 text-xs font-semibold">
                        <div className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-xs">
                          Start Process
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-xs">
                          Transform Data
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs">
                          Export Result
                        </div>
                      </div>
                    </div>
                  )}

                  {activePreviewTab === 'resume' && (
                    <div className="p-4 rounded-xl bg-background border border-border/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="font-bold text-sm text-foreground">Alex Morgan</span>
                        <span className="text-muted-foreground">Senior Product Engineer</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Experienced in frontend architecture, design systems, and building high-performance web applications.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">ATS Scored: 98%</span>
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-muted text-muted-foreground">1-Page Layout</span>
                      </div>
                    </div>
                  )}

                  {/* Mockup Quick Footer */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Ready to edit</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartFree}
                      className="text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open in Studio</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. TRUST / VALUE STRIP ──────────────────────────────────────────── */}
        <section className="py-8 border-b border-border/50 bg-muted/20 dark:bg-[#0D1422]/60 select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Everything you need to create professional work
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {[
                { label: 'Documents', icon: FileText, to: '/document-editor' },
                { label: 'Presentations', icon: Presentation, to: '/presentation-maker' },
                { label: 'Flowcharts', icon: GitFork, to: '/flowchart-maker' },
                { label: 'PDF Tools', icon: Layers, to: '/pdf-editor' },
                { label: 'Resume Builder', icon: UserCheck, to: '/resume-builder' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-background border border-border hover:border-primary/40 hover:text-primary transition-all shadow-2xs"
                >
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. POWERFUL TOOLS SECTION ───────────────────────────────────────── */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Everything You Need to Get Work Done
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Create, edit, organize, and export professional work from one simple workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {/* Tool 1: Document Editor */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Document Editor
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Create polished documents, reports, assignments, and project documentation with real-time formatting.
                </p>
              </div>
              <Link
                to="/document-editor"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
              >
                <span>Launch Document Editor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Tool 2: Presentation Maker */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Presentation className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Presentation Maker
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Build professional presentations with flexible text, layouts, side-by-side navigation, and styling.
                </p>
              </div>
              <Link
                to="/presentation-maker"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
              >
                <span>Launch Presentation Maker</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Tool 3: Flowchart Studio */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <GitFork className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Flowchart Studio
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Create clear diagrams and workflows with simple node-based editing and touch-friendly controls.
                </p>
              </div>
              <Link
                to="/flowchart-maker"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
              >
                <span>Launch Flowchart Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Tool 4: PDF Tools */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  PDF Tools
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Merge, convert, organize, annotate, and work with PDF files quickly directly in the browser.
                </p>
              </div>
              <Link
                to="/pdf-editor"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
              >
                <span>Explore PDF Tools</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Tool 5: Resume Builder */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  Resume Builder
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Build clean, professional, ATS-ready resumes using structured, customizable templates.
                </p>
              </div>
              <Link
                to="/resume-builder"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-2"
              >
                <span>Launch Resume Builder</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick Access Card: Templates */}
            <div className="p-6 rounded-2xl border border-primary/20 bg-primary/[0.03] dark:bg-[#162238] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Ready-to-Use Templates
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Kickstart your reports, pitch decks, flowcharts, and resumes with pre-built professional designs.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/templates')}
                className="w-fit text-xs font-bold gap-1.5 shadow-sm"
                aria-label="Browse Templates Library"
              >
                <span>Browse All Templates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── 5. HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-border/60 bg-muted/20 dark:bg-[#0D1422]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                How It Works
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Create and finish your work in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Step 1 */}
              <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] space-y-3">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">01</div>
                <h3 className="text-base font-bold text-foreground">Choose a tool</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Select Document, Presentation, Flowchart, Resume Builder, or PDF Tools according to your project goal.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] space-y-3">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">02</div>
                <h3 className="text-base font-bold text-foreground">Create and edit</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Customize content, typography, diagrams, and formatting with responsive real-time editing.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] space-y-3">
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-primary">03</div>
                <h3 className="text-base font-bold text-foreground">Export or share</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Download high-resolution PDF, DOCX, SVG, or presentation files ready for submission and publishing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. PRODUCTIVITY SECTION ("One Workspace. Less Switching.") ──────── */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left: Lightweight Unified Preview */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="p-6 rounded-2xl border border-border/80 bg-card dark:bg-[#111A2B] shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>Seamless Studio Switching</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">0 Latency</span>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-[#162238] border border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-foreground">Annual Project Report</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Document</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-[#162238] border border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <Presentation className="h-4 w-4 text-amber-500" />
                      <span className="font-semibold text-foreground">Stakeholder Slide Deck</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Presentation</span>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 dark:bg-[#162238] border border-border/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <GitFork className="h-4 w-4 text-indigo-500" />
                      <span className="font-semibold text-foreground">System Architecture Diagram</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Flowchart</span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground pt-1">
                  All documents and assets remain unified in your workspace without switching between separate browser tabs or desktop applications.
                </p>
              </div>
            </div>

            {/* Right: Heading & Description */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-5 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                One Workspace. <br />
                <span className="text-primary">Less Switching.</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Move freely between paginated documents, slide decks, flowcharts, PDF tools, and resumes without needing separate software suites or subscriptions.
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleStartFree}
                  className="font-bold text-xs sm:text-sm h-11 px-6 gap-2 shadow-md cursor-pointer"
                  aria-label="Start Creating Free"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Start Creating Free</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-border/60 bg-gradient-to-b from-background via-primary/[0.04] to-primary/[0.08] dark:from-background dark:via-blue-950/20 dark:to-blue-950/30 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Ready to create something?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Start with a document, presentation, flowchart, resume, or PDF tool.
            </p>
            <div className="pt-2 flex justify-center">
              <Button
                size="lg"
                onClick={handleStartFree}
                className="h-12 px-8 text-sm font-bold gap-2 shadow-xl shadow-primary/25 cursor-pointer"
                aria-label="Start Creating Free"
              >
                <Sparkles className="h-4 w-4" />
                <span>Start Creating Free</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
