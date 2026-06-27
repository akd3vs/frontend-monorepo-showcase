/**
 * Property-based tests for ErrorBoundary component (Properties 12, 13, 14)
 *
 * Feature: enterprise-frontend-monorepo
 * Validates: Requirements 15.1, 15.5, 15.6
 */
// @vitest-environment jsdom
import React, { useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import * as fc from 'fast-check';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary, type ErrorBoundaryTelemetryEvent } from './index';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Helper: Component that throws on demand
function ThrowingChild({ shouldThrow, error }: { shouldThrow: boolean; error: Error }) {
  if (shouldThrow) {
    throw error;
  }
  return <div data-testid="child">OK</div>;
}

// Helper: Stateful sibling to verify state isolation
function StatefulSibling({ id, initialValue }: { id: string; initialValue: number }) {
  const [value] = useState(initialValue);
  return <div data-testid={`sibling-${id}`}>{value}</div>;
}

// Arbitrary: non-empty string for error messages
const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 200 });

// Arbitrary: valid boundary IDs
const boundaryIdArb = fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0);

// ISO 8601 date regex for validation
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

describe('Feature: enterprise-frontend-monorepo, Property 12: Error Boundary Telemetry Completeness', () => {
  /**
   * **Validates: Requirements 15.1**
   *
   * For any runtime error caught by any error boundary, the emitted telemetry event SHALL contain:
   * a non-empty errorMessage, a non-empty componentStack, a valid ISO 8601 timestamp,
   * and the boundaryId matching the boundary that caught the error.
   */
  it('emitted telemetry contains non-empty errorMessage, componentStack, valid ISO 8601 timestamp, and matching boundaryId', () => {
    // Suppress React error boundary console errors during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fc.assert(
      fc.property(nonEmptyStringArb, boundaryIdArb, (errorMsg, boundaryId) => {
        const telemetryEvents: ErrorBoundaryTelemetryEvent[] = [];
        const onError = (event: ErrorBoundaryTelemetryEvent) => {
          telemetryEvents.push(event);
        };

        const error = new Error(errorMsg);

        const { unmount } = render(
          <ErrorBoundary boundaryId={boundaryId} onError={onError}>
            <ThrowingChild shouldThrow={true} error={error} />
          </ErrorBoundary>,
        );

        // Should have emitted exactly one telemetry event
        expect(telemetryEvents.length).toBeGreaterThanOrEqual(1);

        const event = telemetryEvents[0]!;

        // errorMessage is non-empty
        expect(event.errorMessage).toBeTruthy();
        expect(event.errorMessage.length).toBeGreaterThan(0);

        // componentStack is non-empty
        expect(event.componentStack).toBeTruthy();
        expect(event.componentStack.length).toBeGreaterThan(0);

        // timestamp is valid ISO 8601
        expect(event.timestamp).toMatch(ISO_8601_REGEX);
        // Also verify it's a parseable date
        const parsed = new Date(event.timestamp);
        expect(parsed.getTime()).not.toBeNaN();

        // boundaryId matches the boundary that caught the error
        expect(event.boundaryId).toBe(boundaryId);

        unmount();
        cleanup();
      }),
      { numRuns: 100 },
    );

    consoleSpy.mockRestore();
  });
});

describe('Feature: enterprise-frontend-monorepo, Property 13: Error Boundary Escalation Threshold', () => {
  /**
   * **Validates: Requirements 15.5**
   *
   * For any error boundary instance, if it catches 3 or more errors within a 60-second window,
   * the boundary SHALL enter an escalated state. If fewer than 3 errors occur within 60 seconds,
   * the boundary SHALL NOT escalate.
   */
  it('3+ errors in 60s triggers escalation, fewer does not', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Arbitrary for number of errors (1 to 6) to test both below and at/above threshold
    const errorCountArb = fc.integer({ min: 1, max: 6 });

    fc.assert(
      fc.property(errorCountArb, boundaryIdArb, (errorCount, boundaryId) => {
        const telemetryEvents: ErrorBoundaryTelemetryEvent[] = [];
        const onError = (event: ErrorBoundaryTelemetryEvent) => {
          telemetryEvents.push(event);
        };

        // We use a wrapper that can toggle throwing
        let throwControl = { shouldThrow: false };

        function ControlledThrower() {
          if (throwControl.shouldThrow) {
            throw new Error('test error');
          }
          return <div data-testid="child">OK</div>;
        }

        const { rerender, container, unmount } = render(
          <ErrorBoundary boundaryId={boundaryId} onError={onError}>
            <ControlledThrower />
          </ErrorBoundary>,
        );

        // Trigger errors by causing throws and then retrying
        for (let i = 0; i < errorCount; i++) {
          // Trigger an error
          throwControl.shouldThrow = true;
          rerender(
            <ErrorBoundary boundaryId={boundaryId} onError={onError}>
              <ControlledThrower />
            </ErrorBoundary>,
          );

          // If we need more errors, simulate retry (reset error state)
          if (i < errorCount - 1) {
            // Click retry to reset state and allow another error
            const retryButton = container.querySelector(
              'button[aria-label="Retry: reload this section"]',
            );
            if (retryButton) {
              // Stop throwing briefly
              throwControl.shouldThrow = false;
              retryButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

              // Force a rerender in non-throwing state first
              rerender(
                <ErrorBoundary boundaryId={boundaryId} onError={onError}>
                  <ControlledThrower />
                </ErrorBoundary>,
              );
            }
          }
        }

        // Check escalation state via rendered output
        if (errorCount >= 3) {
          // Should show escalated UI (persistent error with reload suggestion)
          const escalatedText = container.textContent || '';
          expect(escalatedText).toContain('reload');
        } else {
          // Should show normal recovery UI (not escalated)
          const text = container.textContent || '';
          expect(text).not.toContain('reload the page');
        }

        unmount();
        cleanup();
      }),
      { numRuns: 100 },
    );

    consoleSpy.mockRestore();
  });
});

describe('Feature: enterprise-frontend-monorepo, Property 14: Error Boundary State Isolation', () => {
  /**
   * **Validates: Requirements 15.6**
   *
   * For any component tree where an error occurs within one subtree's error boundary,
   * the React state of sibling components outside that boundary SHALL remain unchanged
   * after the error is caught and the recovery UI is displayed.
   */
  it('sibling state is unchanged after error catch', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Arbitrary for initial sibling values
    const siblingValueArb = fc.integer({ min: -10000, max: 10000 });
    const siblingCountArb = fc.integer({ min: 1, max: 5 });

    fc.assert(
      fc.property(
        fc.array(siblingValueArb, { minLength: 1, maxLength: 5 }),
        boundaryIdArb,
        nonEmptyStringArb,
        (siblingValues, boundaryId, errorMsg) => {
          const error = new Error(errorMsg);

          function TestTree({ shouldThrow }: { shouldThrow: boolean }) {
            return (
              <div>
                {/* Siblings outside the error boundary */}
                {siblingValues.map((value, index) => (
                  <StatefulSibling key={index} id={String(index)} initialValue={value} />
                ))}
                {/* Error boundary wrapping a potentially failing child */}
                <ErrorBoundary boundaryId={boundaryId} onError={() => {}}>
                  <ThrowingChild shouldThrow={shouldThrow} error={error} />
                </ErrorBoundary>
              </div>
            );
          }

          // First render: no error - verify siblings render correctly
          const { rerender, container, unmount } = render(<TestTree shouldThrow={false} />);

          // Verify siblings have correct initial values
          for (let i = 0; i < siblingValues.length; i++) {
            const sibling = container.querySelector(`[data-testid="sibling-${i}"]`);
            expect(sibling).not.toBeNull();
            expect(sibling!.textContent).toBe(String(siblingValues[i]));
          }

          // Now trigger an error inside the boundary
          rerender(<TestTree shouldThrow={true} />);

          // Verify siblings STILL have the same values (state isolation)
          for (let i = 0; i < siblingValues.length; i++) {
            const sibling = container.querySelector(`[data-testid="sibling-${i}"]`);
            expect(sibling).not.toBeNull();
            expect(sibling!.textContent).toBe(String(siblingValues[i]));
          }

          // Verify the error boundary caught the error (showing recovery UI)
          const alertElement = container.querySelector('[role="alert"]');
          expect(alertElement).not.toBeNull();

          unmount();
          cleanup();
        },
      ),
      { numRuns: 100 },
    );

    consoleSpy.mockRestore();
  });
});
