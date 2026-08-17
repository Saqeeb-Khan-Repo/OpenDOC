import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileText, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  Download, Layers, HelpCircle
} from 'lucide-react';

const PDF_EDITOR_FAQS = [
  {
    question: 'How do I edit PDF files online with DocFlow?',
    answer: 'Import any PDF into DocFlow to annotate text, draw digital signatures, reorder pages, add page breaks, and export clean print-ready documents.',
  },
  {
    question: 'Are my uploaded PDF files kept private?',
    answer: 'Yes. DocFlow processes PDFs client-side in your web browser using WebAssembly. Your files are not uploaded or stored on external servers.',
  },
  {
    question: 'Can I add digital signatures to PDFs?',
    answer: 'Yes! DocFlow includes a built-in Signature Modal where you can draw, type cursive signatures, or upload an existing signature asset.',
  },
];

export function PdfEditorSeoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Online PDF Editor | Edit PDF Files Free | DocFlow"
        description="Edit, annotate, sign, and reorganize PDF documents directly in your browser without uploading files to third-party servers."
        canonicalPath="/pdf-editor"
        h1="Online PDF Editor"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'PDF Editor', item: '/pdf-editor' },
        ]}
        faqs={PDF_EDITOR_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-rose-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <FileText className="h-3.5 w-3.5" />
            <span>In-Browser PDF Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Online PDF Editor
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Edit, annotate, sign, and organize PDF documents directly in your browser with 100% privacy and zero server uploads.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/import')} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Open PDF Editor Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pdf-merger')} className="h-12 px-6 font-semibold">
              Merge PDF Files
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Everything for Fast PDF Handling</h2>
          <p className="text-xs text-muted-foreground">Private, lightweight, and completely free.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <ShieldCheck className="h-6 w-6 text-rose-500" />
            <h3 className="text-base font-bold">100% Private Client-Side</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your PDFs stay in your browser. No file uploads to cloud servers, no account required.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">Annotations &amp; Signatures</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add text notes, highlight sections, and sign official documents with digital signature pads.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Download className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">Export &amp; Conversion</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download updated PDFs or convert pages to DOCX and image formats without watermarks.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {PDF_EDITOR_FAQS.map((faq, i) => (
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
