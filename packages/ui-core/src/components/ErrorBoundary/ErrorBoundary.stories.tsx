import React from 'react';

import { ErrorBoundary } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// Component that throws to trigger the error boundary
const ThrowingComponent: React.FC<{ message?: string }> = ({ message = 'Something went wrong!' }) => {
  throw new Error(message);
};

// ─── Recovery UI (standard error state) ──────────────────────────────────────

export const RecoveryUI: Story = {
  render: () => (
    <ErrorBoundary boundaryId="story-recovery">
      <ThrowingComponent message="Test error: component failed to render" />
    </ErrorBoundary>
  ),
};

// ─── Escalated Error State ───────────────────────────────────────────────────

// For escalated state, we simulate 3+ errors in 60s window
class EscalatedErrorBoundary extends ErrorBoundary {
  constructor(props: ConstructorParameters<typeof ErrorBoundary>[0]) {
    super(props);
    // Force the escalated state for the story
    this.state = {
      hasError: true,
      error: new Error('Repeated failure'),
      errorInfo: null,
      errorCount: 3,
      firstErrorTimestamp: Date.now(),
      escalated: true,
    };
  }
}

export const EscalatedState: Story = {
  render: () => (
    <EscalatedErrorBoundary boundaryId="story-escalated">
      <div>This content will not be shown</div>
    </EscalatedErrorBoundary>
  ),
};

// ─── Normal State (no error) ─────────────────────────────────────────────────

export const NormalState: Story = {
  render: () => (
    <ErrorBoundary boundaryId="story-normal">
      <div style={{ padding: '16px', fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Protected Content</h3>
        <p style={{ margin: 0 }}>
          This content is wrapped in an ErrorBoundary. If it throws, the recovery UI is shown.
        </p>
      </div>
    </ErrorBoundary>
  ),
};

// ─── Custom Fallback ─────────────────────────────────────────────────────────

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary
      boundaryId="story-custom-fallback"
      fallback={
        <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'sans-serif', color: '#dc2626' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Custom Error UI</h3>
          <p style={{ margin: 0 }}>This is a custom fallback provided via the fallback prop.</p>
        </div>
      }
    >
      <ThrowingComponent message="Error caught with custom fallback" />
    </ErrorBoundary>
  ),
};
