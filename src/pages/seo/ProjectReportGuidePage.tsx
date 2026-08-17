import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { TemplateEngine } from '@/engines/TemplateEngine';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileText, Sparkles, CheckCircle2, ArrowRight, BookOpen,
  Layers, Download, Calculator, GitFork, Presentation, FileCheck
} from 'lucide-react';

export function ProjectReportGuidePage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();

  const handleOpenReportTemplate = () => {
    const tmpl = TemplateEngine.getTemplateById('academic-project-report');
    if (tmpl) {
      const doc = createDocument({
        title: 'Academic Project Report',
        mode: 'document',
        initialData: tmpl.initialDocument as any,
      });
      toast.success('Loaded Academic Project Report Template');
      navigate(`/editor/${doc.id}`);
    } else {
      const doc = createDocument({ title: 'Academic Project Report', mode: 'document' });
      navigate(`/editor/${doc.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="How to Make a Project Report: Complete Guide | DocFlow"
        description="Comprehensive guide on structuring, writing, formatting, and exporting university and engineering project reports with standard cover pages, citations, and math formulas."
        canonicalPath="/guides/how-to-make-a-project-report"
        h1="How to Make a Project Report: The Complete Step-by-Step Guide"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Guides', item: '/guides' },
          { name: 'How to Make a Project Report', item: '/guides/how-to-make-a-project-report' },
        ]}
      />

      <PublicHeader />

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-4 border-b border-border pb-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <BookOpen className="h-4 w-4" />
            <span>Academic &amp; Engineering Documentation Guide</span>
            <span>•</span>
            <span className="text-muted-foreground">8 min read</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            How to Make a Project Report: The Complete Step-by-Step Guide
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            Whether preparing a final-year engineering capstone, master's thesis, or industrial internship report, following standardized academic formatting ensures clarity, credibility, and maximum marks.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <Button onClick={handleOpenReportTemplate} className="gap-2 font-bold text-xs h-10 shadow-md">
              <Sparkles className="h-4 w-4" /> Open Report Template in DocFlow
            </Button>
            <Button variant="outline" onClick={() => navigate('/document-editor')} className="text-xs h-10">
              Open Document Editor
            </Button>
          </div>
        </div>

        {/* Section 1: Standard Structure */}
        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">1. Standard Project Report Structure</h2>
          <p className="text-muted-foreground">
            University guidelines (such as IEEE, ACM, and VTU) require a systematic order of preliminary pages followed by main chapters:
          </p>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs font-mono">
            <p className="font-bold text-primary">I. Preliminary Pages (Roman Numerals: i, ii, iii...)</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>1. University Title &amp; Cover Page</li>
              <li>2. Certificate of Authenticity (signed by Guide &amp; HOD)</li>
              <li>3. Student Declaration</li>
              <li>4. Acknowledgements</li>
              <li>5. Abstract (Executive Summary)</li>
              <li>6. Table of Contents with dynamic page numbers</li>
              <li>7. List of Figures &amp; List of Tables</li>
            </ul>

            <p className="font-bold text-primary pt-2">II. Main Report Chapters (Arabic Numerals: 1, 2, 3...)</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Chapter 1: Introduction &amp; Problem Statement</li>
              <li>Chapter 2: Literature Survey &amp; Prior Work</li>
              <li>Chapter 3: System Architecture &amp; Methodology</li>
              <li>Chapter 4: Implementation Details &amp; Code Modules</li>
              <li>Chapter 5: Experimental Results &amp; Performance Metrics</li>
              <li>Chapter 6: Conclusion &amp; Future Scope</li>
              <li>References (IEEE / APA Citation Format)</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Mathematical Equations & Flowcharts */}
        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">2. Embedding Mathematical Formulas &amp; Architecture Flowcharts</h2>
          <p className="text-muted-foreground">
            Technical clarity separates average reports from distinction papers. Instead of taking low-resolution screenshots of formulas and diagrams:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border bg-card space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Calculator className="h-4 w-4 text-primary" />
                <span>KaTeX Math Formulas</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Render LaTeX formulas directly inside your report with native font scaling:
              </p>
              <code className="block p-2 rounded bg-muted font-mono text-xs">
                {'\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^N (x_i - \\mu)^2}'}
              </code>
            </div>

            <div className="p-4 rounded-xl border bg-card space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <GitFork className="h-4 w-4 text-indigo-500" />
                <span>System Architecture Diagrams</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Build your data pipeline diagrams using the <Link to="/flowchart-maker" className="text-primary font-semibold hover:underline">Flowchart Maker</Link> and export as vector graphics.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Formatting & Page Layout Rules */}
        <section className="space-y-4 text-sm leading-relaxed">
          <h2 className="text-xl font-bold text-foreground">3. Standard Academic Formatting Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-border text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-2.5 font-bold">Element</th>
                  <th className="p-2.5 font-bold">Standard Specification</th>
                  <th className="p-2.5 font-bold">DocFlow Preset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-2.5 font-semibold">Page Size</td>
                  <td className="p-2.5 text-muted-foreground">Standard A4 (210mm x 297mm)</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">✓ Built-in</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Margins</td>
                  <td className="p-2.5 text-muted-foreground">Left: 1.25 in (binding), Right/Top/Bottom: 1.0 in</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">✓ Built-in</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Body Font</td>
                  <td className="p-2.5 text-muted-foreground">Times New Roman or Inter, 12pt, 1.5 line spacing</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">✓ Built-in</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Alignment</td>
                  <td className="p-2.5 text-muted-foreground">Justified margins with automatic hyphenation</td>
                  <td className="p-2.5 text-emerald-600 font-semibold">✓ Built-in</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Next Steps & Related Workflows */}
        <section className="p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <h2 className="text-base font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Ready to Build Your Project Report?
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            DocFlow comes pre-loaded with complete Academic Project Report templates, Cover Page generators, and live PDF exporters.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button onClick={handleOpenReportTemplate} className="gap-2 text-xs font-bold h-9">
              <FileText className="h-3.5 w-3.5" /> Start Report in DocFlow
            </Button>
            <Link to="/presentation-maker" className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1">
              Create Defense Slides <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </article>

      <PublicFooter />
    </div>
  );
}
