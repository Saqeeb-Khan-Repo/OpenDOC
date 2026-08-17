import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoverPageData } from '@/engines/types';
import { GraduationCap, Plus } from 'lucide-react';

interface AcademicCoverModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: CoverPageData;
  onInsert: (data: CoverPageData, html: string) => void;
}

export function AcademicCoverModal({ open, onClose, initialData, onInsert }: AcademicCoverModalProps) {
  const [data, setData] = useState<CoverPageData>(
    initialData || {
      universityName: 'VISVESVARAYA TECHNOLOGICAL UNIVERSITY',
      collegeName: 'DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING',
      departmentName: 'School of Computing & Information Technology',
      projectTitle: 'AI-POWERED COLLABORATIVE DOCUMENT & REPORT STUDIO',
      projectSubtitle: 'A Scalable Web Architecture for Multi-Format Engineering Documentation',
      studentName: 'Saqeeb Khan & Team',
      studentUSN: '1CR21CS101',
      guideName: 'Dr. John Doe, Ph.D.',
      guideDesignation: 'Professor & Head of Department',
      academicYear: '2025 – 2026',
      submissionDate: 'August 2026',
    }
  );

  const handleChange = (field: keyof CoverPageData, val: string) => {
    setData(prev => ({ ...prev, [field]: val }));
  };

  const handleGenerate = () => {
    const html = `
      <div class="cover-page-academic p-8 border-4 border-double border-primary/40 rounded-2xl bg-card text-center my-6 shadow-sm">
        <h2 style="font-size: 15pt; font-weight: bold; color: #1e3a8a; margin: 0; text-transform: uppercase;">${data.universityName}</h2>
        <p style="font-size: 11pt; color: #475569; margin: 4px 0 24px 0;">${data.collegeName}</p>
        <div style="font-size: 38px; margin: 16px 0;">🏛️</div>
        <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a; margin: 20px 0 8px 0; text-transform: uppercase;">${data.projectTitle}</h1>
        ${data.projectSubtitle ? `<p style="font-size: 12pt; font-style: italic; color: #475569; margin-bottom: 24px;">${data.projectSubtitle}</p>` : ''}
        <p style="font-size: 10.5pt; color: #64748b; margin: 16px 0 6px 0;"><em>A Project Report submitted in partial fulfillment for the award of degree of</em></p>
        <p style="font-size: 12pt; font-weight: bold; color: #1e3a8a; margin: 0 0 24px 0;">BACHELOR OF ENGINEERING IN ${data.departmentName.toUpperCase()}</p>
        
        <div style="display: flex; justify-content: space-around; margin: 32px 0; text-align: left;">
          <div>
            <p style="font-size: 9.5pt; color: #64748b; font-weight: bold; margin: 0 0 4px 0;">SUBMITTED BY:</p>
            <p style="font-size: 11pt; font-weight: bold; margin: 0;">${data.studentName}</p>
            <p style="font-size: 10pt; color: #475569; margin: 0;">USN: ${data.studentUSN}</p>
          </div>
          <div>
            <p style="font-size: 9.5pt; color: #64748b; font-weight: bold; margin: 0 0 4px 0;">UNDER THE GUIDANCE OF:</p>
            <p style="font-size: 11pt; font-weight: bold; margin: 0;">${data.guideName}</p>
            <p style="font-size: 10pt; color: #475569; margin: 0;">${data.guideDesignation}</p>
          </div>
        </div>

        <div style="border-top: 1px solid #cbd5e1; padding-top: 16px; display: flex; justify-content: space-between; font-size: 10pt; font-weight: 600; color: #334155;">
          <span>DATE: ${data.submissionDate}</span>
          <span>ACADEMIC YEAR: ${data.academicYear}</span>
        </div>
      </div>
    `;
    onInsert(data, html);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Academic Cover Page Builder
          </DialogTitle>
          <DialogDescription>
            Configure official university credentials, project title, guide details, and academic year.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">University / Board Name</label>
              <Input
                value={data.universityName}
                onChange={e => handleChange('universityName', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">College / Institute Name</label>
              <Input
                value={data.collegeName}
                onChange={e => handleChange('collegeName', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Department</label>
            <Input
              value={data.departmentName}
              onChange={e => handleChange('departmentName', e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Title</label>
            <Input
              value={data.projectTitle}
              onChange={e => handleChange('projectTitle', e.target.value)}
              className="text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Subtitle (Optional)</label>
            <Input
              value={data.projectSubtitle || ''}
              onChange={e => handleChange('projectSubtitle', e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Student Name(s)</label>
              <Input
                value={data.studentName}
                onChange={e => handleChange('studentName', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Student USN / Roll No.</label>
              <Input
                value={data.studentUSN}
                onChange={e => handleChange('studentUSN', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Guide Name</label>
              <Input
                value={data.guideName}
                onChange={e => handleChange('guideName', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Guide Designation</label>
              <Input
                value={data.guideDesignation}
                onChange={e => handleChange('guideDesignation', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Academic Year</label>
              <Input
                value={data.academicYear}
                onChange={e => handleChange('academicYear', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Submission Date</label>
              <Input
                value={data.submissionDate}
                onChange={e => handleChange('submissionDate', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleGenerate} className="gap-1.5">
            <Plus className="h-4 w-4" /> Insert Cover Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
