import * as React from "react";
import DogMap from "@/components/DogMap";
import { RefreshCw, MapPin } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  errorCount: number;
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, errorCount: 0 };

  static getDerivedStateFromError(): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Map render error:", error);
    this.setState((prev) => ({ errorCount: prev.errorCount + 1 }));
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center gap-4 text-center min-h-[300px]">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <MapPin className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Map temporarily unavailable
            </h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              The map failed to load. You can still browse the dogs list, or try reloading the map.
            </p>
          </div>
          {/* Only show retry if not failed too many times */}
          {this.state.errorCount < 3 && (
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw className="w-4 h-4" />
              Retry map
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

type DogMapProps = React.ComponentProps<typeof DogMap>;

export default function SafeDogMap(props: DogMapProps) {
  return (
    <MapErrorBoundary>
      <DogMap {...props} />
    </MapErrorBoundary>
  );
}
