import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus, Clock, Star, Upload, Layers, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDocumentsStore } from '@/store/documentsStore'
import { useToastStore } from '@/store/toastStore'
import { cn, formatRelative, getFileTypeColor, getFileTypeLabel } from '@/utils/cn'

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>, label: string, value: number | string, color: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl border border-border bg-card">
      <div className={cn('h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center shrink-0')} style={{ backgroundColor: color + '20' }}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color }} />
      </div>
      <div>
        <p className="text-lg sm:text-2xl font-bold">{value}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { createDocument, getActiveDocuments, getRecentDocuments, getStarredDocuments } = useDocumentsStore()
  const toast = useToastStore()

  const allDocs = getActiveDocuments()
  const recent = getRecentDocuments(6)
  const starred = getStarredDocuments()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const handleNewDoc = () => {
    const doc = createDocument()
    navigate(`/editor/${doc.id}`)
  }

  const quickActions = [
    { label: 'New Document', icon: FileText, color: '#3B82F6', onClick: handleNewDoc },
    { label: 'Import File', icon: Upload, color: '#8B5CF6', onClick: () => navigate('/import') },
    { label: 'Use Template', icon: Layers, color: '#10B981', onClick: () => navigate('/templates') },
  ]

  return (
    <div className="px-3.5 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting} 👋</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          You have {allDocs.length} document{allDocs.length !== 1 ? 's' : ''} in your workspace
        </p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              className="group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 text-center"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: action.color + '15' }}>
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: action.color }} />
              </div>
              <span className="font-medium text-xs sm:text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCard icon={FileText} label="Total Documents" value={allDocs.length} color="#3B82F6" />
          <StatCard icon={Star} label="Starred" value={starred.length} color="#F59E0B" />
          <StatCard icon={Clock} label="Edited Today" value={allDocs.filter(d => new Date(d.updatedAt).toDateString() === new Date().toDateString()).length} color="#10B981" />
          <StatCard icon={HardDrive} label="Total Words" value={allDocs.reduce((sum, d) => sum + d.wordCount, 0).toLocaleString()} color="#8B5CF6" />
        </div>
      </div>

      {/* Recent documents */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Documents</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents/recent')}>View all</Button>
          </div>
          <div className="flex flex-col gap-1">
            {recent.map(doc => (
              <button
                key={doc.id}
                onClick={() => navigate(`/editor/${doc.id}`)}
                className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all text-left"
              >
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.wordCount} words</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getFileTypeColor(doc.fileType))}>
                    {getFileTypeLabel(doc.fileType)}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{formatRelative(doc.updatedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Starred */}
      {starred.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Starred</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents/starred')}>View all</Button>
          </div>
          <div className="flex flex-col gap-1">
            {starred.slice(0, 4).map(doc => (
              <button key={doc.id} onClick={() => navigate(`/editor/${doc.id}`)} className="group flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all text-left">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                <p className="flex-1 font-medium text-sm truncate">{doc.title}</p>
                <span className="text-xs text-muted-foreground">{formatRelative(doc.updatedAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-muted-foreground opacity-40" />
          </div>
          <h3 className="font-bold text-xl mb-2">Welcome to DocFlow!</h3>
          <p className="text-muted-foreground mb-6 max-w-xs">Create your first document or import an existing file to get started.</p>
          <div className="flex gap-3">
            <Button onClick={handleNewDoc} className="gap-2"><Plus className="h-4 w-4" />New Document</Button>
            <Button variant="outline" onClick={() => navigate('/templates')} className="gap-2"><Layers className="h-4 w-4" />Browse Templates</Button>
          </div>
        </div>
      )}
    </div>
  )
}
