import React from 'react';

import { colors, spacing, typography } from '../../theme';

export interface TableColumn<T = unknown> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  ariaLabel: string;
  className?: string;
}

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: typography.fontFamilies.sans,
  fontSize: typography.fontSizes.sm,
  color: colors.text.primary,
};

const thStyles: React.CSSProperties = {
  textAlign: 'left',
  padding: `${spacing.md} ${spacing.lg}`,
  fontWeight: typography.fontWeights.semibold,
  fontSize: typography.fontSizes.xs,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: colors.text.secondary,
  backgroundColor: colors.surface,
  borderBottom: `2px solid ${colors.neutral[200]}`,
};

const tdStyles: React.CSSProperties = {
  padding: `${spacing.md} ${spacing.lg}`,
  borderBottom: `1px solid ${colors.neutral[100]}`,
  verticalAlign: 'middle',
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  ariaLabel,
  className,
}: TableProps<T>): React.ReactElement {
  const headerCells = columns.map((col) =>
    React.createElement('th', {
      key: col.key,
      scope: 'col',
      style: thStyles,
    }, col.header)
  );

  const headerRow = React.createElement('tr', { key: 'header-row' }, ...headerCells);
  const thead = React.createElement('thead', null, headerRow);

  const bodyRows = data.map((row, rowIndex) => {
    const cells = columns.map((col) => {
      const value = row[col.key];
      const content = col.render ? col.render(value, row) : String(value ?? '');
      return React.createElement('td', {
        key: `${col.key}-${rowIndex}`,
        style: tdStyles,
      }, content);
    });

    return React.createElement('tr', { key: `row-${rowIndex}` }, ...cells);
  });

  const tbody = React.createElement('tbody', null, ...bodyRows);

  const responsiveWrapperStyles: React.CSSProperties = {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };

  const table = React.createElement('table', {
    role: 'table',
    'aria-label': ariaLabel,
    style: tableStyles,
    className,
  }, thead, tbody);

  return React.createElement('div', {
    style: responsiveWrapperStyles,
    role: 'region',
    'aria-label': `${ariaLabel} (scrollable)`,
    tabIndex: 0,
  }, table);
}
