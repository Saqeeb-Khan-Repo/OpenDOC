import React, { useState } from 'react';
import {
  ResumeData, ResumeSectionConfig, ResumeExperience, ResumeEducation,
  ResumeProject, ResumeSkillCategory, ResumeCertification, ResumeAward,
  ResumePublication, ResumeLanguage, ResumeVolunteer, ResumeReference,
  ResumeCustomSection, ResumeCustomSectionItem
} from '@/engines/ResumeEngine';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Briefcase, GraduationCap, Code2, Sparkles, Award, FileText,
  Languages, HeartHandshake, Users, BookOpen, Plus, Trash2,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Eye, EyeOff,
  GripVertical, Link as LinkIcon, Check, Copy, FolderPlus
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeSectionListEditorProps {
  resumeData: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenAddCustomSection: () => void;
}

export function ResumeSectionListEditor({
  resumeData,
  onChange,
  onOpenAddCustomSection,
}: ResumeSectionListEditorProps) {
  const [openSectionId, setOpenSectionId] = useState<string>('sec_experience');

  const sections = resumeData.sectionOrder || [];

  const toggleSectionOpen = (id: string) => {
    setOpenSectionId(prev => (prev === id ? '' : id));
  };

  const toggleSectionVisible = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSections = sections.map(s =>
      s.id === id ? { ...s, visible: !s.visible } : s
    );
    onChange({ ...resumeData, sectionOrder: updatedSections });
  };

  const moveSection = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    onChange({ ...resumeData, sectionOrder: newSections });
  };

  // ── Experience Helpers ─────────────────────────────────────────────────────
  const addExperience = () => {
    const newExp: ResumeExperience = {
      id: `exp_${Date.now()}`,
      title: 'Senior Software Engineer',
      company: 'Company Name',
      location: 'City, State',
      period: '2023 – Present',
      current: true,
      website: '',
      highlights: ['Led engineering initiatives improving system reliability and performance.'],
    };
    onChange({ ...resumeData, experience: [newExp, ...resumeData.experience] });
  };

  const updateExperience = (idx: number, patch: Partial<ResumeExperience>) => {
    const list = resumeData.experience.map((exp, i) =>
      i === idx ? { ...exp, ...patch } : exp
    );
    onChange({ ...resumeData, experience: list });
  };

  const removeExperience = (idx: number) => {
    onChange({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== idx),
    });
  };

  const duplicateExperience = (idx: number) => {
    const exp = resumeData.experience[idx];
    const duplicated: ResumeExperience = {
      ...exp,
      id: `exp_${Date.now()}`,
      highlights: [...exp.highlights],
    };
    const list = [...resumeData.experience];
    list.splice(idx + 1, 0, duplicated);
    onChange({ ...resumeData, experience: list });
  };

  const addExperienceBullet = (expIdx: number) => {
    const exp = resumeData.experience[expIdx];
    const updatedHighlights = [...exp.highlights, 'Key achievement or responsibility metric.'];
    updateExperience(expIdx, { highlights: updatedHighlights });
  };

  const updateExperienceBullet = (expIdx: number, bIdx: number, val: string) => {
    const exp = resumeData.experience[expIdx];
    const updatedHighlights = exp.highlights.map((h, i) => (i === bIdx ? val : h));
    updateExperience(expIdx, { highlights: updatedHighlights });
  };

  const removeExperienceBullet = (expIdx: number, bIdx: number) => {
    const exp = resumeData.experience[expIdx];
    const updatedHighlights = exp.highlights.filter((_, i) => i !== bIdx);
    updateExperience(expIdx, { highlights: updatedHighlights });
  };

  // ── Education Helpers ──────────────────────────────────────────────────────
  const addEducation = () => {
    const newEdu: ResumeEducation = {
      id: `edu_${Date.now()}`,
      degree: 'B.S. in Computer Science',
      school: 'University Name',
      location: 'City, State',
      year: '2020 – 2024',
      gpa: '3.8 / 4.0',
      details: 'Relevant coursework: Algorithms, Distributed Systems, Software Engineering',
    };
    onChange({ ...resumeData, education: [newEdu, ...resumeData.education] });
  };

  const updateEducation = (idx: number, patch: Partial<ResumeEducation>) => {
    const list = resumeData.education.map((edu, i) =>
      i === idx ? { ...edu, ...patch } : edu
    );
    onChange({ ...resumeData, education: list });
  };

  const removeEducation = (idx: number) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== idx),
    });
  };

  const duplicateEducation = (idx: number) => {
    const edu = resumeData.education[idx];
    const duplicated: ResumeEducation = {
      ...edu,
      id: `edu_${Date.now()}`,
    };
    const list = [...resumeData.education];
    list.splice(idx + 1, 0, duplicated);
    onChange({ ...resumeData, education: list });
  };

  // ── Projects Helpers ───────────────────────────────────────────────────────
  const addProject = () => {
    const newProj: ResumeProject = {
      id: `proj_${Date.now()}`,
      name: 'Project Title',
      role: 'Lead Developer',
      techStack: ['React', 'TypeScript', 'Node.js'],
      link: 'https://github.com/...',
      highlights: ['Engineered scalable client-side features and modular APIs.'],
    };
    onChange({ ...resumeData, projects: [newProj, ...resumeData.projects] });
  };

  const updateProject = (idx: number, patch: Partial<ResumeProject>) => {
    const list = resumeData.projects.map((proj, i) =>
      i === idx ? { ...proj, ...patch } : proj
    );
    onChange({ ...resumeData, projects: list });
  };

  const removeProject = (idx: number) => {
    onChange({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== idx),
    });
  };

  const duplicateProject = (idx: number) => {
    const proj = resumeData.projects[idx];
    const duplicated: ResumeProject = {
      ...proj,
      id: `proj_${Date.now()}`,
      techStack: [...proj.techStack],
      highlights: [...proj.highlights],
    };
    const list = [...resumeData.projects];
    list.splice(idx + 1, 0, duplicated);
    onChange({ ...resumeData, projects: list });
  };

  const addProjectBullet = (projIdx: number) => {
    const proj = resumeData.projects[projIdx];
    const updatedHighlights = [...proj.highlights, 'Key implementation detail or result.'];
    updateProject(projIdx, { highlights: updatedHighlights });
  };

  const updateProjectBullet = (projIdx: number, bIdx: number, val: string) => {
    const proj = resumeData.projects[projIdx];
    const updatedHighlights = proj.highlights.map((h, i) => (i === bIdx ? val : h));
    updateProject(projIdx, { highlights: updatedHighlights });
  };

  const removeProjectBullet = (projIdx: number, bIdx: number) => {
    const proj = resumeData.projects[projIdx];
    const updatedHighlights = proj.highlights.filter((_, i) => i !== bIdx);
    updateProject(projIdx, { highlights: updatedHighlights });
  };

  // ── Skills Helpers ─────────────────────────────────────────────────────────
  const addSkillCategory = () => {
    const newCat: ResumeSkillCategory = {
      id: `skill_${Date.now()}`,
      category: 'New Skill Category',
      skills: ['Skill 1', 'Skill 2', 'Skill 3'],
    };
    onChange({ ...resumeData, skillCategories: [...resumeData.skillCategories, newCat] });
  };

  const updateSkillCategory = (idx: number, patch: Partial<ResumeSkillCategory>) => {
    const list = resumeData.skillCategories.map((sc, i) =>
      i === idx ? { ...sc, ...patch } : sc
    );
    onChange({ ...resumeData, skillCategories: list });
  };

  const removeSkillCategory = (idx: number) => {
    onChange({
      ...resumeData,
      skillCategories: resumeData.skillCategories.filter((_, i) => i !== idx),
    });
  };

  // ── Certifications Helpers ─────────────────────────────────────────────────
  const addCertification = () => {
    const newCert: ResumeCertification = {
      id: `cert_${Date.now()}`,
      name: 'Certification Name',
      issuer: 'Issuing Body / Institution',
      year: '2024',
      link: '',
    };
    onChange({ ...resumeData, certifications: [...resumeData.certifications, newCert] });
  };

  const updateCertification = (idx: number, patch: Partial<ResumeCertification>) => {
    const list = resumeData.certifications.map((c, i) =>
      i === idx ? { ...c, ...patch } : c
    );
    onChange({ ...resumeData, certifications: list });
  };

  const removeCertification = (idx: number) => {
    onChange({
      ...resumeData,
      certifications: resumeData.certifications.filter((_, i) => i !== idx),
    });
  };

  // ── Custom Sections Helpers ────────────────────────────────────────────────
  const updateCustomSection = (secId: string, patch: Partial<ResumeCustomSection>) => {
    const list = (resumeData.customSections || []).map(cs =>
      cs.id === secId ? { ...cs, ...patch } : cs
    );
    onChange({ ...resumeData, customSections: list });
  };

  const addCustomItem = (secId: string) => {
    const sec = (resumeData.customSections || []).find(cs => cs.id === secId);
    if (!sec) return;
    const newItem: ResumeCustomSectionItem = {
      id: `item_${Date.now()}`,
      title: 'Item / Contribution Name',
      subtitle: 'Role / Organization',
      date: '2024',
      description: 'Brief description of the work, achievement, or impact.',
      bullets: [],
    };
    updateCustomSection(secId, { items: [...sec.items, newItem] });
  };

  const updateCustomItem = (secId: string, itemIdx: number, patch: Partial<ResumeCustomSectionItem>) => {
    const sec = (resumeData.customSections || []).find(cs => cs.id === secId);
    if (!sec) return;
    const items = sec.items.map((it, i) => (i === itemIdx ? { ...it, ...patch } : it));
    updateCustomSection(secId, { items });
  };

  const removeCustomItem = (secId: string, itemIdx: number) => {
    const sec = (resumeData.customSections || []).find(cs => cs.id === secId);
    if (!sec) return;
    updateCustomSection(secId, { items: sec.items.filter((_, i) => i !== itemIdx) });
  };

  const removeCustomSection = (secId: string) => {
    onChange({
      ...resumeData,
      customSections: (resumeData.customSections || []).filter(cs => cs.id !== secId),
      sectionOrder: (resumeData.sectionOrder || []).filter(s => s.customSectionId !== secId),
    });
  };

  // ── Helper to Get Section Icon ─────────────────────────────────────────────
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'summary':
      case 'objective':
        return <FileText className="h-3.5 w-3.5 text-blue-500" />;
      case 'skills':
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case 'experience':
        return <Briefcase className="h-3.5 w-3.5 text-emerald-500" />;
      case 'projects':
        return <Code2 className="h-3.5 w-3.5 text-indigo-500" />;
      case 'education':
        return <GraduationCap className="h-3.5 w-3.5 text-purple-500" />;
      case 'certifications':
      case 'achievements':
      case 'awards':
        return <Award className="h-3.5 w-3.5 text-rose-500" />;
      case 'languages':
        return <Languages className="h-3.5 w-3.5 text-teal-500" />;
      case 'volunteer':
        return <HeartHandshake className="h-3.5 w-3.5 text-pink-500" />;
      case 'organizations':
      case 'references':
        return <Users className="h-3.5 w-3.5 text-sky-500" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-primary" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* ── Reorderable Sections Stack ───────────────────────────────────── */}
      {sections.map((sec, idx) => {
        if (sec.type === 'personal') return null; // Handled in dedicated header editor
        const isOpen = openSectionId === sec.id;

        return (
          <div
            key={sec.id}
            className={cn(
              'border rounded-xl bg-background transition-all overflow-hidden',
              isOpen ? 'border-primary/50 shadow-xs' : 'border-border',
              !sec.visible && 'opacity-60 bg-muted/20'
            )}
          >
            {/* Section Header Bar */}
            <div
              onClick={() => toggleSectionOpen(sec.id)}
              className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-muted/30 select-none transition-colors"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
                {getSectionIcon(sec.type)}
                <span className="font-bold text-xs text-foreground">
                  {sec.title}
                </span>
                {!sec.visible && (
                  <span className="text-[9px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.2 rounded">
                    Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Up / Down Reorder */}
                <button
                  type="button"
                  disabled={idx <= 1}
                  onClick={e => moveSection(idx, 'up', e)}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
                  title="Move section up"
                >
                  <ArrowUp className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === sections.length - 1}
                  onClick={e => moveSection(idx, 'down', e)}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20 cursor-pointer"
                  title="Move section down"
                >
                  <ArrowDown className="h-3 w-3" />
                </button>

                {/* Hide / Show */}
                <button
                  type="button"
                  onClick={e => toggleSectionVisible(sec.id, e)}
                  className="p-1 text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  title={sec.visible ? 'Hide section' : 'Show section'}
                >
                  {sec.visible ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                </button>

                {isOpen ? (
                  <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                )}
              </div>
            </div>

            {/* Section Form Body (when opened) */}
            {isOpen && (
              <div className="p-3.5 pt-1 border-t border-border/60 space-y-3 bg-card/30">
                {/* ── Summary / Objective ──────────────────────────────── */}
                {sec.type === 'summary' && (
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                      Professional Summary Text
                    </label>
                    <textarea
                      value={resumeData.summary}
                      onChange={e => onChange({ ...resumeData, summary: e.target.value })}
                      rows={4}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background outline-none resize-none focus:border-primary leading-relaxed"
                      placeholder="Highlight your key achievements, years of experience, and primary competencies..."
                    />
                  </div>
                )}

                {sec.type === 'objective' && (
                  <div>
                    <label className="text-[10px] text-muted-foreground font-semibold block mb-1">
                      Career Objective
                    </label>
                    <textarea
                      value={resumeData.objective || ''}
                      onChange={e => onChange({ ...resumeData, objective: e.target.value })}
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border border-border bg-background outline-none resize-none focus:border-primary leading-relaxed"
                      placeholder="State your goal and what you bring to target opportunities..."
                    />
                  </div>
                )}

                {/* ── Experience ────────────────────────────────────────── */}
                {sec.type === 'experience' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Experience Items ({resumeData.experience.length})
                      </span>
                      <Button size="sm" variant="outline" onClick={addExperience} className="h-7 text-[11px] gap-1">
                        <Plus className="h-3 w-3" /> Add Job Role
                      </Button>
                    </div>

                    {resumeData.experience.map((exp, expIdx) => (
                      <div key={expIdx} className="p-3 border border-border/80 rounded-lg space-y-2.5 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-primary">Role #{expIdx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateExperience(expIdx)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                              title="Duplicate role"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeExperience(expIdx)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded transition-colors"
                              title="Remove role"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-muted-foreground font-medium">Job Title</label>
                            <Input
                              value={exp.title}
                              placeholder="e.g. Lead Software Engineer"
                              onChange={e => updateExperience(expIdx, { title: e.target.value })}
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground font-medium">Company Name</label>
                            <Input
                              value={exp.company}
                              placeholder="e.g. Acme Corp"
                              onChange={e => updateExperience(expIdx, { company: e.target.value })}
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground font-medium">Period / Dates</label>
                            <Input
                              value={exp.period}
                              placeholder="e.g. 2022 – Present"
                              onChange={e => updateExperience(expIdx, { period: e.target.value })}
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-muted-foreground font-medium">Location</label>
                            <Input
                              value={exp.location}
                              placeholder="e.g. San Francisco, CA"
                              onChange={e => updateExperience(expIdx, { location: e.target.value })}
                              className="h-7 text-xs mt-0.5"
                            />
                          </div>
                        </div>

                        {/* Bullet points */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-muted-foreground">Achievement Bullet Points</span>
                            <button
                              type="button"
                              onClick={() => addExperienceBullet(expIdx)}
                              className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="h-2.5 w-2.5" /> Add Bullet
                            </button>
                          </div>
                          {exp.highlights.map((h, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-1.5">
                              <span className="text-muted-foreground text-xs">•</span>
                              <Input
                                value={h}
                                onChange={e => updateExperienceBullet(expIdx, bIdx, e.target.value)}
                                className="h-7 text-xs flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => removeExperienceBullet(expIdx, bIdx)}
                                className="text-destructive/70 hover:text-destructive p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Education ─────────────────────────────────────────── */}
                {sec.type === 'education' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Education Entries ({resumeData.education.length})
                      </span>
                      <Button size="sm" variant="outline" onClick={addEducation} className="h-7 text-[11px] gap-1">
                        <Plus className="h-3 w-3" /> Add Degree
                      </Button>
                    </div>

                    {resumeData.education.map((edu, eduIdx) => (
                      <div key={eduIdx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-primary">Degree #{eduIdx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateEducation(eduIdx)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                              title="Duplicate degree"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeEducation(eduIdx)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <Input
                            value={edu.degree}
                            placeholder="Degree (e.g. B.S. in Computer Science)"
                            onChange={e => updateEducation(eduIdx, { degree: e.target.value })}
                            className="h-7 text-xs"
                          />
                          <Input
                            value={edu.school}
                            placeholder="School / University"
                            onChange={e => updateEducation(eduIdx, { school: e.target.value })}
                            className="h-7 text-xs"
                          />
                          <Input
                            value={edu.year}
                            placeholder="Year / Graduation Date"
                            onChange={e => updateEducation(eduIdx, { year: e.target.value })}
                            className="h-7 text-xs"
                          />
                          <Input
                            value={edu.location}
                            placeholder="Location (e.g. Berkeley, CA)"
                            onChange={e => updateEducation(eduIdx, { location: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>
                        <Input
                          value={edu.details || ''}
                          placeholder="Honors, GPA, Relevant Coursework (optional)"
                          onChange={e => updateEducation(eduIdx, { details: e.target.value })}
                          className="h-7 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Projects ──────────────────────────────────────────── */}
                {sec.type === 'projects' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Projects ({resumeData.projects.length})
                      </span>
                      <Button size="sm" variant="outline" onClick={addProject} className="h-7 text-[11px] gap-1">
                        <Plus className="h-3 w-3" /> Add Project
                      </Button>
                    </div>

                    {resumeData.projects.map((proj, projIdx) => (
                      <div key={projIdx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-primary">Project #{projIdx + 1}</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => duplicateProject(projIdx)}
                              className="text-muted-foreground hover:text-primary hover:bg-primary/10 p-1 rounded transition-colors"
                              title="Duplicate project"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeProject(projIdx)}
                              className="text-destructive hover:bg-destructive/10 p-1 rounded"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <Input
                            value={proj.name}
                            placeholder="Project Name"
                            onChange={e => updateProject(projIdx, { name: e.target.value })}
                            className="h-7 text-xs font-semibold"
                          />
                          <Input
                            value={proj.role}
                            placeholder="Your Role / Contribution"
                            onChange={e => updateProject(projIdx, { role: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>

                        <Input
                          value={proj.techStack.join(', ')}
                          placeholder="Tech Stack (comma separated: React, Node.js, AWS)"
                          onChange={e =>
                            updateProject(projIdx, {
                              techStack: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                            })
                          }
                          className="h-7 text-xs"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <Input
                            value={proj.link || ''}
                            placeholder="Project / Repo URL"
                            onChange={e => updateProject(projIdx, { link: e.target.value })}
                            className="h-7 text-xs"
                          />
                          <Input
                            value={proj.liveDemoUrl || ''}
                            placeholder="Live Demo URL (optional)"
                            onChange={e => updateProject(projIdx, { liveDemoUrl: e.target.value })}
                            className="h-7 text-xs"
                          />
                        </div>

                        {/* Project Highlights */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-muted-foreground">Key Highlights</span>
                            <button
                              type="button"
                              onClick={() => addProjectBullet(projIdx)}
                              className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Plus className="h-2.5 w-2.5" /> Add Bullet
                            </button>
                          </div>
                          {proj.highlights.map((h, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-1.5">
                              <span className="text-muted-foreground text-xs">•</span>
                              <Input
                                value={h}
                                onChange={e => updateProjectBullet(projIdx, bIdx, e.target.value)}
                                className="h-7 text-xs flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => removeProjectBullet(projIdx, bIdx)}
                                className="text-destructive/70 hover:text-destructive p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Skills & Competencies ─────────────────────────────── */}
                {sec.type === 'skills' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Skill Categories ({resumeData.skillCategories.length})
                      </span>
                      <Button size="sm" variant="outline" onClick={addSkillCategory} className="h-7 text-[11px] gap-1">
                        <Plus className="h-3 w-3" /> Add Category
                      </Button>
                    </div>

                    {resumeData.skillCategories.map((sc, catIdx) => (
                      <div key={catIdx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                        <div className="flex justify-between items-center">
                          <Input
                            value={sc.category}
                            placeholder="Category Name (e.g. Languages & Frameworks)"
                            onChange={e => updateSkillCategory(catIdx, { category: e.target.value })}
                            className="h-7 text-xs font-bold w-3/4"
                          />
                          <button
                            type="button"
                            onClick={() => removeSkillCategory(catIdx)}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground font-medium block mb-1">
                            Skills (comma separated)
                          </label>
                          <Input
                            value={sc.skills.join(', ')}
                            placeholder="TypeScript, React, Python, Go, GraphQL"
                            onChange={e =>
                              updateSkillCategory(catIdx, {
                                skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                              })
                            }
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Certifications ────────────────────────────────────── */}
                {sec.type === 'certifications' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-semibold text-muted-foreground">
                        Certifications ({resumeData.certifications.length})
                      </span>
                      <Button size="sm" variant="outline" onClick={addCertification} className="h-7 text-[11px] gap-1">
                        <Plus className="h-3 w-3" /> Add Certificate
                      </Button>
                    </div>

                    {resumeData.certifications.map((c, cIdx) => (
                      <div key={cIdx} className="p-2.5 border border-border/80 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/20">
                        <Input
                          value={c.name}
                          placeholder="Certification Name"
                          onChange={e => updateCertification(cIdx, { name: e.target.value })}
                          className="h-7 text-xs"
                        />
                        <Input
                          value={c.issuer}
                          placeholder="Issuer (e.g. AWS)"
                          onChange={e => updateCertification(cIdx, { issuer: e.target.value })}
                          className="h-7 text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <Input
                            value={c.year}
                            placeholder="Year"
                            onChange={e => updateCertification(cIdx, { year: e.target.value })}
                            className="h-7 text-xs w-20"
                          />
                          <button
                            type="button"
                            onClick={() => removeCertification(cIdx)}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Achievements ──────────────────────────────────────── */}
                {sec.type === 'achievements' && (
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground font-semibold block">
                      Key Achievements &amp; Honors (one per line)
                    </label>
                    <textarea
                      value={resumeData.achievements.join('\n')}
                      onChange={e => onChange({ ...resumeData, achievements: e.target.value.split('\n').filter(Boolean) })}
                      rows={3}
                      className="w-full text-xs p-2 rounded border border-border bg-background outline-none resize-none"
                    />
                  </div>
                )}

                {/* ── Custom Sections ───────────────────────────────────── */}
                {sec.type === 'custom' && (
                  <div className="space-y-3">
                    {(() => {
                      const customSec = (resumeData.customSections || []).find(
                        cs => cs.id === sec.customSectionId || cs.title === sec.title
                      );
                      if (!customSec) {
                        return <p className="text-xs text-muted-foreground">Custom section not found.</p>;
                      }

                      return (
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              {customSec.title} Entries ({customSec.items.length})
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addCustomItem(customSec.id)}
                                className="h-7 text-[11px] gap-1"
                              >
                                <Plus className="h-3 w-3" /> Add Entry
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCustomSection(customSec.id)}
                                className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                              >
                                Delete Section
                              </Button>
                            </div>
                          </div>

                          {customSec.items.map((item, itIdx) => (
                            <div key={itIdx} className="p-3 border border-border/80 rounded-lg space-y-2 bg-muted/20">
                              <div className="flex justify-between items-center">
                                <Input
                                  value={item.title}
                                  placeholder="Title / Heading"
                                  onChange={e => updateCustomItem(customSec.id, itIdx, { title: e.target.value })}
                                  className="h-7 text-xs font-semibold w-3/4"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeCustomItem(customSec.id, itIdx)}
                                  className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <Input
                                  value={item.subtitle || ''}
                                  placeholder="Subtitle / Role / Org"
                                  onChange={e => updateCustomItem(customSec.id, itIdx, { subtitle: e.target.value })}
                                  className="h-7 text-xs"
                                />
                                <Input
                                  value={item.date || ''}
                                  placeholder="Date / Period"
                                  onChange={e => updateCustomItem(customSec.id, itIdx, { date: e.target.value })}
                                  className="h-7 text-xs"
                                />
                              </div>
                              <Input
                                value={item.link || ''}
                                placeholder="Link / URL (optional)"
                                onChange={e => updateCustomItem(customSec.id, itIdx, { link: e.target.value })}
                                className="h-7 text-xs"
                              />
                              <textarea
                                value={item.description || ''}
                                placeholder="Description text..."
                                onChange={e => updateCustomItem(customSec.id, itIdx, { description: e.target.value })}
                                rows={2}
                                className="w-full text-xs p-2 rounded border border-border bg-background outline-none resize-none"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* ── Add Custom Section Trigger ───────────────────────────────────── */}
      <Button
        type="button"
        variant="outline"
        onClick={onOpenAddCustomSection}
        className="w-full h-9 text-xs font-semibold gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/5 cursor-pointer mt-2"
      >
        <FolderPlus className="h-3.5 w-3.5" /> + Add Custom Section (e.g. Open Source, Patents)
      </Button>
    </div>
  );
}
