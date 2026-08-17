import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '@/components/common/ToastContainer';
import { useDocumentsStore } from '@/store/documentsStore';
import { LayoutDashboard, FileText, Plus, Sparkles, Upload, Home } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SEOHead } from '@/components/seo/SEOHead';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { createDocument } = useDocumentsStore();

  const handleQuickNewDoc = () => {
    const doc = createDocument({ title: 'Untitled Document', mode: 'document' });
    navigate(`/editor/${doc.id}`);
  };

  return (
    <div className="flex min-h-screen min-h-[100dvh] h-[100dvh] bg-background overflow-hidden flex-col md:flex-row">
      <SEOHead
        title="DocFlow Workspace"
        description="DocFlow Workspace"
        canonicalPath="/dashboard"
        noindex={true}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overscroll-y-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar (< 768px) ───────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[calc(3.5rem+env(safe-area-inset-bottom,0px))] bg-background/95 backdrop-blur border-t border-border z-40 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,0px)] shadow-lg select-none">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Home className="h-4 w-4 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/documents"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <FileText className="h-4 w-4 mb-0.5" />
          <span>Documents</span>
        </NavLink>

        {/* Quick New FAB in Mobile Nav */}
        <button
          type="button"
          onClick={handleQuickNewDoc}
          aria-label="Create New Document"
          className="flex flex-col items-center justify-center -mt-4 bg-primary text-white h-11 w-11 rounded-full shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          title="Create New Document"
        >
          <Plus className="h-5 w-5" />
        </button>

        <NavLink
          to="/templates"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Sparkles className="h-4 w-4 mb-0.5" />
          <span>Templates</span>
        </NavLink>

        <NavLink
          to="/import"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <Upload className="h-4 w-4 mb-0.5" />
          <span>Import / OCR</span>
        </NavLink>
      </nav>

      <ToastContainer />
    </div>
  );
}
