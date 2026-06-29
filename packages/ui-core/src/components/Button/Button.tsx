import React from 'react';

import styles from './Button.module.css';

/** Props for the Button component. Extends native button attributes for full HTML compatibility. */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** The content to render inside the button. */
  children: React.ReactNode;
  /** The visual style variant of the button. Defaults to 'primary'. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** The size of the button controlling padding and font size. Defaults to 'md'. */
  size?: 'sm' | 'md' | 'lg';
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
  className,
  ...rest
}) => {
  const classNames = [
    styles['button'],
    variantClassMap[variant],
    sizeClassMap[size],
    disabled && styles['disabled'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      className={classNames}
      {...rest}
    >
      {children}
    </button>
  );
};
