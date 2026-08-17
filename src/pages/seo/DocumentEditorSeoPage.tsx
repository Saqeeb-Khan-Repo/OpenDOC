import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileText, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  Download, Calculator, Layers, Code2, Printer, ChevronRight,
  BookOpen, HelpCircle
} from 'lucide-react';

const DOCUMENT_FAQS = [
  {
    question: 'What is an online document editor?',
    answer: 'An online document editor is a web-based word processor that lets you create, format, style, and export text documents directly in your browser without downloading heavy software.',
  },
  {
    question: 'Can I insert KaTeX math equations and code snippets?',
    answer: 'Yes! DocFlow includes native KaTeX LaTeX mathematical equation rendering and syntax-highlighted code blocks for technical reports, research papers, and computer science assignments.',
  },
  {
    question: 'Does DocFlow support true A4 page breaks?',
    answer: 'Yes, DocFlow has a paginated canvas engine that calculates A4 page constraints in real time, with automatic page numbering, headers, footers, and Table of Contents generation.',
  },
  {
    question: 'What export formats are available?',
    answer: 'You can export your document as a high-resolution printable PDF, an editable Microsoft Word (.docx) file, or standard HTML and Markdown.',
  },
];

export function DocumentEditorSeoPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();

  const handleStartEditing = () => {
    const doc = createDocument({ title: 'Untitled Document', mode: 'document' });
    toast.success('Created new document');
    navigate(`/editor/${doc.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Online Document Editor | Create & Edit Documents | DocFlow"
        description="Create, edit, format, and export professional documents directly in your browser with DocFlow. Paginated A4 canvas, KaTeX equations, tables, and instant PDF/DOCX export."
        canonicalPath="/document-editor"
        h1="Online Document Editor"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Document Editor', item: '/document-editor' },
        ]}
        faqs={DOCUMENT_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-blue-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <FileText className="h-3.5 w-3.5" />
            <span>Browser-Based Word Processor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Online Document Editor
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create, format, and export professional documents directly in your browser. Engineered with A4 pagination, mathematical LaTeX equations, dynamic citations, and clean PDF/DOCX downloads.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleStartEditing} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Start Editing Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/templates')} className="h-12 px-6 font-semibold">
              Browse Report Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Designed for Academic Reports &amp; Professional Papers</h2>
          <p className="text-xs text-muted-foreground">Everything you need for precise, publication-ready typography.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Calculator className="h-6 w-6 text-primary" />
            <h3 className="text-base font-bold">KaTeX Mathematical Equations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Write inline and block LaTeX formulas with instant rendering. Ideal for mathematics, physics, engineering, and data science.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Layers className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">Automatic Pagination &amp; TOC</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintains A4 print bounds with dynamic Table of Contents, List of Figures, and heading number tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Download className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">Instant PDF &amp; Word Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Export clean, printable PDF documents or standard Microsoft Word (.docx) files without third-party converters.
            </p>
          </div>
        </div>
      </section>

      {/* Related Resources & Internal Links */}
      <section className="py-12 px-6 bg-muted/20 border-t border-border">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-lg font-bold">Related Tools &amp; Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Link to="/guides/how-to-make-a-project-report" className="p-4 rounded-xl border bg-card hover:border-primary/50 flex items-center justify-between font-semibold">
              <span>Read: Complete Guide on Project Reports</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
            <Link to="/presentation-maker" className="p-4 rounded-xl border bg-card hover:border-primary/50 flex items-center justify-between font-semibold">
              <span>Create Matching Presentation Slides</span>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {DOCUMENT_FAQS.map((faq, i) => (
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
