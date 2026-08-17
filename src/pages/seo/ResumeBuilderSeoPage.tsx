import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  FileCheck, Sparkles, CheckCircle2, ArrowRight, Download,
  Layers, ShieldCheck, HelpCircle
} from 'lucide-react';

const RESUME_FAQS = [
  {
    question: 'How do I build an ATS-compliant resume with DocProEditor?',
    answer: 'DocProEditor uses clean, semantic heading structures and standard bullet points that parse accurately through Applicant Tracking Systems (ATS) used by recruiters and major companies.',
  },
  {
    question: 'Can I choose between different resume templates?',
    answer: 'Yes! You can choose between Modern Minimalist, Tech Software Engineer, Executive Classic, and Creative layout styles with customized accent colors.',
  },
  {
    question: 'Is the resume downloaded as a vector PDF?',
    answer: 'Yes, resumes download as high-resolution, search-selectable vector PDFs without watermarks or formatting corruption.',
  },
];

export function ResumeBuilderSeoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Resume Builder | Create a Professional Resume Online | DocProEditor"
        description="Build ATS-compliant resumes with modular sections, skills matrices, live preview, and instant PDF export."
        canonicalPath="/resume-builder"
        h1="Professional Resume Builder"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Resume Builder', item: '/resume-builder' },
        ]}
        faqs={RESUME_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-emerald-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <FileCheck className="h-3.5 w-3.5" />
            <span>ATS Resume Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Professional Resume Builder
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Craft recruiter-ready, ATS-friendly resumes and CVs with structured sections, live interactive preview, and instant watermark-free PDF downloads.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/resume')} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Build Your Resume Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/templates')} className="h-12 px-6 font-semibold">
              Explore Resume Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Built for Maximum Recruiter Impact</h2>
          <p className="text-xs text-muted-foreground">Every detail designed for clarity and scannability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">ATS-Optimized Formatting</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standardized sections for Work Experience, Education, Skills, and Featured Projects that pass ATS parsers cleanly.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Layers className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">Live Split-Pane Preview</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Edit structured forms on the left while watching your printable resume update in real time on the right.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Download className="h-6 w-6 text-primary" />
            <h3 className="text-base font-bold">Vector PDF Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Download clean vector PDFs with crisp typography and zero paywalls, limits, or subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {RESUME_FAQS.map((faq, i) => (
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
