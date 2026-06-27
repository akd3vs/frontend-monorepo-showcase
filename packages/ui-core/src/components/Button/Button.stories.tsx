import React from 'react';

import { Button } from './index';

import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Variant stories
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
};

// Size stories
export const Small: Story = {
  args: {
    children: 'Small',
    variant: 'primary',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium',
    variant: 'primary',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    children: 'Large',
    variant: 'primary',
    size: 'lg',
  },
};

// Disabled states
export const PrimaryDisabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
};

export const SecondaryDisabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'secondary',
    size: 'md',
    disabled: true,
  },
};

export const GhostDisabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'ghost',
    size: 'md',
    disabled: true,
  },
};

// All variants × all sizes grid
export const AllVariantsAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['primary', 'secondary', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ width: '80px', fontFamily: 'sans-serif', fontSize: '12px' }}>{variant}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Button key={`${variant}-${size}`} variant={variant} size={size}>
              {size}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};
