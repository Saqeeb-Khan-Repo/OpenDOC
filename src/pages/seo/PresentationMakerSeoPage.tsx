import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Presentation, Sparkles, CheckCircle2, ArrowRight, Play,
  Palette, Layers, FileText, ChevronRight, HelpCircle
} from 'lucide-react';

const PRESENTATION_FAQS = [
  {
    question: 'How do I create a presentation online with DocFlow?',
    answer: 'Simply click "Create a Presentation" to start with a clean 16:9 canvas or choose from our curated startup pitch, academic, or corporate themes. Add text, shapes, images, charts, and presenter notes directly in your browser.',
  },
  {
    question: 'Can I present directly from my browser?',
    answer: 'Yes! DocFlow includes a full-screen Presenter Mode with a live slide preview, presentation timer, and private speaker talking points.',
  },
  {
    question: 'How does the "Apply to All" theme feature work?',
    answer: 'When you select a theme or change typography/colors, you can apply the styling to the current slide or instantly propagate it across the entire slide deck in one click.',
  },
  {
    question: 'Does the presentation canvas scale properly on mobile devices?',
    answer: 'Yes. DocFlow uses canonical 960x540 proportional transform scaling so your slides and typography look balanced and crisp on small screens without giant overflowing fonts.',
  },
];

export function PresentationMakerSeoPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();

  const handleStartPresentation = () => {
    const doc = createDocument({ title: 'Untitled Presentation', mode: 'presentation' });
    toast.success('Created new presentation');
    navigate(`/editor/${doc.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Online Presentation Maker | Create Slides Free | DocFlow"
        description="Create professional presentations online with editable text, images, shapes, layouts, and presentation tools."
        canonicalPath="/presentation-maker"
        h1="Online Presentation Maker"
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Presentation Maker', item: '/presentation-maker' },
        ]}
        faqs={PRESENTATION_FAQS}
        softwareAppSchema={true}
      />

      <PublicHeader />

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-amber-500/5 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Presentation className="h-3.5 w-3.5" />
            <span>Modern Slide Deck Studio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Online Presentation Maker
          </h1>

          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create professional slide presentations directly in your browser. Widescreen 16:9 layouts, curated themes, interactive speaker notes, and full-screen presenter mode.
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={handleStartPresentation} className="h-12 px-8 font-bold gap-2 shadow-lg">
              <Sparkles className="h-4 w-4" /> Create a Presentation Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/templates')} className="h-12 px-6 font-semibold">
              Browse Slide Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Powerful Slide Creation Tools</h2>
          <p className="text-xs text-muted-foreground">Built for pitch decks, academic defenses, and business reviews.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Palette className="h-6 w-6 text-amber-500" />
            <h3 className="text-base font-bold">Apply-to-All Themes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instantly apply cohesive color palettes, typography, and background gradients across all slides with one click.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Play className="h-6 w-6 text-emerald-500" />
            <h3 className="text-base font-bold">Fullscreen Presenter Mode</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Present live with dual views: clean audience slides on screen and private speaker notes with presentation timers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
            <Layers className="h-6 w-6 text-blue-500" />
            <h3 className="text-base font-bold">Rich Element Palette</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Add responsive text boxes, high-resolution photos, geometric shapes, data tables, and diagrams easily.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-6 max-w-4xl mx-auto space-y-8">
        <h2 className="text-2xl font-bold tracking-tight text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {PRESENTATION_FAQS.map((faq, i) => (
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
