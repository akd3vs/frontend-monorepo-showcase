import React from 'react';
/** Telemetry event emitted when an error is caught or a recovery action is taken. */
export interface ErrorBoundaryTelemetryEvent {
    /** The error message string from the caught Error object. */
    errorMessage: string;
    /** The React component stack trace showing the component tree at the time of error. */
    componentStack: string;
    /** ISO 8601 timestamp of when the error occurred or recovery action was taken. */
    timestamp: string;
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
export declare class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    private handleRetry;
    private handleReset;
    private handleNavigate;
    render(): React.ReactNode;
    private renderRecoveryUI;
    private renderEscalatedUI;
}
export {};
//# sourceMappingURL=ErrorBoundary.d.ts.map