import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronDown, Menu, X, ArrowRight, FileText,
  Presentation, GitFork, FileCheck, Layers, BookOpen, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useResponsiveEditor } from '@/hooks/useResponsiveEditor';
import { cn } from '@/utils/cn';

export function PublicHeader() {
  const navigate = useNavigate();
  const responsive = useResponsiveEditor();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur sticky top-0 z-40 px-4 sm:px-8 h-16 flex items-center justify-between transition-colors">
      {/* Brand Identity */}
      <Link
        to="/"
        className="flex items-center gap-2.5 font-bold text-foreground hover:opacity-90 transition-opacity"
        title="DocFlow Home"
      >
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight leading-none text-foreground">
            DocFlow
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-tight">
            Document &amp; Design Studio
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
        {/* Products Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer py-2">
              <span>Products</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-1.5 text-xs">
            <DropdownMenuItem asChild>
              <Link to="/document-editor" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <span className="font-semibold block">Document Editor</span>
                  <span className="text-[10px] text-muted-foreground">Word-style paginated editing</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/presentation-maker" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <Presentation className="h-4 w-4 text-amber-500" />
                <div>
                  <span className="font-semibold block">Presentation Maker</span>
                  <span className="text-[10px] text-muted-foreground">16:9 slides &amp; themes</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/flowchart-maker" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <GitFork className="h-4 w-4 text-indigo-500" />
                <div>
                  <span className="font-semibold block">Flowchart Maker</span>
                  <span className="text-[10px] text-muted-foreground">Dynamic process diagrams</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/resume-builder" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <FileCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="font-semibold block">Resume Builder</span>
                  <span className="text-[10px] text-muted-foreground">ATS-ready professional CVs</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pdf-editor" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <FileText className="h-4 w-4 text-rose-500" />
                <div>
                  <span className="font-semibold block">PDF Tools</span>
                  <span className="text-[10px] text-muted-foreground">Annotate, edit &amp; merge PDFs</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/file-converter" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <Layers className="h-4 w-4 text-purple-500" />
                <div>
                  <span className="font-semibold block">File Converter</span>
                  <span className="text-[10px] text-muted-foreground">DOCX, PDF &amp; image conversion</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/templates" className="hover:text-foreground transition-colors">
          Templates
        </Link>
        <Link to="/guides" className="hover:text-foreground transition-colors">
          Guides &amp; Tutorials
        </Link>
        <Link to="/pdf-merger" className="hover:text-foreground transition-colors">
          Merge PDF
        </Link>
      </nav>

      {/* Desktop Action CTAs */}
      <div className="hidden md:flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold"
        >
          Open Workspace
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
        >
          <Sparkles className="h-3.5 w-3.5" /> Start Creating Free
        </Button>
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(prev => !prev)}
        className="h-10 w-10 rounded-xl flex md:hidden items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all"
        title="Toggle Menu"
        aria-label="Toggle Menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-background/98 backdrop-blur border-b border-border p-5 shadow-2xl flex flex-col gap-4 md:hidden z-50 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/document-editor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1 font-semibold"
            >
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Document Editor</span>
            </Link>
            <Link
              to="/presentation-maker"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1 font-semibold"
            >
              <Presentation className="h-4 w-4 text-amber-500" />
              <span>Presentation Maker</span>
            </Link>
            <Link
              to="/flowchart-maker"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1 font-semibold"
            >
              <GitFork className="h-4 w-4 text-indigo-500" />
              <span>Flowchart Maker</span>
            </Link>
            <Link
              to="/resume-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1 font-semibold"
            >
              <FileCheck className="h-4 w-4 text-emerald-500" />
              <span>Resume Builder</span>
            </Link>
            <Link
              to="/pdf-editor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1 font-semibold"
            >
              <FileText className="h-4 w-4 text-rose-500" />
              <span>PDF Editor</span>
            </Link>
            <Link
              to="/pdf-merger"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card flex flex-col gap-1 font-semibold"
            >
              <Layers className="h-4 w-4 text-purple-500" />
              <span>Merge PDF</span>
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border text-xs font-semibold">
            <Link
              to="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted"
            >
              Templates Library
            </Link>
            <Link
              to="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted"
            >
              Guides &amp; Tutorials
            </Link>
            <Link
              to="/guides/how-to-make-a-project-report"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-muted text-primary"
            >
              Project Report Guide
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full text-xs font-bold h-10 gap-1.5"
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
            >
              <Sparkles className="h-4 w-4" /> Start Creating Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
