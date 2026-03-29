import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global error boundary — catches render errors from lazy-loaded pages
 * (e.g. chunk load failure when offline) and shows a reload prompt
 * instead of a white screen.
 */
class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="text-center max-w-sm space-y-4">
            <div className="text-4xl">🐾</div>
            <h1 className="text-xl font-bold text-foreground">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-sm text-muted-foreground">
              Die Seite konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
