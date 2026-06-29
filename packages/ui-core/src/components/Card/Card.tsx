import React from 'react';

import styles from './Card.module.css';
import { CardContext, useCardContext } from './CardContext';

// ─── Props Interfaces ────────────────────────────────────────────────────────

/** Props for the root Card compound component. */
export interface CardRootProps {
  /** Children should be Card.Header, Card.Body, Card.Footer, and/or Card.Actions. */
  children: React.ReactNode;
  /** Additional CSS class name to apply to the card article element. */
  className?: string;
  /** Accessible label for the card landmark. */
  'aria-label'?: string;
}

/** Props for the Card.Header sub-component. */
export interface CardHeaderProps {
  /** Content rendered inside the card header section. */
  children: React.ReactNode;
  /** Additional CSS class name to apply to the header element. */
  className?: string;
}

/** Props for the Card.Body sub-component. */
export interface CardBodyProps {
  /** Content rendered inside the card body section. */
  children: React.ReactNode;
  /** Additional CSS class name to apply to the body container. */
  className?: string;
}

/** Props for the Card.Footer sub-component. */
export interface CardFooterProps {
  /** Content rendered inside the card footer section. */
  children: React.ReactNode;
  /** Additional CSS class name to apply to the footer element. */
  className?: string;
}

/** Props for the Card.Actions sub-component. */
export interface CardActionsProps {
  /** Action elements (buttons, links) rendered with flex layout. */
  children: React.ReactNode;
  /** Additional CSS class name to apply to the actions container. */
  className?: string;
}

/** Legacy prop-based Card API preserved for backward compatibility. */
export interface CardProps {
  /** The main body content of the card. */
  children: React.ReactNode;
  /** Optional title displayed in the card header. */
  title?: string;
  /** Optional footer content rendered below the body. */
  footer?: React.ReactNode;
  /** Additional CSS class name to apply to the card element. */
  className?: string;
  /** Accessible label for the card. Falls back to title if not provided. */
  'aria-label'?: string;
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

const VALID_CARD_CHILDREN = new Set<React.FC<unknown> | React.ComponentType<unknown>>();

function isValidCardChild(child: React.ReactElement): boolean {
  return VALID_CARD_CHILDREN.has(child.type as React.FC<unknown>);
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function CardHeader({ children, className }: CardHeaderProps): React.ReactElement {
  useCardContext(); // Validates we're inside Card

  const headerClassName = [styles['header'], className].filter(Boolean).join(' ');

  return (
    <header className={headerClassName}>
      {children}
    </header>
  );
}

function CardBody({ children, className }: CardBodyProps): React.ReactElement {
  useCardContext(); // Validates we're inside Card

  const bodyClassName = [styles['body'], className].filter(Boolean).join(' ');

  return (
    <div className={bodyClassName}>
      {children}
    </div>
  );
}

function CardFooter({ children, className }: CardFooterProps): React.ReactElement {
  useCardContext(); // Validates we're inside Card

  const footerClassName = [styles['footer'], className].filter(Boolean).join(' ');

  return (
    <footer className={footerClassName}>
      {children}
    </footer>
  );
}

function CardActions({ children, className }: CardActionsProps): React.ReactElement {
  useCardContext(); // Validates we're inside Card

  const actionsClassName = [styles['actions'], className].filter(Boolean).join(' ');

  return (
    <div className={actionsClassName}>
      {children}
    </div>
  );
}

// ─── Root Component ──────────────────────────────────────────────────────────

function CardRoot({
  children,
  className,
  'aria-label': ariaLabel,
}: CardRootProps): React.ReactElement {
  if (process.env.NODE_ENV !== 'production') {
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && !isValidCardChild(child)) {
        console.warn(
          '[Card] Invalid child component rendered. Expected Card.Header, Card.Body, Card.Footer, or Card.Actions.'
        );
      }
    });
  }

  // Detect presence of header and footer for context
  let hasHeader = false;
  let hasFooter = false;
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === CardHeader) hasHeader = true;
      if (child.type === CardFooter) hasFooter = true;
    }
  });

  const cardClassName = [styles['card'], className].filter(Boolean).join(' ');

  return (
    <CardContext.Provider value={{ hasHeader, hasFooter }}>
      <article className={cardClassName} aria-label={ariaLabel}>
        {children}
      </article>
    </CardContext.Provider>
  );
}

// ─── Register Valid Children for Validation ──────────────────────────────────

VALID_CARD_CHILDREN.add(CardHeader as unknown as React.FC<unknown>);
VALID_CARD_CHILDREN.add(CardBody as unknown as React.FC<unknown>);
VALID_CARD_CHILDREN.add(CardFooter as unknown as React.FC<unknown>);
VALID_CARD_CHILDREN.add(CardActions as unknown as React.FC<unknown>);

// ─── Compound Export ─────────────────────────────────────────────────────────

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
  Actions: CardActions,
});

// ─── Legacy Prop-Based API ───────────────────────────────────────────────────

/**
 * Legacy prop-based Card API preserved for backward compatibility.
 * Internally uses the compound component API.
 */
export const CardLegacy: React.FC<CardProps> = ({
  children,
  title,
  footer,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <Card className={className} aria-label={ariaLabel || title}>
      {title && (
        <Card.Header>
          <h3 className={styles['headerTitle']}>{title}</h3>
        </Card.Header>
      )}
      <Card.Body>{children}</Card.Body>
      {footer && <Card.Footer>{footer}</Card.Footer>}
    </Card>
  );
};
