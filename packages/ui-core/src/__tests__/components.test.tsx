import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { axe } from 'vitest-axe';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Skeleton } from '../components/Skeleton';
import { Table } from '../components/Table';

// ─── Button Component ───────────────────────────────────────────────────────

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeDefined();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('sets aria-disabled when disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('aria-disabled')).toBe('true');
  });

  it('applies custom aria-label', () => {
    render(<Button aria-label="Submit form">Go</Button>);
    expect(screen.getByLabelText('Submit form')).toBeDefined();
  });

  it('defaults to type="button"', () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('passes axe-core accessibility checks', async () => {
    const { container } = render(<Button>Accessible Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('passes axe-core checks when disabled', async () => {
    const { container } = render(<Button disabled>Disabled Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Card Component ─────────────────────────────────────────────────────────

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Card body content</Card>);
    expect(screen.getByText('Card body content')).toBeDefined();
  });

  it('renders title when provided', () => {
    render(<Card title="My Card">Content</Card>);
    expect(screen.getByText('My Card')).toBeDefined();
  });

  it('renders footer when provided', () => {
    render(<Card footer={<span>Footer text</span>}>Content</Card>);
    expect(screen.getByText('Footer text')).toBeDefined();
  });

  it('uses article role with aria-label from title', () => {
    render(<Card title="Finances">Data</Card>);
    expect(screen.getByRole('article')).toBeDefined();
    expect(screen.getByRole('article').getAttribute('aria-label')).toBe('Finances');
  });

  it('uses custom aria-label when provided', () => {
    render(
      <Card aria-label="Custom label" title="Title">
        Content
      </Card>,
    );
    expect(screen.getByRole('article').getAttribute('aria-label')).toBe('Custom label');
  });

  it('passes axe-core accessibility checks', async () => {
    const { container } = render(
      <Card title="Accessible Card" footer={<span>Footer</span>}>
        Card content here
      </Card>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Table Component ────────────────────────────────────────────────────────

describe('Table', () => {
  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'value', header: 'Value' },
  ];

  const data = [
    { name: 'Alice', value: '100' },
    { name: 'Bob', value: '200' },
  ];

  it('renders table with correct role', () => {
    render(<Table columns={columns} data={data} ariaLabel="Test table" />);
    expect(screen.getByRole('table')).toBeDefined();
  });

  it('renders column headers with scope="col"', () => {
    render(<Table columns={columns} data={data} ariaLabel="Test table" />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    expect(headers[0]!.textContent).toBe('Name');
    expect(headers[1]!.textContent).toBe('Value');
    expect(headers[0]!.getAttribute('scope')).toBe('col');
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} ariaLabel="Test table" />);
    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(4);
    expect(cells[0]!.textContent).toBe('Alice');
    expect(cells[1]!.textContent).toBe('100');
  });

  it('renders custom cell content via render function', () => {
    const columnsWithRender = [
      { key: 'name', header: 'Name', render: (val: unknown) => `**${val}**` },
    ];
    render(
      <Table columns={columnsWithRender} data={[{ name: 'Test' }]} ariaLabel="Custom render" />,
    );
    expect(screen.getByText('**Test**')).toBeDefined();
  });

  it('has aria-label on the table', () => {
    render(<Table columns={columns} data={data} ariaLabel="Stock prices" />);
    expect(screen.getByRole('table').getAttribute('aria-label')).toBe('Stock prices');
  });

  it('wraps table in scrollable region', () => {
    render(<Table columns={columns} data={data} ariaLabel="Scrollable" />);
    const region = screen.getByRole('region');
    expect(region.getAttribute('aria-label')).toBe('Scrollable (scrollable)');
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  it('passes axe-core accessibility checks', async () => {
    const { container } = render(
      <Table columns={columns} data={data} ariaLabel="Accessible table" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── Skeleton Component ─────────────────────────────────────────────────────

describe('Skeleton', () => {
  it('renders with progressbar role', () => {
    render(<Skeleton />);
    expect(screen.getByRole('progressbar')).toBeDefined();
  });

  it('has default aria-label "Loading..."', () => {
    render(<Skeleton />);
    expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe('Loading...');
  });

  it('uses custom aria-label', () => {
    render(<Skeleton aria-label="Loading profile" />);
    expect(screen.getByRole('progressbar').getAttribute('aria-label')).toBe('Loading profile');
  });

  it('sets aria-busy to true', () => {
    render(<Skeleton />);
    expect(screen.getByRole('progressbar').getAttribute('aria-busy')).toBe('true');
  });

  it('supports different variants', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const el = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(el.style.borderRadius).toBe('50%');
  });

  it('passes axe-core accessibility checks', async () => {
    const { container } = render(<Skeleton aria-label="Loading content" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ─── ErrorBoundary Component ────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  // Suppress console.error from React error boundary in test output
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      const msg = String(args[0]);
      if (msg.includes('Error: Uncaught') || msg.includes('The above error')) return;
      originalConsoleError(...args);
    };
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) throw new Error('Test error');
    return <div>Child rendered</div>;
  };

  it('renders children when no error', () => {
    render(
      <ErrorBoundary boundaryId="test-1">
        <div>Content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('shows recovery UI when child throws', () => {
    render(
      <ErrorBoundary boundaryId="test-2">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Test error')).toBeDefined();
  });

  it('displays retry, reset, and navigate buttons', () => {
    render(
      <ErrorBoundary boundaryId="test-3">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /reset/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /navigate/i })).toBeDefined();
  });

  it('calls onError with telemetry event when error is caught', () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary boundaryId="boundary-x" onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledOnce();
    const event = onError.mock.calls[0]![0];
    expect(event.errorMessage).toBe('Test error');
    expect(event.boundaryId).toBe('boundary-x');
    expect(event.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('has role="alert" on error UI', () => {
    render(
      <ErrorBoundary boundaryId="test-alert">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('passes axe-core accessibility checks in error state', async () => {
    const { container } = render(
      <ErrorBoundary boundaryId="test-a11y">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary boundaryId="test-fallback" fallback={<div>Custom error UI</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom error UI')).toBeDefined();
  });
});
