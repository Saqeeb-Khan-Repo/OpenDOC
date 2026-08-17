import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Layers, Sparkles, CheckCircle2, ArrowRight, ShieldCheck,
  Download, HelpCircle
} from 'lucide-react';

const PDF_MERGER_FAQS = [
  {
    question: 'How do I merge multiple PDF files together?',
    answer: 'Upload two or more PDF files in DocProEditor, arrange the sequence of documents by dragging, and click "Merge & Download" to combine them into one seamless PDF.',
  },
  {
    question: 'Is there a limit on file size or number of PDFs?',
    answer: 'Because merging happens directly in your browser without server bandwidth constraints, you can merge multiple large PDF files without paywalls or size penalties.',
  },
  {
    question: 'Are my merged documents safe?',
    answer: '100% safe. Your files never leave your device. The merging computation is executed client-side in browser memory.',
  },
];

export function PdfMergerSeoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Merge PDF Files Online | Free PDF Merger | DocProEditor"
        description="Combine multiple PDF files into one clean document online. Reorder pages, remove duplicates, and download merged PDFs in seconds."
        canonicalPath="/pdf-merger"
        h1="Merge PDF Files Online"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'PDF Merger', item: '/pdf-merger' },
        ]}
        faqs={PDF_MERGER_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-purple-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 border border-purple-500/20">
            <Layers className="h-3.5 w-3.5" />
            <span>Fast PDF Combiner</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Merge PDF Files Online
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Combine multiple PDF files into one unified document in seconds. Drag to reorder, delete unnecessary pages, and download without watermarks.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/import')} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Merge PDFs Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/pdf-editor')} className="h-12 px-6 font-semibold">
              Edit PDF Content
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Simple, Fast &amp; Secure PDF Merging</h2>
          <p className="text-xs text-muted-foreground">Everything processed locally in your web browser.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Layers className="h-6 w-6 text-purple-500" />
            <h3 className="text-base font-bold">Drag &amp; Drop Reordering</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Arrange documents in the exact order you need before generating the final combined PDF file.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">100% Private &amp; Secure</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your PDFs are never uploaded to remote servers. All merging operations execute locally on your computer.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Download className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">Zero Watermarks</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download clean, high-fidelity PDFs ready for university submission, clients, or office archiving.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {PDF_MERGER_FAQS.map((faq, i) => (
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
