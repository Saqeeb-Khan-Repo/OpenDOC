import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Loader2 } from 'lucide-react'

// Lazy load pages for peak performance
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then(m => ({ default: m.DocumentsPage })))
const EditorPage = lazy(() => import('@/pages/EditorPage').then(m => ({ default: m.EditorPage })))
const FolderPage = lazy(() => import('@/pages/FolderPage').then(m => ({ default: m.FolderPage })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then(m => ({ default: m.SearchPage })))
const ImportPage = lazy(() => import('@/pages/ImportPage').then(m => ({ default: m.ImportPage })))
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })))
const TrashPage = lazy(() => import('@/pages/TrashPage').then(m => ({ default: m.TrashPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const ViewerPage = lazy(() => import('@/pages/ViewerPage').then(m => ({ default: m.ViewerPage })))
const SeoToolPage = lazy(() => import('@/pages/seo/SeoToolPage').then(m => ({ default: m.SeoToolPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Landing Page Showcase */}
        <Route path="/" element={<LandingPage />} />

        {/* SEO Tools Pages */}
        <Route path="/tools/:toolId" element={<SeoToolPage />} />

        {/* Studio Shell App routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/documents/recent" element={<DocumentsPage />} />
          <Route path="/documents/starred" element={<DocumentsPage />} />
          <Route path="/folders/:id" element={<FolderPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Full-Screen Multi-Mode Editor (Document, Presentation, Visual Design) */}
        <Route path="/editor/:id" element={
          <div className="h-screen flex flex-col bg-background">
            <Suspense fallback={<PageLoader />}>
              <EditorPage />
            </Suspense>
          </div>
        } />

        {/* Public Shared Document Viewer */}
        <Route path="/view" element={
          <Suspense fallback={<PageLoader />}>
            <ViewerPage />
          </Suspense>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
