import React from 'react';
import { ResumePersonalInfo, ResumeCustomLink, ResumePhoto } from '@/engines/ResumeEngine';
import { ResumeValidator } from '@/utils/resumeValidator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  User, Mail, Phone, MapPin, Globe, Linkedin, Github,
  Sparkles, Plus, Trash2, Image as ImageIcon, Link as LinkIcon, AlertCircle
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ResumeHeaderEditorProps {
  personalInfo: ResumePersonalInfo;
  onChange: (updated: ResumePersonalInfo) => void;
}

export function ResumeHeaderEditor({ personalInfo, onChange }: ResumeHeaderEditorProps) {
  const updateField = (field: keyof ResumePersonalInfo, value: any) => {
    onChange({
      ...personalInfo,
      [field]: value,
    });
  };

  const updatePhoto = (photoPatch: Partial<ResumePhoto>) => {
    const currentPhoto = personalInfo.photo || { url: '', style: 'none', size: 'md' };
    onChange({
      ...personalInfo,
      photo: {
        ...currentPhoto,
        ...photoPatch,
      },
    });
  };

  const addCustomLink = () => {
    const links = personalInfo.customLinks || [];
    onChange({
      ...personalInfo,
      customLinks: [...links, { label: 'Portfolio', url: 'https://' }],
    });
  };

  const updateCustomLink = (index: number, patch: Partial<ResumeCustomLink>) => {
    const links = (personalInfo.customLinks || []).map((l, i) =>
      i === index ? { ...l, ...patch } : l
    );
    onChange({ ...personalInfo, customLinks: links });
  };

  const removeCustomLink = (index: number) => {
    const links = (personalInfo.customLinks || []).filter((_, i) => i !== index);
    onChange({ ...personalInfo, customLinks: links });
  };

  const isEmailInvalid = personalInfo.email && !ResumeValidator.isValidEmail(personalInfo.email);
  const isPhoneInvalid = personalInfo.phone && !ResumeValidator.isValidPhone(personalInfo.phone);
  const isWebsiteInvalid = personalInfo.website && !ResumeValidator.isValidUrl(personalInfo.website);
  const isLinkedinInvalid = personalInfo.linkedin && !ResumeValidator.isValidUrl(personalInfo.linkedin);
  const isGithubInvalid = personalInfo.github && !ResumeValidator.isValidUrl(personalInfo.github);

  return (
    <div className="space-y-4">
      {/* ── Main Profile Details ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <User className="h-3 w-3 text-primary" /> Full Name *
          </label>
          <Input
            value={personalInfo.name}
            placeholder="e.g. Alex Chen"
            onChange={e => updateField('name', e.target.value)}
            className="h-8 text-xs font-semibold"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3 w-3 text-primary" /> Professional Title / Subtitle *
          </label>
          <Input
            value={personalInfo.title}
            placeholder="e.g. Senior Full-Stack Software Engineer"
            onChange={e => updateField('title', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-primary" /> Email Address *
            </span>
            {isEmailInvalid && (
              <span className="text-[10px] text-destructive flex items-center gap-0.5">
                <AlertCircle className="h-2.5 w-2.5" /> Invalid
              </span>
            )}
          </label>
          <Input
            value={personalInfo.email}
            placeholder="alex.chen@example.com"
            onChange={e => updateField('email', e.target.value)}
            className={cn('h-8 text-xs', isEmailInvalid && 'border-destructive/80 focus:border-destructive')}
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-primary" /> Phone Number
            </span>
            {isPhoneInvalid && (
              <span className="text-[10px] text-destructive flex items-center gap-0.5">
                <AlertCircle className="h-2.5 w-2.5" /> Invalid
              </span>
            )}
          </label>
          <Input
            value={personalInfo.phone}
            placeholder="+1 (555) 234-5678"
            onChange={e => updateField('phone', e.target.value)}
            className={cn('h-8 text-xs', isPhoneInvalid && 'border-destructive/80 focus:border-destructive')}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
            <MapPin className="h-3 w-3 text-primary" /> Location (City, State / Country)
          </label>
          <Input
            value={personalInfo.location}
            placeholder="San Francisco, CA"
            onChange={e => updateField('location', e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* ── Profile Photo (Optional for ATS or Visual resumes) ──────────── */}
      <div className="p-3 border border-border/80 rounded-lg bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-primary" /> Profile Photo (Optional)
          </span>
          <span className="text-[10px] text-muted-foreground">Hidden if style is None</span>
        </div>

        <div className="flex items-center gap-3">
          <Input
            value={personalInfo.photo?.url || ''}
            placeholder="Photo URL or leave empty..."
            onChange={e => updatePhoto({ url: e.target.value })}
            className="h-8 text-xs flex-1"
          />
        </div>

        {personalInfo.photo?.url && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/50 text-xs">
            <span className="text-[10px] font-semibold text-muted-foreground">Shape:</span>
            {(['none', 'circle', 'rounded', 'square'] as const).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => updatePhoto({ style: st })}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium border capitalize transition-all cursor-pointer',
                  (personalInfo.photo?.style || 'none') === st
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                {st}
              </button>
            ))}

            <span className="text-[10px] font-semibold text-muted-foreground ml-2">Size:</span>
            {(['sm', 'md', 'lg'] as const).map(sz => (
              <button
                key={sz}
                type="button"
                onClick={() => updatePhoto({ size: sz })}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-medium border uppercase transition-all cursor-pointer',
                  (personalInfo.photo?.size || 'md') === sz
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                )}
              >
                {sz}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Social & Web Links ───────────────────────────────────────────── */}
      <div className="space-y-2.5">
        <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-primary" /> Web &amp; Social Links
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="h-2.5 w-2.5" /> Website / Portfolio URL
              </span>
              {isWebsiteInvalid && (
                <span className="text-[9px] text-destructive flex items-center gap-0.5">
                  <AlertCircle className="h-2.5 w-2.5" /> Invalid URL
                </span>
              )}
            </label>
            <Input
              value={personalInfo.website || ''}
              placeholder="https://alexchen.dev"
              onChange={e => updateField('website', e.target.value)}
              className={cn('h-8 text-xs mt-0.5', isWebsiteInvalid && 'border-destructive/80')}
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Linkedin className="h-2.5 w-2.5 text-blue-600" /> LinkedIn
              </span>
              {isLinkedinInvalid && (
                <span className="text-[9px] text-destructive flex items-center gap-0.5">
                  <AlertCircle className="h-2.5 w-2.5" /> Invalid URL
                </span>
              )}
            </label>
            <Input
              value={personalInfo.linkedin || ''}
              placeholder="linkedin.com/in/alexchen"
              onChange={e => updateField('linkedin', e.target.value)}
              className={cn('h-8 text-xs mt-0.5', isLinkedinInvalid && 'border-destructive/80')}
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Github className="h-2.5 w-2.5" /> GitHub
              </span>
              {isGithubInvalid && (
                <span className="text-[9px] text-destructive flex items-center gap-0.5">
                  <AlertCircle className="h-2.5 w-2.5" /> Invalid URL
                </span>
              )}
            </label>
            <Input
              value={personalInfo.github || ''}
              placeholder="github.com/alexchen"
              onChange={e => updateField('github', e.target.value)}
              className={cn('h-8 text-xs mt-0.5', isGithubInvalid && 'border-destructive/80')}
            />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-amber-500" /> Dedicated Portfolio
            </label>
            <Input
              value={personalInfo.portfolio || ''}
              placeholder="https://alexchen.dev/portfolio"
              onChange={e => updateField('portfolio', e.target.value)}
              className="h-8 text-xs mt-0.5"
            />
          </div>
        </div>

        {/* ── Custom Clickable Links ─────────────────────────────────────── */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <LinkIcon className="h-3 w-3" /> Custom Links (Display text + URL)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomLink}
              className="h-6 text-[10px] gap-1 px-2 cursor-pointer"
            >
              <Plus className="h-3 w-3" /> Add Link
            </Button>
          </div>

          {(personalInfo.customLinks || []).map((cl, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                value={cl.label}
                placeholder="Label (e.g. Tech Blog)"
                onChange={e => updateCustomLink(idx, { label: e.target.value })}
                className="h-7 text-xs w-1/3"
              />
              <Input
                value={cl.url}
                placeholder="https://..."
                onChange={e => updateCustomLink(idx, { url: e.target.value })}
                className="h-7 text-xs flex-1"
              />
              <button
                type="button"
                onClick={() => removeCustomLink(idx)}
                className="text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer transition-colors"
                title="Remove link"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
