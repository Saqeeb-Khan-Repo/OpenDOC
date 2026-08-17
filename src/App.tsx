import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Loader2 } from 'lucide-react'
import { GlobalErrorBoundary } from '@/components/common/GlobalErrorBoundary'
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary'
import { safeLazy } from '@/utils/safeLazy'

// Public SEO & Marketing Pages (Resilient dynamic imports with retry)
const LandingPage = safeLazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })), 'LandingPage')
const DocumentEditorSeoPage = safeLazy(() => import('@/pages/seo/DocumentEditorSeoPage').then(m => ({ default: m.DocumentEditorSeoPage })), 'DocumentEditorSeoPage')
const PresentationMakerSeoPage = safeLazy(() => import('@/pages/seo/PresentationMakerSeoPage').then(m => ({ default: m.PresentationMakerSeoPage })), 'PresentationMakerSeoPage')
const FlowchartMakerSeoPage = safeLazy(() => import('@/pages/seo/FlowchartMakerSeoPage').then(m => ({ default: m.FlowchartMakerSeoPage })), 'FlowchartMakerSeoPage')
const ResumeBuilderSeoPage = safeLazy(() => import('@/pages/seo/ResumeBuilderSeoPage').then(m => ({ default: m.ResumeBuilderSeoPage })), 'ResumeBuilderSeoPage')
const PdfEditorSeoPage = safeLazy(() => import('@/pages/seo/PdfEditorSeoPage').then(m => ({ default: m.PdfEditorSeoPage })), 'PdfEditorSeoPage')
const PdfMergerSeoPage = safeLazy(() => import('@/pages/seo/PdfMergerSeoPage').then(m => ({ default: m.PdfMergerSeoPage })), 'PdfMergerSeoPage')
const FileConverterSeoPage = safeLazy(() => import('@/pages/seo/FileConverterSeoPage').then(m => ({ default: m.FileConverterSeoPage })), 'FileConverterSeoPage')
const GuidesHubPage = safeLazy(() => import('@/pages/seo/GuidesHubPage').then(m => ({ default: m.GuidesHubPage })), 'GuidesHubPage')
const ProjectReportGuidePage = safeLazy(() => import('@/pages/seo/ProjectReportGuidePage').then(m => ({ default: m.ProjectReportGuidePage })), 'ProjectReportGuidePage')
const FlowchartGuidePage = safeLazy(() => import('@/pages/seo/FlowchartGuidePage').then(m => ({ default: m.FlowchartGuidePage })), 'FlowchartGuidePage')
const SeoToolPage = safeLazy(() => import('@/pages/seo/SeoToolPage').then(m => ({ default: m.SeoToolPage })), 'SeoToolPage')
const NotFoundPage = safeLazy(() => import('@/pages/seo/NotFoundPage').then(m => ({ default: m.NotFoundPage })), 'NotFoundPage')

// Application & Studio Pages
const DashboardPage = safeLazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })), 'DashboardPage')
const DocumentsPage = safeLazy(() => import('@/pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })), 'DocumentsPage')
const EditorPage = safeLazy(() => import('@/pages/EditorPage').then(m => ({ default: m.EditorPage })), 'EditorPage')
const FolderPage = safeLazy(() => import('@/pages/FolderPage').then(m => ({ default: m.FolderPage })), 'FolderPage')
const SearchPage = safeLazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })), 'SearchPage')
const ImportPage = safeLazy(() => import('@/pages/ImportPage').then(m => ({ default: m.ImportPage })), 'ImportPage')
const TemplatesPage = safeLazy(() => import('@/pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })), 'TemplatesPage')
const TrashPage = safeLazy(() => import('@/pages/TrashPage').then(m => ({ default: m.TrashPage })), 'TrashPage')
const SettingsPage = safeLazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })), 'SettingsPage')
const ViewerPage = safeLazy(() => import('@/pages/ViewerPage').then(m => ({ default: m.ViewerPage })), 'ViewerPage')
const ResumeBuilderPage = safeLazy(() => import('@/pages/ResumeBuilderPage').then(m => ({ default: m.ResumeBuilderPage })), 'ResumeBuilderPage')
const FlowchartEditorPage = safeLazy(() => import('@/pages/FlowchartEditorPage').then(m => ({ default: m.FlowchartEditorPage })), 'FlowchartEditorPage')

function PageLoader({ message = 'Loading workspace...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[240px] gap-2.5 select-none">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs text-muted-foreground font-medium">{message}</span>
    </div>
  )
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Direct Workspace Entry Route (Redirects to Dashboard) ── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/document-editor" element={<DocumentEditorSeoPage />} />
          <Route path="/presentation-maker" element={<PresentationMakerSeoPage />} />
          <Route path="/flowchart-maker" element={<FlowchartMakerSeoPage />} />
          <Route path="/resume-builder" element={<ResumeBuilderSeoPage />} />
          <Route path="/pdf-editor" element={<PdfEditorSeoPage />} />
          <Route path="/pdf-merger" element={<PdfMergerSeoPage />} />
          <Route path="/file-converter" element={<FileConverterSeoPage />} />
          
          {/* Guides & SEO Hub */}
          <Route path="/guides" element={<GuidesHubPage />} />
          <Route path="/guides/how-to-make-a-project-report" element={<ProjectReportGuidePage />} />
          <Route path="/guides/how-to-create-a-flowchart" element={<FlowchartGuidePage />} />
          <Route path="/tools/:toolId" element={<SeoToolPage />} />

          {/* Dedicated Studios (Isolated with RouteErrorBoundary) */}
          <Route path="/resume" element={
            <RouteErrorBoundary name="Resume Builder" fallbackRoute="/dashboard">
              <ResumeBuilderPage />
            </RouteErrorBoundary>
          } />

          <Route path="/flowchart" element={
            <RouteErrorBoundary name="Flowchart Studio" fallbackRoute="/dashboard">
              <FlowchartEditorPage />
            </RouteErrorBoundary>
          } />

          {/* Studio Shell App routes (Private / Workspace) */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/documents/recent" element={<DocumentsPage />} />
            <Route path="/documents/starred" element={<DocumentsPage />} />
            <Route path="/folders/:id" element={<FolderPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/import" element={
              <RouteErrorBoundary name="Import & Tools" fallbackRoute="/dashboard">
                <ImportPage />
              </RouteErrorBoundary>
            } />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/trash" element={<TrashPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Full-Screen Multi-Mode Editor (Document, Presentation, Visual Design) */}
          <Route path="/editor/:id" element={
            <div className="h-screen flex flex-col bg-background">
              <RouteErrorBoundary name="Document Editor" fallbackRoute="/dashboard">
                <Suspense fallback={<PageLoader message="Loading editor components..." />}>
                  <EditorPage />
                </Suspense>
              </RouteErrorBoundary>
            </div>
          } />

          {/* Public Shared Document Viewer */}
          <Route path="/view" element={
            <RouteErrorBoundary name="Document Viewer" fallbackRoute="/">
              <Suspense fallback={<PageLoader message="Opening document..." />}>
                <ViewerPage />
              </Suspense>
            </RouteErrorBoundary>
          } />

          {/* SEO-friendly 404 Not Found Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </GlobalErrorBoundary>
  )
}
