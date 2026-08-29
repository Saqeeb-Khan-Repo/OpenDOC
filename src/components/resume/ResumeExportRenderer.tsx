import React, { useMemo } from 'react';
import { ResumeData, ResumeEngine } from '@/engines/ResumeEngine';
import { cn } from '@/utils/cn';

interface ResumeExportRendererProps {
  resumeData: ResumeData;
  selectedTemplateId?: string;
  paperSize?: 'A4' | 'Letter';
  scale?: number;
  showPageNumbers?: boolean;
  className?: string;
}

/**
 * Dedicated Isolated Resume Export & Print Preview Renderer.
 * Contains ONLY:
 * <ResumePage>
 *   <ResumeHeader />
 *   <ResumeSections />
 *   <ResumeContent />
 * </ResumePage>
 * 
 * NEVER contains AppLayout, TopBar, Sidebar, Footer, Toolbar, or Editor Controls.
 */
export function ResumeExportRenderer({
  resumeData,
  selectedTemplateId = 'tmpl_modern_pro',
  paperSize = 'A4',
  scale = 1,
  showPageNumbers = false,
  className,
}: ResumeExportRendererProps) {
  const renderedHtml = useMemo(() => {
    return ResumeEngine.renderTemplate(resumeData, selectedTemplateId, { paperSize });
  }, [resumeData, selectedTemplateId, paperSize]);

  const isLetter = paperSize === 'Letter';
  const widthMm = isLetter ? '215.9mm' : '210mm';
  const minHeightMm = isLetter ? '279.4mm' : '297mm';

  return (
    <div
      className={cn('resume-export-renderer flex flex-col items-center select-text', className)}
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
      }}
    >
      {/* ── Standalone A4/Letter Resume Page Container ─────────────────────── */}
      <div
        className={cn(
          'resume-page bg-white text-[#0f172a] transition-all relative overflow-hidden',
          isLetter ? 'w-[816px] min-h-[1056px]' : 'w-[794px] min-h-[1123px]'
        )}
        style={{
          width: widthMm,
          minHeight: minHeightMm,
          boxSizing: 'border-box',
          backgroundColor: resumeData.design?.colors?.background || '#ffffff',
          color: resumeData.design?.colors?.body || '#0f172a',
        }}
      >
        {/* Isolated Resume Content HTML */}
        <div
          className="resume-content-root w-full h-full"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />

        {showPageNumbers && (
          <div className="absolute bottom-2 right-4 text-[9px] font-mono text-muted-foreground/60 select-none print:hidden">
            A4 Document
          </div>
        )}
      </div>
    </div>
  );
}
