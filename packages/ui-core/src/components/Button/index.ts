import React from 'react';

import { colors, spacing, typography } from '../../theme';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  className?: string;
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.fontSizes.sm,
  },
  md: {
    padding: `${spacing.sm} ${spacing.lg}`,
    fontSize: typography.fontSizes.base,
  },
  lg: {
    padding: `${spacing.md} ${spacing.xl}`,
    fontSize: typography.fontSizes.lg,
  },
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.primary[600],
    color: colors.text.inverse,
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: colors.primary[700],
    border: `2px solid ${colors.primary[600]}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.text.primary,
    border: '2px solid transparent',
  },
};

const disabledStyles: React.CSSProperties = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  type = 'button',
  'aria-label': ariaLabel,
  className,
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamilies.sans,
    fontWeight: typography.fontWeights.medium,
    lineHeight: typography.lineHeights.normal,
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 150ms ease, box-shadow 150ms ease, border-color 150ms ease',
    outline: 'none',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...(disabled ? disabledStyles : {}),
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // Native button already handles Enter/Space, but we ensure consistent behavior
      if (disabled) {
        e.preventDefault();
      }
    }
  };

  return React.createElement('button', {
    type,
    disabled,
    onClick: disabled ? undefined : onClick,
    onKeyDown: handleKeyDown,
    'aria-label': ariaLabel,
    'aria-disabled': disabled,
    className,
    style: baseStyles,
    // Focus ring styles applied via CSS-in-JS approach using onFocus/onBlur
    onFocus: (e: React.FocusEvent<HTMLButtonElement>) => {
      // Only show focus ring for keyboard navigation (focus-visible behavior)
      if (e.target.matches(':focus-visible')) {
        e.target.style.boxShadow = `0 0 0 3px ${colors.primary[300]}`;
      }
    },
    onBlur: (e: React.FocusEvent<HTMLButtonElement>) => {
      e.target.style.boxShadow = 'none';
    },
  }, children);
};
