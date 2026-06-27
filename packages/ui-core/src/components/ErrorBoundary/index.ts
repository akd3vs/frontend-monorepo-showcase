import React from 'react';

import { colors, spacing, typography } from '../../theme';

export interface ErrorBoundaryTelemetryEvent {
  errorMessage: string;
  componentStack: string;
  timestamp: string; // ISO 8601
  boundaryId: string;
  recoveryAction?: 'retry' | 'reset' | 'navigate';
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  boundaryId: string;
  fallback?: React.ReactNode;
  onError?: (event: ErrorBoundaryTelemetryEvent) => void;
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
    const containerStyles: React.CSSProperties = {
      padding: spacing.xl,
      border: `1px solid ${colors.error[200]}`,
      borderRadius: '8px',
      backgroundColor: colors.error[50],
      fontFamily: typography.fontFamilies.sans,
      textAlign: 'center',
    };

    const titleStyles: React.CSSProperties = {
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.semibold,
      color: colors.error[800],
      margin: `0 0 ${spacing.sm} 0`,
    };

    const messageStyles: React.CSSProperties = {
      fontSize: typography.fontSizes.sm,
      color: colors.error[700],
      margin: `0 0 ${spacing.lg} 0`,
    };

    const buttonContainerStyles: React.CSSProperties = {
      display: 'flex',
      gap: spacing.sm,
      justifyContent: 'center',
      flexWrap: 'wrap',
    };

    const buttonBaseStyles: React.CSSProperties = {
      padding: `${spacing.sm} ${spacing.lg}`,
      borderRadius: '6px',
      fontSize: typography.fontSizes.sm,
      fontWeight: typography.fontWeights.medium,
      fontFamily: typography.fontFamilies.sans,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      transition: 'box-shadow 150ms ease',
    };

    const retryButtonStyles: React.CSSProperties = {
      ...buttonBaseStyles,
      backgroundColor: colors.primary[600],
      color: colors.text.inverse,
    };

    const resetButtonStyles: React.CSSProperties = {
      ...buttonBaseStyles,
      backgroundColor: 'transparent',
      color: colors.primary[700],
      border: `1px solid ${colors.primary[600]}`,
    };

    const navigateButtonStyles: React.CSSProperties = {
      ...buttonBaseStyles,
      backgroundColor: 'transparent',
      color: colors.text.secondary,
      border: `1px solid ${colors.neutral[300]}`,
    };

    return React.createElement('div', {
      role: 'alert',
      'aria-live': 'assertive',
      style: containerStyles,
    },
      React.createElement('h2', { style: titleStyles }, 'Something went wrong'),
      React.createElement('p', { style: messageStyles },
        this.state.error?.message || 'An unexpected error occurred'
      ),
      React.createElement('div', { style: buttonContainerStyles },
        React.createElement('button', {
          onClick: this.handleRetry,
          style: retryButtonStyles,
          'aria-label': 'Retry: reload this section',
          onFocus: this.focusHandler,
          onBlur: this.blurHandler,
        }, 'Retry'),
        React.createElement('button', {
          onClick: this.handleReset,
          style: resetButtonStyles,
          'aria-label': 'Reset: clear error and try again',
          onFocus: this.focusHandler,
          onBlur: this.blurHandler,
        }, 'Reset'),
        React.createElement('button', {
          onClick: this.handleNavigate,
          style: navigateButtonStyles,
          'aria-label': 'Navigate to a safe page',
          onFocus: this.focusHandler,
          onBlur: this.blurHandler,
        }, 'Go to Safety'),
      )
    );
  }

  private renderEscalatedUI(): React.ReactElement {
    const containerStyles: React.CSSProperties = {
      padding: spacing['2xl'],
      border: `2px solid ${colors.error[400]}`,
      borderRadius: '8px',
      backgroundColor: colors.error[50],
      fontFamily: typography.fontFamilies.sans,
      textAlign: 'center',
    };

    const titleStyles: React.CSSProperties = {
      fontSize: typography.fontSizes.xl,
      fontWeight: typography.fontWeights.bold,
      color: colors.error[900],
      margin: `0 0 ${spacing.sm} 0`,
    };

    const messageStyles: React.CSSProperties = {
      fontSize: typography.fontSizes.base,
      color: colors.error[800],
      margin: `0 0 ${spacing.lg} 0`,
    };

    const reloadButtonStyles: React.CSSProperties = {
      padding: `${spacing.md} ${spacing['2xl']}`,
      borderRadius: '6px',
      fontSize: typography.fontSizes.base,
      fontWeight: typography.fontWeights.semibold,
      fontFamily: typography.fontFamilies.sans,
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      backgroundColor: colors.error[600],
      color: colors.text.inverse,
      transition: 'box-shadow 150ms ease',
    };

    return React.createElement('div', {
      role: 'alert',
      'aria-live': 'assertive',
      style: containerStyles,
    },
      React.createElement('h2', { style: titleStyles }, 'Persistent Error'),
      React.createElement('p', { style: messageStyles },
        'This section has encountered repeated errors. Please reload the page to resolve the issue.'
      ),
      React.createElement('button', {
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.location.reload();
          }
        },
        style: reloadButtonStyles,
        'aria-label': 'Reload the page',
        onFocus: this.focusHandler,
        onBlur: this.blurHandler,
      }, 'Reload Page'),
    );
  }

  private focusHandler = (e: React.FocusEvent<HTMLButtonElement>): void => {
    if (e.target.matches(':focus-visible')) {
      e.target.style.boxShadow = `0 0 0 3px ${colors.primary[300]}`;
    }
  };

  private blurHandler = (e: React.FocusEvent<HTMLButtonElement>): void => {
    e.target.style.boxShadow = 'none';
  };
}
