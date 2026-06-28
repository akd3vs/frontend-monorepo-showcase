import React from 'react';

import styles from './Skeleton.module.css';

/** Props for the Skeleton placeholder component. */
export interface SkeletonProps {
  /** The width of the skeleton element. Accepts CSS values (e.g., '200px', '100%'). */
  width?: string | number;
  /** The height of the skeleton element. Accepts CSS values (e.g., '20px', '100%'). */
  height?: string | number;
  /** The shape variant of the skeleton. 'text' for inline text, 'rectangular' for blocks, 'circular' for avatars. Defaults to 'text'. */
  variant?: 'text' | 'rectangular' | 'circular';
  /** Additional CSS class name to apply to the skeleton element. */
  className?: string;
  /** Accessible label for screen readers. Defaults to 'Loading...'. */
  'aria-label'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  className,
  'aria-label': ariaLabel,
}) => {
  const classNames = [
    styles['skeleton'],
    styles[variant],
    className,
  ].filter(Boolean).join(' ');

  // Custom dimensions override the defaults from CSS
  const inlineStyle: React.CSSProperties = {};
  if (width !== undefined) inlineStyle.width = width;
  if (height !== undefined) inlineStyle.height = height;

  return (
    <div
      className={classNames}
      style={Object.keys(inlineStyle).length > 0 ? inlineStyle : undefined}
      role="progressbar"
      aria-label={ariaLabel || 'Loading...'}
      aria-busy={true}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
};
