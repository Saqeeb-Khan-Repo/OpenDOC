import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, LayoutDashboard, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  name: string;
  fallbackRoute?: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[DocProEditor ${this.props.name} Boundary]:`, error?.message, {
      componentStack: errorInfo.componentStack?.slice(0, 200),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleNavigateFallback = () => {
    window.location.href = this.props.fallbackRoute || '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 min-h-[300px] h-full flex items-center justify-center p-6 bg-background text-foreground select-none">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-xl space-y-5 text-center">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-foreground">
                {this.props.name} encountered an issue
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected state was encountered in this view. You can reload this view or return to your workspace without losing other work.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                size="sm"
                onClick={this.handleRetry}
                className="text-xs font-bold gap-1.5 h-9"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Retry {this.props.name}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleNavigateFallback}
                className="text-xs font-semibold gap-1.5 h-9"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
