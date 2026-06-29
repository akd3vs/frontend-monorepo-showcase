import React from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Table } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Table> = {
  title: 'Components/Table/Interactions',
  component: Table,
};

export default meta;
type Story = StoryObj<typeof Table>;

// ─── Helper: Sortable Table ─────────────────────────────────────────────────

interface SortableTableProps {
  darkMode?: boolean;
}

function SortableTable({ darkMode }: SortableTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      return () => {
        document.documentElement.removeAttribute('data-theme');
      };
    }
  }, [darkMode]);

  const data = [
    { name: 'Alice', role: 'Admin', status: 'Active' },
    { name: 'Bob', role: 'Editor', status: 'Inactive' },
    { name: 'Charlie', role: 'Viewer', status: 'Active' },
    { name: 'Diana', role: 'Admin', status: 'Active' },
  ];

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn as keyof typeof a];
      const bVal = b[sortColumn as keyof typeof b];
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <Table ariaLabel="Sortable team members">
      <Table.Header>
        <Table.Row>
          {['name', 'role', 'status'].map((col) => (
            <Table.Cell header key={col}>
              <button
                type="button"
                onClick={() => handleSort(col)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSort(col);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'inherit',
                  fontSize: 'inherit',
                  color: 'inherit',
                  textTransform: 'inherit',
                  letterSpacing: 'inherit',
                  padding: 0,
                }}
                aria-label={`Sort by ${col}`}
                aria-sort={
                  sortColumn === col
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {col.charAt(0).toUpperCase() + col.slice(1)}
                {sortColumn === col && (sortDirection === 'asc' ? ' ↑' : ' ↓')}
              </button>
            </Table.Cell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedData.map((row, i) => (
          <Table.Row key={i}>
            <Table.Cell>{row.name}</Table.Cell>
            <Table.Cell>{row.role}</Table.Cell>
            <Table.Cell>{row.status}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

// ─── Row Hover Highlight ─────────────────────────────────────────────────────

export const RowHoverHighlight: Story = {
  render: () => <SortableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('row');
    // First data row (index 1, since index 0 is header row)
    const dataRow = rows[1]!;

    const bgBefore = window.getComputedStyle(dataRow).backgroundColor;

    await userEvent.hover(dataRow);

    const bgAfter = window.getComputedStyle(dataRow).backgroundColor;
    // Background should change on hover
    expect(bgAfter).not.toBe(bgBefore);
  },
};

// ─── Header Click Sort ───────────────────────────────────────────────────────

export const HeaderClickSort: Story = {
  render: () => <SortableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Click the "Name" sort button
    const sortButton = canvas.getByRole('button', { name: 'Sort by name' });
    await userEvent.click(sortButton);

    // After sorting ascending, first data cell should be Alice (A comes first)
    const rows = canvas.getAllByRole('row');
    const firstDataRow = rows[1]!;
    expect(firstDataRow).toHaveTextContent('Alice');

    // Verify sort indicator is visible
    expect(sortButton).toHaveTextContent('↑');

    // Click again to toggle to descending
    await userEvent.click(sortButton);
    expect(sortButton).toHaveTextContent('↓');

    // After descending sort, first should be Diana
    const updatedRows = canvas.getAllByRole('row');
    const firstRowAfterDesc = updatedRows[1]!;
    expect(firstRowAfterDesc).toHaveTextContent('Diana');
  },
};

// ─── Keyboard Enter Sort ─────────────────────────────────────────────────────

export const KeyboardEnterSort: Story = {
  render: () => <SortableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = canvas.getByRole('button', { name: 'Sort by name' });
    sortButton.focus();

    await userEvent.keyboard('{Enter}');

    // Should sort ascending
    expect(sortButton).toHaveTextContent('↑');
    const rows = canvas.getAllByRole('row');
    expect(rows[1]!).toHaveTextContent('Alice');
  },
};

// ─── Tab Focus Navigation ────────────────────────────────────────────────────

export const TabFocusNavigation: Story = {
  render: () => <SortableTable />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameSort = canvas.getByRole('button', { name: 'Sort by name' });
    const roleSort = canvas.getByRole('button', { name: 'Sort by role' });
    const statusSort = canvas.getByRole('button', { name: 'Sort by status' });

    // Tab through the interactive header cells
    await userEvent.tab();
    // First focusable is the table wrapper (tabIndex=0), then sort buttons
    await userEvent.tab();
    expect(nameSort).toHaveFocus();

    await userEvent.tab();
    expect(roleSort).toHaveFocus();

    await userEvent.tab();
    expect(statusSort).toHaveFocus();
  },
};

// ─── Dark Mode Interactions ──────────────────────────────────────────────────

export const DarkModeRowHoverHighlight: Story = {
  render: () => <SortableTable darkMode />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rows = canvas.getAllByRole('row');
    const dataRow = rows[1]!;

    const bgBefore = window.getComputedStyle(dataRow).backgroundColor;

    await userEvent.hover(dataRow);

    const bgAfter = window.getComputedStyle(dataRow).backgroundColor;
    expect(bgAfter).not.toBe(bgBefore);
  },
};

export const DarkModeHeaderClickSort: Story = {
  render: () => <SortableTable darkMode />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = canvas.getByRole('button', { name: 'Sort by name' });
    await userEvent.click(sortButton);

    expect(sortButton).toHaveTextContent('↑');
    const rows = canvas.getAllByRole('row');
    expect(rows[1]!).toHaveTextContent('Alice');

    // Toggle to descending
    await userEvent.click(sortButton);
    expect(sortButton).toHaveTextContent('↓');
  },
};

export const DarkModeKeyboardEnterSort: Story = {
  render: () => <SortableTable darkMode />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const sortButton = canvas.getByRole('button', { name: 'Sort by name' });
    sortButton.focus();

    await userEvent.keyboard('{Enter}');

    expect(sortButton).toHaveTextContent('↑');
  },
};

export const DarkModeTabFocusNavigation: Story = {
  render: () => <SortableTable darkMode />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameSort = canvas.getByRole('button', { name: 'Sort by name' });
    const roleSort = canvas.getByRole('button', { name: 'Sort by role' });

    // Tab to table wrapper, then sort buttons
    await userEvent.tab();
    await userEvent.tab();
    expect(nameSort).toHaveFocus();

    await userEvent.tab();
    expect(roleSort).toHaveFocus();
  },
};
