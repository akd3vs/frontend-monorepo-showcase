import React from 'react';

import { ErrorBoundary } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

// Component that renders the recovery UI by simulating an error state
// We render the ErrorBoundary in its error state by using a child that throws
const ThrowingComponent: React.FC<{ message?: string }> = ({ message = 'Something went wrong!' }) => {
  throw new Error(message);
};

export const RecoveryUI: Story = {
  render: () => (
    <ErrorBoundary boundaryId="story-recovery">
      <ThrowingComponent message="Test error: component failed to render" />
    </ErrorBoundary>
  ),
};

// For escalated state, we need to simulate 3+ errors in 60s window
// We use a wrapper that forces the escalated state
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

// Normal state (no error)
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
