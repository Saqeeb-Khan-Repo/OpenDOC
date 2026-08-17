import React, { useState, useEffect, useRef } from 'react';
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
import { cn } from '@/utils/cn';

export function PublicHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on Escape key press or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="border-b border-border bg-white dark:bg-[#0D1422] shadow-xs sticky top-0 z-40 px-4 sm:px-8 h-16 flex items-center justify-between transition-colors">
      {/* Brand Identity */}
      <Link
        to="/"
        className="flex items-center gap-2.5 font-bold text-foreground hover:opacity-90 transition-opacity"
        title="DocProEditor Home"
      >
        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg tracking-tight leading-none text-foreground">
            DocProEditor
          </span>
          <span className="text-[10px] text-muted-foreground font-medium tracking-tight">
            All-in-One Document &amp; Design Workspace
          </span>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
        {/* Products Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-md px-1">
              <span>Products</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-1.5 text-xs bg-card dark:bg-[#111A2B] border border-border shadow-xl">
            <DropdownMenuItem asChild>
              <Link to="/document-editor" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <span className="font-semibold block text-foreground">Document Editor</span>
                  <span className="text-[10px] text-muted-foreground">Word-style paginated editing</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/presentation-maker" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <Presentation className="h-4 w-4 text-amber-500" />
                <div>
                  <span className="font-semibold block text-foreground">Presentation Maker</span>
                  <span className="text-[10px] text-muted-foreground">16:9 slides &amp; themes</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/flowchart-maker" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <GitFork className="h-4 w-4 text-indigo-500" />
                <div>
                  <span className="font-semibold block text-foreground">Flowchart Studio</span>
                  <span className="text-[10px] text-muted-foreground">Process diagrams &amp; workflows</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/resume-builder" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <FileCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <span className="font-semibold block text-foreground">Resume Builder</span>
                  <span className="text-[10px] text-muted-foreground">ATS-ready professional CVs</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pdf-editor" className="flex items-center gap-2.5 py-2 cursor-pointer">
                <FileText className="h-4 w-4 text-rose-500" />
                <div>
                  <span className="font-semibold block text-foreground">PDF Tools</span>
                  <span className="text-[10px] text-muted-foreground">Merge, split &amp; edit PDFs</span>
                </div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/templates" className="hover:text-foreground transition-colors py-2">
          Templates
        </Link>
        <Link to="/guides" className="hover:text-foreground transition-colors py-2">
          Resources
        </Link>
        <Link to="/import" className="hover:text-foreground transition-colors py-2">
          PDF Tools
        </Link>
      </nav>

      {/* Desktop Action CTAs - NO Sign In */}
      <div className="hidden md:flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-semibold h-9 px-3.5 border-border hover:bg-muted"
        >
          Open Workspace
        </Button>
        <Button
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20 h-9 px-4 cursor-pointer"
          aria-label="Start Creating Free"
        >
          <Sparkles className="h-3.5 w-3.5" /> Start Creating Free
        </Button>
      </div>

      {/* Mobile Menu Toggle Button (Solid, clearly separated UI control) */}
      <button
        ref={toggleBtnRef}
        type="button"
        onClick={() => setMobileMenuOpen(prev => !prev)}
        className="h-10 w-10 rounded-xl flex md:hidden items-center justify-center bg-muted/80 hover:bg-muted dark:bg-[#162238] dark:hover:bg-[#1f2e4a] border border-border/80 text-foreground active:scale-95 transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
      </button>

      {/* Mobile Navigation Drawer (Solid theme-aware background, zero transparency) */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0D1422] border-b border-x border-border p-5 shadow-2xl rounded-b-2xl flex flex-col gap-4 md:hidden z-50 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
            Products &amp; Studios
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/document-editor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card dark:bg-[#111A2B] hover:border-primary/40 flex flex-col gap-1 font-semibold transition-colors"
            >
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-foreground">Document Editor</span>
            </Link>
            <Link
              to="/presentation-maker"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card dark:bg-[#111A2B] hover:border-primary/40 flex flex-col gap-1 font-semibold transition-colors"
            >
              <Presentation className="h-4 w-4 text-amber-500" />
              <span className="text-foreground">Presentation Maker</span>
            </Link>
            <Link
              to="/flowchart-maker"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card dark:bg-[#111A2B] hover:border-primary/40 flex flex-col gap-1 font-semibold transition-colors"
            >
              <GitFork className="h-4 w-4 text-indigo-500" />
              <span className="text-foreground">Flowchart Studio</span>
            </Link>
            <Link
              to="/resume-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card dark:bg-[#111A2B] hover:border-primary/40 flex flex-col gap-1 font-semibold transition-colors"
            >
              <FileCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-foreground">Resume Builder</span>
            </Link>
            <Link
              to="/pdf-editor"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card dark:bg-[#111A2B] hover:border-primary/40 flex flex-col gap-1 font-semibold transition-colors"
            >
              <FileText className="h-4 w-4 text-rose-500" />
              <span className="text-foreground">PDF Tools</span>
            </Link>
            <Link
              to="/pdf-merger"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 rounded-xl border border-border bg-card dark:bg-[#111A2B] hover:border-primary/40 flex flex-col gap-1 font-semibold transition-colors"
            >
              <Layers className="h-4 w-4 text-purple-500" />
              <span className="text-foreground">Merge PDF</span>
            </Link>
          </div>

          <div className="flex flex-col gap-1 pt-2 border-t border-border text-xs font-semibold">
            <Link
              to="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg hover:bg-muted dark:hover:bg-[#162238] text-foreground flex items-center justify-between"
            >
              <span>Templates Library</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg hover:bg-muted dark:hover:bg-[#162238] text-foreground flex items-center justify-between"
            >
              <span>Guides &amp; Tutorials</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              to="/guides/how-to-make-a-project-report"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg hover:bg-muted dark:hover:bg-[#162238] text-primary flex items-center justify-between"
            >
              <span>Project Report Guide</span>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </Link>
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button
              className="w-full text-xs font-bold h-11 gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
              onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
              aria-label="Start Creating Free"
            >
              <Sparkles className="h-4 w-4" /> Start Creating Free
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
