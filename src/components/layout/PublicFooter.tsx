import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown, ChevronUp, ShieldCheck, Heart } from 'lucide-react';
import { cn } from '@/utils/cn';

export function PublicFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  return (
    <footer className="border-t border-border bg-card/60 text-muted-foreground text-xs select-none">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-foreground inline-flex">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight">DocFlow</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Create, edit, convert, and share documents, presentations, flowcharts, resumes, and PDFs in one fast workspace. 100% private, browser-native productivity.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero-tracking • Private Local Autosave</span>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('products')}
              className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider md:cursor-default"
            >
              <span>Product</span>
              <span className="md:hidden">
                {openSection === 'products' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </button>
            <ul className={cn('space-y-2', openSection !== 'products' && 'hidden md:block')}>
              <li><Link to="/document-editor" className="hover:text-primary transition-colors">Document Editor</Link></li>
              <li><Link to="/presentation-maker" className="hover:text-primary transition-colors">Presentation Maker</Link></li>
              <li><Link to="/flowchart-maker" className="hover:text-primary transition-colors">Flowchart Maker</Link></li>
              <li><Link to="/resume-builder" className="hover:text-primary transition-colors">Resume Builder</Link></li>
              <li><Link to="/pdf-editor" className="hover:text-primary transition-colors">PDF Editor</Link></li>
              <li><Link to="/pdf-merger" className="hover:text-primary transition-colors">PDF Merger</Link></li>
              <li><Link to="/file-converter" className="hover:text-primary transition-colors">File Converter</Link></li>
            </ul>
          </div>

          {/* Column 2: Guides & Resources */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('guides')}
              className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider md:cursor-default"
            >
              <span>Guides &amp; Hubs</span>
              <span className="md:hidden">
                {openSection === 'guides' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </button>
            <ul className={cn('space-y-2', openSection !== 'guides' && 'hidden md:block')}>
              <li><Link to="/guides" className="hover:text-primary transition-colors font-semibold text-foreground">All Guides</Link></li>
              <li><Link to="/guides/how-to-make-a-project-report" className="hover:text-primary transition-colors">Project Report Guide</Link></li>
              <li><Link to="/guides/how-to-create-a-flowchart" className="hover:text-primary transition-colors">Flowchart Guide</Link></li>
              <li><Link to="/templates" className="hover:text-primary transition-colors">Templates Library</Link></li>
              <li><Link to="/tools/project-report-maker" className="hover:text-primary transition-colors">Report Presets</Link></li>
            </ul>
          </div>

          {/* Column 3: Workspace */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => toggleSection('workspace')}
              className="w-full flex items-center justify-between font-bold text-foreground text-xs uppercase tracking-wider md:cursor-default"
            >
              <span>Workspace</span>
              <span className="md:hidden">
                {openSection === 'workspace' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </span>
            </button>
            <ul className={cn('space-y-2', openSection !== 'workspace' && 'hidden md:block')}>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors font-semibold text-foreground">Dashboard</Link></li>
              <li><Link to="/flowchart" className="hover:text-primary transition-colors">Flowchart Studio</Link></li>
              <li><Link to="/resume" className="hover:text-primary transition-colors">Resume Studio</Link></li>
              <li><Link to="/documents" className="hover:text-primary transition-colors">My Documents</Link></li>
              <li><Link to="/import" className="hover:text-primary transition-colors">Import Files</Link></li>
              <li><Link to="/settings" className="hover:text-primary transition-colors">Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
          <p>© {new Date().getFullYear()} DocFlow. All rights reserved. One workspace for documents, slides, diagrams, and files.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
