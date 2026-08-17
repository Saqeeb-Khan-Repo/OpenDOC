import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sparkles, RefreshCw, Home, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
  showDetails: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isChunkError: false,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /failed to fetch dynamically imported module/i.test(error?.message || '') ||
      /error loading dynamically imported module/i.test(error?.message || '');

    return {
      hasError: true,
      error,
      isChunkError,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Production-safe diagnostic logging (strips private user text/tokens)
    console.error('[DocFlow Error Boundary]:', error?.message, {
      componentStack: errorInfo.componentStack?.slice(0, 300),
      timestamp: new Date().toISOString(),
    });
  }

  handleReload = () => {
    try {
      window.location.reload();
    } catch {
      window.location.href = '/';
    }
  };

  handleGoHome = () => {
    try {
      this.setState({ hasError: false, error: null });
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;

      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground p-6 select-none">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            {/* Header Icon */}
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="h-7 w-7" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {isChunk ? 'New Version Available' : 'Something went wrong'}
              </h1>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isChunk
                  ? 'A new version of DocFlow has been deployed. Please reload the page to load the latest components.'
                  : 'DocFlow encountered an unexpected error. Your saved files in local storage are safe.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full sm:w-auto text-xs font-bold gap-2 h-10 shadow-md"
              >
                <RefreshCw className="h-4 w-4" /> Reload Application
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto text-xs font-semibold gap-2 h-10 border-border"
              >
                <Home className="h-4 w-4" /> Return to Home
              </Button>
            </div>

            {/* Error Diagnostics Toggle (Safe, user-friendly) */}
            {this.state.error && (
              <div className="pt-2 border-t border-border/60 text-left">
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center justify-between w-full font-medium"
                >
                  <span>Technical details</span>
                  {this.state.showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-3 rounded-lg bg-muted text-[10px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap max-h-32">
                    {this.state.error.name}: {this.state.error.message}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
