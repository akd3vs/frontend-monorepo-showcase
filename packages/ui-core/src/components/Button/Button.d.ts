import React from 'react';
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
export declare const Button: React.FC<ButtonProps>;
//# sourceMappingURL=Button.d.ts.map