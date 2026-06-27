import React from 'react';

import { colors, spacing, typography } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className,
  'aria-label': ariaLabel,
}) => {
  const containerStyles: React.CSSProperties = {
    backgroundColor: colors.background,
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    padding: `${spacing.lg} ${spacing.xl}`,
    borderBottom: `1px solid ${colors.neutral[200]}`,
    fontFamily: typography.fontFamilies.sans,
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    margin: 0,
  };

  const bodyStyles: React.CSSProperties = {
    padding: spacing.xl,
    fontFamily: typography.fontFamilies.sans,
    fontSize: typography.fontSizes.base,
    color: colors.text.primary,
    lineHeight: typography.lineHeights.normal,
  };

  const footerStyles: React.CSSProperties = {
    padding: `${spacing.md} ${spacing.xl}`,
    borderTop: `1px solid ${colors.neutral[200]}`,
    backgroundColor: colors.surface,
    fontFamily: typography.fontFamilies.sans,
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  };

  const elements: React.ReactNode[] = [];

  if (title) {
    elements.push(
      React.createElement('header', { key: 'header', style: headerStyles },
        React.createElement('h3', { style: { margin: 0, fontSize: 'inherit', fontWeight: 'inherit' } }, title)
      )
    );
  }

  elements.push(
    React.createElement('div', { key: 'body', style: bodyStyles }, children)
  );

  if (footer) {
    elements.push(
      React.createElement('footer', { key: 'footer', style: footerStyles }, footer)
    );
  }

  return React.createElement('article', {
    className,
    'aria-label': ariaLabel || title,
    style: containerStyles,
  }, ...elements);
};
