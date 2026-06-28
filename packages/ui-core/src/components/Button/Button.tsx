import React from 'react';

import styles from './Button.module.css';

/** Props for the Button component. */
export interface ButtonProps {
  /** The content to render inside the button. */
  children: React.ReactNode;
  /** Callback invoked when the button is clicked. Ignored when disabled. */
  onClick?: () => void;
  /** Whether the button is in a disabled state. Prevents interaction and applies muted styling. */
  disabled?: boolean;
  /** The visual style variant of the button. Defaults to 'primary'. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** The size of the button controlling padding and font size. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** The HTML button type attribute. Defaults to 'button'. */
  type?: 'button' | 'submit' | 'reset';
  /** Accessible label for screen readers when button text is not descriptive enough. */
  'aria-label'?: string;
  /** Additional CSS class name to apply to the button element. */
  className?: string;
}

const variantClassMap: Record<string, string> = {
  primary: styles['variantPrimary']!,
  secondary: styles['variantSecondary']!,
  ghost: styles['variantGhost']!,
};

const sizeClassMap: Record<string, string> = {
  sm: styles['sizeSm']!,
  md: styles['sizeMd']!,
  lg: styles['sizeLg']!,
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
  const classNames = [
    styles['button'],
    variantClassMap[variant],
    sizeClassMap[size],
    disabled && styles['disabled'],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={classNames}
    >
      {children}
    </button>
  );
};
