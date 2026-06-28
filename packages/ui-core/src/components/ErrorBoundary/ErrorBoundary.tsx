import React from 'react';

import styles from './ErrorBoundary.module.css';

/** Telemetry event emitted when an error is caught or a recovery action is taken. */
export interface ErrorBoundaryTelemetryEvent {
  /** The error message string from the caught Error object. */
  errorMessage: string;
  /** The React component stack trace showing the component tree at the time of error. */
  componentStack: string;
  /** ISO 8601 timestamp of when the error occurred or recovery action was taken. */
  timestamp: string; // ISO 8601
  /** Unique identifier for this error boundary instance, used for telemetry correlation. */
  boundaryId: string;
  /** The recovery action taken by the user, if any. */
  recoveryAction?: 'retry' | 'reset' | 'navigate';
}

/** Props for the ErrorBoundary component. */
export interface ErrorBoundaryProps {
  /** The content to protect with error boundary handling. */
  children: React.ReactNode;
  /** Unique identifier for this boundary instance, used in telemetry events. */
  boundaryId: string;
  /** Optional custom fallback UI to display when an error is caught instead of the default recovery UI. */
  fallback?: React.ReactNode;
  /** Callback invoked when an error is caught or a recovery action is taken. Receives a telemetry event. */
  onError?: (event: ErrorBoundaryTelemetryEvent) => void;
  /** Callback invoked when the user clicks the 'Go to Safety' navigation button. */
  onNavigate?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
  firstErrorTimestamp: number;
  escalated: boolean;
}

const ESCALATION_THRESHOLD = 3;
const ESCALATION_WINDOW_MS = 60_000; // 60 seconds

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      firstErrorTimestamp: 0,
      escalated: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const now = Date.now();

    this.setState((prevState) => {
      // Calculate new error count within escalation window
      let newCount = prevState.errorCount;
      let firstTimestamp = prevState.firstErrorTimestamp;

      if (firstTimestamp === 0 || now - firstTimestamp > ESCALATION_WINDOW_MS) {
        // Start a new window
        newCount = 1;
        firstTimestamp = now;
      } else {
        newCount += 1;
      }

      const escalated = newCount >= ESCALATION_THRESHOLD;

      return {
        errorInfo,
        errorCount: newCount,
        firstErrorTimestamp: firstTimestamp,
        escalated,
      };
    });

    // Emit telemetry
    const telemetryEvent: ErrorBoundaryTelemetryEvent = {
      errorMessage: error.message,
      componentStack: errorInfo.componentStack || '',
      timestamp: new Date(now).toISOString(),
      boundaryId: this.props.boundaryId,
    };

    this.props.onError?.(telemetryEvent);
  }

  private handleRetry = (): void => {
    // Emit telemetry with recovery action
    if (this.state.error) {
      const event: ErrorBoundaryTelemetryEvent = {
        errorMessage: this.state.error.message,
        componentStack: this.state.errorInfo?.componentStack || '',
        timestamp: new Date().toISOString(),
        boundaryId: this.props.boundaryId,
        recoveryAction: 'retry',
      };
      this.props.onError?.(event);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReset = (): void => {
    // Emit telemetry with recovery action
    if (this.state.error) {
      const event: ErrorBoundaryTelemetryEvent = {
        errorMessage: this.state.error.message,
        componentStack: this.state.errorInfo?.componentStack || '',
        timestamp: new Date().toISOString(),
        boundaryId: this.props.boundaryId,
        recoveryAction: 'reset',
      };
      this.props.onError?.(event);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      firstErrorTimestamp: 0,
      escalated: false,
    });
  };

  private handleNavigate = (): void => {
    // Emit telemetry with recovery action
    if (this.state.error) {
      const event: ErrorBoundaryTelemetryEvent = {
        errorMessage: this.state.error.message,
        componentStack: this.state.errorInfo?.componentStack || '',
        timestamp: new Date().toISOString(),
        boundaryId: this.props.boundaryId,
        recoveryAction: 'navigate',
      };
      this.props.onError?.(event);
    }

    this.props.onNavigate?.();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    if (this.state.escalated) {
      return this.renderEscalatedUI();
    }

    return this.renderRecoveryUI();
  }

  private renderRecoveryUI(): React.ReactElement {
    return React.createElement('div', {
      role: 'alert',
      'aria-live': 'assertive',
      className: styles['container'],
    },
      React.createElement('h2', { className: styles['title'] }, 'Something went wrong'),
      React.createElement('p', { className: styles['message'] },
        this.state.error?.message || 'An unexpected error occurred'
      ),
      React.createElement('div', { className: styles['buttonContainer'] },
        React.createElement('button', {
          onClick: this.handleRetry,
          className: [styles['buttonBase'], styles['retryButton']].join(' '),
          'aria-label': 'Retry: reload this section',
        }, 'Retry'),
        React.createElement('button', {
          onClick: this.handleReset,
          className: [styles['buttonBase'], styles['resetButton']].join(' '),
          'aria-label': 'Reset: clear error and try again',
        }, 'Reset'),
        React.createElement('button', {
          onClick: this.handleNavigate,
          className: [styles['buttonBase'], styles['navigateButton']].join(' '),
          'aria-label': 'Navigate to a safe page',
        }, 'Go to Safety'),
      )
    );
  }

  private renderEscalatedUI(): React.ReactElement {
    return React.createElement('div', {
      role: 'alert',
      'aria-live': 'assertive',
      className: styles['containerEscalated'],
    },
      React.createElement('h2', { className: styles['titleEscalated'] }, 'Persistent Error'),
      React.createElement('p', { className: styles['messageEscalated'] },
        'This section has encountered repeated errors. Please reload the page to resolve the issue.'
      ),
      React.createElement('button', {
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        },
        className: styles['reloadButton'],
        'aria-label': 'Reload the page',
      }, 'Reload Page'),
    );
  }
}
