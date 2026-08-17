import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { BookOpen, FileText, GitFork, Presentation, FileCheck, ArrowRight, Sparkles } from 'lucide-react';

export function GuidesHubPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Guides &amp; Tutorials | Document &amp; Diagram Creation | DocFlow"
        description="Comprehensive, step-by-step guides for writing university project reports, designing flowcharts, crafting presentations, and building ATS resumes."
        canonicalPath="/guides"
        h1="DocFlow Guides &amp; Tutorials"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Guides', item: '/guides' },
        ]}
      />

      <PublicHeader />

      <section className="py-16 px-6 bg-gradient-to-b from-primary/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <BookOpen className="h-3.5 w-3.5" />
            <span>DocFlow Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Document &amp; Diagram Creation Guides
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            In-depth, practical guides engineered to help university students, software engineers, and researchers create publication-quality documents, diagrams, and decks.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guide 1: Project Report */}
          <Link
            to="/guides/how-to-make-a-project-report"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Academic &amp; Engineering</span>
            <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
              How to Make a Project Report: The Complete Engineering Guide
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Step-by-step blueprint covering standard A4 cover pages, Certificate, Abstract, Table of Contents, KaTeX formulas, and IEEE citations.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Read Complete Guide <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Guide 2: Flowchart */}
          <Link
            to="/guides/how-to-create-a-flowchart"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GitFork className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">Diagramming &amp; Logic</span>
            <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
              How to Create a Flowchart: Symbols, Logic, and Best Practices
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Master process flowcharts, decision branch structures, standard ANSI symbols, and clean 4-directional connection layout principles.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Read Complete Guide <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Guide 3: Presentation */}
          <Link
            to="/presentation-maker"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Presentation className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Presentation Design</span>
            <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
              How to Structure a Winning 10-Slide Project Presentation Deck
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Learn the 10-slide standard for academic thesis defenses, technical project reviews, and venture capital pitch presentations.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore Presentation Maker <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>

          {/* Guide 4: Resume */}
          <Link
            to="/resume-builder"
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg space-y-3 group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Career &amp; Recruiting</span>
            <h2 className="text-lg font-bold group-hover:text-primary transition-colors">
              How to Build an ATS-Friendly Resume for Tech &amp; Engineering Roles
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Format work experience bullet points using the Google XYZ formula, organize technical skills, and export clean vector PDFs.
            </p>
            <span className="text-xs text-primary font-semibold inline-flex items-center gap-1">
              Explore Resume Builder <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
