import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  GitFork, Sparkles, CheckCircle2, ArrowRight, Download,
  Layers, Move, ShieldCheck, HelpCircle
} from 'lucide-react';

const FLOWCHART_FAQS = [
  {
    question: 'How do I create a flowchart online?',
    answer: 'Open the DocFlow Flowchart Studio to start with a blank canvas or choose from templates like System Architecture or Process Workflow. Add process, decision, and database nodes, and connect them with intuitive drag or tap-to-connect tools.',
  },
  {
    question: 'How does the 4-directional flexible connector routing work?',
    answer: 'DocFlow dynamically evaluates the relative positions of connected nodes in real-time and routes connectors from the optimal side (top, bottom, left, or right) with smart loopback avoiding node overlaps.',
  },
  {
    question: 'Can I generate a flowchart automatically from plain text?',
    answer: 'Yes! Our "Generate from Data" tool lets you paste sequential steps and conditionals (e.g. "If approved -> Step 2"), and automatically lays out nodes and connectors.',
  },
  {
    question: 'What export formats are supported for flowcharts?',
    answer: 'You can download high-resolution vector SVG (.svg) files for infinite scaling, high-DPI PNG images for presentations, or insert your flowchart directly into a DocFlow document with one click.',
  },
];

export function FlowchartMakerSeoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Flowchart Maker Online | Create Flowcharts Free | DocFlow"
        description="Create professional flowcharts online. Add nodes, connect processes with smart 4-directional routing, use automatic layout, analyze workflows, and export diagrams."
        canonicalPath="/flowchart-maker"
        h1="Flowchart Maker Online"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Flowchart Maker', item: '/flowchart-maker' },
        ]}
        faqs={FLOWCHART_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-indigo-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
            <GitFork className="h-3.5 w-3.5" />
            <span>Interactive Diagram Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Flowchart Maker Online
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Design professional process diagrams, system architectures, and decision trees online. Features smart 4-directional flexible connectors, instant auto-layout, text-to-flowchart generation, and vector SVG exports.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/flowchart')} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Create a Flowchart Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/guides/how-to-create-a-flowchart')} className="h-12 px-6 font-semibold">
              Read Flowchart Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Engineered for Clear Process Communication</h2>
          <p className="text-xs text-muted-foreground">From simple logic flows to complex distributed system diagrams.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Move className="h-6 w-6 text-indigo-500" />
            <h3 className="text-base font-bold">Smart Flexible Connectors</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connections adapt dynamically across all 4 directions with intelligent loopbacks, edge labels, and zero manual elbow alignment.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Layers className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">One-Click Auto-Layout</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Arrange nodes automatically in clean vertical hierarchies or horizontal workflows with calculated layer spacing.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Download className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">Vector SVG &amp; PNG Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download razor-sharp vector SVGs for documentation or high-resolution PNGs ready for slides and reports.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {FLOWCHART_FAQS.map((faq, i) => (
            <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-2">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-xs text-muted-foreground pl-6 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
