import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { TemplateEngine } from '@/engines/TemplateEngine';
import { EditorMode } from '@/engines/types';
import { Button } from '@/components/ui/button';
import {
  FileText, Presentation, Palette, Sparkles, ArrowRight,
  ShieldCheck, Download, Code2, Calculator, GitFork, Check,
  Zap, Database, Printer, Layers, Globe, Star
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState<EditorMode>('document');

  const handleStartBlank = (mode: EditorMode = 'document') => {
    const doc = createDocument({
      title: mode === 'presentation' ? 'Untitled Presentation' : mode === 'design' ? 'Untitled Visual Design' : 'Untitled Project Report',
      mode,
    });
    toast.success(`Started new ${mode.toUpperCase()} project`);
    navigate(`/editor/${doc.id}`);
  };

  const handleUseTemplate = (templateId: string) => {
    const tmpl = TemplateEngine.getTemplateById(templateId);
    if (tmpl) {
      const doc = createDocument({
        title: tmpl.initialDocument.title || tmpl.title,
        mode: tmpl.mode,
        initialData: tmpl.initialDocument as any,
      });
      toast.success(`Created from template: ${tmpl.title}`);
      navigate(`/editor/${doc.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Top Navbar */}
      <nav className="border-b border-border/80 bg-background/95 backdrop-blur sticky top-0 z-40 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md font-bold text-lg">
            O
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              OpenDoc Studio
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-1 font-mono">Productivity Suite</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
          <Link to="/templates" className="hover:text-primary transition-colors">Templates</Link>
          <Link to="/tools/project-report-maker" className="hover:text-primary transition-colors">Project Reports</Link>
          <Link to="/tools/presentation-maker" className="hover:text-primary transition-colors">Presentations</Link>
          <Link to="/tools/resume-maker" className="hover:text-primary transition-colors">Resumes</Link>
          <Link to="/tools/certificate-maker" className="hover:text-primary transition-colors">Certificates</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/documents')} className="text-xs">
            My Documents
          </Button>
          <Button size="sm" onClick={() => handleStartBlank('document')} className="text-xs gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Start Free
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background border-b border-border/40">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Unified Document, Presentation & Visual Design Suite</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Word-Style Editing <span className="text-primary">+</span> PowerPoint Slides <span className="text-primary">+</span> Canva Design
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            OpenDoc Studio is the all-in-one browser productivity suite for college project reports, research papers, slide decks, resumes, and certificates. Zero backend required, 100% private local autosave.
          </p>

          {/* Mode Switcher Pill */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="inline-flex items-center gap-1.5 bg-card border border-border p-1.5 rounded-2xl shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('document')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'document' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <FileText className="h-4 w-4" /> Paginated Document
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presentation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'presentation' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Presentation className="h-4 w-4" /> 16:9 Presentation
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'design' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Palette className="h-4 w-4" /> Visual Design Canvas
              </button>
            </div>
          </div>

          {/* Interactive Hero Preview Box */}
          <div className="pt-6">
            <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card shadow-2xl p-6 relative overflow-hidden text-left">
              {activeTab === 'document' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-primary">A4 Paginated Academic Mode</span>
                    <span className="text-xs text-muted-foreground">Times New Roman • 1.5 Spacing • Justified</span>
                  </div>
                  <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-border space-y-3 font-serif">
                    <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">1. SYSTEM ARCHITECTURE & DESIGN</h2>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      The document engine executes a modular architecture where the pagination calculator maintains A4 page constraints, dynamic headers, and automated Table of Figures generation.
                    </p>
                    <div className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded border border-slate-200 dark:border-zinc-700">
                      LaTeX Formula: {'\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Includes: Auto TOC, Citations, KaTeX Equations, Code Highlighting</span>
                    <Button size="sm" onClick={() => handleUseTemplate('academic-project-report')} className="gap-1.5 text-xs">
                      Open Report Template <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'presentation' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-primary">16:9 Slide Presentation Mode</span>
                    <span className="text-xs text-muted-foreground">Corporate Navy Theme • Speaker Notes • Fullscreen</span>
                  </div>
                  <div className="aspect-video max-h-56 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-blue-400 font-mono">SLIDE 01</span>
                      <h3 className="text-2xl font-bold mt-1">OpenDoc Studio Architecture</h3>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5">
                      <li>• Zero-backend client-side execution</li>
                      <li>• IndexedDB transactional persistence</li>
                      <li>• Real-time slide presentation engine with notes</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Includes: Slide Reordering, Themes, Notes Drawer, Presenter Mode</span>
                    <Button size="sm" onClick={() => handleUseTemplate('startup-pitch-deck')} className="gap-1.5 text-xs">
                      Open Slide Deck <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="font-mono text-xs font-semibold text-primary">Canva-Style Freeform Design Canvas</span>
                    <span className="text-xs text-muted-foreground">Movable Shapes • QR Generator • Signature Pad</span>
                  </div>
                  <div className="h-52 bg-amber-50/50 dark:bg-zinc-900 border-2 border-amber-500/40 rounded-xl p-6 text-center flex flex-col items-center justify-center relative">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">Certificate of Excellence</span>
                    <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-400 mt-2">Saqeeb Khan</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm">For outstanding engineering and architecture design of OpenDoc Studio.</p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">Includes: Layers Panel, Snap Guides, Signatures, QR Codes</span>
                    <Button size="sm" onClick={() => handleUseTemplate('certificate-of-achievement')} className="gap-1.5 text-xs">
                      Open Certificate Designer <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">Engineered for Academic & Creative Mastery</h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Everything you need to produce engineering project reports, college assignments, research papers, resumes, slide decks, and visual certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Academic Project Reports</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standard A4 paginated canvas with University Cover Page, Certificate, Declaration, dynamic Table of Contents, and IEEE citations.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">KaTeX Equations & Math</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Insert complex mathematical notation, calculus integrals, summations, fractions, and Greek symbols with instant rendering.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <GitFork className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Flowcharts & Diagrams</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Interactive node-based flowchart and system architecture generator with automated connector lines and labels.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Presentation className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">16:9 Slide Presentations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PowerPoint-style slide creation with themes, slide manager, transitions, speaker notes drawer, and live presenter mode.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-600 flex items-center justify-center">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Visual Design & Canvas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Canva-style freeform canvas with layers panel, snap-to-grid, shapes, QR code generator, and digital signature pads.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Local-First IndexedDB Autosave</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Zero backend required. Every keystroke is saved locally to your browser's IndexedDB database with instant offline restoration.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">OpenDoc Studio</span>
            <span>•</span>
            <span>Open-Source Document, Presentation & Visual Design Suite</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/templates" className="hover:text-primary">Template Gallery</Link>
            <Link to="/tools/project-report-maker" className="hover:text-primary">Project Report Maker</Link>
            <Link to="/tools/resume-maker" className="hover:text-primary">Resume Maker</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
