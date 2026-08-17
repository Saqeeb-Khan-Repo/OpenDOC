import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  GitFork, Sparkles, BookOpen, ArrowRight, Layers,
  Square, Diamond, Circle, Database, FileText
} from 'lucide-react';

export function FlowchartGuidePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="How to Create a Flowchart: Symbols &amp; Best Practices | DocFlow"
        description="Learn how to create clear process flowcharts, understand standard ANSI flowchart symbols, construct decision logic trees, and use auto-layout tools."
        canonicalPath="/guides/how-to-create-a-flowchart"
        h1="How to Create a Flowchart: Symbols, Logic &amp; Architecture"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Guides', item: '/guides' },
          { name: 'How to Create a Flowchart', item: '/guides/how-to-create-a-flowchart' },
        ]}
      />

      <PublicHeader />

      <article className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
            <BookOpen className="h-4 w-4" />
            <span>Diagramming &amp; System Architecture Guide</span>
            <span>•</span>
            <span className="text-muted-foreground">6 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            How to Create a Flowchart: Symbols, Logic &amp; Architecture
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            Flowcharts provide universal visual clarity for business processes, software algorithms, and system architectures. Here is how to construct clear, error-free diagrams.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Button onClick={() => navigate('/flowchart')} className="gap-2 font-bold text-xs h-10 shadow-md">
              <Sparkles className="h-4 w-4" /> Open Flowchart Studio Free
            </Button>
            <Button variant="outline" onClick={() => navigate('/flowchart-maker')} className="text-xs h-10">
              Flowchart Features
            </Button>
          </div>
        </div>

        {/* Section 1: Standard Symbols */}
        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">1. Standard Flowchart Symbols (ANSI / ISO Standard)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border bg-card space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-primary">
                <Circle className="h-4 w-4" /> <span>Terminator (Oval / Rounded Pill)</span>
              </div>
              <p className="text-muted-foreground">Represents the Start and End points of a program or process sequence.</p>
            </div>

            <div className="p-4 rounded-xl border bg-card space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-blue-500">
                <Square className="h-4 w-4" /> <span>Process Step (Rectangle)</span>
              </div>
              <p className="text-muted-foreground">Indicates an action, operation, computational task, or function execution.</p>
            </div>

            <div className="p-4 rounded-xl border bg-card space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-500">
                <Diamond className="h-4 w-4" /> <span>Decision Point (Diamond)</span>
              </div>
              <p className="text-muted-foreground">Represents a conditional branching decision (e.g. Yes/No, True/False).</p>
            </div>

            <div className="p-4 rounded-xl border bg-card space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-500">
                <Database className="h-4 w-4" /> <span>Database Storage (Cylinder)</span>
              </div>
              <p className="text-muted-foreground">Indicates persistent relational or document database read/write operations.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Best Practices */}
        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">2. Best Practices for Clear Diagrams</h2>
          <ul className="list-disc pl-5 space-y-2 text-xs text-muted-foreground">
            <li><strong>Maintain consistent flow direction:</strong> Top-to-bottom or left-to-right. Avoid zigzagging randomly.</li>
            <li><strong>Label all decision branches clearly:</strong> Every arrow exiting a diamond must have a clear label (e.g. "Yes", "No", "Declined").</li>
            <li><strong>Use smart 4-directional connectors:</strong> Prevent messy line crosses by routing loops around parent nodes.</li>
            <li><strong>Keep node labels concise:</strong> Use active verbs like "Validate Token", "Update DB", or "Notify User".</li>
          </ul>
        </section>

        {/* Next Steps */}
        <section className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-4">
          <h2 className="text-base font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Start Building Your Diagram
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            DocFlow Flowchart Studio includes smart 4-directional routing, text-to-diagram auto-generation, and vector SVG exports.
          </p>

          <Button onClick={() => navigate('/flowchart')} className="gap-2 text-xs font-bold h-9">
            <GitFork className="h-3.5 w-3.5" /> Launch Flowchart Studio
          </Button>
        </section>
      </article>

      <PublicFooter />
    </div>
  );
}
