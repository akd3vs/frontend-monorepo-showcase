import React from 'react';

interface SilentErrorBoundaryProps {
  /** Identifier for logging purposes */
  moduleName: string;
  children: React.ReactNode;
}

interface SilentErrorBoundaryState {
  hasError: boolean;
}

/**
 * An error boundary that catches errors silently — logs a warning and renders nothing.
 * Used for non-critical federated modules like the devtools panel.
 */
export class SilentErrorBoundary extends React.Component<
  SilentErrorBoundaryProps,
  SilentErrorBoundaryState
> {
  constructor(props: SilentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SilentErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn(
      `[SilentErrorBoundary] Module "${this.props.moduleName}" failed to load:`,
      error.message,
      errorInfo.componentStack,
    );
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render nothing — app continues without this module
      return null;
    }
    return this.props.children;
  }
}
