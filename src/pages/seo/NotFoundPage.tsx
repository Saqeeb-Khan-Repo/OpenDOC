import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/seo/SEOHead';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Sparkles, ArrowLeft, FileText, Presentation, GitFork, FileCheck } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <SEOHead
        title="Page Not Found | DocProEditor"
        description="The requested page could not be found on DocProEditor. Explore our document editor, presentation maker, flowchart studio, and resume builder."
        canonicalPath="/404"
        noindex={true}
      />

      <PublicHeader />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Sparkles className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">
              We couldn't find that page
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link to="/document-editor" className="p-3 rounded-xl border bg-card hover:border-primary/50 flex flex-col items-center gap-1 font-semibold">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Document Editor</span>
            </Link>
            <Link to="/presentation-maker" className="p-3 rounded-xl border bg-card hover:border-primary/50 flex flex-col items-center gap-1 font-semibold">
              <Presentation className="h-4 w-4 text-amber-500" />
              <span>Presentation Maker</span>
            </Link>
            <Link to="/flowchart-maker" className="p-3 rounded-xl border bg-card hover:border-primary/50 flex flex-col items-center gap-1 font-semibold">
              <GitFork className="h-4 w-4 text-indigo-500" />
              <span>Flowchart Maker</span>
            </Link>
            <Link to="/resume-builder" className="p-3 rounded-xl border bg-card hover:border-primary/50 flex flex-col items-center gap-1 font-semibold">
              <FileCheck className="h-4 w-4 text-emerald-500" />
              <span>Resume Builder</span>
            </Link>
          </div>

          <div className="pt-2">
            <Button onClick={() => navigate('/')} className="gap-2 text-xs font-bold w-full h-10">
              <ArrowLeft className="h-4 w-4" /> Return to DocProEditor Home
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
