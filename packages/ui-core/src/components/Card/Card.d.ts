import React from 'react';
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
declare function CardHeader({ children, className }: CardHeaderProps): React.ReactElement;
declare function CardBody({ children, className }: CardBodyProps): React.ReactElement;
declare function CardFooter({ children, className }: CardFooterProps): React.ReactElement;
declare function CardActions({ children, className }: CardActionsProps): React.ReactElement;
declare function CardRoot({ children, className, 'aria-label': ariaLabel, }: CardRootProps): React.ReactElement;
export declare const Card: typeof CardRoot & {
    Header: typeof CardHeader;
    Body: typeof CardBody;
    Footer: typeof CardFooter;
    Actions: typeof CardActions;
};
/**
 * Legacy prop-based Card API preserved for backward compatibility.
 * Internally uses the compound component API.
 */
export declare const CardLegacy: React.FC<CardProps>;
export {};
//# sourceMappingURL=Card.d.ts.map