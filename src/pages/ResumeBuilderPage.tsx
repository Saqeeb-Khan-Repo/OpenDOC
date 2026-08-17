import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResumeEngine, ResumeData, ResumeExperience, ResumeEducation,
  ResumeProject, RESUME_TEMPLATES_METADATA
} from '@/engines/ResumeEngine';
import { useDocumentsStore } from '@/store/documentsStore';
import {
  FileText, ArrowLeft, Download, Plus, Trash2, Edit3, Check,
  Sparkles, Palette, Type, Printer, Eye, ChevronDown, ChevronUp,
  Briefcase, GraduationCap, Code2, Award, CheckCircle2, User,
  Globe, Share2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/cn';
import { SEOHead } from '@/components/seo/SEOHead';

const FONT_OPTIONS = ['Inter', 'Merriweather', 'Roboto', 'JetBrains Mono', 'Georgia'];
const ACCENT_COLORS = ['#2563eb', '#0f172a', '#059669', '#7c3aed', '#db2777', '#d97706', '#0891b2'];

export function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();

  const [resumeData, setResumeData] = useState<ResumeData>(() => ResumeEngine.getDefaultResumeData());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl_modern_pro');
  const [fontFamily, setFontFamily] = useState<string>('Inter');
  const [accentColor, setAccentColor] = useState<string>('#2563eb');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [expandedSection, setExpandedSection] = useState<string>('personal');

  // ── Personal Info Handlers ──────────────────────────────────────────────────
  const updatePersonalInfo = (field: keyof typeof resumeData.personalInfo, val: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: val },
    }));
  };

  // ── Experience Handlers ────────────────────────────────────────────────────
  const addExperience = () => {
    const newExp: ResumeExperience = {
      title: 'Job Title',
      company: 'Company Name',
      location: 'City, Country',
      period: '2024 – Present',
      highlights: ['Led key initiatives and improved team productivity by 25%.'],
    };
    setResumeData(prev => ({ ...prev, experience: [newExp, ...prev.experience] }));
  };

  const updateExperience = (index: number, patch: Partial<ResumeExperience>) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, ...patch } : exp),
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // ── Education Handlers ─────────────────────────────────────────────────────
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      degree: 'B.S. in Computer Science',
      school: 'University Name',
      location: 'City, State',
      year: '2020 – 2024',
      details: 'Major in Software Engineering and Distributed Systems.',
    };
    setResumeData(prev => ({ ...prev, education: [newEdu, ...prev.education] }));
  };

  const updateEducation = (index: number, patch: Partial<ResumeEducation>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, ...patch } : edu),
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // ── Project Handlers ───────────────────────────────────────────────────────
  const addProject = () => {
    const newProj: ResumeProject = {
      name: 'Project Title',
      role: 'Lead Architect',
      techStack: ['React', 'TypeScript', 'Node.js'],
      highlights: ['Designed high performance real-time architecture.'],
    };
    setResumeData(prev => ({ ...prev, projects: [newProj, ...prev.projects] }));
  };

  const updateProject = (index: number, patch: Partial<ResumeProject>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => i === index ? { ...proj, ...patch } : proj),
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  // ── Rendered HTML Preview ──────────────────────────────────────────────────
  const resumeHtml = useMemo(() => {
    return ResumeEngine.renderTemplate(resumeData, selectedTemplateId);
  }, [resumeData, selectedTemplateId]);

  // ── Open in Full Document Editor ───────────────────────────────────────────
  const handleOpenInEditor = () => {
    const doc = createDocument({
      title: `${resumeData.personalInfo.name || 'Professional'} Resume`,
      content: resumeHtml,
      mode: 'document',
    });
    navigate(`/editor/${doc.id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <SEOHead
        title="Resume Studio | DocFlow"
        description="DocFlow ATS Resume Studio"
        canonicalPath="/resume"
        noindex={true}
      />
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <header className="h-12 bg-background/95 backdrop-blur border-b border-border px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 select-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="font-extrabold tracking-tight">DocFlow</span>
          </button>

          <span className="text-muted-foreground/40 text-xs font-mono select-none">/</span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground">Resume Builder</span>
            <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full hidden xs:inline">
              ATS-Optimized
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Template Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 font-medium">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Template: </span>
                <span>{RESUME_TEMPLATES_METADATA.find(t => t.id === selectedTemplateId)?.name.split(' ')[0] || 'Modern'}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 text-xs">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Curated ATS Templates</DropdownMenuLabel>
              {RESUME_TEMPLATES_METADATA.map(t => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className="flex flex-col items-start gap-0.5 py-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full font-semibold">
                    <span>{t.name}</span>
                    {selectedTemplateId === t.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Edit in DocFlow */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInEditor}
            className="h-8 text-xs gap-1.5 hidden md:flex font-medium"
          >
            <FileText className="h-3.5 w-3.5 text-blue-500" /> Edit in DocFlow
          </Button>

          {/* Print / Download PDF */}
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5" /> Download PDF
          </Button>
        </div>
      </header>

      {/* ── Mobile Tab Switcher (Form vs. Preview) ───────────────────────────── */}
      <div className="flex md:hidden border-b border-border bg-muted/40 p-1 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('editor')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center',
            activeTab === 'editor' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground'
          )}
        >
          Resume Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center',
            activeTab === 'preview' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground'
          )}
        >
          Live A4 Preview
        </button>
      </div>

      {/* ── Split Body: Left Structured Form + Right Live A4 Preview ─────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT: STRUCTURED FORM EDITOR ──────────────────────────────────── */}
        <div
          className={cn(
            'w-full md:w-[480px] lg:w-[540px] border-r border-border overflow-y-auto p-4 space-y-4 shrink-0 bg-card/40',
            activeTab === 'preview' ? 'hidden md:block' : 'block'
          )}
        >
          {/* Section 1: Personal Information */}
          <div className="border border-border rounded-xl bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Personal Information
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Full Name</label>
                <Input
                  value={resumeData.personalInfo.name}
                  onChange={e => updatePersonalInfo('name', e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Professional Title</label>
                <Input
                  value={resumeData.personalInfo.title}
                  onChange={e => updatePersonalInfo('title', e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Email</label>
                <Input
                  value={resumeData.personalInfo.email}
                  onChange={e => updatePersonalInfo('email', e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Phone</label>
                <Input
                  value={resumeData.personalInfo.phone}
                  onChange={e => updatePersonalInfo('phone', e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">Location</label>
                <Input
                  value={resumeData.personalInfo.location}
                  onChange={e => updatePersonalInfo('location', e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground font-semibold">LinkedIn</label>
                <Input
                  value={resumeData.personalInfo.linkedin || ''}
                  onChange={e => updatePersonalInfo('linkedin', e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Summary */}
          <div className="border border-border rounded-xl bg-background p-4 space-y-2">
            <span className="font-bold text-xs flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" /> Professional Summary
            </span>
            <textarea
              value={resumeData.summary}
              onChange={e => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-border bg-background outline-none resize-none focus:border-primary"
            />
          </div>

          {/* Section 3: Experience */}
          <div className="border border-border rounded-xl bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" /> Work Experience ({resumeData.experience.length})
              </span>
              <Button size="sm" variant="outline" onClick={addExperience} className="h-7 text-[11px] gap-1">
                <Plus className="h-3 w-3" /> Add Job
              </Button>
            </div>
            <div className="space-y-3">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[11px]">Role #{idx + 1}</span>
                    <button type="button" onClick={() => removeExperience(idx)} className="text-destructive p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Input
                      value={exp.title}
                      placeholder="Title"
                      onChange={e => updateExperience(idx, { title: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={exp.company}
                      placeholder="Company"
                      onChange={e => updateExperience(idx, { company: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={exp.period}
                      placeholder="Period (e.g. 2022-Present)"
                      onChange={e => updateExperience(idx, { period: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={exp.location}
                      placeholder="Location"
                      onChange={e => updateExperience(idx, { location: e.target.value })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <textarea
                    value={exp.highlights.join('\n')}
                    placeholder="Key achievements (one per line)"
                    onChange={e => updateExperience(idx, { highlights: e.target.value.split('\n') })}
                    rows={2}
                    className="w-full text-xs p-2 rounded border border-border bg-background outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Education */}
          <div className="border border-border rounded-xl bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-primary" /> Education ({resumeData.education.length})
              </span>
              <Button size="sm" variant="outline" onClick={addEducation} className="h-7 text-[11px] gap-1">
                <Plus className="h-3 w-3" /> Add Degree
              </Button>
            </div>
            <div className="space-y-3">
              {resumeData.education.map((edu, idx) => (
                <div key={idx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[11px]">Degree #{idx + 1}</span>
                    <button type="button" onClick={() => removeEducation(idx)} className="text-destructive p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Input
                      value={edu.degree}
                      placeholder="Degree"
                      onChange={e => updateEducation(idx, { degree: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={edu.school}
                      placeholder="School"
                      onChange={e => updateEducation(idx, { school: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={edu.year}
                      placeholder="Year"
                      onChange={e => updateEducation(idx, { year: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={edu.location}
                      placeholder="Location"
                      onChange={e => updateEducation(idx, { location: e.target.value })}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Technical Projects */}
          <div className="border border-border rounded-xl bg-background p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-primary" /> Projects ({resumeData.projects.length})
              </span>
              <Button size="sm" variant="outline" onClick={addProject} className="h-7 text-[11px] gap-1">
                <Plus className="h-3 w-3" /> Add Project
              </Button>
            </div>
            <div className="space-y-3">
              {resumeData.projects.map((proj, idx) => (
                <div key={idx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[11px]">Project #{idx + 1}</span>
                    <button type="button" onClick={() => removeProject(idx)} className="text-destructive p-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Input
                      value={proj.name}
                      placeholder="Project Name"
                      onChange={e => updateProject(idx, { name: e.target.value })}
                      className="h-7 text-xs"
                    />
                    <Input
                      value={proj.role}
                      placeholder="Role"
                      onChange={e => updateProject(idx, { role: e.target.value })}
                      className="h-7 text-xs"
                    />
                  </div>
                  <Input
                    value={proj.techStack.join(', ')}
                    placeholder="Tech stack (comma separated)"
                    onChange={e => updateProject(idx, { techStack: e.target.value.split(',').map(s => s.trim()) })}
                    className="h-7 text-xs"
                  />
                  <textarea
                    value={proj.highlights.join('\n')}
                    placeholder="Bullet points (one per line)"
                    onChange={e => updateProject(idx, { highlights: e.target.value.split('\n') })}
                    rows={2}
                    className="w-full text-xs p-2 rounded border border-border bg-background outline-none resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: LIVE INSTANT A4 RESUME PREVIEW ─────────────────────────── */}
        <div
          className={cn(
            'flex-1 bg-[#0f172a]/5 dark:bg-[#020617]/50 overflow-y-auto p-4 sm:p-8 flex justify-center items-start',
            activeTab === 'editor' ? 'hidden md:flex' : 'flex'
          )}
        >
          <div
            className="w-full max-w-[794px] min-h-[1123px] bg-white text-[#0f172a] shadow-xl rounded-sm p-8 sm:p-12 transition-all"
            style={{
              fontFamily: fontFamily === 'Merriweather' ? 'Merriweather, Georgia, serif' : 'Inter, system-ui, sans-serif',
            }}
            dangerouslySetInnerHTML={{ __html: resumeHtml }}
          />
        </div>
      </div>
    </div>
  );
}
