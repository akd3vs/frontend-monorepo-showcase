import React from 'react';

import { colors } from '../../theme';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
  'aria-label'?: string;
}

// Keyframe animation injected once into the document
let styleInjected = false;
const ANIMATION_NAME = 'ui-core-skeleton-pulse';

function injectStyles(): void {
  if (styleInjected || typeof document === 'undefined') return;

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes ${ANIMATION_NAME} {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
  `;
  document.head.appendChild(styleEl);
  styleInjected = true;
}

const variantDimensions = {
  text: { width: '100%', height: '1em', borderRadius: '4px' },
  rectangular: { width: '100%', height: '120px', borderRadius: '4px' },
  circular: { width: '40px', height: '40px', borderRadius: '50%' },
} as const;

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  variant = 'text',
  className,
  'aria-label': ariaLabel,
}) => {
  // Inject animation styles on first render
  injectStyles();

  const defaults = variantDimensions[variant];

  const styles: React.CSSProperties = {
    display: 'block',
    backgroundColor: colors.neutral[200],
    width: width ?? defaults.width,
    height: height ?? defaults.height,
    borderRadius: defaults.borderRadius,
    animation: `${ANIMATION_NAME} 1.5s ease-in-out infinite`,
  };

  return React.createElement('div', {
    className,
    style: styles,
    role: 'progressbar',
    'aria-label': ariaLabel || 'Loading...',
    'aria-busy': true,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
  });
};
