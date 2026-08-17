import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FileText, Folder, Star, Clock, Trash2, Settings, Plus, Upload,
  LayoutDashboard, FileSearch, Layers, ChevronRight, ChevronDown,
  Briefcase, User, FolderOpen, X, PanelLeftClose, PanelLeft,
  Presentation, Palette, Sparkles, GitFork, UserCheck
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { useFoldersStore } from '@/store/foldersStore'
import { useDocumentsStore } from '@/store/documentsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

const FOLDER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  briefcase: Briefcase,
  user: User,
  folder: Folder,
}

interface NavItemProps {
  to: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  count?: number
  compact?: boolean
}

function NavItem({ to, icon: Icon, label, count, compact }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          compact && 'justify-center px-2'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground')} />
          {!compact && <span className="truncate">{label}</span>}
          {!compact && count !== undefined && count > 0 && (
            <span className={cn('ml-auto text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center', isActive ? 'bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground' : 'bg-sidebar-accent text-sidebar-accent-foreground')}>
              {count}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { folders, getRootFolders } = useFoldersStore()
  const { getTrashedDocuments, getStarredDocuments, getActiveDocuments, createDocument } = useDocumentsStore()
  const { compactSidebar } = useSettingsStore()
  const [foldersExpanded, setFoldersExpanded] = React.useState(true)

  const rootFolders = getRootFolders()
  const trashedCount = getTrashedDocuments().length
  const starredCount = getStarredDocuments().length
  const totalDocs = getActiveDocuments().length

  const handleNewDoc = (mode: 'document' | 'presentation' | 'design' = 'document') => {
    const doc = createDocument({
      title: mode === 'presentation' ? 'Untitled Presentation' : mode === 'design' ? 'Untitled Visual Design' : 'Untitled Project Report',
      mode,
    })
    navigate(`/editor/${doc.id}`)
    onClose()
  }

  return (
    <TooltipProvider delayDuration={300}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
          'lg:relative lg:z-auto',
          open ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0',
          compactSidebar ? 'lg:w-[60px]' : 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center gap-3 px-4 h-14 border-b border-sidebar-border shrink-0', compactSidebar && 'lg:justify-center lg:px-0')}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0 shadow-sm text-primary-foreground font-extrabold text-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          {(!compactSidebar) && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm text-sidebar-foreground tracking-tight truncate">DocProEditor</span>
              <span className="text-[10px] text-sidebar-foreground/50 font-mono -mt-0.5">Workspace</span>
            </div>
          )}
          <Button variant="ghost" size="icon-sm" className="ml-auto lg:hidden" onClick={onClose} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick New buttons */}
        <div className={cn('px-3 py-3 shrink-0 space-y-1.5', compactSidebar && 'lg:px-2')}>
          {compactSidebar ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="w-full" onClick={() => handleNewDoc('document')} aria-label="Create new document">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Document</TooltipContent>
            </Tooltip>
          ) : (
            <Button className="w-full gap-2 text-xs font-semibold shadow-sm" size="sm" onClick={() => handleNewDoc('document')} aria-label="Create new document">
              <Plus className="h-4 w-4" />
              New Document
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-6">
          {/* Main */}
          <div className="space-y-1">
            <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" compact={compactSidebar} />
            <NavItem to="/documents" icon={FileText} label="All Documents" count={totalDocs} compact={compactSidebar} />
            <NavItem to="/flowchart" icon={GitFork} label="Flowchart Studio" compact={compactSidebar} />
            <NavItem to="/resume" icon={UserCheck} label="Resume Builder" compact={compactSidebar} />
            <NavItem to="/import" icon={Layers} label="PDF &amp; Doc Tools" compact={compactSidebar} />
            <NavItem to="/templates" icon={Sparkles} label="Templates" compact={compactSidebar} />
            <NavItem to="/search" icon={FileSearch} label="Search" compact={compactSidebar} />
          </div>

          {/* Quick Filters */}
          <div className="space-y-1">
            {!compactSidebar && (
              <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                Favorites
              </p>
            )}
            <NavItem to="/documents/starred" icon={Star} label="Starred" count={starredCount} compact={compactSidebar} />
            <NavItem to="/documents/recent" icon={Clock} label="Recent" compact={compactSidebar} />
          </div>

          {/* Folders */}
          {!compactSidebar && (
            <div className="space-y-1">
              <div
                className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider cursor-pointer hover:text-sidebar-foreground/70 select-none"
                onClick={() => setFoldersExpanded(v => !v)}
              >
                <span>Folders</span>
                {foldersExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </div>

              {foldersExpanded && (
                <div className="space-y-0.5 pl-1">
                  {rootFolders.map(folder => {
                    const IconComp = FOLDER_ICONS[folder.icon] ?? Folder
                    return (
                      <NavLink
                        key={folder.id}
                        to={`/folders/${folder.id}`}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-150 group',
                            isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          )
                        }
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                        <span className="truncate">{folder.name}</span>
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-1 shrink-0">
          <NavItem to="/trash" icon={Trash2} label="Trash" count={trashedCount} compact={compactSidebar} />
          <NavItem to="/settings" icon={Settings} label="Settings" compact={compactSidebar} />
        </div>
      </aside>
    </TooltipProvider>
  )
}
