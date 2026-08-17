import React from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useDocumentsStore } from '@/store/documentsStore'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor, FileText, HardDrive, Star } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ThemeMode } from '@/types'

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-8 py-4">
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const { theme, setTheme, compactSidebar, setCompactSidebar, spellcheck, setSpellcheck, showWordCount, setShowWordCount, defaultView, setDefaultView } = useSettingsStore()
  const { getActiveDocuments, getStarredDocuments } = useDocumentsStore()

  const allDocs = getActiveDocuments()
  const starred = getStarredDocuments()
  const totalWords = allDocs.reduce((sum, d) => sum + d.wordCount, 0)

  const themeOptions: { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your DocProEditor preferences.</p>
      </div>

      {/* Storage / Stats */}
      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <h2 className="font-semibold text-sm mb-4">Your Workspace</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <FileText className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xl font-bold">{allDocs.length}</p>
            <p className="text-xs text-muted-foreground">Documents</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Star className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <p className="text-xl font-bold">{starred.length}</p>
            <p className="text-xs text-muted-foreground">Starred</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <HardDrive className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xl font-bold">{totalWords.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Words</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">All data stored locally in your browser</p>
      </div>

      {/* Appearance */}
      <section className="rounded-xl border border-border bg-card p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4">Appearance</h2>
        <div className="space-y-1">
          <p className="text-sm font-medium mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                  theme === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                )}
              >
                <opt.icon className={cn('h-5 w-5', theme === opt.value ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('text-xs font-medium', theme === opt.value ? 'text-primary' : 'text-muted-foreground')}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
        <Separator className="my-4" />
        <SettingRow label="Compact Sidebar" description="Use a collapsed sidebar to get more screen space">
          <Switch checked={compactSidebar} onCheckedChange={setCompactSidebar} />
        </SettingRow>
        <Separator />
        <SettingRow label="Default View" description="Choose your preferred document list view">
          <div className="flex items-center rounded-lg border border-border">
            <button onClick={() => setDefaultView('list')} className={cn('h-8 px-3 text-xs rounded-l-lg transition-colors', defaultView === 'list' ? 'bg-accent font-medium' : 'hover:bg-muted')}>List</button>
            <button onClick={() => setDefaultView('grid')} className={cn('h-8 px-3 text-xs rounded-r-lg transition-colors', defaultView === 'grid' ? 'bg-accent font-medium' : 'hover:bg-muted')}>Grid</button>
          </div>
        </SettingRow>
      </section>

      {/* Editor */}
      <section className="rounded-xl border border-border bg-card p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4">Editor</h2>
        <SettingRow label="Spell Check" description="Underline potential spelling errors">
          <Switch checked={spellcheck} onCheckedChange={setSpellcheck} />
        </SettingRow>
        <Separator />
        <SettingRow label="Show Word Count" description="Display word count in the editor status bar">
          <Switch checked={showWordCount} onCheckedChange={setShowWordCount} />
        </SettingRow>
      </section>

      {/* Data */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-sm mb-4">Data & Storage</h2>
        <div className="text-sm text-muted-foreground mb-4">
          DocProEditor stores all your documents locally in your browser's localStorage. No data is sent to any server.
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-sm text-amber-800 dark:text-amber-200 mb-4">
          ⚠️ Clearing browser data will permanently delete all your documents.
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (window.confirm('This will permanently delete ALL documents, folders, and settings. This cannot be undone. Continue?')) {
              localStorage.clear()
              window.location.reload()
            }
          }}
        >
          Clear All Data
        </Button>
      </section>
    </div>
  )
}
