import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Presentation, GitFork, UserCheck, FileText, Clock, Star,
  HardDrive, Plus, Layers, Copy, Trash2, LayoutGrid, List,
  ExternalLink, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentsStore } from '@/store/documentsStore';
import { useToastStore } from '@/store/toastStore';
import { cn, formatRelative, getFileTypeColor, getFileTypeLabel } from '@/utils/cn';

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
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    createDocument, getActiveDocuments, getRecentDocuments,
    getStarredDocuments, duplicateDocument, deleteDocument, toggleStar
  } = useDocumentsStore();
  const toast = useToastStore();

  const [recentViewMode, setRecentViewMode] = useState<'grid' | 'list'>('grid');

  const allDocs = getActiveDocuments();
  const recent = getRecentDocuments(6);
  const starred = getStarredDocuments();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    {
      label: 'Document',
      description: 'Word-style rich editor',
      icon: FileText,
      color: '#2563EB',
      onClick: () => {
        const doc = createDocument({ title: 'Untitled Document', mode: 'document' });
        navigate(`/editor/${doc.id}`);
      },
    },
    {
      label: 'Presentation',
      description: '16:9 slides & themes',
      icon: Presentation,
      color: '#8B5CF6',
      onClick: () => {
        const doc = createDocument({ title: 'Untitled Presentation', mode: 'presentation' });
        navigate(`/editor/${doc.id}`);
      },
    },
    {
      label: 'Flowchart',
      description: 'Smart diagramming',
      icon: GitFork,
      color: '#06B6D4',
      onClick: () => navigate('/flowchart'),
    },
    {
      label: 'Resume',
      description: 'ATS-ready professional CV',
      icon: UserCheck,
      color: '#10B981',
      onClick: () => navigate('/resume'),
    },
  ];

  return (
    <div className="px-3.5 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Greeting & Single Primary Action */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting} 👋</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            You have {allDocs.length} document{allDocs.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        <Button
          onClick={() => {
            const doc = createDocument({ title: 'Untitled Document', mode: 'document' });
            navigate(`/editor/${doc.id}`);
          }}
          className="gap-2 shadow-sm font-semibold h-10 px-4 cursor-pointer"
          aria-label="Create Document"
        >
          <Plus className="h-4 w-4" />
          <span>Create Document</span>
        </Button>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              aria-label={`Launch ${action.label}`}
              className="group flex flex-col items-center gap-2 p-3.5 sm:p-5 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 text-center cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs" style={{ backgroundColor: action.color + '18' }}>
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: action.color }} />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-foreground">{action.label}</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block truncate w-full">{action.description}</span>
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Documents</h2>
              <div className="flex items-center border border-border rounded-md bg-muted/30 p-0.5">
                <button
                  type="button"
                  onClick={() => setRecentViewMode('grid')}
                  className={cn(
                    'p-1 rounded cursor-pointer transition-colors',
                    recentViewMode === 'grid' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRecentViewMode('list')}
                  className={cn(
                    'p-1 rounded cursor-pointer transition-colors',
                    recentViewMode === 'list' ? 'bg-background text-primary shadow-2xs' : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/documents/recent')}>View all</Button>
          </div>

          {recentViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recent.map(doc => (
                <div
                  key={doc.id}
                  className="group relative flex flex-col rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Miniature Preview Canvas Container */}
                  <div
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    className="h-32 bg-muted/30 dark:bg-muted/10 border-b border-border/60 p-3.5 flex flex-col justify-between cursor-pointer relative group-hover:bg-primary/5 transition-colors overflow-hidden"
                  >
                    {/* Simulated miniature document page */}
                    <div className="absolute inset-x-8 top-3 bottom-0 bg-background rounded-t-sm shadow-xs border border-border/40 p-2.5 flex flex-col gap-1 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="h-1.5 w-1/3 bg-primary/40 rounded-full mb-1" />
                      <div className="h-1 w-full bg-muted-foreground/20 rounded-full" />
                      <div className="h-1 w-5/6 bg-muted-foreground/20 rounded-full" />
                      <div className="h-1 w-4/6 bg-muted-foreground/15 rounded-full" />
                      <div className="h-1 w-full bg-muted-foreground/15 rounded-full" />
                    </div>

                    {/* Top pill badges and star */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', getFileTypeColor(doc.fileType))}>
                        {getFileTypeLabel(doc.fileType)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(doc.id);
                        }}
                        className="p-1 rounded-full bg-background/80 hover:bg-background border border-border/60 text-muted-foreground hover:text-amber-500 cursor-pointer transition-colors shadow-2xs"
                        title={doc.isStarred ? 'Unstar' : 'Star'}
                      >
                        <Star className={cn('h-3.5 w-3.5', doc.isStarred && 'fill-amber-400 text-amber-400')} />
                      </button>
                    </div>

                    {/* Subtle format tag */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>{doc.mode || 'document'}</span>
                      <span>{doc.wordCount} words</span>
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between gap-2.5">
                    <div>
                      <h3
                        onClick={() => navigate(`/editor/${doc.id}`)}
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors cursor-pointer truncate"
                        title={doc.title}
                      >
                        {doc.title || 'Untitled Document'}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>Edited {formatRelative(doc.updatedAt)}</span>
                      </p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => navigate(`/editor/${doc.id}`)}
                        className="h-7 text-xs px-2.5 gap-1 font-semibold cursor-pointer"
                      >
                        <ExternalLink className="h-3 w-3" /> Open
                      </Button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const copy = duplicateDocument(doc.id);
                            if (copy) toast.success('Duplicated', `Created copy of ${doc.title}`);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                          title="Duplicate document"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteDocument(doc.id);
                            toast.info('Moved to trash', doc.title);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors cursor-pointer"
                          title="Delete document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {recent.map(doc => (
                <div
                  key={doc.id}
                  className="group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all"
                >
                  <div
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div
                    onClick={() => navigate(`/editor/${doc.id}`)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{doc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.wordCount} words • {formatRelative(doc.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline-block', getFileTypeColor(doc.fileType))}>
                      {getFileTypeLabel(doc.fileType)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleStar(doc.id)}
                      className="p-1 text-muted-foreground hover:text-amber-500 rounded cursor-pointer"
                      title={doc.isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star className={cn('h-3.5 w-3.5', doc.isStarred && 'fill-amber-400 text-amber-400')} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const copy = duplicateDocument(doc.id);
                        if (copy) toast.success('Duplicated', `Created copy of ${doc.title}`);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground rounded cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteDocument(doc.id);
                        toast.info('Moved to trash', doc.title);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <h3 className="font-bold text-xl mb-2">Welcome to DocProEditor!</h3>
          <p className="text-muted-foreground mb-6 max-w-xs">Create your first presentation, flowchart, or resume to get started.</p>
          <div className="flex gap-3">
            <Button onClick={() => { const d = createDocument(); navigate(`/editor/${d.id}`); }} className="gap-2"><Plus className="h-4 w-4" />New Document</Button>
            <Button variant="outline" onClick={() => navigate('/templates')} className="gap-2"><Layers className="h-4 w-4" />Browse Templates</Button>
          </div>
        </div>
      )}
    </div>
  );
}
