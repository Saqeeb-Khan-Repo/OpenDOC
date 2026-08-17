import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Layers, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  Download, FileText, HelpCircle
} from 'lucide-react';

const CONVERTER_FAQS = [
  {
    question: 'What formats can I convert with DocProEditor?',
    answer: 'DocProEditor supports bidirectional conversion between DOCX, PDF, HTML, Markdown (.md), Plain Text (.txt), JSON, CSV, and vector SVG/PNG diagrams.',
  },
  {
    question: 'How fast is the conversion process?',
    answer: 'Conversions execute in fractions of a second because our engine parses and compiles documents directly in client-side WebAssembly without queued server queues.',
  },
  {
    question: 'Is there a limit on conversions per day?',
    answer: 'No! There are zero conversion quotas, watermarks, or subscription popups.',
  },
];

export function FileConverterSeoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Online File Converter | Convert Documents & Files | DocProEditor"
        description="Convert supported documents, presentations, spreadsheets, diagrams, and PDFs online with zero software installation."
        canonicalPath="/file-converter"
        h1="Online File Converter"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'File Converter', item: '/file-converter' },
        ]}
        faqs={CONVERTER_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-cyan-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <Layers className="h-3.5 w-3.5" />
            <span>Universal File Conversion</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Online File Converter
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Convert documents, presentations, flowcharts, and spreadsheets between DOCX, PDF, SVG, PNG, Markdown, and JSON in seconds with zero software installation.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/import')} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Convert Files Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/document-editor')} className="h-12 px-6 font-semibold">
              Open Document Editor
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Supported File Conversions</h2>
          <p className="text-xs text-muted-foreground">High-fidelity conversions with preserved layouts and typography.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">DOCX &amp; PDF Conversion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Convert editable Word DOCX files to printable PDFs or extract structured text and tables from PDFs into editable documents.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Layers className="h-6 w-6 text-purple-500" />
            <h3 className="text-base font-bold">Markdown &amp; HTML Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transform technical project documentation into standard GitHub Flavored Markdown (.md) or clean semantic HTML.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Download className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">Vector SVG &amp; PNG Diagrams</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export interactive flowchart models into scalable vector graphics (.svg) or high-DPI raster images (.png) for slides.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {CONVERTER_FAQS.map((faq, i) => (
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
