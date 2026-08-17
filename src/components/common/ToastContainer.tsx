import React from 'react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/utils/cn'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200',
  error: 'border-red-500/30 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-200',
  info: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200',
  warning: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg min-w-[280px] max-w-[380px] animate-fade-in',
              colors[toast.type]
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.title}</p>
              {toast.description && (
                <p className="text-xs mt-0.5 opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
